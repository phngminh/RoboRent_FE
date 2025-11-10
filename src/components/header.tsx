import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, LogOut, Bell } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { googleLogin } from '../apis/auth.api'
import { getStaffChatRooms, getCustomerChatRooms } from '../apis/chat.api'
import { getQuotesByRentalId } from '../apis/priceQuote.api'
import { QuoteStatus } from '../types/chat.types'
import logo from '../assets/logo1.png'

const roleRedirectMap: Record<string, string> = {
  customer: '/customer',
  staff: '/staff',
  manager: '/manager',
  admin: '/admin',
}

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const { user, logout, isAuthenticated } = useAuth()
  const [isScrolled, setIsScrolled] = useState(false)
  const location = useLocation()
  const [unreadCount, setUnreadCount] = useState(0)

  const handleLogout = () => {
    logout()
    setIsMenuOpen(false)
  }

  const googleLoginWithClose = () => {
    setIsLoginModalOpen(false)
    setIsMenuOpen(false)
    googleLogin()
  }

  const openLoginModal = (e: any) => {
    e.preventDefault()
    setIsLoginModalOpen(true)
    setIsMenuOpen(false)
  }

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Count unread messages + pending quotes
  useEffect(() => {
    if (!user?.id) return

    const countUnread = async () => {
      try {
        let totalUnread = 0

        // Get chat rooms based on role
        const isStaff = user.role === 'Staff'
        const getRooms = isStaff ? getStaffChatRooms : getCustomerChatRooms
        
        const response = await getRooms(user.id, 1, 50)
        
        // Count unread messages
        totalUnread = response.rooms.reduce((sum, room) => sum + room.unreadCount, 0)

        // For customers: count pending quotes
        if (!isStaff) {
          for (const room of response.rooms) {
            try {
              const quotes = await getQuotesByRentalId(room.rentalId)
              const pendingQuotes = quotes.quotes.filter(
                q => q.status === QuoteStatus.PendingCustomer
              ).length
              totalUnread += pendingQuotes
            } catch (error) {
              console.error('Failed to load quotes for room:', room.rentalId)
            }
          }
        }

        setUnreadCount(totalUnread)
      } catch (error) {
        console.error('Failed to count unread:', error)
      }
    }

    countUnread()
    
    // Refresh every 30s
    const interval = setInterval(countUnread, 30000)
    return () => clearInterval(interval)
  }, [user?.id, user?.role])

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 w-full transition-colors duration-300 ${
        isScrolled || isMenuOpen ? 'bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-100' : 'bg-transparent'
      }`}>
        <div className='w-full px-4 sm:px-6 lg:px-8 font-extrabold font-orbitron'>
          <div className='grid grid-cols-3 items-center h-16'>
            <div className='flex items-center space-x-1 ml-10'>
              <img
                src={logo}
                alt='logo'
                className={`w-8 h-7 mr-3 mb-1 transition-all duration-200
                  ${isScrolled ? 'filter drop-shadow-[0_0_2px_black]' : ''}
                `}
              />
              <Link 
                to='/' 
                className={`font-orbitron text-2xl tracking-widest transition-colors duration-300 ${isScrolled || isMenuOpen ? 'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent' : 'text-white'}`}
              >
                ROBORENT
              </Link>
            </div>

            <nav className='hidden md:flex space-x-8 tracking-wide text-lg'>
              <Link to='/' className={`${isScrolled ? 'text-gray-600 hover:text-gray-900' : 'text-white hover:text-gray-200'} transition-colors duration-200`}>
                HOME
              </Link>
              <a href='#' className={`${isScrolled ? 'text-gray-600 hover:text-gray-900' : 'text-white hover:text-gray-200'} transition-colors duration-200`}>
                PRODUCTS
              </a>
              <a href='#' className={`${isScrolled ? 'text-gray-600 hover:text-gray-900' : 'text-white hover:text-gray-200'} transition-colors duration-200`}>
                ABOUT US
              </a>
            </nav>

            <div className='flex items-center space-x-4 mr-10'>
              {isAuthenticated ? (
                <div className='flex items-center space-x-4'>
                  {/* Notification Bell */}
                  <button className="relative p-2 hover:bg-gray-100/10 rounded-full transition-colors">
                    <Bell size={20} className={isScrolled ? 'text-gray-700' : 'text-white'} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  <div className='flex items-center space-x-2'>
                    <div className='h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center'>
                      <span className='text-white text-lg font-medium'>
                        {(user?.name || user?.userName || '?').charAt(0)}
                      </span>
                    </div>
                    <span className={`text-lg hidden sm:block transition-colors duration-200 ${isScrolled ? 'text-gray-700' : 'text-white'}`}>
                      {user?.name || user?.userName || 'User'}
                    </span>
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    className={`flex items-center space-x-1 transition-colors duration-200 ${isScrolled ? 'text-gray-700 hover:text-gray-900' : 'text-white hover:text-gray-200'}`}
                    title='Logout'
                  >
                    <LogOut size={18} />
                    <span className='hidden sm:block text-lg'>Logout</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={openLoginModal}
                  className='bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-bold whitespace-nowrap'
                >
                  Get Started
                </button>
              )}
              
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`md:hidden p-2 rounded-md transition-all duration-200 ${
                  isScrolled || isMenuOpen
                    ? 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                    : 'text-white hover:text-gray-200 hover:bg-white/10'
                }`}
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>

            <nav className='hidden md:flex justify-center space-x-8 tracking-wide text-lg'>
              <Link 
                to='/' 
                className={`transition-colors duration-200 relative pb-1 ${
                  isScrolled
                    ? 'text-gray-600 hover:text-gray-900 after:bg-gray-600'
                    : 'text-white hover:text-gray-200 after:bg-white'
                } ${
                  location.pathname === '/'
                    ? 'after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px]'
                    : ''
                }`}
              >
                HOME
              </Link>
              <Link 
                to='/our-products' 
                className={`transition-colors duration-200 relative pb-1 ${
                  isScrolled
                    ? 'text-gray-600 hover:text-gray-900 after:bg-gray-600'
                    : 'text-white hover:text-gray-200 after:bg-white'
                } ${
                  location.pathname === '/our-products'
                    ? 'after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px]'
                    : ''
                }`}
              >
                PRODUCTS
              </Link>
              <Link 
                to='/about-us'
                className={`transition-colors duration-200 relative pb-1 ${
                  isScrolled
                    ? 'text-gray-600 hover:text-gray-900 after:bg-gray-600'
                    : 'text-white hover:text-gray-200 after:bg-white'
                } ${
                  location.pathname === '/about-us'
                    ? 'after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px]'
                    : ''
                }`}
              >
                ABOUT US
              </Link>
            </nav>

            <div className='flex justify-end items-center space-x-4 mr-2 sm:mr-10'>
              <div className='hidden md:flex items-center space-x-4'>
                {isAuthenticated ? (
                  <div className='flex items-center space-x-4'>
                    <Link 
                      to={roleRedirectMap[user?.role]}
                      className='flex items-center space-x-2 hover:opacity-80 transition-opacity duration-200'
                    >
                      <div className='h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center'>
                        <img
                          src={user?.picture}
                          alt='User Avatar'
                          className='h-7 w-7 rounded-full object-cover'
                        />
                      </div>
                      <span
                        className={`text-lg transition-colors duration-200 ${isScrolled ? 'text-gray-700' : 'text-white'}`}
                      >
                        {user?.name || user?.userName || 'User'}
                      </span>
                    </Link>

                    <button
                      onClick={handleLogout}
                      className={`flex items-center space-x-1 transition-colors duration-200 ${
                        isScrolled
                          ? 'text-gray-700 hover:text-gray-900'
                          : 'text-white hover:text-gray-200'
                      }`}
                      title='Logout'
                    >
                      <LogOut size={18} />
                      <span className='text-lg'>Logout</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={openLoginModal}
                    className='bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-bold whitespace-nowrap'
                  >
                    Get Started
                  </button>
                )}
              </div>
            </div>
          </div>

          {isMenuOpen && (
            <div className='md:hidden absolute top-16 left-0 right-0 bg-white/95 shadow-lg animate-in slide-in-from-top-2 duration-200'>
              <nav className='px-4 py-4 space-y-2'>
                <Link 
                  to='/' 
                  className={`block px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors relative ${
                    location.pathname === '/' ? 'font-bold after:absolute after:bottom-2 after:left-3 after:right-3 after:h-[2px] after:bg-gradient-to-r after:from-blue-600 after:to-purple-600' : ''
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </Link>
                <Link 
                  to='/our-products' 
                  className={`block px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors relative ${
                    location.pathname === '/our-products' ? 'font-bold after:absolute after:bottom-2 after:left-3 after:right-3 after:h-[2px] after:bg-gradient-to-r after:from-blue-600 after:to-purple-600' : ''
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Products
                </Link>
                <Link 
                  to='/about-us' 
                  className={`block px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors relative ${
                    location.pathname === '/about-us' ? 'font-bold after:absolute after:bottom-2 after:left-3 after:right-3 after:h-[2px] after:bg-gradient-to-r after:from-blue-600 after:to-purple-600' : ''
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  About Us
                </Link>
              </nav>
            </div>
          )}
        </div>
      </header>

      {isLoginModalOpen && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[100] animate-in fade-in duration-300'>
          <div className='bg-slate-100 rounded-2xl shadow-2xl max-w-4xl w-full h-[500px] grid md:grid-cols-2 overflow-hidden relative animate-in zoom-in-95 slide-in-from-bottom-4 duration-300'>
            <button
              onClick={() => setIsLoginModalOpen(false)}
              className='absolute top-4 right-4 z-10 bg-gray-800 text-white rounded-full p-2 hover:bg-gray-700 transition-colors'
            >
              <X size={20} />
            </button>

            <div className='p-8 md:p-10 flex flex-col justify-center font-medium ml-6'>
              <h2 className='text-4xl font-orbitron font-bold text-gray-700 mb-10 animate-in slide-in-from-left duration-500'>
                Login or signup to get started
              </h2>
              
              <button
                onClick={googleLoginWithClose}
                className='w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all text-lg mb-2 animate-in slide-in-from-left duration-500 delay-100'
              >
                <svg className='w-5 h-5' viewBox='0 0 24 24'>
                  <path
                    fill='#4285F4'
                    d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
                  />
                  <path
                    fill='#34A853'
                    d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                  />
                  <path
                    fill='#FBBC05'
                    d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
                  />
                  <path
                    fill='#EA4335'
                    d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
                  />
                </svg>
                Continue with Google
              </button>
              
              {/* <div className='relative mt-2 mb-2'>
                <div className='absolute inset-0 flex items-center'>
                  <div className='w-full border-t border-gray-300'></div>
                </div>
                <div className='relative flex justify-center text-sm'>
                  <span className='px-4 bg-white text-gray-500'>or</span>
                </div>
              </div>

              <p className='text-center text-gray-500 text-lg animate-in slide-in-from-left duration-500 delay-300'>
                Already have an account?{' '}
                <button
                  onClick={googleLoginWithClose}
                  className='text-blue-600 hover:underline font-medium'
                >
                  Log in
                </button>
              </p> */}

              <p className='text-base text-gray-200 mt-2 animate-in slide-in-from-left duration-500 delay-200'>
                By continuing, you agree to RoboRent's{' '}
                <a href='#' className='text-gray-800 font-bold hover:underline'>
                  Terms of Use
                </a>
                . Read our{' '}
                <a href='#' className='text-gray-800 font-bold hover:underline'>
                  Privacy Policy
                </a>
                .
              </p>
            </div>

            <div className='hidden md:block relative'>
              <img
                src='https://www.pixelstalk.net/wp-content/uploads/2016/08/Cool-Robot-Wallpaper.jpg'
                alt='Robot'
                className='absolute inset-0 w-full h-full object-cover'
                style={{ objectPosition: '75% center' }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Header