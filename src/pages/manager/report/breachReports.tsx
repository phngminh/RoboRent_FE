import React, { useState } from 'react'
import { Eye, Search } from 'lucide-react'
import ReportDetail from './reportDetail'

const BreachReports: React.FC = () => {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All Statuses')
  const [categoryFilter, setCategoryFilter] = useState('All Categories')
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null)

  const reports = [
    {
      id: 'BREACH-001',
      contractId: 'CONT-2023-005',
      reporterRole: 'Legal Counsel',
      accusedRole: 'Vendor A',
      category: 'Financial',
      status: 'Pending',
      createdAt: '2024-03-10',
      statusColor: 'bg-orange-100 text-orange-800'
    },
    {
      id: 'BREACH-002',
      contractId: 'CONT-2023-012',
      reporterRole: 'Project Manager',
      accusedRole: 'Contractor B',
      category: 'Service Level',
      status: 'Under Review',
      createdAt: '2024-03-08',
      statusColor: 'bg-blue-100 text-blue-800'
    },
    {
      id: 'BREACH-003',
      contractId: 'CONT-2023-018',
      reporterRole: 'Compliance Officer',
      accusedRole: 'Partner C',
      category: 'Compliance',
      status: 'Resolved',
      createdAt: '2024-03-05',
      statusColor: 'bg-green-100 text-green-800'
    },
    {
      id: 'BREACH-004',
      contractId: 'CONT-2023-021',
      reporterRole: 'Product Lead',
      accusedRole: 'Developer D',
      category: 'Intellectual Property',
      status: 'Pending',
      createdAt: '2024-03-01',
      statusColor: 'bg-orange-100 text-orange-800'
    },
    {
      id: 'BREACH-005',
      contractId: 'CONT-2023-009',
      reporterRole: 'Operations Manager',
      accusedRole: 'Supplier E',
      category: 'Service Level',
      status: 'Under Review',
      createdAt: '2024-02-28',
      statusColor: 'bg-blue-100 text-blue-800'
    }
  ]

  const statuses = ['All Statuses', 'Pending', 'Under Review', 'Resolved', 'Rejected']
  const categories = ['All Categories', 'Financial', 'Service Level', 'Compliance', 'Intellectual Property']

  const handleViewDetail = (reportId: string) => {
    setSelectedReportId(reportId)
  }

  const handleBack = () => {
    setSelectedReportId(null)
  }

  // Show report detail if a report is selected
  if (selectedReportId) {
    return <ReportDetail reportId={selectedReportId} onBack={handleBack} />
  }

  return (
    <div className='space-y-6 bg-gray-50 p-6'>
      {/* Filter Reports Section */}
      <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-100'>
        <h2 className='text-lg font-semibold text-gray-800 mb-4'>Filter Reports</h2>
        
        <div className='flex flex-col md:flex-row gap-4'>
          <div className='flex-1 relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' size={20} />
            <input
              type='text'
              placeholder='Search by Report ID, Contract ID...'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className='px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className='px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Report List Section */}
      <div className='bg-white rounded-xl shadow-sm border border-gray-100'>
        <div className='p-6 border-b border-gray-100'>
          <h2 className='text-xl font-semibold text-gray-800'>Report List</h2>
          <p className='text-gray-600 mt-1'>Overview of all breach of contract reports.</p>
        </div>
        
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Report ID
                </th>
                <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Contract ID
                </th>
                <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Reporter Role
                </th>
                <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Accused Role
                </th>
                <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Category
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
              {reports.map((report) => (
                <tr key={report.id} className='hover:bg-gray-50'>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-center'>
                    {report.id}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center'>{report.contractId}</td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center'>{report.reporterRole}</td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center'>{report.accusedRole}</td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center'>{report.category}</td>
                  <td className='px-6 py-4 whitespace-nowrap text-center'>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${report.statusColor}`}>
                      {report.status}
                    </span>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center'>{report.createdAt}</td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-center'>
                    <button
                      onClick={() => handleViewDetail(report.id)}
                      className='bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1 mx-auto'
                    >
                      <Eye size={14} />
                      <span>View Detail</span>
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
            <button className='px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors'>
              Next
            </button>
          </div>
          <span className='text-sm text-gray-600'>Page 1 of 1</span>
        </div>
      </div>
    </div>
  )
}

export default BreachReports