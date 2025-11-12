import { useEffect, useState } from 'react'
import ProfileSidebar from '../../../components/sidebar/customerSidebar'
import DashboardContent from '../dashboard'
import AccountContent from './account'
import RentalRequestsContent from '../rentalRequest'
import TransactionsContent from '../transactions'
import { getProfile } from '../../../apis/auth.api'
import CreateRentalRequestContent from '../RentalRquest/createRentalRequest'
import CreateRentalDetailContent from '../RentalDetail/CreateRentalDetailContent'

const Profile = () => {
type ActiveTab =
  | { name: 'dashboard' }
  | { name: 'account' }
  | { name: 'rental-requests' }
  | { name: 'create-rental-request'; rentalId?: number }
  | { name: 'create-rental-detail'; rentalId: number; activityTypeId: number }
  | { name: 'transactions' }

const [activeTab, setActiveTab] = useState<ActiveTab>({ name: 'dashboard' })

  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    
  }

const renderContent = () => {
  switch (activeTab.name) {
    case 'dashboard':
      return <DashboardContent />

    case 'account':
      return <AccountContent />

    case 'rental-requests':
      return (
        <RentalRequestsContent
          onCreate={() => setActiveTab({ name: 'create-rental-request' })}
          onView={(rentalId) => setActiveTab({name: 'create-rental-request', rentalId})}
        />
      )

    case 'create-rental-request':
      return (
        <CreateRentalRequestContent
          rentalId={activeTab.rentalId}   // ✅ pass it here
          onBack={() => setActiveTab({ name: 'rental-requests' })}
          onNextStep={(rentalId, activityTypeId) =>
            setActiveTab({ name: 'create-rental-detail', rentalId, activityTypeId })
          }
        />
      )

    case 'create-rental-detail':
      return (
        <CreateRentalDetailContent
          rentalId={activeTab.rentalId}
          activityTypeId={activeTab.activityTypeId}
          onBack={(rentalId) => setActiveTab({ name: 'create-rental-request', rentalId })}
          onSave={() => setActiveTab({ name: 'rental-requests'})}
        />
      )

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
      {/* <header className='fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-gray-100 py-3 px-24 font-orbitron flex items-center justify-between'>
        <div className='flex items-center space-x-4'>
          <img
            src={logo}
            alt='logo'
            className={`w-8 h-7 transition-all duration-200 filter drop-shadow-[0_0_2px_black]`}
          />
          <Link
            to='/'
            className='text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent tracking-wider'
          >
            ROBORENT
          </Link>
        </div>

        <div className='flex items-center space-x-4'>
          <Link
            to='/customer'
            className='flex items-center space-x-2 hover:opacity-80 transition-opacity duration-200'
          >
            <div className='h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center'>
              <img
                src={user?.picture}
                alt='User Avatar'
                className='h-7 w-7 rounded-full object-cover'
              />
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
      </header> */}
      <Header />
      
      <div className='flex flex-1 pt-12 overflow-hidden'>
        <ProfileSidebar
          activeTab={activeTab.name}
          onTabChange={(tab: string) => setActiveTab({ name: tab as any })}
        />
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