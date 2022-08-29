import Layout from "../layout/layout";
import {Controller, useForm} from "react-hook-form";
import {Link} from "react-router-dom";
import {LOGIN} from "../../routes/frontend.routes";
import React, {useState} from "react";
import {jsonRequest} from "../../../api/request/request";
import {FORGOT_PASSWORD} from "../../../api/routing/routes/backend.app";
import {
  HttpException,
  UnauthorizedException,
  UnprocessableEntityException
} from "../../../lib/http/exception/http.exception";
import {Trans} from "react-i18next";
import {ValidationResult} from "../../../lib/validator/validation.result";

export const ForgotPassword = () => {
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
      body: JSON.stringify({username: values.username, password: values.password, role: 'ROLE_USER'})
    };

    try {
      const res = await jsonRequest(FORGOT_PASSWORD, requestOptions);
      const json = await res.json();

      setSuccessMessage(json.message);

    } catch (err: any) {
      if (err instanceof HttpException) {
        setErrorMessage(err.message);
      }

      if(err instanceof UnprocessableEntityException){
        const res: ValidationResult = await err.response.json();
        if(res.errorMessage){
          setErrorMessage(res.errorMessage);
        }

        if(res.violations){
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

  console.log(errors)

  return (
    <Layout>
      <div className="container">
        <section
          className="section register min-vh-100 d-flex flex-column align-items-center justify-content-center py-4">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-4 col-md-6 d-flex flex-column align-items-center justify-content-center">
                <div className="card mb-3">
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
                    <form onSubmit={handleSubmit(submitForm)} className="row g-3">
                      <div className="col-12">
                        <label htmlFor="username" className="form-label">{('Username')}</label>
                        <Controller
                          name="username"
                          render={(props) => (
                            <input
                              onChange={props.field.onChange}
                              value={props.field.value}
                              type="text"
                              id="username"
                              autoFocus
                              className={errors.username ? 'is-invalid' : ''}
                            />
                          )}
                          control={control}
                          defaultValue=""
                        />
                        {errors.username && (
                          <div className="invalid-feedback">
                            <Trans>{errors.username.message}</Trans>
                          </div>
                        )}
                      </div>
                      <div className="col-12">
                        <button type="submit" disabled={isLoading}
                                className="w-100">{('Reset')}</button>
                      </div>
                      <div className="col-12 mt-3 d-flex justify-content-between">
                        <Link to={LOGIN}>{('Login')}</Link>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};
