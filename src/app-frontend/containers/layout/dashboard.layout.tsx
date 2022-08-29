import {FC, PropsWithChildren, ReactNode} from "react";
import Layout from "./layout";
import classNames from "classnames";
import {Link} from "react-router-dom";
import {useTranslation} from "react-i18next";

export interface BreadCrumb {
  title: string;
  link?: string;
  current?: boolean;
}

export interface DashboardLayoutProps extends PropsWithChildren {
  title?: string;
  breadCrumbs?: BreadCrumb[];
  buttons?: ReactNode[];
}

export const DashboardLayout: FC<DashboardLayoutProps> = ({
  title, breadCrumbs, children, buttons
}) => {
  const {t} = useTranslation();

  return (
    <Layout>
      <div className="row">
        <div className="col-5">
          <div className="pagetitle">
            <h1>{t(title || '')}</h1>
            {!!breadCrumbs && (
              <nav>
                <ol className="breadcrumb">
                  {breadCrumbs.map(item => (
                    <li className={classNames(
                      "breadcrumb-item",
                      item.current ? 'active' : ''
                    )} key={item.title}>
                      {item.link ? (
                        <Link to={item.link}>{t(item.title)}</Link>
                      ) : (
                        <>{t(item.title)}</>
                      )}
                    </li>
                  ))}
                </ol>
              </nav>
            )}
          </div>
        </div>
        <div className="col-7">
          {buttons}
        </div>
      </div>
      <section className="section dashboard">
        {children}
      </section>
    </Layout>
  );
};
