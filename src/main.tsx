import React from "react";
import ReactDOM from "react-dom/client";
import { AppRoot } from "./app/AppRoot";
import { AppStateProvider } from "./state/AppStateProvider";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppStateProvider>
      <AppRoot />
    </AppStateProvider>
  </React.StrictMode>,
);
