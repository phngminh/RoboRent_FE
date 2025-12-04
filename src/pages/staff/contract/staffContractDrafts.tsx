import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader } from '../../../components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table'
import { Input } from '../../../components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import { Button } from '../../../components/ui/button'
import { Eye, Plus, Search, Send } from 'lucide-react'
import { getDraftsByStaff, sendDraftToManager, type ContractDraftResponse } from '../../../apis/contractDraft.api'
import { useAuth } from '../../../contexts/AuthContext'
import CreateContractDraft from './createContractDraft'
import { toast } from 'react-toastify'

interface ContractDraftsProps {
  onView: (draftId: number) => void
}

const StaffContractDrafts: React.FC<ContractDraftsProps> = ({ onView }) => {
  const { user } = useAuth()
  const [drafts, setDrafts] = useState<ContractDraftResponse[]>([])
  const [filteredDrafts, setFilteredDrafts] = useState<ContractDraftResponse[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All Status')
  const [appliedStatus, setAppliedStatus] = useState('All Status')
  const [rentalFilter, setRentalFilter] = useState('')
  const [appliedRental, setAppliedRental] = useState('')
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false)

  const rentalOptions = Array.from(
    new Set(
      drafts
        .map((draft) => draft.contractTemplateTitle)
        .filter((title) => Boolean(title))
    )
  ).sort()

  const pageSize = 5
  const totalPages = Math.ceil(filteredDrafts.length / pageSize)
  const paginatedDrafts = filteredDrafts.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const fetchDrafts = async () => {
    try {
      setLoading(true)
      const draftsData = await getDraftsByStaff(user?.accountId)
      setDrafts(draftsData)
      setFilteredDrafts(draftsData)
    } catch (err) {
      console.error('Failed to load drafts', err)
      setDrafts([])
      setFilteredDrafts([])
    } finally {
      setLoading(false)
    }
  }

  const handleSendDraft = async (draftId: number) => {
    try {
      await sendDraftToManager(draftId)
      toast.success('Draft sent to manager successfully.')
      fetchDrafts()
    } catch (err) {
      console.error('Failed to send draft to manager', err)
      toast.error('Failed to send draft to manager.')
    }
  }

  useEffect(() => {
    fetchDrafts()
  }, [])

  useEffect(() => {
    let filtered = [...drafts]
    if (search.trim()) {
      const searchTerm = search.toLowerCase()
      filtered = filtered.filter((draft) =>
        draft.title.toLowerCase().includes(searchTerm)
      )
    }

    if (appliedStatus !== 'All Status') {
      filtered = filtered.filter((draft) => draft.status === appliedStatus)
    }

    if (appliedRental) {
      filtered = filtered.filter((draft) => draft.contractTemplatesId.toString() === appliedRental)
    }

    setFilteredDrafts(filtered)
    setCurrentPage(1)
  }, [drafts, search, appliedStatus])

  const statusOptions = ['All Status', 'Draft', 'PendingManagerSignature', 'PendingCustomerSignature', 'ChangeRequested', 'Modified', 'Expired', 'Active', 'Rejected']

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Draft':
        return 'bg-gray-100 text-gray-800'
      case 'ChangeRequested':
        return 'bg-yellow-100 text-yellow-800'
      case 'Active':
        return 'bg-green-100 text-green-800'
      case 'Rejected':
        return 'bg-red-100 text-red-800'
      case 'Expired':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const applyFilters = () => {
    setAppliedStatus(statusFilter)
    setAppliedRental(rentalFilter)
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setSearch('')
    setStatusFilter('All Status')
    setAppliedStatus('All Status')
    setRentalFilter('')
    setAppliedRental('')
    setCurrentPage(1)
  }

  const columns = [
    {
      key: 'title',
      title: 'Title',
      accessor: 'title' as keyof ContractDraftResponse,
      className: 'whitespace-nowrap',
    },
    {
      key: 'comments',
      title: 'Comments',
      accessor: 'comments' as keyof ContractDraftResponse,
      className: 'max-w-md',
    },
    {
      key: 'rentalEventName',
      title: 'Event Name',
      accessor: 'rentalEventName' as keyof ContractDraftResponse,
      className: 'max-w-md',
    },
    {
      key: 'status',
      title: 'Status',
      className: 'w-[120px] whitespace-nowrap',
    },
    {
      key: 'contractTemplateTitle',
      title: 'Contract Template',
      accessor: 'contractTemplateTitle' as keyof ContractDraftResponse,
      className: 'w-[120px] whitespace-nowrap',
    },
    {
      key: 'staffName',
      title: 'Staff',
      accessor: 'staffName' as keyof ContractDraftResponse,
      className: 'w-[120px] whitespace-nowrap',
    },
    {
      key: 'createdAt',
      title: 'Created At',
      className: 'w-[120px] whitespace-nowrap',
    },
    {
      key: 'updatedAt',
      title: 'Updated At',
      className: 'w-[120px] whitespace-nowrap',
    },
    {
      key: 'actions',
      title: 'Actions',
      className: 'w-[200px] whitespace-nowrap',
    },
  ]

  return (
    <div className='space-y-6 bg-gray-50 p-6'>
      <Card className='rounded-xl shadow-sm border border-gray-100'>
        <CardHeader className='pb-0'>
          <h2 className='text-lg font-semibold text-gray-800 text-center mb-3'>Filter Drafts</h2>
        </CardHeader>
        <CardContent className='p-6 pt-0'>
          <div className='flex flex-col gap-4 md:flex-row md:items-end md:gap-4'>
            <div className='flex flex-1 md:gap-4'>
              <div className='w-full md:w-48'>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'>
                    <SelectValue placeholder='Status' />
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

              <div className='flex-1'>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Rental Request</label>
                <Select value={rentalFilter} onValueChange={setRentalFilter}>
                  <SelectTrigger className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'>
                    <SelectValue placeholder='Select Request' />
                  </SelectTrigger>
                  <SelectContent>
                    {rentalOptions.map((rental) => (
                      <SelectItem key={rental} value={rental}>
                        {rental}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='flex-1'>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Search by Title</label>
                <div className='relative'>
                  <Search className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-500' size={18} />
                  <Input
                    placeholder='Enter draft title...'
                    className='w-full pl-10 pr-4 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className='flex gap-2'>
              <Button
                onClick={applyFilters}
                className='px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
              >
                Apply Filters
              </Button>

              <Button
                onClick={clearFilters}
                variant='outline'
                size='sm'
                className='px-3 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors'
              >
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className='rounded-xl shadow-sm border border-gray-300 relative'>
        <CardHeader className='p-6 border-b border-gray-100 relative'>
          <h2 className='text-xl text-gray-800 font-semibold text-center w-full'>
            Contract Drafts
          </h2>
          <Button
            onClick={() => setIsCreateModalVisible(true)}
            className='absolute right-6 top-3.5 bg-green-600 text-white px-4 py-1.5 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2'
          >
            <Plus size={18} />
            <span>Create</span>
          </Button>
        </CardHeader>

        <CardContent className='p-0'>
          <div className='overflow-x-auto'>
            <div className='rounded-md border overflow-hidden'>
              <Table>
                <TableHeader className='bg-gray-50'>
                  <TableRow>
                    {columns.map((column) => (
                      <TableHead
                        key={column.key}
                        className={`px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider ${column.className || ''}`}
                      >
                        {column.title}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={columns.length} className='text-center py-6 text-gray-500 text-sm'>
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : paginatedDrafts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={columns.length} className='text-center py-6 text-gray-500 text-sm'>
                        No drafts found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedDrafts.map((draft) => {
                      const canSend = draft.status === 'Draft'

                      return (
                        <TableRow key={draft.id} className='hover:bg-gray-50'>
                          {columns.map((column) => {
                            const cellClass = `px-6 py-4 text-sm text-gray-900 text-center ${column.className || ''}`
                            let content: React.ReactNode
                            if (column.key === 'comments' || column.key === 'title' || column.key === 'rentalEventName' || column.key === 'contractTemplateTitle') {
                              content = <span className='max-w-md truncate'>{draft[column.accessor as keyof ContractDraftResponse] || 'N/A'}</span>
                            } else if (column.key === 'status') {
                              content = <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(draft.status)}`}>
                                {draft.status}
                              </span>
                            } else if (column.key === 'createdAt' || column.key === 'updatedAt') {
                                  content = draft[column.key as 'createdAt' | 'updatedAt'] 
                                      ? new Date(draft[column.key as 'createdAt' | 'updatedAt']).toLocaleDateString()
                                      : 'N/A'
                            } else if (column.key === 'actions') {
                              content = (
                                <div className='flex items-center justify-center space-x-2 text-sm'>
                                  <button
                                    onClick={() => onView(draft.id)}
                                    className='flex items-center space-x-1 rounded px-2 py-1 bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors'
                                  >
                                    <Eye size={14} />
                                    <span>View</span>
                                  </button>
                                  {canSend && (
                                    <button
                                      onClick={() => handleSendDraft(draft.id)}
                                      className='flex items-center space-x-1 rounded px-2 py-1 bg-green-100 text-green-800 hover:bg-green-200 transition-colors'
                                    >
                                      <Send size={14} />
                                      <span>Send</span>
                                    </button>
                                  )}
                                </div>
                              )
                            } else {
                              content = draft[column.accessor as keyof ContractDraftResponse]
                            }
                            return <TableCell key={column.key} className={cellClass}>{content}</TableCell>
                          })}
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className='px-6 py-4 border-t border-gray-100 flex items-center justify-between'>
            <div className='flex space-x-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 text-sm transition-colors ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:text-gray-800'}`}
              >
                Previous
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={page === currentPage ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => handlePageChange(page)}
                  className='px-3 py-1 text-sm rounded transition-colors'
                >
                  {page}
                </Button>
              ))}
              <Button
                variant='outline'
                size='sm'
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 text-sm transition-colors ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:text-gray-800'}`}
              >
                Next
              </Button>
            </div>
            <div className='text-sm text-gray-500'>
              Showing {paginatedDrafts.length} of {filteredDrafts.length} draft{filteredDrafts.length === 1 ? '' : 's'}
            </div>
          </div>
        </CardContent>
      </Card>

      <CreateContractDraft
        open={isCreateModalVisible}
        onClose={() => setIsCreateModalVisible(false)}
        onSuccess={() => {
          setIsCreateModalVisible(false)
          fetchDrafts()
        }}
      />
    </div>
  )
}

export default StaffContractDrafts