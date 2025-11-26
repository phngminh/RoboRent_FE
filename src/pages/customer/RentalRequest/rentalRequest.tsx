import React, { useEffect, useState } from 'react'
import { Eye, MessageCircle, Plus, Search } from 'lucide-react'
import { getRequestByCustomer, type RentalRequestResponse } from '../../../apis/rentalRequest.api'
import { useAuth } from '../../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import path from '../../../constants/path'
import { customerCancelRentalAsync, customerDeleteRentalAsync, customerSendRentalAsync } from '../../../apis/rental.customer.api'
import { getRentalDetailsByRentalIdAsync } from '../../../apis/rentaldetail.api'

interface RentalRequestsContentProps {
  onCreate: () => void
  onView: (rentalId: number) => void
  onDetaild: (rentalId: number) => void
}

const RentalRequestsContent: React.FC<RentalRequestsContentProps> = ({ onCreate, onView, onDetaild }) => {
  const [allRentals, setAllRentals] = useState<RentalRequestResponse[]>([])
  const [filteredRentals, setFilteredRentals] = useState<RentalRequestResponse[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState('All Status')
  const [appliedStatus, setAppliedStatus] = useState('All Status')
  const [dateFrom, setDateFrom] = useState('')
  const [appliedDateFrom, setAppliedDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [appliedDateTo, setAppliedDateTo] = useState('')
  const navigate = useNavigate()
  const { user } = useAuth()
  const [viewMode, setViewMode] = useState<"all" | "cancelled">("all");
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmCallback, setConfirmCallback] = useState<() => void>(() => {});
  const [confirmLabel, setConfirmLabel] = useState("Confirm");
  const [detailsMap, setDetailsMap] = useState<Record<number, number>>({});


const isRecentlyCreated = (createdDate: string) => {
  const now = new Date();
  const created = new Date(createdDate);
  const diff = (now.getTime() - created.getTime()) / 1000; // seconds
  return diff < 300; // 5 minutes
};

  const pageSize = 5
  const totalPages = Math.max(1, Math.ceil(filteredRentals.length / pageSize))
  const paginatedRentals = filteredRentals.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const fetchData = async () => {
    try {
      setLoading(true)
      const data = await getRequestByCustomer(user.accountId)
      console.log('Fetched rentals:', data)
      setAllRentals(data)
      // Load detail count for each rental
const detailCounts: Record<number, number> = {};

for (const r of data) {
  try {
    const details = await getRentalDetailsByRentalIdAsync(r.id);
    detailCounts[r.id] = details?.data?.length ?? 0;
  } catch {
    detailCounts[r.id] = 0;
  }
}

setDetailsMap(detailCounts);

    } catch (error) {
      console.error('Error fetching rentals:', error)
    } finally {
      setLoading(false)
    }
  }

const handleCancelDraft = (rentalId: number) => {
  setConfirmLabel("Cancel");
  setConfirmCallback(() => async () => {
    try {
      setLoading(true);
      await customerCancelRentalAsync(rentalId);
      await fetchData();
    } catch (err) {
      console.error("Cancel draft failed:", err);
      alert("Failed to cancel draft.");
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  });
  setShowConfirm(true);
};

const handleDeleteRental = (rentalId: number) => {
  setConfirmLabel("Delete");
  setConfirmCallback(() => async () => {
    try {
      setLoading(true);
      await customerDeleteRentalAsync(rentalId);
      await fetchData();
    } catch (err) {
      console.error("Delete rental failed:", err);
      alert("Failed to delete rental.");
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  });
  setShowConfirm(true);
};

const handleSendRequest = (rentalId: number) => {
  setConfirmLabel("Send");
  setConfirmCallback(() => async () => {
    try {
      setLoading(true);

      // Send to manager
      await customerSendRentalAsync(rentalId);

      // Refresh list
      await fetchData();
    } catch (err: any) {
      console.error("Error sending rental:", err);
      alert(err?.response?.data?.message || "Failed to send rental");
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  });

  setShowConfirm(true);
};

  const filterData = () => {
    let filtered = [...allRentals]

    if (viewMode === "cancelled") {
  filtered = filtered.filter(r => r.status === "Cancelled");
} else {
  filtered = filtered.filter(r => r.status !== "Cancelled");
}

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

    setFilteredRentals(filtered)
    setCurrentPage(1)
  }

  useEffect(() => {
    if (user?.accountId) {
      fetchData()
    }
  }, [user?.accountId])

  useEffect(() => {
    filterData()
  }, [allRentals, search, appliedStatus, appliedDateFrom, appliedDateTo, viewMode])

  useEffect(() => {
    const newTotalPages = Math.max(1, Math.ceil(filteredRentals.length / pageSize))
    if (currentPage > newTotalPages) {
      setCurrentPage(newTotalPages)
    }
    if (filteredRentals.length === 0 && currentPage !== 1) {
      setCurrentPage(1)
    }
  }, [filteredRentals.length, currentPage])

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

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)
  }

  return (
    <div className='space-y-6 bg-gray-50 p-6'>
      {/* Filter Section */}
      <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-100'>
        <h2 className='text-lg font-semibold text-gray-800 mb-4 text-center'>Filter Requests</h2>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Status</label>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'>
              <option>All Status</option>
              <option>Pending</option>
              <option>AcceptedDemo</option>
              <option>Draft</option>
              <option>Rejected</option>
              <option>Completed</option>
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
              className='w-full pl-10 pr-4 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            />
          </div>
        </div>
      </div>

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
          <div className="flex justify-end gap-3 mb-4 pr-6">
  <button
    onClick={() => setViewMode("all")}
    className={`px-4 py-2 rounded-lg text-sm font-medium ${
      viewMode === "all" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
    }`}
  >
    All Requests
  </button>

  <button
    onClick={() => setViewMode("cancelled")}
    className={`px-4 py-2 rounded-lg text-sm font-medium ${
      viewMode === "cancelled" ? "bg-red-600 text-white" : "bg-gray-200 text-gray-700"
    }`}
  >
    Cancelled
  </button>
</div>

          <table className='w-full'>
            <thead className='bg-gray-50'>
              <tr>
                <th className="w-6"></th>
                <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>Event Name</th>
                <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>Address</th>
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
                paginatedRentals.map((request) => {
                  const badgeClass =
                    (request.status === 'Accepted' || request.status === 'AcceptedDemo')
                      ? 'bg-green-100 text-green-800'
                      : request.status === 'Completed'
                      ? 'bg-blue-100 text-blue-800'
                      : request.status === 'Pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : request.status === 'Draft'
                      ? 'bg-gray-100 text-gray-800'
                      : request.status === 'Rejected'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-blue-100 text-blue-800'

                  const eventDate = request.eventDate
                    ? new Date(request.eventDate).toLocaleDateString()
                    : '—'

                  const createdDate = request.createdDate
                    ? new Date(request.createdDate).toLocaleDateString()
                    : '—'

                  return (
<tr key={request.id ?? request.accountId} className="hover:bg-gray-50">
  <td className="px-4 py-4 text-center w-6">
{isRecentlyCreated(request.createdDate) && request.status !== "Cancelled" && (
<span className="inline-block h-2.5 w-2.5 rounded-full bg-[#48d368] shadow-[0_0_4px_1px_rgba(72,211,104,0.7)]"></span>
    )}
  </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center'>
                        {request.eventName ?? '—'}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center'>{request.address ?? '—'}</td>
                      <td className='px-6 py-4 whitespace-nowrap text-center'>
                        <div className='flex items-center justify-center space-x-2'>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${badgeClass}`}>
                            {request.status}
                          </span>
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center'>{request.eventActivityName}</td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center'>{request.activityTypeName}</td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center'>{eventDate}</td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center'>{createdDate}</td>
<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
  <div className="flex justify-center space-x-6 min-w-[200px]">

{/* View / Detail button with new status logic */}
<button
  onClick={() => {
    if (request.status !== "Draft") {
      onDetaild(request.id);     // Detail mode
    } else {
      onView(request.id);        // View mode
    }
  }}
  className="text-gray-600 hover:text-gray-800 transition-colors flex items-center space-x-1"
>
  <Eye size={14} />

  <span>
    {request.status !== "Draft"
      ? "Detail"
      : "View"}
  </span>
</button>

{/* Chat — only show when NOT Draft or Pending */}
{request.status !== "Draft" && request.status !== "Pending" && (
  <button
    onClick={() =>
      navigate(path.CUSTOMER_CHAT.replace(":rentalId", String(request.id)))
    }
    className="text-gray-600 hover:text-gray-800 transition-colors flex items-center space-x-1"
  >
    <MessageCircle size={14} />
    <span>Chat</span>
  </button>
)}


{/* Send — always allow clicking, but validate detail count */}
{request.status === "Draft" && (
  <button
    onClick={() => {
      if (detailsMap[request.id] === 0) {
        // Show warning dialog, not the send dialog
        setConfirmLabel("MissingDetails");
        setShowConfirm(true);
      } else {
        handleSendRequest(request.id);
      }
    }}
    className="text-gray-600 hover:text-gray-800 transition-colors flex items-center space-x-1"
  >
    📤
    <span>Send</span>
  </button>
)}



    {/* Cancel — only Draft */}
    {request.status === "Draft" && (
      <button
        onClick={() => handleCancelDraft(request.id)}
        className="text-red-600 hover:text-red-800 transition-colors flex items-center space-x-1"
      >
        ❌
        <span>Cancel</span>
      </button>
    )}
    {/* Delete — only Cancelled */}
{request.status === "Cancelled" && (
  <button
    onClick={() => handleDeleteRental(request.id)}
    className="text-red-600 hover:text-red-800 transition-colors flex items-center space-x-1"
  >
    🗑️
    <span>Delete</span>
  </button>
)}


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
              disabled={currentPage === totalPages || filteredRentals.length === 0}
            >
              Next
            </button>
          </div>
          <div className='text-sm text-gray-500'>
            Showing {paginatedRentals.length} of {filteredRentals.length} request{filteredRentals.length === 1 ? '' : 's'}
          </div>
        </div>
      </div>
      {/* Custom Confirm Dialog */}
{showConfirm && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl shadow-lg p-6 w-[90%] max-w-md">

      <h2 className="text-lg font-semibold text-gray-800 text-center mb-3">
        Confirm Action
      </h2>

      <p className="text-gray-600 text-center mb-6">
        {confirmLabel === "Delete"
          ? "Are you sure you want to delete this cancelled request?"
          : confirmLabel === "Send"
          ? "Once sent, this request cannot be edited while it is pending."
          : confirmLabel === "MissingDetails"
          ? "You have not made your robot customization yet."
          : "Are you sure you want to cancel this draft request?"}
      </p>

      {/* Buttons */}
      <div className="flex justify-center space-x-4">

        {/* Only OK button when MissingDetails */}
        {confirmLabel === "MissingDetails" ? (
          <button
            onClick={() => setShowConfirm(false)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            OK
          </button>
        ) : (
          <>
            {/* YES button */}
            <button
              onClick={confirmCallback}
              className={
                confirmLabel === "Send"
                  ? "px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  : "px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              }
            >
              Yes, {confirmLabel}
            </button>

            {/* NO button */}
            <button
              onClick={() => setShowConfirm(false)}
              className="px-5 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
            >
              No
            </button>
          </>
        )}

      </div>

    </div>
  </div>
)}
    </div>
    
)}

export default RentalRequestsContent