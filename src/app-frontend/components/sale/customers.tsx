import React, {FC, useEffect, useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faSpinner, faTrash, faUsers} from "@fortawesome/free-solid-svg-icons";
import {Button} from "../button";
import {Modal} from "../modal";
import {Customer} from "../../../api/model/customer";
import {fetchJson, jsonRequest} from "../../../api/request/request";
import {useForm} from "react-hook-form";
import {Input} from "../input";
import {faSquare, faSquareCheck} from "@fortawesome/free-regular-svg-icons";
import {CustomerPayments} from "./customer.payments";
import {CUSTOMER_CREATE, CUSTOMER_LIST} from "../../../api/routing/routes/backend.app";
import {ConstraintViolation} from "../../../lib/validator/validation.result";
import {Trans} from "react-i18next";
import {UnprocessableEntityException} from "../../../lib/http/exception/http.exception";
import {Loader} from "../../../app-common/components/loader/loader";


interface Props {
  customer?: Customer;
  setCustomer: (customer?: Customer) => void;
}

export const Customers: FC<Props> = ({
  customer, setCustomer
}) => {
  const [modal, setModal] = useState(false);
  const [list, setList] = useState<Customer[]>([]);
  const [isLoading, setLoading] = useState(false);

  const loadCustomers = async (q?: string) => {
    if(!q) {
      setLoading(true);
    }

    try {
      const queryParams = new URLSearchParams();

      if(q){
        queryParams.append('q', q);
      }

      const response = await jsonRequest(CUSTOMER_LIST + '?' + queryParams.toString());
      const json = await response.json();

      setList(json.list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (modal) {
      loadCustomers();
    }
    reset({});
  }, [modal]);

  const {register, handleSubmit, setError, formState: {errors}, reset} = useForm();
  const [creating, setCreating] = useState(false);
  const createCustomer = async (values: any, event?: any) => {
    event.stopPropagation();
    event.preventDefault();

    setCreating(true);
    try {
      const response = await fetchJson(CUSTOMER_CREATE, {
        method: 'POST',
        body: JSON.stringify(values)
      });

      setCustomer(response.customer);

      setList(prev => {
        return [ response.customer, ...prev];
      });

      reset({
        name: '',
        phone: '',
        cnic: ''
      });
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

  const [q, setQ] = useState<string>();

  return (
    <>
      <Button variant="primary" type="button" className="w-24" size="lg" onClick={() => {
        setModal(true);
      }} title="Customers"><FontAwesomeIcon icon={faUsers}/></Button>

      <Modal shouldCloseOnEsc={false} open={modal} onClose={() => {
        setModal(false);
      }} title="Customers">
        <form className="mb-5" onSubmit={handleSubmit(createCustomer)}>
          <div className="grid grid-cols-7 gap-4 mb-3">
            <div className="col-span-2">
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
            <div className="col-span-2">
              <label htmlFor="phone">Phone</label>
              <Input {...register('phone')} id="phone" className="w-full"/>
              {errors.phone && (
                <div className="text-red-500 text-sm">
                  <Trans>
                    {errors.phone.message}
                  </Trans>
                </div>
              )}
            </div>
            <div className="col-span-2">
              <label htmlFor="cnic">CNIC Number</label>
              <Input {...register('cnic')} id="cnic" className="w-full"/>
              {errors.cnic && (
                <div className="text-red-500 text-sm">
                  <Trans>
                    {errors.cnic.message}
                  </Trans>
                </div>
              )}
            </div>
            <div className="col-start-auto">
              <label className="block">&nbsp;</label>
              <Button variant="primary" type="submit" className="w-full" disabled={creating}>{creating ? 'Creating...' : 'Create new'}</Button>
            </div>
          </div>

        </form>
        {isLoading && (
          <div className="flex justify-center items-center">
            <Loader lines={15} lineItems={8}/>
          </div>
        )}

        <hr/>
        <Input name="q"
               type="search"
               onChange={(e) => {
                 loadCustomers(e.target.value);
                 setQ(e.target.value);
               }}
               placeholder="Search Customers"
               className="mb-3 mt-3 search-field w-full"/>

        {!isLoading && (
          <table className="table border border-collapse">
            <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>CNIC Number</th>
              <th>Prev. Sale</th>
              <th>Paid</th>
              <th>Outstanding</th>
              <th>Attach</th>
              <th>Actions</th>
            </tr>
            </thead>
            <tbody>
            {list.map((row, index) => {
              return (
                <tr key={index} className="hover:bg-gray-100">
                  <td>{row.name}</td>
                  <td>{row.phone}</td>
                  <td>{row.cnic}</td>
                  <td>{row.sale}</td>
                  <td>{row.paid}</td>
                  <td>{row.outstanding}</td>
                  <td>
                    {customer?.id === row.id ? (
                      <Button variant="success" onClick={() => setCustomer(undefined)} className="w-[40px]" type="button">
                        <FontAwesomeIcon icon={faSquareCheck} size="lg" />
                      </Button>
                    ) : (
                      <Button
                        onClick={() => setCustomer(row)}
                        disabled={customer?.id === row.id}
                        className="w-[40px]"
                      >
                        <FontAwesomeIcon icon={faSquare} size="lg"/>
                      </Button>
                    )}
                  </td>
                  <td>
                    <CustomerPayments customer={row} onCreate={() => loadCustomers(q)} key={index}/>
                    <span className="mx-2 text-gray-300">|</span>
                    <Button variant="danger" type="button">
                      <FontAwesomeIcon icon={faTrash}/>
                    </Button>
                  </td>
                </tr>
              )
            })}
            </tbody>
          </table>
        )}
      </Modal>
    </>
  );
};
