// src/components/chat/CreateQuoteModal.tsx
import { useState, useEffect } from 'react'
import { X, AlertCircle } from 'lucide-react'
import { createPriceQuote, checkCanCreateMoreQuotes } from '../../apis/priceQuote.api'
import type { CreatePriceQuoteRequest } from '../../types/chat.types'
import { toast } from 'react-toastify'

interface CreateQuoteModalProps {
  isOpen: boolean
  rentalId: number
  currentQuoteCount: number
  onClose: () => void
  onSuccess: () => void
}

export default function CreateQuoteModal({ 
  isOpen, 
  rentalId, 
  currentQuoteCount,
  onClose, 
  onSuccess 
}: CreateQuoteModalProps) {
  const [delivery, setDelivery] = useState<string>('')
  const [deposit, setDeposit] = useState<string>('')
  const [complete, setComplete] = useState<string>('')
  const [service, setService] = useState<string>('')
  const [staffDescription, setStaffDescription] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [canCreate, setCanCreate] = useState(true)

  const deliveryNum = parseFloat(delivery) || 0
  const depositNum = parseFloat(deposit) || 0
  const completeNum = parseFloat(complete) || 0
  const serviceNum = parseFloat(service) || 0
  const total = deliveryNum + depositNum + completeNum + serviceNum

  const quoteNumber = currentQuoteCount + 1
  const quotesRemaining = 3 - currentQuoteCount

  // Check can create on mount
  useEffect(() => {
    if (isOpen) {
      checkCanCreateMoreQuotes(rentalId).then(result => {
        setCanCreate(result.canCreateMore)
      }).catch(() => {
        setCanCreate(false)
      })
    }
  }, [isOpen, rentalId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (deliveryNum < 0 || depositNum < 0 || completeNum < 0 || serviceNum < 0) {
      toast.error('All amounts must be non-negative')
      return
    }

    if (total <= 0) {
      toast.error('Total amount must be greater than 0')
      return
    }

    if (!staffDescription.trim()) {
      toast.error('Staff description is required')
      return
    }

    if (!canCreate) {
      toast.error('Maximum 3 quotes reached for this rental')
      return
    }

    setIsSubmitting(true)

    try {
      const request: CreatePriceQuoteRequest = {
        rentalId,
        delivery: deliveryNum,
        deposit: depositNum,
        complete: completeNum,
        service: serviceNum,
        staffDescription: staffDescription.trim()
      }

      await createPriceQuote(request)
      toast.success(`Quote #${quoteNumber} created successfully`)
      
      // Reset form
      setDelivery('')
      setDeposit('')
      setComplete('')
      setService('')
      setStaffDescription('')
      
      onSuccess()
      onClose()
    } catch (error: any) {
      console.error('Failed to create quote:', error)
      toast.error(error.response?.data?.error || 'Failed to create quote')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Create Price Quote</h2>
            <p className="text-sm text-gray-600 mt-1">
              Rental ID: #{rentalId}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              Quote #{quoteNumber} of 3
            </span>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
            >
              <X size={24} className="text-gray-600" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Warning if approaching limit */}
          {quotesRemaining <= 1 && (
            <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-yellow-900">
                  {quotesRemaining === 1 ? 'Last quote remaining' : 'Maximum quotes reached'}
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                  {quotesRemaining === 1 
                    ? 'This is your final opportunity to revise pricing for this rental.'
                    : 'You cannot create more quotes for this rental.'
                  }
                </p>
              </div>
            </div>
          )}

          {/* Cost Breakdown */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Cost Breakdown</h3>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Delivery Fee */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Fee
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={delivery}
                    onChange={(e) => setDelivery(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Cost for delivering the rental items.
                  <span className="text-red-600 ml-1">Cannot be negative.</span>
                </p>
              </div>

              {/* Deposit */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deposit Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={deposit}
                    onChange={(e) => setDeposit(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Refundable security deposit for the rental.</p>
              </div>

              {/* Completion Fee */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Completion Fee
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={complete}
                    onChange={(e) => setComplete(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Fee upon successful completion of the rental.</p>
              </div>

              {/* Service Fee */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Fee
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Charges for additional services.</p>
              </div>
            </div>
          </div>

          {/* Total Calculation */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-gray-900">Total Amount:</span>
              <span className="text-3xl font-bold text-blue-600">
                ${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Staff Description <span className="text-red-600">*</span>
            </label>
            <textarea
              value={staffDescription}
              onChange={(e) => setStaffDescription(e.target.value)}
              rows={4}
              placeholder="This quote includes standard delivery and a refundable deposit. Customer requested a 2-day rental period with setup assistance. All items inspected before dispatch."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              Add notes about this quote for the customer and internal reference.
            </p>
          </div>

          {/* Quotes remaining info */}
          <div className="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <span className="font-medium">{quotesRemaining} quote{quotesRemaining !== 1 ? 's' : ''} remaining</span> for this rental after creating this one.
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !canCreate}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating...' : `Create Quote #${quoteNumber}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}