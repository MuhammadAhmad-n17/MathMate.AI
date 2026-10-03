import axios from "axios";

// Map to our backend server through Vite proxy
const API_URL = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to catch invalid tokens
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Clear token and force logout on invalid/expired token
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Unified services
export const authService = {
  login: (data) => api.post("/auth/login", data).then(res => res.data),
  register: (data) => api.post("/auth/register", data).then(res => res.data),
};

export const solveService = {
  solveEquation: (data) => api.post("/solve/equation", data).then(res => res.data),
  getSolution: (id) => api.get(`/solve/${id}`).then(res => res.data),
};

export const ocrService = {
  uploadImage: (formData) => api.post("/ocr/upload", formData).then(res => res.data),
};

export const graphService = {
  generatePlot: (data) => api.post("/graph/generate", data).then(res => res.data),
};

export default api;
