import { Controller, useForm } from "react-hook-form";
import React, { useEffect, useState } from "react";
import {
  BRAND_LIST,
  CATEGORY_LIST,
  DEPARTMENT_LIST,
  PRODUCT_CREATE,
  PRODUCT_GET,
  SUPPLIER_LIST,
  TAX_LIST
} from "../../../../api/routing/routes/backend.app";
import { fetchJson } from "../../../../api/request/request";
import { HttpException, UnprocessableEntityException } from "../../../../lib/http/exception/http.exception";
import { ConstraintViolation } from "../../../../lib/validator/validation.result";
import { Input } from "../../../../app-common/components/input/input";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faRefresh } from "@fortawesome/free-solid-svg-icons";
import { Button } from "../../../../app-common/components/input/button";
import { Category } from "../../../../api/model/category";
import { Product } from "../../../../api/model/product";
import { ReactSelect } from "../../../../app-common/components/input/custom.react.select";
import { ReactSelectOptionProps } from "../../../../api/model/common";
import { Supplier } from "../../../../api/model/supplier";
import { Brand } from "../../../../api/model/brand";
import { withCurrency } from "../../../../lib/currency/currency";
import classNames from "classnames";
import { getErrorClass, getErrors, hasErrors } from "../../../../lib/error/error";
import { Department } from "../../../../api/model/department";
import { ProductVariants } from "./products/variants";
import { CreateVariants } from "./products/create.variants";
import { Tax } from "../../../../api/model/tax";
import { StoresInput } from "../../../../app-common/components/input/stores";
import { Modal } from "../../../../app-common/components/modal/modal";
import { notify } from "../../../../app-common/components/confirm/notification";
import * as yup from 'yup';
import { ValidationMessage } from "../../../../api/model/validation";
import { yupResolver } from "@hookform/resolvers/yup";
import { CreateDepartment } from "../departments/create.department";
import { CreateTax } from "../taxes/create.tax";
import { CreateCategory } from "../categories/create.category";
import { CreateSupplier } from "../../inventory/supplier/create.supplier";
import { CreateBrand } from "../brands/create.brand";
import { Switch } from "../../../../app-common/components/input/switch";
import { Terminal } from "../../../../api/model/terminal";
import useApi from "../../../../api/hooks/use.api";
import { HydraCollection } from "../../../../api/model/hydra";

interface ItemsCreateProps {
  entity?: Product;
  operation?: string;
  addModal: boolean;
  onClose?: () => void;
}

const ValidationSchema = yup.object({
  department: yup.object().required(ValidationMessage.Required),
  name: yup.string().required(ValidationMessage.Required),
  barcode: yup.string().required(ValidationMessage.Required),
  saleUnit: yup.string().required(ValidationMessage.Required),
  basePrice: yup.string().required(ValidationMessage.Required),
  purchaseUnit: yup.string().required(ValidationMessage.Required),
  cost: yup.string().required(ValidationMessage.Required),
  taxes: yup.array(),
  stores: yup.array().required(ValidationMessage.Required),
  categories: yup.array().required(ValidationMessage.Required),
  suppliers: yup.array().required(ValidationMessage.Required),
  brands: yup.array().required(ValidationMessage.Required),
  variants: yup.array(yup.object({})).typeError('Please add valid variants'),
});

export const CreateItem = ({
  entity, onClose, operation, addModal
}: ItemsCreateProps) => {
  const useFormHook = useForm({
    resolver: yupResolver(ValidationSchema)
  });

  const { register, handleSubmit, setError, formState: { errors }, reset, getValues, control, watch } = useFormHook;
  const [creating, setCreating] = useState(false);
  const [modal, setModal] = useState(false);

  useEffect(() => {
    setModal(addModal);
  }, [addModal]);

  const createProduct = async (values: any) => {
    setCreating(true);
    try {
      let url = PRODUCT_CREATE;
      let method = 'POST';
      if( values.id ) {
        method = 'PUT';
        url = PRODUCT_GET.replace(':id', values.id);
        if( values.variants ) {
          values.variants = values.variants.map((variant: any) => ({
            ...variant
          }));
        }
      } else {
        delete values.id;
        if( values.variants ) {
          values.variants = values.variants.map((variant: any) => ({
            ...variant
          }));
        }
      }

      if( values.categories ) {
        values.categories = values.categories.map((item: ReactSelectOptionProps) => item.value);
      }
      if( values.suppliers ) {
        values.suppliers = values.suppliers.map((item: ReactSelectOptionProps) => item.value);
      }
      if( values.brands ) {
        values.brands = values.brands.map((item: ReactSelectOptionProps) => item.value);
      }
      if( values.stores ) {
        values.stores = values.stores.map((item: ReactSelectOptionProps) => item.value);
      }
      if( values.department ) {
        values.department = values.department.value;
      }
      if( values.taxes ) {
        values.taxes = values.taxes.map((item: ReactSelectOptionProps) => item.value);
      } else {
        values.taxes = [];
      }
      if( values.barcode ) {
        values.barcode = values.barcode.toString();
      }
      if( values.terminals ) {
        values.terminals = values.terminals.map((t: Terminal) => t['@id'])
      }

      await fetchJson(url, {
        method: method,
        body: JSON.stringify({
          ...values,
          baseQuantity: 1,
          isAvailable: true,
          isActive: true,
          prices: [],
        })
      });

      onModalClose();

    } catch ( exception: any ) {
      if( exception instanceof HttpException ) {
        notify({
          type: 'error',
          description: exception.message
        });
      }

      if( exception instanceof UnprocessableEntityException ) {
        const e = await exception.response.json();
        if( e.violations ) {
          e.violations.forEach((item: ConstraintViolation) => {
            setError(item.propertyPath, {
              message: item.message,
              type: 'server'
            });
          });
        }

        if( e.errorMessage ) {
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

  const {
    data: categories,
    fetchData: loadCategories,
    isLoading: loadingCategories
  } = useApi<HydraCollection<Category>>('categories', CATEGORY_LIST, {
    isActive: true
  });
  const {
    data: suppliers,
    fetchData: loadSuppliers,
    isLoading: loadingSuppliers
  } = useApi<HydraCollection<Supplier>>('suppliers', SUPPLIER_LIST, {
    isActive: true
  });
  const {
    data: brands,
    fetchData: loadBrands,
    isLoading: loadingBrands
  } = useApi<HydraCollection<Brand>>('brands', BRAND_LIST, {
    isActive: true
  });
  const {
    data: departments,
    fetchData: loadDepartments,
    isLoading: loadingDepartments
  } = useApi<HydraCollection<Department>>('departments', DEPARTMENT_LIST, {
    isActive: true
  });
  const {
    data: taxes,
    fetchData: loadTaxes,
    isLoading: loadingTaxes
  } = useApi<HydraCollection<Tax>>('taxes', TAX_LIST, {
    isActive: true
  });

  const [categoryModal, setCategoryModal] = useState(false);
  const [supplierModal, setSupplierModal] = useState(false);
  const [brandModal, setBrandModal] = useState(false);
  const [departmentModal, setDepartmentModal] = useState(false);
  const [taxModal, setTaxModal] = useState(false);

  useEffect(() => {
    if( entity ) {
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
          value: entity?.department?.['@id']
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
      categories: [],
      cost: null,
      createdAt: null,
      id: null,
      isActive: null,
      isAvailable: null,
      name: null,
      prices: [],
      quantity: null,
      sku: null,
      purchaseUnit: null,
      saleUnit: null,
      updatedAt: null,
      uuid: null,
      variants: [],
      suppliers: [],
      brands: [],
      stores: [],
      department: null,
      groups: [],
      taxes: [],
      manageInventory: false
    });
  };

  const onModalClose = () => {
    resetForm();
    onClose && onClose();
  }

  return (
    <>
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
                  <div className="input-group">
                    <ReactSelect
                      onChange={props.field.onChange}
                      value={props.field.value}
                      options={departments?.['hydra:member']?.map(item => {
                        return {
                          label: item.name,
                          value: item['@id']
                        }
                      })}
                      isLoading={loadingDepartments}
                      className={
                        classNames(
                          getErrorClass(errors.department),
                          'rs-__container flex-grow'
                        )
                      }
                    />
                    <button className="btn btn-primary" type={"button"} onClick={() => setDepartmentModal(true)}>
                      <FontAwesomeIcon icon={faPlus}/>
                    </button>
                  </div>
                )}
              />

              {getErrors(errors.department)}
            </div>
            <div>
              <label htmlFor="name">Name</label>
              <Input {...register('name')} id="name"
                     className={classNames(
                       "w-full"
                     )}
                     hasError={hasErrors(errors.name)}
              />

              {getErrors(errors.name)}
            </div>
            <div>
              <label htmlFor="barcode">Barcode</label>
              <div className="input-group">
                <Input {...register('barcode')} id="barcode"
                       className={classNames(
                         "w-full"
                       )}
                       disabled={!!entity}
                       hasError={hasErrors(errors.barcode)}
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

              {getErrors(errors.barcode)}
            </div>
            <div className="col-span-4"></div>
            <div>
              <label htmlFor="basePrice">Sale price</label>
              <div className="input-group">
            <span className="input-addon">
              {withCurrency(undefined)}
            </span>
                <Input {...register('basePrice')} id="basePrice" className={classNames(
                  "w-full"
                )} hasError={hasErrors(errors.basePrice)}/>
              </div>
              {getErrors(errors.basePrice)}
            </div>

            <div>
              <label htmlFor="basePrice">Sale unit</label>
              <Input {...register('saleUnit')} id="saleUnit" className={classNames(
                "w-full"
              )} hasError={hasErrors(errors.saleUnit)}/>
              {getErrors(errors.saleUnit)}
            </div>
            <div className="col-span-4"></div>
            <div>
              <label htmlFor="cost">Purchase price</label>
              <div className="input-group">
              <span className="input-addon">
                {withCurrency(undefined)}
              </span>
                <Input {...register('cost')} id="cost" className={classNames(
                  "w-full"
                )} hasError={hasErrors(errors.cost)}/>
              </div>
              {getErrors(errors.cost)}
            </div>
            <div>
              <label htmlFor="purchaseUnit">Purchase unit</label>
              <Input {...register('purchaseUnit')} id="purchaseUnit" className={classNames(
                "w-full"
              )} hasError={hasErrors(errors.purchaseUnit)}/>

              {getErrors(errors.purchaseUnit)}
            </div>
            <div className="col-span-4"></div>
            <div>
              <label className="w-full block">&nbsp;</label>
              <Controller
                control={control}
                name="manageInventory"
                render={(props) => (
                  <Switch
                    checked={props.field.value}
                    onChange={props.field.onChange}
                  >
                    Manage inventory?
                  </Switch>
                )}
              />
              {getErrors(errors.manageInventory)}
            </div>
            <div>
              <label htmlFor="quantity">Opening Quantity</label>
              <Input {...register('quantity')} id="quantity" className={classNames(
                "w-full"
              )} hasError={hasErrors(errors.quantity)} disabled={!watch('manageInventory')}/>
              {getErrors(errors.quantity)}
            </div>
            <div className="col-span-4"></div>
            <div>
              <label htmlFor="taxes">Taxes</label>
              <Controller
                name="taxes"
                render={(props) => (
                  <div className="input-group">
                    <ReactSelect
                      options={taxes?.['hydra:member']?.map(item => ({
                        label: `${item.name} ${item.rate}%`,
                        value: item['@id']
                      }))}
                      onChange={props.field.onChange}
                      value={props.field.value}
                      isMulti
                      className={
                        classNames(
                          getErrorClass(errors.taxes),
                          'flex-grow rs-__container'
                        )
                      }
                      isLoading={loadingTaxes}
                    />
                    <button className="btn btn-primary" type={"button"} onClick={() => setTaxModal(true)}>
                      <FontAwesomeIcon icon={faPlus}/>
                    </button>
                  </div>
                )}
                control={control}
              />
              {getErrors(errors.taxes)}

            </div>

            <StoresInput control={control} errors={errors}/>

            <div className="col-span-4 grid grid-cols-4 gap-3 gap-y-2">
              <div>
                <label htmlFor="categories">Categories</label>
                <Controller
                  name="categories"
                  render={(props) => (
                    <div className="input-group">
                      <ReactSelect
                        options={categories?.['hydra:member']?.map(item => ({
                          label: item.name,
                          value: item['@id']
                        }))}
                        onChange={props.field.onChange}
                        value={props.field.value}
                        isMulti
                        className={
                          classNames(
                            getErrorClass(errors.categories),
                            'flex-grow rs-__container'
                          )
                        }
                        isLoading={loadingCategories}
                      />
                      <button className="btn btn-primary" type={"button"} onClick={() => setCategoryModal(true)}>
                        <FontAwesomeIcon icon={faPlus}/>
                      </button>
                    </div>
                  )}
                  control={control}
                />
                {getErrors(errors.categories)}

              </div>
              <div>
                <label htmlFor="suppliers">Suppliers</label>
                <Controller
                  name="suppliers"
                  render={(props) => (
                    <div className="input-group">
                      <ReactSelect
                        options={suppliers?.['hydra:member']?.map(item => ({
                          label: item.name,
                          value: item['@id']
                        }))}
                        onChange={props.field.onChange}
                        value={props.field.value}
                        isMulti
                        className={
                          classNames(
                            getErrorClass(errors.suppliers),
                            'flex-grow rs-__container'
                          )
                        }
                        isLoading={loadingSuppliers}
                      />
                      <button className="btn btn-primary" type={"button"} onClick={() => setSupplierModal(true)}>
                        <FontAwesomeIcon icon={faPlus}/>
                      </button>
                    </div>
                  )}
                  control={control}
                />
                {getErrors(errors.suppliers)}

              </div>
              <div>
                <label htmlFor="brands">Brands</label>
                <Controller
                  name="brands"
                  render={(props) => (
                    <div className="input-group">
                      <ReactSelect
                        options={brands?.['hydra:member']?.map(item => ({
                          label: item.name,
                          value: item['@id']
                        }))}
                        onChange={props.field.onChange}
                        value={props.field.value}
                        isMulti
                        className={
                          classNames(
                            getErrorClass(errors.brands),
                            'flex-grow rs-__container'
                          )
                        }
                        isLoading={loadingBrands}
                      />
                      <button className="btn btn-primary" type={"button"} onClick={() => setBrandModal(true)}>
                        <FontAwesomeIcon icon={faPlus}/>
                      </button>
                    </div>
                  )}
                  control={control}
                />
                {getErrors(errors.brands)}

              </div>
            </div>
            <div className="col-span-4">
              <h4 className="text-lg">Variants</h4>
            </div>
            {getErrors(errors.variants)}
            <div className="col-span-4">
              {entity ? (
                <ProductVariants useForm={useFormHook}/>
              ) : (
                <CreateVariants useForm={useFormHook}/>
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

      <CreateDepartment addModal={departmentModal} operation="create" onClose={() => {
        setDepartmentModal(false);
        loadDepartments();
      }}/>

      <CreateTax addModal={taxModal} operation="create" onClose={() => {
        setTaxModal(false);
        loadTaxes();
      }}/>

      <CreateCategory addModal={categoryModal} operation="create" onClose={() => {
        setCategoryModal(false);
        loadCategories();
      }}/>

      <CreateSupplier operation="create" showModal={supplierModal} onClose={() => {
        setSupplierModal(false);
        loadSuppliers();
      }}/>

      <CreateBrand addModal={brandModal} operation="create" onClose={() => {
        setBrandModal(false);
        loadBrands();
      }}/>
    </>
  );
};
