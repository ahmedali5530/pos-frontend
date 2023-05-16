import React, {FC, PropsWithChildren, useMemo} from "react";
import {Tax} from "../../../api/model/tax";
import {Discount, DiscountRate} from "../../../api/model/discount";
import {Customers} from "../sale/customers";
import {Customer} from "../../../api/model/customer";
import {ApplyDiscount} from "../sale/apply.discount";
import {CartItem} from "../../../api/model/cart.item";
import {ApplyTax} from "../sale/apply.tax";
import {getExclusiveRowTotal} from "../../containers/dashboard/pos";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPencil} from "@fortawesome/free-solid-svg-icons";

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
  const exclusiveSubTotal = useMemo(() => {
    return added.reduce((prev, item) => prev + getExclusiveRowTotal(item), 0);
  }, [added])

  return (
    <table className="border border-collapse w-full">
      <tbody>
      <tr className="hover:bg-gray-100">
        <th className="border border-gray-300 p-2 text-left">Sub total</th>
        <td className="border border-gray-300 p-2 text-right" style={{width: '35%'}}>{subTotal.toFixed(2)}</td>
      </tr>
      <tr className="hover:bg-gray-100">
        <th className="border border-gray-300 p-2 text-left">Taxable amount</th>
        <td className="border border-gray-300 p-2 text-right" style={{width: '35%'}}>{exclusiveSubTotal.toFixed(2)}</td>
      </tr>
      <tr className="hover:bg-gray-100">
        <th className="border border-gray-300 p-2 text-left">
          <ApplyTax
            setTax={setTax}
            tax={tax}
            added={added}
          >
            Taxes <FontAwesomeIcon icon={faPencil} className="ml-3" />
            {tax && (
              <span className="float-right bg-danger-500 text-white py-1 px-2 rounded-lg text-sm">
                {tax.rate}%
              </span>
            )}
          </ApplyTax>
        </th>
        <td className="border border-gray-300 p-2 text-right">{taxTotal.toFixed(2)}</td>
      </tr>
      <tr className="hover:bg-gray-100">
        <th className="border border-gray-300 p-2 text-left">
          <ApplyDiscount
            added={added}
            setDiscount={setDiscount}
            setDiscountAmount={setDiscountAmount}
            discount={discount}
            discountAmount={discountAmount}
            setDiscountRateType={setDiscountRateType}
            discountRateType={discountRateType}
          >
            Discount <FontAwesomeIcon icon={faPencil} className="ml-3" />
            {discount && (
              <span className="float-right bg-danger-500 text-white py-1 px-2 rounded-lg text-sm">
                {discount.rate}{discount.rateType === DiscountRate.RATE_PERCENT && '%'}
              </span>
            )}
          </ApplyDiscount>
        </th>
        <td className="border border-gray-300 p-2 text-right">{discountTotal.toFixed(2)}</td>
      </tr>
      <tr className="hover:bg-gray-100">
        <th className="border border-gray-300 p-2 text-left text-4xl font-bold text-success-500">Total</th>
        <td
          className="border border-gray-300 p-2 text-right text-4xl font-bold text-success-500">{finalTotal.toFixed(2)}</td>
      </tr>
      {children}
      </tbody>
    </table>
  );
};
