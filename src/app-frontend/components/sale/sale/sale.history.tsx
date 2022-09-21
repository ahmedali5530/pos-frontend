import React, {FC, useEffect, useMemo, useState} from "react";
import {Button} from "../../button";
import {Modal} from "../../modal";
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
  faTruck
} from "@fortawesome/free-solid-svg-icons";
import {fetchJson} from "../../../../api/request/request";
import {
  EXPENSE_LIST,
  ORDER_GET,
  ORDER_LIST,
  ORDER_REFUND,
  ORDER_RESTORE
} from "../../../../api/routing/routes/backend.app";
import {Order, OrderStatus} from "../../../../api/model/order";
import {DateTime} from "luxon";
import classNames from "classnames";
import {CartItem} from "../../../../api/model/cart.item";
import {Discount} from "../../../../api/model/discount";
import {Tax} from "../../../../api/model/tax";
import {Customer} from "../../../../api/model/customer";
import {Input} from "../../input";
import {IconProp} from "@fortawesome/fontawesome-svg-core";
import {useForm, Controller} from "react-hook-form";
import {Expense} from "../../../../api/model/expense";
import {ViewOrder} from "./view.order";
import {CustomerPayments} from "../customer.payments";
import {ResponsivePie as Pie} from "@nivo/pie";
import {ResponsiveBar as Bar} from "@nivo/bar";
import {Loader} from "../../../../app-common/components/loader/loader";
import {useLoadList} from "../../../../api/hooks/use.load.list";
import {useTranslation} from "react-i18next";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  useReactTable
} from "@tanstack/react-table";
import _ from "lodash";
import Cookies from "js-cookie";
import {Shortcut} from "../../../../app-common/components/input/shortcut";

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
                                         setAdded,
                                         setDiscountAmount,
                                         setDiscount,
                                         setCustomer,
                                         setTax,
                                         customer,
                                         setRefundingFrom
                                       }) => {
  const [modal, setModal] = useState(false);
  const [list, setList] = useState<Order[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [payments, setPayments] = useState<{ [key: string]: number }>({});

  const useLoadHook = useLoadList<Order>(ORDER_LIST);
  const [state, action] = useLoadHook;

  const {t} = useTranslation();

  const columnHelper = createColumnHelper<Order>();

  const columns = [
    columnHelper.accessor('orderId', {
      header: () => t('Order#'),
      cell: info => (
        <ViewOrder order={info.row.original}>
          <FontAwesomeIcon icon={faEye} className="mr-2"/> {info.getValue()}
        </ViewOrder>
      )
    }),
    columnHelper.accessor('createdAt', {
      header: () => t('Time'),
      cell: info => DateTime.fromISO(info.getValue()).toRelative({base: DateTime.now()})
    }),
    columnHelper.accessor('customer', {
      header: () => t('Customer'),
      cell: info => (
        <>
          {!!info.getValue() ? (
            <span
              className="text-purple-500 cursor-pointer"
              title="View this customer"
            >
              <CustomerPayments customer={info.getValue()!}>
                <FontAwesomeIcon icon={faEye} className="mr-2"/>
                {info.getValue()?.name}
              </CustomerPayments>
              {customer?.id === info.getValue()?.id && (
                <span className="ml-3">
                  <FontAwesomeIcon icon={faCheck}/>
                </span>
              )}
            </span>
          ) : 'Cash Sale'}
        </>
      )
    }),
    columnHelper.accessor('tax', {
      header: () => t('Tax'),
      cell: info => '+' + (info.getValue()?.amount || '0')
    }),
    columnHelper.accessor('discount', {
      header: () => t('Discount'),
      cell: info => '-' + (info.getValue()?.amount || '0')
    }),
    columnHelper.accessor('items', {
      header: () => t('Rate'),
      cell: info => '+' + info.getValue().reduce((prev, item) => {
        return (item.price * item.quantity) + prev
      }, 0)
    }),
    columnHelper.accessor('items', {
      header: () => t('Cost'),
      cell: info => info.getValue().reduce((prev, item) => {
        return ((item.product?.cost || 0) * item.quantity) + prev
      }, 0)
    }),
    columnHelper.accessor('payments', {
      header: () => t('Total'),
      cell: info => '=' + info.getValue().reduce((prev, payment) => {
        return payment.received + prev
      }, 0)
    }),
    columnHelper.accessor('status', {
      header: () => t('Status'),
      cell: info => (
        <>
          <span className={
            classNames(
              getOrderStatusClasses(info.getValue()),
              'rounded-2xl p-1 px-2 border font-bold text-sm'
            )
          }>
            <FontAwesomeIcon icon={getOrderStatusIcon(info.getValue())}
                             className="mr-1"/> {orderStatus(info.row.original)}
          </span>
          {orderStatus(info.row.original) === OrderStatus.DISPATCHED && (
            <Button variant="danger" className="ml-3 w-[40px]" onClick={() => deleteOrder(info.row.original)}
                    disabled={deleting} title="Delete">
              <FontAwesomeIcon icon={faTrash}/>
            </Button>
          )}
          {orderStatus(info.row.original) === OrderStatus.COMPLETED && (
            <>
              {!info.row.original.returnedFrom && (
                <>
                  <Button variant="danger" className="ml-3 w-[40px]" onClick={() => refundOrder(info.row.original)}
                          disabled={refunding} title="Refund">
                    <FontAwesomeIcon icon={faBackward}/>
                  </Button>
                  {/*<Button variant="success" className="ml-3 w-[40px]" onClick={() => dispatchOrder(info.row.original)}
                          disabled={dispatching} title="Dispatch">
                    <FontAwesomeIcon icon={faTruck}/>
                  </Button>*/}
                </>
              )}
              <Button variant="danger" className="ml-3 w-[40px]" onClick={() => deleteOrder(info.row.original)}
                      disabled={deleting} title="Delete">
                <FontAwesomeIcon icon={faTrash}/>
              </Button>
            </>
          )}
          {orderStatus(info.row.original) === OrderStatus.ON_HOLD && (
            <>
              <Button variant="success" className="ml-3 w-[40px]" onClick={() => unsuspendOrder(info.row.original)}
                      disabled={unsuspending} title="Unsuspend">
                <FontAwesomeIcon icon={faPlay}/>
              </Button>
              <Button variant="danger" className="ml-3 w-[40px]" onClick={() => deleteOrder(info.row.original)}
                      disabled={deleting} title="Delete">
                <FontAwesomeIcon icon={faTrash}/>
              </Button>
            </>
          )}
          {orderStatus(info.row.original) === OrderStatus.DELETED && (
            <>
              <Button variant="success" className="ml-3 w-[40px]" onClick={() => restoreOrder(info.row.original)}
                      disabled={restoring} title="Restore">
                <FontAwesomeIcon icon={faTrashRestoreAlt}/>
              </Button>
            </>
          )}
        </>
      )
    }),
  ];

  const [params, setParams] = useState<{ [key: string]: any }>();

  useEffect(() => {
    setPayments(state.response?.payments);
    setList(state.list);
  }, [state]);

  const loadExpenses = async (values?: any) => {
    try {
      const url = new URL(EXPENSE_LIST);
      const params = new URLSearchParams({
        ...values,
        orderBy: 'id',
        orderMode: 'DESC',
        store: Cookies.get('store') ? JSON.parse(Cookies.get('store') as string).id : null
      });

      url.search = params.toString();
      const json = await fetchJson(url.toString());

      setExpenses(json.list);
    } catch (e) {

      throw e;
    }
  };

  useEffect(() => {
    loadExpenses(params);
  }, [params]);

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
        classes = 'border-emerald-500 text-emerald-500';
        break;

      case('Dispatched'):
        classes = 'border-emerald-500 text-emerald-500';
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
      await fetchJson(ORDER_REFUND.replace(':id', order.id), {
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
    if (!window.confirm('Delete order?')) return false;
    setDeleting(true);
    try {
      await fetchJson(ORDER_GET.replace(':id', order.id), {
        method: 'DELETE'
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
    if (!window.confirm('Restore order?')) return false;
    setRestoring(true);
    try {
      await fetchJson(ORDER_RESTORE.replace(':id', order.id), {
        method: 'POST'
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
      if (order.status !== 'Deleted') {
        return prev + order.payments.reduce((p, payment) => p + payment.received, 0)
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

  const totalExpenses = useMemo(() => {
    return expenses.reduce((prev, item) => prev + item.amount, 0);
  }, [expenses]);

  const customerChartData = useMemo(() => {
    const customers: { [name: string]: number } = {};
    list.forEach(order => {
      if (order?.customer) {
        if (!customers[order?.customer?.name]) {
          customers[order?.customer?.name] = 0;
        }

        customers[order?.customer?.name] += order.payments.reduce((p, payment) => p + payment.total, 0);
      } else {
        const cash = 'Cash';
        if (!customers[cash]) {
          customers[cash] = 0;
        }

        customers[cash] += order.payments.reduce((p, payment) => p + payment.total, 0);
      }
    });

    const data: { id: string, value: number }[] = [];
    Object.keys(customers).forEach(c => {
      data.push({
        id: c,
        value: customers[c]
      });
    });

    return data;
  }, [list]);

  const {register, handleSubmit, reset, control} = useForm();

  useEffect(() => {
    reset({
      dateTimeFrom: DateTime.now().startOf('day').toFormat("yyyy-MM-dd'T'HH:mm:ss"),
      dateTimeTo: DateTime.now().endOf('day').toFormat("yyyy-MM-dd'T'HH:mm:ss")
    });
  }, [modal, reset]);

  const [areChartsOpen, setChartsOpen] = useState(false);

  //FIXME: isolate table component and move in separate file

  const mergeFilters = (filters: any) => {
    setParams(prev => {
      return {...prev, ...filters};
    });
  };

  const [sorting, setSorting] = React.useState<SortingState>([{
    id: 'id',
    desc: true,
  }]);

  const [{pageIndex, pageSize}, setPagination] =
    React.useState<PaginationState>({
      pageIndex: 0,
      pageSize: 10,
    });
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState('');

  const loadList = async () => {
    const newParams: {
      limit?: number,
      offset?: number,
      orderBy?: string,
      orderMode?: string,
      [key: string]: any
    } = {
      ...params,
      limit: pageSize,
      offset: pageIndex * pageSize,
      store: Cookies.get('store') ? JSON.parse(Cookies.get('store') as string).id : null
    };

    if (sorting.length > 0) {
      newParams.orderBy = sorting[0].id;
      newParams.orderMode = sorting[0].desc ? 'desc' : 'asc';
    }

    if (globalFilter) {
      newParams.q = globalFilter;
    }

    await action.loadList(newParams);
  };

  useEffect(() => {
    loadList();
    loadExpenses();
  }, [pageSize, pageIndex, sorting, globalFilter, params, modal]);

  const pagination = React.useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  );

  const table = useReactTable({
    data: state.list,
    pageCount: Math.ceil(state.total / pageSize),
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: {
      sorting,
      pagination,
      rowSelection,
      globalFilter
    },
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true,
    enableMultiSort: false,
    manualSorting: true,
    manualFiltering: true
  });

  return (
    <>
      <Button variant="primary" className="w-24" size="lg" onClick={() => {
        setModal(true);
      }} title="Sale history">
        <FontAwesomeIcon icon={faClockRotateLeft}/>
        <Shortcut shortcut="ctrl+h" handler={() => setModal(true)} />
      </Button>

      <Modal open={modal} onClose={() => {
        setModal(false);
      }} title="Sale history" full>
        <form onSubmit={handleSubmit(mergeFilters)}>
          <div className="grid grid-cols-6 gap-4 mb-5">
            <div className="col-span-3">
              <Input type="search"
                     placeholder="Search in Order#, Status, Customer"
                     className="search-field w-full"
                     {...register('q')}
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
              <Button variant="primary" className="w-full" type="submit" disabled={state.isLoading}>
                {state.isLoading ? 'Searching...' : (
                  <>
                    <FontAwesomeIcon icon={faSearch} className="mr-2"/> Search sale
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>

        {!state.isLoading && (
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
                  totalAmount - totalCost - totalExpenses <= 0 ? 'text-red-500 border-red-500' : 'text-emerald-500 border-emerald-500'
                )
              }>
                {totalAmount - totalCost - totalExpenses <= 0 ? 'Loss' : 'Profit'}
                <span className="float-right">{(totalAmount - totalCost - totalExpenses).toFixed(2)}</span>
              </div>
            </div>
          </>
        )}
        <>
          <div className="table-responsive">
            {(state.isLoading) ? (
              <div className="flex justify-center items-center">
                <Loader lines={pageSize} lineItems={8 || 5}/>
              </div>
            ) : (
              <>
                <table className="table table-hover">
                  <thead>
                  {table.getHeaderGroups().map(headerGroup => (
                    <tr key={Math.random() + headerGroup.id} id={Math.random() + headerGroup.id}>
                      {headerGroup.headers.map(header => (
                        <th key={header.id}>
                          <div
                            {...{
                              className: header.column.getCanSort()
                                ? 'cursor-pointer select-none'
                                : '',
                              onClick: header.column.getToggleSortingHandler(),
                            }}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {{
                              asc: ' ▲',
                              desc: ' ▼',
                            }[header.column.getIsSorted() as string] ?? null}
                          </div>
                        </th>
                      ))}
                    </tr>
                  ))}
                  </thead>
                  <tbody>
                  {table.getRowModel().rows.map(row => (
                    <tr key={row.id}>
                      {row.getVisibleCells().map(cell => (
                        <td key={Math.random() + cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
                  </tbody>
                </table>
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <nav className="input-group">
                    <button
                      className="btn btn-primary"
                      onClick={() => table.setPageIndex(0)}
                      disabled={!table.getCanPreviousPage()}
                    >
                      {'<<'}
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={() => table.previousPage()}
                      disabled={!table.getCanPreviousPage()}
                    >
                      {'<'}
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={() => table.nextPage()}
                      disabled={!table.getCanNextPage()}
                    >
                      {'>'}
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                      disabled={!table.getCanNextPage()}
                    >
                      {'>>'}
                    </button>
                  </nav>
                  &bull;
                  <span className="flex items-center gap-1">
              <div>{t('Page')}</div>
              <strong>
                {table.getState().pagination.pageIndex + 1} {t('of')}{' '}{table.getPageCount()}
              </strong>
            </span>
                  &bull;{' '}
                  {t('Go to page')}
                  <span className="flex items-center gap-2">
              <select
                value={table.getState().pagination.pageIndex + 1}
                onChange={e => {
                  table.setPageIndex(Number(e.target.value) - 1)
                }}
                className="w-auto form-control"
              >
              {_.range(0, table.getPageCount()).map(pageSize => (
                <option key={pageSize} value={pageSize + 1}>
                  {pageSize + 1}
                </option>
              ))}
              </select>
            </span>
                  &bull;
                  <span className="flex items-center gap-2">
              <select
                value={table.getState().pagination.pageSize}
                onChange={e => {
                  table.setPageSize(Number(e.target.value))
                }}
                className="w-auto form-control"
              >
              {[10, 20, 25, 50, 100, 500].map(pageSize => (
                <option key={pageSize} value={pageSize}>
                  {t('Show')} {pageSize}
                </option>
              ))}
              </select> &bull; {t('Total records')} <strong>{state.total}</strong>
            </span>
                </div>
              </>
            )}
          </div>
        </>
      </Modal>
    </>
  );
};
