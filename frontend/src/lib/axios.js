import axios from "axios";

// Base Axios instance
const api = axios.create({
  baseURL: "http://localhost:8080/api", // Spring Boot backend
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // if you plan to use cookies
});

// Add a request interceptor to include token after login
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;