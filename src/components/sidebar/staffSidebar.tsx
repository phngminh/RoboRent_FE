import React from 'react'
import { useNavigate } from 'react-router-dom'
import { LayoutDashboard, Calendar, ChevronRight, User, Truck, Group } from 'lucide-react'
import path from '../../constants/path'

interface ProfileSidebarProps {
  activeTab: string
}

const StaffSidebar: React.FC<ProfileSidebarProps> = ({ activeTab }) => {
  const navigate = useNavigate()

  const menuItems = [
    { id: 'dashboard', label: 'My Dashboard', icon: LayoutDashboard, path: path.DASHBOARD_STAFF },
    { id: 'rental-requests', label: 'Rental Requests', icon: Calendar, path: path.STAFF_REQUESTS },
    { id: 'deliveries', label: 'Delivery Tracking', icon: Truck, path: path.STAFF_DELIVERIES },
    // { id: 'transactions', label: 'Transactions', icon: CreditCard, path: '/staff/transactions' },
    { id: 'robot-group', label: 'Robot Groups', icon: Group, path: path.STAFF_ROBOT_GROUP },
    { id: 'account', label: 'Account', icon: User, path: path.STAFF_ACCOUNT },
  ]

  return (
    <div className='w-64 bg-white shadow-lg h-full'>
      <div className='p-6'>
        <nav className='space-y-2'>
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id

            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
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

export default StaffSidebar