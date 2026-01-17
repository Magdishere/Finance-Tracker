import axios from "axios";

export default axios.create({
  baseURL: process.env.REACT_APP_API_URL || "https://finance-tracker-api-53xq.onrender.com/api",
  withCredentials: true
});
