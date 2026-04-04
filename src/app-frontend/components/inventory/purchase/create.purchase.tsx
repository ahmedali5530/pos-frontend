import React, {FC, useCallback, useEffect, useMemo, useState} from 'react';
import {Input} from "../../../../app-common/components/input/input";
import {Trans} from "react-i18next";
import {Controller, useFieldArray, useForm, UseFormRegister, useWatch} from "react-hook-form";
import {ReactSelect} from "../../../../app-common/components/input/custom.react.select";
import {ITEM_FETCHES, Product} from "../../../../api/model/product";
import {PurchaseOrder} from "../../../../api/model/purchase.order";
import {Supplier} from "../../../../api/model/supplier";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowDown, faArrowRight, faPlus, faRemove} from "@fortawesome/free-solid-svg-icons";
import {Button} from '../../../../app-common/components/input/button';
import {Switch} from "../../../../app-common/components/input/switch";
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
import {ConfirmAlert} from "../../../../app-common/components/confirm/confirm.alert";
import {CreateSupplier} from "../supplier/create.supplier";
import {CreateItem} from "../../settings/items/manage-item/items.create";
import {HttpException, UnprocessableEntityException} from "../../../../lib/http/exception/http.exception";
import {notify} from "../../../../app-common/components/confirm/notification";
import {CreatePurchaseOrder} from "../purchase-orders/create.purchase.order";
import {useAtom} from "jotai";
import {appState} from "../../../../store/jotai";
import useApi, {SettingsData} from "../../../../api/db/use.api";
import {Tables} from "../../../../api/db/tables";
import {useDB} from "../../../../api/db/db";
import {toRecordId} from "../../../../api/model/common";
import {Category} from "../../../../api/model/category";

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
  created_at: yup.string().required(ValidationMessage.Required),
  purchase_number: yup.string().required(ValidationMessage.Required),
  items: yup.array(yup.object({
    quantity: yup.number().typeError(ValidationMessage.Number).required(ValidationMessage.Required),
    comments: yup.string(),
    variants: yup.array(yup.object({
      quantity: yup.number().typeError(ValidationMessage.Number).required(ValidationMessage.Required),
      purchase_price: yup.number().typeError(ValidationMessage.Number).required(ValidationMessage.Required),
    }))
  })).min(1, 'Please add some items'),
  purchase_mode: yup.object().required(ValidationMessage.Required),
  payment_type: yup.object().required(ValidationMessage.Required),
  purchase_order: yup.object().notRequired()
}).required();

export const CreatePurchase: FC<PurchaseProps> = ({
  purchase, operation, addModal, onClose
}) => {
  const [{store, user}] = useAtom(appState);
  const db = useDB();

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
    data: purchase_orders,
    isFetching: loadingPurchaseOrder
  } = useApi<SettingsData<PurchaseOrder>>(Tables.purchase_order, [
    `store = ${store?.id}`, 'and (is_used = NULL or is_used = NONE or is_used = false)', 'and (deleted_at = NULL OR deleted_at = NONE)'
  ], ['id ASC'], 0, undefined, ['supplier', 'store', 'items', 'items.item', 'items.variants', 'items.variants.variant']);
  const [purchaseOrderModal, setPurchaseOrderModal] = useState(false);

  const {
    fetchData: loadSuppliers,
    data: suppliers,
    isFetching: loadingSuppliers
  } = useApi<SettingsData<Supplier>>(Tables.supplier, [`stores ?= ${store?.id}`], ['name ASC'], 0, undefined, [], {
    enabled: false
  });
  const [supplierModal, setSupplierModal] = useState(false);

  const {
    data: items,
    isFetching: loadingProducts,
    fetchData: loadProducts,
  } = useApi<SettingsData<Product>>(Tables.product, [`array::any(stores, |$s| $s.product_store.store = $store)`], ['name ASC'], 0, undefined, ITEM_FETCHES, {
    enabled: false
  }, ['*'], {
    store: store?.id
  });
  const [itemsModal, setItemsModal] = useState(false);

  const {
    fetchData: loadPaymentTypes,
    data: payment_types,
    isFetching: loadingPaymentTypes
  } = useApi<SettingsData<PaymentType>>(Tables.payment, [`stores ?= ${store?.id}`]);

  const {
    data: categories,
    isFetching: loadingCategories
  } = useApi<SettingsData<Category>>(Tables.category, [`stores ?= ${store?.id}`]);

  const [modal, setModal] = useState(false);
  const supplier = useWatch({
    name: 'supplier',
    control: control
  });

  const category = useWatch({
    name: 'category',
    control: control
  });

  const itemsList = useMemo(() => {
    let list = items?.data || [];
    if(supplier){
      list = list.filter((item) => {
        if (!item?.suppliers?.length) {
          return false;
        }

        return item.suppliers.some((productSupplier) => {
          return productSupplier?.id?.toString() === supplier?.value?.toString();
        });
      });
    }

    if(category){
      list = list.filter((item) => {
        if (!item?.categories?.length) {
          return false;
        }

        return item.categories.some((productCategory) => {
          return productCategory?.id?.toString() === category?.value?.toString();
        });
      });
    }

    return list;
  }, [items, supplier, category]);

  useEffect(() => {
    setModal(addModal);
    // load on modal open
    if (addModal) {
      (async () => {
        await loadPurchaseOrders();
        await loadSuppliers();
        await loadProducts();
        await loadPaymentTypes();

        if(operation === 'create'){
          const newId = await fetchNextInvoiceNumber();

          reset({
            purchase_number: newId,
            created_at: DateTime.now().toFormat("yyyy-MM-dd'T'HH:mm"),
            purchase_mode: {label: 'Items list', value: 'Items list'}
          });
        }
      })();


    }
  }, [addModal, operation]);

  const fetchNextInvoiceNumber = async () => {
    const [rows] = await db.query(`SELECT math::max(<int>purchase_number) as max_value FROM ${Tables.purchase} GROUP ALL`);
    return Number(rows?.[0]?.max_value || 0) + 1;
  };

  useEffect(() => {
    if (purchase) {
      reset({
        ...purchase,
        purchase_mode: {
          label: purchase.purchase_mode,
          value: purchase.purchase_mode
        },
        purchase_order: purchase?.purchase_order ? {
          label: purchase?.purchase_order?.po_number,
          value: purchase?.purchase_order?.["id"]
        } : null,
        payment_type: {
          label: purchase?.payment_type?.name,
          value: purchase?.payment_type?.['id']
        },
        supplier: purchase?.supplier ? {
          label: purchase?.supplier?.name,
          value: purchase?.supplier?.["id"]
        } : null,
        purchase_number: purchase.purchase_number,
        created_at: DateTime.fromJSDate(purchase.created_at).toFormat("yyyy-MM-dd'T'HH:mm"),
        items: purchase.items.map(purchaseItem => ({
          id: purchaseItem.id,
          item: purchaseItem.item,
          purchase_unit: purchaseItem.purchase_unit,
          quantity_requested: purchaseItem.quantity_requested,
          quantity: purchaseItem.quantity,
          comments: purchaseItem.comments,
          purchase_price: purchaseItem.purchase_price,
          supplier: purchaseItem.supplier ? {
            label: purchaseItem.supplier.name,
            value: purchaseItem.supplier.id
          } : null,
          variants: purchaseItem.variants.map(variant => ({
            id: variant['id'],
            attribute_value: variant.variant.attribute_value,
            quantity: variant.quantity,
            purchase_price: variant.purchase_price,
            purchase_unit: variant.purchase_unit,
            quantity_requested: variant.quantity_requested,
            variant: variant.variant.id
          }))
        }))
      });
    }
  }, [purchase]);

  const savePurchase = async (values: any) => {
    setCreating(true);

    const newItemStock = {};
    const newVariantStock = {};
    if(purchase && purchase?.items){
      for(const item of purchase.items){
        const [quantity] = await db.query(`SELECT quantity FROM ${Tables.product_store} where store = $store and product = $product`, {
          store: toRecordId(store?.id),
          product: toRecordId(item.item.id)
        });

        if (quantity.length > 0) {
          newItemStock[item.id.toString()] = quantity[0].quantity;
        }

        if(item.variants){
          for(const variant of item.variants){
            const [quantity] = await db.query(`SELECT quantity FROM ${Tables.product_variant_store} where store = $store and variant = $variant`, {
              store: toRecordId(store?.id),
              variant: toRecordId(variant.variant.id)
            });

            if (quantity.length > 0) {
              newVariantStock[variant.id.toString()] = quantity[0].quantity
            }
          }
        }
      }
    }

    // Calculate the difference in quantity and update the stock accordingly for items and variants
    if(purchase && values?.items && values.update_stock_quantities){
      // First, handle removed items - items that were in the original purchase but not in the updated values
      for(const oldItem of purchase.items) {
        const stillExists = values.items.find(i => i?.id && i.id.toString() === oldItem.id.toString());

        if(!stillExists) {
          // Item was removed, decrease the stock by the old quantity
          const [productStore] = await db.query(`SELECT * FROM ${Tables.product_store} where store = $store and product = $product`, {
            store: toRecordId(store?.id),
            product: toRecordId(oldItem.item.id)
          });

          if (productStore.length > 0) {
            await db.merge(toRecordId(productStore[0].id), {
              quantity: productStore[0].quantity - oldItem.quantity
            });
          }

          // Handle removed item's variants
          if(oldItem.variants) {
            for(const oldVariant of oldItem.variants) {
              const [variantStore] = await db.query(`SELECT * FROM ${Tables.product_variant_store} where store = $store and variant = $variant`, {
                store: toRecordId(store?.id),
                variant: toRecordId(oldVariant.variant.id)
              });

              if (variantStore.length > 0) {
                await db.merge(toRecordId(variantStore[0].id), {
                  quantity: variantStore[0].quantity - oldVariant.quantity
                });
              }
            }
          }
        }
      }

      // Then, handle updated or existing items
      for(const item of values.items){
        if(item?.id) {
          // This is an existing item, calculate the difference
          const oldItem = purchase.items.find(i => i.id.toString() === item.id.toString());
          const oldQuantity = oldItem?.quantity || 0;
          const quantityDiff = Number(item.quantity) - oldQuantity;

          if(quantityDiff !== 0) {
            const [productStore] = await db.query(`SELECT * FROM ${Tables.product_store} where store = $store and product = $product`, {
              store: toRecordId(store?.id),
              product: toRecordId(item.item.id)
            });

            if (productStore.length > 0) {
              await db.merge(toRecordId(productStore[0].id), {
                quantity: productStore[0].quantity + quantityDiff
              });
            }
          }

          // Handle variants - check for removed variants first
          if(oldItem?.variants) {
            for(const oldVariant of oldItem.variants) {
              const stillExists = item?.variants?.find(v => v?.id && v.id.toString() === oldVariant.id.toString());

              if(!stillExists) {
                // Variant was removed, decrease the stock
                const [variantStore] = await db.query(`SELECT * FROM ${Tables.product_variant_store} where store = $store and variant = $variant`, {
                  store: toRecordId(store?.id),
                  variant: toRecordId(oldVariant.variant.id)
                });

                if (variantStore.length > 0) {
                  await db.merge(toRecordId(variantStore[0].id), {
                    quantity: variantStore[0].quantity - oldVariant.quantity
                  });
                }
              }
            }
          }

          // Handle updated variants
          if(item?.variants) {
            for(const variant of item.variants) {
              if(variant?.id) {
                const oldVariant = oldItem?.variants?.find(v => v.id.toString() === variant.id.toString());
                const oldVariantQuantity = oldVariant?.quantity || 0;
                const variantQuantityDiff = Number(variant.quantity) - oldVariantQuantity;

                if(variantQuantityDiff !== 0) {
                  const [variantStore] = await db.query(`SELECT * FROM ${Tables.product_variant_store} where store = $store and variant = $variant`, {
                    store: toRecordId(store?.id),
                    variant: toRecordId(variant.variant)
                  });

                  if (variantStore.length > 0) {
                    await db.merge(toRecordId(variantStore[0].id), {
                      quantity: variantStore[0].quantity + variantQuantityDiff
                    });
                  }
                }
              }
            }
          }
        }
      }
    }

    try {
      const items = [];
      if (values?.items) {
        for (const item of values.items) {
          const variants = [];

          if (item?.variants) {
            for (const variant of item.variants) {
              const variantData = {
                // comments: variant.comments,
                purchase_price: Number(variant.purchase_price),
                purchase_unit: variant.purchase_unit,
                quantity: Number(variant.quantity),
                quantity_requested: Number(variant.quantity_requested),
                variant: toRecordId(variant.variant)
              };

              if (variant?.id) {
                await db.merge(toRecordId(variant.id), variantData);
                variants.push(toRecordId(variant.id));
              } else {
                const [v] = await db.insert(Tables.purchase_item_variant, variantData);

                if(values.update_stock_quantities) {
                  const [variantStore] = await db.query(`SELECT * FROM ${Tables.product_variant_store} where store = $store and variant = $variant`, {
                    store: toRecordId(store?.id),
                    variant: toRecordId(variant.variant)
                  });

                  if (variantStore.length > 0){
                    // add stock data
                    await db.merge(toRecordId(variantStore[0].id), {
                      quantity: variantStore[0].quantity + Number(variant.quantity)
                    });
                  }
                }

                variants.push(v.id);
              }
            }
          }

          const itemData = {
            comments: item.comments,
            item: toRecordId(item.item.id),
            purchase_price: Number(item.purchase_price),
            purchase_unit: item.purchase_unit,
            quantity: Number(item.quantity),
            quantity_requested: Number(item.quantity_requested),
            variants: variants,
            supplier: item.supplier ? toRecordId(item.supplier.value) : null
          };

          if (item?.id) {
            await db.merge(toRecordId(item.id), itemData);

            items.push(toRecordId(item.id));

            for (const variant of variants) {
              await db.merge(variant, {
                purchase_item: toRecordId(item.id)
              })
            }
          } else {
            const [i] = await db.insert(Tables.purchase_item, itemData);

            items.push(i.id);

            if(values.update_stock_quantities) {
              const [productStore] = await db.query(`SELECT * FROM ${Tables.product_store} where store = $store and product = $product`, {
                store: toRecordId(store?.id),
                product: toRecordId(item.item.id)
              });

              if (productStore.length > 0){
                // add stock data
                await db.merge(toRecordId(productStore[0].id), {
                  quantity: productStore[0].quantity + Number(item.quantity)
                });
              }
            }

            for (const variant of variants) {
              await db.merge(variant, {
                purchase_item: toRecordId(i.id)
              })
            }
          }
        }
      }

      if (purchase?.id) {
        await db.merge(toRecordId(purchase.id), {
          created_at: DateTime.fromFormat(values.created_at, "yyyy-MM-dd'T'hh:mm").toJSDate(),
          items: items,
          payment_type: toRecordId(values.payment_type.value),
          purchase_mode: values.purchase_mode.value,
          purchase_number: values.purchase_number,
          purchase_order: values.purchase_order ? toRecordId(values.purchase_order.value) : null,
          store: toRecordId(store?.id),
          supplier: values.supplier ? toRecordId(values.supplier?.value) : null
        });

        for (const item of items) {
          await db.merge(item, {
            purchase: toRecordId(purchase.id)
          })
        }
      } else {
        const [pur] = await db.insert(Tables.purchase, {
          created_at: DateTime.fromFormat(values.created_at, "yyyy-MM-dd'T'hh:mm").toJSDate(),
          items: items,
          payment_type: toRecordId(values.payment_type.value),
          purchase_mode: values.purchase_mode.value,
          purchase_number: values.purchase_number,
          purchase_order: values.purchase_order ? toRecordId(values.purchase_order.value) : null,
          store: toRecordId(store?.id),
          supplier: values.supplier ? toRecordId(values.supplier?.value) : null,
          purchased_by: toRecordId(user?.id)
        });

        for (const item of items) {
          await db.merge(item, {
            purchase: toRecordId(pur.id)
          })
        }
      }

      if (values.purchase_order) {
        await db.merge(toRecordId(values.purchase_order.value), {
          is_used: true
        });
      }

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

  const purchase_mode = watch('purchase_mode');

  const poMode = useMemo(() => {
    const value = purchase_mode;
    return !!(value && value.value === 'Purchase order');
  }, [purchase_mode]);

  const po = watch('purchase_order');

  const onPurchaseOrderChange = useCallback((purchase_order: PurchaseOrder | null) => {
    if (purchase_order !== null) {
      // clear items before adding new from purchase order
      setValue('items', []);

      purchase_order.items.forEach((item: PurchaseOrderItem) => {
        const data = {
          item: item.item,
          purchase_unit: item.unit,
          quantity_requested: item.quantity,
          quantity: item.quantity,
          comments: item.comments,
          purchase_price: item?.price || 0,
          variants: item.variants.map(variant => ({
            attribute_value: variant.variant.attribute_value,
            quantity: variant.quantity,
            purchase_price: variant.purchase_price,
            purchase_unit: variant.purchase_unit,
            variant: variant.variant['id'],
            quantity_requested: variant.quantity
          }))
        };

        append(data)
      });
    } else {
      // clear items if purchase order is not selected
      setValue('items', []);
    }
  }, []);

  const addSelectedItem = (itemId: string) => {
    const item: Product = items?.data?.find(a => a.id.toString() === itemId);

    append({
      item: item,
      quantity: 1,
      quantity_requested: 1,
      comments: '',
      purchase_price: item?.cost || 0,
      variants: item.variants.map(variant => ({
        attribute_value: variant.attribute_value,
        quantity: 1,
        purchase_price: variant.price,
        purchase_unit: item?.purchase_unit,
        variant: variant.id,
        quantity_requested: 1
      })),
      purchase_unit: item?.purchase_unit,
    });
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
    return addedItems.reduce((prev: number, item: any) => prev + parseFloat(item.quantity_requested), 0)
  }, [itemsWatch]);

  const totalCost = useMemo(() => {
    const itemsCost = addedItems.reduce((prev: number, item: any) => prev + (parseFloat(item.purchase_price) * parseFloat(item.quantity)), 0);
    const variantsCost = addedItems.reduce((p: number, i: any) => (
      i.variants.reduce((prev: number, variant: any) => prev + (Number(variant.purchase_price) * Number(variant.quantity)), 0)
    ), 0);

    return itemsCost + variantsCost;
  }, [itemsWatch]);

  const lineTotal = useCallback((index: number) => {
    const item: any = addedItems[index];

    return parseFloat(item.quantity) * parseFloat(item.purchase_price);
  }, [itemsWatch, addedItems]);

  const variantTotal = useCallback((index: number, variantIndex: number) => {
    const item: any = addedItems[index]['variants'][variantIndex];

    return parseFloat(item.quantity) * parseFloat(item.purchase_price);
  }, [itemsWatch, addedItems]);

  const removeVariant = (index: number, variantIndex: number) => {
    const item = addedItems[index];
    item.variants.splice(variantIndex, 1);

    update(index, item);
  }

  const onModalClose = () => {
    setModal(false);
    onClose && onClose();
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
              <label htmlFor="created_at">Date</label>
              <Input {...register('created_at')} type="datetime-local" id="created_at"
                     className="w-full" hasError={hasErrors(errors.created_at)}/>
              {getErrors(errors.created_at)}
            </div>
            <div>
              <label htmlFor="purchase_number">Purchase No.</label>
              <Input {...register('purchase_number')} type="text" id="purchase_number"
                     className="w-full" hasError={hasErrors(errors.purchase_number)}/>
              {getErrors(errors.purchase_number)}
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
                      // {label: 'CSV', value: 'CSV'},
                    ]}
                    defaultValue={{label: 'Items list', value: 'Items list'}}
                    className={getErrorClass(errors.purchase_mode)}
                  />
                )}
                name="purchase_mode"
                control={control}
              />

              {getErrors(errors.purchase_mode)}
            </div>
            <div className="col-span-full grid grid-cols-4 gap-4">
              {poMode ? (
                <div>
                  <label htmlFor="purchase_order">Select a Purchase Order</label>
                  <Controller
                    render={(props) => (
                      <div className="input-group">
                        <ReactSelect
                          onChange={(value) => {
                            props.field.onChange(value);
                            onPurchaseOrderChange(value);
                          }}
                          value={props.field.value}
                          options={purchase_orders?.data?.filter(item => !item.isUsed).map((item) => {
                            return {
                              label: `${item.po_number} - ${item?.supplier?.name}`,
                              value: item['id'],
                              items: item.items
                            }
                          })}
                          id="purchase_order"
                          className={
                            classNames(
                              "rs-__container flex-grow",
                              getErrorClass(errors.purchase_order)
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
                    name="purchase_order"
                    control={control}
                  />

                  {getErrors(errors.purchase_order)}
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
                            options={suppliers?.data?.map(item => {
                              return {
                                label: item.name,
                                value: item["id"]
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
                    <label htmlFor="category">Select a category</label>
                    <Controller
                      render={(props) => (
                        <div className="input-group">
                          <ReactSelect
                            onChange={props.field.onChange}
                            value={props.field.value}
                            options={categories?.data?.map(item => {
                              return {
                                label: item.name,
                                value: item["id"]
                              }
                            })}
                            id="category"
                            isClearable={true}
                            className={
                              classNames(
                                "flex-grow rs-__container",
                                getErrorClass(errors.category)
                              )
                            }
                            isLoading={loadingCategories}
                          />
                        </div>
                      )}
                      name="category"
                      control={control}
                    />

                    {getErrors(errors.category)}
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
                            value: item.id.toString()
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
            </div>
            <div className="col-span-full"></div>
            <div>
              <Controller
                control={control}
                name="update_stock_quantities"
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
              {getErrors(errors.update_stock_quantities)}
            </div>
            <div>
              <Controller
                control={control}
                name="update_stock_prices"
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
              {getErrors(errors.update_stock_prices)}
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
                po ? 'grid-cols-8' : 'grid-cols-8'
              )
            }>
              <div className="font-bold">Item</div>
              <div className="font-bold">Category</div>
              <div className="font-bold">Supplier</div>
              {po && <div className="font-bold">Quantity requested</div>}
              <div className="font-bold">Quantity</div>
              <div className="font-bold">Unit Cost</div>
              <div className="font-bold">Total Cost</div>
              <div className="font-bold">Comments</div>
              {!po &&
                <div className="font-bold">Remove?</div>
              }
            </div>
            {fields.map((item: any, index) => (
              <ItemRow
                key={index}
                item={item}
                register={register}
                index={index}
                po={po}
                remove={remove}
                lineTotal={lineTotal}
                variantTotal={variantTotal}
                removeVariant={removeVariant}
                globalSupplier={supplier}
                suppliers={suppliers?.data || []}
                loadingSuppliers={loadingSuppliers}
                control={control}
                setValue={setValue}
              />
            ))}
            <div className={
              classNames(
                "grid gap-3",
                po ? 'grid-cols-8' : 'grid-cols-8'
              )
            }>
              <div className="p-3 bg-gray-200 font-bold">{fields.length}</div>
              <div></div>
              <div></div>
              {po && <div className="p-3 bg-gray-200 font-bold">{totalQuantityRequested}</div>}
              <div className="p-3 bg-gray-200 font-bold">{totalQuantity}</div>
              <div></div>
              <div className="p-3 bg-gray-200 font-bold">{totalCost}</div>
            </div>
          </div>

          <div className="mb-3">
            <label htmlFor="payment_type">Select payment type</label>
            <div className="w-96">
              <Controller
                render={(props) => (
                  <ReactSelect
                    onChange={props.field.onChange}
                    value={props.field.value}
                    options={payment_types?.data?.map(item => {
                      return {
                        label: item.name,
                        value: item['id']
                      }
                    })}
                    id="payment_type"
                    isLoading={loadingPaymentTypes}
                    className={getErrorClass(errors.payment_type)}
                  />
                )}
                name="payment_type"
                control={control}
              />
              {getErrors(errors.payment_type)}
            </div>
          </div>

          <Button
            type="submit"
            disabled={creating} className="btn btn-primary">Save</Button>
        </form>
      </Modal>

      {supplierModal && (
        <CreateSupplier
          operation={'create'}
          showModal={true}
          onClose={() => {
            loadSuppliers();
            setSupplierModal(false);
          }}
        />
      )}


      {itemsModal && (
        <CreateItem
          addModal={true}
          operation="create"
          onClose={() => {
            loadProducts();
            setItemsModal(false);
          }}
        />
      )}

      {purchaseOrderModal && (
        <CreatePurchaseOrder
          operation={'create'}
          onClose={() => {
            loadPurchaseOrders();
            setPurchaseOrderModal(false);
          }}
          showModal={true}
        />
      )}

    </>
  );
}


interface ItemRowProps {
  item: any;
  key: any;
  po?: PurchaseOrder;
  register: UseFormRegister<any>;
  index: number;
  remove: (index: number) => void;
  lineTotal: (index: number) => number;
  variantTotal: (index: number, variantIndex: number) => number;
  removeVariant: (index: number, variantIndex: number) => void;
  globalSupplier: any;
  suppliers: Supplier[];
  loadingSuppliers: boolean;
  control: any;
  setValue: any;
}

const ItemRow: FC<ItemRowProps> = ({
  item, po, register, index, remove, lineTotal, variantTotal, removeVariant,
  globalSupplier, suppliers, loadingSuppliers, control, setValue
}) => {
  const [open, setOpen] = useState(false);

  // Sync global supplier to item-level supplier
  useEffect(() => {
    if (globalSupplier) {
      setValue(`items.${index}.supplier`, {
        label: globalSupplier.label,
        value: globalSupplier.value
      });
    } else {
      // Clear item supplier when global supplier is removed
      setValue(`items.${index}.supplier`, null);
    }
  }, [globalSupplier, index, setValue]);

  return (
    <React.Fragment key={item.id}>
      <div className={
        classNames(
          "grid hover:bg-gray-100 gap-3 mb-3",
          po ? 'grid-cols-8' : 'grid-cols-8'
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
        <div>
          {item.item.categories?.map(a => a.name).join(', ')}
        </div>
        <div>
          <Controller
            name={`items.${index}.supplier`}
            control={control}
            render={({ field }) => (
              <ReactSelect
                onChange={field.onChange}
                value={field.value}
                options={suppliers?.map(item => ({
                  label: item.name,
                  value: item.id
                }))}
                isDisabled={!!globalSupplier}
                isClearable={!globalSupplier}
                isLoading={loadingSuppliers}
                className="w-full"
                placeholder="Select supplier"
              />
            )}
          />
        </div>
        {po && (
          <Input
            type="number"
            className="form-control w-full"
            {...register(`items.${index}.quantity_requested`)}
            defaultValue={item.quantity_requested}
            readOnly={true}
          />
        )}
        <div>
          <div className="input-group">
            <Input
              type="number"
              className="form-control w-full"
              {...register(`items.${index}.quantity`)}
              defaultValue={item.quantity}
              selectable={true}
            />
            <span className="input-addon">{item.purchase_unit}</span>
          </div>

        </div>
        <div>
          <Input
            type="number"
            className="form-control w-full"
            {...register(`items.${index}.purchase_price`)}
            defaultValue={item.purchase_price}
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
          {!po && (
            <ConfirmAlert
              onConfirm={() => remove(index)}
              title={`Remove ${item.item.name}?`}
              confirmText="Remove"
            >
              <button className="btn btn-danger" type="button">
                <FontAwesomeIcon icon={faRemove}/>
              </button>
            </ConfirmAlert>
          )}
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
          {item.variants.map((variant: any, variantIndex: number) => (
            <div className="grid grid-cols-5 gap-3 mb-1 px-5 hover:bg-gray-200" key={variantIndex}>
              <div className="inline-flex items-center">{variant.attribute_value}</div>
              <div>
                <input type="hidden" {...register(`items.${index}.variants.${variantIndex}.id`)}
                       value={variant["id"]}/>
                <Input
                  type="number"
                  className="form-control w-full"
                  {...register(`items.${index}.variants.${variantIndex}.purchase_price`)}
                  defaultValue={variant.purchase_price || 0}
                  selectable={true}
                />
              </div>
              <div>
                <div className="input-group">
                  <Input
                    type="number"
                    className="form-control w-full"
                    {...register(`items.${index}.variants.${variantIndex}.quantity`)}
                    defaultValue={variant.quantity || 1}
                    selectable={true}
                  />
                  <span className="input-addon">{variant.purchase_unit}</span>
                </div>
              </div>
              <div className="inline-flex items-center">
                {variantTotal(index, variantIndex)}
              </div>
              <div className="inline-flex items-center">
                {!po && (
                  <ConfirmAlert
                    onConfirm={() => removeVariant(index, variantIndex)}
                    title={`Remove ${item.item.name} > ${variant.attribute_value}?`}
                    confirmText="Remove"
                  >
                    <button className="btn btn-danger" type="button">
                      <FontAwesomeIcon icon={faRemove}/>
                    </button>
                  </ConfirmAlert>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </React.Fragment>
  );
}
