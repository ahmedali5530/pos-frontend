import {Order} from "../../../../api/model/order";
import React, {FC, useState} from "react";
import {Modal} from "../../modal";
import {Button} from "../../button";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import { faPrint } from "@fortawesome/free-solid-svg-icons";

interface SalePrintProps{
  order: Order;
}

export const SalePrint: FC<SalePrintProps> = (props) => {
  const [show, setShow] = useState(false);
  return (
    <>
      <Button onClick={() => setShow(true)} variant="secondary">
        <FontAwesomeIcon icon={faPrint} />
      </Button>

      <Modal open={show} onClose={() => {
        setShow(false)
      }}>
        <div className="flex justify-center flex-col items-center">
          <div id="SaleInvoice3InchOffline" style={{ width: "3.5in" }}>
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
              style={{ width: "100%", height: 100, display: "none" }}
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
                style={{ margin: "0 0" }}
              >
                Purchase Slip
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
              <h3 className="h3Style" id="shopName3Inch" style={{ margin: "0 0" }}>
                Miatech
              </h3>
              <h5 className="h5Style" id="shopAddress3Inch" style={{ margin: "0 0" }}></h5>
              <h5
                className="h5Style"
                id="shopEmail3Inch"
                style={{ margin: "0 0", fontWeight: "normal" }}
              ></h5>
              <h5
                className="h5Style"
                id="phoneNumber3Inch"
                style={{ margin: "0 0", fontWeight: "normal" }}
              ></h5>
              <h5
                className="h5Style"
                id="STNNo3inchid"
                style={{ margin: 0, display: "none" }}
              >
                STN:
              </h5>
              <h5
                className="h5Style"
                id="TaxFormation3inchid"
                style={{ margin: 0, display: "none" }}
              >
                Tax Formation:
              </h5>
              <h5
                className="h5Style"
                id="FBRPOS3incid"
                style={{ margin: 0, display: "none" }}
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
                style={{ margin: "0 0" }}
              />
            </div>
            <div style={{ background: "rgba(218, 232, 239, 0.18)" }} id="MOPSection">
              <table style={{ borderCollapse: "collapse", fontSize: 11 }} border={0}>
                <thead>
                <tr>
                  <td style={{ width: 144 }} />
                  <td style={{ width: 144 }} />
                </tr>
                </thead>
                <tbody>
                <tr>
                  <td
                    id="mopOffline3Inch"
                    className="row print_styling"
                    style={{ textAlign: "left", paddingRight: 4, paddingLeft: 17 }}
                  >
                    Mop: Credit
                  </td>
                </tr>
                </tbody>
              </table>
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
                style={{ margin: "0 0", fontWeight: "normal" }}
                id="RegisterSection"
              >
        <span id="saleId3Inch" style={{ float: "left" }}>
          Receipt #: 9
        </span>
                <span id="RegisterCode3Inch" style={{ float: "right" }}>
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
                Date: 30/Sep/2022 11:09:45 AM
              </h4>
            </div>
            <style
              dangerouslySetInnerHTML={{
                __html:
                  "\n                #RestaurantRelatedInfo, RestaurantRelatedDeliveryManInfo {\n                    margin-bottom: 10px;\n                }\n            "
              }}
            />
            <div id="RestaurantRelatedInfo" style={{ display: "none" }}>
              <h4 className="h4Style" style={{ margin: "0 0", fontWeight: "normal" }}>
        <span id="HallId" style={{ float: "left" }}>
          Hall :{" "}
        </span>
                <span id="TableId" style={{ float: "right" }}>
          Table :{" "}
        </span>
              </h4>
            </div>
            <div id="RestaurantRelatedDeliveryManInfo" style={{ display: "none" }}>
              <h4 className="h4Style" style={{ margin: "0 0", fontWeight: "normal" }}>
        <span id="DeliveryMan" style={{ float: "left" }}>
          Delivery Man :{" "}
        </span>
                <span id="DeliveryManNo" style={{ float: "right" }}>
          Phone # :{" "}
        </span>
              </h4>
            </div>
            <div id="customerNameOffline_Div3Inch">
      <span>
        <strong>Customer Name: </strong>Kashif
      </span>
            </div>
            <br />
            <div className="col-sm-12">
              <table
                className="col-sm-12"
                id="saleLineItemTable3Inch"
                style={{ borderCollapse: "collapse", fontSize: 11 }}
                border={0}
              >
                <thead
                  style={{
                    borderTop: "dashed 1px #808080",
                    borderBottom: "dashed 1px #808080"
                  }}
                >
                <tr style={{ background: "rgb(200, 224, 235)" }}>
                  <td style={{ width: 50, display: "none" }} className="GSTClm">
                    <strong>Sr.</strong>
                  </td>
                  <td style={{ width: 150, textAlign: "left" }}>
                    <strong>Item</strong>
                  </td>
                  <td
                    style={{ width: 75, textAlign: "right" }}
                    id="HeaderPriceColumn"
                  >
                    <strong>Price</strong>
                  </td>
                  <td style={{ textAlign: "right", display: "none" }} id="Space" />
                  <td style={{ width: 50, textAlign: "right" }} id="HeaderQtyColumn">
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
                    style={{ width: 50, textAlign: "right", display: "none" }}
                    id="DiscountColumnHeader"
                  >
                    <strong>Disc.</strong>
                  </td>
                  <td
                    style={{ width: 63, textAlign: "right", paddingRight: 4 }}
                    id="HeaderAmtColumn"
                  >
                    <strong>Amount</strong>
                  </td>
                </tr>
                </thead>
                <tbody id="saleLineItemTableBody3Inch">
                <tr>
                  <td
                    style={{ textAlign: "right", display: "none" }}
                    className="GSTClm"
                  />
                  <td style={{ textAlign: "left" }}>MC3030-044-BLK</td>
                  <td style={{ textAlign: "right" }}>5500</td>
                  <td style={{ textAlign: "right" }}>1</td>
                  <td
                    style={{ textAlign: "right", display: "none" }}
                    className="GSTClm"
                  />
                  <td
                    style={{ textAlign: "right", display: "none" }}
                    className="GSTClm"
                  />
                  <td
                    className="DiscColumnData3Inch"
                    style={{ textAlign: "right", display: "none" }}
                  >
                    0
                  </td>
                  <td style={{ textAlign: "right" }}>5500</td>
                </tr>
                <tr
                  style={{
                    borderTop: "dashed 1px #808080",
                    borderBottom: "dashed 1px #808080"
                  }}
                >
                  <td
                    style={{ textAlign: "right", display: "none" }}
                    className="GSTClm"
                  />
                  <td style={{ textAlign: "left" }}>Total:</td>
                  <td style={{ textAlign: "right" }} />
                  <td style={{ textAlign: "right" }}>1</td>
                  <td
                    style={{ textAlign: "right", display: "none" }}
                    className="GSTClm"
                  />
                  <td
                    style={{ textAlign: "right", display: "none" }}
                    className="GSTClm"
                  />
                  <td
                    className="DiscColumnData3Inch"
                    style={{ textAlign: "right", display: "none" }}
                  >
                    0
                  </td>
                  <td style={{ textAlign: "right" }}>5500</td>
                </tr>
                </tbody>
              </table>
              <table
                style={{ borderCollapse: "collapse", fontSize: 11, width: "100%" }}
                border={0}
              >
                <tbody id="DiscountTable3Inch">
                <tr>
                  <td style={{ textAlign: "right", width: "60%" }}>Customer Disc:</td>
                  <td style={{ textAlign: "right", width: "40%" }}>0</td>
                </tr>
                <tr>
                  <td style={{ textAlign: "right", width: "60%" }}>
                    <strong>Net Total:</strong>
                  </td>
                  <td style={{ textAlign: "right", width: "40%" }}>
                    <strong>5500</strong>
                  </td>
                </tr>
                <tr>
                  <td style={{ textAlign: "right", width: "60%" }}>Credit Amount</td>
                  <td style={{ textAlign: "right", width: "40%" }}>5500</td>
                </tr>
                <tr
                  style={{
                    borderTop: "dashed 1px #808080",
                    borderBottom: "dashed 1px #808080"
                  }}
                >
                  <td style={{ textAlign: "right", width: "60%" }}>
                    <strong>Net Receivable:</strong>
                  </td>
                  <td style={{ textAlign: "right", width: "40%" }}>
                    <strong>5500</strong>
                  </td>
                </tr>
                </tbody>
              </table>
            </div>
            <div id="salePersonOffline_Div3Inch" />
            <div id="Comments_div3Inch" />
            <br />
            <div
              style={{ textAlign: "center", background: "rgba(218, 232, 239, 0.18)" }}
              hidden={true}
            >
              <h4
                className="h4Style"
                id="ShopBasedInvoiceFooter13Inch"
                style={{ margin: "0 0", padding: "0 0" }}
              ></h4>
              <h4
                className="h4Style"
                id="ShopBasedInvoiceFooter23Inch"
                style={{ margin: "0 0", padding: "0 0" }}
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
                style={{ margin: "0 0", padding: "0 0", fontWeight: "normal" }}
              >
                Thank you for your visit
              </h4>
            </div>
            <div style={{ color: "black", padding: "2px 0px" }}>
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
              <h5
                className="h5Style"
                style={{ margin: "5px 0", padding: "0 0", fontWeight: "normal" }}
                id="NimbusFooterSection"
              >
                Nimbus Retail Solution <strong>www.NimbusRMS.com</strong>
              </h5>
            </div>
          </div>
        </div>
          <div className="flex flex-row gap-3">
            <Button variant="success">Print</Button>
            <Button variant="secondary">Email</Button>
            <Button>Pdf</Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
