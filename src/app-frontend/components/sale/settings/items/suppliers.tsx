import {Input} from "../../../input";
import {Trans, useTranslation} from "react-i18next";
import {Button} from "../../../button";
import React, {useEffect, useState} from "react";
import {fetchJson} from "../../../../../api/request/request";
import {STORE_LIST, SUPPLIER_CREATE, SUPPLIER_EDIT, SUPPLIER_LIST} from "../../../../../api/routing/routes/backend.app";
import {Controller, useForm} from "react-hook-form";
import {UnprocessableEntityException} from "../../../../../lib/http/exception/http.exception";
import {ConstraintViolation} from "../../../../../lib/validator/validation.result";
import {Supplier} from "../../../../../api/model/supplier";
import {TableComponent} from "../../../../../app-common/components/table/table";
import {useLoadList} from "../../../../../api/hooks/use.load.list";
import {createColumnHelper} from "@tanstack/react-table";
import {useSelector} from "react-redux";
import {getAuthorizedUser} from "../../../../../duck/auth/auth.selector";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPencilAlt, faTrash} from "@fortawesome/free-solid-svg-icons";
import {ReactSelect} from "../../../../../app-common/components/input/custom.react.select";
import {Store} from "../../../../../api/model/store";
import {ReactSelectOptionProps} from "../../../../../api/model/common";
import {getStore} from "../../../../../duck/store/store.selector";

export const Suppliers = () => {
  const [operation, setOperation] = useState('create');

  const useLoadHook = useLoadList<Supplier>(SUPPLIER_LIST);
  const [state, action] = useLoadHook;

  const user = useSelector(getAuthorizedUser);
  const store = useSelector(getStore);

  const {t} = useTranslation();

  const columnHelper = createColumnHelper<Supplier>();

  const columns: any = [
    columnHelper.accessor('name', {
      header: () => t('Name'),
    }),
    columnHelper.accessor('phone', {
      header: () => t('Phone'),
    }),
    columnHelper.accessor('email', {
      header: () => t('Email'),
    })
  ];

  console.log(user?.roles)

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

  const createSupplier = async (values: any) => {
    setCreating(true);
    try {
      let url = '';
      if (values.id) {
        url = SUPPLIER_EDIT.replace(':id', values.id);
      } else {
        url = SUPPLIER_CREATE;
      }

      if(values.stores){
        values.stores = values.stores.map((item: ReactSelectOptionProps) => item.value);
      }

      await fetchJson(url, {
        method: 'POST',
        body: JSON.stringify({
          ...values,
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
      email: null,
      id: null,
      stores: null,
      phone: null,
      name: null
    });
  };


  return (
    <>
      <h3 className="text-xl">Create Supplier</h3>
      <form onSubmit={handleSubmit(createSupplier)} className="mb-5">
        <input type="hidden" {...register('id')}/>
        <div className="grid grid-cols-5 gap-4 mb-3">
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
          <div>
            <label htmlFor="phone">Phone</label>
            <Input {...register('phone')} id="phone" className="w-full"/>
            {errors.phone && (
              <div className="text-rose-500 text-sm">
                <Trans>
                  {errors.phone.message}
                </Trans>
              </div>
            )}
          </div>
          <div>
            <label htmlFor="email">Email</label>
            <Input {...register('email')} id="email" className="w-full"/>
            {errors.email && (
              <div className="text-rose-500 text-sm">
                <Trans>
                  {errors.email.message}
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
        loaderLineItems={4}
      />
    </>
  );
};
