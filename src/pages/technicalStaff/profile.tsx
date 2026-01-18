import { Outlet, useLocation } from 'react-router-dom'
import Header from '../../components/header'
import TechnicalStaffProfile from '../../components/sidebar/technicalStaffSidebar'


const Profile = () => {
  const location = useLocation()
  const activeTab = location.pathname.split('/')[2] || 'rental-requests'
  
  return (
    <div className='flex flex-col h-screen'>
      <Header />
      
      <div className='flex flex-1 pt-12 overflow-hidden'>
        <TechnicalStaffProfile activeTab={activeTab} />
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