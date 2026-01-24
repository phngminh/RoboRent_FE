import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Truck, ClipboardCheck, ChevronRight } from 'lucide-react'
import path from '../../constants/path'

interface ProfileSidebarProps {
  activeTab: string
}

const TechnicalStaffProfile: React.FC<ProfileSidebarProps> = ({ activeTab }) => {
  const navigate = useNavigate()

  const menuItems = [
    { id: 'deliveries', label: 'Actual Deliveries', icon: Truck, path: path.TECH_STAFF_DELIVERIES },
    { id: 'checklists', label: 'Delivery Checklists', icon: ClipboardCheck, path: path.TECH_STAFF_CHECKLISTS }
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
                  isActive
                    ? 'bg-gray-100 text-gray-800'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
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

export default TechnicalStaffProfile
