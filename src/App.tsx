import './App.css'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import HomePage from './pages/home/homePage/homePage'
import AuthCallback from './pages/auth/callback'
import Profile from './pages/customer/profile/profile'
import AboutUs from './pages/home/aboutUs'
import OurProducts from './pages/home/ourProduct'
import ScrollToTop from './components/scrollToTop'

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <div className='App'>
          <Routes>
            <Route path='/' element={<HomePage />} />
            <Route path='/callback' element={<AuthCallback />} />
            <Route path='/our-products' element={<OurProducts></OurProducts>} />
            <Route path='/about-us' element={<AboutUs></AboutUs>} />

            <Route 
              path='/profile'
              element={
                <ProtectedRoute allowedRoles={['customer', 'admin', 'staff']}>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path='/admin'
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <></>
                </ProtectedRoute>
              } 
            />
            <Route 
              path='/staff'
              element={
                <ProtectedRoute allowedRoles={['staff']}>
                  <></>
                </ProtectedRoute>
              } 
            />
            <Route 
              path='/customer'
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <></>
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