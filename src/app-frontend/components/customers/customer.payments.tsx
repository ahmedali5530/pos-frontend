import React, {FC, PropsWithChildren, useEffect, useMemo, useState} from "react";
import {Button} from "../../../app-common/components/input/button";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEye} from "@fortawesome/free-solid-svg-icons";
import {Modal} from "../../../app-common/components/modal/modal";
import {Customer} from "../../../api/model/customer";
import {DateTime} from "luxon";
import {Input} from "../../../app-common/components/input/input";
import {Controller, useForm} from "react-hook-form";
import {fetchJson} from "../../../api/request/request";
import classNames from "classnames";
import * as _ from 'lodash';
import {OrderPayment} from "../../../api/model/order.payment";
import {ViewOrder} from "../sale/view.order";
import {CUSTOMER_PAYMENT_CREATE} from "../../../api/routing/routes/backend.app";
import {ConstraintViolation, ValidationResult} from "../../../lib/validator/validation.result";
import {Trans} from "react-i18next";
import {ReactSelect} from "../../../app-common/components/input/custom.react.select";
import {HttpException, UnprocessableEntityException} from "../../../lib/http/exception/http.exception";
import {withCurrency} from "../../../lib/currency/currency";
import * as yup from 'yup';
import {ValidationMessage} from "../../../api/model/validation";
import {yupResolver} from "@hookform/resolvers/yup";
import {getErrors, hasErrors} from "../../../lib/error/error";
import {notify} from "../../../app-common/components/confirm/notification";


interface Props extends PropsWithChildren {
  customer: Customer;
  onCreate?: () => void;
}

const ValidationSchema = yup.object({
  amount: yup.number().typeError(ValidationMessage.Number).required(ValidationMessage.Required),
  description: yup.string().required(ValidationMessage.Required)
});

export const CustomerPayments: FC<Props> = ({
  customer: customerProp, onCreate, children
}) => {
  const [modal, setModal] = useState(false);
  const {register, handleSubmit, setError, formState: {errors}, reset, control} = useForm({
    resolver: yupResolver(ValidationSchema)
  });
  const [creating, setCreating] = useState(false);

  const [customer, setCustomer] = useState<Customer>(customerProp);

  useEffect(() => {
    setCustomer(customerProp);
  }, [customerProp]);

  const createPayment = async (values: any) => {
    setCreating(true);
    try {
      const url = CUSTOMER_PAYMENT_CREATE;

      if (values.orderId) {
        values.orderId = values.orderId.value;
      }
      delete values.id;
      values.customer = customer['@id'];
      values.amount = values.amount.toString();

      const response = await fetchJson(url, {
        method: 'POST',
        body: JSON.stringify({
          ...values
        })
      });

      // setModal(false);
      setCustomer({
        ...customer,
        payments: [
          response,
          ...customer.payments
        ]
      });
      reset({
        amount: null,
        description: null,
        order: null
      });

      if (onCreate) {
        onCreate!();
      }
    } catch (exception: any) {
      if (exception instanceof HttpException) {
        if (exception.message) {
          notify({
            type: 'error',
            description: exception.message
          });
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

  const diff = useMemo(() => {
    return customer.outstanding + Number(customer.openingBalance);
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
              <Input {...register('amount')} id="amount" className="w-full" hasError={hasErrors(errors.amount)}/>
              {getErrors(errors.amount)}
            </div>
            <div className="col-span-2">
              <label htmlFor="description">Description</label>
              <Input {...register('description')} id="description" className="w-full" hasError={hasErrors(errors.description)}/>
              {getErrors(errors.description)}
            </div>
            <div className="col-span-1">
              <label htmlFor="description">Order#</label>
              <Controller
                control={control}
                name="orderId"
                render={(props) => (
                  <ReactSelect
                    options={customer.orders.reverse().map(item => {
                      return {
                        label: `${item.orderId} (${DateTime.fromISO(item.createdAt).toFormat(
                          import.meta.env.VITE_DATE_TIME_HUMAN_FORMAT
                        )})`,
                        value: item['@id']
                      };
                    })}
                    isClearable
                    onChange={props.field.onChange}
                    value={props.field.value}
                  />
                )}
              />
              {errors.orderId && (
                <div className="text-danger-500 text-sm">
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

        <div className="grid grid-cols-5 gap-3 mb-5">
          <div className="border border-primary-500 p-5 font-bold text-primary-500 rounded">
            Opening Balance
            <span className="float-right">{withCurrency(customer.openingBalance)}</span>
          </div>
          <div className="border border-primary-500 p-5 font-bold text-primary-500 rounded">
            Total Credit Sale
            <span className="float-right">{withCurrency(customer.sale)}</span>
          </div>
          <div className="border border-success-500 p-5 font-bold text-success-900 bg-success-100 rounded">
            Total Payments
            <span className="float-right">{withCurrency(customer.paid)}</span>
          </div>
          <div className={
            classNames(
              "border p-5 font-bold rounded",
              diff > 0 ? 'border-danger-500 text-danger-900 bg-danger-100' : 'border-success-500 text-success-900 bg-success-100'
            )
          }>
            Outstanding
            <span className="float-right">{withCurrency(diff)}</span>
          </div>
          <div className={
            classNames(
              "border p-5 font-bold rounded",
              customer?.creditLimit && diff > 0 ? 'text-danger-900 bg-danger-100 border-danger-500' : 'text-primary-900 bg-primary-100 border-primary-500'
            )
          }>
            Credit limit
            <span className="float-right">{customer?.creditLimit ? withCurrency(customer?.creditLimit) : 'no limit'}</span>
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
              <td>{DateTime.fromISO(item.createdAt).toFormat(import.meta.env.VITE_DATE_TIME_HUMAN_FORMAT)}</td>
              <td>
                {item.amount && (
                  <>
                    Payment {withCurrency(item.amount)}
                  </>
                )}
                {item.orderId && (
                  <>
                    {item.payments.map((p: OrderPayment, index: number) => (
                      <div key={index}>
                        {p?.type?.name} Sale: {withCurrency(p.received)}
                      </div>
                    ))}
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
