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
import classNames from "classnames";
import {Modal} from "../../components/modal";
import {getRealProductPrice} from "../dashboard/pos";
import {Store} from "../../../api/model/store";
import {Button} from "../../components/button";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCheckCircle} from "@fortawesome/free-solid-svg-icons";
import {User} from "../../../api/model/user";


const Login = () => {

  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [isLoading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const {handleSubmit, control} = useForm();
  const navigate = useNavigate();

  const [modal, setModal] = useState(false);
  const [user, setUser] = useState<User>();
  const [tokens, setTokens] = useState<any>();

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

      setTokens(json);

      //get user info and store
      const info = await jsonRequest(AUTH_INFO + '?role=ROLE_USER');
      const infoJson = await info.json();

      if(infoJson.user.stores.length === 1) {
        //save store in cookie
        Cookies.set('store', JSON.stringify(infoJson.user.stores[0]), {
          secure: true
        });

        navigate(POS);
        dispatch(userAuthenticated(infoJson.user));
      }else{
        //ask for the default store
        setModal(true);
        setUser(infoJson.user);

        Cookies.remove('JWT');
        Cookies.remove('refresh_token');
      }
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

  const setStore = (store: Store) => {
    Cookies.set('store', JSON.stringify(store), {
      secure: true
    });

    Cookies.set('JWT', tokens.token, {
      secure: true
    });
    Cookies.set('refresh_token', tokens.refresh_token, {
      secure: true
    });

    setTokens(undefined);

    navigate(POS);
    dispatch(userAuthenticated(user));
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

      <Modal open={modal} onClose={() => {
        setModal(false);
      }} title="Choose a default store" shouldCloseOnEsc={false} shouldCloseOnOverlayClick={false} hideCloseButton={true}>
        <div className="flex justify-center items-center gap-5">
          {user?.stores.map((store, index) => (
            <Button variant="primary"
                    key={index}
                    onClick={() => setStore(store)}
                    className="mr-3 mb-3 h-[100px_!important] min-w-[150px] relative"
            >
              {store.name}
            </Button>
          ))}
        </div>
      </Modal>
    </Layout>
  );
};

export default Login;
