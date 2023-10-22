import React from "react";
import { App as Frontend } from "./app-frontend/app";
import { App as Admin } from "./app-admin/app";
import reportWebVitals from "./reportWebVitals";
import "./css/index.scss";
import { StoreFactory } from "./store/store.factory";
import { Provider } from "react-redux";
import { createRoot } from "react-dom/client";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18next";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";
import { Provider as JotaiProvider, atom, useAtom, useSetAtom } from "jotai";
import type { PrimitiveAtom } from "jotai";
import "./types.d.ts";

const queryClient = new QueryClient();

const store = StoreFactory.createStore();

const client = new ApolloClient({
  uri: import.meta.env.VITE_API_HOST,
  cache: new InMemoryCache(),
});

const container = document.getElementById("root");
const root = createRoot(container!); // createRoot(container!) if you use TypeScript
root.render(
  <JotaiProvider>
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <I18nextProvider i18n={i18n}>
          <ApolloProvider client={client}>
            {import.meta.env.VITE_APP_TYPE === "frontend" ? (
              <Frontend />
            ) : (
              <Admin />
            )}
          </ApolloProvider>
        </I18nextProvider>
      </Provider>
    </QueryClientProvider>
  </JotaiProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(console.log);
