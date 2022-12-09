import React, {FunctionComponent, PropsWithChildren, useMemo, useState} from "react";
import {Order} from "../../../../api/model/order";
import {Button} from "../../button";
import {Modal} from "../../modal";
import {OrderItem} from "../../../../api/model/order.item";

interface ViewOrderProps extends PropsWithChildren{
  order: Order;
}

export const ViewOrder: FunctionComponent<ViewOrderProps> = ({
  order, children
}) => {
  const [modal, setModal] = useState(false);

  const itemTax = (item: OrderItem) => {
    return item.taxes.reduce((prev, tax) => prev + (tax.rate * (item.price * item.quantity) / 100), 0);
  };

  const itemsTotal = useMemo(() => {
    return order.items.reduce((prev, item) => (
      (prev + (item.quantity * item.price)) + item.taxesTotal
    ), 0);
  }, [order]);

  const orderTotal = useMemo(() => {
    return itemsTotal + order.items.reduce((prev, item) => (
      prev + itemTax(item)
    ), 0) + (order?.adjustment || 0);
  }, [order, itemsTotal]);

  return (
    <>
      <Button type="button" variant="primary" onClick={() => setModal(true)}>
        {children}
      </Button>
      <Modal open={modal} onClose={() => {
        setModal(false);
      }} title={`Order# ${order.orderId}`}>
        <div className="grid grid-cols-6 gap-3 mb-5">
          <div className="border border-gray-500 p-5 rounded">
            <div className="text-2xl">+{itemsTotal.toFixed(2)}</div>
            Items total with tax
          </div>
          <div className="border border-gray-500 p-5 rounded">
            <div className="text-2xl">+{(order.tax ? order.tax.amount : 0)?.toFixed(2)}</div>
            Tax
          </div>
          <div className="border border-gray-500 p-5 rounded">
            <div className="text-2xl">-{(order.discount ? (order.discount.amount) : 0)?.toFixed(2)}</div>
            Discount
          </div>
          <div className="border border-gray-500 p-5 rounded">
            <div className="text-2xl">{order.adjustment && (
              (itemsTotal + (order?.tax?.amount || 0) - (order?.discount?.amount || 0)) % 10 < 5 ? '-' : '+'
            )}{(order.adjustment ? order.adjustment : 0)?.toFixed(2)}</div>
            Adjustment
          </div>
          <div className="border border-primary-500 p-5 text-primary-500 rounded font-bold">
            <div className="text-2xl">={orderTotal.toFixed(2)}</div>
            Total
          </div>
          <div className="border border-danger-500 p-5 text-danger-500 rounded">
            Payments breakdown
            <ul className="font-normal">
              {order.payments.map(item => (
                <li>{item.type?.name}: <span className="float-right">{item.received.toFixed(2)}</span></li>
              ))}
            </ul>
          </div>
        </div>

        {order.notes && (
          <>
            <h4 className="text-lg">Notes</h4>
            <p className="mb-5">{order.notes}</p>
          </>
        )}

        <table className="table border border-collapse">
          <thead>
          <tr>
            <th className="text-left">Item</th>
            <th className="text-right">Quantity</th>
            <th className="text-right">Tax</th>
            <th className="text-right">Price</th>
            <th className="text-right">Total</th>
          </tr>
          </thead>
          <tbody>
          {order.items.map((item, index) => (
            <tr key={index} className="hover:bg-gray-100">
              <td>
                {item.product.name}
                {item.variant && (
                  <>
                    <br/>
                    {item.variant?.attributeValue}
                  </>
                )}
              </td>
              <td className="text-right">{item.quantity}</td>
              <td className="text-right">
                {itemTax(item)}
              </td>
              <td className="text-right">{item.price}</td>
              <td className="text-right">{(item.price * item.quantity) + itemTax(item)}</td>
            </tr>
          ))}
          </tbody>
          <tfoot>
            <tr>
              <th className="text-left">Total</th>
              <th className="text-right">{order.items.reduce((prev, item) => prev + (item.quantity), 0)}</th>
              <th></th>
              <th></th>
              <th className="text-right">{itemsTotal}</th>
            </tr>
          </tfoot>
        </table>
      </Modal>
    </>
  );
};
