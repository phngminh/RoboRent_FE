import React, { useEffect, useState, useRef } from 'react'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Textarea } from '../../../components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../../components/ui/dialog'
import { ArrowLeft } from 'lucide-react'
import { customerRejects, customerRequestChange, customerSigns, getDraftsByRentalId, sendVerificationCode, verifyCode, type ContractDraftResponse } from '../../../apis/contractDraft.api'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'

interface CustomerContractDraftProps {
  onBack: () => void
}

type SignStep = 'request' | 'verify' | 'sign'

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
  const [otpStep, setOtpStep] = useState<SignStep>('request')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])
  const [isVerified, setIsVerified] = useState(false)
  const [verificationExpiry, setVerificationExpiry] = useState<Date | null>(null)
  const [timeLeft, setTimeLeft] = useState(300)

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
    if (verificationExpiry && Date.now() < verificationExpiry.getTime()) {
      const interval = setInterval(() => {
        const now = Date.now()
        const expiry = verificationExpiry.getTime()
        const remaining = Math.floor((expiry - now) / 1000)
        setTimeLeft(Math.max(0, remaining))
        if (remaining <= 0) {
          setIsVerified(false)
          setOtpStep('request')
          setVerificationExpiry(null)
          toast.warning('Verification expired. Please request a new code.')
        }
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [verificationExpiry])

  useEffect(() => {
    if (otpStep === 'verify' && inputRefs.current[0]) {
      inputRefs.current[0]?.focus()
    }
  }, [otpStep])

  const resetOtpStates = () => {
    setOtpStep('request')
    setOtp(['', '', '', '', '', ''])
    setIsVerified(false)
    setVerificationExpiry(null)
    setTimeLeft(300)
    setSignature('')
  }

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value[0]
    }
   
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
   
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>, index: number) => {
    e.preventDefault()
    const pasteData = e.clipboardData.getData('Text').trim().slice(0, 6 - index)
    if (/^\d+$/.test(pasteData)) {
      const newOtp = [...otp]
      for (let i = 0; i < pasteData.length && index + i < 6; i++) {
        newOtp[index + i] = pasteData[i]
      }
      setOtp(newOtp)
      const nextFocus = Math.min(index + pasteData.length, 5)
      inputRefs.current[nextFocus]?.focus()
    }
  }

  const handleRequestOtp = async () => {
    if (!draft) {
      toast.error('No draft loaded.')
      return
    }
    try {
      await sendVerificationCode(draft.id)
      toast.success('Verification code sent to your email!')
      setOtp(['', '', '', '', '', ''])
      setOtpStep('verify')
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to send code.'
      toast.error(errorMessage)
    }
  }

  const handleVerifyOtp = async () => {
    if (!draft || otp.some(digit => !digit)) {
      toast.error('Please enter the full code.')
      return
    }
    const otpValue = otp.join('')
    try {
      await verifyCode(draft.id, otpValue)
      setIsVerified(true)
      setOtpStep('sign')
      const expiry = new Date()
      expiry.setMinutes(expiry.getMinutes() + 5)
      setVerificationExpiry(expiry)
      toast.success('Code verified! You have 5 minutes to sign.')
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Invalid or expired code.'
      toast.error(errorMessage)
      setOtp(['', '', '', '', '', ''])
      if (inputRefs.current[0]) {
        inputRefs.current[0]?.focus()
      }
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

  const handleConfirmApprove = async () => {
    if (!draft || !signature.trim()) {
      toast.error('Please enter your signature.')
      return
    }
    if (!isVerified) {
      toast.error('Please verify your code first.')
      return
    }
    try {
      await customerSigns(draft.id, signature)
      toast.success('Signed successfully!')
      setApproveOpen(false)
      resetOtpStates()
      onBack()
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'An unexpected error occurred.'
      toast.error(errorMessage)
      setIsVerified(false)
      setOtpStep('request')
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
            setOtpStep('request')
            setApproveOpen(true)
          }} 
          disabled={draft.status !== 'PendingCustomerSignature'}
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
            resetOtpStates()
          }
        }}
      >
        <DialogContent className='sm:max-w-[425px]'>
          <DialogHeader>
            <DialogTitle>{otpStep === 'request' ? 'Verify Your Identity' : otpStep === 'verify' ? 'Enter Verification Code' : 'Sign the Contract'}</DialogTitle>
            <DialogDescription>
              {otpStep === 'request' && 'To sign, we need to verify your email. A code will be sent to your email.'}
              {otpStep === 'verify' && `Check your email for the 6-digit code. Expires in 5 minutes.`}
              {otpStep === 'sign' && `Verification complete! You have 5 minutes to sign.`}
            </DialogDescription>
          </DialogHeader>
          <div className='grid gap-4 py-4 -mt-4'>
            {otpStep === 'verify' && (
              <div className="flex justify-center space-x-2 mb-4">
                {otp.map((digit, index) => (
                  <Input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el }}
                    className="w-12 h-12 text-center text-lg font-semibold flex-1"
                    type="text"
                    value={digit}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={(e) => handlePaste(e, index)}
                    maxLength={1}
                    autoFocus={index === 0}
                  />
                ))}
              </div>
            )}
            {otpStep === 'sign' && (
              <>
                <Input
                  placeholder='Enter your name as signature'
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                />
                {timeLeft > 0 && <p className='text-sm text-orange-600'>Time remaining: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</p>}
              </>
            )}
          </div>
          <DialogFooter>
            {otpStep !== 'request' && otpStep !== 'sign' && (
              <Button type='button' variant='outline' onClick={() => setOtpStep('request')} className='-mt-6'>
                Back
              </Button>
            )}
            {otpStep === 'request' && (
              <Button onClick={handleRequestOtp} className='-mt-7'>Send Code</Button>
            )}
            {otpStep === 'verify' && (
              <Button onClick={handleVerifyOtp} disabled={otp.some(digit => !digit)} className='bg-green-600 -mt-6'>
                Verify
              </Button>
            )}
            {otpStep === 'sign' && (
              <Button onClick={handleConfirmApprove} disabled={!signature.trim() || timeLeft <= 0} className='-mt-6'>
                Sign Contract
              </Button>
            )}
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