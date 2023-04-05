import {Input} from "../../input";
import {Trans, useTranslation} from "react-i18next";
import {Button} from "../../button";
import React, {useState} from "react";
import {fetchJson} from "../../../../api/request/request";
import {SUPPLIER_CREATE, SUPPLIER_EDIT, SUPPLIER_LIST} from "../../../../api/routing/routes/backend.app";
import {useForm} from "react-hook-form";
import {UnprocessableEntityException} from "../../../../lib/http/exception/http.exception";
import {ConstraintViolation} from "../../../../lib/validator/validation.result";
import {Supplier} from "../../../../api/model/supplier";
import {TableComponent} from "../../../../app-common/components/table/table";
import {useLoadList} from "../../../../api/hooks/use.load.list";
import {createColumnHelper} from "@tanstack/react-table";
import {useSelector} from "react-redux";
import {getAuthorizedUser} from "../../../../duck/auth/auth.selector";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPencilAlt, faTrash} from "@fortawesome/free-solid-svg-icons";
import {ReactSelectOptionProps} from "../../../../api/model/common";
import {getStore} from "../../../../duck/store/store.selector";
import {StoresInput} from "../../../../app-common/components/input/stores";

export const Suppliers = () => {
  const [operation, setOperation] = useState('create');

  const useLoadHook = useLoadList<Supplier>(SUPPLIER_LIST);
  const {fetchData} = useLoadHook;

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
    }),
    columnHelper.accessor('openingBalance', {
      header: () => t('Opening balance'),
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
          <span className="mx-2 text-gray-300">|</span>
          <Button variant="secondary" type="button">Ledger</Button>
        </>
      )
    }
  }));


  const {register, handleSubmit, setError, formState: {errors}, reset, control} = useForm();
  const [creating, setCreating] = useState(false);

  const createSupplier = async (values: any) => {
    setCreating(true);
    try {
      let url: string;
      if (values.id) {
        url = SUPPLIER_EDIT.replace(':id', values.id);
      } else {
        url = SUPPLIER_CREATE;
      }

      if (values.stores) {
        values.stores = values.stores.map((item: ReactSelectOptionProps) => item.value);
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

  const resetForm = () => {
    reset({
      email: null,
      id: null,
      stores: null,
      phone: null,
      name: null,
      openingBalance: null
    });
  };


  return (
    <>
      <h3 className="text-xl">Create Supplier</h3>
      <form onSubmit={handleSubmit(createSupplier)} className="mb-5">
        <input type="hidden" {...register('id')}/>
        <div className="grid lg:grid-cols-5 gap-4 mb-3 md:grid-cols-3 sm:grid-cols-1">
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
            <label htmlFor="phone">Phone</label>
            <Input {...register('phone')} id="phone" className="w-full"/>
            {errors.phone && (
              <div className="text-danger-500 text-sm">
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
              <div className="text-danger-500 text-sm">
                <Trans>
                  {errors.email.message}
                </Trans>
              </div>
            )}
          </div>
          <div>
            <label htmlFor="openingBalance">Opening balance</label>
            <Input {...register('openingBalance')} id="openingBalance" className="w-full"/>
            {errors.openingBalance && (
              <div className="text-danger-500 text-sm">
                <Trans>
                  {errors.openingBalance.message}
                </Trans>
              </div>
            )}
          </div>

          <StoresInput control={control} errors={errors}/>

          <div>
            <label htmlFor="" className="md:block w-full sm:hidden">&nbsp;</label>
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
