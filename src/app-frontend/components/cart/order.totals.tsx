import React, { FC, PropsWithChildren, useMemo } from "react";
import { Customers } from "../customers/customers";
import { ApplyDiscount } from "../sale/apply.discount";
import { ApplyTax } from "../sale/apply.tax";
import { discountTotal, finalTotal, getExclusiveRowTotal, subTotal, taxTotal } from "../../containers/dashboard/pos";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil, faTrash } from "@fortawesome/free-solid-svg-icons";
import classNames from "classnames";
import { withCurrency } from "../../../lib/currency/currency";
import { ConfirmAlert } from "../../../app-common/components/confirm/confirm.alert";
import { useAtom } from "jotai";
import { defaultState } from "../../../store/jotai";

interface OrderTotalsProps extends PropsWithChildren {
  inSale?: boolean;
}

export const OrderTotals: FC<OrderTotalsProps> = ({
  children,
}) => {
  const [appState, setAppState] = useAtom(defaultState);
  const { added, tax, discount, customer, discountAmount, discountRateType } = appState;

  const exclusiveSubTotal = useMemo(() => {
    return added.reduce((prev, item) => prev + getExclusiveRowTotal(item), 0);
  }, [added]);

  return (
    <table className="border border-collapse w-full">
      <tbody>
        <tr className="hover:bg-gray-100">
          <th
            className="border border-gray-300 p-2 text-left"
            style={{ width: "50%" }}>
            Sub total
          </th>
          <td className="border border-gray-300 p-2 text-right">
            {withCurrency(subTotal(added))}
          </td>
        </tr>
        <tr className="hover:bg-gray-100">
          <th className="border border-gray-300 p-2 text-left">
            Taxable amount
          </th>
          <td className="border border-gray-300 p-2 text-right">
            {withCurrency(exclusiveSubTotal)}
          </td>
        </tr>
        <tr className="hover:bg-gray-100">
          <th className="border border-gray-300 p-2 text-left">
            <ApplyTax>
              Taxes <FontAwesomeIcon icon={faPencil} className="ml-2" />
              {tax && (
                <span className="float-right bg-danger-500 text-white py-1 px-2 rounded-lg text-sm">
                  {tax.rate}%
                </span>
              )}
            </ApplyTax>
          </th>
          <td className="border border-gray-300 p-2 text-right">
            {withCurrency(taxTotal(added, tax))}
          </td>
        </tr>
        <tr className="hover:bg-gray-100">
          <th className="border border-gray-300 p-2 text-left">
            <ApplyDiscount>
              Discount <FontAwesomeIcon icon={faPencil} className="ml-2" />
              {discount && (
                <span className="float-right bg-danger-500 text-white py-1 px-2 rounded-lg text-sm">
                  {discountTotal(added, tax, discountAmount, discountRateType, discount)}
                </span>
              )}
            </ApplyDiscount>
          </th>
          <td className="border border-gray-300 p-2 text-right">
            {withCurrency(discountTotal(added, tax, discountAmount, discountRateType, discount))}
          </td>
        </tr>
        <tr className="hover:bg-gray-100">
          <th className="border border-gray-300 p-2 text-left">
            <Customers className={"block w-full text-left"}>
              Customer <FontAwesomeIcon icon={faPencil} className="ml-2" />
            </Customers>
          </th>
          <td className="border border-gray-300 p-2 text-right">
            {customer && (
              <div className="flex justify-between items-center">
                <ConfirmAlert
                  onConfirm={() => {
                    setAppState((prev) => ({
                      ...prev,
                      customer: undefined,
                    }));
                  }}
                  confirmText="Detach"
                  title="Detach customer?">
                  <button className="btn btn-danger sm flex-grow-0 w-[30px]">
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </ConfirmAlert>
                <span className="flex-grow">
                  {customer.name}
                  <div className="w-full"></div>
                  {customer && (
                    <span
                      className={classNames(
                        "float-right",
                        customer.outstanding <= 0
                          ? "text-success-700"
                          : "text-danger-500"
                      )}>
                      {withCurrency(
                        customer.outstanding < 0
                          ? customer.outstanding * -1
                          : customer.outstanding
                      )}
                    </span>
                  )}
                </span>
              </div>
            )}
          </td>
        </tr>
        <tr className="hover:bg-gray-100">
          <th className="border border-gray-300 p-2 text-left text-3xl font-bold text-success-500 digital bg-black">
            Total
          </th>
          <td className="border border-gray-300 p-2 text-right text-3xl font-bold text-success-500 digital bg-black">
            {withCurrency(finalTotal(added, tax, discountAmount, discountRateType, discount))}
          </td>
        </tr>
        {children}
      </tbody>
    </table>
  );
};
