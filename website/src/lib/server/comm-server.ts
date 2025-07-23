import axios from "axios";
import { SERVER_API_URL, API_URL } from "$env/static/private";

const api = axios.create({
  baseURL: SERVER_API_URL === "" ? API_URL : SERVER_API_URL,
  timeout: 5000,
  withCredentials: true,
});

export default api;
