import React, {FunctionComponent, PropsWithChildren} from 'react';
import {useSelector} from "react-redux";
import {isUserLoggedIn} from "../../../duck/auth/auth.selector";
import {useAtom} from "jotai";
import {appState} from "../../../store/jotai";

export interface Props extends PropsWithChildren {
  isLoading?: boolean;
}

const Layout: FunctionComponent<Props> = (props) => {
  const [app] = useAtom(appState);

  return (
    <>
      <main className="main" id={app.loggedIn ? 'main' : ''}>
        {props.children}
      </main>
    </>
  );
};

export default Layout;
