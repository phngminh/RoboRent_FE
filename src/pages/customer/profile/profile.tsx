import { useEffect, useState } from 'react'
import ProfileSidebar from '../../../components/sidebar/customerSidebar'
import DashboardContent from '../dashboard'
import AccountContent from './account'
import RentalRequestsContent from '../RentalRequest/rentalRequest'
import TransactionsContent from '../transactions'
import { getProfile } from '../../../apis/auth.api'
import CreateRentalRequestContent from '../RentalRequest/createRentalRequest'
import CreateRentalDetailContent from '../RentalDetail/CreateRentalDetailContent'
import Header from '../../../components/header'
import ShareRentalRequestDetail from '../../rental/ShareRentalRequestDetail'

const Profile = () => {
type ActiveTab =
  | { name: 'dashboard' }
  | { name: 'account' }
  | { name: 'rental-requests' }
  | { name: 'create-rental-request'; rentalId?: number }
  | { name: 'create-rental-detail'; rentalId: number; activityTypeId: number }
  | { name: 'rental-detail'; rentalId: number }   // ⭐ ADD THIS
  | { name: 'transactions' }


  const [activeTab, setActiveTab] = useState<ActiveTab>({ name: 'dashboard' })
  const [selectedId, setSelectedId] = useState<number | null>(null)

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
      onView={(rentalId: number) => setActiveTab({ name: 'create-rental-request', rentalId })}
      onDetaild={(rentalId: number) => {
        setSelectedId(rentalId);
        setActiveTab({ name: 'rental-detail', rentalId });
      }}
    />
  );


      case 'create-rental-request':
        return (
          <CreateRentalRequestContent
            rentalId={activeTab.rentalId}
            onBack={() => setActiveTab({ name: 'rental-requests' })}
            onNextStep={(rentalId, activityTypeId) =>
              setActiveTab({ name: 'create-rental-detail', rentalId, activityTypeId })
            }
          />
        )
      case 'rental-detail':
        return selectedId !== null ? (
          <ShareRentalRequestDetail
            rentalId={selectedId}
            onBack={() => setActiveTab({name: "rental-requests"})}
          />
        ) : (
          <div>No rental selected.</div>
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