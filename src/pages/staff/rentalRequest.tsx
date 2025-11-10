import React from 'react'
import { Clock, CheckCircle, XCircle, Eye, Download, MessageCircle } from 'lucide-react'

const RentalRequestsContent: React.FC = () => {
  return (
    <div className='space-y-6 bg-gray-50 p-6'>
      <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-100'>
        <h2 className='text-lg font-semibold text-gray-800 mb-4'>Filter Requests</h2>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Status</label>
            <select className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'>
              <option>All Status</option>
              <option>Pending</option>
              <option>Approved</option>
              <option>Rejected</option>
              <option>Completed</option>
            </select>
          </div>
          
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Date From</label>
            <input 
              type='date'
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            />
          </div>
          
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Date To</label>
            <input 
              type='date'
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            />
          </div>
          
          <div className='flex items-end'>
            <button className='w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors'>
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className='bg-white rounded-xl shadow-sm border border-gray-100'>
        <div className='p-6 border-b border-gray-100'>
          <h2 className='text-xl font-semibold text-gray-800'>All Rental Requests</h2>
          <p className='text-gray-600 mt-1'>Manage your rental requests and track their status.</p>
        </div>
        
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Request ID</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Item</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Status</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Duration</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Amount</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Request Date</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Actions</th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {[
                { 
                  id: 'REQ001', 
                  item: 'Autonomous Delivery Drone', 
                  status: 'Approved', 
                  duration: '30 days',
                  amount: '$1,200', 
                  date: '2023-10-26',
                  statusColor: 'bg-green-100 text-green-800',
                  statusIcon: CheckCircle
                },
                { 
                  id: 'REQ002', 
                  item: 'Robotic Vacuum Cleaner', 
                  status: 'Pending', 
                  duration: '15 days',
                  amount: '$350', 
                  date: '2023-11-15',
                  statusColor: 'bg-yellow-100 text-yellow-800',
                  statusIcon: Clock
                },
                { 
                  id: 'REQ003', 
                  item: 'Automated Gardening System', 
                  status: 'Rejected', 
                  duration: '45 days',
                  amount: '$800', 
                  date: '2023-09-01',
                  statusColor: 'bg-red-100 text-red-800',
                  statusIcon: XCircle
                },
                { 
                  id: 'REQ004', 
                  item: 'Warehouse Inventory Robot', 
                  status: 'Completed', 
                  duration: '60 days',
                  amount: '$2,500', 
                  date: '2023-12-01',
                  statusColor: 'bg-blue-100 text-blue-800',
                  statusIcon: CheckCircle
                },
                { 
                  id: 'REQ005', 
                  item: 'Interactive Kiosk Robot', 
                  status: 'Approved', 
                  duration: '20 days',
                  amount: '$600', 
                  date: '2023-10-05',
                  statusColor: 'bg-green-100 text-green-800',
                  statusIcon: CheckCircle
                },
              ].map((request) => {
                const StatusIcon = request.statusIcon
                return (
                  <tr key={request.id} className='hover:bg-gray-50'>
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>{request.id}</td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>{request.item}</td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='flex items-center space-x-2'>
                        <StatusIcon size={16} />
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${request.statusColor}`}>
                          {request.status}
                        </span>
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>{request.duration}</td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>{request.amount}</td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>{request.date}</td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                      <div className='flex space-x-2'>
                        <button className='text-gray-600 hover:text-gray-800 transition-colors flex items-center space-x-1'>
                          <Eye size={14} />
                          <span>View</span>
                        </button>
                        <button className='text-gray-600 hover:text-gray-800 transition-colors flex items-center space-x-1'>
                          <MessageCircle size={14} />
                          <span>Chat</span>
                        </button>
                        <button className='bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1'>
                          <Download size={14} />
                          <span>Download</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className='px-6 py-4 border-t border-gray-100 flex items-center justify-between'>
          <div className='flex space-x-2'>
            <button className='px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors'>Previous</button>
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

export default RentalRequestsContent