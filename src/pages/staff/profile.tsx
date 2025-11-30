import { Outlet, useLocation } from 'react-router-dom'
import StaffSidebar from '../../components/sidebar/staffSidebar'
import Header from '../../components/header'

const Profile = () => {
<<<<<<< HEAD
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

      case 'rental-detail':
        return selectedId !== null ? (
          <ShareRentalRequestDetail
            rentalId={selectedId}
            onBack={() => setActiveTab("rental-requests")}
                  onNavigateToScheduleBoard={(groupId) => {
          setSelectedId(groupId);       
          setActiveTab("schedule-board");
      }}
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
          <ScheduleBoard 
          groupId={selectedId} 
          onBack={() => setActiveTab("robot-group")}
          />
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

=======
  const location = useLocation()
  const activeTab = location.pathname.split('/')[2] || 'dashboard'
  
>>>>>>> main
  return (
    <div className='flex flex-col h-screen'>
      <Header />

      <div className='flex flex-1 pt-12 overflow-hidden'>
        <StaffSidebar activeTab={activeTab} />

        <div className='flex-1 overflow-y-auto'>
          <div className='p-8'>
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile