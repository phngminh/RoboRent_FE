const API_URL =`${import.meta.env.VITE_API_URL}/Auth`

import http from '../utils/http'

export const googleLogin = () => {
  const returnUrl = `${window.location.origin}/callback`
  const loginUrl = `${API_URL}/google-login?returnUrl=${encodeURIComponent(returnUrl)}`
  window.location.href = loginUrl
}

export const refreshToken = async (): Promise<string | null> => {
  const response = await http.post('/Auth/refresh-token')
  return response.data
}

export interface AuthProfileResponse {
  userId: string
  email: string
  firstName: string
  lastName: string
  phoneNumber: string
  address: string
  dateOfBirth: string
  gender: string
  picture: string
}

export const getProfile = async () => {
  const response = await http.get<AuthProfileResponse>('/Auth/profile')
  return response.data
}
