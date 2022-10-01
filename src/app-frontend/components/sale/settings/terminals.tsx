import React, {useEffect, useState} from 'react';
import {useLoadList} from "../../../../api/hooks/use.load.list";
import {STORE_LIST, TERMINAL_CREATE, TERMINAL_GET, TERMINAL_LIST} from "../../../../api/routing/routes/backend.app";
import {Trans, useTranslation} from "react-i18next";
import {createColumnHelper} from "@tanstack/react-table";
import {Button} from "../../button";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPencilAlt, faTrash} from "@fortawesome/free-solid-svg-icons";
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

export const Terminals = () => {
  const [operation, setOperation] = useState('create');

  const useLoadHook = useLoadList<Terminal>(TERMINAL_LIST);
  const [state, action] = useLoadHook;

  const {t} = useTranslation();

  const columnHelper = createColumnHelper<Terminal>();

  const columns = [
    columnHelper.accessor('code', {
      header: () => t('Code'),
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
              reset(info.row.original);
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

  useEffect(() => {
    loadStores();
  }, []);

  const resetForm = () => {
    reset({
      name: null,
      code: null,
      id: null,
      store: null
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
              <div className="text-rose-500 text-sm">
                <Trans>
                  {errors.code.message}
                </Trans>
              </div>
            )}
          </div>
          <div>
            <label htmlFor="store">Stores</label>
            <Controller
              name="store"
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
                />
              )}
            />

            {errors.store && (
              <div className="text-rose-500 text-sm">
                <Trans>
                  {errors.store.message}
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
}
