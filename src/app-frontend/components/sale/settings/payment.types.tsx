import React, {useState} from "react";
import {useLoadList} from "../../../../api/hooks/use.load.list";
import {PAYMENT_TYPE_LIST, PAYMENT_TYPE_CREATE, PAYMENT_TYPE_GET,} from "../../../../api/routing/routes/backend.app";
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
import {PaymentType} from "../../../../api/model/payment.type";
import localforage from "../../../../lib/localforage/localforage";
import {Switch} from "../../../../app-common/components/input/switch";
import {ReactSelect} from "../../../../app-common/components/input/custom.react.select";

export const PaymentTypes = () => {
  const [operation, setOperation] = useState('create');

  const useLoadHook = useLoadList<PaymentType>(PAYMENT_TYPE_LIST);
  const [state, action] = useLoadHook;

  const {t} = useTranslation();

  const columnHelper = createColumnHelper<PaymentType>();

  const columns = [
    columnHelper.accessor('name', {
      header: () => t('Name'),
    }),
    columnHelper.accessor('type', {
      header: () => t('Type'),
    }),
    columnHelper.accessor('canHaveChangeDue', {
      header: () => t('Can accept amount greater then total?'),
      cell: info => info.getValue() ? 'Yes' : 'No'
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
                type: {
                  label: info.row.original.type,
                  value: info.row.original.type
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

  const createPaymentType = async (values: any) => {
    setCreating(true);
    try {
      let url = '';
      if (values.id) {
        url = PAYMENT_TYPE_GET.replace(':id', values.id);
      } else {
        url = PAYMENT_TYPE_CREATE;
      }

      if(values.type){
        values.type = values.type.value;
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
      id: null,
      name: null
    });
  };

  return (
    <>
      <h3 className="text-xl">Create Payment Type</h3>
      <form onSubmit={handleSubmit(createPaymentType)} className="mb-5">
        <input type="hidden" {...register('id')}/>
        <div className="grid grid-cols-5 gap-4 mb-3">
          <div>
            <label htmlFor="name">Name</label>
            <Input {...register('name')} id="name" className="w-full"/>
            {errors.name && (
              <div className="text-red-500 text-sm">
                <Trans>
                  {errors.name.message}
                </Trans>
              </div>
            )}
          </div>
          <div>
            <label htmlFor="type">Type</label>
            <Controller
              name="type"
              control={control}
              render={(props) => (
                <ReactSelect
                  onChange={props.field.onChange}
                  value={props.field.value}
                  options={[{
                    label: 'cash',
                    value: 'cash'
                  }, {
                    label: 'credit card',
                    value: 'credit card'
                  }, {
                    label: 'credit',
                    value: 'credit'
                  }]}
                />
              )}
            />
            {errors.type && (
              <div className="text-red-500 text-sm">
                <Trans>
                  {errors.type.message}
                </Trans>
              </div>
            )}
          </div>
          <div className="col-span-2">
            <label className="w-full block">&nbsp;</label>
            <Controller
              control={control}
              name="canHaveChangeDue"
              render={(props) => (
                <Switch
                  checked={props.field.value}
                  onChange={props.field.onChange}
                >
                  Can accept amount greater then total?
                </Switch>
              )}
            />
            {errors.type && (
              <div className="text-red-500 text-sm">
                <Trans>
                  {errors.type.message}
                </Trans>
              </div>
            )}
          </div>
          <div>
            <label className="block w-full">&nbsp;</label>
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
