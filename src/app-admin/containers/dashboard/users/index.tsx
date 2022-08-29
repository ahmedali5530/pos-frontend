import {DashboardLayout} from "../../layout/dashboard.layout";
import {useTranslation} from "react-i18next";
import {DASHBOARD} from "../../../routes/frontend.routes";
import React from "react";


export const Users = () => {
  const {t} = useTranslation();

  return (
    <DashboardLayout
      title="Users"
      breadCrumbs={[
        {title: t('Dashboard'), link: DASHBOARD},
        {title: t('Users'), current: true}
      ]}
    >
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">{t('List')}</h5>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
