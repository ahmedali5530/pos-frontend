import {useDB} from "../db/db";
import {StringRecordId} from "surrealdb";
import {Tables} from "../db/tables";
import {OrderItem} from "../model/order.item";
import {Order, ORDER_FETCHES} from "../model/order";
import {useFetch} from "./use.fetch";


export const useOrder = () => {
  const db = useDB();
  const fetch = useFetch();

  const fetchOrder = async (orderId: string) => {
    return await fetch.fetchById(orderId, ORDER_FETCHES);
  }

  const fetchOrders = async (orderIds: string[]) => {
    const [orders] = await db.query(`SELECT *
                                     FROM ${Tables.order}
                                     where id IN $ids fetch ${ORDER_FETCHES.join(', ')}`, {
      ids: orderIds
    });

    return orders;
  }

  const calculateOrderItemPrice = (item: OrderItem) => {
    return (Number(item.quantity) * Number(item.price)) + itemTaxes(item) - Number(item.discount)
  }

  const calculateOrderPrice = (order: Order) => {
    return order?.items?.reduce((prev, item) => calculateOrderItemPrice(item) + prev, 0) ?? 0;
  }

  const calculateOrderItemCost = (item: OrderItem) => {
    return (Number(item.quantity) * Number(item.cost ?? 0))
  }

  const calculateOrderCost = (order: Order) => {
    return order?.items?.reduce((prev, item) => calculateOrderItemCost(item) + prev, 0) ?? 0;
  }



  const itemTaxes = (item: OrderItem) => {
    return item.taxes.reduce((p, t) => p + t.rate * item.price / 100, 0)
  }

  return {
    fetchOrder, fetchOrders, itemTaxes,
    calculateOrderItemPrice, calculateOrderItemCost,
    calculateOrderPrice, calculateOrderCost
  }
}

