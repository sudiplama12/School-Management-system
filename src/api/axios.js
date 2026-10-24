import axios from "axios";

// No default Content-Type: axios keeps one it finds, and with
// "application/json" set here it JSON-stringifies FormData and silently drops
// every file part. Plain objects still get application/json automatically.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
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
