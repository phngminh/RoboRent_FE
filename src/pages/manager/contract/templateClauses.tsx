import React, { useState } from 'react'
import { Eye, Search, AlertTriangle, Plus, Edit, Trash2 } from 'lucide-react'

const Clauses: React.FC = () => {
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')

  const causes = [
    {
      id: 1,
      title: 'Financial Non-Payment',
      category: 'Financial',
      severity: 'High',
      description: 'Failure to make scheduled payments as per contract terms.',
      status: 'Active',
      createdAt: '2024-01-15',
      statusColor: 'bg-green-100 text-green-800',
      severityColor: 'bg-red-100 text-red-800'
    },
    {
      id: 2,
      title: 'Service Level Agreement Violation',
      category: 'Service Level',
      severity: 'Medium',
      description: 'Service provider failed to meet agreed upon service level metrics.',
      status: 'Active',
      createdAt: '2024-02-01',
      statusColor: 'bg-green-100 text-green-800',
      severityColor: 'bg-yellow-100 text-yellow-800'
    },
    {
      id: 3,
      title: 'Compliance Breach',
      category: 'Compliance',
      severity: 'High',
      description: 'Violation of regulatory compliance requirements specified in contract.',
      status: 'Active',
      createdAt: '2024-02-10',
      statusColor: 'bg-green-100 text-green-800',
      severityColor: 'bg-red-100 text-red-800'
    },
    {
      id: 4,
      title: 'Intellectual Property Infringement',
      category: 'Intellectual Property',
      severity: 'Critical',
      description: 'Unauthorized use of protected intellectual property assets.',
      status: 'Active',
      createdAt: '2024-02-20',
      statusColor: 'bg-green-100 text-green-800',
      severityColor: 'bg-purple-100 text-purple-800'
    },
    {
      id: 5,
      title: 'Delivery Delay',
      category: 'Service Level',
      severity: 'Low',
      description: 'Delayed delivery of goods or services beyond agreed timeline.',
      status: 'Inactive',
      createdAt: '2024-01-05',
      statusColor: 'bg-gray-100 text-gray-800',
      severityColor: 'bg-blue-100 text-blue-800'
    },
    {
      id: 6,
      title: 'Quality Standards Not Met',
      category: 'Service Level',
      severity: 'Medium',
      description: 'Delivered goods or services do not meet specified quality standards.',
      status: 'Active',
      createdAt: '2024-03-01',
      statusColor: 'bg-green-100 text-green-800',
      severityColor: 'bg-yellow-100 text-yellow-800'
    }
  ]

  const filters = ['All', 'Active', 'Inactive']
  const categories = ['All Categories', 'Financial', 'Service Level', 'Compliance', 'Intellectual Property']

  const handleViewDetails = (causeId: number) => {
    console.log('Viewing details for cause:', causeId)
  }

  const handleCreateCause = () => {
    console.log('Creating new cause')
  }

  const handleEdit = (causeId: number) => {
    console.log('Editing cause:', causeId)
  }

  const handleDelete = (causeId: number) => {
    console.log('Deleting cause:', causeId)
  }

  return (
    <div className='space-y-6 bg-gray-50 p-6'>
      {/* Header Section */}
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold text-gray-800'>Template Clauses</h1>
        <div className='flex items-center space-x-4'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' size={20} />
            <input
              type='text'
              placeholder='Search templates...'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className='pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            />
          </div>
          <button
            onClick={handleCreateCause}
            className='bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2'
          >
            <Plus size={18} />
            <span>Create Template</span>
          </button>
        </div>
      </div>

      {/* Filter Section */}
      <div className='bg-white rounded-xl p-4 shadow-sm border border-gray-100'>
        <div className='flex flex-wrap items-center gap-4'>
          <div className='flex space-x-2'>
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeFilter === filter
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
          
          <select className='px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Templates Table */}
      <div className='bg-white rounded-xl shadow-sm border border-gray-100'>
        <div className='p-6 border-b border-gray-100'>
          <h2 className='text-xl font-semibold text-gray-800'>All Templates</h2>
          <p className='text-gray-600 mt-1'>Manage contract template clauses and their classifications.</p>
        </div>
        
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Title
                </th>
                <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Category
                </th>
                <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Severity
                </th>
                <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Description
                </th>
                <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Status
                </th>
                <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Created At
                </th>
                <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {causes
                .filter((cause) => activeFilter === 'All' || cause.status === activeFilter)
                .filter(
                  (cause) =>
                    search === '' ||
                    cause.title.toLowerCase().includes(search.toLowerCase()) ||
                    cause.description.toLowerCase().includes(search.toLowerCase())
                )
                .map((cause) => (
                  <tr key={cause.id} className='hover:bg-gray-50'>
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-center'>
                      <div className='flex items-center justify-center space-x-2'>
                        <AlertTriangle className='text-orange-500' size={18} />
                        <span>{cause.title}</span>
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center'>{cause.category}</td>
                    <td className='px-6 py-4 whitespace-nowrap text-center'>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${cause.severityColor}`}>
                        {cause.severity}
                      </span>
                    </td>
                    <td className='px-6 py-4 text-sm text-gray-900 max-w-md text-center'>{cause.description}</td>
                    <td className='px-6 py-4 whitespace-nowrap text-center'>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${cause.statusColor}`}>
                        {cause.status}
                      </span>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center'>{cause.createdAt}</td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-center'>
                      <div className='flex items-center justify-center space-x-2'>
                        <button
                          onClick={() => handleViewDetails(cause.id)}
                          className='bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1'
                        >
                          <Eye size={14} />
                          <span>View</span>
                        </button>
                        <button
                          onClick={() => handleEdit(cause.id)}
                          className='bg-yellow-600 text-white px-3 py-1 rounded-lg hover:bg-yellow-700 transition-colors flex items-center space-x-1'
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(cause.id)}
                          className='bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-1'
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className='px-6 py-4 border-t border-gray-100 flex items-center justify-between'>
          <div className='flex space-x-2'>
            <button className='px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors'>
              Previous
            </button>
            <button className='px-3 py-1 text-sm bg-blue-600 text-white rounded'>1</button>
            <button className='px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors'>2</button>
            <button className='px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors'>Next</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Clauses