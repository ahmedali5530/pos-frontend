import React, {useState} from "react";
import Layout from "../layout/layout";
import {useForm} from "react-hook-form";
import {useNavigate} from "react-router";
import {POS} from "../../routes/frontend.routes";
import {Modal} from "../../../app-common/components/modal/modal";
import {Store} from "../../../api/model/store";
import {Button} from "../../../app-common/components/input/button";
import {User} from "../../../api/model/user";
import {Terminal} from "../../../api/model/terminal";
import {useAtom} from "jotai";
import {appState} from "../../../store/jotai";
import {useDB} from "../../../api/db/db";
import {Tables} from "../../../api/db/tables";
import * as yup from 'yup';
import {yupResolver} from "@hookform/resolvers/yup";

const schema = yup.object({
  username: yup.string().required(),
  password: yup.string().required()
})

const Login = () => {
  const db = useDB();
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined
  );
  const [isLoading, setLoading] = useState(false);
  const [app, setApp] = useAtom(appState);

  const {handleSubmit, register, formState: {errors}} = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      username: "",
      password: ""
    }
  });
  const navigate = useNavigate();

  const [modal, setModal] = useState(false);
  const [user, setUser] = useState<User>();
  const [store, setStore] = useState<Store>();

  const submitForm = async (values: any) => {
    setLoading(true);
    setErrorMessage(undefined);

    try {
      const [record]: any = await db.query(`
          SELECT *
          from ${Tables.user_account}
          where username = $username
            and crypto::bcrypt::compare(password, $password) = true
            and is_active = true
              fetch stores
              , stores.store
              , stores.terminals
      `, {
        username: values.username,
        password: values.password
      });

      if (record.length > 0) {
        const userAccount = record[0];
        setApp(prev => ({
          ...prev,
          // loggedIn: true,
          user: record[0]
        }));

        setUser(record[0]);

        if (userAccount?.stores?.length === 1) {

          if (userAccount?.stores[0]?.terminals?.length === 1) {
            //auto select a single store and single terminal
            selectTerminal(userAccount?.stores[0]?.terminals[0], userAccount?.stores[0])

            return;
          } else {
            setStore(userAccount?.stores[0]);
            setModal(true);

            return;
          }
        } else if (userAccount?.stores?.length > 1) {
          setModal(true);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.toString());
    } finally {
      setLoading(false);
    }
  };

  const selectTerminal = (
    terminal: Terminal,
    store: Store | undefined,
  ) => {
    setApp(prev => ({
      ...prev,
      loggedIn: true,
      terminal: terminal,
      store: store
    }));
    navigate(POS);
  };

  return (
    <Layout>
      <div className="justify-center items-center h-screen flex flex-row login-bg">
        <div className="card w-96 flex flex-col justify-center">
          <div className="card-body">
            <div className="pt-4 pb-2">
              <h5 className="card-title text-center pb-0 fs-4">
                Login to Your Account
              </h5>
            </div>
            {errorMessage !== undefined && (
              <div className="alert alert-danger mb-3 bg-danger-100">
                {errorMessage}
              </div>
            )}
            <form
              onSubmit={handleSubmit(submitForm)}
              className="flex flex-col gap-5">
              <div>
                <label htmlFor="username" className="form-label">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  className="input w-full"
                  autoFocus
                  {...register('username')}
                />
              </div>
              <div>
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  className="input w-full"
                  {...register('password')}
                />
              </div>
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full btn btn-primary">
                  Login
                </button>
              </div>
              {/*<div className="col-12 mt-3 d-flex justify-content-between">*/}
              {/*  <Link to={FORGOT_PASSWORD} className="text-white">*/}
              {/*    Forgot Password?*/}
              {/*  </Link>*/}
              {/*</div>*/}
            </form>
          </div>
        </div>
      </div>

      {modal && (
        <Modal
          open={modal}
          onClose={() => {
            setModal(false);
          }}
          title={<span className="text-white">Choose a store</span>}
          shouldCloseOnEsc={false}
          shouldCloseOnOverlayClick={false}
          hideCloseButton={true}>
          <div className="flex justify-center items-center gap-5">
            {user?.stores.map((str, index) => (
              <Button
                variant="primary"
                key={index}
                onClick={() => setStore(str)}
                className="mr-3 mb-3 h-[100px_!important] min-w-[150px] relative"
                active={store === str}>
                {str.name}
              </Button>
            ))}
          </div>

          {store && (
            <>
              <h4 className="text-xl text-center my-3">Choose a Terminal</h4>
              <div className="flex justify-center items-center gap-5 flex-wrap">
                {store?.terminals?.map((terminal, index) => (
                  <Button
                    variant="primary"
                    key={index}
                    onClick={() => selectTerminal(terminal, store)}
                    className="mr-3 mb-3 h-[100px_!important] min-w-[150px] relative">
                    {terminal.code}
                  </Button>
                ))}
              </div>
            </>
          )}
        </Modal>
      )}

    </Layout>
  );
};

export default Login;
