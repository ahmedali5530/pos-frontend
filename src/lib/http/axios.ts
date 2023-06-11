import axios from "axios";
import Cookies from "js-cookie";

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_HOST,
  headers: {
    'Authorization': 'Bearer ' + Cookies.get('JWT') || ''
  }
});

export default axiosInstance;
