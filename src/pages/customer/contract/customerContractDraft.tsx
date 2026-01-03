import React, { useEffect, useState, useRef } from 'react'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Textarea } from '../../../components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../../components/ui/dialog'
import { ArrowLeft, Download, Info, UploadCloud } from 'lucide-react'
import { customerRejects, customerRequestChange, customerSignsWithFile, downloadContractAsPdf, downloadContractAsWord, getDraftsByRentalId, type ContractDraftResponse } from '../../../apis/contractDraft.api'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { signalRService } from '../../../utils/signalr'

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
  const [reason, setReason] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  useEffect(() => {
    const handleContractPendingSignature = (data: {
      ContractId: number
      RentalId: number
      Message: string
    }) => {
      if (data.RentalId === rentalId) {
        toast.info(`📝 ${data.Message}`)
        fetchDraft(rentalId)
      }
    }

    signalRService.connect().then(() => {
      signalRService.onContractPendingCustomerSignature(handleContractPendingSignature)
    })

    return () => {
      signalRService.offContractPendingCustomerSignature()
    }
  }, [rentalId])

  const handleUploadSignedContract = async () => {
    if (!selectedFile || !draft) return

    setIsUploading(true)
    try {
      const response = await customerSignsWithFile(draft.id, selectedFile)
      if (response.success) {
        toast.success('Signed successfully!')
        setApproveOpen(false)
        setSelectedFile(null)
        onBack()
      } else {
        toast.error(response.message || 'Upload failed.')
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'An unexpected error occurred.'
      toast.error(errorMessage)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (file && (file.name.endsWith('.pdf') || file.name.endsWith('.docx'))) {
        setSelectedFile(file)
      } else {
        toast.error('Invalid file type. Allowed: PDF, DOCX')
      }
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && (file.name.endsWith('.pdf') || file.name.endsWith('.docx'))) {
      setSelectedFile(file)
    } else {
      toast.error('Invalid file type. Allowed: PDF, DOCX')
      e.target.value = ''
    }
  }

  const handleConfirmRequest = async () => {
    if (!draft) {
      toast.error('No draft loaded to request changes.')
      return
    }
    try {
      await customerRequestChange(draft.id, comment)
      toast.success('Requested successfully!')
      setRequestOpen(false)
      setComment('')
      onBack()
    } catch (err: any) {
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
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'An unexpected error occurred.'
      toast.error(errorMessage)
    }
  }

  const handleDownloadPdf = async () => {
    if (!draft) {
      toast.error('No draft loaded.')
      return
    }
    try {
      const response = await downloadContractAsPdf(draft.id)
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `Contract_${draft.id}_${new Date().toISOString().slice(0, 10)}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      toast.success('PDF downloaded successfully!')
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to download PDF.'
      toast.error(errorMessage)
    }
  }

  const handleDownloadWord = async () => {
    if (!draft) {
      toast.error('No draft loaded.')
      return
    }
    try {
      const response = await downloadContractAsWord(draft.id)
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `Contract_${draft.id}_${new Date().toISOString().slice(0, 10)}.docx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      toast.success('Word document downloaded successfully!')
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to download Word document.'
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
      <div className='flex justify-between items-center mb-4'>
        <Button
          onClick={onBack}
          variant='ghost'
          className='flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800'
        >
          <ArrowLeft size={18} />
          Back to Drafts
        </Button>
        <div className='flex gap-2'>
          <Button onClick={handleDownloadPdf}
            variant='outline'
            size='lg'
            className='px-3 py-2'
          >
            <Download size={16} className='mr-2' />
            Download as PDF
          </Button>
          <Button onClick={handleDownloadWord}
            variant='outline'
            size='lg'
            className='px-3 py-2'
          >
            <Download size={16} className='mr-2' />
            Download as Word
          </Button>
        </div>
      </div>

      <div className='bg-blue-50 border border-blue-200 rounded-md p-4 mb-4 max-w-5xl mx-auto'>
        <div className='flex items-start gap-2'>
          <Info className='h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0' />
          <p className='text-md text-blue-800'>
            You can download the contract as PDF or Word, print it out, sign it manually (or using digital tools), and then upload the signed version by clicking the "Upload Signed Contract" button.
          </p>
        </div>
      </div>

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
          disabled={draft.status !== 'PendingCustomerSignature'}
          className='bg-gray-100 border border-gray-400 text-black hover:bg-gray-200 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed'
        >
          Request Changes
        </Button>
        <Button
          onClick={() => setRejectOpen(true)}
          disabled={draft.status !== 'PendingCustomerSignature'}
          className='bg-red-500 text-white hover:bg-red-600 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed'
        >
          Reject
        </Button>
        <Button
          onClick={() => {
            setApproveOpen(true)
          }}
          disabled={draft.status !== 'PendingCustomerSignature'}
          className='bg-indigo-600 hover:bg-indigo-700 text-white disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed'
        >
          Upload Signed Contract
        </Button>
      </div>

      <Dialog
        open={requestOpen}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setRequestOpen(false)
            setComment('')
          }
        }}
      >
        <DialogContent className='sm:max-w-[425px]'>
          <DialogHeader>
            <DialogTitle>Enter Your Comment</DialogTitle>
            <DialogDescription>Please provide the changes you would like to request.</DialogDescription>
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
            setSelectedFile(null)
            setDragActive(false)
          }
        }}
      >
        <DialogContent className='sm:max-w-[600px]'>
          <DialogHeader>
            <DialogTitle>Upload Signed Contract</DialogTitle>
            <DialogDescription>
              Please upload your signed contract file. Allowed types: PDF, DOCX.
            </DialogDescription>
          </DialogHeader>
          <div className='grid gap-4 py-4 -mt-4'>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400 bg-gray-50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <UploadCloud className='mx-auto h-12 w-12 text-gray-400 mb-4' />
              <p className='mb-2 text-sm font-medium text-gray-900'>
                <span className='relative'>
                  {dragActive ? (
                    <span>Drop the file here...</span>
                  ) : (
                    <>
                      <span
                        aria-hidden='true'
                        className='absolute inset-0 z-0 h-full w-full cursor-pointer'
                        onClick={() => fileInputRef.current?.click()}
                      />
                      <span className='relative z-10'>Choose a file or drag & drop here</span>
                    </>
                  )}
                </span>
              </p>
              <p className='text-xs text-gray-500 mb-4'>PDF, DOCX formats, up to 6MB</p>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => fileInputRef.current?.click()}
                className='px-4'
              >
                Browse
              </Button>
              <Input
                ref={fileInputRef}
                type='file'
                accept='.pdf,.docx'
                onChange={handleFileSelect}
                className='hidden'
              />
            </div>
            {selectedFile && (
              <div className='bg-green-50 border border-green-200 rounded-md p-3'>
                <p className='text-sm text-green-800'>Selected: {selectedFile.name}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => setApproveOpen(false)}
              className='-mt-6'
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUploadSignedContract}
              disabled={!selectedFile || isUploading}
              className='-mt-6'
            >
              {isUploading ? 'Uploading...' : 'Upload'}
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
            <DialogDescription>Please provide a reason for rejecting the contract.</DialogDescription>
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