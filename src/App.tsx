import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import './App.css'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import HomePage from './pages/home/homePage'
import AuthCallback from './pages/auth/callback'
import StaffChatPage from './pages/chat/StaffChatPage'

function App() {
  return (
    <GoogleOAuthProvider clientId='YOUR_CLIENT_ID'>
      <AuthProvider>
        <Router>
          <div className='App'>
            <Routes>
              {/* Auth Routes */}
              <Route path='/' element={<div>Home Page - Coming Soon</div>} />
              <Route path='/callback' element={<AuthCallback />} />

              {/* Staff Routes */}
              <Route 
                path='/staff/chat/:rentalId'
                element={
                  <ProtectedRoute allowedRoles={['staff']}>
                    <StaffChatPage />
                  </ProtectedRoute>
                } 
              />

              {/* Customer Routes - Coming soon */}
              <Route 
                path='/customer'
                element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <></>
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  )
}

export default App