import axios from "axios";
import { env } from "$env/dynamic/private";

const api = axios.create({
  baseURL: env.SERVER_API_URL === "" ? env.API_URL : env.SERVER_API_URL,
  timeout: 5000,
  withCredentials: true,
});

export default api;
