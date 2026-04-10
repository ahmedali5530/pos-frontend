import React, {FC, PropsWithChildren, useEffect, useMemo, useState} from "react";
import {Modal} from "../../../../app-common/components/modal/modal";
import {Button} from "../../../../app-common/components/input/button";
import {Controller, useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import * as yup from "yup";
import {ConstraintViolation, ValidationMessage} from "../../../../api/model/validation";
import {Supplier} from "../../../../api/model/supplier";
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
import {Purchase, PURCHASE_FETCHES} from "../../../../api/model/purchase";
import {useDB} from "../../../../api/db/db";
import {Tables} from "../../../../api/db/tables";
import {toRecordId} from "../../../../api/model/common";
import {usePurchase} from "../../../../api/hooks/use.purchase";

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
  const db = useDB();
  const [modal, setModal] = useState(false);
  const {register, handleSubmit, setError, formState: {errors}, reset, control} = useForm({
    resolver: yupResolver(ValidationSchema)
  });
  const [creating, setCreating] = useState(false);
  const [supplier, setSupplier] = useState<Supplier>(supplierProp);
  const [payments, setPayments] = useState<SupplierPayment[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);

  const loadPayments = async () => {
    const [sp] = await db.query(`SELECT *
                                 FROM ${Tables.supplier_payment}
                                 where supplier = $supplier`, {
      supplier: toRecordId(supplier.id)
    });

    setPayments(sp);
  }

  const loadPurchases = async () => {
    const [p] = await db.query(`SELECT *
                                FROM ${Tables.purchase}
                                where supplier = $supplier FETCH ${PURCHASE_FETCHES.join(', ')}`, {
      supplier: toRecordId(supplier.id)
    });

    setPurchases(p);
  }

  useEffect(() => {
    setSupplier(supplierProp);
  }, [supplierProp]);

  useEffect(() => {
    if (modal) {
      loadPayments();
      loadPurchases();
    }
  }, [modal])

  const createPayment = async (values: any) => {
    setCreating(true);
    try {
      await db.insert(Tables.supplier_payment, {
        amount: Number(values.amount),
        description: values?.description,
        purchase: values.purchase ? toRecordId(values.purchase.value) : null,
        supplier: toRecordId(supplier.id)
      })

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

  const purchaseHook = usePurchase();

  const purchaseTotal = useMemo(() => {
    return purchases?.reduce((prev, item) => {
      if (item.payment_type && item.payment_type.type === 'credit') {
        return prev + purchaseHook.calculatePurchaseTotal(item);
      }

      return prev;
    }, 0);
  }, [purchases]);
  const paymentTotal = useMemo(() => {
    return payments?.reduce((prev, item) => prev + Number(item.amount), 0);
  }, [payments]);

  const diff = useMemo(() => {
    return Number(purchaseTotal) - Number(paymentTotal) + Number(supplier.opening_balance);
  }, [purchaseTotal, paymentTotal, supplier]);

  const list = useMemo(() => {
    let list: any = [];
    payments?.forEach(item => {
      list.push(item);
    });
    purchases?.forEach(item => {
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
        shouldCloseOnOverlayClick
      >
        <form onSubmit={handleSubmit(createPayment)} className="mb-5">
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
                    options={purchases?.reverse().map(item => {
                      return {
                        label: `${item.purchase_number} (${DateTime.fromJSDate(item.created_at).toFormat(
                          import.meta.env.VITE_DATE_TIME_HUMAN_FORMAT
                        )})`,
                        value: item['id']
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
            <span className="float-right">{withCurrency(supplier.opening_balance)}</span>
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
              <td>{DateTime.fromJSDate(item.created_at).toRelative()}</td>
              <td>
                {item.amount && (
                  <>
                    Payment {withCurrency(item.amount)}
                  </>
                )}
                {item.purchase_number && (
                  <>
                    {item?.payment_type?.name} Sale: {withCurrency(purchaseHook.calculatePurchaseTotal(item))}
                  </>
                )}
              </td>
              <td>
                {item.description && (
                  <>Receiving: {item.description}</>
                )}
                {item.purchase_number && 'Sale'}
              </td>
              <td>
                {item.purchase_number && (
                  <ViewPurchase purchase={item}>
                    <FontAwesomeIcon icon={faEye} className="mr-2"/> {item.purchase_number}
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
