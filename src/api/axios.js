import axios from "axios";
import { API_BASE_URL } from "../utils/config.js";

const api = axios.create({
  baseURL: API_BASE_URL,

  validateStatus(status) {
    return status >= 200 && status < 300;
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 403) {
      const data = error?.response?.data || {}
      // Allow "unverified email" login to stay on the page and show OTP UI.
      if (data?.needs_email_verification) {
        return Promise.reject(error)
      }

      localStorage.clear()
      sessionStorage.clear()
      const base = import.meta.env.BASE_URL || "/"
      const normalized = base.endsWith("/") ? base : `${base}/`
      window.location.href = `${normalized}login`
    }
    return Promise.reject(error);
  }
);

export default api;
