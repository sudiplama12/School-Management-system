import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  headers: {
    "Content-Type": "application/json",
  },
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

export default api;
