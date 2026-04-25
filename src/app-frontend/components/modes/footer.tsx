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
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBarChart} from "@fortawesome/free-solid-svg-icons";
import {Tooltip} from "antd";

export const Footer = () => {
  const [{user}] = useAtom(appState);

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
        <Tooltip title="Reports">
          <NavLink
            to={REPORTS}
            className="btn btn-success lg btn-square"
          >
            <FontAwesomeIcon icon={faBarChart} />
          </NavLink>
          <span className="w-[2px] bg-gray-500 h-full"></span>
        </Tooltip>
      )}

      <Customers className="btn btn-primary lg btn-square" />
      <Expenses />

      <Settings />
      <SaleHistory />
      <SaleClosing />
      <Shortcuts />
      <Logout />
    </>
  );
};
