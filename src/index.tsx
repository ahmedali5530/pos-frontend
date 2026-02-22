import React from "react";
import {AppComponent as Frontend} from "./app-frontend/app";
import "./css/index.scss";
import {createRoot} from "react-dom/client";
import {I18nextProvider} from "react-i18next";
import i18n from "./i18next";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {Provider as JotaiProvider} from "jotai";
import "./types.d.ts";
import {DatabaseProvider} from "./providers/database.provider";

const queryClient = new QueryClient();


const container = document.getElementById("root");
const root = createRoot(container!);

root.render(
  <JotaiProvider>
    <QueryClientProvider client={queryClient}>
      <DatabaseProvider>
        <I18nextProvider i18n={i18n}>
          <Frontend/>
        </I18nextProvider>
      </DatabaseProvider>
    </QueryClientProvider>
  </JotaiProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals(console.log);
