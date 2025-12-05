import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Textarea } from '../../../components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import { ArrowLeft, Edit3 } from 'lucide-react'
import { getDraftById, type ContractDraftResponse, reviseDraft, type ReviseContractDraftPayload } from '../../../apis/contractDraft.api'
import { getRequestById, type RentalRequestResponse } from '../../../apis/rentalRequest.api'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '../../../components/ui/dialog'
import { getDraftsByContractId, type DraftClausesResponse, updateDraftClauses, type UpdateDraftClausesPayload } from '../../../apis/draftClause.api'
import FormInput from '../../../components/formInput'

interface StaffDetailContractDraft {
  onBack: () => void
}

const StaffDetailContractDraft: React.FC<StaffDetailContractDraft> = ({ onBack }) => {
  const { draftId: draftIdString } = useParams<{ draftId: string }>()
  const draftId = draftIdString ? parseInt(draftIdString, 10) : 0
  const [draft, setDraft] = useState<ContractDraftResponse | null>(null)
  const [rental, setRental] = useState<RentalRequestResponse | null>(null)
  const [clauses, setClauses] = useState<DraftClausesResponse[]>([])
  const [selectedClause, setSelectedClause] = useState<DraftClausesResponse | null>(null)
  const [isViewModalVisible, setIsViewModalVisible] = useState(false)
  const [isEditingClause, setIsEditingClause] = useState(false)
  const [editedClauseBody, setEditedClauseBody] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedTitle, setEditedTitle] = useState('')

  const fetchDraft = async () => {
    try {
      setLoading(true)
      const draftData = await getDraftById(draftId)
      if (draftData) {
        setDraft(draftData)
        setEditedTitle(draftData.title)
        if (draftData.rentalId) {
          fetchRental(draftData.rentalId)
        }
        fetchClauses(draftData.id)
      } else {
        setError('Failed to load draft')
      }
    } catch (err) {
      console.error('Failed to load draft', err)
      setError('Failed to load draft details')
    } finally {
      setLoading(false)
    }
  }

  const fetchClauses = async (draftId: number) => {
    try {
      const clauses = await getDraftsByContractId(draftId)
      console.log('Fetched clauses:', clauses)
      setClauses(clauses)
    } catch (err) {
      console.error('Failed to load clauses', err)
    }
  }

  const fetchRental = async (requestId: number) => {
    try {
      const rental = await getRequestById(requestId)
      setRental(rental)
    } catch (err) {
      console.error('Failed to load rental details', err)
    }
  }

  useEffect(() => {
    if (draftId) {
      fetchDraft()
    } else {
      setError('Invalid draft ID')
      setLoading(false)
    }
  }, [draftId])

  useEffect(() => {
    if (isViewModalVisible && selectedClause) {
      setEditedClauseBody(selectedClause.body)
      setIsEditingClause(false)
    }
  }, [isViewModalVisible, selectedClause])

  const handleSaveClause = async () => {
    if (!selectedClause) return
    try {
      const payload: UpdateDraftClausesPayload = {
        id: selectedClause.id,
        title: selectedClause.title,
        body: editedClauseBody,
        contractDraftsId: selectedClause.contractDraftsId,
        templateClausesId: selectedClause.templateClausesId
      }
      await updateDraftClauses(selectedClause.id, payload)
      setClauses(prevClauses =>
        prevClauses.map(clause =>
          clause.id === selectedClause.id
            ? { ...clause, body: editedClauseBody, isModified: true }
            : clause
        )
      )
      setSelectedClause(prev => prev ? { ...prev, body: editedClauseBody, isModified: true } : prev)
      toast.success('Clause updated successfully!')
      setIsEditingClause(false)
    } catch (err: any) {
      console.error('Failed to update clause', err)
      const errorMessage = err.response?.data?.message || err.message || 'An unexpected error occurred.'
      toast.error(errorMessage)
    }
  }

  const handleCancel = () => {
    if (draft) {
      setEditedTitle(draft.title)
    }
    setIsEditing(false)
  }

  const handleSave = async () => {
    if (!draft) return
    try {
      const payload: ReviseContractDraftPayload = {
        id: draftId,
        title: editedTitle,
        comments: draft.comments,
        bodyJson: draft.bodyJson,
      }
      await reviseDraft(draftId, payload)
      toast.success('Draft revised successfully!')
      setIsEditing(false)
      await fetchDraft()
    } catch (err: any) {
      console.error('Failed to revise draft', err)
      const errorMessage = err.response?.data?.message || err.message || 'An unexpected error occurred.'
      toast.error(errorMessage)
    }
  }

  const decodeHtml = (html: string) => {
    const txt = document.createElement('textarea')
    txt.innerHTML = html
    return txt.value
  }

  if (loading) {
    return (
      <div className='space-y-6 bg-gray-50 p-6'>
        <div className='flex items-center justify-center py-12'>
          <p className='text-gray-500'>Loading draft details...</p>
        </div>
      </div>
    )
  }

  if (error || !draft) {
    return (
      <div className='space-y-6 bg-gray-50 p-6'>
        <div className='flex items-center justify-center py-12'>
          <p className='text-red-500'>{error || 'Draft not found'}</p>
        </div>
        <div className='flex justify-center'>
          <Button onClick={onBack} variant='outline'>
            <ArrowLeft size={18} className='mr-2' />
            Back to List
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-6 bg-white p-6 max-w-8xl mx-auto'>
      <Button
        onClick={onBack}
        variant='ghost'
        className='flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 mb-2 -mt-4'
      >
        <ArrowLeft size={18} />
        Back to Drafts
      </Button>

      <Card className='rounded-lg shadow-sm border border-gray-200'>
        <CardHeader className='pb-3 border-b border-gray-200'>
          <div className='flex justify-between items-center'>
            <CardTitle className='text-2xl font-semibold text-gray-900 text-left'>Contract Details</CardTitle>
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} variant='outline'><Edit3 size={18} />Edit</Button>
            ) : (
              <div className='flex gap-2'>
                <Button onClick={handleCancel} variant='outline'>Cancel</Button>
                <Button onClick={handleSave}>Save</Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className='p-6 space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <div className='space-y-4'>
              <div>
                <label className='block text-xs font-medium text-gray-600 mb-1'>Contract Title</label>
                {!isEditing ? (
                  <Input value={draft.title} readOnly className='bg-white border-gray-300' />
                ) : (
                  <Input
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className='border-gray-300'
                  />
                )}
              </div>
              <div>
                <label className='block text-xs font-medium text-gray-600 mb-1'>Status</label>
                <Select value={draft.status} disabled>
                  <SelectTrigger className='bg-white border-gray-300'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='Draft'>Draft</SelectItem>
                    <SelectItem value='PendingManagerSignature'>PendingManagerSignature</SelectItem>
                    <SelectItem value='PendingCustomerSignature'>PendingCustomerSignature</SelectItem>
                    <SelectItem value='ChangeRequested'>ChangeRequested</SelectItem>
                    <SelectItem value='Modified'>Modified</SelectItem>
                    <SelectItem value='Expired'>Expired</SelectItem>
                    <SelectItem value='Active'>Active</SelectItem>
                    <SelectItem value='Rejected'>Rejected</SelectItem>
                    <SelectItem value='RejectedByManager'>RejectedByManager</SelectItem>
                    <SelectItem value='RejectedByCustomer'>RejectedByCustomer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className='block text-xs font-medium text-gray-600 mb-1'>Comments</label>
                <Textarea 
                  value={draft.comments || 'N/A'} 
                  readOnly 
                  className='bg-white border-gray-300 min-h-[100px]' 
                />
              </div>
            </div>

            <div className='space-y-4'>
              {rental && (
                <>
                  <div>
                    <label className='block text-xs font-medium text-gray-600 mb-1'>Event Name</label>
                    <Input value={rental.eventName} readOnly className='bg-white border-gray-300' />
                  </div>
                  <div>
                    <label className='block text-xs font-medium text-gray-600 mb-1'>Event Date</label>
                    <Input value={new Date(rental.eventDate).toLocaleDateString('vi-VN')} readOnly className='bg-white border-gray-300' />
                  </div>
                  <div>
                    <label className='block text-xs font-medium text-gray-600 mb-1'>Event Description</label>
                    <Textarea value={rental.description} readOnly className='bg-white border-gray-300 min-h-[100px]' />
                  </div>
                </>
              )}
            </div>

            <div className='flex items-center justify-center'>
              <img 
                src='https://i0.wp.com/www.blackdiamondnet.com/wp-content/uploads/2024/03/job-contract-photo-scaled.jpeg?fit=2560%2C1685&quality=89&ssl=1'
                alt='Contract Document'
                className='rounded-lg w-full max-w-md h-64 object-cover border border-gray-300'
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className='rounded-lg shadow-sm border border-gray-200'>
        <CardHeader className='pb-3 border-b border-gray-200'>
          <div className='flex justify-between items-center'>
            <CardTitle className='text-2xl font-semibold text-gray-900 text-left'>Draft Clauses</CardTitle>
          </div>
        </CardHeader>
        <CardContent className='p-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {clauses.map((clause) => {
              return (
                <Card 
                  key={clause.id}
                  className='relative p-4 border border-gray-200 group hover:shadow-lg hover:bg-gray-50 transition-all duration-200 h-48 flex flex-col overflow-hidden space-y-2 cursor-pointer'
                  onClick={() => {
                    setSelectedClause(clause)
                    setIsViewModalVisible(true)
                  }}
                >
                  <div className='absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 bg-black/20 group-hover:bg-black/10'>
                    <Edit3 size={32} className='text-white drop-shadow-lg' />
                  </div>

                  <h4 className='font-semibold text-gray-900 text-sm leading-tight'>
                    {decodeHtml(clause.title)}
                  </h4>

                  <div className='flex-1 overflow-hidden'>
                    <div
                      className='prose max-w-none prose-sm text-xs text-gray-600 overflow-hidden'
                      style={{
                        display: '-webkit-box',
                        WebkitBoxOrient: 'vertical',
                        WebkitLineClamp: 6,
                      }}
                      dangerouslySetInnerHTML={{ __html: clause.body }}
                    />
                  </div>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Dialog 
        open={isViewModalVisible} 
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setIsViewModalVisible(false)
            setSelectedClause(null)
          }
        }}
      >
        <DialogContent className='sm:max-w-[780px] flex flex-col max-h-[90vh] p-8'>
          <DialogHeader>
            <DialogTitle className='text-center text-2xl'>{selectedClause ? decodeHtml(selectedClause.title) : ''}</DialogTitle>
          </DialogHeader>
          <DialogDescription></DialogDescription>
          <div className='flex-1 overflow-y-auto overflow-x-visible pr-3 pl-3 space-y-6'>
            <div className='space-y-2'>
              {isEditingClause ? (
                <FormInput
                  value={editedClauseBody}
                  onChange={(content) => setEditedClauseBody(content)}
                  editorKey={selectedClause?.id}
                />
              ) : (
                <div
                  className='prose max-w-none prose-sm'
                  dangerouslySetInnerHTML={{ __html: selectedClause?.body || '' }}
                />
              )}
            </div>
          </div>
          <DialogFooter className='-mt-2'>
            {!isEditingClause ? (
              <>
                <Button 
                  type='button' 
                  variant='outline' 
                  onClick={() => setIsEditingClause(true)}
                >
                  <Edit3 size={16} className='mr-2' />
                  Edit
                </Button>
              </>
            ) : (
              <>
                <Button 
                  type='button' 
                  variant='outline' 
                  onClick={() => {
                    setIsEditingClause(false)
                    if (selectedClause) 
                      setEditedClauseBody(selectedClause.body)
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type='button' 
                  onClick={handleSaveClause}
                >
                  Save Changes
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default StaffDetailContractDraft