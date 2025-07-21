import axios from "axios";
import { PUBLIC_URL } from "$env/static/public";

const api = axios.create({
  baseURL: PUBLIC_URL,
  timeout: 5000,
  withCredentials: true,
});

export default api;
