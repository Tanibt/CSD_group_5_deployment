import axios from "axios";

// 🔍 DEBUG: check if env is loaded
const BASE_URL = import.meta.env.VITE_API_BASE_URL;
console.log("ENV BASE URL:", BASE_URL);

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
});

// 🔐 Attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  // 🔍 DEBUG: log outgoing request
  console.log(
    "➡️ Request:",
    config.method?.toUpperCase(),
    config.baseURL + config.url,
  );

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// 📥 Handle responses
api.interceptors.response.use(
  (response) => {
    // 🔍 DEBUG: log success response
    console.log("✅ Response:", response.config.url, response.status);
    return response;
  },
  (error) => {
    // 🔍 DEBUG: log error response
    console.error("❌ Error:", error.config?.url, error.response?.status);

    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  },
);

export default api;
