import { Eye, Search } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { getAllRequests, type RentalRequestResponse } from '../../apis/rentalRequest.api'
import { Card, CardContent, CardHeader } from '../../components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Input } from '../../components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Button } from '../../components/ui/button'
import { Label } from '../../components/ui/label'

interface RentalRequestsContentProps {
  onView: (id: number) => void
}

const RentalRequestsContent: React.FC<RentalRequestsContentProps> = ({ onView }) => {
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
  const totalPages = Math.max(1, Math.ceil(filteredRentals.length / perPage))

  const statusOptions = ['All Status', 'Pending', 'Draft', 'Canceled', 'Received']

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
    setPage((prev) => Math.min(prev + 1, totalPages))
  }

  const handlePrev = () => {
    setPage((prev) => Math.max(prev - 1, 1))
  }

  const handlePageSelect = (num: number) => {
    setPage(num)
  }

  const paginatedRentals = filteredRentals.slice((page - 1) * perPage, page * perPage)

  return (
    <div className='space-y-6 bg-gray-50 p-6'>
      <Card className='rounded-xl shadow-sm border border-gray-100'>
        <CardHeader className='pb-0'>
          <h2 className='text-lg font-semibold text-gray-800 text-center mb-3'>Filter Requests</h2>
        </CardHeader>
        <CardContent className='p-6 pt-0'>
          <div className='flex flex-col gap-4 md:flex-row md:items-end md:gap-4'>
            <div className='flex flex-1 md:gap-4'>
              <div className='w-full md:w-40'>
                <Label className='block text-sm font-medium text-gray-700 mb-1'>Event Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='All Status' />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className='w-full md:w-40'>
                <Label className='block text-sm font-medium text-gray-700 mb-1'>Created Date From</Label>
                <Input
                  type='date'
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  max={dateTo || undefined}
                />
              </div>
              <div className='w-full md:w-40'>
                <Label className='block text-sm font-medium text-gray-700 mb-1'>Created Date To</Label>
                <Input
                  type='date'
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  min={dateFrom || undefined}
                />
              </div>
              <div className='flex-1'>
                <Label className='block text-sm font-medium text-gray-700 mb-1'>Search by Event Name</Label>
                <div className='relative'>
                  <Search className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-500' size={18} />
                  <Input
                    type='text'
                    placeholder='Enter event name...'
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className='pl-10'
                  />
                </div>
              </div>
            </div>
            <div className='flex gap-2'>
              <Button onClick={applyFilters}>Apply Filters</Button>
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

      <Card className='rounded-xl shadow-sm border border-gray-300'>
        <CardHeader className='p-6 border-b border-gray-100'>
          <h2 className='text-xl font-semibold text-gray-800'>All Rental Requests</h2>
        </CardHeader>
        <CardContent className='p-0'>
          <div className='overflow-x-auto'>
            <Table>
              <TableHeader className='bg-gray-50'>
                <TableRow>
                  <TableHead className='text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap'>Request ID</TableHead>
                  <TableHead className='text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap'>Event Name</TableHead>
                  <TableHead className='text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap'>Status</TableHead>
                  <TableHead className='text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap'>Activity Type</TableHead>
                  <TableHead className='text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap'>Event Date</TableHead>
                  <TableHead className='text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap'>Created Date</TableHead>
                  <TableHead className='text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className='text-center py-6 text-gray-500 text-sm'>
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : paginatedRentals.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className='text-center py-6 text-gray-500 text-sm'>
                      No rental requests found.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedRentals.map((request: RentalRequestResponse) => {
                    const eventDate = request.eventDate
                      ? new Date(request.eventDate).toLocaleDateString()
                      : '—'

                    const createdDate = request.createdDate
                      ? new Date(request.createdDate).toLocaleDateString()
                      : '—'

                    const statusClass = request.status === 'Received'
                      ? 'bg-green-100 text-green-800'
                      : request.status === 'Pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : request.status === 'Canceled'
                      ? 'bg-red-100 text-red-800'
                      : request.status === 'Draft'
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-blue-100 text-blue-800'

                    return (
                      <TableRow key={request.id} className='hover:bg-gray-50'>
                        <TableCell className='text-center'>{request.id}</TableCell>
                        <TableCell className='text-center'>{request.eventName}</TableCell>
                        <TableCell className='text-center'>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusClass}`}>
                            {request.status}
                          </span>
                        </TableCell>
                        <TableCell className='text-center'>{request.activityTypeName}</TableCell>
                        <TableCell className='text-center'>{eventDate}</TableCell>
                        <TableCell className='text-center'>{createdDate}</TableCell>
                        <TableCell className='text-center'>
                          <div className='flex justify-center space-x-2'>
                            <button
                              onClick={() => onView(request.id)}
                              className='flex items-center space-x-1 bg-blue-100 text-blue-800 hover:bg-blue-200 px-2 py-1 rounded whitespace-nowrap'
                            >
                              <Eye size={14} />
                              <span>View</span>
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
          <div className='px-6 py-4 border-t border-gray-100 flex items-center justify-between'>
            <div className='flex space-x-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={handlePrev}
                disabled={page === 1}
              >
                Previous
              </Button>
              {[...Array(totalPages)].map((_, i) => (
                <Button
                  key={i}
                  size='sm'
                  variant={page === i + 1 ? 'default' : 'outline'}
                  onClick={() => handlePageSelect(i + 1)}
                >
                  {i + 1}
                </Button>
              ))}
              <Button
                variant='outline'
                size='sm'
                onClick={handleNext}
                disabled={page === totalPages}
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