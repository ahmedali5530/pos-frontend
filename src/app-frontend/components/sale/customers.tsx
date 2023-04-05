import React, {FC, useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPencilAlt, faTrash, faUsers} from "@fortawesome/free-solid-svg-icons";
import {Button} from "../button";
import {Modal} from "../modal";
import {Customer} from "../../../api/model/customer";
import {fetchJson} from "../../../api/request/request";
import {useForm} from "react-hook-form";
import {Input} from "../input";
import {faSquare, faSquareCheck} from "@fortawesome/free-regular-svg-icons";
import {CustomerPayments} from "./customer.payments";
import {CUSTOMER_CREATE, CUSTOMER_EDIT, CUSTOMER_LIST} from "../../../api/routing/routes/backend.app";
import {ConstraintViolation} from "../../../lib/validator/validation.result";
import {Trans, useTranslation} from "react-i18next";
import {UnprocessableEntityException} from "../../../lib/http/exception/http.exception";
import {useLoadList} from "../../../api/hooks/use.load.list";
import {createColumnHelper} from "@tanstack/react-table";
import {TableComponent} from "../../../app-common/components/table/table";
import {Shortcut} from "../../../app-common/components/input/shortcut";


interface Props {
  customer?: Customer;
  setCustomer: (customer?: Customer) => void;
}

export const Customers: FC<Props> = ({
  customer, setCustomer
}) => {
  const [modal, setModal] = useState(false);
  const [operation, setOperation] = useState('create');

  const useLoadHook = useLoadList<Customer>(CUSTOMER_LIST);
  const {fetchData} = useLoadHook;

  const {t} = useTranslation();

  const columnHelper = createColumnHelper<Customer>();

  const columns = [
    columnHelper.accessor('name', {
      header: () => t('Name'),
      enableSorting: false,
    }),
    columnHelper.accessor('phone', {
      header: () => t('Phone'),
      enableSorting: false,
    }),
    columnHelper.accessor('cnic', {
      header: () => t('CNIC Number'),
      enableSorting: false,
    }),
    columnHelper.accessor('openingBalance', {
      header: () => t('Opening balance'),
    }),
    columnHelper.accessor('sale', {
      header: () => t('Credit Sale'),
      enableSorting: false,
    }),
    columnHelper.accessor('paid', {
      header: () => t('Payments'),
      enableSorting: false,
    }),
    columnHelper.accessor('outstanding', {
      header: () => t('Balance'),
      enableSorting: false,
    }),
    columnHelper.accessor('id', {
      header: () => t('Select'),
      cell: info => (
        <>
          {customer?.id === info.getValue() ? (
            <Button variant="success" onClick={() => setCustomer(undefined)} className="w-[40px]"
                    type="button">
              <FontAwesomeIcon icon={faSquareCheck} size="lg"/>
            </Button>
          ) : (
            <Button
              onClick={() => setCustomer(info.row.original)}
              disabled={customer?.id === info.getValue()}
              className="w-[40px]"
            >
              <FontAwesomeIcon icon={faSquare} size="lg"/>
            </Button>
          )}
        </>
      ),
      enableSorting: false,
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
              });
              setOperation('update');
            }} tabIndex={-1}>
              <FontAwesomeIcon icon={faPencilAlt}/>
            </Button>
            <span className="mx-2 text-gray-300">|</span>
            <Button variant="danger" type="button">
              <FontAwesomeIcon icon={faTrash}/>
            </Button>
            <span className="mx-2 text-gray-300">|</span>
            <CustomerPayments customer={info.row.original} onCreate={fetchData}/>
          </>
        )
      }
    })
  ];
  const [params, setParams] = useState<{ [key: string]: any }>();

  const {register, handleSubmit, setError, formState: {errors}, reset} = useForm();
  const [creating, setCreating] = useState(false);
  const createCustomer = async (values: any, event?: any) => {
    event.stopPropagation();
    event.preventDefault();

    setCreating(true);
    try {
      let url: string;
      if (values.id) {
        url = CUSTOMER_EDIT.replace(':id', values.id);
      } else {
        url = CUSTOMER_CREATE;
      }

      const response = await fetchJson(url, {
        method: 'POST',
        body: JSON.stringify(values)
      });

      setCustomer(response.customer);

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

  const mergeFilters = (filters: any) => {
    setParams(prev => {
      return {...prev, ...filters};
    });
  };

  const resetForm = () => {
    reset({
      name: null,
      phone: null,
      cnic: null,
      openingBalance: null
    });
  };

  return (
    <>
      <Button variant="primary" type="button" size="lg" onClick={() => {
        setModal(true);
      }} title="Customers">
        <FontAwesomeIcon icon={faUsers} className="mr-2"/> Customers
        <Shortcut shortcut="ctrl+c" handler={() => setModal(true)}/>
      </Button>

      <Modal shouldCloseOnEsc={false} open={modal} onClose={() => {
        setModal(false);
      }} title="Customers" size="full">
        <form className="mb-5" onSubmit={handleSubmit(createCustomer)}>
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
              <label htmlFor="cnic">CNIC Number</label>
              <Input {...register('cnic')} id="cnic" className="w-full"/>
              {errors.cnic && (
                <div className="text-danger-500 text-sm">
                  <Trans>
                    {errors.cnic.message}
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
            <div>
              <label className="md:block w-full sm:hidden">&nbsp;</label>
              <Button variant="primary" type="submit"
                      disabled={creating}>
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
          setFilters={mergeFilters}
        />
      </Modal>
    </>
  );
};
