import axios from 'axios';
import { PUBLIC_API_URL } from "$env/static/public";

const api = axios.create({
  baseURL: PUBLIC_API_URL ?? "http://localhost:3000",
  timeout: 5000,
  withCredentials: true
});

export default api;