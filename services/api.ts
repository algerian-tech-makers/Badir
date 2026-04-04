import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * API client instance configured with base `/api` URL and default headers.
 * _Must be used on the client-side only_
 */
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

export default api;
