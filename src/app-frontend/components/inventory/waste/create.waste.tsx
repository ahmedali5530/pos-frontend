import React, {FC, useEffect, useMemo, useState} from "react";
import {Controller, useFieldArray, useForm} from "react-hook-form";
import {DateTime} from "luxon";
import * as yup from "yup";
import {yupResolver} from "@hookform/resolvers/yup";
import {useAtom} from "jotai";
import {Input} from "../../../../app-common/components/input/input";
import {Button} from "../../../../app-common/components/input/button";
import {Modal} from "../../../../app-common/components/modal/modal";
import {ReactSelect} from "../../../../app-common/components/input/custom.react.select";
import {ValidationMessage} from "../../../../api/model/validation";
import {InventoryWaste} from "../../../../api/model/waste";
import useApi, {SettingsData} from "../../../../api/db/use.api";
import {Tables} from "../../../../api/db/tables";
import {Product} from "../../../../api/model/product";
import {Purchase} from "../../../../api/model/purchase";
import {appState} from "../../../../store/jotai";
import {useDB} from "../../../../api/db/db";
import {toRecordId} from "../../../../api/model/common";
import {ConfirmAlert} from "../../../../app-common/components/confirm/confirm.alert";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faDownload, faTrash} from "@fortawesome/free-solid-svg-icons";
import {getErrors, hasErrors} from "../../../../lib/error/error";
import {notify} from "../../../../app-common/components/confirm/notification";
import {File as WasteFile} from "../../../../api/model/file";
import {downloadArrayBuffer, toArrayBuffer} from "../../../../lib/files/files";
import {Store} from "../../../../api/model/store";
import {ITEM_FETCHES} from "../../../../api/model/product";

interface CreateWasteProps {
  operation: "create" | "update";
  showModal: boolean;
  waste?: InventoryWaste;
  onClose?: () => void;
}

interface ExistingWasteFile extends WasteFile {
  id?: string;
}

interface PendingWasteFile {
  local_id: string;
  name: string;
  size: number;
  content: ArrayBuffer;
}

const validationSchema = yup.object({
  created_at: yup.string().required(ValidationMessage.Required),
  invoice_number: yup.number().typeError(ValidationMessage.Number).required(ValidationMessage.Required),
  store: yup.object().required(ValidationMessage.Required),
  purchase: yup.object().nullable().notRequired(),
  items: yup.array(yup.object({
    item: yup.object().required(ValidationMessage.Required),
    quantity: yup.number().typeError(ValidationMessage.Number).min(0, ValidationMessage.Positive).required(ValidationMessage.Required),
    comments: yup.string().nullable().notRequired(),
    variants: yup.array(yup.object({
      variant: yup.object().required(ValidationMessage.Required),
      quantity: yup.number().typeError(ValidationMessage.Number).min(0, ValidationMessage.Positive).required(ValidationMessage.Required)
    })).notRequired()
    // source: yup.string().nullable().notRequired()
  })).min(1, "Please add at least one item").required(ValidationMessage.Required)
}).required();

export const CreateWaste: FC<CreateWasteProps> = ({
  operation,
  showModal,
  waste,
  onClose
}) => {
  const [{store: CurrentStore, user}] = useAtom(appState);
  const db = useDB();
  const [modal, setModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [existingDocuments, setExistingDocuments] = useState<ExistingWasteFile[]>([]);
  const [removedExistingDocumentIds, setRemovedExistingDocumentIds] = useState<string[]>([]);
  const [pendingDocuments, setPendingDocuments] = useState<PendingWasteFile[]>([]);

  const {register, control, reset, watch, getValues, setValue, formState: {errors}, handleSubmit} = useForm<any>({
    resolver: yupResolver(validationSchema)
  });
  const {fields, append, remove} = useFieldArray({
    control,
    name: "items"
  });

  const loadProductsHook = useApi<SettingsData<Product>>(Tables.product, [`array::any(stores, |$s| $s.product_store.store = $store)`], ["name ASC"], 0, undefined, ITEM_FETCHES, {
    enabled: false
  }, ["id", "name", "purchase_unit", "stores", "stores.store", "variants"], {
    // store: toRecordId(CurrentStore?.id)
  });
  const {data: products, isFetching: productsLoading, fetchData: loadProducts} = loadProductsHook;

  const loadPurchasesHook = useApi<SettingsData<Purchase>>(Tables.purchase, [`store = $store`], ["purchase_number DESC"], 0, undefined, [], {
    enabled: false
  }, ["id", "purchase_number"]);
  const {data: purchases, isFetching: purchasesLoading, fetchData: loadPurchases} = loadPurchasesHook;

  const {
    data: stores
  } = useApi<SettingsData<Store>>(Tables.store, [], [], 0, undefined, [], {}, ["id", "name"]);

  const selectedItems = watch("items") || [];
  const selectedStore = watch("store");
  const selectedStoreId = selectedStore?.value || CurrentStore?.id;

  const productOptions = useMemo(() => {
    return (products?.data || []).map((item) => ({
      label: item.name,
      value: item.id
    }));
  }, [products]);

  useEffect(() => {
    setModal(showModal);

    if (showModal) {
      loadProducts();
      loadPurchases();
    }
  }, [showModal]);

  useEffect(() => {
    const storeId = selectedStore?.value || CurrentStore?.id;
    if (!storeId) {
      return;
    }

    loadProductsHook.handleParameterChange({
      store: toRecordId(storeId)
    });
    loadPurchasesHook.handleParameterChange({
      store: toRecordId(storeId)
    });

    if (showModal) {
      loadProducts();
      loadPurchases();
    }
  }, [selectedStore?.value, CurrentStore?.id]);

  const fetchNextInvoiceNumber = async () => {
    const [rows] = await db.query(`SELECT math::max(invoice_number) as max_value FROM ${Tables.waste} GROUP ALL`);
    return Number(rows?.[0]?.max_value || 0) + 1;
  };

  const fetchWasteDocuments = async (wasteId?: string): Promise<ExistingWasteFile[]> => {
    if (!wasteId) {
      return [];
    }

    const [rows] = await db.query(
      `SELECT documents FROM ${Tables.waste} WHERE id = $id FETCH documents`,
      {id: toRecordId(wasteId)}
    );
    return rows?.[0]?.documents || [];
  };

  useEffect(() => {
    if (!showModal) {
      return;
    }

    if (operation === "update" && waste) {
      const wasteData: any = waste;
      const createdAt = waste.created_at instanceof Date
        ? DateTime.fromJSDate(waste.created_at).toFormat("yyyy-MM-dd'T'HH:mm")
        : DateTime.fromISO(waste.created_at).toFormat("yyyy-MM-dd'T'HH:mm");

      reset({
        created_at: createdAt,
        invoice_number: waste.invoice_number,
        store: wasteData.store ? {
          label: wasteData.store.name,
          value: wasteData.store.id
        } : null,
        purchase: waste.purchase ? {
          label: `${waste.purchase.purchase_number}`,
          value: waste.purchase.id
        } : null,
        items: (waste.items || []).map((wasteItem) => ({
          waste_item_id: wasteItem.id,
          item: wasteItem.item,
          quantity: wasteItem.quantity,
          comments: wasteItem.comments || "",
          variants: ((wasteItem as any).variants || []).map((variantEntry: any) => ({
            variant: variantEntry.variant,
            quantity: variantEntry.quantity || 0
          }))
          // source: wasteItem.source || ""
        }))
      });
      setPendingDocuments([]);
      setRemovedExistingDocumentIds([]);

      fetchWasteDocuments(waste.id)
        .then((loadedDocuments) => {
          setExistingDocuments(loadedDocuments);
        })
        .catch((error: any) => {
          setExistingDocuments([]);
          notify({
            type: "error",
            description: error?.message || "Failed to load waste documents"
          });
        });

      return;
    }

    if (operation === "create") {
      const init = async () => {
        const nextInvoiceNumber = await fetchNextInvoiceNumber();

        reset({
          created_at: DateTime.now().toFormat("yyyy-MM-dd'T'HH:mm"),
          invoice_number: nextInvoiceNumber,
          store: CurrentStore ? {
            label: CurrentStore.name,
            value: CurrentStore.id
          } : null,
          purchase: null,
          items: []
        });
        setExistingDocuments([]);
        setPendingDocuments([]);
        setRemovedExistingDocumentIds([]);
      };

      init();
    }
  }, [operation, waste, showModal]);

  const addItem = (itemId: string) => {
    const product = (products?.data || []).find((entry) => entry.id.toString() === itemId.toString());

    if (!product) {
      return;
    }

    const alreadyAdded = selectedItems.some((entry: any) => entry?.item?.id?.toString() === product.id.toString());
    if (alreadyAdded) {
      notify({
        type: "warning",
        description: `${product.name} is already in the waste list`
      });
      return;
    }

    append({
      waste_item_id: null,
      item: product,
      quantity: 1,
      comments: "",
      variants: (product.variants || []).map((variant) => ({
        variant: {
          id: variant.id,
          attribute_value: variant.attribute_value,
          stores: variant.stores || []
        },
        quantity: 0
      }))
      // source: ""
    });
  };

  const closeModal = () => {
    setModal(false);
    onClose && onClose();
  };

  const handleDocumentsChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles?.length) {
      return;
    }

    const uploadedDocuments: PendingWasteFile[] = [];
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

  const removeExistingDocument = (document: ExistingWasteFile) => {
    if (document?.id) {
      setRemovedExistingDocumentIds((previous) => [...previous, document.id as string]);
    }
    setExistingDocuments((previous) => previous.filter((entry) => entry !== document));
  };

  const removePendingDocument = (localId: string) => {
    setPendingDocuments((previous) => previous.filter((entry) => entry.local_id !== localId));
  };

  const removeVariantRow = (itemIndex: number, variantIndex: number) => {
    const currentVariants = getValues(`items.${itemIndex}.variants`) || [];
    const updatedVariants = currentVariants.filter((_: any, index: number) => index !== variantIndex);
    setValue(`items.${itemIndex}.variants`, updatedVariants, {
      shouldDirty: true,
      shouldValidate: true
    });
  };

  const toComparableId = (value: any): string => {
    if (!value) {
      return "";
    }
    if (typeof value === "string") {
      return value;
    }
    if (typeof value === "object" && "tb" in value && "id" in value) {
      return `${value.tb}:${value.id}`;
    }
    return String(value);
  };

  const getProductAvailableStock = (product: any, storeId: any): number => {
    if (!product || !storeId) {
      return 0;
    }
    const targetStoreId = toComparableId(storeId);
    const productFromCatalog = (products?.data || []).find((entry: any) => {
      return toComparableId(entry?.id) === toComparableId(product?.id);
    });
    const productStores = product.stores || productFromCatalog?.stores || [];
    const productStore = productStores.find((storeEntry: any) => {
      return toComparableId(storeEntry?.store?.id || storeEntry?.store) === targetStoreId;
    });
    return Number(productStore?.quantity || 0);
  };

  const getVariantAvailableStock = (variant: any, storeId: any): number => {
    if (!variant || !storeId) {
      return 0;
    }
    const targetStoreId = toComparableId(storeId);
    let fallbackVariant: any = null;
    for (const product of (products?.data || [])) {
      fallbackVariant = (product.variants || []).find((entry: any) => {
        return toComparableId(entry?.id) === toComparableId(variant?.id);
      });
      if (fallbackVariant) {
        break;
      }
    }

    const variantStores = variant.stores || fallbackVariant?.stores || [];
    const variantStore = variantStores.find((storeEntry: any) => {
      return toComparableId(storeEntry?.store?.id || storeEntry?.store) === targetStoreId;
    });
    return Number(variantStore?.quantity || 0);
  };

  const getExistingWasteItemQuantity = (wasteItemId?: string): number => {
    if (!wasteItemId || !waste?.items?.length) {
      return 0;
    }
    const existingWasteItem = waste.items.find((entry: any) => entry?.id?.toString() === wasteItemId.toString());
    return Number(existingWasteItem?.quantity || 0);
  };

  const getExistingWasteVariantQuantity = (wasteItemId: string | undefined, variantId: string): number => {
    if (!wasteItemId || !variantId || !waste?.items?.length) {
      return 0;
    }
    const existingWasteItem: any = waste.items.find((entry: any) => entry?.id?.toString() === wasteItemId.toString());
    if (!existingWasteItem?.variants?.length) {
      return 0;
    }
    const existingVariant = existingWasteItem.variants.find((entry: any) => {
      return entry?.variant?.id?.toString() === variantId.toString();
    });
    return Number(existingVariant?.quantity || 0);
  };

  const adjustProductStoreStock = async (storeId: any, productId: any, deltaWasteQuantity: number) => {
    if (!deltaWasteQuantity) {
      return;
    }

    const [rows] = await db.query(
      `SELECT * FROM ${Tables.product_store} WHERE store = $store AND product = $product`,
      {
        store: toRecordId(storeId),
        product: toRecordId(productId)
      }
    );

    if (!rows?.length) {
      return;
    }

    const existingQuantity = Number(rows[0].quantity || 0);
    await db.merge(toRecordId(rows[0].id), {
      quantity: existingQuantity - deltaWasteQuantity
    });
  };

  const adjustProductVariantStoreStock = async (storeId: any, variantId: any, deltaWasteQuantity: number) => {
    if (!deltaWasteQuantity) {
      return;
    }

    const [rows] = await db.query(
      `SELECT * FROM ${Tables.product_variant_store} WHERE store = $store AND variant = $variant LIMIT 1`,
      {
        store: toRecordId(storeId),
        variant: toRecordId(variantId)
      }
    );

    if (!rows?.length) {
      return;
    }

    const existingQuantity = Number(rows[0].quantity || 0);
    await db.merge(toRecordId(rows[0].id), {
      quantity: existingQuantity - deltaWasteQuantity
    });
  };

  const saveWaste = async (values: any) => {
    setSaving(true);
    try {
      if (!values?.store?.value) {
        notify({
          type: "error",
          description: "Please select a store"
        });
        return;
      }

      const itemRecordIds = [];
      const submittedItems: any[] = values.items || [];
      const selectedStoreId = values.store.value;
      const existingItemById = new Map((waste?.items || []).map((item) => [item.id?.toString(), item]));

      if (waste?.items?.length) {
        const submittedIds = new Set(
          submittedItems
            .filter((item: any) => item?.waste_item_id)
            .map((item: any) => item.waste_item_id.toString())
        );
        const removedItems = waste.items.filter((item) => !submittedIds.has(item.id.toString()));

        for (const removedItem of removedItems) {
          await adjustProductStoreStock(selectedStoreId, removedItem.item?.id, -Number(removedItem.quantity || 0));
          for (const variantEntry of (removedItem as any).variants || []) {
            await adjustProductVariantStoreStock(selectedStoreId, variantEntry.variant?.id, -Number(variantEntry.quantity || 0));
            if (variantEntry?.id) {
              await db.delete(toRecordId(variantEntry.id));
            }
          }
          await db.delete(toRecordId(removedItem.id));
        }
      }

      for (const submittedItem of submittedItems) {
        const existingItem = submittedItem.waste_item_id
          ? existingItemById.get(submittedItem.waste_item_id.toString())
          : undefined;
        const previousItemQuantity = Number(existingItem?.quantity || 0);
        const currentItemQuantity = Number(submittedItem.quantity || 0);
        await adjustProductStoreStock(selectedStoreId, submittedItem.item.id, currentItemQuantity - previousItemQuantity);

        const existingVariantMap = new Map(
          ((existingItem as any)?.variants || []).map((variantEntry: any) => [variantEntry.variant?.id?.toString(), Number(variantEntry.quantity || 0)])
        );
        const submittedVariantIds = new Set<string>();

        for (const variantItem of (submittedItem.variants || [])) {
          const variantId = variantItem.variant.id.toString();
          submittedVariantIds.add(variantId);
          const previousVariantQuantity = Number(existingVariantMap.get(variantId) || 0);
          const currentVariantQuantity = Number(variantItem.quantity || 0);
          await adjustProductVariantStoreStock(selectedStoreId, variantItem.variant.id, currentVariantQuantity - previousVariantQuantity);
        }

        for (const [variantId, oldVariantQuantity] of Array.from(existingVariantMap.entries())) {
          const variantIdValue = String(variantId);
          if (!submittedVariantIds.has(variantIdValue)) {
            await adjustProductVariantStoreStock(selectedStoreId, variantIdValue, 0 - Number(oldVariantQuantity || 0));
          }
        }

        const existingVariantByVariantId = new Map<string, any>();
        for (const variantEntry of ((existingItem as any)?.variants || [])) {
          const variantId = variantEntry?.variant?.id?.toString();
          if (variantId) {
            existingVariantByVariantId.set(variantId, variantEntry);
          }
        }

        const variantRecordIds = [];
        const submittedPositiveVariantIds = new Set<string>();

        for (const variantItem of (submittedItem.variants || [])) {
          const variantId = variantItem?.variant?.id?.toString();
          const variantQuantity = Number(variantItem?.quantity || 0);
          if (!variantId || variantQuantity <= 0) {
            continue;
          }

          submittedPositiveVariantIds.add(variantId);
          const existingVariantRecord = existingVariantByVariantId.get(variantId);
          const variantPayload = {
            variant: toRecordId(variantId),
            quantity: variantQuantity
          };

          if (existingVariantRecord?.id) {
            await db.merge(toRecordId(existingVariantRecord.id), variantPayload);
            variantRecordIds.push(toRecordId(existingVariantRecord.id));
          } else {
            const [createdVariantRecord] = await db.insert("waste_item_variant", variantPayload);
            variantRecordIds.push(createdVariantRecord.id);
          }
        }

        for (const [variantId, existingVariantRecord] of Array.from(existingVariantByVariantId.entries())) {
          if (!submittedPositiveVariantIds.has(variantId) && existingVariantRecord?.id) {
            await db.delete(toRecordId(existingVariantRecord.id));
          }
        }

        const itemPayload = {
          item: toRecordId(submittedItem.item.id),
          quantity: Number(submittedItem.quantity),
          comments: submittedItem.comments || null,
          variants: variantRecordIds,
          // source: submittedItem.source || null
        };

        if (submittedItem.waste_item_id) {
          await db.merge(toRecordId(submittedItem.waste_item_id), itemPayload);
          const currentItemId = toRecordId(submittedItem.waste_item_id);
          itemRecordIds.push(currentItemId);

          for (const variantRecordId of variantRecordIds) {
            await db.merge(variantRecordId, {
              waste_item: currentItemId
            });
          }
        } else {
          const [createdItem] = await db.insert(Tables.waste_item, itemPayload);
          itemRecordIds.push(createdItem.id);

          for (const variantRecordId of variantRecordIds) {
            await db.merge(variantRecordId, {
              waste_item: createdItem.id
            });
          }
        }
      }

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

      const autoInvoiceNumber = Number(values.invoice_number);
      const invoiceNumber = Number.isFinite(autoInvoiceNumber) && autoInvoiceNumber > 0
        ? autoInvoiceNumber
        : await fetchNextInvoiceNumber();

      const wastePayload: any = {
        created_at: DateTime.fromFormat(values.created_at, "yyyy-MM-dd'T'HH:mm").toJSDate(),
        invoice_number: invoiceNumber,
        purchase: values.purchase ? toRecordId(values.purchase.value) : null,
        store: toRecordId(selectedStoreId),
        items: itemRecordIds,
        documents: documentRecordIds
      };

      let wasteRecordId: any;
      if (waste?.id) {
        await db.merge(toRecordId(waste.id), wastePayload);
        wasteRecordId = toRecordId(waste.id);
      } else {
        const [createdWaste] = await db.insert(Tables.waste, {
          ...wastePayload,
          created_by: toRecordId(user?.id)
        });
        wasteRecordId = createdWaste.id;
      }

      for (const itemId of itemRecordIds) {
        await db.merge(itemId, {
          waste: wasteRecordId
        });
      }

      closeModal();
    } catch (error: any) {
      notify({
        type: "error",
        description: error?.message || "Failed to save waste"
      });
      throw error;
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={modal}
      size="full"
      onClose={closeModal}
      title={operation === "create" ? "Create waste" : "Update waste"}
    >
      <form onSubmit={handleSubmit(saveWaste)}>
        <div className="grid lg:grid-cols-5 gap-4 mb-4 md:grid-cols-2 sm:grid-cols-1">
          <div>
            <label htmlFor="created_at">Date</label>
            <Controller
              name="created_at"
              control={control}
              render={({field}) => (
                <Input
                  {...field}
                  id="created_at"
                  type="datetime-local"
                  className="w-full"
                  hasError={hasErrors(errors.created_at)}
                />
              )}
            />
            {getErrors(errors.created_at)}
          </div>
          <div>
            <label htmlFor="invoice_number">Invoice #</label>
            <Controller
              name="invoice_number"
              control={control}
              render={({field}) => (
                <Input
                  {...field}
                  id="invoice_number"
                  type="number"
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
              name="purchase"
              control={control}
              render={(props) => (
                <ReactSelect
                  id="purchase"
                  isClearable
                  isLoading={purchasesLoading}
                  value={props.field.value}
                  onChange={props.field.onChange}
                  options={(purchases?.data || []).map((purchase) => ({
                    label: `${purchase.purchase_number}`,
                    value: purchase.id
                  }))}
                />
              )}
            />
          </div>
          <div>
            <label htmlFor="store">Store</label>
            <Controller
              name="store"
              control={control}
              render={(props) => (
                <ReactSelect
                  id="store"
                  value={props.field.value}
                  onChange={props.field.onChange}
                  options={(stores?.data || []).map((entry) => ({
                    label: entry.name,
                    value: entry.id
                  }))}
                  isClearable={false}
                  isDisabled={operation === "update"}
                />
              )}
            />
            {getErrors(errors.store)}
          </div>
          <div>
            <label htmlFor="add_item">Add item</label>
            <ReactSelect
              id="add_item"
              className="rs-__container flex-grow"
              isLoading={productsLoading}
              options={productOptions}
              onChange={(option) => {
                if (option) {
                  addItem(option.value);
                  setValue("add_item", null);
                }
              }}
              value={null}
            />
          </div>
        </div>

        {errors.items?.message && (
          <div className="alert alert-danger mb-3">{errors.items.message as string}</div>
        )}

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
                      <FontAwesomeIcon icon={faTrash}/>
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
                      <FontAwesomeIcon icon={faTrash}/>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-5 gap-3 mb-2">
          <div className="font-bold">Item</div>
          <div className="font-bold">Quantity</div>
          <div className="font-bold">Unit</div>
          {/* <div className="font-bold">Source</div> */}
          <div className="font-bold">Comments</div>
          <div className="font-bold">Remove</div>
        </div>

        {fields.map((item: any, index) => (
          <React.Fragment key={item.id}>
            <div className="grid grid-cols-5 gap-3 mb-2 items-start hover:bg-gray-100 p-1">
              <div>
                <input type="hidden" {...register(`items.${index}.waste_item_id`)} defaultValue={item.waste_item_id}/>
                {selectedItems[index]?.item?.name || item?.item?.name}
              </div>
              <div>
              {(() => {
                const product = selectedItems[index]?.item || item?.item;
                const availableStock = getProductAvailableStock(product, selectedStoreId);
                const existingWasteQuantity = getExistingWasteItemQuantity(item.waste_item_id);
                const maxAllowedQuantity = availableStock + existingWasteQuantity;

                return (
                  <>
                    <Controller
                      name={`items.${index}.quantity`}
                      control={control}
                      defaultValue={item.quantity || 1}
                      rules={{
                        validate: (value) => {
                          const numericValue = Number(value || 0);
                          if (numericValue < 0) {
                            return ValidationMessage.Positive;
                          }
                          if (numericValue > maxAllowedQuantity) {
                            return `Max available stock is ${maxAllowedQuantity}`;
                          }
                          return true;
                        }
                      }}
                      render={({field}) => (
                        <Input
                          {...field}
                          type="number"
                          className="w-full"
                          hasError={hasErrors((errors as any)?.items?.[index]?.quantity)}
                        />
                      )}
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      Available in stock: {availableStock}
                    </div>
                    {getErrors((errors as any)?.items?.[index]?.quantity)}
                  </>
                );
              })()}
              </div>
              <div>{selectedItems[index]?.item?.purchase_unit || item?.item?.purchase_unit || "-"}</div>
              <div>
                <Controller
                  name={`items.${index}.comments`}
                  control={control}
                  defaultValue={item.comments || ""}
                  render={({field}) => (
                    <Input
                      {...field}
                      className="w-full"
                      hasError={hasErrors((errors as any)?.items?.[index]?.comments)}
                    />
                  )}
                />
                {getErrors((errors as any)?.items?.[index]?.comments)}
              </div>
              <div>
                <ConfirmAlert
                  onConfirm={() => remove(index)}
                  title={`Remove ${selectedItems[index]?.item?.name || item?.item?.name}?`}
                  confirmText="Remove"
                >
                  <button className="btn btn-danger" type="button" tabIndex={-1}>
                    <FontAwesomeIcon icon={faTrash}/>
                  </button>
                </ConfirmAlert>
              </div>
            </div>
            {!!selectedItems[index]?.variants?.length && (
              <div className="mb-3 border border-gray-200 rounded p-2 bg-gray-50">
                <div className="grid grid-cols-4 gap-3 mb-2 font-semibold">
                  <div>Variant</div>
                  <div>Variant waste quantity</div>
                  <div>Unit</div>
                  <div>Remove</div>
                </div>
                {selectedItems[index].variants.map((variantItem: any, variantIndex: number) => (
                  <div className="grid grid-cols-4 gap-3 mb-1 items-center" key={`${item.id}_variant_${variantIndex}`}>
                    <div>
                      <input type="hidden" {...register(`items.${index}.variants.${variantIndex}.variant.id`)}
                             defaultValue={variantItem?.variant?.id}/>
                      {variantItem?.variant?.attribute_value || "-"}
                    </div>
                    <div>
                      {(() => {
                        const variant = variantItem?.variant;
                        const availableStock = getVariantAvailableStock(variant, selectedStoreId);
                        const existingWasteQuantity = getExistingWasteVariantQuantity(item.waste_item_id, variant?.id?.toString());
                        const maxAllowedQuantity = availableStock + existingWasteQuantity;

                        return (
                          <>
                            <Controller
                              name={`items.${index}.variants.${variantIndex}.quantity`}
                              control={control}
                              defaultValue={variantItem.quantity || 0}
                              rules={{
                                validate: (value) => {
                                  const numericValue = Number(value || 0);
                                  if (numericValue < 0) {
                                    return ValidationMessage.Positive;
                                  }
                                  if (numericValue > maxAllowedQuantity) {
                                    return `Max available stock is ${maxAllowedQuantity}`;
                                  }
                                  return true;
                                }
                              }}
                              render={({field}) => (
                                <Input
                                  {...field}
                                  type="number"
                                  className="w-full"
                                  hasError={hasErrors((errors as any)?.items?.[index]?.variants?.[variantIndex]?.quantity)}
                                />
                              )}
                            />
                            <div className="text-xs text-gray-500 mt-1">
                              Available in stock: {availableStock}
                            </div>
                            {getErrors((errors as any)?.items?.[index]?.variants?.[variantIndex]?.quantity)}
                          </>
                        );
                      })()}
                    </div>
                    <div>{selectedItems[index]?.item?.purchase_unit || item?.item?.purchase_unit || "-"}</div>
                    <div>
                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={() => removeVariantRow(index, variantIndex)}
                        title="Remove variant"
                      >
                        <FontAwesomeIcon icon={faTrash}/>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </React.Fragment>
        ))}

        <div className="mt-4">
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? "Saving..." : operation === "create" ? "Create waste" : "Update waste"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
