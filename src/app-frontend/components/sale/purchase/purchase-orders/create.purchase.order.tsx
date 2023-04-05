import {Input} from "../../../input";
import {Trans} from "react-i18next";
import {Controller, useFieldArray, useForm} from "react-hook-form";
import {ReactSelect} from "../../../../../app-common/components/input/custom.react.select";
import {Button} from "../../../button";
import React, {FunctionComponent, useEffect, useState} from "react";
import {Supplier} from "../../../../../api/model/supplier";
import {
  PRODUCT_LIST,
  PURCHASE_ORDER_CREATE,
  PURCHASE_ORDER_EDIT,
  PURCHASE_ORDER_LIST,
  SUPPLIER_LIST
} from "../../../../../api/routing/routes/backend.app";
import {fetchJson, jsonRequest} from "../../../../../api/request/request";
import {UnprocessableEntityException} from "../../../../../lib/http/exception/http.exception";
import {ConstraintViolation} from "../../../../../lib/validator/validation.result";
import {useLoadList} from "../../../../../api/hooks/use.load.list";
import {PurchaseOrder} from "../../../../../api/model/purchase.order";
import {useSelector} from "react-redux";
import {getStore} from "../../../../../duck/store/store.selector";
import {Product} from "../../../../../api/model/product";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faRemove} from "@fortawesome/free-solid-svg-icons";
import {DateTime} from "luxon";

export interface CreatePurchaseOrderProps{
  setOperation: (operation: string) => void;
  operation: string;
  onClose: () => void;
}

export const CreatePurchaseOrder: FunctionComponent<CreatePurchaseOrderProps> = ({
  setOperation, operation
}) => {
  const store = useSelector(getStore);

  const {register, handleSubmit, setError, formState: {errors}, reset, control} = useForm();
  const {fields, append, remove} = useFieldArray({
    control: control,
    name: 'items'
  });

  const [creating, setCreating] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [items, setItems] = useState<Product[]>([]);


  const createPurchaseOrder = async (values: any) => {
    console.log(values)
    setCreating(true);
    try {
      let url: string;
      if (values.id) {
        url = PURCHASE_ORDER_EDIT.replace(':id', values.id);
      } else {
        delete values.id;
        url = PURCHASE_ORDER_CREATE;
      }

      values.store = store?.id;
      values.createdAt = DateTime.now().toSQL();
      if(values.items){
        values.items = values.items.map((item: any) => item.id);
      }

      await fetchJson(url, {
        method: 'POST',
        body: JSON.stringify({
          ...values,
        })
      });

      resetForm();
      setOperation('create');

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
      items: null
    });
  };

  useEffect(() => {
    loadSuppliers();
    loadProducts();
  }, []);

  return (
    <>
      <h3 className="text-xl">Create Purchase Order</h3>
      <form onSubmit={handleSubmit(createPurchaseOrder)} className="mb-5">
        <input type="hidden" {...register('id')}/>
        <div className="grid lg:grid-cols-4 gap-4 mb-3 md:grid-cols-3 sm:grid-cols-1">
          <div>
            <label htmlFor="createdAt">Date</label>
            <Input {...register('createdAt')} type="datetime-local" id="createdAt" className="w-full"/>
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
            <Input {...register('poNumber')} id="poNumber" className="w-full"/>
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
                <ReactSelect
                  onChange={props.field.onChange}
                  value={props.field.value}
                  options={suppliers.map(item => {
                    return {
                      label: item.name,
                      value: item.id
                    }
                  })}
                  id="supplier"
                  isClearable={true}
                />
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
        </div>
        <div>
          <Button type="button" variant="secondary" onClick={() => append({
            item: null,
            quantity: 1,
            comments: '',
          })} className="my-3">Add item</Button>
        </div>
          {fields.map((item: any, index) => (
            <div key={item.id} className="grid md:grid-cols-4 sm:grid-cols-1 gap-4 pb-3 hover:bg-gray-100">
              <div>
                <div>
                  <label htmlFor="items">Select item</label>
                  <Controller
                    render={(props) => (
                      <ReactSelect
                        onChange={props.field.onChange}
                        value={props.field.value}
                        options={items.map(item => {
                          return {
                            label: item.name,
                            value: item.id,
                            data: JSON.stringify(item),
                            id: item['@id']
                          }
                        })}
                        id="items"
                      />
                    )}
                    name={`items.${index}.item`}
                    control={control}
                  />

                  {errors.items && (
                    <div className="text-danger-500 text-sm">
                      <Trans>
                        {errors.items.message}
                      </Trans>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label htmlFor="quantity">Quantity</label>
                <input className="form-control w-full" name="quantity" defaultValue={item.quantity} />
              </div>
              <div>
                <label htmlFor="comments">Comments</label>
                <input className="form-control w-full" name="comments" defaultValue={item.comments} />
              </div>
              <div className="flex flex-col items-start">
                <label>Remove line?</label>
                <Button type="button" variant="danger" onClick={() => remove(index)}>
                  <FontAwesomeIcon  icon={faRemove} />
                </Button>
              </div>
            </div>
          ))}
        <div>
          <label htmlFor="" className="md:block w-full sm:hidden">&nbsp;</label>
          <Button variant="primary" type="submit" disabled={creating}>
            {creating ? 'Saving...' : (operation === 'create' ? 'Add purchase order' : 'Update purchase order')}
          </Button>

          {operation === 'update' && (
            <Button
              variant="secondary"
              className="ml-3"
              type="button"
              onClick={() => {
                setOperation('create');
                resetForm();
              }}
            >Cancel</Button>
          )}
        </div>
      </form>
    </>
  );
}
