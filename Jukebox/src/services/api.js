import axios from "axios";

const api = axios.create({
  baseURL: "https://localhost:7183/api",
});

// JWT interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // optional: redirect to login
    }
    return Promise.reject(error);
  }
);

export default api;