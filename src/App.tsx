import './App.css'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import HomePage from './pages/home/homePage'
import AuthCallback from './pages/auth/callback'
import StaffChatPage from './pages/chat/StaffChatPage'
import CustomerChatPage from './pages/chat/CustomerChatPage'
import ManagerQuotesPage from './pages/manager/ManagerQuotesPage'

function App() {
  return (
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

            {/* Manager Routes */}
            <Route 
              path='/manager/quotes'
              element={
                <ProtectedRoute allowedRoles={['manager']}>
                  <ManagerQuotesPage />
                </ProtectedRoute>
              } 
            />

            {/* Customer Routes */}
            <Route 
              path='/customer/chat/:rentalId'
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <CustomerChatPage />
                </ProtectedRoute>
              } 
            />
          </Routes>
          <ToastContainer />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App