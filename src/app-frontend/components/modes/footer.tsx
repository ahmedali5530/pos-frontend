import { PurchaseTabs } from "../inventory/purchase.tabs";
import { Logout } from "../logout";
import { Expenses } from "../sale/expenses";
import { SaleClosing } from "../sale/sale.closing";
import { SaleHistory } from "../sale/sale.history";
import { More } from "../settings/more";
import { Shortcuts } from "../shortcuts";
import {Customers} from "../customers/customers";
import {useAtom} from "jotai";
import {appState} from "../../../store/jotai";

export const Footer = () => {
  const [{user}] = useAtom(appState);

  return (
    <>
      {user?.roles === 'ROLE_ADMIN' && (
        <>
          <Customers />
          <Expenses />
          <PurchaseTabs />
          <More />
          <span className="w-[2px] bg-gray-500 h-full"></span>
        </>
      )}

      <SaleHistory />
      <SaleClosing />
      <span className="w-[2px] bg-gray-500 h-full"></span>
      <Shortcuts />
      <span className="w-[2px] bg-gray-500 h-full"></span>
      <Logout />
    </>
  );
};
