import React from 'react'
import { Navigate, useLocation, Outlet } from 'react-router-dom'
import { useAuth } from './AuthContext'

interface ProtectedRouteProps {
  children?: React.ReactNode
  allowedRoles?: ('admin' | 'staff' | 'manager' | 'customer' | 'technicalstaff')[]
  redirectTo?: string
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles = [], 
  redirectTo = '/' 
}) => {
  const { user, isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600'></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />
  }

  if (allowedRoles.length > 0 && user && !allowedRoles.map(r => r.toLowerCase()).includes((user.role || '').toLowerCase())) {
    return <Navigate to='/' replace />
  }

  return children ? <>{children}</> : <Outlet />
}

export default ProtectedRoute