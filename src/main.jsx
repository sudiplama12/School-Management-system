import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { NoticeAlertsProvider } from "./components/NoticeAlerts";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <ThemeProvider>
    <AuthProvider>
      <NoticeAlertsProvider>
        <App />
      </NoticeAlertsProvider>
    </AuthProvider>
  </ThemeProvider>
);