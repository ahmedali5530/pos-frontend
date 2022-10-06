import React, {FunctionComponent, PropsWithChildren, useState} from "react";
import {Order} from "../../../../api/model/order";
import {Button} from "../../button";
import {Modal} from "../../modal";

interface ViewOrderProps extends PropsWithChildren{
  order: Order;
}

export const ViewOrder: FunctionComponent<ViewOrderProps> = ({
  order, children
}) => {
  const [modal, setModal] = useState(false);
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
            Items total
            <span className="float-right">+{order.items.reduce((prev, item) => prev + (item.quantity * item.price), 0)}</span>
          </div>
          <div className="border border-gray-500 p-5 font-bold text-gray-500 rounded">
            Tax
            <span className="float-right">+{order.tax ? order.tax.amount : '0'}</span>
          </div>
          <div className="border border-gray-500 p-5 font-bold text-gray-500 rounded">
            Discount
            <span className="float-right">-{order.discount ? order.discount.amount : '0'}</span>
          </div>
          <div className="border border-rose-500 p-5 font-bold text-rose-500 rounded">
            Total
            <span className="float-right">
              ={order.payments.reduce((prev, payment) => {return payment.total + prev}, 0)}
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
            <th>Product</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>Total</th>
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
                    {item.variant?.attributeName}: {item.variant?.attributeValue}
                  </>
                )}
              </td>
              <td>{item.quantity}</td>
              <td>{item.price}</td>
              <td>{item.price * item.quantity}</td>
            </tr>
          ))}
          </tbody>
          <tfoot>
            <tr>
              <th>Total</th>
              <th>{order.items.reduce((prev, item) => prev + (item.quantity), 0)}</th>
              <th></th>
              <th>{order.items.reduce((prev, item) => prev + (item.quantity * item.price), 0)}</th>
            </tr>
          </tfoot>
        </table>
      </Modal>
    </>
  );
};
