import React, {FC, useEffect, useMemo, useState} from "react";
import {Button} from "../button";
import {Modal} from "../modal";
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
  faSpinner,
  faTrash,
  faTrashRestoreAlt,
  faTruck
} from "@fortawesome/free-solid-svg-icons";
import {fetchJson} from "../../../api/request/request";
import {EXPENSE_LIST, ORDER_DISPATCH, ORDER_GET, ORDER_LIST, ORDER_REFUND, ORDER_RESTORE} from "../../../api/routing/routes/backend.app";
import {Order} from "../../../api/model/order";
import {DateTime} from "luxon";
import classNames from "classnames";
import {CartItem} from "../../../api/model/cart.item";
import {Discount} from "../../../api/model/discount";
import {Tax} from "../../../api/model/tax";
import {Customer} from "../../../api/model/customer";
import {Input} from "../input";
import {IconProp} from "@fortawesome/fontawesome-svg-core";
import {useForm} from "react-hook-form";
import {Expense} from "../../../api/model/expense";
import {ViewOrder} from "./view.order";
import {CustomerPayments} from "./customer.payments";
import {ResponsivePie as Pie} from "@nivo/pie";
import {ResponsiveBar as Bar} from "@nivo/bar";
import {Loader} from "../../../app-common/components/loader/loader";

interface Props {
  setAdded: (item: CartItem[]) => void;
  setDiscount: (discount?: Discount) => void;
  setTax: (tax?: Tax) => void;
  setDiscountAmount: (amount?: number) => void;
  setCustomer: (customer?: Customer) => void;
  customer?: Customer;
  setRefundingFrom?: (id?: number) => void;
}

export const SaleHistory: FC<Props> = ({
                                         setAdded, setDiscountAmount, setDiscount, setCustomer, setTax, customer, setRefundingFrom
                                       }) => {
  const [modal, setModal] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [list, setList] = useState<Order[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [q, setQ] = useState<string>();
  const [filters, setFilters] = useState<any>();
  const [payments, setPayments] = useState<{ [key: string]: number }>({});

  const loadSales = async (values?: any) => {
    // if (!values) {
      setLoading(true);
    // }

    loadExpenses(values);

    setFilters(values);

    try {
      const url = new URL(ORDER_LIST);
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
      setPayments(json.payments);
    } catch (e) {

      throw e;
    } finally {
      setLoading(false);
    }
  };

  const loadExpenses = async (values?: any) => {
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

      setExpenses(json.list);
    } catch (e) {

      throw e;
    } finally {
      // setLoading(false);
    }
  };

  useEffect(() => {
    if (modal) {
      loadSales();
    }
  }, [modal]);

  const orderStatus = (order: Order) => {
    return order.status;
  };

  const getOrderStatusClasses = (status: string) => {
    let classes = '';
    switch (status) {
      case('Deleted'):
        classes = 'border-red-500 text-red-500';
        break;

      case('Completed'):
        classes = 'border-green-500 text-green-500';
        break;

      case('Dispatched'):
        classes = 'border-green-500 text-green-500';
        break;

      case('Returned'):
        classes = 'border-red-500 text-red-500';
        break;

      case('On Hold'):
        classes = 'border-amber-500 text-amber-500';
        break;

      default:
        classes = 'border-purple-500 text-purple-500';
        break;
    }

    return classes;
  };

  const getOrderStatusIcon = (status: string): IconProp => {
    let icon: IconProp;
    switch (status) {
      case('Deleted'):
        icon = faTrash;
        break;

      case('Completed'):
        icon = faCheck;
        break;

      case('Dispatched'):
        icon = faTruck;
        break;

      case('Returned'):
        icon = faBackward;
        break;

      case('On Hold'):
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
    if (!window.confirm('Unsuspend order?')) return false;
    setUnsuspending(true);
    try {
      await fetchJson(ORDER_GET.replace(':id', order.id), {
        method: 'DELETE'
      });

      const items: CartItem[] = [];
      order.items.forEach((item) => {
        items.push({
          quantity: item.quantity,
          price: item.price,
          discount: 0,
          variant: item.variant,
          item: item.product
        });
      });

      setAdded(items);
      setDiscount(order.discount?.type);
      setTax(order.tax?.type);
      setDiscountAmount(order.discount?.amount);
      setCustomer(order?.customer);

      setModal(false);
    } catch (e) {
      throw e;
    } finally {
      setUnsuspending(false);
    }
  };

  const [refunding, setRefunding] = useState(false);
  const refundOrder = async (order: Order) => {
    if (!window.confirm('Refund order?')) return false;
    setRefunding(true);
    try {
      const response = await fetchJson(ORDER_REFUND.replace(':id', order.id), {
        method: 'POST'
      });

      const items: CartItem[] = [];
      order.items.forEach((item) => {
        items.push({
          quantity: -1 * item.quantity,
          price: item.price,
          discount: 0,
          variant: item.variant,
          item: item.product
        });
      });

      setAdded(items);
      setDiscount(order.discount?.type);
      setTax(order.tax?.type);
      setDiscountAmount(order.discount?.amount);
      setCustomer(order?.customer);
      setRefundingFrom!(Number(order.id));

      setModal(false);
    } catch (e) {
      throw e;
    } finally {
      setRefunding(false);
    }
  };

  const [dispatching, setDispatching] = useState(false);
  const dispatchOrder = async (order: Order) => {
    if (!window.confirm('Dispatch order?')) return false;
    setDispatching(true);
    try {
      const response = await fetchJson(ORDER_DISPATCH.replace(':id', order.id), {
        method: 'POST'
      });

      loadSales(filters);

    } catch (e) {
      throw e;
    } finally {
      setDispatching(false);
    }
  };

  const [deleting, setDeleting] = useState(false);
  const deleteOrder = async (order: Order) => {
    if (!window.confirm('Delete order?')) return false;
    setDeleting(true);
    try {
      await fetchJson(ORDER_GET.replace(':id', order.id), {
        method: 'DELETE'
      });

      loadSales(filters);
    } catch (e) {
      throw e;
    } finally {
      setDeleting(false);
    }
  };

  const [restoring, setRestoring] = useState(false);
  const restoreOrder = async (order: Order) => {
    if (!window.confirm('Restore order?')) return false;
    setRestoring(true);
    try {
      await fetchJson(ORDER_RESTORE.replace(':id', order.id), {
        method: 'POST'
      });

      loadSales(filters);
    } catch (e) {
      throw e;
    } finally {
      setRestoring(false);
    }
  };

  const total = useMemo(() => {
    return list.reduce((prev, order) =>
      prev + order.payments.reduce((paymentPrev, payment) =>
      paymentPrev + payment.total,
      0), 0);
  }, [list]);

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
      if (order.status !== 'Deleted') {
        return prev + order.payments.reduce((p, payment) => p + payment.total, 0)
      }

      return prev;
    }, 0);
  }, [list]);

  const totalCost = useMemo(() => {
    return list.reduce((prev, order) => {
      if (order.status !== 'Deleted') {
        return prev + order.items.reduce((p, item) => {
          if (item.product.cost) {
            return p + item.product.cost;
          }

          return p;
        }, 0)
      }
      return prev;
    }, 0);
  }, [list]);

  const totalRate = useMemo(() => {
    return list.reduce((prev, order) => {
      return prev + order.items.reduce((p, item) => p + (item.price * item.quantity), 0)
    }, 0);
  }, [list]);

  const totalExpenses = useMemo(() => {
    return expenses.reduce((prev, item) => prev + item.amount, 0);
  }, [expenses]);

  const customerChartData = useMemo(() => {
    const customers: {[name: string]: number} = {};
    list.forEach(order => {
      if(order?.customer) {
        if(!customers[order?.customer?.name]){
          customers[order?.customer?.name] = 0;
        }

        customers[order?.customer?.name] += order.payments.reduce((p, payment) => p + payment.total, 0);
      }else{
        const cash = 'Cash';
        if(!customers[cash]){
          customers[cash] = 0;
        }

        customers[cash] += order.payments.reduce((p, payment) => p + payment.total, 0);
      }
    });

    const data: {id: string, value: number}[] = [];
    Object.keys(customers).forEach(c => {
      data.push({
        id: c,
        value: customers[c]
      });
    });

    return data;
  }, [list]);

  const {register, handleSubmit} = useForm();

  const [areChartsOpen, setChartsOpen] = useState(false);


  return (
    <>
      <Button variant="primary" className="w-24" size="lg" onClick={() => {
        setModal(true);
      }} title="Sale history"><FontAwesomeIcon icon={faClockRotateLeft}/></Button>

      <Modal open={modal} onClose={() => {
        setModal(false);
      }} title="Sale history">
        <form onSubmit={handleSubmit(loadSales)}>
          <div className="grid grid-cols-6 gap-4 mb-5">
            <div className="col-span-3">
              <Input type="search"
                     placeholder="Search in Order#, Status, Customer"
                     className="search-field w-full"
                     {...register('q')}
                     onChange={(e) => {
                       setQ(e.target.value);
                     }}
              />
            </div>
            <div>
              <Input {...register('dateTimeFrom')}
                     type="datetime-local"
                     placeholder="Start time"
                     defaultValue={DateTime.now().startOf('day').toISO()}
                     className=" w-full"
              />
            </div>
            <div>
              <Input {...register('dateTimeTo')}
                     type="datetime-local"
                     placeholder="End time"
                     defaultValue={DateTime.now().endOf('day').toISO()}
                     className=" w-full"
              />
            </div>
            <div>
              <Button variant="primary" className="w-full" type="submit" disabled={isLoading}>
                {isLoading ? 'Loading...' : (
                  <>
                    <FontAwesomeIcon icon={faSearch} className="mr-2"/> Search sale
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>

        {isLoading && (
          <div className="flex justify-center items-center">
            <Loader lines={15} lineItems={9}/>
          </div>
        )}

        {!isLoading && (
          <>
            <h3 className="mb-3 text-lg cursor-pointer" onClick={() => setChartsOpen(!areChartsOpen)}>
              Charts {areChartsOpen ? <FontAwesomeIcon icon={faChevronDown}/> :
              <FontAwesomeIcon icon={faChevronRight}/>}
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
                        arcLinkLabel={d => `${d.id}: ${d.value}`}
                        enableArcLabels={false}
                        enableArcLinkLabels={false}
                        colors={{scheme: 'purpleRed_green'}}
                        margin={{
                          top: 20,
                          bottom: 20
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
                        {id: 'Sale', value: totalAmount.toFixed(2)},
                        {id: 'Cost', value: totalCost.toFixed(2)},
                        {id: 'Discount', value: discountTotal.toFixed(2)},
                        {id: 'Tax', value: taxTotal.toFixed(2)},
                        {id: 'Expense', value: totalExpenses.toFixed(2)}
                      ]}
                      // keys={['value']}
                      margin={{
                        bottom: 50,
                        left: 50,
                        top: 20
                      }}
                      valueScale={{type: 'linear'}}
                      tooltip={({indexValue, value}) => {
                        return (
                          <span className="bg-white rounded p-1 text-sm shadow">
                            {indexValue}: {value}
                          </span>
                        )
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
                        top: 20
                      }}
                      valueScale={{type: 'linear'}}
                      tooltip={({indexValue, value}) => {
                        return (
                          <span className="bg-white rounded p-1 text-sm shadow">
                            {indexValue}: {value}
                          </span>
                        )
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
            <div className="grid grid-cols-5 gap-4 mb-5">
              <div className="border border-purple-500 p-5 font-bold text-purple-500 rounded">
                Total Bills
                <span className="float-right">{list.length}</span>
              </div>
              <div className="border border-cyan-500 p-5 font-bold text-cyan-500 rounded">
                Total Amount
                <span className="float-right">{totalAmount.toFixed(2)}</span>
              </div>
              <div className="border border-amber-500 p-5 font-bold text-amber-500 rounded">
                Total Cost
                <span className="float-right">{totalCost.toFixed(2)}</span>
              </div>
              <div className="border border-red-500 p-5 font-bold text-red-500 rounded">
                Expenses
                <span className="float-right">{totalExpenses}</span>
              </div>
              <div className={
                classNames(
                  'border',
                  'p-5 font-bold rounded',
                  totalAmount - totalCost - totalExpenses <= 0 ? 'text-red-500 border-red-500' : 'text-green-500 border-green-500'
                )
              }>
                {totalAmount - totalCost - totalExpenses <= 0 ? 'Loss' : 'Profit'}
                <span className="float-right">{(totalAmount - totalCost - totalExpenses).toFixed(2)}</span>
              </div>
            </div>

            <table className="table border border-collapse">
              <thead>
              <tr>
                <th>Order#</th>
                <th>Time</th>
                <th>Status</th>
                <th>Customer</th>
                <th>Tax</th>
                <th>Discount</th>
                <th>Rate</th>
                <th>Cost</th>
                <th>Total</th>
              </tr>
              </thead>
              <tbody>
              {list.map((order, index) => (
                <tr key={index} className="hover:bg-gray-100">
                  <td>
                    <ViewOrder order={order}>
                      <FontAwesomeIcon icon={faEye} className="mr-2"/> {order.orderId}
                    </ViewOrder>
                  </td>
                  <td
                    title={order.createdAt}>{DateTime.fromISO(order.createdAt).toRelative({base: DateTime.now()})}</td>
                  <td>
                    <span className={
                      classNames(
                        getOrderStatusClasses(order.status),
                        'rounded-2xl p-1 px-2 border font-bold text-sm'
                      )
                    }>
                      <FontAwesomeIcon icon={getOrderStatusIcon(order.status)} className="mr-1"/> {orderStatus(order)}
                    </span>
                    {orderStatus(order) === 'Dispatched' && (
                      <Button variant="danger" className="ml-3 w-[40px]" onClick={() => deleteOrder(order)}
                              disabled={deleting} title="Delete">
                        <FontAwesomeIcon icon={faTrash}/>
                      </Button>
                    )}
                    {orderStatus(order) === 'Completed' && (
                      <>
                        {!order.returnedFrom && (
                          <>
                            <Button variant="danger" className="ml-3 w-[40px]" onClick={() => refundOrder(order)}
                                    disabled={refunding} title="Refund">
                              <FontAwesomeIcon icon={faBackward}/>
                            </Button>
                            <Button variant="success" className="ml-3 w-[40px]" onClick={() => dispatchOrder(order)}
                                    disabled={dispatching} title="Dispatch">
                              <FontAwesomeIcon icon={faTruck}/>
                            </Button>
                          </>
                        )}
                        <Button variant="danger" className="ml-3 w-[40px]" onClick={() => deleteOrder(order)}
                                disabled={deleting} title="Delete">
                          <FontAwesomeIcon icon={faTrash}/>
                        </Button>
                      </>
                    )}
                    {orderStatus(order) === 'On Hold' && (
                      <>
                        <Button variant="success" className="ml-3 w-[40px]" onClick={() => unsuspendOrder(order)}
                                disabled={unsuspending} title="Unsuspend">
                          <FontAwesomeIcon icon={faPlay}/>
                        </Button>
                        <Button variant="danger" className="ml-3 w-[40px]" onClick={() => deleteOrder(order)}
                                disabled={deleting} title="Delete">
                          <FontAwesomeIcon icon={faTrash}/>
                        </Button>
                      </>
                    )}
                    {orderStatus(order) === 'Deleted' && (
                      <>
                        <Button variant="success" className="ml-3 w-[40px]" onClick={() => restoreOrder(order)}
                                disabled={restoring} title="Restore">
                          <FontAwesomeIcon icon={faTrashRestoreAlt}/>
                        </Button>
                      </>
                    )}
                  </td>
                  <td>
                    {order.customer ? (
                      <span
                        className="text-purple-500 cursor-pointer"
                        title="View this customer"
                      >
                        <CustomerPayments customer={order.customer}>
                          <FontAwesomeIcon icon={faEye} className="mr-2"/>
                          {order.customer.name}
                        </CustomerPayments>
                        {customer?.id === order.customer.id && (
                          <span className="ml-3">
                            <FontAwesomeIcon icon={faCheck}/>
                          </span>
                        )}
                      </span>
                    ) : 'Cash Sale'}
                  </td>
                  <td>+{order.tax ? order.tax.amount : '0'}</td>
                  <td>-{order.discount ? order.discount.amount : '0'}</td>
                  <td>
                    +{order.items.reduce((prev, item) => {
                    return (item.price * item.quantity) + prev
                  }, 0)}
                  </td>
                  <td>
                    {order.items.reduce((prev, item) => {
                      if (item.product.cost) {
                        return (item?.product?.cost * item.quantity) + prev
                      }
                      return prev;
                    }, 0)}
                  </td>
                  <td>
                    ={order.payments.reduce((prev, payment) => {
                    return payment.total + prev
                  }, 0)}
                  </td>
                </tr>
              ))}
              </tbody>
              <tfoot>
              <tr className="border border-t-4">
                <th></th>
                <th></th>
                <th></th>
                <th></th>
                <th>+{taxTotal.toFixed(2)}</th>
                <th>-{discountTotal.toFixed(2)}</th>
                <th>+{totalRate.toFixed(2)}</th>
                <th>{totalCost.toFixed(2)}</th>
                <th>={total.toFixed(2)}</th>
              </tr>
              </tfoot>
            </table>
          </>
        )}
      </Modal>
    </>
  );
};
