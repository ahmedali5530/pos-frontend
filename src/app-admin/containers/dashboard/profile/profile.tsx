import React, {FunctionComponent, useEffect, useState} from "react";
import {DASHBOARD} from "../../../routes/frontend.routes";
import {DashboardLayout} from "../../layout/dashboard.layout";
import {useTranslation} from "react-i18next";
import {Controller, useForm} from "react-hook-form";
import {getErrors, hasErrors} from "../../../../lib/error/error";
import {useDispatch, useSelector} from "react-redux";
import {getAuthorizedUser} from "../../../../duck/auth/auth.selector";
import {jsonRequest} from "../../../../api/request/request";
import {PROFILE} from "../../../../api/routing/routes/admin.backend.app";
import {userAuthenticated} from "../../../../duck/auth/auth.action";
import {
  HttpException,
  UnauthorizedException,
  UnprocessableEntityException
} from "../../../../lib/http/exception/http.exception";
import {ConstraintViolation} from "../../../../lib/validator/validation.result";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCheckCircle} from "@fortawesome/free-solid-svg-icons";


export const Profile: FunctionComponent = () => {
  const {t} = useTranslation();
  const {handleSubmit, setError, formState: {errors}, control, reset} = useForm();
  const [isLoading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);

  const submitForm = async (values: any) => {
    setLoading(true);
    setErrorMessage(undefined);

    try{
      const res = await jsonRequest(PROFILE, {
        method: 'POST',
        body: JSON.stringify(values)
      });
      const json = await res.json();

      dispatch(userAuthenticated(json.user));
    }catch (e){
      if(e instanceof HttpException){
        setErrorMessage(e.message);
      }

      if(e instanceof UnauthorizedException){
        const res = await e.response.json();
        setErrorMessage(t(res.message));
      }

      if (e instanceof UnprocessableEntityException) {
        let errorResponse = await e.response.json();

        if (errorResponse.violations) {
          errorResponse.violations.forEach((error: ConstraintViolation) => {
            setError(error.propertyPath, {
              type: 'server',
              message: error.message
            });
          });
        }
      }
      throw e;
    }finally {
      setLoading(false);
    }
  };

  const user = useSelector(getAuthorizedUser);
  useEffect(() => {
    reset({
      ...user
    });
  }, []);

  return (
    <DashboardLayout
      title="Profile"
      breadCrumbs={[
        {title: t('Dashboard'), link: DASHBOARD},
        {title: t('Profile'), current: true}
      ]}
    >
      <div className="row">
        <div className="col-lg-6">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">{t('Update profile')}</h5>
              {errorMessage !== undefined && (
                <div className="alert alert-danger">{errorMessage}</div>
              )}

              <form onSubmit={handleSubmit(submitForm)} className="row gap-3">
                <div>
                  <label htmlFor="displayName" className="form-label">{t('Name')}</label>
                  <Controller
                    render={(props) => (
                      <input
                        {...props.field}
                        type="text"
                        id="displayName"
                      />
                    )}
                    name="displayName"
                    control={control}
                  />
                  {getErrors(errors.displayName)}
                </div>
                <div>
                  <label htmlFor="email" className="form-label">{t('Email')}</label>
                  <Controller
                    render={(props) => (
                      <input
                        {...props.field}
                        type="email"
                        id="email"
                      />
                    )}
                    name="email"
                    control={control}
                  />
                  {getErrors(errors.email)}
                </div>
                <div>
                  <label htmlFor="username" className="form-label">{t('Username')}</label>
                  <Controller
                    render={(props) => (
                      <input
                        {...props.field}
                        type="text"
                        id="username"
                        disabled={true}
                      />
                    )}
                    name="username"
                    control={control}
                  />

                  {getErrors(errors.username)}
                </div>
                <div>
                  <label htmlFor="password" className="form-label">{t('Password')}</label>
                  <Controller
                    render={(props) => (
                      <input
                        {...props.field}
                        type="password"
                        id="password"
                      />
                    )}
                    name="password"
                    control={control}
                  />
                  {getErrors(errors.password)}
                </div>
                <div className="col-12">
                  <button type="submit" disabled={isLoading} className="w-100">
                    {!!errorMessage && !isLoading ? ('') : (
                      <FontAwesomeIcon icon={faCheckCircle} className="me-1" />
                    )}{t('Update')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
