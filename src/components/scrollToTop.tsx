import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

const ScrollToTop = () => {
  const { pathname } = useLocation()
  const prevPathnameRef = useRef<string | undefined>(undefined)

  useEffect(() => {
    const prevPathname = prevPathnameRef.current
    if (prevPathname) {
      const isForwardExcluded = prevPathname === '/create-request' && pathname.startsWith('/create-request-detail/')
      const isBackExcluded = pathname === '/create-request' && prevPathname.startsWith('/create-request-detail/')
      
      if (!isForwardExcluded && !isBackExcluded) {
        window.scrollTo(0, 0)
      }
    }
    
    prevPathnameRef.current = pathname
  }, [pathname])

  return null
}

export default ScrollToTop