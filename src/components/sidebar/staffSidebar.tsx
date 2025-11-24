import React from 'react'
import { LayoutDashboard, Calendar, CreditCard,ChevronRight, User } from 'lucide-react'

interface ProfileSidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const StaffSidebar: React.FC<ProfileSidebarProps> = ({ activeTab, onTabChange }) => {
  const menuItems = [
    { id: 'dashboard', label: 'My Dashboard', icon: LayoutDashboard },
    { id: 'rental-requests', label: 'Rental Requests', icon: Calendar },
    { id: 'transactions', label: 'Transactions', icon: CreditCard },
    { id: 'account', label: 'Account', icon: User },
    { id: 'robot-group', label: 'Robot Groups', icon: Calendar}
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
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-gray-100 text-gray-800'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                }`}
              >
                <div className='flex items-center space-x-3'>
                  <Icon size={20} />
                  <span className='font-medium'>{item.label}</span>
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