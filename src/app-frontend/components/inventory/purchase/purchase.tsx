import React, {FC, useCallback, useEffect, useMemo, useState} from 'react';
import {Input} from "../../../../app-common/components/input/input";
import {Trans} from "react-i18next";
import {Controller, useFieldArray, useForm} from "react-hook-form";
import {ReactSelect} from "../../../../app-common/components/input/custom.react.select";
import {Product} from "../../../../api/model/product";
import {PurchaseOrder} from "../../../../api/model/purchase.order";
import {jsonRequest} from "../../../../api/request/request";
import {
  PRODUCT_LIST,
  PURCHASE_CREATE,
  PURCHASE_EDIT,
  PURCHASE_ORDER_LIST,
  SUPPLIER_LIST
} from "../../../../api/routing/routes/backend.app";
import {Supplier} from "../../../../api/model/supplier";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPlus, faRemove} from "@fortawesome/free-solid-svg-icons";
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
import {useLoadList} from "../../../../api/hooks/use.load.list";
import {hasErrors} from "../../../../lib/error/error";
import * as yup from 'yup';
import {ValidationMessage} from "../../../../api/model/validation";
import {yupResolver} from "@hookform/resolvers/yup";

export interface SelectedItem {
  item: Product;
  quantity: number;
  comments: string;
  cost: number;
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
  purchaseMode: yup.object().required(ValidationMessage.Required)
}).required();

export const Purchase: FC<PurchaseProps> = ({
  purchase, operation, addModal, onClose
}) => {
  const store = useSelector(getStore);
  const user = useSelector(getAuthorizedUser);

  const {register, handleSubmit, formState: {errors}, reset, control, watch, getValues, setValue} = useForm({
    resolver: yupResolver(ValidationSchema)
  });
  const {fields, append, remove} = useFieldArray({
    control: control,
    name: 'items'
  });

  const [creating, setCreating] = useState(false);
  const {
    fetchData: loadPurchaseOrders,
    list: purchaseOrders,
    loading: loadingPurchaseOrder
  } = useLoadList<PurchaseOrder>(PURCHASE_ORDER_LIST, {
    limit: 9999999
  });

  const {
    fetchData: loadSuppliers,
    list: suppliers,
    loading: loadingSuppliers
  } = useLoadList<Supplier>(SUPPLIER_LIST, {
    limit: 9999999
  });

  const {
    fetchData: loadProducts,
    list: items,
    loading: loadingProducts
  } = useLoadList<Product>(PRODUCT_LIST, {
    limit: 9999999
  });

  const [modal, setModal] = useState(false);

  const itemsList = useMemo(() => {
    return items;

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
  }, [addModal]);

  useEffect(() => {
    if (purchase) {
      reset({
        ...purchase,
        purchaseMode: {
          label: purchase.purchaseMode,
          value: purchase.purchaseMode
        },
        supplier: {
          label: purchase.supplier?.name,
          value: purchase.supplier?.["@id"]
        },
        createdAt: DateTime.fromISO(purchase.createdAt).toFormat("yyyy-MM-dd'T'HH:mm"),
        items: purchase.items.map(purchaseItem => {
          return {
            item: purchaseItem.item,
            quantity: purchaseItem.quantity,
            cost: purchaseItem.purchasePrice,
            comments: purchaseItem.comments
          }
        })
      });
    }
  }, [purchase]);

  console.log(purchase?.items)

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
      } else {
        url = PURCHASE_CREATE;
        values.purchasedBy = `/api/users/${user?.id}`;
        values.store = `/api/stores/${store?.id}`;
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

      if (values.items) {
        values.items = values.items.map((item: SelectedItem) => {
          return {
            item: item.item["@id"],
            quantity: item.quantity,
            purchasePrice: item.cost.toString(),
            comments: item.comments,
            purchaseUnit: item.item.purchaseUnit
          };
        });
      }

      const response = await jsonRequest(url, {
        method: method,
        body: JSON.stringify(values)
      });

      await response.json();

      onModalClose();

    } catch (e) {
      throw e;
    } finally {
      setCreating(false);
    }

  }

  const resetForm = () => {
    reset({
      id: null,
      stores: null,
      items: [],
      createdAt: null,
      supplier: null,
      purchaseOrder: null,
      purchaseNumber: null,
    });
  };

  useEffect(() => {
    // resetForm(); // clear form values on initialize
    // loadPurchaseOrders();
    // loadSuppliers();
    // loadProducts();
  }, []);

  const purchaseMode = watch('purchaseMode');

  const poMode = useMemo(() => {
    const value = purchaseMode;
    return !!(value && value.value === 'Purchase Order');
  }, [purchaseMode]);

  const po = watch('purchaseOrder');

  const onPurchaseOrderChange = useCallback((purchaseOrder: PurchaseOrder|null) => {
    if(purchaseOrder !== null){
      // clear items before adding new
      setValue('items', []);

      purchaseOrder.items.forEach((item: PurchaseOrderItem) => {
        append({
          item: item.item,
          quantityRequested: item.quantity,
          quantity: item.quantity,
          comments: item.comments,
          cost: item?.price || 0,
          createdAt: null
        })
      });
    }else{
      // clear items if purchase order is not selected
      setValue('items', []);
    }
  }, []);

  const addSelectedItem = (itemId: number) => {
    const item = itemsList.find(item => item.id === itemId);
    append({
      item: item,
      quantity: 1,
      comments: '',
      cost: item?.cost || 0,
      createdAt: null
    });
  }

  const itemsWatch = getValues();
  const addedItems = watch('items') ?? [];

  const totalQuantity = useMemo(() => {
    return addedItems.reduce((prev: number, item: any) => prev + parseFloat(item.quantity), 0)
  }, [itemsWatch]);

  const totalQuantityRequested = useMemo(() => {
    return addedItems.reduce((prev: number, item: any) => prev + parseFloat(item.quantityRequested), 0)
  }, [itemsWatch]);

  const totalCost = useMemo(() => {
    return addedItems.reduce((prev: number, item: any) => prev + (parseFloat(item.cost) * parseFloat(item.quantity)), 0)
  }, [itemsWatch]);

  const lineTotal = useCallback((index: number) => {
    const item: any = addedItems[index];

    return parseFloat(item.quantity) * parseFloat(item.cost);
  }, [itemsWatch, addedItems]);

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
              {errors.createdAt && (
                <div className="text-danger-500 text-sm">
                  <Trans>
                    {errors.createdAt.message}
                  </Trans>
                </div>
              )}
            </div>
            <div>
              <label htmlFor="purchaseNumber">Purchase No.</label>
              <Input {...register('purchaseNumber')} type="text" id="purchaseNumber"
                     className="w-full" hasError={hasErrors(errors.purchaseNumber)}/>
              {errors.purchaseNumber && (
                <div className="text-danger-500 text-sm">
                  <Trans>
                    {errors.purchaseNumber.message}
                  </Trans>
                </div>
              )}
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
                  />
                )}
                name="purchaseMode"
                control={control}
              />

              {errors.purchaseMode && (
                <div className="text-danger-500 text-sm">
                  <Trans>
                    {errors.purchaseMode.message}
                  </Trans>
                </div>
              )}
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
                        options={purchaseOrders?.map((item) => {
                          return {
                            label: `${item.poNumber} - ${item?.supplier?.name}`,
                            value: item['@id'],
                            items: item.items
                          }
                        })}
                        id="purchaseOrder"
                        className="rs-__container flex-grow"
                        isClearable={true}
                        isLoading={loadingPurchaseOrder}
                      />
                      <button className="btn btn-primary" type="button">
                        <FontAwesomeIcon icon={faPlus} />
                      </button>
                    </div>
                  )}
                  name="purchaseOrder"
                  control={control}
                />

                {errors.purchaseOrder && (
                  <div className="text-danger-500 text-sm">
                    <Trans>
                      {errors.purchaseOrder.message}
                    </Trans>
                  </div>
                )}
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
                          options={suppliers.map(item => {
                            return {
                              label: item.name,
                              value: item["@id"]
                            }
                          })}
                          id="supplier"
                          isClearable={true}
                          className="flex-grow rs-__container"
                          isLoading={loadingSuppliers}
                        />
                        <button className="btn btn-primary" type="button">
                          <FontAwesomeIcon icon={faPlus}/>
                        </button>
                      </div>
                    )}
                    name="supplier"
                    control={control}
                  />

                  {errors.supplier && (
                    <div className="text-danger-500 text-sm">
                      <Trans>
                        {errors.supplier.message}
                      </Trans>
                    </div>
                  )}
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
                    <button className="btn btn-primary" type="button">
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
              {errors.updateStocks && (
                <div className="text-danger-500 text-sm">
                  <Trans>
                    {errors.updateStocks.message}
                  </Trans>
                </div>
              )}
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
              {errors.updatePrice && (
                <div className="text-danger-500 text-sm">
                  <Trans>
                    {errors.updatePrice.message}
                  </Trans>
                </div>
              )}
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
              <div className={
                classNames(
                  "grid hover:bg-gray-100 gap-3 mb-3",
                  po ? 'grid-cols-7' : 'grid-cols-6'
                )
              } key={item.id}>
                <div className="inline-flex items-center">{item.item.name}</div>
                {po && (
                  <div className="inline-flex items-center">{item.quantityRequested}</div>
                )}
                <div>
                  <input
                    type="number"
                    className="form-control w-full"
                    {...register(`items.${index}.quantity`)}
                    defaultValue={item.quantity}
                  />
                </div>
                <div>
                  <input
                    type="number"
                    className="form-control w-full"
                    {...register(`items.${index}.cost`)}
                    defaultValue={item.cost}
                  />
                </div>
                <div className="inline-flex items-center">{lineTotal(index)}</div>
                <div>
                  <input
                    className="form-control w-full"
                    {...register(`items.${index}.comments`)}
                    defaultValue={item.comments}
                  />
                </div>
                <div>
                  <button className="btn btn-danger" type="button" onClick={() => remove(index)}>
                    <FontAwesomeIcon icon={faRemove}/>
                  </button>
                </div>
              </div>
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
          <Button type="submit" disabled={creating} className="btn btn-primary">Save</Button>
        </form>
      </Modal>
    </>
  );
}
