import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {Input} from "../../input";
import {Trans} from "react-i18next";
import {Controller, useFieldArray, useForm} from "react-hook-form";
import {ReactSelect} from "../../../../app-common/components/input/custom.react.select";
import {Product} from "../../../../api/model/product";
import {PurchaseOrder} from "../../../../api/model/purchase.order";
import {jsonRequest} from "../../../../api/request/request";
import {
  PRODUCT_LIST,
  PURCHASE_CREATE,
  PURCHASE_ORDER_LIST,
  SUPPLIER_LIST
} from "../../../../api/routing/routes/backend.app";
import {Supplier} from "../../../../api/model/supplier";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faRemove} from "@fortawesome/free-solid-svg-icons";
import { Button } from '../../button';
import {Switch} from "../../../../app-common/components/input/switch";
import {getStore} from "../../../../duck/store/store.selector";
import {useSelector} from "react-redux";
import {getAuthorizedUser} from "../../../../duck/auth/auth.selector";

export interface SelectedItem {
  item: Product;
  quantity: number;
  comments: string;
  cost: number;
}

export const Purchase = () => {
  const store = useSelector(getStore);
  const user = useSelector(getAuthorizedUser);

  const {register, handleSubmit, setError, formState: {errors}, reset, control, watch, getValues} = useForm();
  const {fields, append, remove} = useFieldArray({
    control: control,
    name: 'items'
  });

  const [creating, setCreating] = useState(false);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [items, setItems] = useState<Product[]>([]);

  const itemsList = useMemo(() => {
    if(watch('supplier')){
      return items.filter(item => {
        const supplierIds = item.suppliers.map(supplier => supplier.id);
        return supplierIds.includes(watch('supplier').value);
      });
    }

    return items;
  }, [items, watch('supplier')]);

  console.log(user);

  const savePurchase = async (values: any) => {
    setCreating(true);
    try{
      values.store = `/api/stores/${store?.id}`;
      if(values.items){
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
      values.purchasedBy = `/api/users/${user?.id}`;

      const response = await jsonRequest(PURCHASE_CREATE, {
        method: 'POST',
        body: JSON.stringify(values)
      });
      const json = await response.json();

      resetForm();
    }catch(e){
      throw e;
    } finally {
      setCreating(false);
    }

  }

  const loadPurchaseOrders = async () => {
    try {
      const response = await jsonRequest(`${PURCHASE_ORDER_LIST}?itemsPerPage=9999999`);
      const json = await response.json();

      setPurchaseOrders(json['hydra:member']);
    } catch (e) {
      throw e;
    } finally {

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
      stores: null,
      items: [],
      createdAt: null,
      supplier: null,
      purchaseOrder: null,

    });
  };

  useEffect(() => {
    // resetForm();
    loadPurchaseOrders();
    loadSuppliers();
    loadProducts();
  }, []);

  const itemsMode = useMemo(() => {
    const value = watch('purchaseMode');
    return !!(value && value.value === 'items');
  }, [watch('purchaseMode')]);

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

  const totalCost = useMemo(() => {
    return addedItems.reduce((prev: number, item: any) => prev + (parseFloat(item.cost) * parseFloat(item.quantity)), 0)
  }, [itemsWatch]);

  const lineTotal = useCallback((index: number) => {
    const item: any = addedItems[index];

    return parseFloat(item.quantity) * parseFloat(item.cost);
  }, [itemsWatch, addedItems]);

  return (
    <>
      <h3 className="text-xl">Create Purchase</h3>
      <form onSubmit={handleSubmit(savePurchase)}>
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
            <label htmlFor="purchase-mode">Purchase using</label>
            <Controller
              render={(props) => (
                <ReactSelect
                  onChange={props.field.onChange}
                  value={props.field.value}
                  options={[
                    {label: 'Purchase order', value: 'purchaseOrder'},
                    {label: 'Items list', value: 'items'},
                  ]}
                  defaultValue={{label: 'Purchase order', value: 'purchaseOrder'}}
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
          {itemsMode ? (
            <>
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
                          value: item["@id"]
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
              <div>
                <label htmlFor="items">Select items</label>
                <ReactSelect
                  onChange={(value) => {
                    if(value) {
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
                />
                {errors.items && (
                  <div className="text-danger-500 text-sm">
                    <Trans>
                      {errors.items.message}
                    </Trans>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div>
              <label htmlFor="purchaseOrder">Select a Purchase Order</label>
              <Controller
                render={(props) => (
                  <ReactSelect
                    onChange={props.field.onChange}
                    value={props.field.value}
                    options={purchaseOrders.map(item => {
                      return {
                        label: item.createdAt,
                        value: item.id
                      }
                    })}
                    id="purchaseOrder"
                  />
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
                  Update item quantities?
                </Switch>
              )}
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
                  Update item prices?
                </Switch>
              )}
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
          <div className="grid grid-cols-6 mb-1 gap-3">
            <div className="font-bold">Item</div>
            <div className="font-bold">Quantity</div>
            <div className="font-bold">Unit Cost</div>
            <div className="font-bold">Total Cost</div>
            <div className="font-bold">Comments</div>
            <div className="font-bold">Remove?</div>
          </div>
          {fields.map((item: any, index) => (
            <div className="grid grid-cols-6 hover:bg-gray-100 gap-3 mb-3" key={item.id}>
              <div className="hover:bg-gray-200">{item.item.name}</div>
              <div className="hover:bg-gray-200">
                <input className="form-control w-full" {...register(`items.${index}.quantity`)} defaultValue={item.quantity} />
              </div>
              <div className="hover:bg-gray-200">
                <input className="form-control w-full" {...register(`items.${index}.cost`)} defaultValue={item.cost} />
              </div>
              <div className="hover:bg-gray-200">{lineTotal(index)}</div>
              <div className="hover:bg-gray-200">
                <input className="form-control w-full" {...register(`items.${index}.comments`)} defaultValue={item.comments} />
              </div>
              <div className="hover:bg-gray-200">
                <button className="btn btn-danger" type="button" onClick={() => remove(index)}>
                  <FontAwesomeIcon icon={faRemove} />
                </button>
              </div>
            </div>
          ))}
          <div className="grid grid-cols-6 gap-3">
            <div className="p-3 hover:bg-gray-200"><strong>Total Items:</strong> {fields.length}</div>
            <div className="p-3 hover:bg-gray-200"><strong>Total Quantity:</strong> {totalQuantity}</div>
            <div></div>
            <div className="p-3 hover:bg-gray-200"><strong>Total Cost:</strong> {totalCost}</div>
          </div>
        </div>
        <Button type="submit" disabled={creating} className="btn btn-primary">Add Purchase</Button>
      </form>
    </>
  );
}
