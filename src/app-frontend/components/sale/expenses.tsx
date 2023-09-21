import {Button} from "../../../app-common/components/input/button";
import React, {FC, useEffect, useState} from "react";
import {Input} from "../../../app-common/components/input/input";
import {DateTime} from "luxon";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPlus, faSearch} from "@fortawesome/free-solid-svg-icons";
import {Modal} from "../../../app-common/components/modal/modal";
import {fetchJson} from "../../../api/request/request";
import {useForm} from "react-hook-form";
import {Expense} from "../../../api/model/expense";
import {EXPENSE_CREATE, EXPENSE_LIST} from "../../../api/routing/routes/backend.app";
import {ConstraintViolation, ValidationResult} from "../../../lib/validator/validation.result";
import {Trans} from "react-i18next";
import {HttpException, UnprocessableEntityException} from "../../../lib/http/exception/http.exception";
import {Loader} from "../../../app-common/components/loader/loader";
import {Shortcut} from "../../../app-common/components/input/shortcut";
import {useSelector} from "react-redux";
import {getStore} from "../../../duck/store/store.selector";
import {hasErrors} from "../../../lib/error/error";
import {yupResolver} from "@hookform/resolvers/yup";
import * as yup from 'yup';
import {ValidationMessage} from "../../../api/model/validation";
import {notify} from "../../../app-common/components/confirm/notification";
import { withCurrency } from "../../../lib/currency/currency";

interface ExpensesProps{
  onClose?: () => void;
}

const ValidationSchema = yup.object({
  description: yup.string().required(ValidationMessage.Required),
  amount: yup.string().required(ValidationMessage.Required)
});

export const Expenses: FC<ExpensesProps> = (props) => {
  const [modal, setModal] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [list, setList] = useState<Expense[]>([]);
  const [filters, setFilters] = useState<any>();

  const store = useSelector(getStore);

  const {register, handleSubmit, reset} = useForm();
  const loadExpenses = async (values?: any) => {
    setLoading(true);

    setFilters(values);
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

      setList(json.list);
    } catch (e) {

      throw e;
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (modal) {
      loadExpenses({
        dateTimeFrom: DateTime.now().startOf('day').toFormat("yyyy-MM-dd'T'HH:mm"),
        dateTimeTo: DateTime.now().endOf('day').toFormat("yyyy-MM-dd'T'HH:mm")
      });
      reset({
        dateTimeFrom: DateTime.now().startOf('day').toFormat("yyyy-MM-dd'T'HH:mm"),
        dateTimeTo: DateTime.now().endOf('day').toFormat("yyyy-MM-dd'T'HH:mm")
      });

      createReset();
    }
    reset();
  }, [modal]);


  const {register: createRegister, handleSubmit: createHandleSubmit, reset: createReset, formState: {errors: createErrors}, setError: createSetError} = useForm({
    resolver: yupResolver(ValidationSchema)
  });

  const [creating, setCreating] = useState(false);
  const createExpense = async (values: any) => {
    setCreating(true);
    try {
      await fetchJson(EXPENSE_CREATE, {
        method: 'POST',
        body: JSON.stringify({
          ...values,
          dateTime: DateTime.now().toISO(),
          store: store?.id
        })
      });

      loadExpenses(filters);
      createReset();
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
          createSetError(item.propertyPath, {
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

  return (
    <>
      <Button variant="danger" size="lg" onClick={() => {
        setModal(true);
      }} title="Expenses" type="button" tabIndex={-1}>
        Expenses
        <Shortcut shortcut="ctrl+e" handler={() => setModal(true)} />
      </Button>

      <Modal open={modal} onClose={() => {
        setModal(false);
        if(props.onClose){
          props.onClose();
        }

      }} title="Expenses" size="full">
        <form onSubmit={createHandleSubmit(createExpense)}>
          <h3 className="text-lg">Add new expenses</h3>
          <div className="grid grid-cols-7 gap-4 mb-5">
            <div className="col-span-3">
              <Input {...createRegister('description')}
                     type="text"
                     placeholder="Description"
                     className="w-full"
                     hasError={hasErrors(createErrors.description)}
              />
              {createErrors.description && (
                <div className="text-danger-500 text-sm">
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
                     className="w-full"
                     hasError={hasErrors(createErrors.amount)}
              />
              {createErrors.amount && (
                <div className="text-danger-500 text-sm">
                  <Trans>
                    {createErrors.amount.message}
                  </Trans>
                </div>
              )}
            </div>
            <div>
              <Button variant="primary" className="w-full" type="submit"
                      disabled={creating}>
                {creating ? 'Adding...' : (
                  <>
                    <FontAwesomeIcon icon={faPlus} className="mr-2" /> Expense
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
        <hr className="my-5"/>
        <form onSubmit={handleSubmit(loadExpenses)}>
          <h3 className="text-lg">Search</h3>
          <div className="grid grid-cols-5 gap-4 mb-5">
            <div className="col-span-2">
              <Input {...register('dateTimeFrom')}
                     type="datetime-local"
                     placeholder="Start time"
                     className="w-full"
              />
            </div>
            <div className="col-span-2">
              <Input {...register('dateTimeTo')}
                     type="datetime-local"
                     placeholder="End time"
                     className="w-full"
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

        {isLoading && (
          <div className="flex justify-center items-center">
            <Loader lines={10} lineItems={3}/>
          </div>
        )}
        {!isLoading && (
          <>
          <div className="grid grid-cols-4 gap-4 mb-5">
            <div className="border border-danger-500 p-5 font-bold text-danger-500 rounded">
              Expenses
              <span className="float-right">
                {withCurrency(list.reduce((prev, item) => prev + item.amount , 0))}
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
                  <td>{withCurrency(order.amount)}</td>
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
