import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'

interface AuthContextType {
  user: any | null
  token: string | null
  login: (token: string, user: any) => void
  logout: () => void
  isLoading: boolean
  isAuthenticated: boolean
}

interface AuthProviderProps {
  children: ReactNode
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

function decodeJwt(token: string) {
  try {
    const base64Payload = token.split('.')[1]
    const payload = JSON.parse(atob(base64Payload))
    return payload
  } catch {
    return null
  }
}

function isTokenExpired(token: string) {
  const decoded = decodeJwt(token)
  if (!decoded?.exp) return true
  return decoded.exp * 1000 < Date.now()
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    const savedToken = localStorage.getItem('token')
    console.log(savedToken)

    if (savedUser && savedToken) {
      const expired = isTokenExpired(savedToken)

      if (expired) {
        logout()
      } else {
        setUser(JSON.parse(savedUser))
        setToken(savedToken)

        const decoded = decodeJwt(savedToken)
        const expiresInMs = decoded.exp * 1000 - Date.now()

        setTimeout(() => {
          logout()
        }, expiresInMs)
      }
    }
    setIsLoading(false)
  }, [])

  const login = useCallback((newToken: string, userData: any) => {
    setToken(newToken)
    setUser(userData)
    localStorage.setItem('token', newToken)
    localStorage.setItem('user', JSON.stringify(userData))

    const decoded = decodeJwt(newToken)
    if (decoded?.exp) {
      const expiresInMs = decoded.exp * 1000 - Date.now()
      setTimeout(() => {
        logout()
      }, expiresInMs)
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }, [])

  const value = {
    user,
    token,
    login,
    logout,
    isLoading,
    isAuthenticated: !!user && !!token,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}