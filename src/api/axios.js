import axios from "axios";

// Every call goes to this site's own /api, in development and in production alike:
// vite.config.js forwards it to the local backend and vercel.json forwards it to the
// deployed one. Nothing about the API's address is ever baked into the bundle, so the
// build cannot go stale, moving the backend needs no rebuild, and no request is ever
// cross-origin — which is why CORS plays no part in the deployment.
//
// VITE_API_URL is deliberately ignored. It overrode the fallback twice and broke
// sign-in both times: once naming a host that no longer exists, once missing /api.
// To develop against a different backend, change the proxy target in vite.config.js,
// which runs on your machine and never reaches the built site.
const api = axios.create({ baseURL: "/api" });

// No default Content-Type is set on purpose: axios keeps one it finds, and with
// "application/json" here it JSON-stringifies FormData and silently drops every file
// part. Plain objects still get application/json automatically.

api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("lms_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const onLogin = window.location.pathname === "/login";

    if (error.response?.status === 401 && !onLogin) {
      // The session is over, so the school's name goes with it.
      sessionStorage.removeItem("lms_token");
      sessionStorage.removeItem("lms_user");
      sessionStorage.removeItem("lms_school");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

// A write that never reached the API used to be reported as "unable to save",
// which sent the office back to the form while the server was simply down.
export const apiMessage = (error, fallback) =>
  error?.response?.data?.message ||
  (error && !error.response
    ? "The school server is not reachable. Start the API (npm run dev in backend) and try again."
    : fallback);

export default api;
