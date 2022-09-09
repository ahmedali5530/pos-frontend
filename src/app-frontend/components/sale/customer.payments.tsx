import React, {FC, PropsWithChildren, useEffect, useMemo, useState} from "react";
import {Button} from "../button";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEye} from "@fortawesome/free-solid-svg-icons";
import {Modal} from "../modal";
import {Customer} from "../../../api/model/customer";
import {DateTime} from "luxon";
import {Input} from "../input";
import {Controller, useForm} from "react-hook-form";
import {fetchJson} from "../../../api/request/request";
import classNames from "classnames";
import * as _ from 'lodash';
import {OrderPayment} from "../../../api/model/order.payment";
import {ViewOrder} from "./view.order";
import {CUSTOMER_PAYMENT_CREATE} from "../../../api/routing/routes/backend.app";
import {ConstraintViolation} from "../../../lib/validator/validation.result";
import {Trans} from "react-i18next";
import {ReactSelect} from "../../../app-common/components/input/custom.react.select";
import {UnprocessableEntityException} from "../../../lib/http/exception/http.exception";

interface Props extends PropsWithChildren{
  customer: Customer;
  onCreate?: () => void;
}

export const CustomerPayments: FC<Props> = ({
                                              customer: customerProp, onCreate, children
                                            }) => {
  const [modal, setModal] = useState(false);
  const {register, handleSubmit, setError, formState: {errors}, reset, control} = useForm();
  const [creating, setCreating] = useState(false);

  const [customer, setCustomer] = useState<Customer>(customerProp);

  useEffect(() => {
    setCustomer(customerProp);
  }, [customerProp]);

  const createPayment = async (values: any) => {
    setCreating(true);
    try {
      const url = CUSTOMER_PAYMENT_CREATE.replace(':id', customer.id);

      if(values.orderId){
        values.orderId = values.orderId.value;
      }

      const response = await fetchJson(url, {
        method: 'POST',
        body: JSON.stringify({
          ...values
        })
      });

      // setModal(false);
      setCustomer(response.customer);
      reset({
        amount: '',
        description: ''
      });

      if (onCreate) {
        onCreate!();
      }
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

  const diff = useMemo(() => {
    return Number(customer?.sale) - Number(customer?.paid);
  }, [customer]);

  const list = useMemo(() => {
    let list: any = [];
    customer.payments.forEach(item => {
      list.push(item);
    });
    customer.orders.forEach(item => {
      list.push(item);
    });

    list = _.sortBy(list, (item) => {
      return item.createdAt;
    }).reverse();


    return list;
  }, [customer]);

  return (
    <>
      <Button variant="primary" onClick={() => {
        setModal(true);
      }}>
        {children || 'History'}
      </Button>

      <Modal open={modal} onClose={() => {
        setModal(false);
      }} title={`Payment history of ${customer.name}`}>
        <form onSubmit={handleSubmit(createPayment)} className="mb-5">
          <input type="hidden" {...register('id')}/>
          <div className="grid grid-cols-5 gap-4 mb-3">
            <div className="col-span-1">
              <label htmlFor="amount">Amount</label>
              <Input {...register('amount')} id="amount" className="w-full"/>
              {errors.amount && (
                <div className="text-red-500 text-sm">
                  <Trans>
                    {errors.amount.message}
                  </Trans>
                </div>
              )}
            </div>
            <div className="col-span-2">
              <label htmlFor="description">Description</label>
              <Input {...register('description')} id="description" className="w-full"/>
              {errors.description && (
                <div className="text-red-500 text-sm">
                  <Trans>
                    {errors.description.message}
                  </Trans>
                </div>
              )}
            </div>
            <div className="col-span-1">
              <label htmlFor="description">Order#</label>
              <Controller
                control={control}
                name="orderId"
                render={(props) => (
                  <ReactSelect
                    options={customer.orders.map(item => {
                      return {
                        label: `${item.orderId} (${DateTime.fromISO(item.createdAt).toFormat('ff')})`,
                        value: item.id
                      };
                    })}
                    isClearable
                    onChange={props.field.onChange}
                    value={props.field.value}
                  />
                )}
              />
              {errors.orderId && (
                <div className="text-red-500 text-sm">
                  <Trans>
                    {errors.orderId.message}
                  </Trans>
                </div>
              )}
            </div>
            <div>
              <label className="block">&nbsp;</label>
              <Button variant="primary" type="submit" className="w-full"
                      disabled={creating}>{creating ? 'Receiving...' : 'Receive Payment'}</Button>
            </div>
          </div>
        </form>

        <div className="grid grid-cols-3 gap-4 mb-5">
          <div className="border border-purple-500 p-5 font-bold text-purple-500 rounded">
            Total Sale
            <span className="float-right">{customer.sale}</span>
          </div>
          <div className="border border-green-500 p-5 font-bold text-green-500 rounded">
            Total Payments
            <span className="float-right">{customer.paid}</span>
          </div>
          <div className={
            classNames(
              "border p-5 font-bold rounded",
              diff > 0 ? 'border-red-500 text-red-500' : 'border-green-500 text-green-500'
            )
          }>
            Outstanding
            <span className="float-right">{diff}</span>
          </div>
        </div>

        <table className="table border border-collapse">
          <thead>
          <tr>
            <th>Time</th>
            <th>Amount</th>
            <th>Description</th>
            <th>Order#</th>
          </tr>
          </thead>
          <tbody>
          {list.map((item: any, index: number) => (
            <tr key={index} className="hover:bg-gray-100">
              <td>{DateTime.fromISO(item.createdAt).toRelative()}</td>
              <td>
                {item.amount && (
                  <>
                    Payment {item.amount}
                  </>
                )}
                {item.orderId && (
                  <>
                    {item.payments.map((p: OrderPayment) => p?.type?.name)} Sale {item.payments.reduce((prev: number, item: OrderPayment) => prev + item.total, 0)}
                  </>
                )}
              </td>
              <td>
                {item.description && (
                  <>Receiving: {item.description}</>
                )}
                {item.orderId && 'Sale'}
              </td>
              <td>
                {item.orderId && (
                  <ViewOrder order={item}>
                    <FontAwesomeIcon icon={faEye} className="mr-2"/> {item.orderId}
                  </ViewOrder>
                )}
                {item.order && (
                  <ViewOrder order={item.order}>
                    <FontAwesomeIcon icon={faEye} className="mr-2"/> {item.order.orderId}
                  </ViewOrder>
                )}
              </td>
            </tr>
          ))}
          </tbody>
        </table>
      </Modal>
    </>
  );
};
