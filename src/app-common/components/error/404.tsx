import React from 'react';
import Layout from "../../../app-frontend/containers/layout/layout";
import {useTranslation} from "react-i18next";
import Image from '../../../assets/images/not-found.svg';
import {Link} from "react-router-dom";

export const Error404 = () => {
  const {t} = useTranslation();
  return (
    <Layout>
      <div className="mx-auto">
        <section className="section error-404 h-screen flex flex-col items-center justify-center">
          <h1>404</h1>
          <h2>{t("The page you are looking for doesn't exist.")}</h2>
          <Link className="btn" to="/">{t('Back to home')}</Link>
          <img src={Image} className="img-fluid py-5" alt="Page Not Found" />
            <div className="credits">
            </div>
        </section>

      </div>
    </Layout>
  );
};
