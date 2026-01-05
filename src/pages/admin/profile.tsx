import ProfileSidebar from '../../components/sidebar/adminSidebar'
import Header from '../../components/header'
import { Outlet, useLocation } from 'react-router-dom'

const Profile = () => {
  const location = useLocation()
  const currentPath = location.pathname.split('/').pop() || 'dashboard'

  return (
    <div className='flex flex-col h-screen'>
      <Header />
      <div className='flex flex-1 pt-12 overflow-hidden'>
        <ProfileSidebar activeTab={currentPath} />
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