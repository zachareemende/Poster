import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import store from "./redux/store";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { setToken } from "./redux/authSlice";

const token = localStorage.getItem("token");
if (token) {
  store.dispatch(setToken(token));
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <BrowserRouter>
      <React.StrictMode>
        <App />
      </React.StrictMode>
    </BrowserRouter>
  </Provider>
);
