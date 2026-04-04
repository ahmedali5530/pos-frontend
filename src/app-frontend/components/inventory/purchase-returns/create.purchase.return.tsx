import React, {FC, useCallback, useEffect, useMemo, useState} from 'react';
import {Input} from "../../../../app-common/components/input/input";
import {Controller, useFieldArray, useForm, useWatch} from "react-hook-form";
import {ReactSelect} from "../../../../app-common/components/input/custom.react.select";
import {ITEM_FETCHES, Product} from "../../../../api/model/product";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowDown, faArrowRight, faPlus, faRemove} from "@fortawesome/free-solid-svg-icons";
import {Button} from '../../../../app-common/components/input/button';
import {DateTime} from "luxon";
import {Modal} from "../../../../app-common/components/modal/modal";
import classNames from "classnames";
import {getErrorClass, getErrors, hasErrors} from "../../../../lib/error/error";
import * as yup from 'yup';
import {ConstraintViolation, ValidationMessage, ValidationResult} from "../../../../api/model/validation";
import {yupResolver} from "@hookform/resolvers/yup";
import {HttpException, UnprocessableEntityException} from "../../../../lib/http/exception/http.exception";
import {notify} from "../../../../app-common/components/confirm/notification";
import {useAtom} from "jotai";
import {appState} from "../../../../store/jotai";
import useApi, {SettingsData} from "../../../../api/db/use.api";
import {Tables} from "../../../../api/db/tables";
import {useDB} from "../../../../api/db/db";
import {toRecordId} from "../../../../api/model/common";
import {PurchaseReturn} from "../../../../api/model/purchase_return";
import {Purchase} from "../../../../api/model/purchase";
import {PURCHASE_FETCHES} from "../../../../api/model/purchase";
import {ConfirmAlert} from "../../../../app-common/components/confirm/confirm.alert";
import {File} from "../../../../api/model/file";
import {toArrayBuffer} from "../../../../lib/files/files";

interface ExistingFile extends File {
  id?: string;
}

interface PendingFile extends File {
  local_id: string;
}

export interface SelectedReturnItem {
  item: Product;
  quantity: number;
  comments: string;
  price: number;
  purchase_item?: any;
  purchased?: number;
  variants?: any[];
}

interface PurchaseReturnProps {
  purchaseReturn?: PurchaseReturn;
  operation?: string;
  addModal: boolean;
  onClose?: () => void;
}

const ValidationSchema = yup.object({
  created_at: yup.string().required(ValidationMessage.Required),
  invoice_number: yup.string().required(ValidationMessage.Required),
  items: yup.array(yup.object({
    quantity: yup.number().typeError(ValidationMessage.Number).required(ValidationMessage.Required),
    price: yup.number().typeError(ValidationMessage.Number).required(ValidationMessage.Required),
    comments: yup.string(),
    purchased: yup.number(),
    variants: yup.array(yup.object({
      quantity: yup.number().typeError(ValidationMessage.Number).required(ValidationMessage.Required),
      price: yup.number().typeError(ValidationMessage.Number).required(ValidationMessage.Number),
      purchased: yup.string()
    }))
  })).min(1, 'Please add some items'),
  purchase: yup.object().notRequired()
}).required();

export const CreatePurchaseReturn: FC<PurchaseReturnProps> = ({
  purchaseReturn, operation, addModal, onClose
}) => {
  const [{store, user}] = useAtom(appState);
  const db = useDB();

  const {handleSubmit, formState: {errors}, reset, control, watch, getValues, setValue, setError} = useForm({
    resolver: yupResolver(ValidationSchema)
  });
  const {fields, append, remove, update} = useFieldArray({
    control: control,
    name: 'items'
  });

  const [creating, setCreating] = useState(false);
  const [openVariants, setOpenVariants] = useState<Record<number, boolean>>({});
  const [existingDocuments, setExistingDocuments] = useState<ExistingFile[]>([]);
  const [pendingDocuments, setPendingDocuments] = useState<PendingFile[]>([]);
  const [removedExistingDocumentIds, setRemovedExistingDocumentIds] = useState<string[]>([]);

  const {
    fetchData: loadPurchases,
    data: purchases,
    isFetching: loadingPurchases
  } = useApi<SettingsData<Purchase>>(Tables.purchase, [`store = ${store?.id}`], ['created_at DESC'], 0, undefined, PURCHASE_FETCHES, {
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

  const selectedPurchase = useWatch({
    name: 'purchase',
    control: control
  });

  const itemsWatch = getValues();
  const addedItems = watch('items') ?? [];

  useEffect(() => {
    setModal(addModal);
    // load on modal open
    if (addModal) {
      (async () => {
        await loadPurchases();
        await loadProducts();

        if(operation === 'create'){
          const newId = await fetchNextInvoiceNumber();

          reset({
            invoice_number: newId,
            created_at: DateTime.now().toFormat("yyyy-MM-dd'T'HH:mm")
          });
        }
      })();
    }
  }, [addModal, operation]);

  const fetchNextInvoiceNumber = async () => {
    const [rows] = await db.query(`SELECT math::max(<int>invoice_number) as max_value FROM ${Tables.purchase_return} GROUP ALL`);
    return Number(rows?.[0]?.max_value || 0) + 1;
  };

  useEffect(() => {
    if (purchaseReturn) {
      const openVariantsState: Record<number, boolean> = {};
      reset({
        ...purchaseReturn,
        purchase: purchaseReturn?.purchase ? {
          label: purchaseReturn?.purchase?.purchase_number?.toString(),
          value: purchaseReturn?.purchase?.["id"]
        } : null,
        invoice_number: purchaseReturn.invoice_number,
        created_at: DateTime.fromJSDate(new Date(purchaseReturn.created_at)).toFormat("yyyy-MM-dd'T'HH:mm"),
        items: purchaseReturn.items?.map((returnItem, index) => {
          openVariantsState[index] = true;
          return {
            id: returnItem.id,
            item: returnItem.item,
            quantity: returnItem.quantity,
            comments: returnItem.comments,
            price: returnItem.price,
            purchased: returnItem.purchased,
            purchase_item: returnItem.purchase_item,
            variants: returnItem.variants?.map(variant => ({
              id: variant.id,
              variant: variant.variant,
              quantity: variant.quantity,
              price: variant.price,
              purchased: variant.purchased
            })) || []
          };
        })
      });
      setOpenVariants(openVariantsState);
      setExistingDocuments(purchaseReturn.documents || []);
      setPendingDocuments([]);
      setRemovedExistingDocumentIds([]);
    }
  }, [purchaseReturn]);

  const savePurchaseReturn = async (values: any) => {
    setCreating(true);

    try {
      const items = [];
      if (values?.items) {
        for (const item of values.items) {
          const variants = [];
          
          if (item?.variants) {
            for (const variant of item.variants) {
              const variantData = {
                quantity: Number(variant.quantity),
                price: Number(variant.price),
                purchased: variant.purchased || null
              };

              if (variant?.id) {
                await db.merge(toRecordId(variant.id), variantData);
                variants.push(toRecordId(variant.id));
              } else {
                const [v] = await db.insert(Tables.purchase_return_item_variant, variantData);
                variants.push(v.id);
              }
            }
          }

          const itemData = {
            item: toRecordId(item.item.id),
            quantity: Number(item.quantity),
            price: Number(item.price),
            comments: item.comments,
            purchased: item.purchased ? Number(item.purchased) : null,
            purchase_item: item.purchase_item ? toRecordId(item.purchase_item) : null,
            variants: variants
          };

          if (item?.id) {
            await db.merge(toRecordId(item.id), itemData);
            items.push(toRecordId(item.id));
            
            for (const variant of variants) {
              await db.merge(variant, {
                purchase_return_item: toRecordId(item.id)
              });
            }
          } else {
            const [i] = await db.insert(Tables.purchase_return_item, itemData);
            items.push(i.id);
            
            for (const variant of variants) {
              await db.merge(variant, {
                purchase_return_item: toRecordId(i.id)
              });
            }
          }
        }
      }

      // Handle documents
      for (const removedDocumentId of removedExistingDocumentIds) {
        await db.delete(toRecordId(removedDocumentId));
      }

      const documentRecordIds = [];
      for (const existingDocument of existingDocuments) {
        if (existingDocument?.id) {
          documentRecordIds.push(toRecordId(existingDocument.id));
        }
      }
      for (const pendingDocument of pendingDocuments) {
        const [createdDocument] = await db.insert(Tables.file, {
          name: pendingDocument.name,
          size: pendingDocument.size,
          content: pendingDocument.content
        });
        documentRecordIds.push(createdDocument.id);
      }

      if (purchaseReturn?.id) {
        await db.merge(toRecordId(purchaseReturn.id), {
          created_at: DateTime.fromFormat(values.created_at, "yyyy-MM-dd'T'hh:mm").toJSDate(),
          items: items,
          invoice_number: Number(values.invoice_number),
          purchase: values.purchase ? toRecordId(values.purchase.value) : null,
          store: toRecordId(store?.id),
          documents: documentRecordIds
        });

        for (const item of items) {
          await db.merge(item, {
            purchase_return: toRecordId(purchaseReturn.id)
          })
        }
      } else {
        const [pur] = await db.insert(Tables.purchase_return, {
          created_at: DateTime.fromFormat(values.created_at, "yyyy-MM-dd'T'hh:mm").toJSDate(),
          items: items,
          invoice_number: Number(values.invoice_number),
          purchase: values.purchase ? toRecordId(values.purchase.value) : null,
          store: toRecordId(store?.id),
          created_by: toRecordId(user?.id),
          documents: documentRecordIds
        });

        for (const item of items) {
          await db.merge(item, {
            purchase_return: toRecordId(pur.id)
          })
        }
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

  const purchase = watch('purchase');

  const purchaseItems = useMemo(() => {
    if (!purchase || !purchases?.data) return [];
    
    const selectedPurchase = purchases.data.find(p => p.id.toString() === purchase.value.toString());
    if (!selectedPurchase || !selectedPurchase.items) return [];

    return selectedPurchase.items.map(purchaseItem => ({
      id: purchaseItem.id,
      item: purchaseItem.item,
      quantity: 0,
      comments: '',
      price: purchaseItem.purchase_price,
      purchased: purchaseItem.quantity,
      purchase_item: purchaseItem.id
    }));
  }, [purchase, purchases]);

  const addPurchaseItem = (itemId: string) => {
    const item: Product = items?.data?.find(a => a.id.toString() === itemId);

    if (item) {
      append({
        item: item,
        quantity: 1,
        comments: '',
        price: item?.cost || 0,
        purchased: 0,
        variants: item.variants?.map(variant => ({
          attribute_value: variant.attribute_value,
          quantity: 0,
          price: variant.price,
          purchased: 0,
          variant: variant.id
        })) || []
      });
    }
  }

  const addPurchaseItemFromOrder = (purchaseItemData: any) => {
    append(purchaseItemData);
  }

  const removeVariant = (index: number, variantIndex: number) => {
    const item = addedItems[index];
    if (item?.variants) {
      item.variants.splice(variantIndex, 1);
      update(index, item);
    }
  }

  const handleDocumentsChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles?.length) {
      return;
    }

    const uploadedDocuments: PendingFile[] = [];
    for (const selectedFile of Array.from(selectedFiles)) {
      const rawBuffer = await selectedFile.arrayBuffer();
      uploadedDocuments.push({
        local_id: `${selectedFile.name}_${selectedFile.lastModified}_${Math.random().toString(36).slice(2, 9)}`,
        name: selectedFile.name,
        size: selectedFile.size,
        content: toArrayBuffer(rawBuffer)
      });
    }

    setPendingDocuments((previous) => [...previous, ...uploadedDocuments]);
    event.target.value = "";
  };

  const removeExistingDocument = (document: ExistingFile) => {
    if (document?.id) {
      setRemovedExistingDocumentIds((previous) => [...previous, document.id as string]);
    }
    setExistingDocuments((previous) => previous.filter((entry) => entry !== document));
  };

  const removePendingDocument = (localId: string) => {
    setPendingDocuments((previous) => previous.filter((entry) => entry.local_id !== localId));
  };

  const lineTotal = useCallback((index: number) => {
    const item: any = addedItems[index];
    return parseFloat(item.quantity || 0) * parseFloat(item.price || 0);
  }, [itemsWatch, addedItems]);

  const variantTotal = useCallback((index: number, variantIndex: number) => {
    const item: any = addedItems[index];
    const variant = item?.variants?.[variantIndex];
    if (!variant) return 0;
    return parseFloat(variant.quantity || 0) * parseFloat(variant.price || 0);
  }, [itemsWatch, addedItems]);

  const totalQuantity = useMemo(() => {
    const itemsQty = addedItems.reduce((prev: number, item: any) => prev + parseFloat(item.quantity || 0), 0);
    const variantQty = addedItems.reduce((p: number, i: any) => (
      i.variants?.reduce((prev: number, variant: any) => prev + Number(variant.quantity || 0), 0) || 0
    ), 0);

    return itemsQty + variantQty;
  }, [itemsWatch]);

  const totalAmount = useMemo(() => {
    const itemsCost = addedItems.reduce((prev: number, item: any) => prev + (parseFloat(item.price || 0) * parseFloat(item.quantity || 0)), 0);
    const variantsCost = addedItems.reduce((p: number, i: any) => (
      i.variants?.reduce((prev: number, variant: any) => prev + (Number(variant.price || 0) * Number(variant.quantity || 0)), 0) || 0
    ), 0);

    return itemsCost + variantsCost;
  }, [itemsWatch]);

  const onModalClose = () => {
    setModal(false);
    setExistingDocuments([]);
    setPendingDocuments([]);
    setRemovedExistingDocumentIds([]);
    onClose && onClose();
  }

  return (
    <>
      <Modal
        open={modal}
        size="full"
        title={operation === 'update' ? 'Update purchase return' : 'Create new purchase return'}
        onClose={onModalClose}
      >
        <form onSubmit={handleSubmit(savePurchaseReturn)}>
          <div className="grid lg:grid-cols-4 gap-4 mb-3 md:grid-cols-3 sm:grid-cols-1">
            <div>
              <label htmlFor="created_at">Date</label>
              <Controller
                name="created_at"
                control={control}
                render={({field}) => (
                  <Input
                    {...field}
                    type="datetime-local"
                    id="created_at"
                    className="w-full"
                    hasError={hasErrors(errors.created_at)}
                  />
                )}
              />
              {getErrors(errors.created_at)}
            </div>
            <div>
              <label htmlFor="invoice_number">Return No.</label>
              <Controller
                name="invoice_number"
                control={control}
                render={({field}) => (
                  <Input
                    {...field}
                    type="text"
                    id="invoice_number"
                    className="w-full"
                    hasError={hasErrors(errors.invoice_number)}
                  />
                )}
              />
              {getErrors(errors.invoice_number)}
            </div>
            <div>
              <label htmlFor="purchase">Purchase (optional)</label>
              <Controller
                render={(props) => (
                  <ReactSelect
                    onChange={(value) => {
                      props.field.onChange(value);
                      if (value) {
                        const selectedPurchase = purchases?.data?.find(p => p.id.toString() === value.value.toString());
                        if (selectedPurchase?.items) {
                          setValue('items', []);
                          selectedPurchase.items.forEach(purchaseItem => {
                            append({
                              item: purchaseItem.item,
                              quantity: 0,
                              comments: '',
                              price: purchaseItem.purchase_price,
                              purchased: purchaseItem.quantity,
                              purchase_item: purchaseItem.id,
                              variants: purchaseItem.variants.map(variant => ({
                                attribute_value: variant.variant.attribute_value,
                                quantity: 0,
                                price: variant.purchase_price,
                                purchased: variant.quantity,
                                variant: variant.variant.id
                              }))
                            });
                          });
                        }
                      } else {
                        setValue('items', []);
                      }
                    }}
                    value={props.field.value}
                    options={purchases?.data?.map((p: Purchase) => ({
                      label: `Purchase #${p.purchase_number}`,
                      value: p.id
                    })) || []}
                    placeholder="Select purchase"
                    isClearable
                    isLoading={loadingPurchases}
                    className="w-full"
                  />
                )}
                control={control}
                name="purchase"
              />
              {getErrors(errors.purchase)}
            </div>
          </div>

          <div className="mb-3">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">Items</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  Total Quantity: {totalQuantity} | Total Amount: {totalAmount.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="">
              <table className="table table-fixed w-full">
                <thead>
                  <tr>
                    <th className="text-left">Item</th>
                    <th className="text-right">Purchased Qty</th>
                    <th className="text-right">Return Qty</th>
                    <th className="text-right">Price</th>
                    <th className="text-center">Comments</th>
                    <th className="text-right">Total</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {fields.map((field: any, index) => {
                    const item = addedItems[index];
                    const hasVariants = item?.variants && item.variants.length > 0;
                    const isOpen = openVariants[index] || false;
                    
                    return (
                      <React.Fragment key={field.id}>
                        <tr className="hover:bg-gray-50">
                          <td>
                            <div className="inline-flex items-center">
                              {hasVariants && (
                                <button
                                  className="btn btn-flat sm mr-2 w-[30px]"
                                  type="button"
                                  onClick={() => {
                                    setOpenVariants(prev => ({
                                      ...prev,
                                      [index]: !prev[index]
                                    }));
                                  }}
                                  title="Open variants"
                                >
                                  {isOpen ? <FontAwesomeIcon icon={faArrowDown}/> : <FontAwesomeIcon icon={faArrowRight}/>}
                                </button>
                              )}
                              <Controller
                                name={`items.${index}.item`}
                                control={control}
                                render={({field: ctrlField}) => (
                                  <ReactSelect
                                    value={ctrlField.value ? {
                                      label: ctrlField.value.name,
                                      value: ctrlField.value.id
                                    } : null}
                                    onChange={(value) => {
                                      const selectedItem = items?.data?.find(i => i.id.toString() === value?.value.toString());
                                      if (selectedItem) {
                                        ctrlField.onChange(selectedItem);
                                        setValue(`items.${index}.price`, selectedItem.cost || 0);
                                      }
                                    }}
                                    options={items?.data?.map((item: Product) => ({
                                      label: item.name,
                                      value: item.id
                                    })) || []}
                                    placeholder="Select item"
                                    isLoading={loadingProducts}
                                  />
                                )}
                              />
                            </div>
                            {getErrorClass(errors.items?.[index]?.item)}
                          </td>
                          <td className="text-right">
                            <Controller
                              name={`items.${index}.purchased`}
                              control={control}
                              render={({field}) => (
                                <Input
                                  value={field.value}
                                  onChange={field.onChange}
                                  type="number"
                                  className="w-full text-right"
                                  disabled
                                />
                              )}
                            />
                          </td>
                          <td>
                            <Controller
                              name={`items.${index}.quantity`}
                              control={control}
                              render={({field}) => (
                                <Input
                                  value={field.value}
                                  onChange={field.onChange}
                                  type="number"
                                  className={classNames("w-full text-right", {
                                    'border-red-500': errors.items?.[index]?.quantity
                                  })}
                                />
                              )}
                            />
                            {getErrors(errors.items?.[index]?.quantity)}
                          </td>
                          <td>
                            <Controller
                              name={`items.${index}.price`}
                              control={control}
                              render={({field}) => (
                                <Input
                                  value={field.value}
                                  onChange={field.onChange}
                                  type="number"
                                  step="0.01"
                                  className={classNames("w-full text-right", {
                                    'border-red-500': errors.items?.[index]?.price
                                  })}
                                />
                              )}
                            />
                            {getErrors(errors.items?.[index]?.price)}
                          </td>
                          <td>
                            <Controller
                              name={`items.${index}.comments`}
                              control={control}
                              render={({field}) => (
                                <Input
                                  value={field.value}
                                  onChange={field.onChange}
                                  type="text"
                                  className="w-full"
                                />
                              )}
                            />
                          </td>
                          <td className="text-right font-semibold">
                            {item ? (Number(item.quantity || 0) * Number(item.price || 0)).toFixed(2) : '0.00'}
                          </td>
                          <td className="text-center">
                            <ConfirmAlert
                              onConfirm={() => remove(index)}
                              title={`Remove ${item?.item?.name || 'item'}?`}
                              confirmText="Remove"
                            >
                              <Button
                                type="button"
                                variant="danger"
                                className="w-[40px]"
                              >
                                <FontAwesomeIcon icon={faRemove}/>
                              </Button>
                            </ConfirmAlert>
                          </td>
                        </tr>
                        {isOpen && hasVariants && (
                          <tr>
                            <td colSpan={7} className="p-0">
                              <div className="border border-gray-300 rounded-2xl bg-gray-50 p-3 m-3">
                                {item.variants.length > 0 && (
                                  <div className="grid grid-cols-5 gap-3 px-5 mb-2">
                                    <div className="font-bold">Variant</div>
                                    <div className="font-bold">Purchased Qty</div>
                                    <div className="font-bold">Return Qty</div>
                                    <div className="font-bold">Price</div>
                                    <div className="font-bold">Total</div>
                                  </div>
                                )}
                                {item.variants.map((variant: any, variantIndex: number) => (
                                  <div className="grid grid-cols-5 gap-3 mb-1 px-5 hover:bg-gray-100" key={variantIndex}>
                                    <div className="inline-flex items-center">{variant.attribute_value || variant.variant?.attribute_value}</div>
                                    <div className="text-right">
                                      <Controller
                                        name={`items.${index}.variants.${variantIndex}.purchased`}
                                        control={control}
                                        render={({field}) => (
                                          <Input
                                            value={field.value}
                                            onChange={field.onChange}
                                            type="number"
                                            className="w-full text-right"
                                            disabled
                                          />
                                        )}
                                      />
                                    </div>
                                    <div>
                                      <Controller
                                        name={`items.${index}.variants.${variantIndex}.quantity`}
                                        control={control}
                                        render={({field}) => (
                                          <Input
                                            value={field.value}
                                            onChange={field.onChange}
                                            type="number"
                                            className={classNames("w-full text-right", {
                                              'border-red-500': errors.items?.[index]?.variants?.[variantIndex]?.quantity
                                            })}
                                          />
                                        )}
                                      />
                                      {getErrors(errors.items?.[index]?.variants?.[variantIndex]?.quantity)}
                                    </div>
                                    <div>
                                      <Controller
                                        name={`items.${index}.variants.${variantIndex}.price`}
                                        control={control}
                                        render={({field}) => (
                                          <Input
                                            value={field.value}
                                            onChange={field.onChange}
                                            type="number"
                                            step="0.01"
                                            className={classNames("w-full text-right", {
                                              'border-red-500': errors.items?.[index]?.variants?.[variantIndex]?.price
                                            })}
                                          />
                                        )}
                                      />
                                      {getErrors(errors.items?.[index]?.variants?.[variantIndex]?.price)}
                                    </div>
                                    <div className="inline-flex items-center text-right font-semibold">
                                      {variantTotal(index, variantIndex).toFixed(2)}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr>
                    <th colSpan={2}>Total</th>
                    <th className="text-right">{totalQuantity}</th>
                    <th></th>
                    <th></th>
                    <th className="text-right">{totalAmount.toFixed(2)}</th>
                    <th></th>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="mt-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  append({
                    item: null,
                    quantity: 1,
                    comments: '',
                    price: 0,
                    purchased: 0,
                    variants: []
                  });
                }}
              >
                <FontAwesomeIcon icon={faPlus} className="mr-2"/> Add Item
              </Button>
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="documents">Documents</label>
            <input
              id="documents"
              className="input w-full"
              type="file"
              multiple
              onChange={handleDocumentsChange}
            />
            {(existingDocuments.length > 0 || pendingDocuments.length > 0) && (
              <div className="mt-2 border border-gray-200 rounded p-2">
                {existingDocuments.map((document, index) => (
                  <div key={`existing_document_${index}`} className="flex items-center justify-between py-1 border-b border-gray-100 last:border-b-0">
                    <span>{document.name} ({document.size} bytes)</span>
                    <div className="flex items-center gap-2">
                      <button
                        className="btn btn-danger"
                        type="button"
                        onClick={() => removeExistingDocument(document)}
                        title="Remove"
                      >
                        <FontAwesomeIcon icon={faRemove}/>
                      </button>
                    </div>
                  </div>
                ))}
                {pendingDocuments.map((document) => (
                  <div key={document.local_id} className="flex items-center justify-between py-1 border-b border-gray-100 last:border-b-0">
                    <span>{document.name} ({document.size} bytes)</span>
                    <div className="flex items-center gap-2">
                      <button
                        className="btn btn-danger"
                        type="button"
                        onClick={() => removePendingDocument(document.local_id)}
                        title="Remove"
                      >
                        <FontAwesomeIcon icon={faRemove}/>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 mt-5">
            <Button
              type="button"
              variant="secondary"
              onClick={onModalClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={creating}
            >
              {operation === 'update' ? 'Update Return' : 'Create Return'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
