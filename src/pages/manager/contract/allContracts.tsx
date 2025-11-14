import React, { useState } from 'react'
import { Eye, Search } from 'lucide-react'

const AllContracts: React.FC = () => {
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')

  const templates = [
    {
      id: 1,
      title: 'Software License Agreement for Project X',
      status: 'Active',
      createdDate: '2023-10-26',
      comments: 'Initial review completed. Awaiting final approval.',
      statusColor: 'bg-blue-100 text-blue-800'
    },
    {
      id: 2,
      title: 'Service Agreement for Cloud Migration',
      status: 'Pending',
      createdDate: '2023-11-15',
      comments: 'Vendor proposal received. Currently under review.',
      statusColor: 'bg-pink-100 text-pink-800'
    },
    {
      id: 3,
      title: 'Non-Disclosure Agreement (NDA) - Partner A',
      status: 'Draft',
      createdDate: '2023-12-01',
      comments: 'Draft version sent to Partner A for consideration.',
      statusColor: 'bg-gray-100 text-gray-800'
    },
    {
      id: 4,
      title: 'Master Service Agreement (MSA) - Vendor B',
      status: 'Active',
      createdDate: '2024-01-05',
      comments: 'Fully executed and active. Regular performance reviews scheduled.',
      statusColor: 'bg-blue-100 text-blue-800'
    },
    {
      id: 5,
      title: 'Consulting Contract for Marketing Strategy',
      status: 'Cancelled',
      createdDate: '2024-01-20',
      comments: 'Project put on hold due to budget realignment.',
      statusColor: 'bg-red-100 text-red-800'
    },
    {
      id: 6,
      title: 'Equipment Lease Agreement - Office Expansion',
      status: 'Pending',
      createdDate: '2024-02-10',
      comments: 'Quotes received from three suppliers.',
      statusColor: 'bg-pink-100 text-pink-800'
    },
    {
      id: 7,
      title: 'Employee Onboarding Agreement - New Hire C',
      status: 'Active',
      createdDate: '2024-02-28',
      comments: 'Onboarding complete for New Hire C.',
      statusColor: 'bg-blue-100 text-blue-800'
    }
  ]

  const filters = ['All', 'Active', 'Pending', 'Draft', 'Cancelled']

  const handleViewDetails = (templateId: number) => {
    console.log('Viewing details for template:', templateId)
  }

  return (
    <div className='space-y-6 bg-gray-50 p-6'>
      {/* Header Section */}
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold text-gray-800'>All Contracts</h1>
        <div className='relative'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' size={20} />
          <input
            type='text'
            placeholder='Search contracts...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          />
        </div>
      </div>

      {/* Filter Tabs */}
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

      {/* Contracts Table */}
      <div className='bg-white rounded-xl shadow-sm border border-gray-100'>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Contract Title
                </th>
                <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Status
                </th>
                <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Created Date
                </th>
                <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Comments
                </th>
                <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {templates
                .filter((template) => activeFilter === 'All' || template.status === activeFilter)
                .filter(
                  (template) =>
                    search === '' ||
                    template.title.toLowerCase().includes(search.toLowerCase())
                )
                .map((template) => (
                  <tr key={template.id} className='hover:bg-gray-50'>
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-center'>
                      {template.title}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-center'>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${template.statusColor}`}>
                        {template.status}
                      </span>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center'>{template.createdDate}</td>
                    <td className='px-6 py-4 text-sm text-gray-900 max-w-md truncate text-center'>{template.comments}</td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-center'>
                      <button
                        onClick={() => handleViewDetails(template.id)}
                        className='bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1 mx-auto'
                      >
                        <Eye size={14} />
                        <span>View Details</span>
                      </button>
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
            <button className='px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors'>3</button>
            <button className='px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors'>Next</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AllContracts