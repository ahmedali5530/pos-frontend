import {Button} from "../button";
import React, {useEffect, useMemo, useState} from "react";
import {Input} from "../input";
import {DateTime} from "luxon";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPlus, faSpinner, faSearch} from "@fortawesome/free-solid-svg-icons";
import {Modal} from "../modal";
import {fetchJson} from "../../../api/request/request";
import {useForm} from "react-hook-form";
import {Expense} from "../../../api/model/expense";
import {EXPENSE_CREATE, EXPENSE_LIST} from "../../../api/routing/routes/backend.app";
import {ConstraintViolation} from "../../../lib/validator/validation.result";
import {Trans} from "react-i18next";

export const Expenses = () => {
  const [modal, setModal] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [list, setList] = useState<Expense[]>([]);
  const [filters, setFilters] = useState<any>();

  const {register, handleSubmit, reset} = useForm();
  const loadExpenses = async (values?: any) => {
    if (!values) {
      setLoading(true);
    }

    setFilters(values);

    try {
      const url = new URL(EXPENSE_LIST);
      const params = new URLSearchParams({
        dateTimeFrom: DateTime.now().startOf('day').toISO(),
        dateTimeTo: DateTime.now().endOf('day').toISO(),
        ...values,
        orderBy: 'id',
        orderMode: 'DESC',
      });

      url.search = params.toString();
      const json = await fetchJson(url.toString());

      setList(json.list);
    } catch (e) {

      throw e;
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (modal) {
      loadExpenses();
      reset({
        dateTimeFrom: DateTime.now().startOf('day').toSQL(),
        dateTimeTo: DateTime.now().endOf('day').toSQL()
      });
    }
    reset();
  }, [modal]);

  const total = useMemo(() => {
    return list.reduce((prev, expense) => prev + Number(expense.amount), 0);
  }, [list]);


  const {register: createRegister, handleSubmit: createHandleSubmit, reset: createReset, formState: {errors: createErrors}, setError: createSetError} = useForm();
  const [creating, setCreating] = useState(false);
  const createExpense = async (values: any) => {
    setCreating(true);
    try {
      const json = await fetchJson(EXPENSE_CREATE, {
        method: 'POST',
        body: JSON.stringify(values)
      });

      loadExpenses();
      createReset();
    } catch (e: any) {
      if (e.data.violations) {
        e.data.violations.forEach((item: ConstraintViolation) => {
          createSetError(item.propertyPath, {
            message: item.message,
            type: 'server'
          });
        });

        return false;
      }
      throw e;
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      <Button variant="danger" size="lg" onClick={() => {
        setModal(true);
      }} title="Expenses" type="button">Expenses</Button>

      <Modal open={modal} onClose={() => {
        setModal(false);
      }} title="Expenses">

        <form onSubmit={handleSubmit(loadExpenses)}>
          <div className="grid grid-cols-5 gap-4 mb-5">
            <div className="col-span-2">
              <Input {...register('dateTimeFrom')}
                     type="datetime-local"
                     placeholder="Start time"
              />
            </div>
            <div className="col-span-2">
              <Input {...register('dateTimeTo')}
                     type="datetime-local"
                     placeholder="End time"
              />
            </div>
            <div>
              <Button variant="primary" className="w-full" type="submit"
                      disabled={isLoading}>{isLoading ? 'Loading...' : (
                <>
                  <FontAwesomeIcon icon={faSearch} className="mr-2" /> Search expenses
                </>
              )}</Button>
            </div>
          </div>
        </form>

        <form onSubmit={createHandleSubmit(createExpense)}>
          <div className="grid grid-cols-7 gap-4 mb-5">
            <div className="col-span-3">
              <Input {...createRegister('description')}
                     type="text"
                     placeholder="Description"
              />
              {createErrors.description && (
                <div className="text-red-500 text-sm">
                  <Trans>
                    {createErrors.description.message}
                  </Trans>
                </div>
              )}
            </div>
            <div className="col-span-3">
              <Input {...createRegister('amount')}
                     type="number"
                     placeholder="Expense Amount"
              />
              {createErrors.amount && (
                <div className="text-red-500 text-sm">
                  <Trans>
                    {createErrors.amount.message}
                  </Trans>
                </div>
              )}
            </div>
            <div>
              <Button variant="primary" className="w-full" type="submit"
                      disabled={creating}>
                {creating ? 'Creating...' : (
                  <>
                    <FontAwesomeIcon icon={faPlus} className="mr-2" /> Create Expense
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>


        {isLoading && (
            <div className="flex justify-center items-center">
              <FontAwesomeIcon icon={faSpinner} spin size="5x"/>
            </div>
        )}
        {!isLoading && (
          <>
          <div className="grid grid-cols-4 gap-4 mb-5">
            <div className="border border-red-500 p-5 font-bold text-red-500 rounded">
              Expenses
              <span className="float-right">
                {list.reduce((prev, item) => prev + item.amount , 0)}
              </span>
            </div>
            <div></div>
          </div>

            <table className="table border border-collapse">
              <thead>
              <tr>
                <th>Time</th>
                <th>Description</th>
                <th>Amount</th>
              </tr>
              </thead>
              <tbody>
              {list.map((order, index) => (
                <tr key={index} className="hover:bg-gray-100">
                  <td title={order.createdAt}>{DateTime.fromISO(order.createdAt).toRelative({base: DateTime.now()})}</td>
                  <td>{order.description}</td>
                  <td>{order.amount}</td>
                </tr>
              ))}
              </tbody>
            </table>
          </>
        )}
      </Modal>
    </>
  );
};
