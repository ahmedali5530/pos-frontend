import React from 'react';
import {App as Frontend} from './app-frontend/app';
import {App as Admin} from './app-admin/app';
import reportWebVitals from './reportWebVitals';
import './css/index.scss';
import {StoreFactory} from "./store/store.factory";
import {Provider} from "react-redux";
import { createRoot } from 'react-dom/client';
import {I18nextProvider} from "react-i18next";
import i18n from './i18next';
import { Provider as RollbarProvider, ErrorBoundary as RollbarErrorBoundary } from '@rollbar/react';
import {Configuration} from "rollbar"; // Provider imports 'rollbar'

require('./types.d.ts');

const rollbarConfig: Configuration = {
  accessToken: '1bd06021ac3c46ccb8e2bd1650668d86',
  environment: 'dev',
  reportLevel: 'critical',
  logLevel: 'debug'
};

const store = StoreFactory.createStore();

const container = document.getElementById('root');
const root = createRoot(container!); // createRoot(container!) if you use TypeScript
root.render(
  <RollbarProvider config={rollbarConfig}>
    <RollbarErrorBoundary>
      <Provider store={store}>
        <I18nextProvider i18n={i18n}>
          { process.env.REACT_APP_TYPE === 'frontend' ? <Frontend/> : <Admin/> }
        </I18nextProvider>
      </Provider>
    </RollbarErrorBoundary>
  </RollbarProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(console.log);
