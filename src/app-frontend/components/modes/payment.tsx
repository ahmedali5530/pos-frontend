import { Input } from "../../../app-common/components/input/input";
import { TopbarRight } from "./topbar.right";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Order, OrderStatus } from "../../../api/model/order";
import { fetchJson } from "../../../api/request/request";
import { ORDERS_LIST, TERMINAL_LIST } from "../../../api/routing/routes/backend.app";
import { QueryString } from "../../../lib/location/query.string";
import { DateTime } from "luxon";
import { withCurrency } from "../../../lib/currency/currency";
import { useAtom } from "jotai";
import { defaultState } from "../../../store/jotai";
import { CartItem } from "../../../api/model/cart.item";
import { CartContainer } from "../cart/cart.container";
import { CloseSaleInline } from "../sale/sale.inline";
import { HomeProps, initialData, useLoadData, } from "../../../api/hooks/use.load.data";
import { Footer } from "./footer";
import { OrderPayment } from "../../../api/model/order.payment";
import Mousetrap from "mousetrap";
import { TrapFocus } from "../../../app-common/components/container/trap.focus";
import { KeyboardTable } from "../../../app-common/components/table/keyboard.table";
import classNames from "classnames";
import { Row } from "react-table";
import { useSelector } from "react-redux";
import { getStore } from "../../../duck/store/store.selector";
import { ReactSelect } from "../../../app-common/components/input/custom.react.select";
import useApi from "../../../api/hooks/use.api";
import { HydraCollection } from "../../../api/model/hydra";
import { Terminal } from "../../../api/model/terminal";

export const PaymentMode = () => {
  const [appState, setAppState] = useAtom(defaultState);

  const [paymentTypesList, setPaymentTypesList] = useState<HomeProps["paymentTypesList"]>(initialData);
  const store = useSelector(getStore);

  const [state] = useLoadData();

  useEffect(() => {
    setPaymentTypesList(state.paymentTypesList);
  }, [state.paymentTypesList]);

  const [q, setQ] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [order, setOrder] = useState<Order>();

  const [filters, setFilters] = useState({
    status: OrderStatus.PENDING,
    "store.id": store?.id
  });
  const [isLoading, setLoading] = useState(false);
  const {
    data: terminals
  } = useApi<HydraCollection<Terminal>>('terminals', `${TERMINAL_LIST}?store.id=${store?.id}`);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const query = QueryString.stringify({
        ...filters,
        itemsPerPage: 100,
      });

      const response = await fetchJson(`${ORDERS_LIST}?${query}`);

      const prevIds = orders.map(item => item.id);
      const newIds = response['hydra:member'].map((item: Order) => item.id);

      if( prevIds.toString() !== newIds.toString()) {
        setOrders(response["hydra:member"]);
      }
    } catch ( e ) {
      throw e;
    } finally {
      setLoading(false);
    }
  }, [orders, filters]);

  useEffect(() => {
    loadOrders();

    const timer = setInterval(() => {
      loadOrders();
    }, 5000);

    return () => clearInterval(timer);
  }, [filters]);

  useEffect(() => {
    if( order ) {
      const items: CartItem[] = [];
      order.items.forEach((item) => {
        items.push({
          quantity: item.quantity,
          price: item.price,
          discount: item.discount,
          variant: item.variant,
          item: item.product,
          taxes: item.taxes,
          taxIncluded: true,
        });
      });

      setAppState((prev) => ({
        ...prev,
        added: items,
        discount: order.discount?.type,
        tax: order.tax?.type,
        discountAmount: order.discount?.amount,
        customer: order?.customer,
        orderId: order?.id,
      }));
    }
  }, [order]);

  const orderTotal = (payments: OrderPayment[]) => {
    return payments.reduce((prev, payment) => {
      return payment.total + prev;
    }, 0);
  };

  const ordersList = useMemo(() => {
    let list = orders;
    if( q.trim().length > 0 ) {
      list = list.filter((item) => {
        return (
          item?.orderId?.toString().includes(q) ||
          item?.store?.name.toLowerCase().includes(q.toLowerCase()) ||
          item?.terminal?.code?.toLowerCase()?.includes(q.toLowerCase()) ||
          orderTotal(item.payments).toString().includes(q)
        );
      });
    }

    return list;
  }, [q, filters, orders]);

  useEffect(() => {
    if(
      (!order && ordersList.length > 0) ||
      (order && ordersList.find((item) => item.id === order.id) === null)
    ) {
      setOrder(ordersList[0]);
    }
  }, [order, ordersList]);

  const searchField = useRef<HTMLInputElement>(null);

  Mousetrap.bind(["/"], function (e: any) {
    e.preventDefault();
    if( searchField.current !== null ) {
      searchField.current.focus();
    }
  });

  const [windowHeight, setWindowHeight] = useState(0);
  useEffect(() => {
    if( typeof window !== "undefined" ) {
      setWindowHeight(window.innerHeight - 150);
    }
  }, []);

  const columns = React.useMemo(
    () => [
      {
        Header: "Order#",
        style: {
          width: '70px',
          flexBasis: '70px',
          flexGrow: 0
        },
      },
      {
        Header: "Terminal",
        style: {
          width: '75px',
          flexBasis: '75px',
          flexGrow: 0
        },
      },
      {
        Header: "Customer",
        style: {
          width: '190px',
          flexBasis: '190px',
          flexGrow: 0,
          textOverflow: 'ellipsis'
        }
      },
      {
        Header: "Amount",
        style: {
          flexGrow: 1,
          width: '100%',
          textAlign: "right",
        },
      },
    ],
    []
  );

  const renderRow = (index: number, selected: number, style: object, row: Row, onClick?: Function) => {
    const item = row.original as Order;

    return (
      <div
        {...row.getRowProps({
          style,
        })}
        className={classNames(
          "hover:bg-gray-200 cursor-pointer",
          selected === index ? "bg-gray-300" : ""
        )}
        tabIndex={selected === index ? 0 : -1}
        role="option"
        onClick={() => {
          setOrder(item);
          onClick && onClick();
        }}
      >
        <div className="basis-auto p-2 w-[70px]">{item.orderId}</div>
        <div className="basis-auto p-2 w-[75px]">{item.terminal.code}</div>
        <div className="basis-auto p-2 w-[190px] max-w-[190px] whitespace-nowrap overflow-hidden overflow-ellipsis" title={item?.customer?.name}>{item?.customer?.name}</div>
        <div className="basis-auto p-2 flex-1 text-right">{withCurrency(orderTotal(item.payments))}</div>
      </div>
    );
  }

  return (
    <TrapFocus inputRef={searchField.current}>
      <div className="flex flex-col">
        <div className="flex flex-row gap-5 p-2 bg-white">
          <div className="w-[calc(100vw_-_75%_-_2rem)]">
            <Input
              placeholder="Search running orders"
              autoFocus
              type="search"
              className="search-field mousetrap lg w-full"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              ref={searchField}
            />
          </div>
          <div>
            <ReactSelect
              onChange={(value) => {
                console.log(value)
                if(value !== null) {
                  setFilters(prev => ({
                    ...prev,
                    'terminal.id': value.value
                  }))
                }else{
                  setFilters(prev => ({
                    ...prev,
                    'terminal.id': undefined
                  }))
                }
              }}
              options={terminals?.['hydra:member']?.map(terminal => ({
                label: terminal.code,
                value: terminal.id
              }))}
              placeholder="Terminal"
              className="w-[200px]"
              classNames={{
                control: (state) => 'min-h-[48px]'
              }}
              isClearable
              isSearchable={false}
              size="lg"
            />
          </div>
          <div className="ml-auto">
            <TopbarRight/>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-3">
          <div className="grid grid-cols-3 gap-3 col-span-3">
            <div className="col-span-1 bg-white overflow-auto h-[calc(100vh-80px)] overflow-x-hidden">
              <KeyboardTable
                data={ordersList}
                columns={columns}
                containerHeight={windowHeight}
                renderRow={renderRow}
                itemHeight={40}
                onSelectionChange={(index, item: Order) => {
                  setOrder(item);
                }}
              />
            </div>
            <div className="col-span-2 bg-white p-3 overflow-auto h-[calc(100vh-80px)]">
              {order && (
                <>
                  <h4 className="text-3xl">Order# {order.orderId}</h4>
                  <table className="table table-fixed table-bordered">
                    <tbody>
                    <tr>
                      <th className="text-left text-xl">
                        {DateTime.fromISO(order.createdAt).toFormat(
                          import.meta.env.VITE_DATE_TIME_FORMAT
                        )}
                      </th>
                      <th className="text-right text-xl">
                        {order.store?.name}
                      </th>
                      <th className="text-right text-xl">
                        {order.terminal?.code}
                      </th>
                      <th className="text-right text-xl">
                        {order.user?.displayName}
                      </th>
                    </tr>
                    </tbody>
                  </table>
                  <CartContainer/>
                </>
              )}
            </div>
            {/*<div className="flex gap-3 p-3 items-center h-[80px] col-span-2">*/}
            {/*  <Footer/>*/}
            {/*</div>*/}
          </div>

          <div className="col-span-1 bg-white p-3 overflow-auto">
            <CloseSaleInline
              paymentTypesList={paymentTypesList.list}
              isInline={true}
              onSale={() => {
                loadOrders();
              }}
            />
          </div>
        </div>
      </div>
    </TrapFocus>
  );
};
