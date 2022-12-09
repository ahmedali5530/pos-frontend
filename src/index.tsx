import React from 'react';
import {App as Frontend} from './app-frontend/app';
import {App as Admin} from './app-admin/app';
import reportWebVitals from './reportWebVitals';
import './css/index.scss';
import {StoreFactory} from "./store/store.factory";
import {Provider} from "react-redux";
import { createRoot } from 'react-dom/client';
import {positions, Provider as AlertProvider} from "react-alert";
import AlertTemplate from '../src/app-common/components/alert/src';
import {I18nextProvider} from "react-i18next";
import i18n from './i18next';

require('./types.d.ts');

const store = StoreFactory.createStore();

const options = {
  timeout: 3000,
  position: positions.BOTTOM_RIGHT,
  containerStyle: {
    paddingRight: '20px'
  }
};

const container = document.getElementById('root');
const root = createRoot(container!); // createRoot(container!) if you use TypeScript
root.render(
  <Provider store={store}>
    <I18nextProvider i18n={i18n}>
      <AlertProvider template={AlertTemplate} {...options}>
        { process.env.REACT_APP_TYPE === 'frontend' ? <Frontend/> : <Admin/> }
      </AlertProvider>
    </I18nextProvider>
  </Provider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(console.log);
