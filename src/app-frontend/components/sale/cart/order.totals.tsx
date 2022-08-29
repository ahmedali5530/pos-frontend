import React, {FC, PropsWithChildren} from "react";
import {Tax} from "../../../../api/model/tax";
import {Discount} from "../../../../api/model/discount";
import {Customers} from "../customers";
import {Customer} from "../../../../api/model/customer";
import {ApplyDiscount} from "../apply.discount";
import {CartItem} from "../../../../api/model/cart.item";
import {ApplyTax} from "../apply.tax";

interface OrderTotalsProps extends PropsWithChildren{
  subTotal: number;
  tax?: Tax;
  setTax: (tax?: Tax) => void;
  taxTotal: number;
  discount?: Discount;
  setDiscount: (discount?: Discount) => void;
  setDiscountAmount: (discount?: number) => void;
  discountTotal: number;
  couponTotal: number;
  finalTotal: number;
  inSale?: boolean;
  setCustomer?: (value?: Customer) => void;
  customer?: Customer;
  added: CartItem[];
  discountAmount: number|undefined;
  setDiscountRateType: (string?: string) => void;
  discountRateType: string|undefined;
}

export const OrderTotals :FC<OrderTotalsProps> = ({
  subTotal,
  tax, setTax, taxTotal,
  discount, setDiscount, setDiscountAmount, discountTotal,
  couponTotal, finalTotal, children, inSale,
  setCustomer, customer, added, discountAmount,
  discountRateType, setDiscountRateType
}) => {
  return (
    <table className="border border-collapse w-full">
      <tbody>
      {inSale && setCustomer && (
        <tr className="hover:bg-gray-100">
          <th className="border border-gray-300 p-2 text-left">
            <span className="float-right">
              <Customers setCustomer={setCustomer} customer={customer} />
            </span>
            Customer
          </th>
          <td className="border border-gray-300 p-2 text-right">{customer?.name}</td>
        </tr>
      )}
      <tr className="hover:bg-gray-100">
        <th className="border border-gray-300 p-2 text-left">Sub total</th>
        <td className="border border-gray-300 p-2 text-right" style={{width: '35%'}}>{subTotal}</td>
      </tr>
      <tr className="hover:bg-gray-100">
        <th className="border border-gray-300 p-2 text-left">
          Taxes
          {inSale && (
            <span className="float-right">
              <ApplyTax
                setTax={setTax}
                tax={tax}
              />
            </span>
          )}
        </th>
        <td className="border border-gray-300 p-2 text-right">{taxTotal}</td>
      </tr>
      <tr className="hover:bg-gray-100">
        <th className="border border-gray-300 p-2 text-left">
          Discounts
          {inSale && (
            <span className="float-right">
              <ApplyDiscount
                added={added}
                setDiscount={setDiscount}
                setDiscountAmount={setDiscountAmount}
                discount={discount}
                discountAmount={discountAmount}
                setDiscountRateType={setDiscountRateType}
                discountRateType={discountRateType}
              />
            </span>
          )}
        </th>
        <td className="border border-gray-300 p-2 text-right">{discountTotal}</td>
      </tr>
      {/*<tr className="hover:bg-gray-100">
        <th className="border border-gray-300 p-2 text-left">Coupons</th>
        <td className="border border-gray-300 p-2 text-right">{couponTotal}</td>
      </tr>*/}
      <tr className="hover:bg-gray-100">
        <th className="border border-gray-300 p-2 text-left text-4xl font-bold text-emerald-500">Total</th>
        <td
          className="border border-gray-300 p-2 text-right text-4xl font-bold text-emerald-500">{finalTotal}</td>
      </tr>
      {children}
      </tbody>
    </table>
  );
};
