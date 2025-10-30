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

export const getProfile = async () => {
  try {
    const response = await http.get(`${API_URL}/profile`)
    if (!response.data) throw new Error('Failed to fetch profile')
    return response.data
  } catch (error: any) {
    console.error('Error fetching profile:', error)
    throw error
  }
}

