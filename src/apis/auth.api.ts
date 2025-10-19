const API_URL = 'https://localhost:7249'
import http from '../utils/http'

export const googleLogin = () => {
  const returnUrl = `${window.location.origin}/callback`
  const loginUrl = `${API_URL}/api/auth/google-login?returnUrl=${encodeURIComponent(returnUrl)}`
  window.location.href = loginUrl
}

export const refreshToken = async (): Promise<string | null> => {
  const response = await http.post(`${API_URL}/api/auth/refresh-token`, {}, { withCredentials: true })
  if (!response.data && !response.data.token) {
    throw new Error('Failed to refresh token')
  }
  return response.data.token || null
}