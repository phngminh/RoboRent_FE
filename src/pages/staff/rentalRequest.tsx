import { Eye, MessageCircle, Send, Search, Flag, X, Upload } from 'lucide-react'
import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import path from '../../constants/path'
import { cn } from '../../lib/utils'
import { toast } from 'react-toastify'
import { getPendingRentalAsync, getReceivedRentalByStaffIdAsync, receiveRentalAsync } from '../../apis/rental.staff.api'
import { getDraftsByRentalId, type ContractDraftResponse } from '../../apis/contractDraft.api'
import { getDraftsByContractId, type DraftClausesResponse } from '../../apis/draftClause.api'
import { sendReport, type CreateContractReportPayload } from '../../apis/contractReport.api'
import { useAuth } from '../../contexts/AuthContext'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog'
import { Textarea } from '../../components/ui/textarea'
import { Label } from '../../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Button } from '../../components/ui/button'
import type { RentalRequestResponse } from '../../apis/rentalRequest.api'

interface RentalRequestsContentProps {
  onView: (rentalId: number) => void
}

interface FormData {
  draftClausesId: number | null,
  accusedId: number,
  description: string,
  evidencePath: string
}

const RentalRequestsContent: React.FC<RentalRequestsContentProps> = ({ onView }) => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const staffId = user?.accountId
  const [allItems, setAllItems] = useState<RentalRequestResponse[]>([])
  const [filteredItems, setFilteredItems] = useState<RentalRequestResponse[]>([])
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
  const [receiving, setReceiving] = useState<number | null>(null)

  const [viewMode, setViewMode] = useState<'pending' | 'received' | 'canceled'>('pending')

  const [reportOpen, setReportOpen] = useState(false)
  const [selectedClause, setSelectedClause] = useState<DraftClausesResponse | null>(null)
  const [clauses, setClauses] = useState<DraftClausesResponse[]>([])
  const [selectedRental, setSelectedRental] = useState<RentalRequestResponse>({} as RentalRequestResponse)
  const [draftsMap, setDraftsMap] = useState<Record<number, ContractDraftResponse[]>>({})
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  const [rawEvidenceFiles, setRawEvidenceFiles] = useState<File[]>([])
  const [formData, setFormData] = useState<FormData>({
    draftClausesId: null,
    accusedId: 0,
    description: '',
    evidencePath: ''
  })

  const fileInputRef = useRef<HTMLInputElement>(null)

const fetchData = async () => {
  try {
    setLoading(true)
    let res;

    if (viewMode === 'pending') {
      res = await getPendingRentalAsync()
    } 
    else if (viewMode === 'received') {
      res = await getReceivedRentalByStaffIdAsync(staffId)
    }
    else if (viewMode === 'canceled') {
      res = await getReceivedRentalByStaffIdAsync(staffId)
    }

    setAllItems(res.data ?? [])
      setDraftsMap({})
  } catch (err) {
    console.error('Failed to load rental requests', err)
  } finally {
    setLoading(false)
  }
}

  const fetchDraftsForRentals = async () => {
    for (const rental of allItems.filter(r => !draftsMap[r.id!])) {
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
    if (allItems.length > 0) fetchDraftsForRentals()
  }, [allItems])

  useEffect(() => {
    if (staffId) fetchData()
  }, [viewMode, staffId])

  const filterData = () => {
    let filtered = [...allItems]

    if (viewMode === 'received') {
      filtered = filtered.filter(r => r.status !== 'Canceled')
    }

    if (viewMode === 'canceled') {
      filtered = filtered.filter(r => r.status === 'Canceled')
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

    setFilteredItems(filtered)
    setCurrentPage(1)
  }

  useEffect(() => {
    filterData()
  }, [allItems, search, appliedStatus, appliedDateFrom, appliedDateTo])

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize))
  const paginatedItems = filteredItems.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1)
  }

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1)
  }

  const handlePageSelect = (num: number) => {
    if (num >= 1 && num <= totalPages) setCurrentPage(num)
  }

  const handleReceive = async (id: number) => {
    try {
      setReceiving(id)

      if (!staffId) {
        alert('Staff ID missing!')
        return
      }

      const res = await receiveRentalAsync(id, staffId)

      if (res.success) {
        alert(`Rental ID ${id} successfully received!`)
      } else {
        alert(`Failed: ${res.message || 'Unknown error'}`)
      }

      await fetchData()

    } catch (err) {
      console.error(err)
      alert('Failed to receive rental')
    } finally {
      setReceiving(null)
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
    setFormData({
      draftClausesId: 0,
      accusedId: 0,
      description: '',
      evidencePath: '',
    })
    setSelectedClause(null)
    setClauses([])
    setErrors({})
    setRawEvidenceFiles([])
  }

  const handleClauseChange = (clauseIdStr: string) => {
    const clauseId = Number(clauseIdStr)
    const clause = clauses.find(c => c.id === clauseId)
    setSelectedClause(clause || null)
    setFormData((prev) => ({ ...prev, draftClausesId: clause ? clauseId : null }))
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
    
    if (!selectedClause) {
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
    if (!validateForm()) {
      return
    }
    try {
      setLoading(true)

      let evidencePath = ''
      if (rawEvidenceFiles.length > 0) {
        const uploadPromises = rawEvidenceFiles.map(uploadToCloudinary)
        const uploadResults = await Promise.all(uploadPromises)
        evidencePath = uploadResults.map(result => result.secure_url).join(';')
        console.log('Uploaded evidence paths:', evidencePath)
      }

      const payload: CreateContractReportPayload = {
        draftClausesId: selectedClause!.id,
        accusedId: selectedRental.accountId,
        description: formData.description,
        evidencePath
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || [])
    const totalFiles = rawEvidenceFiles.length + newFiles.length
    const maxFiles = 5

    if (totalFiles > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed. You are trying to add ${totalFiles} files.`)
      return
    }

    setRawEvidenceFiles(prev => [...prev, ...newFiles])
    e.target.value = ''
  }

  const removeFile = (indexToRemove: number) => {
    setRawEvidenceFiles(prev => prev.filter((_, index) => index !== indexToRemove))
  }

  const decodeHtml = (html: string) => {
    const txt = document.createElement('textarea')
    txt.innerHTML = html
    return txt.value
  }

  const ErrorMessage = ({ message }: { message: string }) => (
    <p className='text-sm text-destructive mt-1'>{message}</p>
  )

  return (
    <div className='space-y-6 bg-gray-50 p-6'>
      <div className='flex justify-center gap-3'>
        {/* Pending */}
        <button
          onClick={() => {
            setViewMode('pending')
            setStatusFilter('All Status')
            setAppliedStatus('All Status')
          }}
          className={`px-4 py-1.5 rounded-lg font-medium border text-sm ${
            viewMode === 'pending' && appliedStatus !== 'Canceled'
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
          }`}
        >
          Pending
        </button>

        {/* Received */}
        <button
          onClick={() => {
            setViewMode('received')
            setStatusFilter('All Status')
            setAppliedStatus('All Status')
          }}
          className={`px-4 py-1.5 rounded-lg font-medium border text-sm ${
            viewMode === 'received' && appliedStatus !== 'Canceled'
              ? 'bg-green-600 text-white border-green-600'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
          }`}
        >
          Received
        </button>

        {/* NEW: Canceled Only Filter */}
        <button
          onClick={() => {
            setViewMode('canceled')
            setStatusFilter('Canceled')
            setAppliedStatus('Canceled')
          }}
          className={`px-4 py-1.5 rounded-lg font-medium border text-sm ${
            appliedStatus === 'Canceled'
              ? 'bg-red-600 text-white border-red-600'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
          }`}
        >
          Canceled
        </button>
      </div>

      {/* FILTER BOX */}
      <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-100'>
        <h2 className='text-lg font-semibold text-gray-800 mb-4 text-center'>Filter Requests</h2>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Event Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg'
            >
              <option>All Status</option>
              <option>Pending</option>
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
              className='w-full px-3 py-2 border border-gray-300 rounded-lg'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Created Date To</label>
            <input
              type='date'
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg'
            />
          </div>

          <div className='flex items-end space-x-2'>
            <button
              onClick={() => {
                setAppliedStatus(statusFilter)
                setAppliedDateFrom(dateFrom)
                setAppliedDateTo(dateTo)
              }}
              className='flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg'
            >
              Apply Filters
            </button>
            <button
              onClick={() => {
                setSearch('')
                setStatusFilter('All Status')
                setAppliedStatus('All Status')
                setDateFrom('')
                setAppliedDateFrom('')
                setDateTo('')
                setAppliedDateTo('')
                setCurrentPage(1)
              }}
              className='bg-gray-300 text-gray-700 px-4 py-2 rounded-lg'
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
              placeholder='Search by event name...'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg'
            />
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className='bg-white rounded-xl shadow-sm border border-gray-100'>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase'>ID</th>
                <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase'>Event</th>
                <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase'>Status</th>
                <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase'>Event Activity</th>
                <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase'>Activity Type</th>
                <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase'>Created Date</th>
                <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase'>Actions</th>
              </tr>
            </thead>

            <tbody className='bg-white divide-y divide-gray-200'>
              {loading ? (
                <tr>
                  <td colSpan={7} className='text-center py-6 text-gray-500'>Loading...</td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className='text-center py-6 text-gray-500'>No requests found.</td>
                </tr>
              ) : (
                paginatedItems.map((request: RentalRequestResponse) => {
                  const drafts = draftsMap[request.id] ?? []
                  const canReport = drafts.length > 0 && drafts.some(d => d.status === 'Active')

                  return (
                    <tr key={request.id} className='hover:bg-gray-50'>
                      <td className='px-6 py-4 text-sm text-gray-900 text-center'>{request.id}</td>
                      <td className='px-6 py-4 text-sm text-gray-900 text-center'>{request.eventName}</td>
                      <td className='px-6 py-4 text-sm text-center'>
                        <span className='inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800'>
                          {request.status}
                        </span>
                      </td>
                      <td className='px-6 py-4 text-sm text-gray-900 text-center'>{request.eventActivityName}</td>
                      <td className='px-6 py-4 text-sm text-gray-900 text-center'>{request.activityTypeName}</td>
                      <td className='px-6 py-4 text-sm text-gray-900 text-center'>
                        {new Date(request.createdDate).toLocaleDateString()}
                      </td>

                      <td className='px-6 py-4 text-sm text-center'>
                        <div className='flex justify-center space-x-2'>

                          {/* View */}
                          <button
                            onClick={() => onView(request.id)}
                            className='text-gray-600 hover:text-gray-800 flex items-center space-x-1'
                          >
                            <Eye size={14} />
                            <span>View</span>
                          </button>

                          {/* Receive button only in pending view */}
                          {viewMode === 'pending' && (
                            <button
                              onClick={() => handleReceive(request.id)}
                              disabled={receiving === request.id}
                              className={`px-3 py-1 rounded-lg flex items-center space-x-1 ${
                                receiving === request.id
                                  ? 'bg-gray-400 text-white cursor-not-allowed'
                                  : 'bg-green-600 text-white hover:bg-green-700'
                              }`}
                            >
                              <Send size={14} />
                              <span>{receiving === request.id ? 'Receiving...' : 'Receive'}</span>
                            </button>
                          )}

                          {/* Chat button only in RECEIVED view */}
                          {viewMode === 'received' && (
                            <button
                              onClick={() => navigate(path.STAFF_CHAT.replace(':rentalId', String(request.id)))}
                              className='px-3 py-1 rounded-lg bg-purple-600 text-white hover:bg-purple-700 flex items-center space-x-1'
                            >
                              <MessageCircle size={14} />
                              <span>Chat</span>
                            </button>
                          )}

                          {canReport && (
                            <button
                              onClick={() => handleOpenReport(request)}
                              className='flex items-center space-x-1 bg-red-100 text-red-800 hover:bg-red-200 px-2 py-1 rounded whitespace-nowrap'
                            >
                              <Flag size={14} />
                              <span>Report</span>
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

        {/* PAGINATION */}
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
            Showing {paginatedItems.length} of {filteredItems.length}
          </div>
        </div>
      </div>

      <Dialog 
        open={reportOpen} 
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setReportOpen(false)
            clearFields()
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
                <Select 
                  value={selectedClause?.id.toString() || ''} 
                  onValueChange={handleClauseChange}
                >
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
                {errors.draftClausesId && <ErrorMessage message={errors.draftClausesId} />}
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
                <Label htmlFor='evidence'>Evidence (up to 5 files: images/videos)</Label>
                <div className='flex flex-col space-y-2'>
                  <input 
                    ref={fileInputRef}
                    id='evidence'
                    type='file'
                    multiple
                    accept='image/*,video/*'
                    onChange={handleFileChange}
                    className='absolute opacity-0 w-0 h-0 pointer-events-none'
                  />
                  
                  <button
                    type='button'
                    onClick={() => fileInputRef.current?.click()}
                    className='flex items-center justify-center w-full px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 text-gray-700 cursor-pointer transition-colors'
                  >
                    <Upload className='mr-2 h-4 w-4' />
                    {rawEvidenceFiles.length === 0 ? 'Upload your evidences...' : `Selected ${rawEvidenceFiles.length}/5 files`}
                  </button>
                  
                  {rawEvidenceFiles.length > 0 && (
                    <div className='space-y-1'>
                      <label className='text-sm font-medium text-gray-700'>Selected files:</label>
                      {rawEvidenceFiles.map((file, index) => (
                        <div key={index} className='flex justify-between items-center p-2 bg-gray-100 rounded border'>
                          <span className='text-sm text-gray-900 truncate flex-1'>{file.name}</span>
                          <button 
                            onClick={() => removeFile(index)} 
                            className='text-red-500 hover:text-red-700 text-lg leading-none ml-2'
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
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
              disabled={!selectedClause || !formData.description.trim() || loading}
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