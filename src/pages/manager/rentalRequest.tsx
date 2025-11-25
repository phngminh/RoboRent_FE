import { Eye, Search } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { getAllRequests, type RentalRequestResponse } from '../../apis/rentalRequest.api'

const RentalRequestsContent: React.FC = () => {
  const [allRentals, setAllRentals] = useState<RentalRequestResponse[]>([])
  const [filteredRentals, setFilteredRentals] = useState<RentalRequestResponse[]>([])
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState('All Status')
  const [appliedStatus, setAppliedStatus] = useState('All Status')
  const [dateFrom, setDateFrom] = useState('')
  const [appliedDateFrom, setAppliedDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [appliedDateTo, setAppliedDateTo] = useState('')

  const perPage = 5
  const totalPages = Math.ceil(filteredRentals.length / perPage)

  const fetchData = async () => {
    try {
      setLoading(true)
      const data = await getAllRequests()
      setAllRentals(data)
    } catch (err) {
      console.error('Failed to load rental requests', err)
    } finally {
      setLoading(false)
    }
  }

  const filterData = () => {
    let filtered = [...allRentals]

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

    filtered.sort((a, b) => a.id - b.id)

    setFilteredRentals(filtered)
    setPage(1)
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    filterData()
  }, [allRentals, search, appliedStatus, appliedDateFrom, appliedDateTo])

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
    setPage(1)
  }

  const handleNext = () => {
    if (page < totalPages) setPage(page + 1)
  }

  const handlePrev = () => {
    if (page > 1) setPage(page - 1)
  }

  const handlePageSelect = (num: number) => {
    setPage(num)
  }

  const handleView = (rentalId: number) => {
    console.log('Viewing rental request:', rentalId)
  }

  const paginatedRentals = filteredRentals.slice((page - 1) * perPage, page * perPage)

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
              className='flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors'
            >
              Apply Filters
            </button>

            <button
              onClick={clearFilters}
              className='bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors'
            >
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
              placeholder='Enter event name...'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className='w-full pl-10 pr-4 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className='bg-white rounded-xl shadow-sm border border-gray-300'>
        <div className='p-6 border-b border-gray-100'>
          <h2 className='text-xl font-semibold text-gray-800'>All Rental Requests</h2>
        </div>

        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>Request ID</th>
                <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>Event Name</th>
                <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>Status</th>
                <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>Event Activity</th>
                <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>Activity Type</th>
                <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>Event Date</th>
                <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>Created Date</th>
                <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>Actions</th>
              </tr>
            </thead>

            <tbody className='bg-white divide-y divide-gray-200'>
              {loading ? (
                <tr>
                  <td colSpan={8} className='text-center py-6 text-gray-500 text-sm'>
                    Loading...
                  </td>
                </tr>
              ) : paginatedRentals.length === 0 ? (
                <tr>
                  <td colSpan={8} className='text-center py-6 text-gray-500 text-sm'>
                    No rental requests found.
                  </td>
                </tr>
              ) : (
                paginatedRentals.map((request: RentalRequestResponse) => {
                  const eventDate = request.eventDate
                    ? new Date(request.eventDate).toLocaleDateString()
                    : '—'

                  const createdDate = request.createdDate
                    ? new Date(request.createdDate).toLocaleDateString()
                    : '—'

                  return (
                    <tr key={request.id} className='hover:bg-gray-50'>
                      <td className='px-6 py-4 text-sm text-gray-900 text-center'>{request.id}</td>
                      <td className='px-6 py-4 text-sm text-gray-900 text-center'>{request.eventName}</td>
                      <td className='px-6 py-4 text-sm text-center'>
                        <div className='flex items-center justify-center space-x-2'>
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              request.status === 'Received'
                                ? 'bg-green-100 text-green-800'
                                : request.status === 'Pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : request.status === 'Canceled'
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
                        {eventDate}
                      </td>
                      <td className='px-6 py-4 text-sm text-gray-900 text-center'>
                        {createdDate}
                      </td>
                      <td className='px-6 py-4 text-sm text-center'>
                        <div className='flex justify-center space-x-2'>
                          <button
                            onClick={() => handleView(request.id)}
                            className='text-gray-600 hover:text-gray-800 flex items-center space-x-1'
                          >
                            <Eye size={14} />
                            <span>View</span>
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