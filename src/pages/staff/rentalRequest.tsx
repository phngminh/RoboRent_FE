import { Clock, CheckCircle, XCircle, Eye, MessageCircle, Circle, Send } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { customerSendRentalAsync, getRentalByAccountIdAsync } from '../../apis/rental.customer.api'

interface RentalRequestsContentProps {
  onCreate: () => void
  onView: (rentalId: number) => void
}

const RentalRequestsContent: React.FC<RentalRequestsContentProps> = ({ onCreate, onView }) => {
  const [items, setItems] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const [pageSize] = useState(5)
  const [totalCount, setTotalCount] = useState(0)
  const totalPages = totalCount
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState<number | null>(null)

  const customerId = 1

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await getRentalByAccountIdAsync(customerId, page, pageSize, search)
      setItems(res.items)
      setTotalCount(res.totalCount)
    } catch (err) {
      console.error('Failed to load rental requests', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [page])

  const handleNext = () => {
    if (page < totalPages) setPage(page + 1)
  }

  const handlePrev = () => {
    if (page > 1) setPage(page - 1)
  }

  const handlePageSelect = (num: number) => {
    setPage(num)
  }

  const handleSend = async (rentalId: number) => {
    try {
      setSending(rentalId)
      await customerSendRentalAsync(rentalId)
      alert(`Rental ${rentalId} sent successfully! ✅`)
      await fetchData()
    } catch (err) {
      console.error('Error sending rental:', err)
      alert(`Failed to send rental ${rentalId}.`)
    } finally {
      setSending(null)
    }
  }

  return (
    <div className='space-y-6 bg-gray-50 p-6'>
      {/* Filter Section */}
      <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-100'>
        <h2 className='text-lg font-semibold text-gray-800 mb-4 text-center'>Filter Requests</h2>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4'>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option>All Status</option>
              <option>Pending</option>
              <option>Draft</option>
              <option>Canceled</option>
              <option>Received</option>
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

        <label className='block text-sm font-medium text-gray-700 mb-1'>Search by Event Name</label>
        <div className='flex gap-3 mb-4'>
          <input
            type='text'
            placeholder='Enter event name...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          />
          <button
            onClick={() => {
              setPage(1)
              fetchData()
            }}
            className='w-40 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors'
          >
            Search
          </button>
        </div>

        <div>
          <button
            onClick={onCreate}
            className='w-full md:w-40 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors'
          >
            + Create
          </button>
        </div>
      </div>

      {/* Table */}
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
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Event</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Status</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Event Activity</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Activity Type</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Created Date</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Actions</th>
              </tr>
            </thead>

            <tbody className='bg-white divide-y divide-gray-200'>
              {loading ? (
                <tr>
                  <td colSpan={7} className='text-center py-6 text-gray-500 text-sm'>
                    Loading...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} className='text-center py-6 text-gray-500 text-sm'>
                    No rental requests found.
                  </td>
                </tr>
              ) : (
                items.map((request: any) => {
                  const StatusIcon =
                    request.status === 'Received'
                      ? CheckCircle
                      : request.status === 'Pending'
                      ? Clock
                      : request.status === 'Canceled'
                      ? XCircle
                      : Circle

                  return (
                    <tr key={request.id} className='hover:bg-gray-50'>
                      <td className='px-6 py-4 text-sm text-gray-900'>{request.id}</td>
                      <td className='px-6 py-4 text-sm text-gray-900'>{request.eventName}</td>
                      <td className='px-6 py-4 text-sm'>
                        <div className='flex items-center space-x-2'>
                          <StatusIcon size={16} />
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              request.status === 'Approved'
                                ? 'bg-green-100 text-green-800'
                                : request.status === 'Pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : request.status === 'Rejected'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {request.status}
                          </span>
                        </div>
                      </td>
                      <td className='px-6 py-4 text-sm text-gray-900'>{request.eventActivityName}</td>
                      <td className='px-6 py-4 text-sm text-gray-900'>{request.activityTypeName}</td>
                      <td className='px-6 py-4 text-sm text-gray-900'>
                        {new Date(request.createdDate).toLocaleDateString()}
                      </td>
                      <td className='px-6 py-4 text-sm'>
                        <div className='flex space-x-2'>
                          <button
                            onClick={() => onView(request.id)}
                            className='text-gray-600 hover:text-gray-800 flex items-center space-x-1'
                          >
                            <Eye size={14} />
                            <span>View</span>
                          </button>

                          <button className='text-gray-600 hover:text-gray-800 flex items-center space-x-1'>
                            <MessageCircle size={14} />
                            <span>Chat</span>
                          </button>

                          <button
                            onClick={() => handleSend(request.id)}
                            disabled={sending === request.id}
                            className={`px-3 py-1 rounded-lg flex items-center space-x-1 transition-colors ${
                              sending === request.id
                                ? 'bg-gray-400 text-white cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                          >
                            <Send size={14} />
                            <span>{sending === request.id ? 'Sending...' : 'Send'}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className='px-6 py-4 border-t border-gray-100 flex items-center justify-between'>
          <div className='flex space-x-2'>
            <button
              disabled={page === 1}
              onClick={handlePrev}
              className={`px-3 py-1 text-sm ${
                page === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Previous
            </button>

            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => handlePageSelect(i + 1)}
                className={`px-3 py-1 text-sm rounded ${
                  page === i + 1 ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              disabled={page === totalPages}
              onClick={handleNext}
              className={`px-3 py-1 text-sm ${
                page === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RentalRequestsContent