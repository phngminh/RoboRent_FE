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
            {/* Public Routes */}
            <Route path='/' element={<HomePage />} />
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
            <Route 
              path='/staff'
              element={
                <ProtectedRoute allowedRoles={['staff']}>
                  <div>Staff Dashboard - Coming Soon</div>
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
            <Route 
              path='/manager'
              element={
                <ProtectedRoute allowedRoles={['manager']}>
                  <div>Manager Dashboard - Coming Soon</div>
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
            <Route 
              path='/customer'
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <div>Customer Dashboard - Coming Soon</div>
                </ProtectedRoute>
              } 
            />

            {/* Admin Routes */}
            <Route 
              path='/admin'
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <div>Admin Dashboard - Coming Soon</div>
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