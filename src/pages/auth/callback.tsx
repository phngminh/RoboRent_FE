import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Loader2, AlertCircle } from 'lucide-react'
import { jwtDecode } from 'jwt-decode'

interface JwtPayload {
  sub?: string
  email?: string
  name?: string
  preferred_username?: string
  unique_name?: string
  accountId?: string
  accountStatus?: string
  [key: string]: any
}

const AuthCallback = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { login } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasProcessed, setHasProcessed] = useState(false)

  useEffect(() => {
    if (hasProcessed) return

    const handleCallback = async () => {
      try {
        const urlToken = searchParams.get('token')
        if (!urlToken) {
          throw new Error('No token provided in URL. Ensure backend redirects with ?token=your_jwt_here')
        }

        const decoded: JwtPayload = jwtDecode(urlToken)

        if (!decoded.sub) {
          throw new Error('Invalid token: Missing user ID in payload');
        }

        const user = {
          userId: decoded.sub,
          email: decoded.email,
          userName: decoded.name || decoded.preferred_username || decoded.unique_name || 'User',
          accountId: decoded.accountId || null,
          accountStatus: decoded.accountStatus || 'Active',
          emailConfirmed: true,
        }

        console.log('User from decoded token:', user)

        login(urlToken, user)
        setHasProcessed(true)
        window.history.replaceState({}, document.title, window.location.pathname)
        navigate('/', { replace: true })
      } catch (err: any) {
        console.error('AuthCallback error:', err)
        setError(err.message || 'Login failed. Please try again.')
        setHasProcessed(true)
        window.history.replaceState({}, document.title, window.location.pathname)
      } finally {
        setLoading(false)
      }
    }

    handleCallback()
  }, [searchParams, navigate, login, hasProcessed])

  const handleRetry = () => {
    setError(null)
    setLoading(true)
    setHasProcessed(false)
    window.location.reload()
  }

  if (loading) {
    return (
      <div className='fixed inset-0 bg-white flex items-center justify-center z-50'>
        <div className='text-center'>
          <Loader2 className='h-8 w-8 animate-spin mx-auto mb-4 text-blue-600' />
          <p className='text-gray-600'>Completing login...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='fixed inset-0 bg-white flex items-center justify-center z-50'>
        <div className='text-center p-8 bg-red-50 border border-red-200 rounded-lg max-w-md mx-4'>
          <AlertCircle className='h-12 w-12 mx-auto mb-4 text-red-500' />
          <h3 className='text-red-600 mb-2'>Login Error</h3>
          <p className='text-gray-600 mb-6'>{error}</p>
          <div className='flex flex-col sm:flex-row gap-2 justify-center'>
            <button
              onClick={() => navigate('/')}
              className='bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 flex items-center justify-center gap-1'
            >
              Go Home
            </button>
            <button
              onClick={handleRetry}
              className='bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 flex items-center justify-center gap-1'
            >
              Retry Login
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}

export default AuthCallback