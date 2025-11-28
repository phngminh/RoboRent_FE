import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LayoutDashboard, Calendar, CreditCard, ChevronRight, ChartColumn, Newspaper, ChevronDown } from 'lucide-react'
import path from '../../constants/path'

interface ProfileSidebarProps {
  activeTab: string
}

const ManagerSidebar: React.FC<ProfileSidebarProps> = ({ activeTab }) => {
  const navigate = useNavigate()
  const [contractsExpanded, setContractsExpanded] = useState(false)

  const menuItems = [
    { id: 'dashboard', label: 'My Dashboard', icon: LayoutDashboard, path: path.DASHBOARD_MANAGER },
    { id: 'rental-requests', label: 'Rental Requests', icon: Calendar, path: path.MANAGER_REQUESTS },
    { id: 'quotes', label: 'Price Quotes', icon: CreditCard, path: path.MANAGER_QUOTES },
    { id: 'contracts', label: 'Contracts', icon: Newspaper, hasSubItems: true },
    { id: 'reports', label: 'Reports', icon: ChartColumn, path: path.MANAGER_REPORTS },
  ]

  const contractSubItems = [
    { id: 'contract-templates', label: 'Contract Templates', path: path.MANAGER_CONTRACT },
    { id: 'templates-clauses', label: 'Template Clauses', path: path.MANAGER_CLAUSES },
  ]

  useEffect(() => {
    if (activeTab === 'contract-templates' || activeTab === 'templates-clauses') {
      setContractsExpanded(true)
    }
  }, [activeTab])

  const isContractsActive = activeTab === 'contracts' || activeTab === 'contract-templates' || activeTab === 'templates-clauses'
  const shouldShowSubItems = contractsExpanded || isContractsActive

  const handleContractClick = () => {
    if (isContractsActive && contractsExpanded) {
      setContractsExpanded(false)
    } else {
      setContractsExpanded(true)
      if (!isContractsActive) {
        navigate(path.MANAGER_CONTRACT)
      }
    }
  }

  const handleSubItemClick = (subItemPath: string) => {
    navigate(subItemPath)
    setContractsExpanded(true)
  }

  return (
    <div className='w-64 bg-white shadow-lg h-full'>
      <div className='p-6'>
        <nav className='space-y-2'>
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id || (item.id === 'contracts' && isContractsActive)
            
            if (item.id === 'contracts') {
              return (
                <div key={item.id}>
                  <button
                    onClick={handleContractClick}
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
                    {shouldShowSubItems ? (
                      <ChevronDown size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    )}
                  </button>
                  
                  {shouldShowSubItems && (
                    <div className='ml-4 mt-2 space-y-1'>
                      {contractSubItems.map((subItem) => {
                        const isSubActive = activeTab === subItem.id
                        return (
                          <button
                            key={subItem.id}
                            onClick={() => handleSubItemClick(subItem.path)}
                            className={`w-full flex items-center px-4 py-2 rounded-lg transition-colors duration-200 text-sm ${
                              isSubActive
                                ? 'bg-blue-100 text-blue-800 font-medium'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                            }`}
                          >
                            <span className='whitespace-nowrap'>{subItem.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            }
            
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path!)}
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

export default ManagerSidebar