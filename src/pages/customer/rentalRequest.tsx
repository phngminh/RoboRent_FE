import React, { useEffect, useState } from 'react'
import { Clock, CheckCircle, XCircle, Eye, MessageCircle } from 'lucide-react'
import { getRequestByCustomer, type RentalRequestResponse } from '../../apis/rentalRequest.api'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

const RentalRequestsContent: React.FC = () => {
  const [rentals, setRentals] = useState<RentalRequestResponse[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    const getAllRequests = async () => {
      try {
        const data = await getRequestByCustomer(user.accountId)
        console.log('Fetched rentals:', data)
        setRentals(data)
      } catch (error) {
        console.error('Error fetching rentals:', error)
      }
    }
    getAllRequests()
  }, [user?.accountId])

  const statusConfig: Record<string, { badge: string; Icon: React.ComponentType<{ size?: number }> }> = {
    Pending: { badge: 'bg-yellow-100 text-yellow-800', Icon: Clock },
    Accepted: { badge: 'bg-green-100 text-green-800', Icon: CheckCircle },
    AcceptedDemo: { badge: 'bg-green-100 text-green-800', Icon: CheckCircle },
    Draft: { badge: 'bg-gray-100 text-gray-800', Icon: Clock },
    Rejected: { badge: 'bg-red-100 text-red-800', Icon: XCircle },
    Completed: { badge: 'bg-blue-100 text-blue-800', Icon: CheckCircle }
  }

  const pageSize = 5
  const totalPages = Math.max(1, Math.ceil(rentals.length / pageSize))
  const paginatedRentals = rentals.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  useEffect(() => {
    const newTotalPages = Math.max(1, Math.ceil(rentals.length / pageSize))
    if (currentPage > newTotalPages) {
      setCurrentPage(newTotalPages)
    }
    if (rentals.length === 0 && currentPage !== 1) {
      setCurrentPage(1)
    }
  }, [rentals.length, currentPage])

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)
  }

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

      <div className='bg-white rounded-xl shadow-sm border border-gray-100'>
        <div className='p-6 border-b border-gray-100'>
          <h2 className='text-xl font-semibold text-gray-800'>All Rental Requests</h2>
          <p className='text-gray-600 mt-1'>Manage your rental requests and track their status.</p>
        </div>
        
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>Request ID</th>
                <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>Event Name</th>
                {/* <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>Description</th> */}
                <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>Address</th>
                <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>Status</th>
                <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>Event Date</th>
                <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>Created Date</th>
                <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>Actions</th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {paginatedRentals.map((request) => {
                const { badge, Icon } = statusConfig[request.status] ?? {
                  badge: 'bg-gray-100 text-gray-800',
                  Icon: Clock
                }

                const eventDate = request.eventDate
                  ? new Date(request.eventDate).toLocaleDateString()
                  : '—'

                const createdDate = request.createdDate
                  ? new Date(request.createdDate).toLocaleDateString()
                  : '—'

                return (
                  <tr key={request.id ?? request.accountId} className='hover:bg-gray-50'>
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-center'>{request.id}</td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center'>
                      {request.eventName ?? '—'}
                    </td>
                    {/* <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center'>{request.description ?? '—'}</td> */}
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center'>{request.address ?? '—'}</td>
                    <td className='px-6 py-4 whitespace-nowrap text-center'>
                      <div className='flex items-center justify-center space-x-2'>
                        <Icon size={16} />
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${badge}`}>
                          {request.status}
                        </span>
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center'>{eventDate}</td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center'>{createdDate}</td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-center'>
                      <div className='flex justify-center space-x-2'>
                        <button className='text-gray-600 hover:text-gray-800 transition-colors flex items-center space-x-1'>
                          <Eye size={14} />
                          <span>View</span>
                        </button>
                        <button
                          onClick={() => navigate(`/customer/chat/${request.id}`)}
                          className='text-gray-600 hover:text-gray-800 transition-colors flex items-center space-x-1'
                        >
                          <MessageCircle size={14} />
                          <span>Chat</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className='px-6 py-4 border-t border-gray-100 flex items-center justify-between'>
          <div className='flex space-x-2'>
            <button
              className='px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, index) => {
              const pageNumber = index + 1
              const isActive = pageNumber === currentPage
              return (
                <button
                  key={pageNumber}
                  onClick={() => handlePageChange(pageNumber)}
                  className={`px-3 py-1 text-sm rounded ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-gray-800 transition-colors'
                  }`}
                >
                  {pageNumber}
                </button>
              )
            })}
            <button
              className='px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || rentals.length === 0}
            >
              Next
            </button>
          </div>
          <div className='text-sm text-gray-500'>
            Showing {paginatedRentals.length} of {rentals.length} request{rentals.length === 1 ? '' : 's'}
          </div>
        </div>
      </div>
    </div>
  )
}

export default RentalRequestsContent