import React, {useEffect, useState} from "react";
import {useLoadList} from "../../../../api/hooks/use.load.list";
import {DISCOUNT_CREATE, DISCOUNT_GET, DISCOUNT_LIST, STORE_LIST,} from "../../../../api/routing/routes/backend.app";
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
import {Discount} from "../../../../api/model/discount";
import {ReactSelect} from "../../../../app-common/components/input/custom.react.select";
import {ReactSelectOptionProps} from "../../../../api/model/common";
import {getAuthorizedUser} from "../../../../duck/auth/auth.selector";
import {useSelector} from "react-redux";
import {Store} from "../../../../api/model/store";
import Cookies from "js-cookie";

export const DiscountTypes = () => {
  const [operation, setOperation] = useState('create');

  const useLoadHook = useLoadList<Discount>(DISCOUNT_LIST);
  const [state, action] = useLoadHook;
  const user = useSelector(getAuthorizedUser);

  const {t} = useTranslation();

  const columnHelper = createColumnHelper<Discount>();

  const columns: any = [
    columnHelper.accessor('name', {
      header: () => t('Name'),
    }),
    columnHelper.accessor('rate', {
      header: () => t('Rate'),
    }),
    columnHelper.accessor('rateType', {
      header: () => t('Rate Type'),
    }),
    columnHelper.accessor('scope', {
      header: () => t('Discount type'),
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
              rateType: {
                label: info.row.original.rateType,
                value: info.row.original.rateType
              },
              scope: {
                label: info.row.original.scope,
                value: info.row.original.scope,
              },
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

  const createDiscount = async (values: any) => {
    setCreating(true);
    try {
      let url = '';
      if (values.id) {
        url = DISCOUNT_GET.replace(':id', values.id);
      } else {
        url = DISCOUNT_CREATE;
      }

      if(values.stores){
        values.stores = values.stores.map((item: ReactSelectOptionProps) => item.value);
      }

      if(values.rateType){
        values.rateType = values.rateType.value;
      }

      if(values.scope){
        values.scope = values.scope.value;
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
      if (exception instanceof HttpException) {
        if (exception.message) {
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

        if (e.errorMessage) {
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
      rate: null,
      rateType: null,
      scope: null,
      name: null,
      stores: null
    });
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

  return (
    <>
      <h3 className="text-xl">Create Discount</h3>
      <form onSubmit={handleSubmit(createDiscount)} className="mb-5">
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
          <div>
            <label htmlFor="rate">Rate</label>
            <Input {...register('rate')} id="rate" className="w-full"/>
            {errors.rate && (
              <div className="text-rose-500 text-sm">
                <Trans>
                  {errors.rate.message}
                </Trans>
              </div>
            )}
          </div>
          <div>
            <label htmlFor="rateType">Rate type</label>
            <Controller
              name="rateType"
              control={control}
              render={(props) => (
                <ReactSelect
                  onChange={props.field.onChange}
                  value={props.field.value}
                  options={[{
                    label: 'percent',
                    value: 'percent'
                  }, {
                    label: 'fixed',
                    value: 'fixed'
                  }]}
                />
              )}
            />
            {errors.rateType && (
              <div className="text-rose-500 text-sm">
                <Trans>
                  {errors.rateType.message}
                </Trans>
              </div>
            )}
          </div>
          <div>
            <label htmlFor="scope">Discount type</label>
            <Controller
              name="scope"
              control={control}
              render={(props) => (
                <ReactSelect
                  onChange={props.field.onChange}
                  value={props.field.value}
                  options={[{
                    label: 'exact',
                    value: 'exact'
                  }, {
                    label: 'open',
                    value: 'open'
                  }]}
                />
              )}
            />
            {errors.scope && (
              <div className="text-rose-500 text-sm">
                <Trans>
                  {errors.scope.message}
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
          store: JSON.parse(Cookies.get('store') as string).id
        }}
        loaderLineItems={4}
      />
    </>
  );
};
