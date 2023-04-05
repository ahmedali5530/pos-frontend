import React, {useEffect, useMemo, useState} from 'react';
import {useLoadList} from "../../../../api/hooks/use.load.list";
import {
  CATEGORY_LIST, PRODUCT_KEYWORDS,
  STORE_LIST,
  TERMINAL_CREATE,
  TERMINAL_GET,
  TERMINAL_LIST
} from "../../../../api/routing/routes/backend.app";
import {Trans, useTranslation} from "react-i18next";
import {createColumnHelper} from "@tanstack/react-table";
import {Button} from "../../button";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPencilAlt, faTimes, faTrash} from "@fortawesome/free-solid-svg-icons";
import {Controller, useForm} from "react-hook-form";
import {useAlert} from "react-alert";
import {fetchJson} from "../../../../api/request/request";
import {HttpException, UnprocessableEntityException} from "../../../../lib/http/exception/http.exception";
import {ConstraintViolation, ValidationResult} from "../../../../lib/validator/validation.result";
import {Input} from "../../input";
import {TableComponent} from "../../../../app-common/components/table/table";
import { Terminal } from '../../../../api/model/terminal';
import {Store} from "../../../../api/model/store";
import {ReactSelect} from "../../../../app-common/components/input/custom.react.select";
import {ReactSelectOptionProps} from "../../../../api/model/common";
import {Category} from "../../../../api/model/category";
import {Modal} from "../../modal";
import {StoresInput} from "../../../../app-common/components/input/stores";
import {Product} from "../../../../api/model/product";

export const Terminals = () => {
  const [operation, setOperation] = useState('create');

  const useLoadHook = useLoadList<Terminal>(TERMINAL_LIST);
  const {fetchData} = useLoadHook;

  const [terminalProducts, setTerminalProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState<string>();

  const terminalProductsFilter = useMemo(() => {
    if(filter) {
      return terminalProducts.filter(item => item.name.toLowerCase().indexOf(filter.toLowerCase()) !== -1);
    }

    return terminalProducts;

  }, [terminalProducts, filter]);

  const {t} = useTranslation();

  const columnHelper = createColumnHelper<Terminal>();

  const columns = [
    columnHelper.accessor('code', {
      header: () => t('Code'),
    }),
    columnHelper.accessor('products', {
      header: () => t('Products'),
      cell: info => (
        <>
          {info.getValue().slice(0, 7).map(p => p.name).join(', ')}{' '}
          {info.getValue().slice(7).length > 0 && (
            <Button
              className="btn btn-secondary"
              onClick={() => setTerminalProducts(info.getValue())}
              type="button"
            >+{info.getValue().slice(7).length} more
            </Button>
          )}
        </>
      )
    }),
    columnHelper.accessor('store', {
      header: () => t('Store'),
      cell: info => info.getValue()?.name
    }),
    columnHelper.accessor('id', {
      header: () => t('Actions'),
      enableSorting: false,
      cell: (info) => {
        return (
          <>
            <Button type="button" variant="primary" className="w-[40px]" onClick={() => {
              reset({
                ...info.row.original,
                store: {
                  value: info.row.original?.store?.id,
                  label: info.row.original?.store?.name
                }
              });
              setOperation('update');
            }} tabIndex={-1}>
              <FontAwesomeIcon icon={faPencilAlt}/>
            </Button>
            <span className="mx-2 text-gray-300">|</span>
            <Button type="button" variant="danger" className="w-[40px]" tabIndex={-1}>
              <FontAwesomeIcon icon={faTrash}/>
            </Button>
          </>
        )
      }
    })
  ];

  const {register, handleSubmit, setError, formState: {errors}, reset, control} = useForm();
  const [creating, setCreating] = useState(false);
  const alert = useAlert();

  const createTerminal = async (values: any) => {
    setCreating(true);
    try {
      let url = '';
      if (values.id) {
        url = TERMINAL_GET.replace(':id', values.id);
      } else {
        url = TERMINAL_CREATE;
      }

      if(values.store){
        values.store = values.store.value;
      }

      if(values.products){
        values.products = values.products.map((p: ReactSelectOptionProps) => p.value);
      }

      if(values.excludeProducts){
        values.excludeProducts = values.excludeProducts.map((p: ReactSelectOptionProps) => p.value);
      }

      if(values.categories){
        values.categories = values.categories.map((p: ReactSelectOptionProps) => p.value);
      }

      await fetchJson(url, {
        method: 'POST',
        body: JSON.stringify({
          ...values,
        })
      });

      fetchData!();

      resetForm();
      setOperation('create');

    } catch (exception: any) {
      if(exception instanceof HttpException){
        if(exception.message){
          alert.error(exception.message);
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

  const [isProductsLoading, setProductsLoading] = useState(false);
  const [products, setProducts] = useState<ReactSelectOptionProps[]>([]);
  const loadProducts = async () => {
    setProductsLoading(true);

    try{
      const res = await fetchJson(PRODUCT_KEYWORDS);
      setProducts(res.list);
    }catch (e){
      throw e;
    }finally {
      setProductsLoading(false);
    }
  };

  const [isCategoriesLoading, setCategoriesLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const loadCategories = async () => {
    setCategoriesLoading(true);

    try{
      const res = await fetchJson(CATEGORY_LIST);
      setCategories(res['hydra:member']);
    }catch (e){
      throw e;
    }finally {
      setCategoriesLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const resetForm = () => {
    reset({
      code: null,
      id: null,
      store: null,
      products: null,
      categories: null,
      excludeProducts: null
    });
  };

  return (
    <>
      <h3 className="text-xl">Create Terminal</h3>
      <form onSubmit={handleSubmit(createTerminal)} className="mb-5">
        <input type="hidden" {...register('id')}/>
        <div className="grid grid-cols-5 gap-4 mb-3">
          <div>
            <label htmlFor="code">Code</label>
            <Input {...register('code')} id="code" className="w-full"/>
            {errors.code && (
              <div className="text-danger-500 text-sm">
                <Trans>
                  {errors.code.message}
                </Trans>
              </div>
            )}
          </div>
          <StoresInput control={control} errors={errors} />
          <div>
            <label htmlFor="categories">Categories</label>
            <Controller
              name="categories"
              control={control}
              render={(props) => (
                <ReactSelect
                  onChange={props.field.onChange}
                  value={props.field.value}
                  options={categories.map(item => {
                    return {
                      label: item.name,
                      value: item.id
                    }
                  })}
                  isMulti
                  isLoading={isCategoriesLoading}
                  closeMenuOnSelect={false}
                />
              )}
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
            <label htmlFor="products">Products</label>
            <Controller
              name="products"
              control={control}
              render={(props) => (
                <ReactSelect
                  onChange={props.field.onChange}
                  value={props.field.value}
                  options={products}
                  isMulti
                  isLoading={isProductsLoading}
                  closeMenuOnSelect={false}
                />
              )}
            />

            {errors.products && (
              <div className="text-danger-500 text-sm">
                <Trans>
                  {errors.products.message}
                </Trans>
              </div>
            )}
          </div>
          <div>
            <label htmlFor="excludeProducts">All products except these</label>
            <Controller
              name="excludeProducts"
              control={control}
              render={(props) => (
                <ReactSelect
                  onChange={props.field.onChange}
                  value={props.field.value}
                  options={products}
                  isMulti
                  isLoading={isProductsLoading}
                  closeMenuOnSelect={false}
                />
              )}
            />

            {errors.excludeProducts && (
              <div className="text-danger-500 text-sm">
                <Trans>
                  {errors.excludeProducts.message}
                </Trans>
              </div>
            )}
          </div>
          <div>
            <label htmlFor="" className="block w-full">&nbsp;</label>
            <Button variant="primary" type="submit" disabled={creating}>
              {creating ? 'Saving...' : (operation === 'create' ? 'Create new' : 'Update')}
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
        </div>
      </form>

      <TableComponent
        columns={columns}
        useLoadList={useLoadHook}
      />

      <Modal open={terminalProducts.length > 0} onClose={() => {
        setTerminalProducts([]);
      }} title="Terminal products" size="full">
        <div className="w-full mb-3">
          <Input type="search" placeholder="Filter products" onChange={(e) => setFilter(e.target.value)} value={filter} />
        </div>

        {/*TODO: implement removal of products*/}
        <div className="flex flex-wrap gap-3">
          {terminalProductsFilter.map(item => (
            <span className="pl-3 rounded-full inline-flex justify-center items-center bg-primary-500 text-white h-[40px]">
              {item.name}
              <button className="ml-3 bg-white text-danger-500 rounded-full h-[40px] w-[40px] border-2" title={`Remove ${item.name}?`}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </span>
          ))}
        </div>
      </Modal>
    </>
  );
}
