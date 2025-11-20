import { Eye, MessageCircle, Send, Search, Plus } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { customerSendRentalAsync, getRentalByAccountIdAsync } from '../../apis/rental.customer.api'
import { useNavigate } from 'react-router-dom'
import path from '../../constants/path'

interface RentalRequestsContentProps {
  onCreate: () => void
  onView: (rentalId: number) => void
}

const RentalRequestsContent: React.FC<RentalRequestsContentProps> = ({ onCreate, onView }) => {
  const [allItems, setAllItems] = useState<any[]>([])
  const [filteredItems, setFilteredItems] = useState<any[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(5)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState('All Status')
  const [appliedStatus, setAppliedStatus] = useState('All Status')
  const [dateFrom, setDateFrom] = useState('')
  const [appliedDateFrom, setAppliedDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [appliedDateTo, setAppliedDateTo] = useState('')
  const [sending, setSending] = useState<number | null>(null)
  const navigate = useNavigate()

  const customerId = 1

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await getRentalByAccountIdAsync(customerId, 1, 500, '')
      setAllItems(res.items)
    } catch (err) {
      console.error('Failed to load rental requests', err)
    } finally {
      setLoading(false)
    }
  }

  const filterData = () => {
    let filtered = [...allItems]

    if (appliedStatus !== 'All Status') {
      filtered = filtered.filter((r) => r.status === appliedStatus)
    }

    if (appliedDateFrom) {
      const fromDate = new Date(appliedDateFrom)
      filtered = filtered.filter((r) => new Date(r.createdDate) >= fromDate)
    }

    if (appliedDateTo) {
      const toDate = new Date(appliedDateTo)
      toDate.setHours(23, 59, 59, 999)
      filtered = filtered.filter((r) => new Date(r.createdDate) <= toDate)
    }

    if (search.trim()) {
      filtered = filtered.filter((r) =>
        r.eventName?.toLowerCase().includes(search.toLowerCase().trim())
      )
    }
    setFilteredItems(filtered)
    setCurrentPage(1)
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    filterData()
  }, [allItems, search, appliedStatus, appliedDateFrom, appliedDateTo])

  useEffect(() => {
    const newTotalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize))
    if (currentPage > newTotalPages) {
      setCurrentPage(newTotalPages)
    }
    if (filteredItems.length === 0 && currentPage !== 1) {
      setCurrentPage(1)
    }
  }, [filteredItems.length, currentPage])

  const applyFilters = () => {
    setAppliedStatus(statusFilter)
    setAppliedDateFrom(dateFrom)
    setAppliedDateTo(dateTo)
  }

  const clearFilters = () => {
    setSearch('')
    setStatusFilter('All Status')
    setAppliedStatus('All Status')
    setDateFrom('')
    setAppliedDateFrom('')
    setDateTo('')
    setAppliedDateTo('')
    setCurrentPage(1)
  }

  const handleNext = () => {
    const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize))
    if (currentPage < totalPages) setCurrentPage(currentPage + 1)
  }

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1)
  }

  const handlePageSelect = (num: number) => {
    const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize))
    if (num >= 1 && num <= totalPages) {
      setCurrentPage(num)
    }
  }

  const paginatedItems = filteredItems.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize))

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
      <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-100'>
        <h2 className='text-lg font-semibold text-gray-800 mb-4 text-center'>Filter Requests</h2>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Event Status</label>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            >
              <option>All Status</option>
              <option>Pending</option>
              <option>Draft</option>
              <option>Canceled</option>
              <option>Received</option>
            </select>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Created Date From</label>
            <input
              type='date'
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Created Date To</label>
            <input
              type='date'
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            />
          </div>

          <div className='flex items-end space-x-2'>
            <button 
              onClick={applyFilters}
              className='flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors'>
              Apply Filters
            </button>
            <button 
              onClick={clearFilters}
              className='bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors'>
              Clear
            </button>
          </div>
        </div>

        <label className='block text-sm font-medium text-gray-700 mb-1'>Search by Event Name</label>
        <div className='flex gap-3 mb-4'>
          <div className='relative flex-1'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-500' size={18} />
            <input
              type='text'
              placeholder='Search by event name...'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className='bg-white rounded-xl shadow-sm border border-gray-100'>
        <div className='p-6 border-b border-gray-100 flex items-center justify-between gap-4'>
          <div className='flex flex-col items-center text-center flex-1 ml-32'>
            <h2 className='text-xl font-semibold text-gray-800'>All Rental Requests</h2>
            <p className='text-gray-600 mt-1'>Manage your rental requests and track their status.</p>
          </div>
          <button
            onClick={onCreate}
            className='bg-green-600 text-white px-4 py-1.5 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2'
          >
            <Plus size={18} />
            <span>Create</span>
          </button>
        </div>

        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>Request ID</th>
                <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>Event</th>
                <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>Status</th>
                <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>Event Activity</th>
                <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>Activity Type</th>
                <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>Created Date</th>
                <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>Actions</th>
              </tr>
            </thead>

            <tbody className='bg-white divide-y divide-gray-200'>
              {loading ? (
                <tr>
                  <td colSpan={7} className='text-center py-6 text-gray-500 text-sm'>
                    Loading...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className='text-center py-6 text-gray-500 text-sm'>
                    No rental requests found.
                  </td>
                </tr>
              ) : (
                paginatedItems.map((request: any) => {
                  return (
                    <tr key={request.id} className='hover:bg-gray-50'>
                      <td className='px-6 py-4 text-sm text-gray-900 text-center'>{request.id}</td>
                      <td className='px-6 py-4 text-sm text-gray-900 text-center'>{request.eventName}</td>
                      <td className='px-6 py-4 text-sm text-center'>
                        <div className='flex items-center justify-center space-x-2'>
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
                      <td className='px-6 py-4 text-sm text-gray-900 text-center'>{request.eventActivityName}</td>
                      <td className='px-6 py-4 text-sm text-gray-900 text-center'>{request.activityTypeName}</td>
                      <td className='px-6 py-4 text-sm text-gray-900 text-center'>
                        {new Date(request.createdDate).toLocaleDateString()}
                      </td>
                      <td className='px-6 py-4 text-sm text-center'>
                        <div className='flex justify-center space-x-2'>
                          <button
                            onClick={() => onView(request.id)}
                            className='text-gray-600 hover:text-gray-800 flex items-center space-x-1'
                          >
                            <Eye size={14} />
                            <span>View</span>
                          </button>

                          <button
                            onClick={() => navigate(path.STAFF_CHAT.replace(':rentalId', String(request.id)))}
                            className='text-gray-600 hover:text-gray-800 transition-colors flex items-center space-x-1'
                          >
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
              disabled={currentPage === 1}
              onClick={handlePrev}
              className={`px-3 py-1 text-sm ${
                currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Previous
            </button>

            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => handlePageSelect(i + 1)}
                className={`px-3 py-1 text-sm rounded ${
                  currentPage === i + 1 ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              disabled={currentPage === totalPages}
              onClick={handleNext}
              className={`px-3 py-1 text-sm ${
                currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Next
            </button>
          </div>
          <div className='text-sm text-gray-500'>
            Showing {paginatedItems.length} of {filteredItems.length} request{filteredItems.length === 1 ? '' : 's'}
          </div>
        </div>
      </div>
    </div>
  )
}

export default RentalRequestsContent