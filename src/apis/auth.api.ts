const API_URL = 'https://localhost:7249/api/Auth'
import http from '../utils/http'

export const googleLogin = () => {
  const returnUrl = `${window.location.origin}/callback`
  const loginUrl = `${API_URL}/google-login?returnUrl=${encodeURIComponent(returnUrl)}`
  window.location.href = loginUrl
}

export const refreshToken = async (): Promise<string | null> => {
  const response = await http.post(`${API_URL}/refresh-token`, {}, { withCredentials: true })
  if (!response.data && !response.data.token) {
    throw new Error('Failed to refresh token')
  }
  return response.data.token || null
}

export interface AuthProfileResponse {
  userId: string
  email: string
  userName: string
  accountId: string
  accountStatus: string
  emailConfirmed: boolean
  role: string
}

export const getProfile = async () => {
  const response = await http.get<AuthProfileResponse>(`${API_URL}/profile`)
  return response.data
}
