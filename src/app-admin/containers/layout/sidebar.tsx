import {useSelector} from "react-redux";
import {isUserLoggedIn} from "../../../duck/auth/auth.selector";
import React from "react";
import {Link, useLocation} from "react-router-dom";
import {DASHBOARD} from "../../routes/frontend.routes";
import classNames from "classnames";
import {useTranslation} from "react-i18next";

export const Sidebar = () => {
  const isLoggedIn = useSelector(isUserLoggedIn);
  const {t} = useTranslation();

  const location = useLocation();

  if (!isLoggedIn) {
    return (<></>);
  }

  return (
    <aside id="sidebar" className="sidebar">
      <ul className="sidebar-nav" id="sidebar-nav">
        <li className="nav-item">
          <Link className={classNames(
            "nav-link", location.pathname === DASHBOARD ? 'active' : 'collapsed'
          )} to={DASHBOARD}>
            <i className="bi bi-grid"></i>
            <span>{t('Dashboard')}</span>
          </Link>
        </li>
      </ul>
    </aside>
  );
};
