import React, {FC, PropsWithChildren, useEffect, useLayoutEffect, useMemo, useState} from "react";
import {Modal} from "../../../app-common/components/modal/modal";
import {Closing} from "../../../api/model/closing";
import {Button} from "../../../app-common/components/input/button";
import {Input} from "../../../app-common/components/input/input";
import {Controller, useForm} from "react-hook-form";
import {DateTime} from "luxon";
import {Expenses} from "./expenses";
import classNames from "classnames";
import {KeyboardInput} from "../../../app-common/components/input/keyboard.input";
import {notify} from "../../../app-common/components/confirm/notification";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faShopLock} from "@fortawesome/free-solid-svg-icons";
import {Tooltip} from "antd";
import {Order} from "../../../api/model/order";
import {withCurrency} from "../../../lib/currency/currency";
import {useAtom} from "jotai";
import {appState as AppState} from "../../../store/jotai";
import useApi, {SettingsData} from "../../../api/db/use.api";
import {Tables} from "../../../api/db/tables";
import {useDB} from "../../../api/db/db";
import {StringRecordId} from "surrealdb";
import {toRecordId} from "../../../api/model/common";

interface TaxProps extends PropsWithChildren {

}

export const SaleClosing: FC<TaxProps> = (props) => {
  const [modal, setModal] = useState(false);
  const [appSt] = useAtom(AppState);
  const {store, terminal, user} = appSt;

  const db = useDB();

  // const [payments, setPayments] = useState<{ [key: string]: number }>({});

  const {
    handleFilterChange,
    data: orders,
    fetchData: fetchOrders,
    handleParameterChange
  } = useApi<SettingsData<Order>>(Tables.order);

  //check for day closing
  const [closing, setClosing] = useState<Closing>();
  const checkDayOpening = async () => {
    try {
      const [result] = await db.query(`SELECT *
                                       FROM ${Tables.closing}
                                       where store = $store
                                         and terminal = $terminal fetch store
                                           , terminal
                                           , opened_by`, {
        store: toRecordId(store?.id),
        terminal: toRecordId(terminal?.id)
      });

      if (result.length > 0) {
        setClosing(result[0]);
      } else {
        // create closing
        const [cl] = await db.insert(Tables.closing, {
          store: toRecordId(store?.id),
          terminal: toRecordId(terminal?.id),
          date_from: DateTime.now().toJSDate(),
          opened_by: toRecordId(user?.id),
          created_at: DateTime.now().toJSDate()
        });

        await fetchClosing(cl.id);
      }

    } catch (e) {
      throw e;
    }
  };

  const [title, setTitle] = useState('');
  const [hideCloseButton, setHideCloseButton] = useState(false);

  useEffect(() => {
    if (closing) {
      reset({
        opening_balance: closing.opening_balance,
        cash_added: closing.cash_added || 0,
        cash_withdrawn: closing.cash_withdrawn || 0,
        id: closing.id.toString()
      });

      if (closing.opening_balance === undefined) {
        setModal(true);
        setHideCloseButton(true);
        setTitle('Start day');
      }

      if (closing.opening_balance && DateTime.now().diff(DateTime.fromJSDate(closing.created_at), 'hours').hours > 24) {
        setModal(true);
        setHideCloseButton(true);
        setTitle('Close previous day first');
      }

      loadExpenses({
        dateTimeFrom: closing.date_from
      });

      handleFilterChange!([
        'created_at >= $dateTimeFrom',
        'store = $store'
      ]);

      handleParameterChange({
        dateTimeFrom: closing?.date_from,
        store: store?.id
      })
    }
  }, [closing]);

  useLayoutEffect(() => {
    checkDayOpening();
  }, []);

  useEffect(() => {
    if (modal) {
      fetchOrders();
      checkDayOpening();
    }
  }, [modal]);

  const {reset, register, handleSubmit, control, watch, getValues} = useForm();
  const [saving, setSaving] = useState(false);
  const [expenses, setExpenses] = useState(0);

  const payments = useMemo(() => {
    const list = {};
    let cash = 0;
    orders?.data?.forEach(order => {
      order?.payments?.forEach(payment => {
        if (payment.type?.type === 'cash') {
          cash += Number(payment.total);
        } else {
          if (!list[payment.type?.type]) {
            list[payment.type?.type] = 0;
          }

          list[payment.type?.type] += Number(payment.total);
        }
      });
    })

    list['cash'] = cash;

    return list;
  }, [orders]);

  const onSubmit = async (values: any) => {
    const vals = {
      ...values
    };

    setSaving(true);
    try {
      if (vals.opening_balance !== undefined) {
        vals.date_to = DateTime.now().toJSDate();

        vals.closed_by = toRecordId(user?.id);
        vals.closing_balance = cashInHand;
      } else {
        vals.opening_balance = 0;
      }

      if (!vals.updateOnly) {
        vals.closed_at = DateTime.now().toJSDate();
      }

      vals.terminal = toRecordId(terminal?.id);
      vals.store = toRecordId(store?.id);
      vals.opening_balance = Number(vals.opening_balance.toString().trim() === '' ?? 0);

      delete vals.updateOnly;
      delete vals.id;

      await db.merge(toRecordId(closing?.id), vals);

      await fetchClosing(vals.id);

      setHideCloseButton(false);
      setModal(false);

    } catch (exception) {
      notify({
        type: 'error',
        description: exception.toString()
      });

      throw exception;
    } finally {
      setSaving(false);
    }
  };

  const fetchClosing = async (id: string) => {
    const [newClosing] = await db.query(`SELECT *
                                         FROM ${id} fetch store, terminal, opened_by`);

    setClosing(newClosing[0]);
  }

  const loadExpenses = async (values?: any) => {
    try {
      const [ex] = await db.query(`SELECT *
                                   FROM ${Tables.expense}
                                   where store = $store
                                     and created_at >= $dateTimeFrom`, {
        store: toRecordId(store?.id),
        dateTimeFrom: values.dateTimeFrom
      })

      setExpenses(ex.reduce((prev: number, current) => {
        return current.amount + prev
      }, 0));

    } catch (e) {

      throw e;
    }
  };

  const cashInHand = useMemo(() => {
    let cash = payments['cash'] ?? 0;

    return Number(watch('opening_balance') || 0) + Number(watch('cash_added') || 0) - Number(watch('cash_withdrawn') || 0) - expenses + cash;
  }, [payments, expenses, watch('opening_balance'), watch('cash_added'), watch('cash_withdrawn')]);

  return (
    <>
      <Tooltip title="Day closing">
        <Button variant="primary" iconButton size="lg" onClick={() => {
          setModal(true);
          setTitle('Close day');
          setHideCloseButton(false);
        }} tabIndex={-1}>
          <FontAwesomeIcon icon={faShopLock}/>
        </Button>
      </Tooltip>

      <Modal open={modal} onClose={() => {
        setModal(false);
      }} title={title} shouldCloseOnOverlayClick={!hideCloseButton} hideCloseButton={hideCloseButton}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <table className="table table-borderless table-hover table-fixed">
            <tbody>
            <tr>
              <th className="text-right">Store</th>
              <td>{closing?.store?.name}</td>
            </tr>
            <tr>
              <th className="text-right">Terminal</th>
              <td>{closing?.terminal?.code}</td>
            </tr>
            <tr>
              <th className="text-right">Day started by</th>
              <td>{closing?.opened_by?.display_name}</td>
            </tr>
            <tr>
              <th className="text-right">Day started at</th>
              <td>{closing?.created_at && DateTime.fromISO(closing?.created_at || '').toFormat(import.meta.env.VITE_DATE_TIME_FORMAT as string)}</td>
            </tr>
            <tr>
              <th className="text-right">Previous closing</th>
              <td>{withCurrency(0)}</td>
            </tr>
            <tr>
              <th className="text-right">Opening balance</th>
              <td>
                <Controller
                  render={(props) => (
                    <KeyboardInput
                      className="w-full"
                      type="number"
                      defaultValue={props.field.value}
                      value={props.field.value}
                      onChange={props.field.onChange}
                    />
                  )}
                  name="opening_balance"
                  control={control}
                />
              </td>
            </tr>
            <tr>
              <th className="text-right">Cash added</th>
              <td>
                <Input {...register('cash_added', {
                  valueAsNumber: true
                })} type="number" className="w-full" tabIndex={0} selectable={true}/>
              </td>
            </tr>
            {closing?.opening_balance !== undefined && (
              <>
                <tr>
                  <th className="text-right">
                    Expenses
                  </th>
                  <td>
                    <Controller
                      control={control}
                      name="expenses"
                      render={(props) => (
                        <Input
                          {...register('expenses', {valueAsNumber: true})}
                          type="number"
                          className="w-full"
                          value={expenses.toString()}
                          onChange={props.field.onChange}
                          readOnly
                          selectable={true}
                        />
                      )}
                    />
                    <p className="text-gray-500 text-sm">click on expenses button to add expenses</p>
                  </td>
                </tr>
                <tr>
                  <th className="text-right">Cash withdrawn</th>
                  <td>
                    <Input {...register('cash_withdrawn', {
                      valueAsNumber: true
                    })} type="number" className="w-full" tabIndex={0} selectable={true}/>
                  </td>
                </tr>
              </>
            )}
            {Object.keys(payments).map(paymentType => (
              <tr key={paymentType}>
                <th className="text-right">{paymentType.toUpperCase()} sale</th>
                <td>
                  {withCurrency(payments[paymentType])}
                  <input type="hidden" {...register(`data.${paymentType}`)} value={payments[paymentType]}/>
                </td>
              </tr>
            ))}
            <tr>
              <th className="text-right">Cash in hand</th>
              <td className={
                classNames(
                  'text-2xl font-bold',
                  cashInHand < 0 ? 'text-danger-500' : 'text-success-500'
                )
              }>
                {withCurrency(cashInHand)}
              </td>
            </tr>
            </tbody>
          </table>
          <table className="table table-borderless table-fixed">
            <tbody>
            <tr>
              <td colSpan={2}>
                {closing?.opening_balance !== undefined && (
                  <div className="alert alert-info">
                    Click on Update button if you are only saving the closing.
                  </div>
                )}
                <div className="flex gap-3 items-center justify-center">
                  <Button onClick={() => {
                    reset({
                      ...getValues(),
                      updateOnly: true
                    });
                  }} type="submit" variant="primary" tabIndex={0} disabled={saving}>
                    {saving ? '...' : (closing?.opening_balance === undefined ? 'Start day' : 'Update')}
                  </Button>
                  {closing?.opening_balance !== undefined && (
                    <Button type="submit" variant="primary" tabIndex={0} disabled={saving}>
                      {saving ? '...' : 'Close day'}
                    </Button>
                  )}
                </div>
              </td>
            </tr>
            </tbody>
          </table>
        </form>
        <div className="text-center">
          <Expenses onClose={() => loadExpenses({
            dateTimeFrom: closing?.date_from
          })}/>
        </div>
      </Modal>
    </>
  );
};
