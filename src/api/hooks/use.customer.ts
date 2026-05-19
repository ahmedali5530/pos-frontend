import {Customer, CUSTOMER_FETCHES} from "../model/customer";
import {useFetch} from "./use.fetch";
import {safeNumber} from "../../lib/currency/currency";

export const useCustomer = () => {
  const fetch = useFetch();

  const fetchCustomer = async (customerId: string) => {
    return await fetch.fetchById(customerId, CUSTOMER_FETCHES);
  }

  const calculateCustomerPayment = (customer: Customer) => {
    let paid = 0;
    customer?.payments?.forEach(payment => {
      paid += safeNumber(payment.amount);
    });

    return paid;
  }

  const calculateCustomerSale = (customer: Customer) => {
    let sale = 0;
    customer?.orders?.forEach(order => {
      order?.payments?.forEach(payment => {
        if (payment.type?.type === 'credit') {
          sale += safeNumber(payment.received);
        }
      })
    })

    return sale;
  }

  const calculateCustomerOutstanding = (customer: Customer) => {
    return calculateCustomerSale(customer) - calculateCustomerPayment(customer) + safeNumber(customer.opening_balance);
  }

  return {
    fetchCustomer, calculateCustomerOutstanding, calculateCustomerPayment, calculateCustomerSale
  }
}