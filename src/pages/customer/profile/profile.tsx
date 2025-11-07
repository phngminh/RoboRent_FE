import { useEffect, useState } from 'react'
import ProfileSidebar from '../../../components/customerSidebar'
import DashboardContent from './dashboard'
import AccountContent from './account'
import RentalRequestsContent from './rentalRequest'
import TransactionsContent from './transactions'
import { useAuth } from '../../../contexts/AuthContext'
import { Link } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import logo from '../../../assets/logo1.png'
import { getProfile } from '../../../apis/auth.api'

const Profile = () => {
  const [activeTab, setActiveTab] = useState('dashboard')
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardContent />
      case 'account':
        return <AccountContent />
      case 'rental-requests':
        return <RentalRequestsContent />
      case 'transactions':
        return <TransactionsContent />
      default:
        return <DashboardContent />
    }
  }

  useEffect(() => {
    const user = getProfile()
    console.log('Fetched user profile:', user)
  }, [])

  return (
    <div className='flex flex-col h-screen'>
      <header className='fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-gray-100 py-3 px-24 font-orbitron flex items-center justify-between'>
        <div className='flex items-center space-x-4'>
          <img src={logo} alt='logo' className='w-8 h-7' />
          <Link
            to='/'
            className='text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent tracking-wider'
          >
            ROBORENT
          </Link>
        </div>

        <div className='flex items-center space-x-4'>
          <Link
            to='/profile'
            className='flex items-center space-x-2 hover:opacity-80 transition-opacity duration-200'
          >
            <div className='h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center'>
              <span className='text-white text-lg font-medium'>
                {(user?.name || user?.userName || '?').charAt(0)}
              </span>
            </div>
            <span className='text-gray-700 text-lg font-bold'>
              {user?.name || user?.userName || 'User'}
            </span>
          </Link>

          <button
            onClick={handleLogout}
            className='flex items-center space-x-1 text-gray-700 hover:text-gray-900 transition-colors'
            title='Logout'
          >
            <LogOut size={18} />
            <span className='text-lg font-bold'>Logout</span>
          </button>
        </div>
      </header>
      
      <div className='flex flex-1 pt-12 overflow-hidden'>
        <ProfileSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <div className='flex-1 overflow-y-auto'>
          <div className='p-8'>
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile