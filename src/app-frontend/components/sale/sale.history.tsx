import React, { FC, useEffect, useMemo, useState } from "react";
import { Button } from "../../../app-common/components/input/button";
import { Modal } from "../../../app-common/components/modal/modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBackward,
  faCheck,
  faChevronDown,
  faChevronRight,
  faClockRotateLeft,
  faEye,
  faPause,
  faPlay,
  faSearch,
  faTrash,
  faTrashRestoreAlt,
  faTruck,
} from "@fortawesome/free-solid-svg-icons";
import { fetchJson } from "../../../api/request/request";
import {
  EXPENSE_LIST,
  ORDER_GET,
  ORDER_LIST,
  ORDER_REFUND,
  ORDER_RESTORE,
} from "../../../api/routing/routes/backend.app";
import { Order, OrderStatus } from "../../../api/model/order";
import { DateTime } from "luxon";
import classNames from "classnames";
import { CartItem } from "../../../api/model/cart.item";
import { Discount } from "../../../api/model/discount";
import { Tax } from "../../../api/model/tax";
import { Customer } from "../../../api/model/customer";
import { Input } from "../../../app-common/components/input/input";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { Controller, useForm } from "react-hook-form";
import { Expense } from "../../../api/model/expense";
import { ViewOrder } from "./view.order";
import { CustomerPayments } from "../customers/customer.payments";
import { ResponsivePie as Pie } from "@nivo/pie";
import { ResponsiveBar as Bar } from "@nivo/bar";
import { createColumnHelper } from "@tanstack/react-table";
import { Shortcut } from "../../../app-common/components/input/shortcut";
import { SalePrint } from "./sale.print";
import { useSelector } from "react-redux";
import { getStore } from "../../../duck/store/store.selector";
import { TableComponent } from "../../../app-common/components/table/table";
import useApi from "../../../api/hooks/use.api";
import { Tooltip } from "antd";
import { withCurrency } from "../../../lib/currency/currency";
import { useAtom } from "jotai";
import { defaultState } from "../../../store/jotai";

interface Props {}

export const SaleHistory: FC<Props> = ({}) => {
  const [appState, setAppState] = useAtom(defaultState);
  const { customer } = appState;

  const [modal, setModal] = useState(false);
  const [list, setList] = useState<Order[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [payments, setPayments] = useState<{ [key: string]: number }>({});

  const useLoadHook = useApi<any>("orders", ORDER_LIST);
  const {
    fetchData: loadList,
    data,
    handleFilterChange,
    filters,
    isFetching,
    resetFilters,
  } = useLoadHook;

  const store = useSelector(getStore);

  const columnHelper = createColumnHelper<Order>();

  const columns = [
    columnHelper.accessor("orderId", {
      header: "Order#",
      cell: (info) => (
        <ViewOrder order={info.row.original}>
          <FontAwesomeIcon icon={faEye} className="mr-2" /> {info.getValue()}
        </ViewOrder>
      ),
    }),
    columnHelper.accessor("createdAt", {
      header: "Time",
      cell: (info) =>
        DateTime.fromISO(info.getValue()).toRelative({ base: DateTime.now() }),
    }),
    columnHelper.accessor("customer", {
      header: "Customer",
      cell: (info) => (
        <>
          {!!info.getValue() ? (
            <Tooltip title="View this customer">
              <span className="text-primary-500 cursor-pointer">
                <CustomerPayments customer={info.getValue()!}>
                  <FontAwesomeIcon icon={faEye} className="mr-2" />
                  {info.getValue()?.name}
                </CustomerPayments>
                {customer?.id === info.getValue()?.id && (
                  <span className="ml-3 btn btn-success">
                    <FontAwesomeIcon icon={faCheck} />
                  </span>
                )}
              </span>
            </Tooltip>
          ) : (
            "Cash Sale"
          )}
        </>
      ),
    }),
    columnHelper.accessor("tax", {
      header: "Order Tax",
      cell: (info) => <>+{withCurrency(info.getValue()?.amount || 0)}</>,
    }),
    columnHelper.accessor("itemTaxes", {
      header: "Items Tax",
      cell: (info) => `+${withCurrency(info.getValue())}`,
    }),
    columnHelper.accessor("discount", {
      header: "Discount",
      cell: (info) => "-" + withCurrency(info.getValue()?.amount || 0),
    }),
    columnHelper.accessor("items", {
      header: "Rate",
      cell: (info) =>
        "+" +
        withCurrency(
          info.getValue().reduce((prev, item) => {
            return item.price * item.quantity + prev;
          }, 0)
        ),
      enableSorting: false,
    }),
    columnHelper.accessor("items", {
      id: "cost",
      header: "Cost",
      cell: (info) =>
        withCurrency(
          info.getValue().reduce((prev, item) => {
            return (item.product?.cost || 0) * item.quantity + prev;
          }, 0)
        ),
      enableSorting: false,
    }),
    columnHelper.accessor("adjustment", {
      header: "Adjustment",
      enableSorting: false,
      cell: (info) => withCurrency(info.getValue()),
    }),
    columnHelper.accessor("payments", {
      header: "Total",
      cell: (info) =>
        "=" +
        withCurrency(
          info.getValue().reduce((prev, payment) => {
            return payment.total + prev;
          }, 0)
        ),
      enableSorting: false,
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: (info) => (
        <span
          className={classNames(
            getOrderStatusClasses(info.getValue()),
            "inline-flex rounded-3xl p-2 justify-center items-center border font-bold text-sm bg-white"
          )}>
          <FontAwesomeIcon
            icon={getOrderStatusIcon(info.getValue())}
            className="mr-1"
          />{" "}
          {orderStatus(info.row.original)}
        </span>
      ),
    }),
    columnHelper.accessor("id", {
      id: "actions",
      header: "Actions",
      enableSorting: false,
      cell: (info) => (
        <div className="flex gap-3">
          {orderStatus(info.row.original) === OrderStatus.DISPATCHED && (
            <Button
              variant="danger"
              className="w-[40px]"
              onClick={() => deleteOrder(info.row.original)}
              disabled={deleting}
              title="Delete">
              <FontAwesomeIcon icon={faTrash} />
            </Button>
          )}
          {orderStatus(info.row.original) === OrderStatus.COMPLETED && (
            <>
              {!info.row.original.returnedFrom && (
                <>
                  <Button
                    variant="danger"
                    className="w-[40px]"
                    onClick={() => refundOrder(info.row.original)}
                    disabled={refunding}
                    title="Refund">
                    <FontAwesomeIcon icon={faBackward} />
                  </Button>
                  {/*<Button variant="success" className="ml-3 w-[40px]" onClick={() => dispatchOrder(info.row.original)}
                          disabled={dispatching} title="Dispatch">
                    <FontAwesomeIcon icon={faTruck}/>
                  </Button>*/}
                </>
              )}
              <Button
                variant="danger"
                className="w-[40px]"
                onClick={() => deleteOrder(info.row.original)}
                disabled={deleting}
                title="Delete">
                <FontAwesomeIcon icon={faTrash} />
              </Button>
            </>
          )}
          {orderStatus(info.row.original) === OrderStatus.ON_HOLD && (
            <>
              <Button
                variant="success"
                className="w-[40px]"
                onClick={() => unsuspendOrder(info.row.original)}
                disabled={unsuspending}
                title="Unsuspend">
                <FontAwesomeIcon icon={faPlay} />
              </Button>
              <Button
                variant="danger"
                className="w-[40px]"
                onClick={() => deleteOrder(info.row.original)}
                disabled={deleting}
                title="Delete">
                <FontAwesomeIcon icon={faTrash} />
              </Button>
            </>
          )}
          {orderStatus(info.row.original) === OrderStatus.DELETED && (
            <>
              <Button
                variant="success"
                className="w-[40px]"
                onClick={() => restoreOrder(info.row.original)}
                disabled={restoring}
                title="Restore">
                <FontAwesomeIcon icon={faTrashRestoreAlt} />
              </Button>
            </>
          )}
          <SalePrint order={info.row.original} />
        </div>
      ),
    }),
  ];

  useEffect(() => {
    if (data?.list) {
      setList(data?.list);
    }

    if (data?.payments) {
      setPayments(data?.payments);
    }
  }, [data?.list, data?.payments]);

  const loadExpenses = async (values?: any) => {
    try {
      const url = new URL(EXPENSE_LIST);
      const params = new URLSearchParams({
        ...values,
        orderBy: "id",
        orderMode: "DESC",
        store: store?.id,
      });

      url.search = params.toString();
      const json = await fetchJson(url.toString());

      setExpenses(json.list);
    } catch (e) {
      throw e;
    }
  };

  const orderStatus = (order: Order) => {
    return order.status;
  };

  const getOrderStatusClasses = (status: string) => {
    let classes: string;
    switch (status) {
      case "Deleted":
        classes = "border-danger-500 text-danger-500";
        break;

      case "Completed":
        classes = "border-success-500 text-success-500";
        break;

      case "Dispatched":
        classes = "border-success-500 text-success-500";
        break;

      case "Returned":
        classes = "border-danger-500 text-danger-500";
        break;

      case "On Hold":
        classes = "border-warning-500 text-warning-500";
        break;

      default:
        classes = "border-primary-500 text-primary-500";
        break;
    }

    return classes;
  };

  const getOrderStatusIcon = (status: string): IconProp => {
    let icon: IconProp;
    switch (status) {
      case "Deleted":
        icon = faTrash;
        break;

      case "Completed":
        icon = faCheck;
        break;

      case "Dispatched":
        icon = faTruck;
        break;

      case "Returned":
        icon = faBackward;
        break;

      case "On Hold":
        icon = faPause;
        break;

      default:
        icon = faCheck;
        break;
    }

    return icon;
  };

  const [unsuspending, setUnsuspending] = useState(false);
  const unsuspendOrder = async (order: Order) => {
    if (!window.confirm("Unsuspend order?")) return false;
    setUnsuspending(true);
    try {
      await fetchJson(ORDER_GET.replace(":id", order.id), {
        method: "DELETE",
      });

      const items: CartItem[] = [];
      order.items.forEach((item) => {
        items.push({
          quantity: item.quantity,
          price: item.price,
          discount: 0,
          variant: item.variant,
          item: item.product,
          taxes: item.taxes,
        });
      });

      setAppState((prev) => ({
        ...prev,
        added: items,
        discount: order.discount?.type,
        tax: order.tax?.type,
        discountAmount: order.discount?.amount,
        customer: order?.customer,
      }));

      setModal(false);
    } catch (e) {
      throw e;
    } finally {
      setUnsuspending(false);
    }
  };

  const [refunding, setRefunding] = useState(false);
  const refundOrder = async (order: Order) => {
    if (!window.confirm("Refund order?")) return false;
    setRefunding(true);
    try {
      await fetchJson(ORDER_REFUND.replace(":id", order.id), {
        method: "POST",
      });

      const items: CartItem[] = [];
      order.items.forEach((item) => {
        items.push({
          quantity: -1 * item.quantity,
          price: item.price,
          discount: 0,
          variant: item.variant,
          item: item.product,
          taxes: item.taxes,
        });
      });

      setAppState((prev) => ({
        ...prev,
        added: items,
        discount: order.discount?.type,
        tax: order.tax?.type,
        discountAmount: order.discount?.amount,
        customer: order?.customer,
        refundingFrom: Number(order.id),
      }));

      setModal(false);
    } catch (e) {
      throw e;
    } finally {
      setRefunding(false);
    }
  };

  // TODO: disable for now and add in a separate module
  // const [dispatching, setDispatching] = useState(false);
  // const dispatchOrder = async (order: Order) => {
  //   if (!window.confirm('Dispatch order?')) return false;
  //   setDispatching(true);
  //   try {
  //     await fetchJson(ORDER_DISPATCH.replace(':id', order.id), {
  //       method: 'POST'
  //     });
  //
  //     loadList();
  //
  //   } catch (e) {
  //     throw e;
  //   } finally {
  //     setDispatching(false);
  //   }
  // };

  const [deleting, setDeleting] = useState(false);
  const deleteOrder = async (order: Order) => {
    if (!window.confirm("Delete order?")) return false;
    setDeleting(true);
    try {
      await fetchJson(ORDER_GET.replace(":id", order.id), {
        method: "DELETE",
      });

      loadList();
    } catch (e) {
      throw e;
    } finally {
      setDeleting(false);
    }
  };

  const [restoring, setRestoring] = useState(false);
  const restoreOrder = async (order: Order) => {
    if (!window.confirm("Restore order?")) return false;
    setRestoring(true);
    try {
      await fetchJson(ORDER_RESTORE.replace(":id", order.id), {
        method: "POST",
      });
      loadList();
    } catch (e) {
      throw e;
    } finally {
      setRestoring(false);
    }
  };

  const discountTotal = useMemo(() => {
    return list.reduce((prev, order) => {
      if (order?.discount && order?.discount?.amount) {
        return order?.discount?.amount + prev;
      }

      return prev;
    }, 0);
  }, [list]);

  const taxTotal = useMemo(() => {
    return list.reduce((prev, order) => {
      if (order?.tax && order?.tax?.amount) {
        return order?.tax?.amount + prev;
      }

      return prev;
    }, 0);
  }, [list]);

  const totalAmount = useMemo(() => {
    return list.reduce((prev, order) => {
      if (order.status !== "Deleted") {
        return (
          prev + order.payments.reduce((p, payment) => p + payment.received, 0)
        );
      }

      return prev;
    }, 0);
  }, [list]);

  const totalCost = useMemo(() => {
    return list.reduce((prev, order) => {
      if (order.status !== "Deleted") {
        return (
          prev +
          order.items.reduce((p, item) => {
            if (item.product.cost) {
              return p + item.product.cost;
            }

            return p;
          }, 0)
        );
      }
      return prev;
    }, 0);
  }, [list]);

  const totalExpenses = useMemo(() => {
    return expenses.reduce((prev, item) => prev + item.amount, 0);
  }, [expenses]);

  const customerChartData = useMemo(() => {
    const customers: { [name: string]: number } = {};
    list.forEach((order) => {
      if (order?.customer) {
        if (!customers[order?.customer?.name]) {
          customers[order?.customer?.name] = 0;
        }

        customers[order?.customer?.name] += order.payments.reduce(
          (p, payment) => p + payment.total,
          0
        );
      } else {
        const cash = "Cash";
        if (!customers[cash]) {
          customers[cash] = 0;
        }

        customers[cash] += order.payments.reduce(
          (p, payment) => p + payment.total,
          0
        );
      }
    });

    const data: { id: string; value: number }[] = [];
    Object.keys(customers).forEach((c) => {
      data.push({
        id: c,
        value: customers[c],
      });
    });

    return data;
  }, [list]);

  const { register, handleSubmit, reset, control } = useForm();

  useEffect(() => {
    reset({
      dateTimeFrom: DateTime.now()
        .minus({ day: 1 })
        .startOf("day")
        .toFormat("yyyy-MM-dd'T'HH:mm"),
      dateTimeTo: DateTime.now().endOf("day").toFormat("yyyy-MM-dd'T'HH:mm"),
    });
  }, [modal, reset]);

  const [areChartsOpen, setChartsOpen] = useState(false);

  const searchSale = async (values: any) => {
    handleFilterChange(values);
  };

  return (
    <>
      <Tooltip title="Sale lookup">
        <Button
          variant="primary"
          size="lg"
          onClick={() => {
            setModal(true);
          }}
          tabIndex={-1}
          className="btn-square">
          <FontAwesomeIcon icon={faClockRotateLeft} />
          <Shortcut shortcut="ctrl+h" handler={() => setModal(true)} />
        </Button>
      </Tooltip>

      <Modal
        open={modal}
        onClose={() => {
          setModal(false);
        }}
        title="Sale history"
        size="full">
        <form onSubmit={handleSubmit(searchSale)}>
          <div className="grid grid-cols-6 gap-4 mb-5">
            <div className="col-span-3">
              <Input
                type="search"
                placeholder="Search in Order#, Status, Customer"
                className="search-field w-full"
                {...register("q")}
              />
            </div>
            <div>
              <Controller
                name="dateTimeFrom"
                render={(props) => (
                  <Input
                    {...props.field}
                    type="datetime-local"
                    placeholder="Start time"
                    className=" w-full"
                  />
                )}
                control={control}
              />
            </div>
            <div>
              <Controller
                name="dateTimeTo"
                render={(props) => (
                  <Input
                    {...props.field}
                    type="datetime-local"
                    placeholder="End time"
                    className=" w-full"
                  />
                )}
                control={control}
              />
            </div>
            <div>
              <Button
                variant="primary"
                className="w-full"
                type="submit"
                disabled={isFetching}>
                {isFetching ? (
                  "Searching..."
                ) : (
                  <>
                    <FontAwesomeIcon icon={faSearch} className="mr-2" /> Search
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>

        {!isFetching && (
          <>
            <h3
              className="mb-3 text-lg cursor-pointer"
              onClick={() => setChartsOpen(!areChartsOpen)}>
              Charts{" "}
              {areChartsOpen ? (
                <FontAwesomeIcon icon={faChevronDown} />
              ) : (
                <FontAwesomeIcon icon={faChevronRight} />
              )}
            </h3>
            {areChartsOpen && (
              <div className="mb-5 grid grid-cols-3 gap-4">
                <div>
                  <h4 className="text-lg">Payment types</h4>
                  <div className="h-[300px]">
                    {payments && (
                      <Pie
                        data={Object.keys(payments).map((item) => {
                          return { id: item, value: payments[item] };
                        })}
                        innerRadius={0.6}
                        padAngle={0.5}
                        cornerRadius={5}
                        arcLinkLabel={(d) => `${d.id}: ${d.value}`}
                        enableArcLabels={false}
                        enableArcLinkLabels={false}
                        colors={{ scheme: "purpleRed_green" }}
                        margin={{
                          top: 20,
                          bottom: 20,
                        }}
                      />
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-lg">Sales</h4>
                  <div className="h-[300px]">
                    <Bar
                      data={[
                        { id: "Sale", value: totalAmount.toFixed(2) },
                        { id: "Cost", value: totalCost.toFixed(2) },
                        { id: "Discount", value: discountTotal.toFixed(2) },
                        { id: "Tax", value: taxTotal.toFixed(2) },
                        { id: "Expense", value: totalExpenses.toFixed(2) },
                      ]}
                      // keys={['value']}
                      margin={{
                        bottom: 50,
                        left: 50,
                        top: 20,
                      }}
                      valueScale={{ type: "linear" }}
                      tooltip={({ indexValue, value }) => {
                        return (
                          <span className="bg-white rounded p-1 text-sm shadow">
                            {indexValue}: {value}
                          </span>
                        );
                      }}
                    />
                  </div>
                </div>

                <div>
                  <h4 className="text-lg">Customers</h4>
                  <div className="h-[300px]">
                    <Bar
                      data={customerChartData}
                      // keys={['value']}
                      margin={{
                        bottom: 50,
                        left: 50,
                        top: 20,
                      }}
                      valueScale={{ type: "linear" }}
                      tooltip={({ indexValue, value }) => {
                        return (
                          <span className="bg-white rounded p-1 text-sm shadow">
                            {indexValue}: {value}
                          </span>
                        );
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
            <div className="grid grid-cols-5 gap-4 mb-5">
              <div className="border border-primary-500 p-5 font-bold text-primary-500 rounded">
                Total Bills
                <span className="float-right">{list.length}</span>
              </div>
              <div className="border border-primary-500 p-5 font-bold text-primary-500 rounded">
                Total Amount
                <span className="float-right">{withCurrency(totalAmount)}</span>
              </div>
              <div className="border border-warning-500 p-5 font-bold text-warning-500 rounded">
                Total Cost
                <span className="float-right">{withCurrency(totalCost)}</span>
              </div>
              <div className="border border-danger-500 p-5 font-bold text-danger-500 rounded">
                Expenses
                <span className="float-right">
                  {withCurrency(totalExpenses)}
                </span>
              </div>
              <div
                className={classNames(
                  "border",
                  "p-5 font-bold rounded",
                  totalAmount - totalCost - totalExpenses <= 0
                    ? "text-danger-500 border-danger-500"
                    : "text-success-500 border-success-500"
                )}>
                {totalAmount - totalCost - totalExpenses <= 0
                  ? "Loss"
                  : "Profit"}
                <span className="float-right">
                  {withCurrency(totalAmount - totalCost - totalExpenses)}
                </span>
              </div>
            </div>
          </>
        )}

        <TableComponent
          columns={columns}
          useLoadList={useLoadHook}
          loaderLineItems={11}
          dataKey="list"
          totalKey="total"
          enableSearch={false}
          sort={[
            {
              id: "orderId",
              desc: true,
            },
          ]}
        />
      </Modal>
    </>
  );
};
