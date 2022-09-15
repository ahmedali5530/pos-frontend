import Layout from "../layout/layout";
import {Controller, useForm} from "react-hook-form";
import {Link, useParams} from "react-router-dom";
import {LOGIN} from "../../routes/frontend.routes";
import React, {useState} from "react";
import {jsonRequest} from "../../../api/request/request";
import {RESET_PASSWORD} from "../../../api/routing/routes/backend.app";
import {
  HttpException,
  UnauthorizedException,
  UnprocessableEntityException
} from "../../../lib/http/exception/http.exception";
import {Trans} from "react-i18next";
import {ValidationResult} from "../../../lib/validator/validation.result";
import classNames from "classnames";
import {getErrorClass, getErrors} from "../../../lib/error/error";

export const ResetPassword = () => {
  const params = useParams();

  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [successMessage, setSuccessMessage] = useState<string>();
  const [isLoading, setLoading] = useState(false);

  const {handleSubmit, control, setError, formState: {errors}} = useForm<any>();

  const submitForm = async (values: any) => {
    setLoading(true);
    setErrorMessage(undefined);
    setSuccessMessage(undefined);
    const requestOptions = {
      method: 'POST',
      body: JSON.stringify({
        password: values.password,
        role: 'ROLE_USER',
        resetToken: params['*']
      })
    };

    try {
      const res = await jsonRequest(RESET_PASSWORD, requestOptions);
      const json = await res.json();

      setSuccessMessage(json.message);

    } catch (err: any) {
      if (err instanceof HttpException) {
        setErrorMessage(err.message);
      }

      if (err instanceof UnprocessableEntityException) {
        const res: ValidationResult = await err.response.json();
        if (res.errorMessage) {
          setErrorMessage(res.errorMessage);
        }

        if (res.violations) {
          res.violations.forEach(error => {
            setError(error.propertyPath, {
              type: 'server',
              message: error.message
            });
          });
        }
      }

      if (err instanceof UnauthorizedException) {
        const res = await err.response.json();
        setErrorMessage(res.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <div className="justify-center items-center h-screen flex flex-row">
        <div className="card w-96 flex flex-col justify-center">
          <div className="card-body">
            <div className="pt-4 pb-2">
              <h5 className="card-title text-center pb-0 fs-4">{('Reset your password')}</h5>
            </div>
            {errorMessage !== undefined && (
              <div className="alert alert-danger">{errorMessage}</div>
            )}
            {successMessage !== undefined && (
              <div className="alert alert-success">{successMessage}</div>
            )}
            <form onSubmit={handleSubmit(submitForm)} className="flex flex-col gap-5">
              <div>
                <label htmlFor="password" className="form-label">{('New Password')}</label>
                <Controller
                  name="password"
                  render={(props) => (
                    <input
                      onChange={props.field.onChange}
                      value={props.field.value}
                      type="password"
                      id="password"
                      autoFocus
                      className={
                        classNames(
                          'input w-full',
                          getErrorClass(errors.password)
                        )
                      }
                    />
                  )}
                  control={control}
                  defaultValue=""
                />
                {getErrors(errors.password)}
              </div>
              <div className="flex flex-row justify-between">
                <button type="submit" disabled={isLoading}
                        className="w-100 btn btn-primary">{('Reset')}</button>
                <Link to={LOGIN}>{('Login')}</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};
