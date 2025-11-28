import { Outlet, useLocation } from 'react-router-dom'
import StaffSidebar from '../../components/sidebar/staffSidebar'
import Header from '../../components/header'

const Profile = () => {
  const location = useLocation()
  const activeTab = location.pathname.split('/')[2] || 'dashboard'
  
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