/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from "axios";

class HttpPython {
  instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: "http://127.0.0.1:8000",   // Python FastAPI
      timeout: 1000000000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.instance.interceptors.request.use(
      this.handleBefore.bind(this),
      this.handleError
    );

    this.instance.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error("Python API Error:", error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  private handleBefore(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
    const token = localStorage.getItem("token")?.replace(/"/g, "");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }

  private handleError(error: any) {
    console.error("Python Request Error:", error);
    return Promise.reject(error);
  }
}

const httpPython = new HttpPython().instance;
export default httpPython;
