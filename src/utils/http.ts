/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'

class Http {
  instance: AxiosInstance
  isRefreshing = false
  refreshSubscribers: ((token: string) => void)[] = []

  constructor() {
    this.instance = axios.create({
      baseURL: `${import.meta.env.VITE_API_URL}`,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    this.instance.interceptors.request.use(this.handleBefore.bind(this), this.handleError)

    this.instance.interceptors.response.use(
      response => response,
      error => {
        if (error.response) {
          console.error('Error data:', error.response.data)
        }
        return Promise.reject(error)
      }
    )
  }

  private handleBefore(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
    const token = localStorage.getItem('token')?.replace(/"/g, '')
    if (token) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  }

  private handleError(error: any) {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
}

const http = new Http().instance
export default http