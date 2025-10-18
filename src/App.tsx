import './App.css'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import HomePage from './pages/home/homePage'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className='App'>
          <Routes>
            <Route path='/' element={<HomePage />} />
            
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