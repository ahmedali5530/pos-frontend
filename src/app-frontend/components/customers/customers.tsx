import React, {FC, PropsWithChildren, useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faHistory, faPencilAlt, faTrash, faUsers} from "@fortawesome/free-solid-svg-icons";
import {Button} from "../../../app-common/components/input/button";
import {Modal} from "../../../app-common/components/modal/modal";
import {Controller, useForm} from "react-hook-form";
import {Input} from "../../../app-common/components/input/input";
import {faSquare, faSquareCheck} from "@fortawesome/free-regular-svg-icons";
import {CustomerPayments} from "./customer.payments";
import {ConstraintViolation, ValidationResult,} from "../../../lib/validator/validation.result";
import {HttpException, UnprocessableEntityException,} from "../../../lib/http/exception/http.exception";
import {createColumnHelper} from "@tanstack/react-table";
import {TableComponent} from "../../../app-common/components/table/table";
import {Shortcut} from "../../../app-common/components/input/shortcut";
import * as yup from "yup";
import {ValidationMessage} from "../../../api/model/validation";
import {getErrors, hasErrors} from "../../../lib/error/error";
import {yupResolver} from "@hookform/resolvers/yup";
import {notify} from "../../../app-common/components/confirm/notification";
import {withCurrency} from "../../../lib/currency/currency";
import {useAtom} from "jotai";
import {defaultState} from "../../../store/jotai";
import {Switch} from "../../../app-common/components/input/switch";
import useApi, {SettingsData} from "../../../api/db/use.api";
import {Tables} from "../../../api/db/tables";
import {useDB} from "../../../api/db/db";
import {toRecordId} from "../../../api/model/common";
import {Customer, CUSTOMER_FETCHES} from "../../../api/model/customer";
import {useCustomer} from "../../../api/hooks/use.customer";

interface Props extends PropsWithChildren {
  className?: string;
}

const ValidationSchema = yup.object({
  name: yup.string().required(ValidationMessage.Required),
  phone: yup.string().required(ValidationMessage.Required),
  opening_balance: yup
    .number()
    .typeError(ValidationMessage.Number)
    .required(ValidationMessage.Required),
});

export const Customers: FC<Props> = ({children, className}) => {
  const db = useDB();
  const customerHook = useCustomer();
  const [{customer, refundingFrom}, setAppState] = useAtom(defaultState);
  const setCustomer = (customer?: Customer) => {
    setAppState((prev) => ({
      ...prev,
      customer,
    }));
  };

  const [modal, setModal] = useState(false);
  const [operation, setOperation] = useState("create");

  const useLoadHook = useApi<SettingsData<Customer>>(Tables.customer, [], [], 0, 10, CUSTOMER_FETCHES);
  const {fetchData} = useLoadHook;

  const columnHelper = createColumnHelper<Customer>();

  const columns: any = [
    columnHelper.accessor("name", {
      header: "Name",
    }),
    columnHelper.accessor("phone", {
      header: "Phone",
    }),
    columnHelper.accessor("cnic", {
      header: "National ID",
    }),
    columnHelper.accessor("opening_balance", {
      header: "Opening balance",
      cell: info => withCurrency(info.getValue())
    }),
    columnHelper.accessor("id", {
      'id': 'sale',
      header: "Credit Sale",
      enableSorting: false,
      enableColumnFilter: false,
      cell: info => withCurrency(customerHook.calculateCustomerSale(info.row.original))
    }),
    columnHelper.accessor("id", {
      id: 'payments',
      header: "Payments",
      enableSorting: false,
      enableColumnFilter: false,
      cell: info => withCurrency(customerHook.calculateCustomerPayment(info.row.original))
    }),
    columnHelper.accessor("outstanding", {
      header: "Balance",
      enableSorting: false,
      enableColumnFilter: false,
      cell: (info) => withCurrency(
        customerHook.calculateCustomerSale(info.row.original) - customerHook.calculateCustomerPayment(info.row.original) + Number(info.row.original.opening_balance)
      )
    }),
    columnHelper.accessor("id", {
      id: "customerSelector",
      enableSorting: false,
      enableColumnFilter: false,
      header: "Select",
      cell: (info) => (
        <>
          {customer?.id === info.getValue() ? (
            <Button
              variant="success"
              onClick={() => setCustomer(undefined)}
              className="w-[40px]"
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
              className="w-[40px]">
              <FontAwesomeIcon icon={faSquare} size="lg"/>
            </Button>
          )}
        </>
      ),
    }),
    columnHelper.accessor("id", {
      id: "actions",
      header: "Actions",
      enableSorting: false,
      enableColumnFilter: false,
      cell: (info) => {
        return (
          <>
            <Button
              type="button"
              variant="primary"
              className="w-[40px]"
              onClick={() => {
                reset({
                  name: info.row.original.name,
                  phone: info.row.original.phone,
                  cnic: info.row.original.cnic,
                  opening_balance: info.row.original.opening_balance,
                  allow_credit_sale: info.row.original.allow_credit_sale,
                  credit_limit: info.row.original.credit_limit,
                  id: info.row.original.id
                });
                setOperation("update");
              }}>
              <FontAwesomeIcon icon={faPencilAlt}/>
            </Button>
            <span className="mx-2 text-gray-300">|</span>
            <Button variant="danger" type="button">
              <FontAwesomeIcon icon={faTrash}/>
            </Button>
            <span className="mx-2 text-gray-300">|</span>
            <CustomerPayments
              customer={info.row.original}
              onCreate={fetchData}
            >
              <FontAwesomeIcon icon={faHistory}/>
            </CustomerPayments>
          </>
        );
      },
    }),
  ];

  const {
    register,
    handleSubmit,
    setError,
    formState: {errors},
    reset,
    control
  } = useForm({
    resolver: yupResolver(ValidationSchema),
  });
  const [creating, setCreating] = useState(false);
  const createCustomer = async (values: any, event?: any) => {
    event.stopPropagation();
    event.preventDefault();

    setCreating(true);
    // values.opening_balance = values.opening_balance.toString();

    values.credit_limit = Number(values.credit_limit);

    try {
      if (values?.id) {
        await db.merge(toRecordId(values.id), {
          ...values,
        });
      } else {
        const [customer] = await db.insert(Tables.customer, {
          ...values,
          orders: [],
          payments: []
        });

        setCustomer(customer);
      }

      fetchData!();

      resetForm();
      setOperation("create");
    } catch (exception: any) {
      if (exception instanceof HttpException) {
        if (exception.message) {
          notify({
            type: "error",
            description: exception.message,
          });
        }
      }

      if (exception instanceof UnprocessableEntityException) {
        const e: ValidationResult = await exception.response.json();
        e.violations.forEach((item: ConstraintViolation) => {
          setError(item.propertyPath, {
            message: item.message,
            type: "server",
          });
        });

        if (e.errorMessage) {
          notify({
            type: "error",
            description: e.errorMessage,
          });
        }

        return false;
      }

      throw exception;
    } finally {
      setCreating(false);
    }
  };

  const resetForm = () => {
    reset({
      name: null,
      phone: null,
      cnic: null,
      opening_balance: null,
      allow_credit_sale: null,
      credit_limit: null
    });
  };

  return (
    <>
      <button
        className={className ? className : "btn btn-primary lg"}
        type="button"
        onClick={() => {
          setModal(true);
        }}
        title="Customers"
        tabIndex={-1}
        disabled={!!refundingFrom}
      >
        {children || (
          <>
            <FontAwesomeIcon icon={faUsers} className="mr-2"/> Customers
          </>
        )}
        <Shortcut disabled={!!refundingFrom} shortcut="ctrl+shift+c" handler={() => setModal(true)}/>
      </button>

      <Modal
        shouldCloseOnEsc={true}
        open={modal}
        onClose={() => {
          setModal(false);
        }}
        title="Customers">
        <form className="mb-5" onSubmit={handleSubmit(createCustomer)}>
          <div className="grid lg:grid-cols-4 gap-4 gap-y-2 mb-3 md:grid-cols-3 sm:grid-cols-1">
            <div>
              <label htmlFor="name">Name</label>
              <Controller
                render={({field}) => (
                  <Input
                    value={field.value}
                    onChange={field.onChange}
                    id="name"
                    className="w-full"
                    hasError={hasErrors(errors.name)}
                  />
                )}
                control={control}
                name="name"
              />
              {getErrors(errors.name)}
            </div>
            <div>
              <label htmlFor="phone">Phone</label>
              <Controller
                render={({field}) => (
                  <Input
                    value={field.value}
                    onChange={field.onChange}
                    id="phone"
                    className="w-full"
                    hasError={hasErrors(errors.phone)}
                  />
                )}
                name="phone"
                control={control}
              />
              {getErrors(errors.phone)}
            </div>
            <div>
              <label htmlFor="cnic">National ID</label>
              <Controller
                render={({field}) => (
                  <Input
                    value={field.value}
                    onChange={field.onChange}
                    id="cnic"
                    className="w-full"
                    hasError={hasErrors(errors.cnic)}
                  />
                )}
                name="cnic"
                control={control}
              />
              {getErrors(errors.cnic)}
            </div>
            <div>
              <label htmlFor="opening_balance">Opening balance</label>
              <Controller
                render={({field}) => (
                  <Input
                    value={field.value}
                    onChange={field.onChange}
                    id="opening_balance"
                    className="w-full"
                    hasError={hasErrors(errors.opening_balance)}
                    type="number"
                  />
                )}
                name="opening_balance"
                control={control}
              />
              {getErrors(errors.opening_balance)}
            </div>
            <div>
              <label className="md:block w-full sm:hidden">&nbsp;</label>
              <Controller
                render={({field}) => (
                  <Switch
                    value={field.value}
                    onChange={field.onChange}
                  >
                    Allow credit
                  </Switch>
                )}
                name="allow_credit"
                control={control}
              />

              {getErrors(errors.allow_credit)}
            </div>
            <div>
              <label htmlFor="credit_limit">Credit Limit</label>
              <Controller
                render={({field}) => (
                  <Input
                    value={field.value}
                    onChange={field.onChange}
                    id="credit_limit"
                    className="w-full"
                    hasError={hasErrors(errors.credit_limit)}
                    type="number"
                  />
                )}
                name="credit_limit"
                control={control}
              />
              {getErrors(errors.credit_limit)}
            </div>
            <div>
              <label className="md:block w-full sm:hidden">&nbsp;</label>
              <Button variant="primary" type="submit" disabled={creating}>
                {creating
                  ? "Saving..."
                  : operation === "create"
                    ? "Create new"
                    : "Update"}
              </Button>

              {operation === "update" && (
                <Button
                  variant="secondary"
                  className="ml-3"
                  type="button"
                  onClick={() => {
                    setOperation("create");
                    resetForm();
                  }}>
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </form>

        <hr/>

        <TableComponent
          columns={columns}
          loaderHook={useLoadHook}
          loaderLineItems={9}
        />
      </Modal>
    </>
  );
};
