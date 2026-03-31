import React, {FC, useEffect, useMemo, useState} from "react";
import {Button} from "../../../app-common/components/input/button";
import {Modal} from "../../../app-common/components/modal/modal";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
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
import {Order, ORDER_FETCHES, OrderStatus} from "../../../api/model/order";
import {DateTime} from "luxon";
import classNames from "classnames";
import {CartItem} from "../../../api/model/cart.item";
import {Discount} from "../../../api/model/discount";
import {Tax} from "../../../api/model/tax";
import {Customer} from "../../../api/model/customer";
import {Input} from "../../../app-common/components/input/input";
import {IconProp} from "@fortawesome/fontawesome-svg-core";
import {Controller, useForm} from "react-hook-form";
import {Expense} from "../../../api/model/expense";
import {ViewOrder} from "./view.order";
import {CustomerPayments} from "../customers/customer.payments";
import {ResponsivePie as Pie} from "@nivo/pie";
import {ResponsiveBar as Bar} from "@nivo/bar";
import {createColumnHelper} from "@tanstack/react-table";
import {Shortcut} from "../../../app-common/components/input/shortcut";
import {SalePrint} from "./sale.print";
import {TableComponent} from "../../../app-common/components/table/table";
import {Tooltip} from "antd";
import {withCurrency} from "../../../lib/currency/currency";
import {useAtom} from "jotai";
import {appState as AppState, defaultState} from "../../../store/jotai";
import {Tables} from "../../../api/db/tables";
import useApi from "../../../api/db/use.api";
import {useDB} from "../../../api/db/db";
import {toRecordId} from "../../../api/model/common";
import {useQueryBuilder} from "../../../api/db/query-builder";
import {useCustomer} from "../../../api/hooks/use.customer";

interface Props {
}

export const SaleHistory: FC<Props> = ({}) => {
  const [appState, setAppState] = useAtom(defaultState);
  const db = useDB();
  const {customer} = appState;

  const [appSt] = useAtom(AppState);
  const {store} = appSt;

  const [modal, setModal] = useState(false);
  // const [list, setList] = useState<Order[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const startTime = DateTime.now()
    .minus({day: 1})
    .startOf("day")
    .toFormat(import.meta.env.VITE_SURREAL_DB_DATE_TIME_FORMAT);

  const endTime = DateTime.now().endOf("day").toFormat(import.meta.env.VITE_SURREAL_DB_DATE_TIME_FORMAT);

  const useLoadHook = useApi<any>(Tables.order, [`created_at >= d"${startTime}" and created_at <= d"${endTime}"`], ['created_at DESC'], 0, 10, ORDER_FETCHES);

  const {
    fetchData: fetchOrders,
    data,
    handleFilterChange,
    handleParameterChange,
    isLoading,
    resetFilters,
  } = useLoadHook;

  const payments = useMemo(() => {
    const list = {};
    let cash = 0;
    data?.data?.forEach(order => {
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
  }, [data]);

  const columnHelper = createColumnHelper<Order>();
  const customerHook = useCustomer();

  const columns = [
    columnHelper.accessor("order_id", {
      header: "Order#",
      cell: (info) => (
        <ViewOrder order={info.row.original}>
          <FontAwesomeIcon icon={faEye} className="mr-2"/> {info.getValue()}
        </ViewOrder>
      ),
    }),
    columnHelper.accessor("created_at", {
      header: "Time",
      cell: (info) => (<span title={info.getValue()}>
        {DateTime.fromJSDate(info.getValue()).toRelative({base: DateTime.now()})}
      </span>),
    }),
    columnHelper.accessor("customer", {
      header: "Customer",
      cell: (info) => (
        <>
          {!!info.getValue() ? (
            <span className="text-primary-500 cursor-pointer">
              <CustomerPayments
                customer={info.getValue()}
              >
                <FontAwesomeIcon icon={faEye} className="mr-2"/>
                {info.getValue()?.name}
              </CustomerPayments>
              {customer?.id === info.getValue()?.id && (
                <span className="ml-3 btn btn-success">
                  <FontAwesomeIcon icon={faCheck}/>
                </span>
              )}
            </span>
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
    columnHelper.accessor("items", {
      id: "itemTax",
      header: "Items Tax",
      cell: (info) => `+${withCurrency(0)}`,
    }),
    columnHelper.accessor("discount", {
      header: "Discount",
      cell: (info) => "-" + withCurrency(info.getValue()?.amount || 0),
    }),
    columnHelper.accessor("items", {
      id: "rate",
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
            return (item?.product?.cost || 0) * item?.quantity + prev;
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
              <FontAwesomeIcon icon={faTrash}/>
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
                    <FontAwesomeIcon icon={faBackward}/>
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
                <FontAwesomeIcon icon={faTrash}/>
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
                <FontAwesomeIcon icon={faPlay}/>
              </Button>
              <Button
                variant="danger"
                className="w-[40px]"
                onClick={() => deleteOrder(info.row.original)}
                disabled={deleting}
                title="Delete">
                <FontAwesomeIcon icon={faTrash}/>
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
                <FontAwesomeIcon icon={faTrashRestoreAlt}/>
              </Button>
            </>
          )}
          <SalePrint order={info.row.original}/>
        </div>
      ),
    }),
  ];

  const qb = useQueryBuilder(Tables.expense, '*', [], undefined, undefined, ['created_at DESC']);

  const loadExpenses = async (values?: any) => {
    try {
      qb.setWheres([]);

      if (values.startTime) {
        qb.addWhere(`created_at >= d"${values.startTime}"`);
      }
      if (values.endTime) {
        qb.addWhere(`created_at <= d"${values.endTime}"`);
      }

      qb.addWhere('store = $store');
      qb.addParameter('store', toRecordId(store?.id));

      const [data] = await db.query(qb.queryString);

      setExpenses(data);
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
      await db.merge(order.id, {
        status: OrderStatus.PENDING
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
        orderId: order.id
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
      await db.merge(order.id, {
        status: OrderStatus.RETURNED
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
        refundingFrom: order.id
      }));

      fetchOrders();

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
      await db.merge(order.id, {
        status: OrderStatus.DELETED
      });

      fetchOrders();
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
      await db.merge(order.id, {
        status: OrderStatus.COMPLETED
      });

      fetchOrders();
    } catch (e) {
      throw e;
    } finally {
      setRestoring(false);
    }
  };

  const discountTotal = useMemo(() => {
    return data?.data?.reduce((prev, order) => {
      if (order?.discount && order?.discount?.amount) {
        return order?.discount?.amount + prev;
      }

      return prev;
    }, 0);
  }, [data]);

  const taxTotal = useMemo(() => {
    return data?.data?.reduce((prev, order) => {
      if (order?.tax && order?.tax?.amount) {
        return order?.tax?.amount + prev;
      }

      return prev;
    }, 0);
  }, [data]);

  const totalAmount = useMemo(() => {
    return data?.data?.reduce((prev, order) => {
      if (order.status !== OrderStatus.DELETED && order.status !== OrderStatus.PENDING) {
        return (
          prev + order.payments.reduce((p, payment) => p + payment.received, 0)
        );
      }

      return prev;
    }, 0);
  }, [data]);

  const totalCost = useMemo(() => {
    return data?.data?.reduce((prev, order) => {
      if (order.status !== "Deleted") {
        return (
          prev +
          order.items.reduce((p, item) => {
            if (item?.product?.cost) {
              return p + item.product.cost;
            }

            return p;
          }, 0)
        );
      }
      return prev;
    }, 0);
  }, [data]);

  const totalExpenses = useMemo(() => {
    return expenses.reduce((prev, item) => prev + item.amount, 0);
  }, [expenses]);

  const storesChartData = useMemo(() => {
    const stores: { [name: string]: number } = {};
    data?.data?.forEach((order) => {
      if (order?.store) {
        const storeName = `${order?.store?.name}`;
        if (!stores[storeName]) {
          stores[storeName] = 0;
        }

        stores[storeName] += order.payments.reduce(
          (p, payment) => p + payment.total,
          0
        );
      }
    });

    const d: { id: string; value: number }[] = [];
    Object.keys(stores).forEach((c) => {
      d.push({
        id: c,
        value: stores[c],
      });
    });

    return d;
  }, [data])

  const terminalsChartData = useMemo(() => {
    const terminals: { [name: string]: number } = {};
    data?.data?.forEach((order) => {
      if (order?.terminal) {
        const terminalName = `${order?.store?.name} - ${order?.terminal?.code}`;
        if (!terminals[terminalName]) {
          terminals[terminalName] = 0;
        }

        terminals[terminalName] += order.payments.reduce(
          (p, payment) => p + payment.total,
          0
        );
      }
    });

    const d: { id: string; value: number }[] = [];
    Object.keys(terminals).forEach((c) => {
      d.push({
        id: c,
        value: terminals[c],
      });
    });

    return d;
  }, [data]);

  const customerChartData = useMemo(() => {
    const customers: { [name: string]: number } = {};
    data?.data?.forEach((order) => {
      if (order?.customer) {
        if (!customers[order?.customer?.name]) {
          customers[order?.customer?.name] = 0;
        }

        customers[order?.customer?.name] += order.payments.reduce(
          (p, payment) => p + payment.total,
          0
        );
      } else {
        // only show customers and remove cash from chart
        // const cash = "Cash";
        // if (!customers[cash]) {
        //   customers[cash] = 0;
        // }
        //
        // customers[cash] += order.payments.reduce(
        //   (p, payment) => p + payment.total,
        //   0
        // );
      }
    });

    const d: { id: string; value: number }[] = [];
    Object.keys(customers).forEach((c) => {
      d.push({
        id: c,
        value: customers[c],
      });
    });

    return d;
  }, [data]);

  const statusChartData = useMemo(() => {
    const statuses: { [name: string]: number } = {};
    data?.data?.forEach((order) => {
      if (order?.terminal) {
        const status = order.status;
        if (!statuses[status]) {
          statuses[status] = 0;
        }

        statuses[status] += order.payments.reduce(
          (p, payment) => p + payment.total,
          0
        );
      }
    });

    const d: { id: string; value: number }[] = [];
    Object.keys(statuses).forEach((c) => {
      d.push({
        id: c,
        value: statuses[c],
      });
    });

    return d;
  }, [data]);

  const {handleSubmit, reset, control} = useForm();

  const [areChartsOpen, setChartsOpen] = useState(false);

  const searchSale = async (values: any) => {
    resetFilters();

    const newFilters = [];
    const newParameters = {};
    const dates = {};

    if (values.q && values.q.trim() !== '') {
      newFilters.push(`customer.name = $q or order_id = $q or status = $q`);
      newParameters['q'] = values.q;
    }

    if (values.dateTimeFrom) {
      const toDbDate = DateTime.fromFormat(values.dateTimeFrom, "yyyy-MM-dd'T'HH:mm").toFormat(import.meta.env.VITE_SURREAL_DB_DATE_TIME_FORMAT);
      newFilters.push(`created_at >= d"${toDbDate}"`);
      dates['startTime'] = toDbDate;
    }

    if (values.dateTimeTo) {
      const toDbDate = DateTime.fromFormat(values.dateTimeTo, "yyyy-MM-dd'T'HH:mm").toFormat(import.meta.env.VITE_SURREAL_DB_DATE_TIME_FORMAT);
      newFilters.push(`created_at <= d"${toDbDate}"`);
      dates['endTime'] = toDbDate;
    }

    handleFilterChange(newFilters);
    handleParameterChange(newParameters);

    await loadExpenses(dates)
  };

  useEffect(() => {
    if (modal) {
      setTimeout(() => {
        fetchOrders();
        loadExpenses({
          startTime,
          endTime
        })
      }, 100);
    }
  }, [modal]);

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
          iconButton
        >
          <FontAwesomeIcon icon={faClockRotateLeft}/>
          <Shortcut shortcut="ctrl+shift+h" handler={() => setModal(true)}/>
        </Button>
      </Tooltip>

      {modal && (
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
                <Controller
                  render={({field}) => (
                    <Input
                      type="search"
                      placeholder="Search in Order#, Status, Customer"
                      className="search-field w-full"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                  name="q"
                  control={control}
                />
              </div>
              <div>
                <Controller
                  name="dateTimeFrom"
                  render={({field}) => (
                    <Input
                      value={field.value}
                      onChange={field.onChange}
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
                  render={({field}) => (
                    <Input
                      value={field.value}
                      onChange={field.onChange}
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
                  disabled={isLoading}>
                  {isLoading ? (
                    "Searching..."
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faSearch} className="mr-2"/> Search
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>

          {!isLoading && (
            <>
              <h3
                className="mb-3 text-lg cursor-pointer"
                onClick={() => setChartsOpen(!areChartsOpen)}>
                Charts{" "}
                {areChartsOpen ? (
                  <FontAwesomeIcon icon={faChevronDown}/>
                ) : (
                  <FontAwesomeIcon icon={faChevronRight}/>
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
                            return {id: item, value: payments[item]};
                          })}
                          innerRadius={0.6}
                          padAngle={0.5}
                          cornerRadius={5}
                          arcLinkLabel={(d) => `${d.id}: ${withCurrency(d.value)}`}
                          enableArcLabels={false}
                          enableArcLinkLabels={false}
                          colors={{scheme: "purpleRed_green"}}
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
                          {id: "Sale", value: totalAmount.toFixed(2)},
                          {id: "Cost", value: totalCost.toFixed(2)},
                          {id: "Discount", value: discountTotal.toFixed(2)},
                          {id: "Tax", value: taxTotal.toFixed(2)},
                          {id: "Expense", value: totalExpenses.toFixed(2)},
                        ]}
                        // keys={['value']}
                        margin={{
                          bottom: 50,
                          left: 50,
                          top: 20,
                        }}
                        valueScale={{type: "linear"}}
                        tooltip={({indexValue, value}) => {
                          return (
                            <span className="bg-white rounded p-1 text-sm shadow">
                            {indexValue}: {withCurrency(value)}
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
                        valueScale={{type: "linear"}}
                        tooltip={({indexValue, value}) => {
                          return (
                            <span className="bg-white rounded p-1 text-sm shadow">
                            {indexValue}: {withCurrency(value)}
                          </span>
                          );
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg">Statuses</h4>
                    <div className="h-[300px]">
                      <Bar
                        data={statusChartData}
                        // keys={['value']}
                        margin={{
                          bottom: 50,
                          left: 50,
                          top: 20,
                        }}
                        valueScale={{type: "linear"}}
                        tooltip={({indexValue, value}) => {
                          return (
                            <span className="bg-white rounded p-1 text-sm shadow">
                            {indexValue}: {withCurrency(value)}
                          </span>
                          );
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg">Stores</h4>
                    <div className="h-[300px]">
                      <Bar
                        data={storesChartData}
                        // keys={['value']}
                        margin={{
                          bottom: 50,
                          left: 50,
                          top: 20,
                        }}
                        valueScale={{type: "linear"}}
                        tooltip={({indexValue, value}) => {
                          return (
                            <span className="bg-white rounded p-1 text-sm shadow">
                            {indexValue}: {withCurrency(value)}
                          </span>
                          );
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg">Terminals</h4>
                    <div className="h-[300px]">
                      <Bar
                        data={terminalsChartData}
                        // keys={['value']}
                        margin={{
                          bottom: 50,
                          left: 50,
                          top: 20,
                        }}
                        valueScale={{type: "linear"}}
                        tooltip={({indexValue, value}) => {
                          return (
                            <span className="bg-white rounded p-1 text-sm shadow">
                            {indexValue}: {withCurrency(value)}
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
                  <span className="float-right">{data?.data?.length ?? '-'}</span>
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
            loaderHook={useLoadHook}
            loaderLineItems={11}
            enableSearch={false}
            sort={[
              {
                id: "created_at",
                desc: true,
              },
            ]}
          />
        </Modal>
      )}
    </>
  );
};
