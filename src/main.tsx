import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { Provider } from "react-redux";
import { store } from "./app/store";
import { ConfigProvider } from 'antd';
import viVN from 'antd/es/locale/vi_VN';
import enUS from 'antd/es/locale/en_US';
import "./i18n";

const currentLanguage = localStorage.getItem("i18nextLng");

ReactDOM.render(
    <React.StrictMode>
        <Provider store={store}>
            <ConfigProvider locale={currentLanguage === "vi" ? viVN : enUS}>
                <React.Suspense fallback={<div>Loading...</div>}>
                    <App />
                </React.Suspense>
            </ConfigProvider>
        </Provider>
    </React.StrictMode>,
    document.getElementById("root")
);
