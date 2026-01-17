import React from 'react'
import { useNavigate } from 'react-router-dom'
import { LayoutDashboard, ChevronRight, LogOut, ShieldUser } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import path from '../../constants/path'

interface ProfileSidebarProps {
  activeTab: string
}

const AdminSidebar: React.FC<ProfileSidebarProps> = ({ activeTab }) => {
  const navigate = useNavigate()
  const { logout } = useAuth()

  const menuItems = [
    { id: 'dashboard', label: 'My Dashboard', icon: LayoutDashboard, path: path.DASHBOARD_ADMIN },
    { id: 'account', label: 'Accounts', icon: ShieldUser, path: path.ADMIN_ACCOUNTS },
    { id: 'logout', label: 'Logout', icon: LogOut, path: undefined }
  ]

  const handleLogout = () => {
    logout()
  }

  return (
    <div className='w-64 bg-white shadow-lg h-full'>
      <div className='p-6'>
        <nav className='space-y-2'>
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id && item.id !== 'logout'

            if (item.id === 'logout') {
              return (
                <button
                  key={item.id}
                  onClick={handleLogout}
                  className='w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors duration-200 text-red-500 hover:bg-red-50 hover:text-red-600'
                >
                  <div className='flex items-center space-x-3'>
                    <Icon size={20} className='shrink-0' />
                    <span className='font-medium whitespace-nowrap'>{item.label}</span>
                  </div>
                </button>
              )
            }

            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path!)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors duration-200 ${
                  isActive ? 'bg-gray-100 text-gray-800' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                }`}
              >
                <div className='flex items-center space-x-3'>
                  <Icon size={20} className='shrink-0' />
                  <span className='font-medium whitespace-nowrap'>{item.label}</span>
                </div>
                {isActive && <ChevronRight size={16} />}
              </button>
            )
          })}
        </nav>
      </div>
    </div>
  )
}

export default AdminSidebar