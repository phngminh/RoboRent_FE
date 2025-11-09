/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'
import { refreshToken as apiRefreshToken } from '../apis/auth.api'

class Http {
  instance: AxiosInstance
  isRefreshing = false
  refreshSubscribers: ((token: string) => void)[] = []

  constructor() {
    this.instance = axios.create({
      baseURL: 'https://localhost:7249/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    this.instance.interceptors.request.use(this.handleBefore.bind(this), this.handleError)

    this.instance.interceptors.response.use(
      response => response,
      async error => {
        if (error.response && error.response.status === 401) {
          const originalRequest = error.config
          const success = await this.refreshToken()
          if (success) {
            const newToken = localStorage.getItem('token')?.replace(/"/g, '')
            if (newToken && originalRequest.headers) {
              originalRequest.headers['Authorization'] = `Bearer ${newToken}`
              return this.instance(originalRequest)
            }
          }
        }

        if (error.response) {
          console.error('Error data:', error.response.data)
        }
        return Promise.reject(error)
      }
    )
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      if (!payload.exp) return true
      const now = Math.floor(Date.now() / 1000)
      return payload.exp < now
    } catch (error) {
      console.error('Failed to parse token:', error)
      return true
    }
  }

  private async refreshToken(): Promise<boolean> {
    if (this.isRefreshing) {
      return new Promise(resolve => {
        this.refreshSubscribers.push(() => resolve(true))
      })
    }

    this.isRefreshing = true
    try {
      const newToken = await apiRefreshToken()
      if (newToken) {
        localStorage.setItem('token', newToken)
        this.refreshSubscribers.forEach(cb => cb(newToken))
        this.refreshSubscribers = []
        return true
      } else {
        localStorage.removeItem('token')
        return false
      }
    } catch (error) {
      console.error('Token refresh failed:', error)
      localStorage.removeItem('token')
      return false
    } finally {
      this.isRefreshing = false
    }
  }

  private async handleBefore(config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> {
    let token = localStorage.getItem('token')?.replace(/"/g, '')
    if (token && this.isTokenExpired(token)) {
      const success = await this.refreshToken()
      if (success) {
        token = localStorage.getItem('token')?.replace(/"/g, '')
      } else {
        token = undefined
      }
    }

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