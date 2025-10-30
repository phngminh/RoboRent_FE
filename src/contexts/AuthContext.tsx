import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'

interface AuthContextType {
  user: any | null
  token: string | null
  login: (token: string, user: any) => void
  logout: () => void
  refreshToken: () => Promise<boolean>
  isLoading: boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    const savedToken = localStorage.getItem('token')
    if (savedUser && savedToken) {
      try {
        setUser(JSON.parse(savedUser))
        setToken(savedToken)
      } catch (error) {
        console.error('Error parsing saved auth data:', error)
        localStorage.removeItem('user')
        localStorage.removeItem('token')
      }
    }
    setIsLoading(false)
  }, [])

  const login = useCallback((newToken: string, userData: any) => {
    setToken(newToken)
    setUser(userData)
    localStorage.setItem('token', newToken)
    localStorage.setItem('user', JSON.stringify(userData))
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }, [])

  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const { refreshToken: apiRefresh } = await import('../apis/auth.api')
      const newToken = await apiRefresh()
      if (newToken) {
        setToken(newToken)
        localStorage.setItem('token', newToken)
        return true
      }
      return false
    } catch (error) {
      console.error('Token refresh failed:', error)
      logout()
      return false
    }
  }, [logout])

  const value = {
    user,
    token,
    login,
    logout,
    refreshToken,
    isLoading,
    isAuthenticated: !!user && !!token,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}