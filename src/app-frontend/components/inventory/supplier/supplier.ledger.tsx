import React, {FC, PropsWithChildren, useEffect, useMemo, useState} from "react";
import {Modal} from "../../../../app-common/components/modal/modal";
import {Button} from "../../../../app-common/components/input/button";
import {Controller, useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import * as yup from "yup";
import {ConstraintViolation, ValidationMessage} from "../../../../api/model/validation";
import {Supplier} from "../../../../api/model/supplier";
import {
  SUPPLIER_PAYMENT_CREATE,
  SUPPLIER_PAYMENT_LIST,
  SUPPLIER_PURCHASE_LIST
} from "../../../../api/routing/routes/backend.app";
import {fetchJson} from "../../../../api/request/request";
import {UnprocessableEntityException} from "../../../../lib/http/exception/http.exception";
import * as _ from "lodash";
import {Input} from "../../../../app-common/components/input/input";
import {getErrors, hasErrors} from "../../../../lib/error/error";
import {ReactSelect} from "../../../../app-common/components/input/custom.react.select";
import {DateTime} from "luxon";
import {Trans} from "react-i18next";
import {withCurrency} from "../../../../lib/currency/currency";
import classNames from "classnames";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEye} from "@fortawesome/free-solid-svg-icons";
import {ViewPurchase} from "../purchase/view.purchase";
import {SupplierPayment} from "../../../../api/model/supplier.payment";
import {Purchase} from "../../../../api/model/purchase";
import useApi from "../../../../api/hooks/use.api";
import { HydraCollection } from "../../../../api/model/hydra";

interface SupplierLedgerProps extends PropsWithChildren {
  supplier: Supplier;
}

const ValidationSchema = yup.object({
  amount: yup.number().typeError(ValidationMessage.Number).required(ValidationMessage.Required),
  description: yup.string().required(ValidationMessage.Required)
});

export const SupplierLedger: FC<SupplierLedgerProps> = ({
  children, supplier: supplierProp
}) => {
  const [modal, setModal] = useState(false);
  const {register, handleSubmit, setError, formState: {errors}, reset, control} = useForm({
    resolver: yupResolver(ValidationSchema)
  });
  const [creating, setCreating] = useState(false);
  const [supplier, setSupplier] = useState<Supplier>(supplierProp);
  const {
    data: payments,
    fetchData: loadPayments
  } = useApi<HydraCollection<SupplierPayment>>('supplierPayments', SUPPLIER_PAYMENT_LIST.replace(':id', supplier.id), {
    limit: 9999999
  });

  const {
    data: purchases,
    fetchData: loadPurchases,
  } = useApi<HydraCollection<Purchase>>('supplierPurchases', SUPPLIER_PURCHASE_LIST.replace(':id', supplier.id), {
    limit: 9999999
  });

  useEffect(() => {
    setSupplier(supplierProp);
  }, [supplierProp]);

  useEffect(() => {
    if(modal){
      loadPayments();
      loadPurchases();
    }
  }, [modal])

  const createPayment = async (values: any) => {
    setCreating(true);
    try {
      const url = SUPPLIER_PAYMENT_CREATE;

      if (values.purchase) {
        values.purchase = values.purchase.value;
      }
      delete values.id;
      values.supplier = supplier['@id'];
      values.amount = values.amount.toString();

      const response = await fetchJson(url, {
        method: 'POST',
        body: JSON.stringify({
          ...values
        })
      });

      await loadPayments();

      reset({
        amount: null,
        description: null,
        purchase: null
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

  const purchaseTotal = useMemo(() => {
    return purchases?.['hydra:member']?.reduce((prev, item) => {
      if(item.paymentType && item.paymentType.type === 'credit'){
        return prev + item.total;
      }
      return prev;
    }, 0);
  }, [purchases]);
  const paymentTotal = useMemo(() => {
    return payments?.['hydra:member']?.reduce((prev, item) => prev + Number(item.amount), 0);
  }, [payments]);

  const diff = useMemo(() => {
    return Number(purchaseTotal) - Number(paymentTotal) + Number(supplier.openingBalance);
  }, [purchaseTotal, paymentTotal, supplier]);

  const list = useMemo(() => {
    let list: any = [];
    payments?.['hydra:member']?.forEach(item => {
      list.push(item);
    });
    purchases?.['hydra:member']?.forEach(item => {
      list.push(item);
    });

    list = _.sortBy(list, (item) => {
      return item.createdAt;
    }).reverse();


    return list;
  }, [purchases, payments]);

  return (
    <>
      <Button variant="primary" onClick={() => {
        setModal(true);
      }}>
        {children || 'Ledger'}
      </Button>
      <Modal
        open={modal}
        title={`${supplier.name}'s Ledger`}
        onClose={() => {
          setModal(false);
        }}
      >
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
              <Input {...register('description')} id="description" className="w-full"
                     hasError={hasErrors(errors.description)}/>
              {getErrors(errors.description)}
            </div>
            <div className="col-span-1">
              <label htmlFor="purchase">Purchase no.</label>
              <Controller
                control={control}
                name="purchase"
                render={(props) => (
                  <ReactSelect
                    options={purchases?.['hydra:member']?.reverse().map(item => {
                      return {
                        label: `${item.purchaseNumber} (${DateTime.fromISO(item.createdAt).toFormat(
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
              {errors.purchase && (
                <div className="text-danger-500 text-sm">
                  <Trans>
                    {errors.purchase.message}
                  </Trans>
                </div>
              )}
            </div>
            <div>
              <label className="block">&nbsp;</label>
              <Button variant="primary" type="submit" className="w-full"
                      disabled={creating}>{creating ? 'Adding...' : 'Add Payment'}</Button>
            </div>
          </div>
        </form>

        <div className="grid grid-cols-4 gap-4 mb-5">
          <div className="border border-primary-500 p-5 font-bold text-primary-500 rounded">
            Opening Balance
            <span className="float-right">{withCurrency(supplier.openingBalance)}</span>
          </div>
          <div className="border border-primary-500 p-5 font-bold text-primary-500 rounded">
            Total Credit Purchase
            <span className="float-right">{withCurrency(purchaseTotal)}</span>
          </div>
          <div className="border border-success-500 p-5 font-bold text-success-500 rounded">
            Total Payments
            <span className="float-right">{withCurrency(paymentTotal)}</span>
          </div>
          <div className={
            classNames(
              "border p-5 font-bold rounded",
              diff > 0 ? 'border-danger-500 text-danger-500' : 'border-success-500 text-success-500'
            )
          }>
            Outstanding payments
            <span className="float-right">{withCurrency(diff)}</span>
          </div>
        </div>

        <table className="table border border-collapse">
          <thead>
          <tr>
            <th>Time</th>
            <th>Amount</th>
            <th>Description</th>
            <th>Purchase no.</th>
          </tr>
          </thead>
          <tbody>
          {list.map((item: any, index: number) => (
            <tr key={index} className="hover:bg-gray-100">
              <td>{DateTime.fromISO(item.createdAt).toRelative()}</td>
              <td>
                {item.amount && (
                  <>
                    Payment {withCurrency(item.amount)}
                  </>
                )}
                {item.purchaseNumber && (
                  <>
                    {item?.paymentType?.name} Sale: {withCurrency(item.total)}
                  </>
                )}
              </td>
              <td>
                {item.description && (
                  <>Receiving: {item.description}</>
                )}
                {item.purchaseNumber && 'Sale'}
              </td>
              <td>
                {item.purchaseNumber && (
                  <ViewPurchase purchase={item}>
                    <FontAwesomeIcon icon={faEye} className="mr-2"/> {item.purchaseNumber}
                  </ViewPurchase>
                )}
                {item.purchase && (
                  <ViewPurchase purchase={item.purchase}>
                    <FontAwesomeIcon icon={faEye} className="mr-2"/> {item.purchase.purchaseNumber}
                  </ViewPurchase>
                )}
              </td>
            </tr>
          ))}
          </tbody>
        </table>
      </Modal>
    </>
  );
}
