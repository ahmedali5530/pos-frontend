import {Input} from "../../../input";
import {Trans, useTranslation} from "react-i18next";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPencilAlt, faTrash} from "@fortawesome/free-solid-svg-icons";
import {Button} from "../../../button";
import React, {useEffect, useState} from "react";
import {fetchJson} from "../../../../../api/request/request";
import {BRAND_CREATE, BRAND_EDIT, BRAND_LIST, STORE_LIST} from "../../../../../api/routing/routes/backend.app";
import {Controller, useForm} from "react-hook-form";
import {UnprocessableEntityException} from "../../../../../lib/http/exception/http.exception";
import {ConstraintViolation} from "../../../../../lib/validator/validation.result";
import {Brand} from "../../../../../api/model/brand";
import {useLoadList} from "../../../../../api/hooks/use.load.list";
import {createColumnHelper} from "@tanstack/react-table";
import {TableComponent} from "../../../../../app-common/components/table/table";
import {ReactSelect} from "../../../../../app-common/components/input/custom.react.select";
import {Store} from "../../../../../api/model/store";
import {ReactSelectOptionProps} from "../../../../../api/model/common";
import {useSelector} from "react-redux";
import {getAuthorizedUser} from "../../../../../duck/auth/auth.selector";
import {getStore} from "../../../../../duck/store/store.selector";

export const Brands = () => {
  const [operation, setOperation] = useState('create');

  const useLoadHook = useLoadList<Brand>(BRAND_LIST);
  const [state, action] = useLoadHook;
  const user = useSelector(getAuthorizedUser);
  const store = useSelector(getStore);

  const {t} = useTranslation();

  const columnHelper = createColumnHelper<Brand>();

  const columns: any = [
    columnHelper.accessor('name', {
      header: () => t('Name'),
    })
  ];

  if (user?.roles?.includes('ROLE_ADMIN')){
    columns.push(columnHelper.accessor('stores', {
      header: () => t('Stores'),
      enableSorting: false,
      cell: (info) => info.getValue().map(item => item.name).join(', ')
    }));
  }

  columns.push(columnHelper.accessor('id', {
    header: () => t('Actions'),
    enableSorting: false,
    cell: (info) => {
      return (
        <>
          <Button type="button" variant="primary" className="w-[40px]" onClick={() => {
            reset({
              ...info.row.original,
              stores: info.row.original?.stores?.map(item => {
                return {value: item.id, label: item.name}
              })
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
  }));

  const {register, handleSubmit, setError, formState: {errors}, reset, control} = useForm();
  const [creating, setCreating] = useState(false);

  const createBrand = async (values: any) => {
    setCreating(true);
    try {
      let url = '';
      if (values.id) {
        url = BRAND_EDIT.replace(':id', values.id);
      } else {
        url = BRAND_CREATE;
      }

      if(values.stores){
        values.stores = values.stores.map((item: ReactSelectOptionProps) => item.value);
      }

      await fetchJson(url, {
        method: 'POST',
        body: JSON.stringify({
          ...values,
          type: 'product',
          isActive: true
        })
      });

      await action.loadList();

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

  const [stores, setStores] = useState<Store[]>([]);
  const loadStores = async () => {
    try{
      const res = await fetchJson(STORE_LIST);
      setStores(res.list);
    }catch (e){
      throw e;
    }
  };

  useEffect(() => {
    loadStores();
  }, []);

  const resetForm = () => {
    reset({
      id: null,
      name: null,
      stores: null
    });
  };


  return (
    <>
      <h3 className="text-xl">Create Brand</h3>
      <form onSubmit={handleSubmit(createBrand)} className="mb-5">
        <input type="hidden" {...register('id')}/>
        <div className="grid grid-cols-4 gap-4 mb-3">
          <div>
            <label htmlFor="name">Name</label>
            <Input {...register('name')} id="name" className="w-full"/>
            {errors.name && (
              <div className="text-rose-500 text-sm">
                <Trans>
                  {errors.name.message}
                </Trans>
              </div>
            )}
          </div>
          {user?.roles?.includes('ROLE_ADMIN') && (
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
                <div className="text-rose-500 text-sm">
                  <Trans>
                    {errors.stores.message}
                  </Trans>
                </div>
              )}
            </div>
          )}
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
        params={{
          store: store?.id
        }}
        loaderLineItems={2}
      />
    </>
  );
};
