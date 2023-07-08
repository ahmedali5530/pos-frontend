import axios from "axios";
import Cookies from "js-cookie";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_HOST,
  headers: {
    'Authorization': 'Bearer ' + Cookies.get('JWT') || ''
  }
});

export default axiosInstance;
