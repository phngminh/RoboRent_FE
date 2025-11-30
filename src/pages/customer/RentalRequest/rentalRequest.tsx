import React, { useEffect, useState } from 'react'
import { Eye, MessageCircle, Plus, Search } from 'lucide-react'
import { Card, CardContent, CardHeader } from '../../../components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table'
import { Input } from '../../../components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import { Button } from '../../../components/ui/button'
import { getRequestByCustomer, type RentalRequestResponse } from '../../../apis/rentalRequest.api'
import { getDraftsByRentalId, type ContractDraftResponse } from '../../../apis/contractDraft.api'
import { useAuth } from '../../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import path from '../../../constants/path'
import { customerSendRentalAsync } from '../../../apis/rental.customer.api'

interface RentalRequestsContentProps {
  onViewContract: (rentalId: number) => void
  onCreate: () => void
  onView: (rentalId: number) => void
  onDetaild: (rentalId: number) => void
}

const RentalRequestsContent: React.FC<RentalRequestsContentProps> = ({
  onCreate,
  onViewContract,
  onView,
  onDetaild
}) => {
  const [allRentals, setAllRentals] = useState<RentalRequestResponse[]>([])
  const [filteredRentals, setFilteredRentals] = useState<RentalRequestResponse[]>([])
  const [draftsMap, setDraftsMap] = useState<Record<number, ContractDraftResponse[]>>({})
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

  const pageSize = 5
  const totalPages = Math.max(1, Math.ceil(filteredRentals.length / pageSize))
  const paginatedRentals = filteredRentals.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  // -------------------------------
  // FETCH RENTALS
  // -------------------------------
  const fetchData = async () => {
    try {
      setLoading(true)
      const data = await getRequestByCustomer(user.accountId)
      setAllRentals(data)
      setDraftsMap({})
    } catch (error) {
      console.error('Error fetching rentals:', error)
    } finally {
      setLoading(false)
    }
  }

  // -------------------------------
  // FETCH CONTRACT DRAFTS FOR EACH RENTAL
  // -------------------------------
  const fetchDraftsForRentals = async () => {
    for (const rental of allRentals.filter(r => !draftsMap[r.id!])) {
      try {
        const drafts = await getDraftsByRentalId(rental.id)
        setDraftsMap(prev => ({ ...prev, [rental.id]: drafts }))
      } catch (error) {
        console.error(`Error fetching drafts for ${rental.id}:`, error)
        setDraftsMap(prev => ({ ...prev, [rental.id]: [] }))
      }
    }
  }

  useEffect(() => {
    if (allRentals.length > 0) fetchDraftsForRentals()
  }, [allRentals])

  // -------------------------------
  // SEND RENTAL REQUEST
  // -------------------------------
  const handleSendRequest = async (rentalId: number) => {
    try {
      setLoading(true)
      await customerSendRentalAsync(rentalId)
      await fetchData()
    } catch (err: any) {
      console.error('Error sending rental:', err)
      alert(err?.response?.data?.message || 'Failed to send rental')
    } finally {
      setLoading(false)
    }
  }

  // -------------------------------
  // FILTERING LOGIC
  // -------------------------------
  const filterData = () => {
    let filtered = [...allRentals]

    if (appliedStatus !== 'All Status') {
      filtered = filtered.filter(r => r.status === appliedStatus)
    }

    if (appliedDateFrom) {
      const from = new Date(appliedDateFrom)
      filtered = filtered.filter(r => new Date(r.createdDate) >= from)
    }

    if (appliedDateTo) {
      const to = new Date(appliedDateTo)
      to.setHours(23, 59, 59, 999)
      filtered = filtered.filter(r => new Date(r.createdDate) <= to)
    }

    if (search.trim()) {
      filtered = filtered.filter(r =>
        r.eventName?.toLowerCase().includes(search.toLowerCase().trim())
      )
    }

    filtered.sort((a, b) => a.id - b.id)
    setFilteredRentals(filtered)
    setCurrentPage(1)
  }

  useEffect(() => {
    if (user?.accountId) fetchData()
  }, [user?.accountId])

  useEffect(() => {
    filterData()
  }, [allRentals, search, appliedStatus, appliedDateFrom, appliedDateTo])

  // -------------------------------
  // FILTER FORM APPLY & CLEAR
  // -------------------------------
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

  const statusOptions = ['All Status', 'Draft', 'Pending', 'Received', 'Rejected', 'Completed']

  // -------------------------------
  // UI
  // -------------------------------
  return (
    <div className='space-y-6 bg-gray-50 p-6'>
      {/* FILTER CARD */}
      <Card className='rounded-xl shadow-sm border border-gray-100'>
        <CardHeader className='pb-0'>
          <h2 className='text-lg font-semibold text-gray-800 text-center mb-3'>Filter Requests</h2>
        </CardHeader>

        <CardContent className='p-6 pt-0'>
          <div className='flex flex-col gap-4 md:flex-row md:items-end md:gap-4'>
            <div className='flex flex-1 md:gap-4'>
              {/* Status Filter */}
              <div className='w-full md:w-40'>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Status' />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(status => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date From */}
              <div className='w-full md:w-40'>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Created Date From</label>
                <Input type='date' value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
              </div>

              {/* Date To */}
              <div className='w-full md:w-40'>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Created Date To</label>
                <Input type='date' value={dateTo} onChange={e => setDateTo(e.target.value)} />
              </div>

              {/* Search */}
              <div className='flex-1'>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Search Event</label>
                <div className='relative'>
                  <Search className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-500' size={18} />
                  <Input
                    placeholder='Search by event name...'
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className='pl-10'
                  />
                </div>
              </div>
            </div>

            <div className='flex gap-2'>
              <Button onClick={applyFilters}>Apply</Button>
              <Button
                variant='outline'
                onClick={clearFilters}
                className='bg-gray-200 text-gray-700 hover:bg-gray-300'
              >
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* MAIN TABLE */}
      <Card className='rounded-xl shadow-sm border border-gray-300 relative'>
        <CardHeader className='p-6 border-b border-gray-100 relative'>
          <h2 className='text-xl font-semibold text-gray-800 text-center'>
            All Rental Requests
          </h2>
          <p className='text-gray-600 mt-1 text-center'>Manage your rental requests and track status.</p>

          <Button
            onClick={onCreate}
            className='absolute right-6 top-6 bg-green-600 hover:bg-green-700 text-white'
          >
            <Plus size={18} />
            <span className='ml-1'>Create</span>
          </Button>
        </CardHeader>

        <CardContent className='p-0'>
          <div className='overflow-x-auto'>
            <Table>
              <TableHeader className='bg-gray-50'>
                <TableRow>
                  <TableHead className='text-center'>Event Name</TableHead>
                  <TableHead className='text-center'>Address</TableHead>
                  <TableHead className='text-center'>Status</TableHead>
                  <TableHead className='text-center'>Event Activity</TableHead>
                  <TableHead className='text-center'>Activity Type</TableHead>
                  <TableHead className='text-center'>Event Date</TableHead>
                  <TableHead className='text-center'>Created Date</TableHead>
                  <TableHead className='text-center'>Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className='text-center py-6 text-gray-500'>
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : paginatedRentals.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className='text-center py-6 text-gray-500'>
                      No rental requests found.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedRentals.map(request => {
                    const badgeClass =
                      request.status === 'Accepted' || request.status === 'AcceptedDemo'
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

                    const drafts = draftsMap[request.id] ?? []
                    const hasDrafts = drafts.length > 0

                    return (
                      <TableRow key={request.id} className='hover:bg-gray-50'>
                        <TableCell className='text-center'>{request.eventName}</TableCell>
                        <TableCell className='text-center'>{request.address}</TableCell>
                        <TableCell className='text-center'>
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${badgeClass}`}
                          >
                            {request.status}
                          </span>
                        </TableCell>
                        <TableCell className='text-center'>{request.eventActivityName}</TableCell>
                        <TableCell className='text-center'>{request.activityTypeName}</TableCell>
                        <TableCell className='text-center'>{eventDate}</TableCell>
                        <TableCell className='text-center'>{createdDate}</TableCell>
                        <TableCell className='text-center'>
                          <div className='flex justify-center space-x-3'>
                            <button
                              onClick={() => {
                                if (request.status === "Draft") {
                                  onView(request.id)
                                } else {
                                  onDetaild(request.id)
                                }
                              }}
                              className='flex items-center space-x-1 bg-blue-100 text-blue-800 hover:bg-blue-200 px-2 py-1 rounded whitespace-nowrap'
                            >
                              <Eye size={14} />
                              <span>{request.status === "Draft" ? "View" : "Detail"}</span>
                            </button>

                            {hasDrafts && (
                              <button
                                onClick={() => onViewContract(request.id)}
                                className='flex items-center space-x-1 bg-orange-100 text-orange-800 hover:bg-orange-200 px-2 py-1 rounded whitespace-nowrap'
                              >
                                <Eye size={14} />
                                <span>View Contract</span>
                              </button>
                            )}

                            {request.status !== "Draft" && request.status !== "Pending" && (
                              <button
                                onClick={() =>
                                  navigate(path.CUSTOMER_CHAT.replace(':rentalId', String(request.id)))
                                }
                                className='flex items-center space-x-1 bg-purple-100 text-purple-800 hover:bg-purple-200 px-2 py-1 rounded'
                              >
                                <MessageCircle size={14} />
                                <span>Chat</span>
                              </button>
                            )}

                            {request.status === "Draft" && (
                              <button
                                onClick={() => handleSendRequest(request.id)}
                                className='flex items-center space-x-1 bg-green-100 text-green-800 hover:bg-green-200 px-2 py-1 rounded'
                              >
                                <span>📤</span>
                                <span>Send</span>
                              </button>
                            )}

                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* PAGINATION */}
          <div className='px-6 py-4 border-t border-gray-100 flex items-center justify-between'>
            <div className='flex space-x-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>

              {Array.from({ length: totalPages }, (_, i) => (
                <Button
                  key={i}
                  size='sm'
                  variant={i + 1 === currentPage ? 'default' : 'outline'}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </Button>
              ))}

              <Button
                variant='outline'
                size='sm'
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>

            <div className='text-sm text-gray-500'>
              Showing {paginatedRentals.length} of {filteredRentals.length}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default RentalRequestsContent
