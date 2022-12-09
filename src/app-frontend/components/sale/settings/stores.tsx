import React, {useState} from "react";
import {useLoadList} from "../../../../api/hooks/use.load.list";
import {STORE_LIST, STORE_CREATE, STORE_EDIT,} from "../../../../api/routing/routes/backend.app";
import {Trans, useTranslation} from "react-i18next";
import {createColumnHelper} from "@tanstack/react-table";
import {Button} from "../../button";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPencilAlt, faTrash} from "@fortawesome/free-solid-svg-icons";
import {useForm} from "react-hook-form";
import {fetchJson} from "../../../../api/request/request";
import {HttpException, UnprocessableEntityException} from "../../../../lib/http/exception/http.exception";
import {ConstraintViolation, ValidationResult} from "../../../../lib/validator/validation.result";
import {Input} from "../../input";
import {TableComponent} from "../../../../app-common/components/table/table";
import {Store} from "../../../../api/model/store";
import {useAlert} from "react-alert";

export const Stores = () => {
  const [operation, setOperation] = useState('create');

  const useLoadHook = useLoadList<Store>(STORE_LIST);
  const [state, action] = useLoadHook;

  const {t} = useTranslation();

  const columnHelper = createColumnHelper<Store>();

  const columns = [
    columnHelper.accessor('name', {
      header: () => t('Name'),
    }),
    columnHelper.accessor('location', {
      header: () => t('Location'),
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


  const {register, handleSubmit, setError, formState: {errors}, reset} = useForm();
  const [creating, setCreating] = useState(false);
  const alert = useAlert();

  const createStore = async (values: any) => {
    setCreating(true);
    try {
      let url = '';
      if (values.id) {
        url = STORE_EDIT.replace(':id', values.id);
      } else {
        url = STORE_CREATE;
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

  const resetForm = () => {
    reset({
      name: null,
      location: null,
      id: null
    });
  };

  return (
    <>
      <h3 className="text-xl">Create Store</h3>
      <form onSubmit={handleSubmit(createStore)} className="mb-5">
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
            <label htmlFor="location">Location</label>
            <Input {...register('location')} id="location" className="w-full"/>
            {errors.location && (
              <div className="text-danger-500 text-sm">
                <Trans>
                  {errors.location.message}
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
