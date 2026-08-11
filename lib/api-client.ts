import axios, { type AxiosError, type AxiosInstance } from "axios";
import { API_BASE_URL } from "@/lib/constants";

/**
 * Axios client prepared for future FastAPI backend integration.
 * Currently unused by mock services; swap mock calls to this client when ready.
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("cg_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ detail?: string | { msg?: string }[]; message?: string }>) => {
    const detail = error.response?.data?.detail;
    const message =
      (typeof detail === "string" ? detail : undefined) ||
      (Array.isArray(detail) ? detail.map((d) => d.msg).filter(Boolean).join(", ") : undefined) ||
      error.response?.data?.message ||
      error.message ||
      "An unexpected error occurred";
    return Promise.reject(new Error(message));
  }
);

export default apiClient;
