import React, {useState} from 'react';
import Layout from "../layout/layout";
import {AUTH_INFO, LOGIN} from "../../../api/routing/routes/backend.app";
import {jsonRequest} from "../../../api/request/request";
import {useDispatch} from "react-redux";
import {userAuthenticated} from "../../../duck/auth/auth.action";
import {Controller, useForm} from "react-hook-form";
import Cookies from "js-cookie";
import {useTranslation} from "react-i18next";
import {HttpException, UnauthorizedException} from "../../../lib/http/exception/http.exception";
import {useNavigate} from "react-router";
import {FORGOT_PASSWORD, POS} from "../../routes/frontend.routes";
import {Link} from "react-router-dom";


const Login = () => {

  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [isLoading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const {handleSubmit, control} = useForm();
  const navigate = useNavigate();

  const submitForm = async (values: any) => {
    setLoading(true);
    setErrorMessage(undefined);
    const requestOptions = {
      method: 'POST',
      body: JSON.stringify({username: values.username, password: values.password, role: 'ROLE_USER'})
    };

    try {
      const res = await jsonRequest(LOGIN + '?role=ROLE_USER', requestOptions);
      const json = await res.json();

      Cookies.set('JWT', json.token, {
        secure: true
      });
      Cookies.set('refresh_token', json.refresh_token, {
        secure: true
      });

      //get user info and store
      const info = await jsonRequest(AUTH_INFO + '?role=ROLE_USER');
      const infoJson = await info.json();

      navigate(POS);
      dispatch(userAuthenticated(infoJson.user));
    } catch (err: any) {
      if (err instanceof HttpException) {
        setErrorMessage(err.message);
      }

      if (err instanceof UnauthorizedException) {
        const res = await err.response.json();
        setErrorMessage(t(res.message));
      }

      // let errorResponse = await err.response.json();
      // setErrorMessage(errorResponse.message);
    } finally {
      setLoading(false);
    }
  }

  const {t} = useTranslation();

  return (
    <Layout>
      <div className="justify-center items-center h-screen flex flex-row login-bg">
        <div className="card w-96 flex flex-col justify-center">
          <div className="card-body">
            <div className="pt-4 pb-2">
              <h5 className="card-title text-center pb-0 fs-4">{t('Login to Your Account')}</h5>
            </div>
            {errorMessage !== undefined && (
              <div className="alert alert-danger mb-3">{errorMessage}</div>
            )}
            <form onSubmit={handleSubmit(submitForm)} className="flex flex-col gap-5">
              <div>
                <label htmlFor="username" className="form-label">{t('Username')}</label>
                <Controller
                  name="username"
                  render={(props) => (
                    <input
                      onChange={props.field.onChange}
                      value={props.field.value}
                      type="text"
                      id="username"
                      className="input w-full"
                      autoFocus
                    />
                  )}
                  control={control}
                  defaultValue=""
                />
              </div>
              <div>
                <label htmlFor="password" className="form-label">{t('Password')}</label>
                <Controller
                  render={(props) => (
                    <input
                      type="password"
                      onChange={props.field.onChange}
                      value={props.field.value}
                      id="password"
                      className="input w-full"
                    />
                  )}
                  name="password"
                  control={control}
                  defaultValue=""
                />
              </div>
              <div>
                <button type="submit" disabled={isLoading} className="w-full btn btn-primary">Login</button>
              </div>
              <div className="col-12 mt-3 d-flex justify-content-between">
                <Link to={FORGOT_PASSWORD}>{t('Forgot Password')}?</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Login;
