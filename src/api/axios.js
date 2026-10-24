import axios from "axios";

// A deployed build has no Vite dev proxy, so "/api" would ask the frontend's own
// host for the API and get a 404. VITE_API_URL is baked in at build time, and the
// live site was built with an address that no longer resolves, which showed the
// office "Unable to sign in" while the API itself was healthy. This fallback sends
// any production build to the current API even when that variable is missing or
// stale; VITE_API_URL still wins when it is set and correct.
const DEPLOYED_API_URL = "https://backend-smart-lms.onrender.com/api";

// No default Content-Type: axios keeps one it finds, and with
// "application/json" set here it JSON-stringifies FormData and silently drops
// every file part. Plain objects still get application/json automatically.
const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    (import.meta.env.PROD ? DEPLOYED_API_URL : "/api"),
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
