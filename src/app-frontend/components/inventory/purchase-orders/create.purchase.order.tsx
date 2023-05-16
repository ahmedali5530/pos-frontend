import {Input} from "../../../../app-common/components/input/input";
import {Trans} from "react-i18next";
import {Controller, useFieldArray, useForm} from "react-hook-form";
import {ReactSelect} from "../../../../app-common/components/input/custom.react.select";
import {Button} from "../../../../app-common/components/input/button";
import React, {FunctionComponent, useCallback, useEffect, useState} from "react";
import {Supplier} from "../../../../api/model/supplier";
import {
  PRODUCT_LIST,
  PURCHASE_ORDER_CREATE,
  PURCHASE_ORDER_EDIT,
  SUPPLIER_LIST
} from "../../../../api/routing/routes/backend.app";
import {fetchJson, jsonRequest} from "../../../../api/request/request";
import {UnprocessableEntityException} from "../../../../lib/http/exception/http.exception";
import {ConstraintViolation} from "../../../../lib/validator/validation.result";
import {useSelector} from "react-redux";
import {getStore} from "../../../../duck/store/store.selector";
import {Product} from "../../../../api/model/product";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPlus, faRemove} from "@fortawesome/free-solid-svg-icons";
import {DateTime} from "luxon";
import { Modal } from "../../../../app-common/components/modal/modal";
import classNames from "classnames";
import {hasErrors} from "../../../../lib/error/error";
import {SelectedItem} from "../purchase/purchase";
import {PurchaseOrder} from "../../../../api/model/purchase.order";
import {CreateSupplier} from "../supplier/create.supplier";

export interface CreatePurchaseOrderProps {
  operation: string;
  onClose: () => void;
  showModal: boolean;
  purchaseOrder?: PurchaseOrder;
}

export const CreatePurchaseOrder: FunctionComponent<CreatePurchaseOrderProps> = ({
  operation, showModal, onClose, purchaseOrder
}) => {
  const store = useSelector(getStore);

  const {register, handleSubmit, setError, formState: {errors}, reset, control, watch, getValues} = useForm();
  const {fields, append, remove} = useFieldArray({
    control: control,
    name: 'items'
  });

  const [creating, setCreating] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [items, setItems] = useState<Product[]>([]);
  const [modal, setModal] = useState(false);
  const [supplierModal, setSupplierModal] = useState(false);

  useEffect(() => {
    setModal(showModal);
  }, [showModal]);

  useEffect(() => {
    if(purchaseOrder){
      reset({
        ...purchaseOrder,
        supplier: {
          label: purchaseOrder?.supplier?.name,
          value: purchaseOrder?.supplier?.["@id"]
        },
        createdAt: DateTime.fromISO(purchaseOrder.createdAt).toFormat("yyyy-MM-dd'T'HH:mm"),
        items: purchaseOrder.items.map(purchaseItem => {
          return {
            item: purchaseItem.item,
            quantity: purchaseItem.quantity,
            cost: purchaseItem.price,
            comments: purchaseItem.comments
          }
        })
      });
    }
  }, [purchaseOrder]);


  const createPurchaseOrder = async (values: any) => {
    setCreating(true);
    try {
      let url: string, method: string = 'POST';
      if (values.id) {
        method = 'PUT';
        url = PURCHASE_ORDER_EDIT.replace(':id', values.id);
        if(values.store){
          values.store = values.store['@id'];
        }

      } else {
        delete values.id;
        url = PURCHASE_ORDER_CREATE;
        values.store = `/api/stores/${store?.id}`;
      }


      values.createdAt = DateTime.now().toSQL();
      if (values.items) {
        values.items = values.items.map((item: SelectedItem) => {
          return {
            item: item.item["@id"],
            quantity: item.quantity,
            price: item.cost.toString(),
            comments: item.comments,
            unit: item.item.purchaseUnit
          };
        });
      }

      if(values.supplier){
        values.supplier = values.supplier.value;
      }

      await fetchJson(url, {
        method: method,
        body: JSON.stringify({
          ...values,
        })
      });

      onModalClose();
    } catch (exception: any) {
      if (exception instanceof UnprocessableEntityException) {
        const e = await exception.response.json();
        e.violations.forEach((item: ConstraintViolation) => {
          setError(item.propertyPath, {
            message: item.message,
            type: 'server'
          });
        });

        return false;
      }

      throw exception;
    } finally {
      setCreating(false);
    }
  };

  const loadSuppliers = async () => {
    try {
      const response = await jsonRequest(`${SUPPLIER_LIST}?itemsPerPage=9999999`);
      const json = await response.json();

      setSuppliers(json['hydra:member']);
    } catch (e) {
      throw e;
    } finally {

    }
  }

  const loadProducts = async () => {
    try {
      const response = await jsonRequest(`${PRODUCT_LIST}?itemsPerPage=9999999`);
      const json = await response.json();

      setItems(json['hydra:member']);
    } catch (e) {
      throw e;
    } finally {

    }
  }

  const resetForm = () => {
    reset({
      id: null,
      store: null,
      createdAt: null,
      poNumber: null,
      items: [],
      supplier: null
    });
  };

  useEffect(() => {
    loadSuppliers();
    loadProducts();
  }, []);

  const addSelectedItem = (itemId: number) => {
    const item = items.find(item => item.id === itemId);
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
        size="full" title={operation === 'create' ? "Create purchase order" : 'Update purchase order'}
        onClose={onModalClose}
      >
        <form onSubmit={handleSubmit(createPurchaseOrder)} className="mb-5">
          <input type="hidden" {...register('id')}/>
          <div className="grid lg:grid-cols-4 gap-4 mb-3 md:grid-cols-3 sm:grid-cols-1">
            <div>
              <label htmlFor="createdAt">Date</label>
              <Input {...register('createdAt', {required: true})} type="datetime-local" id="createdAt" className={
                classNames(
                  "w-full"
                )
              } hasError={hasErrors(errors.createdAt)}/>
              {errors.createdAt && (
                <div className="text-danger-500 text-sm">
                  <Trans>
                    {errors.createdAt.message}
                  </Trans>
                </div>
              )}
            </div>
            <div>
              <label htmlFor="poNumber">PO Number</label>
              <Input {...register('poNumber', {required: true})} id="poNumber" className="w-full" hasError={hasErrors(errors.poNumber)}/>
              {errors.poNumber && (
                <div className="text-danger-500 text-sm">
                  <Trans>
                    {errors.poNumber.message}
                  </Trans>
                </div>
              )}
            </div>
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
                          value: item['@id']
                        }
                      })}
                      id="supplier"
                      isClearable={true}
                      className="rs-__container flex-grow"
                    />
                    <button className="btn btn-primary" onClick={() => setSupplierModal(true)}>
                      <FontAwesomeIcon icon={faPlus} />
                    </button>
                  </div>
                )}
                name="supplier"
                control={control}
                rules={{required: true}}
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
              <label htmlFor="items">Items</label>
              <ReactSelect
                onChange={(value) => {
                  if (value) {
                    addSelectedItem(value.value);
                  }
                }}
                options={items.map(item => {
                  return {
                    label: item.name,
                    value: item.id
                  }
                })}
                id="items"
                closeMenuOnSelect={false}
              />
            </div>
          </div>
          <div className="mb-3">
            <div className="grid grid-cols-6 mb-1 gap-3">
              <div className="font-bold">Item</div>
              <div className="font-bold">Quantity</div>
              <div className="font-bold">Unit Cost</div>
              <div className="font-bold">Total Cost</div>
              <div className="font-bold">Comments</div>
              <div className="font-bold">Remove?</div>
            </div>
            {fields.map((item: any, index) => (
              <div key={item.id} className="grid grid-cols-6 hover:bg-gray-100 gap-3 mb-3">
                <div>
                  {item.item.name}
                </div>
                <div>
                  <input
                    type="number"
                    className="form-control w-full"
                    {...register(`items.${index}.quantity`)}
                    defaultValue={item.quantity}
                  />
                </div>
                <div>{item.cost}</div>
                <div>{lineTotal(index)}</div>
                <div>
                  <input
                    className="form-control w-full"
                    {...register(`items.${index}.comments`)}
                    defaultValue={item.comments}
                  />
                </div>
                <div className="flex flex-col items-start">
                  <Button type="button" variant="danger" onClick={() => remove(index)}>
                    <FontAwesomeIcon icon={faRemove}/>
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div>
            <label htmlFor="" className="md:block w-full sm:hidden">&nbsp;</label>
            <Button variant="primary" type="submit" disabled={creating}>
              {creating ? 'Saving...' : (operation === 'create' ? 'Add purchase order' : 'Update purchase order')}
            </Button>
          </div>
        </form>
      </Modal>

      <CreateSupplier operation={'create'} showModal={supplierModal} onClose={() => {
        setSupplierModal(false);
        loadSuppliers();
      }} />
    </>
  );
}
