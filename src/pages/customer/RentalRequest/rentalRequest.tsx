import React, { useEffect, useState } from 'react'
import { Eye, Flag, MessageCircle, Plus, Search } from 'lucide-react'
import { Card, CardContent, CardHeader } from '../../../components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table'
import { Input } from '../../../components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import { Button } from '../../../components/ui/button'
import { Label } from '../../../components/ui/label'
import { getRequestByCustomer, type RentalRequestResponse } from '../../../apis/rentalRequest.api'
import { getDraftsByRentalId, type ContractDraftResponse } from '../../../apis/contractDraft.api'
import { getDraftsByContractId, type DraftClausesResponse } from '../../../apis/draftClause.api'
import { sendReport, type CreateContractReportPayload } from '../../../apis/contractReport.api'
import { useAuth } from '../../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import path from '../../../constants/path'
import { customerCancelRentalAsync, customerDeleteRentalAsync, customerSendRentalAsync } from '../../../apis/rental.customer.api'
import { getRentalDetailsByRentalIdAsync } from '../../../apis/rentaldetail.api'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../../components/ui/dialog'
import { Textarea } from '../../../components/ui/textarea'
import { cn } from '../../../lib/utils'
import { toast } from 'react-toastify'

interface RentalRequestsContentProps {
  onViewContract: (rentalId: number) => void
  onCreate: () => void
  onView: (rentalId: number) => void
  onDetaild: (rentalId: number) => void
}

interface FormData {
  draftClausesId: number,
  accusedId: number,
  description: string,
  evidencePath: string
}

const RentalRequestsContent: React.FC<RentalRequestsContentProps> = ({ onCreate, onViewContract, onView, onDetaild }) => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [reportOpen, setReportOpen] = useState(false)
  const [selectedClauseId, setSelectedClauseId] = useState<number | null>(null)
  const [clauses, setClauses] = useState<DraftClausesResponse[]>([])
  const [selectedRental, setSelectedRental] = useState<RentalRequestResponse>({} as RentalRequestResponse)
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
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  const [rawEvidenceFile, setRawEvidenceFile] = useState<File | null>(null)
  const [formData, setFormData] = useState<FormData>({
      draftClausesId: 0,
      accusedId: 0,
      description: '',
      evidencePath: ''
    })
  const [detailsMap, setDetailsMap] = useState<Record<number, boolean>>({});

  const pageSize = 5
  const totalPages = Math.max(1, Math.ceil(filteredRentals.length / pageSize))
  const paginatedRentals = filteredRentals.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

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
useEffect(() => {
  if (allRentals.length > 0) fetchDetailsForRentals();
}, [allRentals]);

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

  const handleOpenReport = async (rental: RentalRequestResponse) => {
    setSelectedRental(rental)
    clearFields()

    try {
      const drafts = draftsMap[rental.id] ?? []
      const relevantDrafts = drafts.filter(d =>
        d.status === 'PendingCustomerSignature' ||
        d.status === 'ChangeRequested' ||
        d.status === 'Active' ||
        d.status === 'Rejected'
      )
      let allClauses: DraftClausesResponse[] = []
      for (const draft of relevantDrafts) {
        const draftClauses = await getDraftsByContractId(draft.id)
        allClauses = [...allClauses, ...draftClauses]
      }
      setClauses(allClauses)
    } catch (err) {
      console.error('Error fetching clauses:', err)
      setClauses([])
    }

    setReportOpen(true)
  }

  const clearFields = () => {
    setFormData({ ...formData, description: '', draftClausesId: 0, evidencePath: '' })
    setSelectedClauseId(null)
    setClauses([])
  }

  const handleDraftClauseChange = (clauseId: number) => {
    setSelectedClauseId(clauseId)
    setFormData((prev) => ({ ...prev, draftClausesId: clauseId }))
    if (errors.draftClausesId) {
      setErrors((prev) => {
        const { draftClausesId, ...rest } = prev
        return rest
      })
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (Object.keys(errors).length > 0) {
      setErrors({})
    }
  }
  

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {}
    
    if (!selectedClauseId) {
      newErrors.draftClausesId = 'Draft Clause is required!'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required!'
    }

    if (formData.description.trim().length > 200) {
      newErrors.description = 'Description must not exceed 200 characters!'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const uploadToCloudinary = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET)

    const res = await fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/auto/upload`,
      { method: 'POST', body: formData }
    )

    return res.json()
  }

  const handleSendReport = async () => {
    if (validateForm() === false) {
      return
    }
    try {
      setLoading(true)

      const uploadResult = await uploadToCloudinary(rawEvidenceFile!)
      const evidencePath = uploadResult.secure_url
      console.log('Uploaded evidence path:', evidencePath)

      const payload: CreateContractReportPayload = {
        draftClausesId: selectedClauseId!,
        accusedId: selectedRental.staffId,
        description: formData.description,
        evidencePath: formData.evidencePath
      }
      await sendReport(payload)
      toast.success('Report sent successfully')
      setReportOpen(false)
      clearFields()
    } catch (err: any) {
      console.error('Error sending report:', err)
      toast.error('Failed to send report')
    } finally {
      setLoading(false)
    }
  }

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

  const decodeHtml = (html: string) => {
    const txt = document.createElement('textarea')
    txt.innerHTML = html
    return txt.value
  }

  const ErrorMessage = ({ message }: { message: string }) => (
    <p className='text-sm text-destructive mt-1'>{message}</p>
  )

  const statusOptions = ['All Status', 'Draft', 'Pending', 'Received', 'Rejected', 'Completed', 'Canceled']

  const handleCancelRental = async (id: number) => {
  try {
    setLoading(true)
    const res = await customerCancelRentalAsync(id)
    await fetchData()
  } catch (err: any) {
    console.error('Error cancel rental:', err)
    alert(err?.response?.data?.message || 'Failed to cancel rental')
  } finally {
    setLoading(false)
  }
}

const handleDeleteRental = async (id: number) => {
  try {
    setLoading(true)
    const res = await customerDeleteRentalAsync(id)
    await fetchData()
  } catch (err: any) {
    console.error('Error delete rental:', err)
    alert(err?.response?.data?.message || 'Failed to delete rental')
  } finally {
    setLoading(false)
  }
}

const fetchDetailsForRentals = async () => {
  for (const rental of allRentals.filter(r => detailsMap[r.id!] === undefined)) {
    try {
      const res = await getRentalDetailsByRentalIdAsync(rental.id);
      const hasDetails = res.success && res.data && res.data.length > 0;

      setDetailsMap(prev => ({
        ...prev,
        [rental.id]: hasDetails
      }));
    } catch (error) {
      console.error("Error fetching rental detail:", rental.id, error);
      setDetailsMap(prev => ({ ...prev, [rental.id]: false }));
    }
  }
};

  return (
    <div className='space-y-6 bg-gray-50 p-6'>
      {/* QUICK FILTER BUTTONS */}
<div className="flex justify-center gap-3 mb-4">

  {/* All */}
  <Button
    variant={appliedStatus === 'All Status' ? 'default' : 'outline'}
    onClick={() => {
      setStatusFilter('All Status')
      setAppliedStatus('All Status')
      setDateFrom('')
      setAppliedDateFrom('')
      setDateTo('')
      setAppliedDateTo('')
    }}
  >
    All
  </Button>

  {/* Pending */}
  <Button
    variant={appliedStatus === 'Pending' ? 'default' : 'outline'}
    onClick={() => {
      setStatusFilter('Pending')
      setAppliedStatus('Pending')
    }}
    className="bg-yellow-500/20 text-yellow-800 hover:bg-yellow-500/30"
  >
    Pending
  </Button>

  {/* Completed */}
  <Button
    variant={appliedStatus === 'Completed' ? 'default' : 'outline'}
    onClick={() => {
      setStatusFilter('Completed')
      setAppliedStatus('Completed')
    }}
    className="bg-blue-500/20 text-blue-800 hover:bg-blue-500/30"
  >
    Completed
  </Button>

  {/* NEW: Canceled */}
  <Button
    variant={appliedStatus === 'Canceled' ? 'default' : 'outline'}
    onClick={() => {
      setStatusFilter('Canceled')
      setAppliedStatus('Canceled')
    }}
    className="bg-red-500/20 text-red-800 hover:bg-red-500/30"
  >
    Canceled
  </Button>
</div>

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
                  <TableHead className='text-center whitespace-nowrap'>Event Name</TableHead>
                  <TableHead className='text-center whitespace-nowrap'>Address</TableHead>
                  <TableHead className='text-center whitespace-nowrap'>Status</TableHead>
                  <TableHead className='text-center whitespace-nowrap'>Event Activity</TableHead>
                  <TableHead className='text-center whitespace-nowrap'>Activity Type</TableHead>
                  <TableHead className='text-center whitespace-nowrap'>Event Date</TableHead>
                  <TableHead className='text-center whitespace-nowrap'>Created Date</TableHead>
                  <TableHead className='text-center whitespace-nowrap'>Actions</TableHead>
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
                    && drafts.some(d => d.status === 'PendingCustomerSignature' 
                                      || d.status === 'ChangeRequested'
                                      || d.status === 'Active'
                                      || d.status === 'Rejected')
                    const canReport = drafts.length > 0 && drafts.some(d => d.status === 'Active')

                    return (
                      <TableRow key={request.id} className='hover:bg-gray-50'>
                        <TableCell className='text-center whitespace-nowrap'>{request.eventName}</TableCell>
                        <TableCell className='text-center whitespace-nowrap'>{request.address}</TableCell>
                        <TableCell className='text-center'>
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${badgeClass}`}
                          >
                            {request.status}
                          </span>
                        </TableCell>
                        <TableCell className='text-center whitespace-nowrap'>{request.eventActivityName}</TableCell>
                        <TableCell className='text-center whitespace-nowrap'>{request.activityTypeName}</TableCell>
                        <TableCell className='text-center whitespace-nowrap'>{eventDate}</TableCell>
                        <TableCell className='text-center whitespace-nowrap'>{createdDate}</TableCell>
                        <TableCell className='text-center'>
                          <div className='flex justify-center space-x-3'>
<button
  onClick={() => {
    if (request.status === "Draft" || request.status === "Canceled") {
      onView(request.id)            // Canceled → onView
    } else {
      onDetaild(request.id)
    }
  }}
  className='flex items-center space-x-1 bg-blue-100 text-blue-800 hover:bg-blue-200 px-2 py-1 rounded whitespace-nowrap'
>
  <Eye size={14} />
  <span>
    {request.status === "Draft" || request.status === "Canceled" ? "View" : "Detail"}
  </span>
</button>

{request.status === "Draft" && (
  <button
    onClick={() => handleCancelRental(request.id)}
    className='flex items-center space-x-1 bg-red-100 text-red-800 hover:bg-red-200 px-2 py-1 rounded'
  >
    <span>❌</span>
    <span>Cancel</span>
  </button>
)}
{request.status === "Canceled" && (
  <button
    onClick={() => handleDeleteRental(request.id)}
    className='flex items-center space-x-1 bg-gray-100 text-gray-800 hover:bg-gray-200 px-2 py-1 rounded'
  >
    <span>🗑️</span>
    <span>Delete</span>
  </button>
)}

                            {hasDrafts && (
                              <button
                                onClick={() => onViewContract(request.id)}
                                className='flex items-center space-x-1 bg-orange-100 text-orange-800 hover:bg-orange-200 px-2 py-1 rounded whitespace-nowrap'
                              >
                                <Eye size={14} />
                                <span>View Contract</span>
                              </button>
                            )}

{request.status !== "Draft" &&
 request.status !== "Pending" &&
 request.status !== "Canceled" && (     // 🔥 hide when Canceled
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

{/* SEND BUTTON (only show if Draft AND has details) */}
{request.status === "Draft" && detailsMap[request.id] === true && (
  <button
    onClick={() => handleSendRequest(request.id)}
    className='flex items-center space-x-1 bg-green-100 text-green-800 hover:bg-green-200 px-2 py-1 rounded'
  >
    <span>📤</span>
    <span>Send</span>
  </button>
)}

{/* Disabled send button when no details */}
{request.status === "Draft" && detailsMap[request.id] === false && (
  <button
    disabled
    className='flex items-center space-x-1 bg-gray-200 text-gray-500 px-2 py-1 rounded cursor-not-allowed'
  >
    <span>📤</span>
    <span>No Details</span>
  </button>
)}

                            {canReport && (
                              <button
                                onClick={() => handleOpenReport(request)}
                                className='flex items-center space-x-1 bg-red-100 text-red-800 hover:bg-red-200 px-2 py-1 rounded'
                              >
                                <Flag size={14} />
                                <span>Report</span>
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

      <Dialog 
        open={reportOpen} 
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setReportOpen(false)
            setFormData({ ...formData, description: '', draftClausesId: 0, evidencePath: '' })
            setSelectedClauseId(null)
            setClauses([])
          }
        }}
      >
        <DialogContent className='sm:max-w-[520px] flex flex-col max-h-[90vh] p-8'>
          <DialogHeader>
            <DialogTitle className='text-lg font-semibold'>Report Contract Issue</DialogTitle>
            <DialogDescription className='text-sm text-gray-600 leading-relaxed'>
              Please select the problematic clause, provide a description and evidence.
            </DialogDescription>
          </DialogHeader>
          <div className='flex-1 overflow-y-auto overflow-x-visible pr-1 pl-1 -mt-8'>
            <div className='space-y-4 py-4'>
              <div className='space-y-2'>
                <Label htmlFor='clause'>Select Clause</Label>
                <Select value={formData.draftClausesId.toString()} onValueChange={v => handleDraftClauseChange(Number(v))}>
                  <SelectTrigger id='clause' className='w-full'>
                    <SelectValue placeholder='Select a clause to report' />
                  </SelectTrigger>
                  <SelectContent className='max-h-60 overflow-y-auto'>
                    {clauses.map(clause => (
                      <SelectItem key={clause.id} value={clause.id.toString()} className='truncate'>
                        {decodeHtml(clause.title)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='description'>Description</Label>
                <Textarea
                  id='description'
                  name='description'
                  placeholder='Enter a detailed description of the issue...'
                  value={formData.description}
                  onChange={handleInputChange}
                  className='min-h-[100px] resize-y'
                  rows={4}
                />
                {errors.description && <ErrorMessage message={errors.description} />}
              </div>
              <div className='space-y-2'>
                <Label htmlFor='evidence'>Evidence</Label>
                <div className='flex flex-col space-y-2'>
                  <input 
                    id='evidence'
                    type='file'
                    accept='image/*,video/*,application/pdf'
                    onChange={(e) => setRawEvidenceFile(e.target.files?.[0] || null)}
                    className='w-full'
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              type='button' 
              variant='outline' 
              onClick={() => setReportOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type='button'
              onClick={handleSendReport} 
              disabled={!formData.draftClausesId || !formData.description.trim() || loading}
              className={cn('bg-red-600 hover:bg-red-700 disabled:bg-gray-400')}
            >
              {loading ? 'Sending...' : 'Send Report'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default RentalRequestsContent