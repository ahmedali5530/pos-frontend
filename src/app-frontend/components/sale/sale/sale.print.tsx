import {Order} from "../../../../api/model/order";
import React, {FC, useEffect, useMemo, useState} from "react";
import {Modal} from "../../modal";
import {Button} from "../../button";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPrint, faEnvelope, faFilePdf} from "@fortawesome/free-solid-svg-icons";
import {Setting, SettingTypes} from "../../../../api/model/setting";
import localforage from "../../../../lib/localforage/localforage";
import {DateTime} from "luxon";
import ReactDOM from "react-dom";
import {Input} from "../../input";

interface SalePrintProps {
  order: Order;
}

export const print = (order: Order) => {
  //open print window
  const myWindow: any = window.open('','', 'height: 500;width:500');
  ReactDOM.render(<SalePrintMarkup order={order} /> , myWindow.document.body);

  myWindow.document.close();
  myWindow.focus();
  myWindow.print();
  myWindow.close();
};

export const SalePrint: FC<SalePrintProps> = (props) => {
  const [show, setShow] = useState(false);

  const [sendEmail, setSendEmail] = useState(false);

  return (
    <>
      <Button onClick={() => setShow(true)} variant="secondary">
        <FontAwesomeIcon icon={faPrint}/>
      </Button>

      <Modal open={show} onClose={() => {
        setShow(false)
      }} title="Duplicate Sale Receipt Print">
        <div className="flex justify-center flex-col items-center">
          <SalePrintMarkup order={props.order} />

          <div className="flex flex-row gap-3">
            <Button variant="success" onClick={() => print(props.order)}>
              <FontAwesomeIcon icon={faPrint} />
            </Button>
            <Button active={sendEmail} variant="secondary" onClick={() => setSendEmail(!sendEmail)}>
              <FontAwesomeIcon icon={faEnvelope} />
            </Button>
          </div>

          {sendEmail && (
            <form className="mt-3">
              <div className="input-group">
                <Input placeholder="Enter your email"/>
                <Button variant="primary">Send</Button>
              </div>
            </form>
          )}
        </div>
      </Modal>
    </>
  );
};

export const SalePrintMarkup = ({order}: {order: Order}) => {
  const [settings, setSettings] = useState<Setting[]>([]);

  useEffect(() => {
    localforage.getItem('settings').then((data: any) => {
      if(data) {
        let settings: Setting[] = JSON.parse(data);
        settings = settings.filter(item => item.type === SettingTypes.TYPE_RECEIPT);
        setSettings(settings)
      }
    });
  }, []);

  const itemsTotal = useMemo(() => {
    return order.items.reduce((prev, item) => (item.price * item.quantity) + prev, 0)
  }, [order]);

  const netTotal = useMemo(() => {
    let amount = itemsTotal;
    if(order?.discount && order?.discount?.amount) {
      amount -= order?.discount?.amount
    }

    if(order?.tax && order?.tax?.amount){
      amount += order?.tax?.amount;
    }

    return amount;
  }, [order, itemsTotal]);

  const changeDue = useMemo(() => {
    return order.payments.reduce((prev, item) => prev + (item.total - item.received), 0)
  }, [order]);

  return (
    <div id="SaleInvoice3InchOffline" style={{width: "3.5in"}}>
      <div
        id="margindiv3inch"
        className="setReceiptWidth3Inch"
        style={{
          border: "none",
          fontSize: 11,
          fontWeight: "normal",
          fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
          margin: 0
        }}
      >
        <img
          id="imgPreview3inch"
          src=""
          alt="logo"
          style={{width: "100%", height: 100, display: "none"}}
        />
        <div
          style={{
            textAlign: "center",
            background: "rgb(200, 224, 235)",
            padding: "6px 6px"
          }}
        >
          <h3
            className="h3Style"
            id="InvoiceCaption3Inch"
            style={{margin: "0 0"}}
          >
            Sale Receipt
          </h3>
        </div>
        <div
          style={{
            textAlign: "center",
            background: "rgba(218, 232, 239, 0.18)",
            padding: "5px 5px"
          }}
          id="ShopSection"
        >
          <h3 className="h3Style" id="shopName3Inch" style={{margin: "0 0"}}>
            Shop name
          </h3>
          <h5 className="h5Style" id="shopAddress3Inch" style={{margin: "0 0"}}></h5>
          <h5
            className="h5Style"
            id="shopEmail3Inch"
            style={{margin: "0 0", fontWeight: "normal"}}
          ></h5>
          <h5
            className="h5Style"
            id="phoneNumber3Inch"
            style={{margin: "0 0", fontWeight: "normal"}}
          ></h5>
          <h5
            className="h5Style"
            id="STNNo3inchid"
            style={{margin: 0, display: 'none'}}
          >
            STN:
          </h5>
          <h5
            className="h5Style"
            id="TaxFormation3inchid"
            style={{margin: 0, display: 'none'}}
          >
            Tax Formation:
          </h5>
          <h5
            className="h5Style"
            id="FBRPOS3incid"
            style={{margin: 0, display: 'none'}}
          >
            POS No:
          </h5>
        </div>
        <div
          style={{
            textAlign: "center",
            background: "rgba(218, 232, 239, 0.18)",
            padding: "0 2px"
          }}
          id="StatusSection"
        >
          <h5
            className="h5Style"
            id="invoiceStatus3Inch"
            style={{margin: "0 0"}}
          />
        </div>
        <div
          style={{
            textAlign: "center",
            background: "rgba(218, 232, 239, 0.18)",
            padding: "5px 2px"
          }}
        >
          <h4
            className="h4Style"
            style={{margin: "0 0", fontWeight: "normal"}}
            id="RegisterSection"
          >
            <span id="saleId3Inch" style={{float: "left"}}>
              Receipt #: {order.orderId}
            </span>
            <span id="RegisterCode3Inch" style={{float: "right", display: 'none'}}>
              Register: RegDF01
            </span>
          </h4>
          <h4
            className="h4Style"
            id="saleDate3Inch"
            style={{
              textAlign: "left",
              margin: "0 0",
              fontWeight: "normal",
              clear: "both"
            }}
          >
            Date: {DateTime.fromISO(order.createdAt).toFormat(process.env.REACT_APP_DATE_TIME_FORMAT as string)}
          </h4>
        </div>
        {order.customer && (
          <div id="customerNameOffline_Div3Inch">
            <span>
              <strong>Customer Name: </strong> {order.customer.name}
            </span>
          </div>
        )}

        <br/>
        <div className="col-sm-12">
          <table
            className="col-sm-12"
            id="saleLineItemTable3Inch"
            style={{borderCollapse: "collapse", fontSize: 11}}
            border={0}
          >
            <thead
              style={{
                borderTop: "dashed 1px #808080",
                borderBottom: "dashed 1px #808080"
              }}
            >
            <tr style={{background: "rgb(200, 224, 235)"}}>
              <td style={{width: 150, textAlign: "left"}}>
                <strong>Item</strong>
              </td>
              <td
                style={{width: 75, textAlign: "right"}}
                id="HeaderPriceColumn"
              >
                <strong>Price</strong>
              </td>
              <td style={{textAlign: "right", display: "none"}} id="Space"/>
              <td style={{width: 50, textAlign: "right"}} id="HeaderQtyColumn">
                <strong>Qty</strong>
              </td>
              <td
                style={{
                  width: 63,
                  textAlign: "right",
                  paddingRight: 4,
                  display: "none"
                }}
                className="GSTClm"
              >
                <strong>GST Rate</strong>
              </td>
              <td
                style={{
                  width: 63,
                  textAlign: "right",
                  paddingRight: 4,
                  display: "none"
                }}
                className="GSTClm"
              >
                <strong>GST</strong>
              </td>
              <td
                className="DiscColumnData3Inch"
                style={{width: 50, textAlign: "right", display: "none"}}
                id="DiscountColumnHeader"
              >
                <strong>Disc.</strong>
              </td>
              <td
                style={{width: 63, textAlign: "right", paddingRight: 4}}
                id="HeaderAmtColumn"
              >
                <strong>Amount</strong>
              </td>
            </tr>
            </thead>
            <tbody id="saleLineItemTableBody3Inch">
            {order.items.map(item => (
              <tr>
                <td
                  style={{textAlign: "right", display: "none"}}
                  className="GSTClm"
                />
                <td style={{textAlign: "left"}}>
                  {item.product.name}
                  {item.variant && (
                    <>
                      <div className="ml-1">- {item.variant.attributeName}: {item.variant.attributeValue}</div>
                    </>
                  )}
                </td>
                <td style={{textAlign: "right"}}>{item.price}</td>
                <td style={{textAlign: "right"}}>{item.quantity}</td>
                <td
                  style={{textAlign: "right", display: "none"}}
                  className="GSTClm"
                />
                <td
                  style={{textAlign: "right", display: "none"}}
                  className="GSTClm"
                />
                <td
                  className="DiscColumnData3Inch"
                  style={{textAlign: "right", display: "none"}}
                >
                  0
                </td>
                <td style={{textAlign: "right"}}>{item.price * item.quantity}</td>
              </tr>
            ))}
            <tr
              style={{
                borderTop: "dashed 1px #808080",
                borderBottom: "dashed 1px #808080"
              }}
            >
              <td
                style={{textAlign: "right", display: "none"}}
                className="GSTClm"
              />
              <td style={{textAlign: "left"}}>Total:</td>
              <td style={{textAlign: "right"}}/>
              <td style={{textAlign: "right"}}>1</td>
              <td
                style={{textAlign: "right", display: "none"}}
                className="GSTClm"
              />
              <td
                style={{textAlign: "right", display: "none"}}
                className="GSTClm"
              />
              <td
                className="DiscColumnData3Inch"
                style={{textAlign: "right", display: "none"}}
              >
                0
              </td>
              <td style={{textAlign: "right"}}>{itemsTotal}</td>
            </tr>
            </tbody>
          </table>
          <table
            style={{borderCollapse: "collapse", fontSize: 11, width: "100%"}}
            border={0}
          >
            <tbody id="DiscountTable3Inch">
            {order.discount && (
              <tr>
                <td style={{textAlign: "right", width: "60%"}}>Disc:</td>
                <td style={{textAlign: "right", width: "40%"}}>{order.discount.amount}</td>
              </tr>
            )}
            {order.tax && (
              <tr>
                <td style={{textAlign: "right", width: "60%"}}>Tax@{order.tax.rate}:</td>
                <td style={{textAlign: "right", width: "40%"}}>{order.tax.amount}</td>
              </tr>
            )}

            <tr>
              <td style={{textAlign: "right", width: "60%"}}>
                <strong>Net Total:</strong>
              </td>
              <td style={{textAlign: "right", width: "40%"}}>
                <strong>{netTotal}</strong>
              </td>
            </tr>
            {order.payments.map(item => (
              <tr>
                <td style={{textAlign: "right", width: "60%"}}>{item.type?.name} Amount</td>
                <td style={{textAlign: "right", width: "40%"}}>{item.received}</td>
              </tr>
            ))}

            <tr
              style={{
                borderTop: "dashed 1px #808080",
                borderBottom: "dashed 1px #808080"
              }}
            >
              <td style={{textAlign: "right", width: "60%"}}>
                <strong>Change due:</strong>
              </td>
              <td style={{textAlign: "right", width: "40%"}}>
                <strong>{changeDue}</strong>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
        <div id="salePersonOffline_Div3Inch"/>
        <div id="Comments_div3Inch"/>
        <br/>
        <div
          style={{textAlign: "center", background: "rgba(218, 232, 239, 0.18)"}}
          hidden={true}
        >
          <h4
            className="h4Style"
            id="ShopBasedInvoiceFooter13Inch"
            style={{margin: "0 0", padding: "0 0"}}
          ></h4>
          <h4
            className="h4Style"
            id="ShopBasedInvoiceFooter23Inch"
            style={{margin: "0 0", padding: "0 0"}}
          ></h4>
        </div>
        <div
          style={{
            left: "1%",
            textAlign: "justify",
            background: "rgba(218, 232, 239, 0.18)"
          }}
        >
          <h4
            className="h4Style"
            id="SystemBasedInvoiceFooter3Inch"
            style={{margin: "0 0", padding: "0 0", fontWeight: "normal"}}
          >
            Thank you for your visit
          </h4>
        </div>
        <div style={{color: "black", padding: "2px 0px"}}>
          <h5
            className="h5Style"
            style={{
              margin: "5px 0",
              padding: "0 0",
              fontWeight: "normal",
              display: "none"
            }}
            id="fbrComments3InchOffline"
          >
            Verify this invoice through FBR TaxAsaan MobileApp or SMS at 9966 and
            win exciting prizes in draw{" "}
          </h5>
        </div>
      </div>
    </div>
  );
};
