// src/components/chat/UpdateQuoteModal.tsx
import { useState, useEffect } from 'react'
import { X, AlertCircle, RefreshCw } from 'lucide-react'
import { getPriceQuoteById, updatePriceQuote } from '../../apis/priceQuote.api'
import type { PriceQuoteResponse, CreatePriceQuoteRequest } from '../../types/chat.types'
import { QuoteStatus } from '../../types/chat.types'
import { toast } from 'react-toastify'

interface UpdateQuoteModalProps {
  quoteId: number
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function UpdateQuoteModal({
  quoteId,
  isOpen,
  onClose,
  onSuccess
}: UpdateQuoteModalProps) {
  const [quote, setQuote] = useState<PriceQuoteResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form fields
  const [delivery, setDelivery] = useState<string>('')
  const [deposit, setDeposit] = useState<string>('')
  const [complete, setComplete] = useState<string>('')
  const [service, setService] = useState<string>('')
  const [staffDescription, setStaffDescription] = useState<string>('')

  const deliveryNum = parseFloat(delivery) || 0
  const depositNum = parseFloat(deposit) || 0
  const completeNum = parseFloat(complete) || 0
  const serviceNum = parseFloat(service) || 0
  const total = deliveryNum + depositNum + completeNum + serviceNum

  // Load quote details
  useEffect(() => {
    if (isOpen && quoteId) {
      loadQuote()
    }
  }, [isOpen, quoteId])

  const loadQuote = async () => {
    setIsLoading(true)
    try {
      const data = await getPriceQuoteById(quoteId)
      
      if (data.status !== QuoteStatus.RejectedManager) {
        toast.error('This quote cannot be edited')
        onClose()
        return
      }

      setQuote(data)
      
      // Pre-fill form with current values
      setDelivery(data.delivery?.toString() || '0')
      setDeposit(data.deposit?.toString() || '0')
      setComplete(data.complete?.toString() || '0')
      setService(data.service?.toString() || '0')
      setStaffDescription(data.staffDescription || '')
    } catch (error) {
      console.error('Failed to load quote:', error)
      toast.error('Failed to load quote details')
      onClose()
    } finally {
      setIsLoading(false)
    }
  }

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

    // Check if anything changed
    if (quote) {
      const noChanges =
        deliveryNum === (quote.delivery || 0) &&
        depositNum === (quote.deposit || 0) &&
        completeNum === (quote.complete || 0) &&
        serviceNum === (quote.service || 0) &&
        staffDescription.trim() === (quote.staffDescription || '')

      if (noChanges) {
        toast.error('Please make at least one change before resubmitting')
        return
      }
    }

    setIsSubmitting(true)

    try {
      const request: Partial<CreatePriceQuoteRequest> = {
        delivery: deliveryNum,
        deposit: depositNum,
        complete: completeNum,
        service: serviceNum,
        staffDescription: staffDescription.trim()
      }

      await updatePriceQuote(quoteId, request)
      toast.success('Quote updated and resubmitted to Manager')
      
      onSuccess()
      onClose()
    } catch (error: any) {
      console.error('Failed to update quote:', error)
      toast.error(error.response?.data?.error || 'Failed to update quote')
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
            <h2 className="text-2xl font-bold text-gray-900">Update Price Quote</h2>
            {quote && (
              <p className="text-sm text-gray-600 mt-1">
                Quote #{quote.quoteNumber} • Rental ID: #{quote.rentalId}
              </p>
            )}
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-600">Loading quote details...</p>
          </div>
        ) : quote ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Manager Feedback */}
            {quote.managerFeedback && (
              <div className="animate-in slide-in-from-top-4 duration-300">
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-red-900 mb-1">
                      Manager Feedback - Please Address:
                    </p>
                    <p className="text-sm text-red-800 whitespace-pre-wrap leading-relaxed">
                      {quote.managerFeedback}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Original vs New Comparison */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-blue-900 mb-2">Original Quote Total</p>
              <p className="text-2xl font-bold text-blue-700">
                ${quote.total.toLocaleString()}
              </p>
            </div>

            {/* Cost Breakdown */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Cost Breakdown</h3>
              
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
                    Original: ${quote.delivery?.toLocaleString() || '0.00'}
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
                  <p className="text-xs text-gray-500 mt-1">
                    Original: ${quote.deposit?.toLocaleString() || '0.00'}
                  </p>
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
                  <p className="text-xs text-gray-500 mt-1">
                    Original: ${quote.complete?.toLocaleString() || '0.00'}
                  </p>
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
                  <p className="text-xs text-gray-500 mt-1">
                    Original: ${quote.service?.toLocaleString() || '0.00'}
                  </p>
                </div>
              </div>
            </div>

            {/* New Total Calculation */}
            <div className={`rounded-lg p-4 ${
              total !== quote.total ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-gray-900">New Total Amount:</span>
                <div className="text-right">
                  <span className="text-3xl font-bold text-blue-600">
                    ${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  {total !== quote.total && (
                    <p className="text-sm font-medium mt-1">
                      {total > quote.total ? (
                        <span className="text-red-600">
                          +${(total - quote.total).toLocaleString()} increase
                        </span>
                      ) : (
                        <span className="text-green-600">
                          -${(quote.total - total).toLocaleString()} decrease
                        </span>
                      )}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Updated Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Updated Staff Description <span className="text-red-600">*</span>
              </label>
              <textarea
                value={staffDescription}
                onChange={(e) => setStaffDescription(e.target.value)}
                rows={4}
                placeholder="Explain what changes you made based on Manager's feedback..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Describe how you addressed the Manager's concerns.
              </p>
            </div>

            {/* Info Box */}
            <div className="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="font-medium text-blue-900">After submitting:</p>
              <p className="text-blue-800 mt-1">
                ✓ This quote will be automatically sent back to Manager for re-approval
              </p>
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
                disabled={isSubmitting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <RefreshCw size={20} />
                    Update & Resubmit
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="p-12 text-center text-red-600">
            <p>Failed to load quote details</p>
          </div>
        )}
      </div>
    </div>
  )
}