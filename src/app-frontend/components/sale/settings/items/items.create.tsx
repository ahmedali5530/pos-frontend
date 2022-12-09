import {Controller, useForm} from "react-hook-form";
import React, {useEffect, useState} from "react";
import {
  BRAND_LIST,
  CATEGORY_LIST, DEPARTMENT_LIST,
  PRODUCT_CREATE,
  PRODUCT_GET, STORE_LIST,
  SUPPLIER_LIST, TAX_LIST
} from "../../../../../api/routing/routes/backend.app";
import {fetchJson, jsonRequest} from "../../../../../api/request/request";
import {UnprocessableEntityException} from "../../../../../lib/http/exception/http.exception";
import {ConstraintViolation} from "../../../../../lib/validator/validation.result";
import {Input} from "../../../input";
import {Trans} from "react-i18next";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faRefresh} from "@fortawesome/free-solid-svg-icons";
import {Button} from "../../../button";
import {Category} from "../../../../../api/model/category";
import {Product} from "../../../../../api/model/product";
import {ReactSelect} from "../../../../../app-common/components/input/custom.react.select";
import {ReactSelectOptionProps} from "../../../../../api/model/common";
import {Supplier} from "../../../../../api/model/supplier";
import {Brand} from "../../../../../api/model/brand";
import {withCurrency} from "../../../../../lib/currency/currency";
import classNames from "classnames";
import {getErrorClass} from "../../../../../lib/error/error";
import {Store} from "../../../../../api/model/store";
import {Department} from "../../../../../api/model/department";
import {ProductVariants} from "./products/variants";
import {CreateVariants} from "./products/create.variants";
import {Tax} from "../../../../../api/model/tax";
import {useAlert} from "react-alert";

interface ItemsCreateProps{
  setActiveTab: (tab: string) => void;
  operation: string;
  setOperation: (operation: string) => void;
  row?: Product;
  setRow: (row?: Product) => void;
}

export const CreateItem = ({
  setOperation, setActiveTab, operation, row, setRow
}: ItemsCreateProps) => {
  const useFormHook = useForm();
  const {register, handleSubmit, setError, formState: {errors}, reset, getValues, control} = useFormHook;
  const [creating, setCreating] = useState(false);
  const alert = useAlert();

  const createProduct = async (values: any) => {
    setCreating(true);
    try {
      let url = '';
      if (values.id) {
        url = PRODUCT_GET.replace(':id', values.id);
      } else {
        url = PRODUCT_CREATE;
      }

      if(values.categories){
        values.categories = values.categories.map((item: ReactSelectOptionProps) => item.value);
      }
      if(values.suppliers){
        values.suppliers = values.suppliers.map((item: ReactSelectOptionProps) => item.value);
      }
      if(values.brands){
        values.brands = values.brands.map((item: ReactSelectOptionProps) => item.value);
      }
      if(values.stores){
        values.stores = values.stores.map((item: ReactSelectOptionProps) => item.value);
      }
      if(values.department){
        values.department = values.department.value;
      }
      if(values.taxes){
        values.taxes = values.taxes.map((item: ReactSelectOptionProps) => item.value);
      }

      await fetchJson(url, {
        method: 'POST',
        body: JSON.stringify({
          ...values,
          purchaseUnit: 'Unit',
          saleUnit: 'Unit',
          baseQuantity: 1,
          quantity: 1000,
          isAvailable: true,
          isActive: true
        })
      });

      resetForm();
      setRow(undefined);
      setOperation('create');

    } catch (exception: any) {
      if (exception instanceof UnprocessableEntityException) {
        const e = await exception.response.json();
        if(e.violations){
          e.violations.forEach((item: ConstraintViolation) => {
            setError(item.propertyPath, {
              message: item.message,
              type: 'server'
            });
          });
        }

        if(e.errorMessage){
          alert.error(e.errorMessage);
        }

        return false;
      }

      throw exception;
    } finally {
      setCreating(false);
    }
  };

  const [categories, setCategories] = useState<Category[]>([]);
  const loadCategories = async () => {
    try {
      const response = await jsonRequest(CATEGORY_LIST);
      const json = await response.json();

      setCategories(json.list);
    } catch (e) {
      throw e;
    } finally {

    }
  };

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const loadSuppliers = async () => {
    try {
      const response = await jsonRequest(SUPPLIER_LIST);
      const json = await response.json();

      setSuppliers(json.list);
    } catch (e) {
      throw e;
    } finally {

    }
  };

  const [brands, setBrands] = useState<Brand[]>([]);
  const loadBrands = async () => {
    try {
      const response = await jsonRequest(BRAND_LIST);
      const json = await response.json();

      setBrands(json.list);
    } catch (e) {
      throw e;
    } finally {

    }
  };

  const [stores, setStores] = useState<Store[]>([]);
  const loadStores = async () => {
    try{
      const res = await fetchJson(STORE_LIST);
      setStores(res.list);
    }catch (e){
      throw e;
    }
  };

  const [department, setDepartment] = useState<Department[]>([]);
  const loadDepartments = async () => {
    try{
      const res = await fetchJson(DEPARTMENT_LIST);
      setDepartment(res.list);
    }catch (e){
      throw e;
    }
  };

  const [taxes, setTaxes] = useState<Tax[]>([]);
  const loadTaxes = async () => {
    try{
      const res = await fetchJson(TAX_LIST);
      setTaxes(res.list);
    }catch (e){
      throw e;
    }
  };

  useEffect(() => {
    loadCategories();
    loadSuppliers();
    loadBrands();
    loadStores();
    loadDepartments();
    loadTaxes();
  }, []);

  useEffect(() => {
    if(row) {
      reset({
        ...row,
        suppliers: row.suppliers.map(item => ({
          label: item.name,
          value: item.id
        })),
        brands: row.brands.map(item => ({
          label: item.name,
          value: item.id
        })),
        categories: row.categories.map(item => ({
          label: item.name,
          value: item.id
        })),
        stores: row.stores.map(item => ({
          label: item.name,
          value: item.id
        })),
        department: {
          label: row?.department?.name,
          value: row?.department?.id
        },
        taxes: row.taxes.map(item => ({
          label: `${item.name} ${item.rate}%`,
          value: item.id
        }))
      });
    }
  }, [row, reset]);

  const resetForm = () => {
    reset({
      barcode: null,
      basePrice: null,
      baseQuantity: null,
      categories: null,
      cost: null,
      createdAt: null,
      id: null,
      isActive: null,
      isAvailable: null,
      name: null,
      prices: null,
      quantity: null,
      sku: null,
      purchaseUnit: null,
      saleUnit: null,
      updatedAt: null,
      uuid: null,
      variants: [],
      suppliers: null,
      brands: null,
      stores: null,
      department: null,
      groups: [],
      taxes: null
    });
  };

  return (
    <form onSubmit={handleSubmit(createProduct)} className="mb-5">
      <input type="hidden" {...register('id')}/>
      <div className="grid grid-cols-4 gap-3 gap-y-2 mb-4">
        <div>
          <label htmlFor="department">Department</label>
          <Controller
            name="department"
            control={control}
            render={(props) => (
              <ReactSelect
                onChange={props.field.onChange}
                value={props.field.value}
                options={department.map(item => {
                  return {
                    label: item.name,
                    value: item.id
                  }
                })}
              />
            )}
          />

          {errors.department && (
            <div className="text-danger-500 text-sm">
              <Trans>
                {errors.department.message}
              </Trans>
            </div>
          )}
        </div>
        <div className="col-span-4"></div>
        <div>
          <label htmlFor="name">Name</label>
          <Input {...register('name')} id="name"
                 className={classNames(
                   "w-full",
                   getErrorClass(errors.name)
                 )}
          />
          {errors.name && (
            <div className="text-danger-500 text-sm">
              <Trans>
                {errors.name.message}
              </Trans>
            </div>
          )}
        </div>
        <div>
          <label htmlFor="barcode">Barcode</label>
          <div className="input-group">
            <Input {...register('barcode')} id="barcode"
                   className={classNames(
                     "w-full",
                     getErrorClass(errors.barcode)
                   )}
                   disabled={!!row}
            />
            {!row && (
              <button onClick={() => {
                reset({
                  ...getValues(),
                  barcode: Math.floor(Math.random() * 10000000000) + 1
                });
              }} className="btn btn-primary" type="button"
                      tabIndex={-1}>
                <FontAwesomeIcon icon={faRefresh}/>
              </button>
            )}

          </div>
          {errors.barcode && (
            <div className="text-danger-500 text-sm">
              <Trans>
                {errors.barcode.message}
              </Trans>
            </div>
          )}
        </div>
        <div className="col-span-4"></div>
        <div>
          <label htmlFor="basePrice">Sale price</label>
          <div className="input-group">
            <span className="input-addon">
              {withCurrency('')}
            </span>
            <Input {...register('basePrice')} id="basePrice" className={classNames(
              "w-full",
              getErrorClass(errors.name)
            )}/>
          </div>
          {errors.basePrice && (
            <div className="text-danger-500 text-sm">
              <Trans>
                {errors.basePrice.message}
              </Trans>
            </div>
          )}
        </div>
        <div>
          <label htmlFor="basePrice">Sale unit</label>
          <Input {...register('saleUnit')} id="saleUnit" className={classNames(
            "w-full",
            getErrorClass(errors.name)
          )}/>
          {errors.saleUnit && (
            <div className="text-danger-500 text-sm">
              <Trans>
                {errors.saleUnit.message}
              </Trans>
            </div>
          )}
        </div>
        <div>
          <label htmlFor="cost">Purchase price</label>
          <div className="input-group">
            <span className="input-addon">
              {withCurrency('')}
            </span>
            <Input {...register('cost')} id="cost" className={classNames(
              "w-full",
              getErrorClass(errors.name)
            )}/>
          </div>
          {errors.cost && (
            <div className="text-danger-500 text-sm">
              <Trans>
                {errors.cost.message}
              </Trans>
            </div>
          )}
        </div>
        <div>
          <label htmlFor="purchaseUnit">Purchase unit</label>
          <Input {...register('purchaseUnit')} id="purchaseUnit" className={classNames(
            "w-full",
            getErrorClass(errors.name)
          )}/>
          {errors.purchaseUnit && (
            <div className="text-danger-500 text-sm">
              <Trans>
                {errors.purchaseUnit.message}
              </Trans>
            </div>
          )}
        </div>
        <div className="col-span-4"></div>
        <div className="col-span-2">
          <label htmlFor="taxes">Taxes</label>
          <Controller
            name="taxes"
            render={(props) => (
              <ReactSelect
                options={taxes.map(item => ({
                  label: `${item.name} ${item.rate}%`,
                  value: item.id
                }))}
                onChange={props.field.onChange}
                value={props.field.value}
                isMulti
              />
            )}
            control={control}
          />
          {errors.taxes && (
            <div className="text-danger-500 text-sm">
              <Trans>
                {errors.taxes.message}
              </Trans>
            </div>
          )}
        </div>
        <div>
          <label htmlFor="stores">Stores</label>
          <Controller
            name="stores"
            control={control}
            render={(props) => (
              <ReactSelect
                onChange={props.field.onChange}
                value={props.field.value}
                options={stores.map(item => {
                  return {
                    label: item.name,
                    value: item.id
                  }
                })}
                isMulti
              />
            )}
          />

          {errors.stores && (
            <div className="text-danger-500 text-sm">
              <Trans>
                {errors.stores.message}
              </Trans>
            </div>
          )}
        </div>
        <div className="col-span-4 grid grid-cols-3 gap-3 gap-y-2">
          <div>
            <label htmlFor="categories">Categories</label>
            <Controller
              name="categories"
              render={(props) => (
                <ReactSelect
                  options={categories.map(item => ({
                    label: item.name,
                    value: item.id
                  }))}
                  onChange={props.field.onChange}
                  value={props.field.value}
                  isMulti
                />
              )}
              control={control}
            />
            {errors.categories && (
              <div className="text-danger-500 text-sm">
                <Trans>
                  {errors.categories.message}
                </Trans>
              </div>
            )}
          </div>
          <div>
            <label htmlFor="suppliers">Suppliers</label>
            <Controller
              name="suppliers"
              render={(props) => (
                <ReactSelect
                  options={suppliers.map(item => ({
                    label: item.name,
                    value: item.id
                  }))}
                  onChange={props.field.onChange}
                  value={props.field.value}
                  isMulti
                />
              )}
              control={control}
            />
            {errors.suppliers && (
              <div className="text-danger-500 text-sm">
                <Trans>
                  {errors.suppliers.message}
                </Trans>
              </div>
            )}
          </div>
          <div>
            <label htmlFor="brands">Brands</label>
            <Controller
              name="brands"
              render={(props) => (
                <ReactSelect
                  options={brands.map(item => ({
                    label: item.name,
                    value: item.id
                  }))}
                  onChange={props.field.onChange}
                  value={props.field.value}
                  isMulti
                />
              )}
              control={control}
            />
            {errors.brands && (
              <div className="text-danger-500 text-sm">
                <Trans>
                  {errors.brands.message}
                </Trans>
              </div>
            )}
          </div>
        </div>
        <div className="col-span-4">
          <h4 className="text-lg">Variants</h4>
        </div>
        <div className="col-span-4">
          {row ? (
            <ProductVariants useForm={useFormHook}/>
          ) : (
            <CreateVariants useForm={useFormHook} />
          )}
        </div>

        {/*TODO: add conditional prices*/}
        {/*<div className="col-span-4">*/}
        {/*  <h4 className="text-lg">Conditional prices</h4>*/}
        {/*</div>*/}
        {/*<div className="col-span-4"></div>*/}
      </div>

      <Button variant="primary" type="submit"
              disabled={creating}>{creating ? 'Saving...' : (operation === 'create' ? 'Create new' : 'Update')}</Button>
      {operation === 'update' && (
        <Button
          variant="secondary"
          className="ml-3"
          type="button"
          onClick={() => {
            resetForm();
            setOperation('create');
            setActiveTab('list');
            setRow(undefined);
          }}
        >Cancel</Button>
      )}
    </form>
  );
};
