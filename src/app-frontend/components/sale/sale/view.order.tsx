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
    ), 0);
  }, [order, itemsTotal]);

  return (
    <>
      <Button type="button" variant="primary" onClick={() => setModal(true)}>
        {children}
      </Button>
      <Modal open={modal} onClose={() => {
        setModal(false);
      }} title={`Order# ${order.orderId}`}>
        <div className="grid grid-cols-5 gap-3 mb-5">
          <div className="border border-gray-500 p-5 font-bold text-gray-500 rounded">
            Items total with tax
            <span className="float-right">+{itemsTotal}</span>
          </div>
          <div className="border border-gray-500 p-5 font-bold text-gray-500 rounded">
            Tax
            <span className="float-right">+{order.tax ? order.tax.amount?.toFixed(2) : '0'}</span>
          </div>
          <div className="border border-gray-500 p-5 font-bold text-gray-500 rounded">
            Discount
            <span className="float-right">-{order.discount ? order.discount.amount?.toFixed(2) : '0'}</span>
          </div>
          <div className="border border-rose-500 p-5 font-bold text-rose-500 rounded">
            Total
            <span className="float-right">
              ={orderTotal}
            </span>
          </div>
          <div className="border border-teal-500 p-5 font-bold text-teal-500 rounded">
            Payments breakdown
            <ul className="font-normal">
              {order.payments.map(item => (
                <li>{item.type?.name}: <span className="float-right">{item.received}</span></li>
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
