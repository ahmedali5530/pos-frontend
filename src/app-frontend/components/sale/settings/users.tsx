import React, {useEffect, useState} from "react";
import {useLoadList} from "../../../../api/hooks/use.load.list";
import {USER_LIST, USER_CREATE, USER_EDIT, STORE_LIST,} from "../../../../api/routing/routes/backend.app";
import {Trans, useTranslation} from "react-i18next";
import {createColumnHelper} from "@tanstack/react-table";
import {Button} from "../../button";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPencilAlt, faTrash} from "@fortawesome/free-solid-svg-icons";
import {Controller, useForm} from "react-hook-form";
import {fetchJson, jsonRequest} from "../../../../api/request/request";
import {HttpException, UnprocessableEntityException} from "../../../../lib/http/exception/http.exception";
import {ConstraintViolation, ValidationResult} from "../../../../lib/validator/validation.result";
import {Input} from "../../input";
import {TableComponent} from "../../../../app-common/components/table/table";
import {useAlert} from "react-alert";
import {User} from "../../../../api/model/user";
import {ReactSelect} from "../../../../app-common/components/input/custom.react.select";
import {ReactSelectOptionProps} from "../../../../api/model/common";
import { Store } from "../../../../api/model/store";

export const Users = () => {
  const [operation, setOperation] = useState('create');

  const useLoadHook = useLoadList<User>(USER_LIST);
  const [state, action] = useLoadHook;

  const {t} = useTranslation();

  const columnHelper = createColumnHelper<User>();

  const columns = [
    columnHelper.accessor('displayName', {
      header: () => t('Name'),
    }),
    columnHelper.accessor('username', {
      header: () => t('Username'),
    }),
    columnHelper.accessor('email', {
      header: () => t('Email'),
    }),
    columnHelper.accessor('roles', {
      header: () => t('Roles'),
      cell: info => info.getValue().join(', ')
    }),
    columnHelper.accessor('stores', {
      header: () => t('Stores'),
      cell: info => info.getValue().map(item => item.name).join(', ')
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
                roles: info.row.original.roles.map(item => {
                  return {
                    label: item,
                    value: item
                  }
                }),
                stores: info.row.original.stores.map(item => {
                  return {
                    label: item.name,
                    value: item.id
                  }
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
    })
  ];


  const {register, handleSubmit, setError, formState: {errors}, reset, control} = useForm();
  const [creating, setCreating] = useState(false);
  const alert = useAlert();

  const createUser = async (values: any) => {
    setCreating(true);
    try {
      let url = '';
      if (values.id) {
        url = USER_EDIT.replace(':id', values.id);
      } else {
        url = USER_CREATE;
      }

      if(values.roles){
        values.roles = values.roles.map((item: ReactSelectOptionProps) => item.value);
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

  const [stores, setStores] = useState<Store[]>([]);
  const loadStores = async () => {
    try{
      const res = await fetchJson(STORE_LIST);
      setStores(res.list);
    }catch (e){
      throw e;
    }
  };

  const resetForm = () => {
    reset({
      displayName: null,
      email: null,
      username: null,
      password: null,
      roles: null,
      id: null,
      stores: null
    });
  };

  useEffect(() => {
    loadStores();
  }, []);

  return (
    <>
      <h3 className="text-xl">Create User</h3>
      <form onSubmit={handleSubmit(createUser)} className="mb-5">
        <input type="hidden" {...register('id')}/>
        <div className="grid grid-cols-4 gap-4 mb-3">
          <div>
            <label htmlFor="displayName">Name</label>
            <Input {...register('displayName')} id="displayName" className="w-full"/>
            {errors.displayName && (
              <div className="text-danger-500 text-sm">
                <Trans>
                  {errors.displayName.message}
                </Trans>
              </div>
            )}
          </div>
          <div>
            <label htmlFor="username">Username</label>
            <Input {...register('username')} id="username" className="w-full"/>
            {errors.username && (
              <div className="text-danger-500 text-sm">
                <Trans>
                  {errors.username.message}
                </Trans>
              </div>
            )}
          </div>
          <div>
            <label htmlFor="password">Password</label>
            <Input {...register('password')} type="password" id="password" className="w-full"/>
            {errors.password && (
              <div className="text-danger-500 text-sm">
                <Trans>
                  {errors.password.message}
                </Trans>
              </div>
            )}
          </div>
          <div>
            <label htmlFor="email">Email</label>
            <Input {...register('email')} id="email" className="w-full"/>
            {errors.email && (
              <div className="text-danger-500 text-sm">
                <Trans>
                  {errors.email.message}
                </Trans>
              </div>
            )}
          </div>
          <div>
            <label htmlFor="roles">Roles</label>
            <Controller
              name="roles"
              control={control}
              render={(props) => (
                <ReactSelect
                  onChange={props.field.onChange}
                  value={props.field.value}
                  options={[{
                    label: 'ROLE_USER',
                    value: 'ROLE_USER'
                  }, {
                    label: 'ROLE_ADMIN',
                    value: 'ROLE_ADMIN'
                  }]}
                  isMulti
                />
              )}
            />

            {errors.roles && (
              <div className="text-danger-500 text-sm">
                <Trans>
                  {errors.roles.message}
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
    </>
  );
};
