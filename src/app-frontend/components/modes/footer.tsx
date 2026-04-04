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
import {Settings} from "../settings/settings";
import {Reports} from "../../containers/reports";
import {useNavigate} from "react-router";
import {REPORTS} from "../../routes/frontend.routes";
import {NavLink} from "react-router-dom";

export const Footer = () => {
  const [{user}] = useAtom(appState);

  const navigate = useNavigate();

  return (
    <>
      {user?.roles === 'ROLE_ADMIN' && (
        <>
          <PurchaseTabs />
          <More />
          <span className="w-[2px] bg-gray-500 h-full"></span>
        </>
      )}

      {user?.roles === 'ROLE_ADMIN' && (
        <>
          <NavLink
            to={REPORTS}
            className="btn btn-success lg"
          >
            Reports
          </NavLink>
          <span className="w-[2px] bg-gray-500 h-full"></span>
        </>
      )}

      <Customers />
      <Expenses />

      <Settings />
      <SaleHistory />
      <SaleClosing />
      <span className="w-[2px] bg-gray-500 h-full"></span>
      <Shortcuts />
      <span className="w-[2px] bg-gray-500 h-full"></span>
      <Logout />
    </>
  );
};
