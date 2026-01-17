import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "https://finance-tracker-api-53xq.onrender.com/api",
  withCredentials: true
});

api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.token) {
      config.headers["Authorization"] = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
