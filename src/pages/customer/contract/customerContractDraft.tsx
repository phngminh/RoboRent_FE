import React, { useEffect, useState } from 'react'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Textarea } from '../../../components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../../components/ui/dialog'
import { ArrowLeft } from 'lucide-react'
import { customerRejects, customerRequestChange, customerSigns, getDraftsByRentalId, type ContractDraftResponse } from '../../../apis/contractDraft.api'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'

interface CustomerContractDraftProps {
  onBack: () => void
}

const CustomerContractDraft: React.FC<CustomerContractDraftProps> = ({ onBack }) => {
  const { rentalId: rentalIdString } = useParams<{ rentalId: string }>()
  const rentalId = rentalIdString ? parseInt(rentalIdString, 10) : 0
  const [draft, setDraft] = useState<ContractDraftResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [requestOpen, setRequestOpen] = useState(false)
  const [approveOpen, setApproveOpen] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [comment, setComment] = useState('')
  const [signature, setSignature] = useState('')
  const [reason, setReason] = useState('')

  const fetchDraft = async (rentalId: number) => {
    try {
      setLoading(true)
      const draftData = await getDraftsByRentalId(rentalId)
      const pendingDraft = draftData
        .find(d => d.status === 'PendingCustomerSignature' 
          || d.status === 'ChangeRequested'
          || d.status === 'Modified'
          || d.status === 'Active'
        )
      if (pendingDraft) {
        setDraft(pendingDraft)
      } else {
        setError('No pending draft found')
      }
    } catch (err) {
      console.error('Failed to load draft', err)
      setError('Failed to load draft details')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (rentalId) {
      fetchDraft(rentalId)
    } else {
      setError('Invalid draft ID')
      setLoading(false)
    }
  }, [rentalId])

  const handleConfirmRequest = async () => {
    if (!draft) {
      toast.error('No draft loaded to request changes.')
      return
    }
    try {
      await customerRequestChange(draft.id, comment)
      toast.success('Requested successfully!')
      setApproveOpen(false)
      setSignature('')
      onBack()
    } catch (err : any) {
      console.error(err)
      const errorMessage = err.response?.data?.message || err.message || 'An unexpected error occurred.'
      toast.error(errorMessage)
    }
  }

  const handleConfirmApprove = async () => {
    if (!draft) {
      toast.error('No draft loaded to approve.')
      return
    }
    try {
      await customerSigns(draft.id, signature)
      toast.success('Signed successfully!')
      setApproveOpen(false)
      setSignature('')
      onBack()
    } catch (err : any) {
      console.error(err)
      const errorMessage = err.response?.data?.message || err.message || 'An unexpected error occurred.'
      toast.error(errorMessage)
    }
  }

  const handleConfirmReject = async () => {
    if (!draft) {
      toast.error('No draft loaded to reject.')
      return
    }
    try {
      await customerRejects(draft.id, reason)
      toast.success('Rejected successfully!')
      setRejectOpen(false)
      setReason('')
      onBack()
    } catch (err : any) {
      console.error(err)
      const errorMessage = err.response?.data?.message || err.message || 'An unexpected error occurred.'
      toast.error(errorMessage)
    }
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
    <div className='space-y-6 bg-white p-6 max-w-7xl mx-auto rounded-lg shadow-sm border border-gray-200'>
      <Button
        onClick={onBack}
        variant='ghost'
        className='flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 mb-2 -mt-4'
      >
        <ArrowLeft size={18} />
        Back to Drafts
      </Button>

      <div className='flex-1 overflow-y-auto overflow-x-visible pr-3 pl-3 space-y-6'>
        <div className='max-w-4xl mx-auto'>
          <div className='space-y-2'>
            <div
              className='prose max-w-none prose-sm'
              dangerouslySetInnerHTML={{ __html: draft.bodyJson }}
            />
          </div>
        </div>
      </div>

      <div className='flex justify-end gap-3 mr-36'>
        <Button 
          onClick={() => setRequestOpen(true)} 
          disabled={draft.status != 'PendingCustomerSignature'}
          className='bg-gray-100 border border-gray-400 text-black hover:bg-gray-200 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed'
        >
          Request Changes
        </Button>
        <Button 
          onClick={() => setRejectOpen(true)} 
          disabled={draft.status != 'PendingCustomerSignature'}
          className='bg-red-500 text-white hover:bg-red-600 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed'
        >
          Reject
        </Button>
        <Button 
          onClick={() => setApproveOpen(true)} 
          disabled={draft.status != 'PendingCustomerSignature'}
          className='bg-indigo-600 hover:bg-indigo-700 text-white disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed'
        >
          Sign
        </Button>
      </div>

      <Dialog 
        open={requestOpen} 
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setRequestOpen(false)
            setSignature('')
          }
        }}
      >
        <DialogContent className='sm:max-w-[425px]'>
          <DialogHeader>
            <DialogTitle>Enter Your Comment</DialogTitle>
            <DialogDescription>
              Please provide the changes you would like to request.
            </DialogDescription>
          </DialogHeader>
          <div className='grid gap-4 py-4 -mt-4'>
            <Textarea
              placeholder='Enter your comment...'
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className='min-h-[100px]'
            />
          </div>
          <DialogFooter>
            <Button type='submit' variant='outline' onClick={() => setRequestOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmRequest} disabled={!comment.trim()}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog 
        open={approveOpen} 
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setApproveOpen(false)
            setSignature('')
          }
        }}
      >
        <DialogContent className='sm:max-w-[425px]'>
          <DialogHeader>
            <DialogTitle>Enter Signature</DialogTitle>
            <DialogDescription>
              Please enter your name as the signature to approve the contract.
            </DialogDescription>
          </DialogHeader>
          <div className='grid gap-4 py-4 -mt-4'>
            <Input
              placeholder='Enter your name as signature'
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type='submit' variant='outline' onClick={() => setApproveOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmApprove} disabled={!signature.trim()}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog 
        open={rejectOpen} 
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setRejectOpen(false)
            setReason('')
          }
        }}
      >
        <DialogContent className='sm:max-w-[425px]'>
          <DialogHeader>
            <DialogTitle>Enter Rejection Reason</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting the contract.
            </DialogDescription>
          </DialogHeader>
          <div className='grid gap-4 py-4 -mt-4'>
            <Textarea
              placeholder='Enter rejection reason...'
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className='min-h-[100px]'
            />
          </div>
          <DialogFooter>
            <Button type='submit' variant='outline' onClick={() => setRejectOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmReject} disabled={!reason.trim()}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default CustomerContractDraft