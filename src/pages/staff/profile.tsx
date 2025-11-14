import { useEffect, useState } from 'react'
import ProfileSidebar from '../../components/sidebar/staffSidebar'
import DashboardContent from './dashboard'
import AccountContent from './account'
import RentalRequestsContent from './rentalRequest'
import TransactionsContent from './transactions'
import { getProfile } from '../../apis/auth.api'
import Header from '../../components/header'

const Profile = () => {
  const [activeTab, setActiveTab] = useState('dashboard')

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardContent />
      case 'account':
        return <AccountContent />
      case 'rental-requests':
        return <RentalRequestsContent onCreate={(..._args: any[]) => {}} onView={(..._args: any[]) => {}} />
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
      <Header />
      
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