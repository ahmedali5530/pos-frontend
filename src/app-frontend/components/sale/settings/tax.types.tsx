import React, {useEffect, useState} from "react";
import {useLoadList} from "../../../../api/hooks/use.load.list";
import {TAX_LIST, TAX_CREATE, TAX_GET, STORE_LIST,} from "../../../../api/routing/routes/backend.app";
import {Trans, useTranslation} from "react-i18next";
import {createColumnHelper} from "@tanstack/react-table";
import {Button} from "../../button";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPencilAlt, faTrash} from "@fortawesome/free-solid-svg-icons";
import {Controller, useForm} from "react-hook-form";
import {fetchJson} from "../../../../api/request/request";
import {HttpException, UnprocessableEntityException} from "../../../../lib/http/exception/http.exception";
import {ConstraintViolation, ValidationResult} from "../../../../lib/validator/validation.result";
import {Input} from "../../input";
import {TableComponent} from "../../../../app-common/components/table/table";
import {useAlert} from "react-alert";
import {Tax} from "../../../../api/model/tax";
import {Store} from "../../../../api/model/store";
import {getAuthorizedUser} from "../../../../duck/auth/auth.selector";
import {useSelector} from "react-redux";
import { ReactSelect } from "../../../../app-common/components/input/custom.react.select";
import {getStore} from "../../../../duck/store/store.selector";
import {StoresInput} from "../../../../app-common/components/input/stores";

export const TaxTypes = () => {
  const [operation, setOperation] = useState('create');

  const useLoadHook = useLoadList<Tax>(TAX_LIST);
  const {fetchData} = useLoadHook;
  const user = useSelector(getAuthorizedUser);
  const store = useSelector(getStore);

  const {t} = useTranslation();

  const columnHelper = createColumnHelper<Tax>();

  const columns: any = [
    columnHelper.accessor('name', {
      header: () => t('Name'),
    }),
    columnHelper.accessor('rate', {
      header: () => t('Rate'),
    })
  ];

  // if (user?.roles?.includes('ROLE_ADMIN')){
    columns.push(columnHelper.accessor('stores', {
      header: () => t('Stores'),
      enableSorting: false,
      cell: (info) => info.getValue().map(item => item.name).join(', ')
    }));
  // }

  columns.push(columnHelper.accessor('id', {
    header: () => t('Actions'),
    enableSorting: false,
    cell: (info) => {
      return (
        <>
          <Button type="button" variant="primary" className="w-[40px]" onClick={() => {
            reset({
              ...info.row.original,
              stores: info.row.original.stores.map(item => ({
                label: item.name,
                value: item.id
              }))
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
  const alert = useAlert();

  const createTax = async (values: any) => {
    setCreating(true);
    try {
      let url = '';
      if (values.id) {
        url = TAX_GET.replace(':id', values.id);
      } else {
        url = TAX_CREATE;
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

  const resetForm = () => {
    reset({
      id: null,
      name: null,
      rate: null,
      stores: null
    });
  };

  return (
    <>
      <h3 className="text-xl">Create Tax</h3>
      <form onSubmit={handleSubmit(createTax)} className="mb-5">
        <input type="hidden" {...register('id')}/>
        <div className="grid grid-cols-5 gap-4 mb-3">
          <div>
            <label htmlFor="name">Name</label>
            <Input {...register('name')} id="name" className="w-full"/>
            {errors.name && (
              <div className="text-danger-500 text-sm">
                <Trans>
                  {errors.name.message}
                </Trans>
              </div>
            )}
          </div>
          <div>
            <label htmlFor="rate">Rate</label>
            <Input {...register('rate')} id="rate" className="w-full"/>
            {errors.rate && (
              <div className="text-danger-500 text-sm">
                <Trans>
                  {errors.rate.message}
                </Trans>
              </div>
            )}
          </div>

          <StoresInput control={control} errors={errors} />

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
