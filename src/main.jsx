import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { NoticeAlertsProvider } from "./components/NoticeAlerts";
import "./index.css";

// A sign-in is kept in sessionStorage, which the browser throws away when it is
// closed, so reopening the site always lands on the login page. It used to live
// in localStorage, and that survives a restart — so any older copy is dropped
// here, before AuthProvider or the API interceptor reads the new store.
for (const key of ["lms_token", "lms_user", "lms_school"]) {
  localStorage.removeItem(key);
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <ThemeProvider>
    <AuthProvider>
      <NoticeAlertsProvider>
        <App />
      </NoticeAlertsProvider>
    </AuthProvider>
  </ThemeProvider>
);