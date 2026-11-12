import axios from "axios";

// Every request goes to this site's own /api and vercel.json forwards it to the API
// host, which is the same shape as the Vite dev proxy in vite.config.js. One origin
// is what takes CORS out of the deployment entirely: nothing about the API's address
// is baked into the build, so no environment variable can go stale, and the backend
// can move to another host without a single rebuild.
//
// Set VITE_API_URL only to point a build at a different API, such as a laptop backend
// for a demo. A value missing the /api suffix is repaired here, because otherwise the
// request slips past every mount point and the server's own "Route not found:
// /auth/login" text lands in the sign-in form as if the family had mistyped a password.
const withApi = (base) => {
  const trimmed = String(base).replace(/\/+$/, "");
  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
};

// No default Content-Type: axios keeps one it finds, and with
// "application/json" set here it JSON-stringifies FormData and silently drops
// every file part. Plain objects still get application/json automatically.
const api = axios.create({
  baseURL: withApi(import.meta.env.VITE_API_URL || "/api"),
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("lms_token");

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
      localStorage.removeItem("lms_token");
      localStorage.removeItem("lms_user");
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
