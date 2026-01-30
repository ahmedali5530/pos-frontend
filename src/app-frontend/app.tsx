import Login from './containers/login/login';
import {BrowserRouter as Router, Route, useLocation} from "react-router-dom";
import {DASHBOARD, FORGOT_PASSWORD, LOGIN, POS, RESET_PASSWORD, SETTINGS} from "./routes/frontend.routes";
import {Navigate, Routes} from 'react-router';
import {Error404} from "../app-common/components/error/404";
import {ForgotPassword} from "./containers/forgot/forgot";
import {Pos} from "./containers/dashboard/pos";
import {ResetPassword} from "./containers/forgot/reset";
import {Dashboard} from "./containers/dashboard/dashboard";
import {Settings} from "./containers/settings";
import {useAtom} from "jotai";
import {appState} from "../store/jotai";

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
        <Route path={SETTINGS} element={<RequireAuth><Settings/></RequireAuth>}/>
        <Route path={DASHBOARD} element={<RequireAuth><Dashboard/></RequireAuth>}/>

        {/*if nothing matches show 404*/}
        <Route path="*" element={<Error404/>}/>
      </Routes>
    </Router>
  );
};

export const RequireAuth = ({children}: { children: JSX.Element }) => {
  let location = useLocation();
  const [app,] = useAtom(appState);

  if (!app.loggedIn) {
    return <Navigate
      to={LOGIN}
      state={{from: location}}
      replace
    />
  }

  return children;
}
