import React, {FunctionComponent, PropsWithChildren} from 'react';
import {useSelector} from "react-redux";
import {isUserLoggedIn} from "../../../duck/auth/auth.selector";

export interface Props extends PropsWithChildren {
  isLoading?: boolean;
}

const Layout: FunctionComponent<Props> = (props) => {
  const isLoggedIn = useSelector(isUserLoggedIn);

  return (
    <>
      <main className="main" id={isLoggedIn ? 'main' : ''}>
        {props.children}
      </main>
    </>
  );
};

export default Layout;
