import React, {useEffect, useState} from 'react';
import {useSelector} from "react-redux";
import {getAuthorizedUser, isUserLoggedIn} from "../../../duck/auth/auth.selector";
import {useLogout} from "../../../duck/auth/hooks/useLogout";
import {useNavigate} from "react-router";
import {LOGIN, PROFILE} from "../../routes/frontend.routes";
import {useTranslation} from "react-i18next";
import {Link} from "react-router-dom";
import i18next from "../../../i18next";
import classNames from "classnames";
import {jsonRequest} from "../../../api/request/request";
import {UPDATE_LOCALE} from "../../../api/routing/routes/backend.app";


const Navigation = () => {
  const {t} = useTranslation();
  const isLoggedIn = useSelector(isUserLoggedIn);
  const user = useSelector(getAuthorizedUser);

  const [logoutState, logoutAction] = useLogout();
  const navigate = useNavigate();

  const [locale, setLocale] = useState(localStorage.getItem('locale') ?? 'en');

  const updateLocale = async (lang: string) => {
    setLocale(lang);
    localStorage.setItem('locale', lang);

    //set on server
    await jsonRequest(UPDATE_LOCALE, {
      method: 'POST',
      body: JSON.stringify({
        locale: lang
      })
    });

    //update i18n
    i18next.changeLanguage(lang);


    const bootstrapCss = document.querySelector('#bootstrap-css');
    //update app direction
    if (lang === 'ar') {
      document.dir = 'rtl';
      bootstrapCss!.setAttribute('href', 'https://cdn.jsdelivr.net/npm/bootstrap@5.2.0/dist/css/bootstrap.rtl.min.css');

    } else {
      document.dir = 'ltr';
      bootstrapCss!.setAttribute('href', 'https://cdn.jsdelivr.net/npm/bootstrap@5.2.0/dist/css/bootstrap.min.css');
    }
  };


  const logout = () => {
    logoutAction();
    navigate(LOGIN);
  }

  const toggleSidebar = () => {
    const body = document.body;
    body.classList.toggle('toggle-sidebar');
  };

  //set application locale based on localStorage
  useEffect(() => {
    const lang = localStorage.getItem('locale');
    if(lang !== null){
      updateLocale(lang);
    }
  }, []);

  if (!isLoggedIn) {
    return (<></>);
  }

  return (
    <header id="header" className="header fixed-top d-flex align-items-center">
      <div className="d-flex align-items-center justify-content-between">
        <a href="/" className="logo d-flex align-items-center">
          <img src="https://via.placeholder.com/350x150" alt=""/>
          <span className="d-none d-lg-block">{process.env.REACT_APP_WEBSITE_NAME}</span>
        </a>
        <i className="bi bi-list toggle-sidebar-btn" onClick={toggleSidebar}></i>
      </div>
      <nav className="header-nav ms-auto">
        <ul className="d-flex align-items-center">
          <li className="nav-item dropdown pe-3">
            <a className="nav-link d-flex align-items-center pe-0" href="#" data-bs-toggle="dropdown">
              <span className="dropdown-toggle ps-2">{locale}</span>
            </a>
            <ul className="dropdown-menu dropdown-menu-end dropdown-menu-arrow">
              <li>
                <a href="#" className={classNames(
                  'dropdown-item d-flex align-items-center',
                  locale === 'en' ? 'active' : ''
                )} onClick={() => updateLocale('en')}>
                  <span>en</span>
                </a>
              </li>
              <li>
                <a href="#" className={
                  classNames(
                    'dropdown-item d-flex align-items-center',
                    locale === 'ar' ? 'active' : ''
                  )
                } onClick={() => updateLocale('ar')}>
                  <span>ar</span>
                </a>
              </li>
            </ul>
          </li>
          <li className="nav-item dropdown pe-3">
            <a className="nav-link nav-profile d-flex align-items-center pe-0" href="#" data-bs-toggle="dropdown">
              <img src="https://via.placeholder.com/50" alt="Profile" className="rounded-circle"/>
              <span className="d-none d-md-block dropdown-toggle ps-2">{user?.displayName}</span>
            </a>

            <ul className="dropdown-menu dropdown-menu-end dropdown-menu-arrow profile">
              <li className="dropdown-header">
                <h6>{user?.displayName}</h6>
              </li>
              <li>
                <hr className="dropdown-divider"/>
              </li>
              <li>
                <Link to={PROFILE} className="dropdown-item d-flex align-items-center">
                  <i className="bi bi-person"></i>
                  <span>{t('Profile')}</span>
                </Link>
              </li>
              <li>
                <button className="dropdown-item d-flex align-items-center" onClick={logout}>
                  <i className="bi bi-box-arrow-right"></i>
                  <span>{t('Sign Out')}</span>
                </button>
              </li>
            </ul>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Navigation;
