import React, {FC, PropsWithChildren, useEffect, useLayoutEffect, useMemo, useState} from "react";
import {Modal} from "../../../app-common/components/modal/modal";
import {Closing} from "../../../api/model/closing";
import {QueryString} from "../../../lib/location/query.string";
import {fetchJson, jsonRequest} from "../../../api/request/request";
import {CLOSING_EDIT, CLOSING_OPENED, EXPENSE_LIST, ORDER_LIST} from "../../../api/routing/routes/backend.app";
import {Button} from "../../../app-common/components/input/button";
import {Input} from "../../../app-common/components/input/input";
import {Controller, useForm} from "react-hook-form";
import {DateTime} from "luxon";
import {Expenses} from "./expenses";
import {Expense} from "../../../api/model/expense";
import {useLoadList} from "../../../api/hooks/use.load.list";
import {Order} from "../../../api/model/order";
import {useSelector} from "react-redux";
import {getAuthorizedUser} from "../../../duck/auth/auth.selector";
import classNames from "classnames";
import {KeyboardInput} from "../../../app-common/components/input/keyboard.input";
import {getStore} from "../../../duck/store/store.selector";
import {getTerminal} from "../../../duck/terminal/terminal.selector";

interface TaxProps extends PropsWithChildren {

}

export const SaleClosing: FC<TaxProps> = (props) => {
  const [modal, setModal] = useState(false);
  const store = useSelector(getStore);
  const terminal = useSelector(getTerminal);

  const [payments, setPayments] = useState<{ [key: string]: number }>({});

  const useLoadHook = useLoadList<Order>(ORDER_LIST);
  const {handleFilterChange, data} = useLoadHook;

  //check for day closing
  const [closing, setClosing] = useState<Closing>();
  const checkDayOpening = async () => {
    try{
      const queryString = QueryString.stringify({
        store: store?.id,
        terminal: terminal?.id
      })

      const res = await jsonRequest(CLOSING_OPENED + '?' + queryString);
      const json = await res.json();

      setClosing(json.closing);

    }catch (e){
      throw e;
    }
  };

  const [title, setTitle] = useState('');
  const [hideCloseButton, setHideCloseButton] = useState(false);

  useEffect(() => {
    if(closing){
      reset({
        openingBalance: closing.openingBalance,
        cashAdded: closing.cashAdded || 0,
        cashWithdrawn: closing.cashWithdrawn || 0,
        id: closing.id
      });

      if(closing.openingBalance === null){
        setModal(true);
        setHideCloseButton(true);
        setTitle('Start day');
      }

      if(closing.openingBalance !== null && DateTime.now().diff(DateTime.fromISO(closing.createdAt.datetime), 'hours').hours > 24){
        setModal(true);
        setHideCloseButton(true);
        setTitle('Close previous day first');
      }

      loadExpenses({
        dateTimeFrom: closing.dateFrom?.datetime
      });

      handleFilterChange!({
        dateTimeFrom: closing.dateFrom?.datetime,
        store: store?.id
      });
    }
  }, [closing]);

  useLayoutEffect(() => {
    checkDayOpening();
  }, []);

  useEffect(() => {
    if(modal) {
      checkDayOpening();
    }
  }, [modal]);

  const {reset, register, handleSubmit, control, watch, getValues} = useForm();
  const [saving, setSaving] = useState(false);
  const [expenses, setExpenses] = useState(0);

  const user = useSelector(getAuthorizedUser);

  useEffect(() => {
    if(data?.data?.payments) {
      setPayments(data?.data?.payments);
    }
  }, [data]);

  const onSubmit = async (values: any) => {
    setSaving(true);
    try{
      if(values.openingBalance !== null){
          values.dateTe = {
            datetime: DateTime.now().toISO()
          }

          values.closedBy = user?.id;
          values.closingBalance = cashInHand;
      }else{
        values.openingBalance = 0;
      }

      if(!values.updateOnly){
        values.closedAt = {
          datetime: DateTime.now().toISO()
        }
      }

      values.terminal = terminal?.id;

      const response = await jsonRequest(CLOSING_EDIT.replace(':id', closing?.id as string), {
        method: 'POST',
        body: JSON.stringify(values)
      });
      const json = await response.json();

      setClosing(json.closing);

      setHideCloseButton(false);
      setModal(false);

    }catch (e){
      throw e;
    }finally {
      setSaving(false);
    }
  };

  const loadExpenses = async (values?: any) => {
    try {
      const url = new URL(EXPENSE_LIST);
      const params = new URLSearchParams({
        ...values,
        orderBy: 'id',
        orderMode: 'DESC',
        store: store?.id
      });

      url.search = params.toString();
      const json = await fetchJson(url.toString());

      const list: Expense[] = json.list;

      setExpenses(list.reduce((prev: number, current) => {
        return current.amount + prev
      }, 0));

    } catch (e) {

      throw e;
    }
  };

  const cashInHand = useMemo(() => {
    let cash = payments['cash'];

    return Number(watch('openingBalance')) + Number(watch('cashAdded')) - Number(watch('cashWithdrawn')) - expenses + cash;
  }, [payments, expenses, watch('openingBalance'), watch('cashAdded'), watch('cashWithdrawn')]);

  return (
    <>
      <Button variant="primary" size="lg" onClick={() => {
        setModal(true);
        setTitle('Close day');
        setHideCloseButton(false);
      }} title="Day closing" tabIndex={-1}>
        Day closing
      </Button>

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
                <td>{closing?.openedBy?.displayName}</td>
              </tr>
              <tr>
                <th className="text-right">Day started at</th>
                <td>{closing?.createdAt?.datetime && DateTime.fromISO(closing?.createdAt?.datetime).toFormat(process.env.REACT_APP_DATE_TIME_FORMAT as string)}</td>
              </tr>
              <tr>
                <th className="text-right">Previous closing</th>
                <td>0</td>
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
                    name="openingBalance"
                    control={control}
                  />
                </td>
              </tr>
              <tr>
                <th className="text-right">Cash added</th>
                <td>
                  <Input {...register('cashAdded', {
                    valueAsNumber: true
                  })} type="number" className="w-full" tabIndex={0} selectable={true} />
                </td>
              </tr>
              {closing?.openingBalance !== null && (
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
                            {...register('expenses', { valueAsNumber: true })}
                            type="number"
                            className="w-full"
                            value={expenses.toString()}
                            onChange={props.field.onChange}
                            readOnly
                            selectable={true}
                          />
                        )}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th className="text-right">Cash withdrawn</th>
                    <td>
                      <Input {...register('cashWithdrawn', {
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
                    {payments[paymentType]}
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
                  {cashInHand}
                </td>
              </tr>
              <tr>
                <td colSpan={2}>
                  {closing?.openingBalance !== null && (
                    <div className="alert alert-warning">
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
                      {saving ? '...' : (closing?.openingBalance === null ? 'Start day' : 'Update')}
                    </Button>
                    {closing?.openingBalance !== null && (
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
            dateTimeFrom: closing?.dateFrom?.datetime
          })} />
        </div>
      </Modal>
    </>
  );
};
