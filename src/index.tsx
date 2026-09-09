import React from "react";
import { createRoot } from "react-dom/client";

import "styles/bootstrap.css";
import "assets/vendor/google-fonts.css";

import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import store, { persistor } from "redux/store";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import toastConfig from "configs/toast";

import App from "App";

const rootElement = document.getElementById("root") as HTMLElement;
const root = createRoot(rootElement);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
    <ToastContainer {...toastConfig} />
  </React.StrictMode>
);