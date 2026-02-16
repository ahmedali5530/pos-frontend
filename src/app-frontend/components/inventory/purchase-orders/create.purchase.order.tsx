import {Input} from "../../../../app-common/components/input/input";
import {Trans} from "react-i18next";
import {Controller, useFieldArray, useForm, UseFormRegister} from "react-hook-form";
import {ReactSelect} from "../../../../app-common/components/input/custom.react.select";
import {Button} from "../../../../app-common/components/input/button";
import React, {FC, FunctionComponent, useCallback, useEffect, useMemo, useState} from "react";
import {Supplier} from "../../../../api/model/supplier";
import {HttpException, UnprocessableEntityException} from "../../../../lib/http/exception/http.exception";
import {ConstraintViolation, ValidationResult} from "../../../../lib/validator/validation.result";
import {ITEM_FETCHES, Product} from "../../../../api/model/product";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowDown, faArrowRight, faPlus, faRemove} from "@fortawesome/free-solid-svg-icons";
import {DateTime} from "luxon";
import {Modal} from "../../../../app-common/components/modal/modal";
import classNames from "classnames";
import {getErrorClass, getErrors, hasErrors} from "../../../../lib/error/error";
import {PurchaseOrder} from "../../../../api/model/purchase.order";
import {CreateSupplier} from "../supplier/create.supplier";
import * as yup from 'yup';
import {yupResolver} from "@hookform/resolvers/yup";
import {ValidationMessage} from "../../../../api/model/validation";
import {notify} from "../../../../app-common/components/confirm/notification";
import _ from "lodash";
import {ConfirmAlert} from "../../../../app-common/components/confirm/confirm.alert";
import {ProductVariant} from "../../../../api/model/product.variant";
import {withCurrency} from "../../../../lib/currency/currency";
import {useAtom} from "jotai";
import {appState} from "../../../../store/jotai";
import useApi, {SettingsData} from "../../../../api/db/use.api";
import {Tables} from "../../../../api/db/tables";
import {useDB} from "../../../../api/db/db";
import {toRecordId} from "../../../../api/model/common";

export interface CreatePurchaseOrderProps {
  operation: string;
  onClose: () => void;
  showModal: boolean;
  purchaseOrder?: PurchaseOrder;
}

const ValidationSchema = yup.object({
  created_at: yup.string().required(ValidationMessage.Required),
  po_number: yup.string().required(ValidationMessage.Required),
  supplier: yup.object().required(ValidationMessage.Required),
  items: yup.array(yup.object({
    quantity: yup.number().typeError(ValidationMessage.Number).positive(ValidationMessage.Positive).required(ValidationMessage.Required),
    comments: yup.string(),
    variants: yup.array(yup.object({
      quantity: yup.number().typeError(ValidationMessage.Number).positive(ValidationMessage.Positive).required(ValidationMessage.Required),
      cost: yup.number().typeError(ValidationMessage.Number).required(ValidationMessage.Required),
    }))
  })).typeError('Please add some items').required(ValidationMessage.Required).min(1, 'Please add some items')
});

export const CreatePurchaseOrder: FunctionComponent<CreatePurchaseOrderProps> = ({
  operation, showModal, onClose, purchaseOrder
}) => {
  const [{store}] = useAtom(appState)
  const db = useDB();

  const {register, handleSubmit, setError, formState: {errors}, reset, control, watch, getValues} = useForm({
    resolver: yupResolver(ValidationSchema)
  });
  const {fields, append, remove, update} = useFieldArray({
    control: control,
    name: 'items'
  });

  const [creating, setCreating] = useState(false);
  const {
    fetchData: loadSuppliers,
    data: suppliers,
    isFetching: loadingSuppliers
  } = useApi<SettingsData<Supplier>>(Tables.supplier, [`stores ?= ${store?.id}`], ['name ASC'], 0, undefined, [], {
    enabled: false
  });

  const {
    data: items,
    isFetching: loadingProducts,
    fetchData: loadProducts,
  } = useApi<SettingsData<Product>>(Tables.product, [`array::any(stores, |$s| $s.product_store.store = $store)`], ['name ASC'], 0, undefined, ITEM_FETCHES, {
    enabled: false
  }, ['*'], {
    store: store?.id
  });

  const [modal, setModal] = useState(false);
  const [supplierModal, setSupplierModal] = useState(false);

  useEffect(() => {
    setModal(showModal);
    if (showModal) {
      setTimeout(() => {
        loadSuppliers();
        loadProducts();
      }, 300);
    }
  }, [showModal]);

  useEffect(() => {
    if (purchaseOrder) {
      reset({
        ...purchaseOrder,
        supplier: {
          label: purchaseOrder?.supplier?.name,
          value: purchaseOrder?.supplier?.["id"]
        },
        created_at: DateTime.fromJSDate(purchaseOrder.created_at).toFormat("yyyy-MM-dd'T'HH:mm"),
        items: purchaseOrder.items.map(purchaseItem => ({
          id: purchaseItem.id,
          item: purchaseItem.item,
          quantity: purchaseItem.quantity,
          cost: purchaseItem.price,
          comments: purchaseItem.comments,
          variants: purchaseItem.variants.map(variant => ({
            attribute_name: variant.variant.attribute_name,
            attribute_value: variant.variant.attribute_value,
            id: variant['id'],
            cost: variant.purchase_price,
            quantity: variant.quantity,
            variant: {
              id: variant.variant.id
            }
          }))
        }))
      });
    }
  }, [purchaseOrder]);


  const createPurchaseOrder = async (values: any) => {

    setCreating(true);
    try {
      let url: string, method: string = 'POST';
      const items = [];
      if (values.items) {
        for (const item of values.items) {
          const variants = [];
          if (item.variants) {
            for (const variant of item.variants) {
              if (variant?.id) {
                await db.merge(toRecordId(variant.id), {
                  comments: variant.comments,
                  purchase_price: Number(variant.cost),
                  purchase_unit: item.item.purchase_unit,
                  quantity: Number(variant.quantity),
                  variant: toRecordId(variant.variant.id)
                });

                variants.push(toRecordId(variant.id));
              } else {
                const [v] = await db.insert(Tables.purchase_order_item_variant, {
                  comments: variant.comments,
                  purchase_price: Number(variant.cost),
                  purchase_unit: item.item.purchase_unit,
                  quantity: Number(variant.quantity),
                  variant: toRecordId(variant.id)
                });

                variants.push(v.id);
              }
            }
          }

          if (item?.id) {
            // merge things
            await db.merge(toRecordId(item.id), {
              comments: item.comments,
              item: toRecordId(item.item.id),
              price: Number(item.cost ?? 0),
              quantity: Number(item.quantity),
              unit: item.item.purchase_unit,
              variants: variants
            });

            items.push(toRecordId(item.id));
          } else {
            // create item
            const [i] = await db.insert(Tables.purchase_order_item, {
              comments: item.comments,
              item: toRecordId(item.item.id),
              price: Number(item.cost ?? 0),
              quantity: Number(item.quantity),
              unit: item.item.purchase_unit,
              variants: variants
            });

            items.push(i.id);
          }
        }
      }

      if (purchaseOrder?.id) {
        await db.merge(toRecordId(purchaseOrder.id), {
          created_at: DateTime.fromFormat(values.created_at, "yyyy-MM-dd'T'hh:mm").toJSDate(),
          is_used: null,
          items: items,
          po_number: values.po_number,
          store: toRecordId(store?.id),
          supplier: toRecordId(values.supplier.value)
        });

        for (const i of items) {
          await db.merge(i, {
            purchase_order: toRecordId(purchaseOrder.id)
          });
        }
      } else {
        const [po] = await db.insert(Tables.purchase_order, {
          created_at: DateTime.fromFormat(values.created_at, "yyyy-MM-dd'T'hh:mm").toJSDate(),
          is_used: null,
          items: items,
          po_number: values.po_number,
          store: toRecordId(store?.id),
          supplier: toRecordId(values.supplier.value)
        });

        for (const i of items) {
          await db.merge(i, {
            purchase_order: po.id
          });
        }
      }

      onModalClose();
    } catch (exception: any) {
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
  };

  const resetForm = () => {
    reset({
      id: null,
      store: null,
      created_at: null,
      po_number: null,
      items: [],
      supplier: null
    });
  };

  const addSelectedItem = (itemId: string) => {
    const item = items?.data?.find(a => a.id.toString() === itemId);
    append({
      item: item,
      quantity: 1,
      comments: '',
      cost: item?.cost || 0,
      created_at: null,
      variants: item?.variants
    });
  }

  const itemsWatch = getValues();
  const addedItems = watch('items') ?? [];

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

  const onModalClose = () => {
    setModal(false);
    onClose && onClose();
    resetForm();
  }

  const variantTotal = useCallback((index: number, variantIndex: number) => {
    const item: any = addedItems[index]['variants'][variantIndex];

    return parseFloat(item.quantity) * parseFloat(item.cost);
  }, [itemsWatch, addedItems]);

  const removeVariant = (index: number, variantIndex: number) => {
    const item = addedItems[index];
    item.variants.splice(variantIndex, 1);

    update(index, item);
  }

  const totalQuantity = useMemo(() => {
    const itemsQty = addedItems.reduce((prev: number, item: any) => prev + parseFloat(item.quantity), 0);
    const variantQty = addedItems.reduce((p: number, i: any) => (
      i.variants.reduce((prev: number, variant: any) => prev + Number(variant.quantity), 0)
    ), 0);

    return itemsQty + variantQty;
  }, [itemsWatch]);

  return (
    <>
      <Modal
        open={modal}
        size="full" title={operation === 'create' ? "Create purchase order" : 'Update purchase order'}
        onClose={onModalClose}
      >
        <form onSubmit={handleSubmit(createPurchaseOrder)} className="mb-5">
          <h3 className="text-xl mb-3">Store: {store?.name}</h3>
          <div className="grid lg:grid-cols-4 gap-4 mb-3 md:grid-cols-3 sm:grid-cols-1">
            <div>
              <label htmlFor="created_at">Date</label>
              <Input {...register('created_at')} type="datetime-local" id="created_at" className={
                classNames(
                  "w-full"
                )
              } hasError={hasErrors(errors.created_at)}/>
              {getErrors(errors.created_at)}
            </div>
            <div>
              <label htmlFor="po_number">PO Number</label>
              <Input {...register('po_number')} id="po_number" className="w-full"
                     hasError={hasErrors(errors.po_number)}/>
              {getErrors(errors.po_number)}
            </div>
            <div>
              <label htmlFor="supplier">Select a supplier</label>
              <Controller
                render={(props) => (
                  <div className="input-group">
                    <ReactSelect
                      onChange={props.field.onChange}
                      value={props.field.value}
                      options={suppliers?.data?.map(item => {
                        return {
                          label: item.name,
                          value: item['id']
                        }
                      })}
                      id="supplier"
                      isClearable={true}
                      className={
                        classNames(
                          "rs-__container flex-grow",
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
                rules={{required: true}}
              />

              {getErrors(errors.supplier)}
            </div>
            <div>
              <label htmlFor="items">Items</label>
              <ReactSelect
                onChange={(value) => {
                  if (value) {
                    addSelectedItem(value.value);
                  }
                }}
                options={items?.data?.map(item => {
                  return {
                    label: item.name,
                    value: item.id.toString()
                  }
                })}
                id="items"
                closeMenuOnSelect={false}
                isLoading={loadingProducts}
              />
            </div>
          </div>
          <div className="my-3">
            {_.get(errors.items, 'message') && (
              <div className="alert alert-danger mb-3">
                <Trans>
                  {_.get(errors.items, 'message')}
                </Trans>
              </div>
            )}

            <div className="grid grid-cols-6 mb-1 gap-3">
              <div className="font-bold">Item</div>
              <div className="font-bold">Quantity</div>
              <div className="font-bold">Unit Cost</div>
              <div className="font-bold">Total Cost</div>
              <div className="font-bold">Comments</div>
              <div className="font-bold">Remove?</div>
            </div>
            {fields.map((item: any, index) => (
              <ItemRow item={item} register={register} index={index} remove={remove} lineTotal={lineTotal}
                       variantTotal={variantTotal} removeVariant={removeVariant} errors={errors}/>
            ))}
            <div className="grid grid-cols-6 mb-1 gap-3">
              <div className="p-3 bg-gray-200 font-bold">{fields.length} items</div>
              <div
                className="p-3 bg-gray-200 font-bold">{totalQuantity}</div>
              <div></div>
              <div className="p-3 bg-gray-200 font-bold">{withCurrency(totalCost)}</div>
              <div></div>
              <div></div>
            </div>
          </div>
          <div>
            <Button variant="primary" type="submit" disabled={creating}>
              {creating ? 'Saving...' : (operation === 'create' ? 'Add purchase order' : 'Update purchase order')}
            </Button>
          </div>
        </form>
      </Modal>

      {supplierModal && (
        <CreateSupplier
          operation={'create'}
          showModal={supplierModal}
          onClose={() => {
            setSupplierModal(false);
            loadSuppliers();
          }}/>
      )}

    </>
  );
}

interface ItemRowProps {
  item: any;
  register: UseFormRegister<any>;
  index: number;
  remove: (index: number) => void;
  lineTotal: (index: number) => number;
  variantTotal: (index: number, variantIndex: number) => number;
  removeVariant: (index: number, variantIndex: number) => void;
  errors: any;
}

const ItemRow: FC<ItemRowProps> = ({
  item, register, index, remove, lineTotal, variantTotal, removeVariant, errors
}) => {
  const [open, setOpen] = useState(false);

  return (
    <React.Fragment key={item.id}>
      <div key={item.id} className="grid grid-cols-6 hover:bg-gray-100 gap-3 mb-3">
        <div>
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
        <div>
          <Input
            type="number"
            className="form-control w-full"
            {...register(`items.${index}.quantity`)}
            defaultValue={item.quantity}
            hasError={hasErrors(_.get(errors.items?.[index], 'quantity'))}
          />
          {getErrors(_.get(errors.items?.[index], 'quantity'))}
        </div>
        <div>{item.cost}</div>
        <div>{lineTotal(index)}</div>
        <div>
          <Input
            className="form-control w-full"
            {...register(`items.${index}.comments`)}
            defaultValue={item.comments}
            hasError={hasErrors(_.get(errors.items?.[index], 'comments'))}
          />
          {getErrors(_.get(errors.items?.[index], 'comments'))}
        </div>
        <div className="flex flex-col items-start">
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
      <div className="border rounded-2xl border-gray-300 bg-gray-50 p-3 mb-3" hidden={!open}>
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
          <div className="grid grid-cols-5 gap-3 mb-1 px-5 hover:bg-gray-200" key={variantIndex}>
            <div className="inline-flex items-center">{variant.attribute_value}</div>
            <div>
              <input type="hidden" {...register(`items.${index}.variants.${variantIndex}.id`)}
                     value={variant["id"]}/>
              <Input
                type="number"
                className="form-control w-full"
                {...register(`items.${index}.variants.${variantIndex}.cost`, {valueAsNumber: true})}
                defaultValue={variant.cost || 0}
                selectable={true}
                hasError={hasErrors(_.get(errors.items?.[index]?.variants?.[variantIndex], `cost`))}
              />
              {getErrors(_.get(errors.items?.[index]?.variants?.[variantIndex], `cost`))}
            </div>
            <div>
              <Input
                type="number"
                className="form-control w-full"
                {...register(`items.${index}.variants.${variantIndex}.quantity`)}
                defaultValue={variant.quantity || 1}
                selectable={true}
                hasError={hasErrors(_.get(errors.items?.[index]?.variants?.[variantIndex], `quantity`))}
              />
              {getErrors(_.get(errors.items?.[index]?.variants?.[variantIndex], `quantity`))}
            </div>
            <div className="inline-flex items-center">
              {variantTotal(index, variantIndex)}
            </div>
            <div className="inline-flex items-center">
              <ConfirmAlert
                onConfirm={() => removeVariant(index, variantIndex)}
                title={`Remove ${item.item.name} > ${variant.attribute_name}?`}
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
    </React.Fragment>
  );
}
