import { Purchase } from "../../api/model/purchase";
import ReactDOM from "react-dom";
import React, { ReactNode } from "react";

export const PrintService = (node: any) => {
  //open print window
  const myWindow: any = window.open('', '', 'height: 1000');
  ReactDOM.render(
    node,
    myWindow.document.body
  );

  myWindow.document.close();
  myWindow.focus();
  myWindow.print();
  myWindow.close();
};
