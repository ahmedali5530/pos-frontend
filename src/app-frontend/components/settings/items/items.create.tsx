import {Controller, useForm} from "react-hook-form";
import React, {useEffect, useState} from "react";
import {
  BRAND_LIST,
  CATEGORY_LIST, DEPARTMENT_LIST,
  PRODUCT_CREATE,
  PRODUCT_GET, PRODUCT_VARIANT, PRODUCT_VARIANT_GET,
  SUPPLIER_LIST, TAX_LIST
} from "../../../../api/routing/routes/backend.app";
import {fetchJson, jsonRequest} from "../../../../api/request/request";
import {UnprocessableEntityException} from "../../../../lib/http/exception/http.exception";
import {ConstraintViolation} from "../../../../lib/validator/validation.result";
import {Input} from "../../../../app-common/components/input/input";
import {Trans} from "react-i18next";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faRefresh} from "@fortawesome/free-solid-svg-icons";
import {Button} from "../../../../app-common/components/input/button";
import {Category} from "../../../../api/model/category";
import {Product} from "../../../../api/model/product";
import {ReactSelect} from "../../../../app-common/components/input/custom.react.select";
import {ReactSelectOptionProps} from "../../../../api/model/common";
import {Supplier} from "../../../../api/model/supplier";
import {Brand} from "../../../../api/model/brand";
import {withCurrency} from "../../../../lib/currency/currency";
import classNames from "classnames";
import {getErrorClass} from "../../../../lib/error/error";
import {Department} from "../../../../api/model/department";
import {ProductVariants} from "./products/variants";
import {CreateVariants} from "./products/create.variants";
import {Tax} from "../../../../api/model/tax";
import {useAlert} from "react-alert";
import {StoresInput} from "../../../../app-common/components/input/stores";
import {ProductVariant} from "../../../../api/model/product.variant";
import {Modal} from "../../../../app-common/components/modal/modal";
import {useLoadList} from "../../../../api/hooks/use.load.list";

interface ItemsCreateProps{
  entity?: Product;
  operation?: string;
  addModal: boolean;
  onClose?: () => void;
}

export const submitProductVariant = async (token: Omit<ProductVariant, 'id'>) => {
  try {
    let response = await jsonRequest(PRODUCT_VARIANT, {
      method: 'POST',
      body  : JSON.stringify(token)
    });
    return await response.json();
  }catch(e) {
    // throw e;
  }
};



export const CreateItem = ({
  entity, onClose, operation, addModal
}: ItemsCreateProps) => {
  const useFormHook = useForm();
  const {register, handleSubmit, setError, formState: {errors}, reset, getValues, control} = useFormHook;
  const [creating, setCreating] = useState(false);
  const alert = useAlert();
  const [modal, setModal] = useState(false);

  useEffect(() => {
    setModal(addModal);
  }, [addModal]);

  const createProduct = async (values: any) => {
    setCreating(true);
    try {
      let url = PRODUCT_CREATE;
      let method = 'POST';
      if (values.id) {
        method = 'PUT';
        url = PRODUCT_GET.replace(':id', values.id);
      } else {
        delete values.id;
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
      if(values.barcode){
        values.barcode = values.barcode.toString();
      }

      let variants: string[] = [];
      let loopItems: any[] = [];
      if(values.variants){
        values.variants.forEach((token: ProductVariant) => {
          loopItems.push(submitProductVariant(token));
        });
      }

      await Promise.all(loopItems).then(tValues => {
        tValues.forEach((item: ProductVariant) => {
          variants.push(item['@id'] as string);
        });

        values.variants = variants;
      });

      if(variants.length === 0){
        values.variants = [];
      }

      await fetchJson(url, {
        method: method,
        body: JSON.stringify({
          ...values,
          purchaseUnit: 'Unit',
          saleUnit: 'Unit',
          baseQuantity: 1,
          quantity: '1000',
          isAvailable: true,
          isActive: true
        })
      });

      onModalClose();

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

  const {list: categories, fetchData: loadCategories} = useLoadList<Category>(CATEGORY_LIST);
  const {list: suppliers, fetchData: loadSuppliers} = useLoadList<Supplier>(SUPPLIER_LIST);
  const {list: brands, fetchData: loadBrands} = useLoadList<Brand>(BRAND_LIST);
  const {list: department, fetchData: loadDepartments} = useLoadList<Department>(DEPARTMENT_LIST);
  const {list: taxes, fetchData: loadTaxes} = useLoadList<Tax>(TAX_LIST);

  useEffect(() => {
    loadCategories();
    loadSuppliers();
    loadBrands();
    loadDepartments();
    loadTaxes();
  }, []);

  useEffect(() => {
    if(entity) {
      reset({
        ...entity,
        suppliers: entity.suppliers.map(item => ({
          label: item.name,
          value: item['@id']
        })),
        brands: entity.brands.map(item => ({
          label: item.name,
          value: item['@id']
        })),
        categories: entity.categories.map(item => ({
          label: item.name,
          value: item['@id']
        })),
        stores: entity.stores.map(item => ({
          label: item.name,
          value: item['@id']
        })),
        department: {
          label: entity?.department?.name,
          value: entity?.department?.id
        },
        taxes: entity.taxes.map(item => ({
          label: `${item.name} ${item.rate}%`,
          value: item['@id']
        }))
      });
    }
  }, [entity, reset]);

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

  const onModalClose = () => {
    resetForm();
    onClose && onClose();
  }

  return (
    <Modal
      open={modal}
      onClose={onModalClose}
      size="full"
      title={operation === 'create' ? 'Create item' : 'Update item'}
    >
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
                    value: item['@id']
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
                   disabled={!!entity}
            />
            {!entity && (
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
                  value: item['@id']
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

        <StoresInput control={control} errors={errors} />

        <div className="col-span-4 grid grid-cols-3 gap-3 gap-y-2">
          <div>
            <label htmlFor="categories">Categories</label>
            <Controller
              name="categories"
              render={(props) => (
                <ReactSelect
                  options={categories.map(item => ({
                    label: item.name,
                    value: item['@id']
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
                    value: item['@id']
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
                    value: item['@id']
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
          {entity ? (
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
    </form>
    </Modal>
  );
};
