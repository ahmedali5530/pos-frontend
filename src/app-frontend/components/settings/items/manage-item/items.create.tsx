import {Controller, useForm} from "react-hook-form";
import React, {useEffect, useState} from "react";
import {HttpException, UnprocessableEntityException} from "../../../../../lib/http/exception/http.exception";
import {ConstraintViolation} from "../../../../../lib/validator/validation.result";
import {Input} from "../../../../../app-common/components/input/input";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPlus, faRefresh} from "@fortawesome/free-solid-svg-icons";
import {Button} from "../../../../../app-common/components/input/button";
import {Category} from "../../../../../api/model/category";
import {Product} from "../../../../../api/model/product";
import {ReactSelect} from "../../../../../app-common/components/input/custom.react.select";
import {ReactSelectOptionProps, toRecordId} from "../../../../../api/model/common";
import {Supplier} from "../../../../../api/model/supplier";
import {Brand} from "../../../../../api/model/brand";
import {withCurrency} from "../../../../../lib/currency/currency";
import classNames from "classnames";
import {getErrorClass, getErrors, hasErrors} from "../../../../../lib/error/error";
import {Department} from "../../../../../api/model/department";
import {ProductVariants} from "../products/variants";
import {CreateVariants} from "../products/create.variants";
import {Tax} from "../../../../../api/model/tax";
import {Modal} from "../../../../../app-common/components/modal/modal";
import {notify} from "../../../../../app-common/components/confirm/notification";
import * as yup from 'yup';
import {ValidationMessage} from "../../../../../api/model/validation";
import {yupResolver} from "@hookform/resolvers/yup";
import {CreateDepartment} from "../../departments/create.department";
import {CreateTax} from "../../taxes/create.tax";
import {CreateCategory} from "../../categories/create.category";
import {CreateSupplier} from "../../../inventory/supplier/create.supplier";
import {CreateBrand} from "../../brands/create.brand";
import {Terminal} from "../../../../../api/model/terminal";
import {CreateTerminal} from "../../terminals/create.terminal";
import {useDB} from "../../../../../api/db/db";
import useApi, {SettingsData} from "../../../../../api/db/use.api";
import {Tables} from "../../../../../api/db/tables";
import {Tab, TabContent, TabControl, TabNav} from "../../../../../app-common/components/tabs/tabs";
import {ItemInventory} from "./item.inventory";
import {StringRecordId} from "surrealdb";

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
  sale_unit: yup.string().required(ValidationMessage.Required),
  base_price: yup.string().required(ValidationMessage.Required),
  purchase_unit: yup.string().required(ValidationMessage.Required),
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

  const {register, handleSubmit, setError, formState: {errors}, reset, getValues, control, watch} = useFormHook;
  const [creating, setCreating] = useState(false);
  const [modal, setModal] = useState(false);
  const db = useDB();

  useEffect(() => {
    setModal(addModal);
  }, [addModal]);

  const createProduct = async (values: any) => {
    setCreating(true);
    try {
      if (values?.categories) {
        values.categories = values.categories.map((item: ReactSelectOptionProps) => toRecordId(item.value));
      }
      if (values?.suppliers) {
        values.suppliers = values.suppliers.map((item: ReactSelectOptionProps) => toRecordId(item.value));
      }
      if (values?.brands) {
        values.brands = values.brands.map((item: ReactSelectOptionProps) => toRecordId(item.value));
      }
      if (values?.stores) {
        values.stores = values.stores
          .filter((item: any) => item.quantity !== undefined)
          .map((item: any) => ({
            id: item.id,
            store: toRecordId(item.store),
            location: item.location,
            quantity: item.quantity,
            re_order_level: item.re_order_level,
            product: entity ? toRecordId(entity['id']) : null
          }));
      }
      if (values?.department) {
        values.department = toRecordId(values.department.value);
      }
      if (values?.taxes) {
        values.taxes = values.taxes.map((item: ReactSelectOptionProps) => toRecordId(item.value));
      } else {
        values.taxes = [];
      }
      if (values.barcode) {
        values.barcode = values.barcode.toString();
      }
      if (values?.terminals) {
        values.terminals = values.terminals.map((item: ReactSelectOptionProps) => toRecordId(item.value))
      }

      const variantIds = [];
      const allVariantStoreIds = [];

      if (values.variants) {
        for (let vIdx = 0; vIdx < values.variants.length; vIdx++) {
          const variant = values.variants[vIdx];
          const variantData = {
            attribute_value: variant.attribute_value,
            barcode: variant.barcode,
            price: Number(variant.price),
            cost: Number(variant.cost),
            product: entity ? toRecordId(entity.id) : null
          };

          let variantRecord;
          if (variant.id) {
            variantRecord = await db.merge(toRecordId(variant.id), variantData);
          } else {
            [variantRecord] = await db.insert(Tables.product_variant, variantData);
          }
          const vId = variantRecord.id;
          variantIds.push(vId);

          const localVariantStoreIds = [];
          if (values.variant_stores) {
            for (let sIdx = 0; sIdx < values.variant_stores.length; sIdx++) {
              const storeVariant = values.variant_stores[sIdx][vIdx];
              if (!storeVariant) continue;

              const vsData = {
                quantity: Number(storeVariant.quantity),
                re_order_level: Number(storeVariant.re_order_level),
                location: storeVariant.location,
                store: toRecordId(storeVariant.store),
                variant: vId,
                product: entity ? toRecordId(entity.id) : null
              };

              let vsRecord;
              if (storeVariant.id) {
                vsRecord = await db.merge(storeVariant.id, vsData);
              } else {
                [vsRecord] = await db.insert(Tables.product_variant_store, vsData);
              }
              localVariantStoreIds.push(vsRecord.id);
              allVariantStoreIds.push(vsRecord.id);
            }
          }

          await db.merge(vId, {stores: localVariantStoreIds});
        }
      }

      const productData = {
        name: values.name,
        barcode: values.barcode,
        prices: [],
        base_price: Number(values.base_price),
        cost: Number(values.cost),
        sale_unit: values.sale_unit,
        purchase_unit: values.purchase_unit,
        quantity: Number(values.quantity),
        base_quantity: 1,
        brands: values.brands,
        categories: values.categories,
        department: values.department,
        manage_inventory: values.manage_inventory,
        is_available: true,
        is_expire: false,
        suppliers: values.suppliers,
        taxes: values.taxes,
        terminals: values.terminals,
        variants: variantIds
      };

      let productRecord;
      if (entity?.id) {
        productRecord = await db.merge(entity.id, productData);
      } else {
        [productRecord] = await db.insert(Tables.product, productData);
      }

      let productId = productRecord.id;

      const productStoreIds = [];
      if (values?.stores) {
        for (const s of values.stores) {
          const psData = {
            location: s.location,
            product: productId,
            quantity: Number(s.quantity),
            re_order_level: Number(s.re_order_level),
            store: s.store
          };

          let psRecord;
          if (s.id) {
            psRecord = s;
            await db.merge(s.id, psData);
          } else {
            [psRecord] = await db.insert(Tables.product_store, psData);
          }
          productStoreIds.push(toRecordId(psRecord.id));
        }
      }

      await db.merge(toRecordId(productId), {stores: productStoreIds});

      // update terminals to include products
      for (const t of productData?.terminals) {
        const [terminal] = await db.query(`SELECT *
                                           FROM ONLY ${t}`);
        await db.merge(t, {
          products: Array.from(new Set([...(terminal?.products || []), productId])),
        });
      }

      // Link variants and variant stores to product if it was just created
      if (!entity?.id) {
        for (const vId of variantIds) {
          await db.merge(vId, {product: productId});
        }
        for (const vsId of allVariantStoreIds) {
          await db.merge(vsId, {product: productId});
        }
      }

      notify({
        type: 'success',
        title: 'Success',
        description: `Product ${entity ? 'updated' : 'created'} successfully`
      });

      onModalClose();

    } catch (exception: any) {
      if (exception instanceof HttpException) {
        notify({
          type: 'error',
          title: exception.code,
          description: exception.message
        });
      }

      if (exception instanceof UnprocessableEntityException) {
        const e = await exception.response.json();
        if (e.violations) {
          e.violations.forEach((item: ConstraintViolation) => {
            setError(item.propertyPath, {
              message: item.message,
              type: 'server'
            });
          });
        }

        if (e.errorMessage) {
          notify({
            type: 'error',
            title: 'Validation Error',
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
  } = useApi<SettingsData<Category>>(Tables.category, ['is_active = true'], [], 0, 999999, [], {
    enabled: false
  });
  const {
    data: suppliers,
    fetchData: loadSuppliers,
    isLoading: loadingSuppliers
  } = useApi<SettingsData<Supplier>>(Tables.supplier, ['is_active = true'], [], 0, 999999, [], {
    enabled: false
  });
  const {
    data: brands,
    fetchData: loadBrands,
    isLoading: loadingBrands
  } = useApi<SettingsData<Brand>>(Tables.brand, ['is_active = true'], [], 0, 999999, [], {
    enabled: false
  });
  const {
    data: departments,
    fetchData: loadDepartments,
    isLoading: loadingDepartments
  } = useApi<SettingsData<Department>>(Tables.department, ['is_active = true'], [], 0, 999999, [], {
    enabled: false
  });
  const {
    data: taxes,
    fetchData: loadTaxes,
    isLoading: loadingTaxes
  } = useApi<SettingsData<Tax>>(Tables.tax, ['is_active = true'], [], 0, 999999, [], {
    enabled: false
  });
  const {
    data: terminals,
    fetchData: loadTerminals,
    isLoading: loadingTerminals
  } = useApi<SettingsData<Terminal>>(Tables.terminal, ['is_active = true'], [], 0, 999999, ['store'], {
    enabled: false
  });

  const [categoryModal, setCategoryModal] = useState(false);
  const [supplierModal, setSupplierModal] = useState(false);
  const [brandModal, setBrandModal] = useState(false);
  const [departmentModal, setDepartmentModal] = useState(false);
  const [taxModal, setTaxModal] = useState(false);
  const [terminalModal, setTerminalModal] = useState(false);

  useEffect(() => {
    if (modal) {
      loadDepartments();
      loadTaxes();
      loadTerminals();
      loadCategories();
      loadSuppliers();
      loadBrands();
    }
  }, [modal]);

  useEffect(() => {
    if (entity) {
      const variantStores = entity.stores.map((s) => {
        return entity.variants.map((v) => {
          const vs = v.stores?.find(item => {
            const storeId = (item.store?.id || item.store)?.toString();
            const targetStoreId = (s.store?.id || s.store)?.toString();
            return storeId === targetStoreId;
          });
          return vs ? {
            id: vs.id,
            store: (vs.store?.id || vs.store)?.toString(),
            quantity: vs.quantity,
            re_order_level: vs.re_order_level,
            location: vs.location
          } : {
            store: (s.store?.id || s.store)?.toString(),
            quantity: 0,
            re_order_level: 0,
            location: ''
          };
        });
      });

      reset({
        ...entity,
        suppliers: entity.suppliers.map(item => ({
          label: item.name,
          value: item.id.toString()
        })),
        brands: entity.brands.map(item => ({
          label: item.name,
          value: item.id.toString()
        })),
        categories: entity.categories.map(item => ({
          label: item.name,
          value: item.id.toString()
        })),
        storesDropdown: entity.stores.map(item => ({
          label: item.store.name,
          value: item.store.id.toString(),
        })),
        stores: entity.stores.map(item => ({
          store: item.store.id.toString(),
          label: item.store.name,
          quantity: item.quantity,
          location: item.location,
          re_order_level: item.re_order_level,
          id: item.id.toString()
        })),
        department: {
          label: entity?.department?.name,
          value: entity?.department?.id?.toString()
        },
        taxes: entity.taxes.map(item => ({
          label: `${item.name} ${item.rate}%`,
          value: item.id.toString()
        })),
        terminals: entity.terminals.map(item => ({
          label: `${item?.store?.name} - ${item.code}`,
          value: item.id.toString()
        })),
        variant_stores: variantStores
      });
    }
  }, [entity, reset]);

  const onModalClose = () => {
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
        {Object.keys(errors).length > 0 && (
          <div className="alert alert-danger">There are some errors in the form</div>
        )}
        <form onSubmit={handleSubmit(createProduct)} className="mb-5">
          <TabControl
            defaultTab="info"
            position="top"
            render={({isTabActive, setActiveTab}) => (
              <>
                <TabNav position="top">
                  <Tab
                    isActive={isTabActive("info")}
                    onClick={() => setActiveTab("info")}
                    justified
                  >
                    Item info
                  </Tab>
                  <Tab
                    isActive={isTabActive("variants")}
                    onClick={() => setActiveTab("variants")}
                    justified
                  >
                    Variants
                  </Tab>
                  <Tab
                    isActive={isTabActive("inventory")}
                    onClick={() => setActiveTab("inventory")}
                    justified
                  >
                    Inventory
                  </Tab>
                </TabNav>
                <TabContent isActive={isTabActive("info")} holdState>
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
                              options={departments?.data?.map(item => {
                                return {
                                  label: item.name,
                                  value: item['id'].toString()
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
                            <button className="btn btn-primary" type={"button"}
                                    onClick={() => setDepartmentModal(true)}>
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
                      <label htmlFor="base_price">Sale price</label>
                      <div className="input-group">
                        <span className="input-addon">
                          {withCurrency(undefined)}
                        </span>
                        <Input {...register('base_price')} id="base_price" className={classNames(
                          "w-full"
                        )} hasError={hasErrors(errors.base_price)}/>
                      </div>
                      {getErrors(errors.base_price)}
                    </div>

                    <div>
                      <label htmlFor="sale_unit">Sale unit</label>
                      <Input {...register('sale_unit')} id="sale_unit" className={classNames(
                        "w-full"
                      )} hasError={hasErrors(errors.sale_unit)}/>
                      {getErrors(errors.sale_unit)}
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
                      <label htmlFor="purchase_unit">Purchase unit</label>
                      <Input {...register('purchase_unit')} id="purchase_unit" className={classNames(
                        "w-full"
                      )} hasError={hasErrors(errors.purchase_unit)}/>

                      {getErrors(errors.purchase_unit)}
                    </div>
                    <div className="col-span-4"></div>
                    <div>
                      <label htmlFor="taxes">Taxes</label>
                      <Controller
                        name="taxes"
                        render={(props) => (
                          <div className="input-group">
                            <ReactSelect
                              options={taxes?.data?.map(item => ({
                                label: `${item.name} ${item.rate}%`,
                                value: item['id'].toString()
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
                    <div className="col-span-4"></div>
                    <div>
                      <label htmlFor="terminals">Terminals</label>
                      <Controller
                        name="terminals"
                        render={(props) => (
                          <div className="input-group">
                            <ReactSelect
                              options={terminals?.data?.map(item => ({
                                label: `${item?.store?.name} - ${item.code}`,
                                value: item['id'].toString()
                              }))}
                              onChange={props.field.onChange}
                              value={props.field.value}
                              isMulti
                              className={
                                classNames(
                                  getErrorClass(errors.terminals),
                                  'flex-grow rs-__container'
                                )
                              }
                              isLoading={loadingTerminals}
                            />
                            <button className="btn btn-primary" type={"button"} onClick={() => setTaxModal(true)}>
                              <FontAwesomeIcon icon={faPlus}/>
                            </button>
                          </div>
                        )}
                        control={control}
                      />
                      {getErrors(errors.terminals)}
                    </div>
                    <div className="col-span-4"></div>
                    <div>
                      <label htmlFor="categories">Categories</label>
                      <Controller
                        name="categories"
                        render={(props) => (
                          <div className="input-group">
                            <ReactSelect
                              options={categories?.data?.map(item => ({
                                label: item.name,
                                value: item['id'].toString()
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
                              options={suppliers?.data?.map(item => ({
                                label: item.name,
                                value: item['id'].toString()
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
                              options={brands?.data?.map(item => ({
                                label: item.name,
                                value: item['id'].toString()
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

                    {/*TODO: add conditional prices*/}
                    {/*<div className="col-span-4">*/}
                    {/*  <h4 className="text-lg">Conditional prices</h4>*/}
                    {/*</div>*/}
                    {/*<div className="col-span-4"></div>*/}
                  </div>
                </TabContent>
                <TabContent isActive={isTabActive("variants")} holdState>
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
                </TabContent>
                <TabContent isActive={isTabActive("inventory")} holdState>
                  <ItemInventory useForm={useFormHook}/>
                </TabContent>
              </>
            )}
          />


          <Button variant="primary" type="submit"
                  disabled={creating}>{creating ? 'Saving...' : (operation === 'create' ? 'Create new' : 'Update')}</Button>
        </form>
      </Modal>

      {departmentModal && (
        <CreateDepartment addModal={departmentModal} operation="create" onClose={() => {
          setDepartmentModal(false);
          loadDepartments();
        }}/>
      )}

      {taxModal && (
        <CreateTax addModal={taxModal} operation="create" onClose={() => {
          setTaxModal(false);
          loadTaxes();
        }}/>
      )}

      {categoryModal && (
        <CreateCategory addModal={categoryModal} operation="create" onClose={() => {
          setCategoryModal(false);
          loadCategories();
        }}/>
      )}

      {supplierModal && (
        <CreateSupplier operation="create" showModal={supplierModal} onClose={() => {
          setSupplierModal(false);
          loadSuppliers();
        }}/>
      )}

      {brandModal && (
        <CreateBrand addModal={brandModal} operation="create" onClose={() => {
          setBrandModal(false);
          loadBrands();
        }}/>
      )}

      {terminalModal && (
        <CreateTerminal addModal={terminalModal} operation="create" onClose={() => {
          setTerminalModal(false);
          loadTerminals();
        }}/>
      )}

    </>
  );
};
