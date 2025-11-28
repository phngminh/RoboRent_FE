import { useEffect, useState } from 'react'
import ProfileSidebar from '../../components/sidebar/staffSidebar'
import DashboardContent from './dashboard'
import AccountContent from './account'
import RentalRequestsContent from './rentalRequest'
import TransactionsContent from './transactions'
import { getProfile } from '../../apis/auth.api'
import Header from '../../components/header'
import ShareRentalRequestDetail from '../rental/ShareRentalRequestDetail'
import RobotGroupContent from './robotGroup'
import ScheduleBoard from './scheduleBoard'
import DeliveryTrackingPage from './DeliveryTrackingPage'

const Profile = () => {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardContent />

      case 'account':
        return <AccountContent />

      case 'rental-requests':
        return (
          <RentalRequestsContent
            onCreate={() => {}}
            onView={(id: number) => {
              setSelectedId(id)
              setActiveTab('rental-detail')
            }}
          />
        )

      case 'transactions':
        return <TransactionsContent />

      case 'deliveries':  
        return <DeliveryTrackingPage />  

      case 'rental-detail':
        return selectedId !== null ? (
          <ShareRentalRequestDetail
            rentalId={selectedId}
            onBack={() => setActiveTab("rental-requests")}
          />
        ) : (
          <div>No rental selected.</div>
        )

      case 'robot-group':
        return (
          <RobotGroupContent
            onSchedule={(groupId: number) => {
              console.log("Schedule CLICK:", groupId);
              setSelectedId(groupId);
              setActiveTab("schedule-board");
            }}
          />
        )

      case 'schedule-board':
        return selectedId !== null ? (
          <ScheduleBoard groupId={selectedId} />
        ) : (
          <div>No group selected.</div>
        );
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
          <div className='p-8'>{renderContent()}</div>
        </div>
      </div>
    </div>
  )
}

export default Profile
