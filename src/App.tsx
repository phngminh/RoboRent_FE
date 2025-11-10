import './App.css'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { AuthProvider } from './contexts/AuthContext'
import { useEffect } from 'react'
import useRouteElements from './contexts/useRouteElement'
import AOS from 'aos'
import 'aos/dist/aos.css'
import ScrollToTop from './components/scrollToTop'

function App() {
  const routeElement = useRouteElements()

  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: false,
      mirror: true,
      offset: 110,
    })
  }, [])

  return (
    <AuthProvider>
      <ScrollToTop />
      {routeElement}
      <ToastContainer />
    </AuthProvider>
  )
}

export default App