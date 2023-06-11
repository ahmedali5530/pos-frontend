import React, {FC, useCallback, useEffect, useMemo, useState} from 'react';
import {Input} from "../../../../app-common/components/input/input";
import {Trans} from "react-i18next";
import {Controller, useFieldArray, useForm, UseFormRegister} from "react-hook-form";
import {ReactSelect} from "../../../../app-common/components/input/custom.react.select";
import {Product} from "../../../../api/model/product";
import {PurchaseOrder} from "../../../../api/model/purchase.order";
import {jsonRequest} from "../../../../api/request/request";
import {
  PAYMENT_TYPE_LIST,
  PRODUCT_GET,
  PRODUCT_KEYWORDS,
  PURCHASE_CREATE,
  PURCHASE_EDIT,
  PURCHASE_ORDER_LIST,
  SUPPLIER_LIST
} from "../../../../api/routing/routes/backend.app";
import {Supplier} from "../../../../api/model/supplier";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowDown, faArrowRight, faPlus, faRemove} from "@fortawesome/free-solid-svg-icons";
import {Button} from '../../../../app-common/components/input/button';
import {Switch} from "../../../../app-common/components/input/switch";
import {getStore} from "../../../../duck/store/store.selector";
import {useSelector} from "react-redux";
import {getAuthorizedUser} from "../../../../duck/auth/auth.selector";
import {Purchase as PurchaseModel} from "../../../../api/model/purchase";
import {DateTime} from "luxon";
import {Modal} from "../../../../app-common/components/modal/modal";
import {PurchaseOrderItem} from "../../../../api/model/purchase.order.item";
import classNames from "classnames";
import {getErrorClass, getErrors, hasErrors} from "../../../../lib/error/error";
import * as yup from 'yup';
import {ConstraintViolation, ValidationMessage, ValidationResult} from "../../../../api/model/validation";
import {yupResolver} from "@hookform/resolvers/yup";
import {PaymentType} from "../../../../api/model/payment.type";
import {ProductVariant} from "../../../../api/model/product.variant";
import {ConfirmAlert} from "../../../../app-common/components/confirm/confirm.alert";
import useApi from "../../../../api/hooks/use.api";
import {HydraCollection} from "../../../../api/model/hydra";
import {CreateSupplier} from "../supplier/create.supplier";
import {CreateItem} from "../../settings/items/items.create";
import {HttpException, UnprocessableEntityException} from "../../../../lib/http/exception/http.exception";
import {notify} from "../../../../app-common/components/confirm/notification";
import {CreatePurchaseOrder} from "../purchase-orders/create.purchase.order";

export interface SelectedItem {
  item: Product;
  quantity: number;
  comments: string;
  cost: number;
  variants: any[];
}

interface PurchaseProps {
  purchase?: PurchaseModel;
  operation?: string;
  addModal: boolean;
  onClose?: () => void;
}

const ValidationSchema = yup.object({
  createdAt: yup.string().required(ValidationMessage.Required),
  purchaseNumber: yup.string().required(ValidationMessage.Required),
  items: yup.array().min(1, 'Please add some items'),
  purchaseMode: yup.object().required(ValidationMessage.Required),
  paymentType: yup.object().required(ValidationMessage.Required)
}).required();

export const CreatePurchase: FC<PurchaseProps> = ({
  purchase, operation, addModal, onClose
}) => {
  const store = useSelector(getStore);
  const user = useSelector(getAuthorizedUser);

  const {register, handleSubmit, formState: {errors}, reset, control, watch, getValues, setValue, setError} = useForm({
    resolver: yupResolver(ValidationSchema)
  });
  const {fields, append, remove, update} = useFieldArray({
    control: control,
    name: 'items'
  });

  const [creating, setCreating] = useState(false);
  const {
    fetchData: loadPurchaseOrders,
    data: purchaseOrders,
    isFetching: loadingPurchaseOrder
  } = useApi<HydraCollection<PurchaseOrder>>('purchaseOrders', PURCHASE_ORDER_LIST, {
    isUsed: null
  }, '', 'asc', 1, 9999999, {}, {enabled: false});
  const [purchaseOrderModal, setPurchaseOrderModal] = useState(false);

  const {
    fetchData: loadSuppliers,
    data: suppliers,
    isFetching: loadingSuppliers
  } = useApi<HydraCollection<Supplier>>('suppliers', SUPPLIER_LIST, {}, '', 'asc',
    1, 9999999, {}, {enabled: false}
);
  const [supplierModal, setSupplierModal] = useState(false);

  const {
    data: items,
    isFetching: loadingProducts,
    fetchData: loadProducts
  } = useApi<{ list: Product[] }>(
    'productKeywords', PRODUCT_KEYWORDS, {}, '', 'asc', 1, 9999999,
    {}, {enabled: false}
  );
  const [itemsModal, setItemsModal] = useState(false);

  const {
    fetchData: loadPaymentTypes,
    data: paymentTypes,
    isFetching: loadingPaymentTypes
  } = useApi<HydraCollection<PaymentType>>('paymentTypes', PAYMENT_TYPE_LIST, {}, '',
    'asc', 1, 9999999,
    {}, {enabled: false}
  );

  const [modal, setModal] = useState(false);

  const itemsList = useMemo(() => {
    return items?.list || [];

    // disable supplier filtering for now

    /* if (watch('supplier')) {
       return items.filter(item => {
         const supplierIds = item.suppliers.map(supplier => supplier.id);
         return supplierIds.includes(watch('supplier').value);
       });
     }

     return items;*/
  }, [items, watch('supplier')]);

  useEffect(() => {
    setModal(addModal);
    // load on modal open
    if(addModal) {
      loadPurchaseOrders();
      loadSuppliers();
      loadProducts();
      loadPaymentTypes();
    }
  }, [addModal]);

  useEffect(() => {
    if (purchase) {
      reset({
        ...purchase,
        purchaseMode: {
          label: purchase.purchaseMode,
          value: purchase.purchaseMode
        },
        purchaseOrder: {
          label: purchase.purchaseOrder?.poNumber,
          value: purchase.purchaseOrder?.["@id"]
        },
        paymentType: {
          label: purchase?.paymentType?.name,
          value: purchase?.paymentType?.['@id']
        },
        supplier: {
          label: purchase.supplier?.name,
          value: purchase.supplier?.["@id"]
        },
        createdAt: DateTime.fromISO(purchase.createdAt).toFormat("yyyy-MM-dd'T'HH:mm"),
        items: purchase.items.map(purchaseItem => ({
            item: purchaseItem.item,
            quantity: purchaseItem.quantity,
            cost: purchaseItem.purchasePrice,
            comments: purchaseItem.comments,
            variants: purchaseItem.variants.map(variant => ({
              attributeName: variant.variant.attributeName,
              attributeValue: variant.variant.attributeValue,
              id: variant['@id'],
              cost: variant.purchasePrice,
              quantity: variant.quantity
            }))
          }
        ))
      });
    }
  }, [purchase]);

  const savePurchase = async (values: any) => {
    setCreating(true);
    try {
      let url, method = 'POST';

      if (values.id) {
        url = PURCHASE_EDIT.replace(':id', values.id);
        method = 'PUT';
        if (values.store) {
          values.store = values.store['@id'];
        }
        if (values.purchasedBy) {
          values.purchasedBy = values.purchasedBy['@id'];
        }

        if (values.items) {
          values.items = values.items.map((item: SelectedItem) => {
            return {
              item: item.item["@id"],
              quantity: item.quantity,
              purchasePrice: item.cost.toString(),
              comments: item.comments,
              purchaseUnit: item.item.purchaseUnit,
              variants: item.variants.map(variant => ({
                variant: variant['@id'],
                quantity: variant.quantity,
                purchasePrice: variant.cost.toString(),
                id: variant.id
              }))
            };
          });
        }
      } else {
        url = PURCHASE_CREATE;
        values.purchasedBy = `/api/users/${user?.id}`;
        values.store = `/api/stores/${store?.id}`;

        if (values.items) {
          values.items = values.items.map((item: SelectedItem) => {
            return {
              item: item.item["@id"],
              quantity: item.quantity,
              purchasePrice: item.cost.toString(),
              comments: item.comments,
              purchaseUnit: item.item.purchaseUnit,
              variants: item.variants.map(variant => ({
                variant: variant['@id'],
                quantity: variant.quantity,
                purchasePrice: variant.cost.toString(),
              }))
            };
          });
        }
      }

      if (values.supplier) {
        values.supplier = values.supplier.value;
      }

      if (values.purchaseOrder) {
        values.purchaseOrder = values.purchaseOrder.value;
      }

      if (values.purchaseMode) {
        values.purchaseMode = values.purchaseMode.value;
      }

      if (values.paymentType) {
        values.paymentType = values.paymentType.value;
      }

      const response = await jsonRequest(url, {
        method: method,
        body: JSON.stringify(values)
      });

      await response.json();

      onModalClose();

    } catch (exception) {
      if (exception instanceof HttpException) {
        if (exception.message) {
          notify({
            type: 'error',
            description: exception.message
          });
        }
      }

      if (exception instanceof UnprocessableEntityException) {
        const e: ValidationResult = await exception.response.json();
        e.violations.forEach((item: ConstraintViolation) => {
          setError(item.propertyPath, {
            message: item.message,
            type: 'server'
          });
        });

        if (e.errorMessage) {
          notify({
            type: 'error',
            description: e.errorMessage
          });
        }

        return false;
      }

      throw exception;
    } finally {
      setCreating(false);
    }
  }

  const resetForm = () => {
    reset({
      id: null,
      store: null,
      items: [],
      createdAt: null,
      supplier: null,
      purchaseOrder: null,
      purchaseNumber: null,
      paymentType: null,
      purchaseMode: {
        label: 'Items list',
        value: 'Items list'
      },
    });
  };

  const purchaseMode = watch('purchaseMode');

  const poMode = useMemo(() => {
    const value = purchaseMode;
    return !!(value && value.value === 'Purchase order');
  }, [purchaseMode]);

  const po = watch('purchaseOrder');

  const onPurchaseOrderChange = useCallback((purchaseOrder: PurchaseOrder | null) => {
    if (purchaseOrder !== null) {
      // clear items before adding new
      setValue('items', []);

      purchaseOrder.items.forEach((item: PurchaseOrderItem) => {
        append({
          item: item.item,
          quantityRequested: item.quantity,
          quantity: item.quantity,
          comments: item.comments,
          cost: item?.price || 0,
          createdAt: null,
          variants: []
        })
      });
    } else {
      // clear items if purchase order is not selected
      setValue('items', []);
    }
  }, []);

  const addSelectedItem = (itemId: number) => {
    jsonRequest(PRODUCT_GET.replace(':id', itemId.toString()))
      .then(response => response.json())
      .then(json => {
        const item = json;

        append({
          item: json,
          quantity: 1,
          comments: '',
          cost: item?.cost || 0,
          createdAt: null,
          variants: item?.variants
        });
      })
  }

  const itemsWatch = getValues();
  const addedItems = watch('items') ?? [];

  const totalQuantity = useMemo(() => {
    const itemsQty = addedItems.reduce((prev: number, item: any) => prev + parseFloat(item.quantity), 0);
    const variantQty = addedItems.reduce((p: number, i: any) => (
      i.variants.reduce((prev: number, variant: any) => prev + Number(variant.quantity), 0)
    ), 0);

    return itemsQty + variantQty;
  }, [itemsWatch]);

  const totalQuantityRequested = useMemo(() => {
    return addedItems.reduce((prev: number, item: any) => prev + parseFloat(item.quantityRequested), 0)
  }, [itemsWatch]);

  const totalCost = useMemo(() => {
    const itemsCost = addedItems.reduce((prev: number, item: any) => prev + (parseFloat(item.cost) * parseFloat(item.quantity)), 0);
    const variantsCost = addedItems.reduce((p: number, i: any) => (
      i.variants.reduce((prev: number, variant: any) => prev + (Number(variant.cost) * Number(variant.quantity)), 0)
    ), 0);

    return itemsCost + variantsCost;
  }, [itemsWatch]);

  const lineTotal = useCallback((index: number) => {
    const item: any = addedItems[index];

    return parseFloat(item.quantity) * parseFloat(item.cost);
  }, [itemsWatch, addedItems]);

  const variantTotal = useCallback((index: number, variantIndex: number) => {
    const item: any = addedItems[index]['variants'][variantIndex];

    return parseFloat(item.quantity) * parseFloat(item.cost);
  }, [itemsWatch, addedItems]);

  const removeVariant = (index: number, variantIndex: number) => {
    const item = addedItems[index];
    item.variants.splice(variantIndex, 1);

    update(index, item);
  }

  const onModalClose = () => {
    setModal(false);
    onClose && onClose();
    resetForm();
  }

  return (
    <>
      <Modal
        open={modal}
        size="full" title={operation === 'update' ? 'Update purchase' : 'Create new purchase'}
        onClose={onModalClose}
      >
        <form onSubmit={handleSubmit(savePurchase)}>
          <div className="grid lg:grid-cols-4 gap-4 mb-3 md:grid-cols-3 sm:grid-cols-1">
            <div>
              <label htmlFor="createdAt">Date</label>
              <Input {...register('createdAt')} type="datetime-local" id="createdAt"
                     className="w-full" hasError={hasErrors(errors.createdAt)}/>
              {getErrors(errors.createdAt)}
            </div>
            <div>
              <label htmlFor="purchaseNumber">Purchase No.</label>
              <Input {...register('purchaseNumber')} type="text" id="purchaseNumber"
                     className="w-full" hasError={hasErrors(errors.purchaseNumber)}/>
              {getErrors(errors.purchaseNumber)}
            </div>
            <div>
              <label htmlFor="purchase-mode">Purchase using</label>

              <Controller
                render={(props) => (
                  <ReactSelect
                    onChange={(value) => {
                      props.field.onChange(value);
                      setValue('items', []);
                    }}
                    value={props.field.value}
                    options={[
                      {label: 'Items list', value: 'Items list'},
                      {label: 'Purchase order', value: 'Purchase order'},
                    ]}
                    defaultValue={{label: 'Items list', value: 'Items list'}}
                    className={getErrorClass(errors.purchaseMode)}
                  />
                )}
                name="purchaseMode"
                control={control}
              />

              {getErrors(errors.purchaseMode)}
            </div>
            {poMode ? (
              <div>
                <label htmlFor="purchaseOrder">Select a Purchase Order</label>
                <Controller
                  render={(props) => (
                    <div className="input-group">
                      <ReactSelect
                        onChange={(value) => {
                          props.field.onChange(value);
                          onPurchaseOrderChange(value);
                        }}
                        value={props.field.value}
                        options={purchaseOrders?.['hydra:member']?.filter(item => !item.isUsed).map((item) => {
                          return {
                            label: `${item.poNumber} - ${item?.supplier?.name}`,
                            value: item['@id'],
                            items: item.items
                          }
                        })}
                        id="purchaseOrder"
                        className={
                          classNames(
                            "rs-__container flex-grow",
                            getErrorClass(errors.purchaseOrder)
                          )
                        }
                        isClearable={true}
                        isLoading={loadingPurchaseOrder}
                      />
                      <button className="btn btn-primary" type="button" onClick={() => setPurchaseOrderModal(true)}>
                        <FontAwesomeIcon icon={faPlus}/>
                      </button>
                    </div>
                  )}
                  name="purchaseOrder"
                  control={control}
                />

                {getErrors(errors.purchaseOrder)}
              </div>
            ) : (
              <>
                <div>
                  <label htmlFor="supplier">Select a supplier</label>
                  <Controller
                    render={(props) => (
                      <div className="input-group">
                        <ReactSelect
                          onChange={props.field.onChange}
                          value={props.field.value}
                          options={suppliers?.['hydra:member']?.map(item => {
                            return {
                              label: item.name,
                              value: item["@id"]
                            }
                          })}
                          id="supplier"
                          isClearable={true}
                          className={
                            classNames(
                              "flex-grow rs-__container",
                              getErrorClass(errors.supplier)
                            )
                          }
                          isLoading={loadingSuppliers}
                        />
                        <button className="btn btn-primary" type="button" onClick={() => setSupplierModal(true)}>
                          <FontAwesomeIcon icon={faPlus}/>
                        </button>
                      </div>
                    )}
                    name="supplier"
                    control={control}
                  />

                  {getErrors(errors.supplier)}
                </div>
                <div>
                  <label htmlFor="items">Select items</label>
                  <div className="input-group">
                    <ReactSelect
                      onChange={(value) => {
                        if (value) {
                          addSelectedItem(value.value);
                        }
                      }}
                      options={itemsList.map(item => {
                        return {
                          label: item.name,
                          value: item.id
                        }
                      })}
                      id="items"
                      closeMenuOnSelect={false}
                      className="rs-__container flex-grow"
                      isLoading={loadingProducts}
                    />
                    <button className="btn btn-primary" type="button" onClick={() => setItemsModal(true)}>
                      <FontAwesomeIcon icon={faPlus}/>
                    </button>
                  </div>
                </div>
              </>
            )}
            <div className="col-span-full"></div>
            <div>
              <Controller
                control={control}
                name="updateStocks"
                render={(props) => (
                  <Switch
                    checked={props.field.value}
                    onChange={props.field.onChange}
                    defaultChecked={true}
                  >
                    Update stock quantities?
                  </Switch>
                )}
                defaultValue={true}
              />
              {getErrors(errors.updateStocks)}
            </div>
            <div>
              <Controller
                control={control}
                name="updatePrice"
                render={(props) => (
                  <Switch
                    checked={props.field.value}
                    onChange={props.field.onChange}
                    defaultChecked={true}
                  >
                    Update stock prices?
                  </Switch>
                )}
                defaultValue={true}
              />
              {getErrors(errors.updatePrice)}
            </div>
          </div>

          <div className="mb-3">
            {errors.items && (
              <div className="alert alert-danger mb-3">
                <Trans>
                  {errors.items.message}
                </Trans>
              </div>
            )}
            <div className={
              classNames(
                "grid gap-3 mb-3",
                po ? 'grid-cols-7' : 'grid-cols-6'
              )
            }>
              <div className="font-bold">Item</div>
              {po && <div className="font-bold">Quantity requested</div>}
              <div className="font-bold">Quantity</div>
              <div className="font-bold">Unit Cost</div>
              <div className="font-bold">Total Cost</div>
              <div className="font-bold">Comments</div>
              <div className="font-bold">Remove?</div>
            </div>
            {fields.map((item: any, index) => (
              <ItemRow
                item={item}
                register={register}
                index={index} po={po}
                remove={remove}
                lineTotal={lineTotal}
                variantTotal={variantTotal}
                removeVariant={removeVariant}
              />
            ))}
            <div className={
              classNames(
                "grid gap-3",
                po ? 'grid-cols-7' : 'grid-cols-6'
              )
            }>
              <div className="p-3 bg-gray-200 font-bold">{fields.length}</div>
              {po && (
                <div className="p-3 bg-gray-200 font-bold">{totalQuantityRequested}</div>
              )}
              <div className="p-3 bg-gray-200 font-bold">{totalQuantity}</div>
              <div></div>
              <div className="p-3 bg-gray-200 font-bold">{totalCost}</div>
            </div>
          </div>

          <div className="mb-3">
            <label htmlFor="paymentType">Select payment type</label>
            <div className="w-96">
              <Controller
                render={(props) => (
                  <ReactSelect
                    onChange={props.field.onChange}
                    value={props.field.value}
                    options={paymentTypes?.['hydra:member']?.map(item => {
                      return {
                        label: item.name,
                        value: item['@id']
                      }
                    })}
                    id="paymentType"
                    isLoading={loadingPaymentTypes}
                    className={getErrorClass(errors.paymentType)}
                  />
                )}
                name="paymentType"
                control={control}
              />
              {getErrors(errors.paymentType)}
            </div>
          </div>

          <Button type="submit" disabled={creating} className="btn btn-primary">Save</Button>
        </form>
      </Modal>

      <CreateSupplier
        operation={'create'}
        showModal={supplierModal}
        onClose={() => {
          loadSuppliers();
          setSupplierModal(false);
        }}
      />

      <CreateItem
        addModal={itemsModal}
        operation="create"
        onClose={() => {
          loadProducts();
          setItemsModal(false);
        }}
      />

      <CreatePurchaseOrder
        operation={'create'}
        onClose={() => {
          loadPurchaseOrders();
          setPurchaseOrderModal(false);
        }}
        showModal={purchaseOrderModal}
      />
    </>
  );
}


interface ItemRowProps {
  item: any;
  po?: PurchaseOrder;
  register: UseFormRegister<any>;
  index: number;
  remove: (index: number) => void;
  lineTotal: (index: number) => number;
  variantTotal: (index: number, variantIndex: number) => number;
  removeVariant: (index: number, variantIndex: number) => void;
}

const ItemRow: FC<ItemRowProps> = ({
  item, po, register, index, remove, lineTotal, variantTotal, removeVariant
}) => {
  const [open, setOpen] = useState(false);

  return (
    <React.Fragment key={item.id}>
      <div className={
        classNames(
          "grid hover:bg-gray-100 gap-3 mb-3",
          po ? 'grid-cols-7' : 'grid-cols-6'
        )
      }>
        <div className="inline-flex items-center">
          {item.variants.length > 0 && (
            <button
              className="btn btn-flat sm mr-2 w-[30px]"
              type="button" onClick={() => setOpen(!open)}
              title="Open variants"
            >
              {open ? <FontAwesomeIcon icon={faArrowDown}/> : <FontAwesomeIcon icon={faArrowRight}/>}
            </button>
          )}
          {item.item.name}
        </div>
        {po && (
          <div className="inline-flex items-center">{item.quantityRequested}</div>
        )}
        <div>
          <Input
            type="number"
            className="form-control w-full"
            {...register(`items.${index}.quantity`)}
            defaultValue={item.quantity}
            selectable={true}
          />
        </div>
        <div>
          <Input
            type="number"
            className="form-control w-full"
            {...register(`items.${index}.cost`)}
            defaultValue={item.cost}
            selectable={true}
          />
        </div>
        <div className="inline-flex items-center">{lineTotal(index)}</div>
        <div>
          <Input
            className="form-control w-full"
            {...register(`items.${index}.comments`)}
            defaultValue={item.comments}
            selectable={true}
          />
        </div>
        <div>
          <ConfirmAlert
            onConfirm={() => remove(index)}
            title={`Remove ${item.item.name}?`}
            confirmText="Remove"
          >
            <button className="btn btn-danger" type="button">
              <FontAwesomeIcon icon={faRemove}/>
            </button>
          </ConfirmAlert>
        </div>
      </div>
      {open && (
        <div className="border rounded-2xl border-gray-300 bg-gray-50 p-3 mb-3">
          {item.variants.length > 0 && (
            <div className="grid grid-cols-5 gap-3 px-5">
              <div className="font-bold">Variant</div>
              <div className="font-bold">Variant cost</div>
              <div className="font-bold">Variant quantity</div>
              <div className="font-bold">Total cost</div>
              <div className="font-bold">Remove variant?</div>
            </div>
          )}
          {item.variants.map((variant: ProductVariant, variantIndex: number) => (
            <div className="grid grid-cols-5 gap-3 mb-1 px-5 hover:bg-gray-200">
              <div className="inline-flex items-center">{variant.attributeValue}</div>
              <div>
                <input type="hidden" {...register(`items.${index}.variants.${variantIndex}.id`)}
                       value={variant["@id"]}/>
                <Input
                  type="number"
                  className="form-control w-full"
                  {...register(`items.${index}.variants.${variantIndex}.cost`, {valueAsNumber: true})}
                  defaultValue={variant.price || 0}
                  selectable={true}
                />
              </div>
              <div>
                <Input
                  type="number"
                  className="form-control w-full"
                  {...register(`items.${index}.variants.${variantIndex}.quantity`)}
                  defaultValue={1}
                  selectable={true}
                />
              </div>
              <div className="inline-flex items-center">
                {variantTotal(index, variantIndex)}
              </div>
              <div className="inline-flex items-center">
                <ConfirmAlert
                  onConfirm={() => removeVariant(index, variantIndex)}
                  title={`Remove ${item.item.name} > ${variant.attributeName}?`}
                  confirmText="Remove"
                >
                  <button className="btn btn-danger" type="button">
                    <FontAwesomeIcon icon={faRemove}/>
                  </button>
                </ConfirmAlert>
              </div>
            </div>
          ))}
        </div>
      )}
    </React.Fragment>
  );
}
