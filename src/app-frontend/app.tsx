import Login from './containers/login/login';
import {BrowserRouter as Router, Route, useLocation} from "react-router-dom";
import {
  DASHBOARD,
  FORGOT_PASSWORD,
  LOGIN,
  POS,
  REPORTS, REPORTS_CURRENT_INVENTORY, REPORTS_DETAILED_INVENTORY, REPORTS_PURCHASE, REPORTS_PURCHASE_RETURN,
  REPORTS_SALES_ADVANCED, REPORTS_WASTE,
  RESET_PASSWORD,
  SETTINGS
} from "./routes/frontend.routes";
import {Navigate, Routes} from 'react-router';
import {Error404} from "../app-common/components/error/404";
import {ForgotPassword} from "./containers/forgot/forgot";
import {Pos} from "./containers/dashboard/pos";
import {ResetPassword} from "./containers/forgot/reset";
import {Settings} from "./containers/settings";
import {useAtom} from "jotai";
import {appState} from "../store/jotai";
import {ReactNode} from "react";
import {Reports} from "./containers/reports";
import {SalesAdvancedReport} from "./components/reports/output/sales.advanced.report";
import {CurrentInventoryReport} from "./components/reports/output/current.inventory.report";
import {PurchaseReport} from "./components/reports/output/purchase.report";
import {PurchaseReturnReport} from "./components/reports/output/purchase.return.report";
import {WasteReport} from "./components/reports/output/waste.report";
import {DetailedInventoryReport} from "./components/reports/output/detailed.inventory.report";

export const AppComponent = () => {
  const [app,] = useAtom(appState);


  return (
    <Router>
      <Routes>
        <Route path={LOGIN} element={
          <>
            {app.loggedIn ? <Navigate to={POS}/> : <Login/>}
          </>
        }/>

        <Route path={FORGOT_PASSWORD} element={
          <>
            {app.loggedIn ? <Navigate to={POS}/> : <ForgotPassword/>}
          </>
        }/>

        <Route path={RESET_PASSWORD} element={
          <>
            {app.loggedIn ? <Navigate to={POS}/> : <ResetPassword/>}
          </>
        }/>

        <Route path={POS} element={<RequireAuth><Pos/></RequireAuth>}/>

        {/*REPORTS ROUTERS*/}
        <Route path={REPORTS} element={<RequireAuth><Reports/></RequireAuth>}/>
        <Route path={REPORTS_SALES_ADVANCED} element={<RequireAuth><SalesAdvancedReport/></RequireAuth>}/>
        <Route path={REPORTS_DETAILED_INVENTORY} element={<DetailedInventoryReport/>}/>
        <Route path={REPORTS_CURRENT_INVENTORY} element={<CurrentInventoryReport/>}/>
        <Route path={REPORTS_PURCHASE} element={<PurchaseReport/>}/>
        <Route path={REPORTS_PURCHASE_RETURN} element={<PurchaseReturnReport/>}/>
        <Route path={REPORTS_WASTE} element={<WasteReport/>}/>

        <Route path={SETTINGS} element={<RequireAuth><Settings/></RequireAuth>}/>

        {/*if nothing matches show 404*/}
        <Route path="*" element={<Error404/>}/>
      </Routes>
    </Router>
  );
};

export const RequireAuth = ({children}: { children: ReactNode }) => {
  let location = useLocation();
  const [app,] = useAtom(appState);

  setTimeout(() => {
    if (!app.loggedIn) {
      return <Navigate
        to={LOGIN}
        state={{from: location}}
        replace
      />
    }
  }, 1000)

  return children;
}
