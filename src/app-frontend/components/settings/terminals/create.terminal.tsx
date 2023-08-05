import React, {FC, useEffect, useState} from "react";
import {Modal} from "../../../../app-common/components/modal/modal";
import {Input} from "../../../../app-common/components/input/input";
import {Trans} from "react-i18next";
import {StoresInput} from "../../../../app-common/components/input/stores";
import {Controller, useForm} from "react-hook-form";
import {ReactSelect} from "../../../../app-common/components/input/custom.react.select";
import {Button} from "../../../../app-common/components/input/button";
import { notification } from 'antd';

import {
  CATEGORY_LIST,
  PRODUCT_KEYWORDS, STORE_LIST,
  TERMINAL_CREATE, TERMINAL_EDIT,
  TERMINAL_GET
} from "../../../../api/routing/routes/backend.app";
import {ReactSelectOptionProps} from "../../../../api/model/common";
import {fetchJson, jsonRequest} from "../../../../api/request/request";
import {HttpException, UnprocessableEntityException} from "../../../../lib/http/exception/http.exception";
import {ConstraintViolation, ValidationResult} from "../../../../lib/validator/validation.result";
import {Category} from "../../../../api/model/category";
import * as yup from "yup";
import {ValidationMessage} from "../../../../api/model/validation";
import {Terminal} from "../../../../api/model/terminal";
import {yupResolver} from "@hookform/resolvers/yup";
import {getErrorClass, getErrors, hasErrors} from "../../../../lib/error/error";
import {Store} from "../../../../api/model/store";
import {notify} from "../../../../app-common/components/confirm/notification";
import useApi from "../../../../api/hooks/use.api";
import { HydraCollection } from "../../../../api/model/hydra";
import { Product } from "../../../../api/model/product";

interface CreateTerminalProps{
  entity?: Terminal;
  operation?: string;
  addModal: boolean;
  onClose?: () => void;
}

const ValidationSchema = yup.object({
  code: yup.string().required(ValidationMessage.Required),
  store: yup.object().required(ValidationMessage.Required)
}).required();

export const CreateTerminal: FC<CreateTerminalProps> = ({
  entity, onClose, operation, addModal
}) => {
  const {register, handleSubmit, setError, formState: {errors}, reset, control} = useForm({
    resolver: yupResolver(ValidationSchema)
  });
  const [creating, setCreating] = useState(false);
  const [modal, setModal] = useState(false);
  const {data: stores, fetchData: loadStores} = useApi<HydraCollection<Store>>('stores', STORE_LIST);

  useEffect(() => {
    setModal(addModal);
  }, [addModal]);

  useEffect(() => {
    if (entity) {
      reset({
        ...entity,
        products: entity.products.map(item => {
          return {
            label: item.name,
            value: item.id
          }
        }),
        store: {
          value: entity?.store?.id,
          label: entity?.store?.name
        }
      });
    }
  }, [entity]);

  const createTerminal = async (values: any) => {
    setCreating(true);
    try {
      let url, method = 'POST';
      if (values.id) {
        method = 'PUT';
        url = TERMINAL_EDIT.replace(':id', values.id);
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

      await jsonRequest(url, {
        method: method,
        body: JSON.stringify({
          ...values,
        })
      });

      onModalClose();

    } catch (exception: any) {
      if(exception instanceof HttpException){
        if(exception.message){
          notify({
            title: 'Error',
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

        if(e.errorMessage){
          notify({
            title: 'Error',
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

  const [isProductsLoading, setProductsLoading] = useState(false);
  const [products, setProducts] = useState<ReactSelectOptionProps[]>([]);
  const loadProducts = async () => {
    setProductsLoading(true);

    try{
      const res: {list: Product[]} = await fetchJson(PRODUCT_KEYWORDS);
      setProducts(res.list.map(item => ({
        label: item.name,
        value: item["@id"]!
      })));
    }catch (e){
      throw e;
    }finally {
      setProductsLoading(false);
    }
  };

  const {
    data: categories,
    fetchData: loadCategories,
    isLoading: isCategoriesLoading
  } = useApi<HydraCollection<Category>>('categories', CATEGORY_LIST, {
    isActive: true
  })

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

  const onModalClose = () => {
    resetForm();
    onClose && onClose();
  }

  return (
    <Modal
      open={modal}
      onClose={onModalClose}
      title={operation === 'create' ? 'Create terminal' : 'Update terminal'}
    >
      <form onSubmit={handleSubmit(createTerminal)} className="mb-5">
        <input type="hidden" {...register('id')}/>
        <div className="grid grid-cols-1 gap-4 mb-3">
          <div>
            <label htmlFor="code">Code</label>
            <Input {...register('code')} id="code" className="w-full" hasError={hasErrors(errors.code)}/>
            {getErrors(errors.code)}
          </div>
          <div>
            <label htmlFor="store">Store</label>
            <Controller
              name="store"
              control={control}
              render={(props) => (
                <ReactSelect
                  onChange={props.field.onChange}
                  value={props.field.value}
                  options={stores?.['hydra:member']?.map(item => {
                    return {
                      label: item.name,
                      value: item.id
                    }
                  })}
                  className={getErrorClass(errors.store)}
                />
              )}
            />

            {getErrors(errors.store)}
          </div>
          <div>
            <label htmlFor="categories">Categories</label>
            <Controller
              name="categories"
              control={control}
              render={(props) => (
                <ReactSelect
                  onChange={props.field.onChange}
                  value={props.field.value}
                  options={categories?.['hydra:member']?.map(item => {
                    return {
                      label: item.name,
                      value: item.id
                    }
                  })}
                  isMulti
                  isLoading={isCategoriesLoading}
                  closeMenuOnSelect={false}
                  className={getErrorClass(errors.categories)}
                />
              )}
            />

            {getErrors(errors.categories)}
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
                  className={getErrorClass(errors.products)}
                />
              )}
            />

            {getErrors(errors.products)}
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
                  className={getErrorClass(errors.excludeProducts)}
                />
              )}
            />

            {getErrors(errors.excludeProducts)}
          </div>
          <div>
            <Button variant="primary" type="submit" disabled={creating}>
              {creating ? 'Saving...' : (operation === 'create' ? 'Create new' : 'Update')}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
