import React, { FC, PropsWithChildren, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencilAlt, faTrash, faUsers } from "@fortawesome/free-solid-svg-icons";
import { Button } from "../../../app-common/components/input/button";
import { Modal } from "../../../app-common/components/modal/modal";
import { Customer } from "../../../api/model/customer";
import { fetchJson } from "../../../api/request/request";
import { useForm } from "react-hook-form";
import { Input } from "../../../app-common/components/input/input";
import { faSquare, faSquareCheck } from "@fortawesome/free-regular-svg-icons";
import { CustomerPayments } from "./customer.payments";
import { CUSTOMER_CREATE, CUSTOMER_EDIT, CUSTOMER_LIST } from "../../../api/routing/routes/backend.app";
import { ConstraintViolation, ValidationResult } from "../../../lib/validator/validation.result";
import { useTranslation } from "react-i18next";
import { HttpException, UnprocessableEntityException } from "../../../lib/http/exception/http.exception";
import { createColumnHelper } from "@tanstack/react-table";
import { TableComponent } from "../../../app-common/components/table/table";
import { Shortcut } from "../../../app-common/components/input/shortcut";
import * as yup from 'yup';
import { ValidationMessage } from "../../../api/model/validation";
import { getErrors, hasErrors } from "../../../lib/error/error";
import { yupResolver } from "@hookform/resolvers/yup";
import useApi from "../../../api/hooks/use.api";
import { HydraCollection } from "../../../api/model/hydra";
import { notify } from "../../../app-common/components/confirm/notification";


interface Props extends PropsWithChildren {
  customer?: Customer;
  setCustomer: (customer?: Customer) => void;
  className?: string;
}

const ValidationSchema = yup.object({
  name: yup.string().required(ValidationMessage.Required),
  phone: yup.string().required(ValidationMessage.Required),
  openingBalance: yup.number().typeError(ValidationMessage.Number).required(ValidationMessage.Required)
});

export const Customers: FC<Props> = ({
  customer, setCustomer, children, className
}) => {
  const [modal, setModal] = useState(false);
  const [operation, setOperation] = useState('create');

  const useLoadHook = useApi<HydraCollection<Customer>>('customers', CUSTOMER_LIST);
  const { fetchData } = useLoadHook;

  const { t } = useTranslation();

  const columnHelper = createColumnHelper<Customer>();

  const columns = [
    columnHelper.accessor('name', {
      header: ('Name'),
    }),
    columnHelper.accessor('phone', {
      header: ('Phone'),
    }),
    columnHelper.accessor('cnic', {
      header: ('CNIC Number'),
    }),
    columnHelper.accessor('openingBalance', {
      header: ('Opening balance'),
    }),
    columnHelper.accessor('sale', {
      header: ('Credit Sale'),
      enableSorting: false,
      enableColumnFilter: false
    }),
    columnHelper.accessor('paid', {
      header: ('Payments'),
      enableSorting: false,
      enableColumnFilter: false
    }),
    columnHelper.accessor('outstanding', {
      header: ('Balance'),
      enableSorting: false,
      enableColumnFilter: false
    }),
    columnHelper.accessor('id', {
      id: 'customerSelector',
      enableSorting: false,
      enableColumnFilter: false,
      header: ('Select'),
      cell: info => (
        <>
          {customer?.id === info.getValue() ? (
            <Button variant="success" onClick={() => setCustomer(undefined)} className="w-[40px]"
                    type="button">
              <FontAwesomeIcon icon={faSquareCheck} size="lg"/>
            </Button>
          ) : (
            <Button
              onClick={() => {
                setCustomer(info.row.original);
                setModal(false); // close modal when selecting customer
              }}
              disabled={customer?.id === info.getValue()}
              className="w-[40px]"
            >
              <FontAwesomeIcon icon={faSquare} size="lg"/>
            </Button>
          )}
        </>
      )
    }),
    columnHelper.accessor('id', {
      id: 'actions',
      header: ('Actions'),
      enableSorting: false,
      enableColumnFilter: false,
      cell: (info) => {
        return (
          <>
            <Button type="button" variant="primary" className="w-[40px]" onClick={() => {
              reset({
                ...info.row.original,
              });
              setOperation('update');
            }}>
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

  const { register, handleSubmit, setError, formState: { errors }, reset } = useForm({
    resolver: yupResolver(ValidationSchema)
  });
  const [creating, setCreating] = useState(false);
  const createCustomer = async (values: any, event?: any) => {
    event.stopPropagation();
    event.preventDefault();

    setCreating(true);
    try {
      let url, method = 'POST';
      if( values.id ) {
        method = 'PUT';
        url = CUSTOMER_EDIT.replace(':id', values.id);
      } else {
        url = CUSTOMER_CREATE;
      }

      values.openingBalance = values.openingBalance.toString();

      const response = await fetchJson(url, {
        method: method,
        body: JSON.stringify(values)
      });

      setCustomer(response.customer);

      fetchData!();

      resetForm();
      setOperation('create');
    } catch ( exception: any ) {
      if( exception instanceof HttpException ) {
        if( exception.message ) {
          notify({
            type: 'error',
            description: exception.message
          });
        }
      }

      if( exception instanceof UnprocessableEntityException ) {
        const e: ValidationResult = await exception.response.json();
        e.violations.forEach((item: ConstraintViolation) => {
          setError(item.propertyPath, {
            message: item.message,
            type: 'server'
          });
        });

        if( e.errorMessage ) {
          notify({
            type: 'error',
            description: e.errorMessage
          });
        }

        return false;
      }

      throw exception;

    } finally {
      setCreating(false);
    }
  };

  const mergeFilters = (filters: any) => {
    setParams(prev => {
      return { ...prev, ...filters };
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
      <button className={
        className ? className : 'btn btn-primary lg'
      } type="button" onClick={() => {
        setModal(true);
      }} title="Customers" tabIndex={-1}>
        {children || (
          <>
            <FontAwesomeIcon icon={faUsers} className="mr-2"/> Customers
          </>
        )}
        <Shortcut shortcut="ctrl+shift+c" handler={() => setModal(true)}/>
      </button>

      <Modal shouldCloseOnEsc={false} open={modal} onClose={() => {
        setModal(false);
      }} title="Customers">
        <form className="mb-5" onSubmit={handleSubmit(createCustomer)}>
          <div className="grid lg:grid-cols-5 gap-4 mb-3 md:grid-cols-3 sm:grid-cols-1">
            <div>
              <label htmlFor="name">Name</label>
              <Input {...register('name')} id="name" className="w-full" hasError={hasErrors(errors.name)}/>
              {getErrors(errors.name)}
            </div>
            <div>
              <label htmlFor="phone">Phone</label>
              <Input {...register('phone')} id="phone" className="w-full" hasError={hasErrors(errors.phone)}/>
              {getErrors(errors.phone)}
            </div>
            <div>
              <label htmlFor="cnic">CNIC Number</label>
              <Input {...register('cnic')} id="cnic" className="w-full" hasError={hasErrors(errors.cnic)}/>
              {getErrors(errors.cnic)}
            </div>
            <div>
              <label htmlFor="openingBalance">Opening balance</label>
              <Input {...register('openingBalance')} id="openingBalance" className="w-full"
                     hasError={hasErrors(errors.openingBalance)}/>
              {getErrors(errors.openingBalance)}
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
          loaderLineItems={9}
          // setFilters={mergeFilters}
        />
      </Modal>
    </>
  );
};
