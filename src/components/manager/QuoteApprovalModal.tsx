// src/components/manager/QuoteApprovalModal.tsx
import { useState, useEffect } from 'react'
import { X, CheckCircle, XCircle, AlertCircle, Calendar, Package, User, Truck } from 'lucide-react'
import { getPriceQuoteById, managerAction } from '../../apis/priceQuote.api'
import type { PriceQuoteResponse, ManagerQuoteListItemResponse } from '../../types/chat.types'
import { toast } from 'react-toastify'
import { formatMoney } from '../../utils/format'

interface QuoteApprovalModalProps {
  quoteId: number
  rentalInfo?: ManagerQuoteListItemResponse // Optional: rental info from list
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function QuoteApprovalModal({
  quoteId,
  rentalInfo,
  isOpen,
  onClose,
  onSuccess
}: QuoteApprovalModalProps) {
  const [quote, setQuote] = useState<PriceQuoteResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [action, setAction] = useState<'approve' | 'reject' | null>(null)
  const [feedback, setFeedback] = useState('')

  useEffect(() => {
    if (isOpen && quoteId) {
      loadQuote()
    }
  }, [isOpen, quoteId])

  const loadQuote = async () => {
    setIsLoading(true)
    try {
      const data = await getPriceQuoteById(quoteId)
      setQuote(data)
    } catch (error) {
      console.error('Failed to load quote:', error)
      toast.error('Failed to load quote details')
      onClose()
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!action) return

    if (action === 'reject' && !feedback.trim()) {
      toast.error('Please provide feedback for rejection')
      return
    }

    setIsSubmitting(true)
    try {
      await managerAction(quoteId, action, action === 'reject' ? feedback.trim() : undefined)
      toast.success(`Quote ${action === 'approve' ? 'approved' : 'rejected'} successfully`)
      onSuccess()
    } catch (error: any) {
      console.error('Failed to perform action:', error)
      toast.error(error.response?.data?.error || 'Failed to perform action')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Review Price Quote</h2>
            {quote && (
              <p className="text-sm text-gray-600 mt-1">
                Quote #{quote.quoteNumber} • Rental ID: #{quote.rentalId}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-600">Loading quote details...</p>
          </div>
        ) : quote ? (
          <div className="p-6 space-y-6">
            {/* Customer & Event Info */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-purple-900 mb-3">Rental Information</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-purple-800">
                  <User className="w-4 h-4 flex-shrink-0" />
                  <span className="font-medium">{rentalInfo?.customerName || 'Customer'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-purple-800">
                  <Package className="w-4 h-4 flex-shrink-0" />
                  <span>{rentalInfo?.packageName || 'Package'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-purple-800">
                  <Calendar className="w-4 h-4 flex-shrink-0" />
                  <span>
                    {rentalInfo?.eventDate
                      ? new Date(rentalInfo.eventDate).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })
                      : 'Event Date TBD'}
                  </span>
                </div>
              </div>
            </div>

            {/* Cost Breakdown - Two Phase Pricing */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Chi tiết báo giá</h3>

              {/* === PHASE 1: DEPOSIT (LOCKED) === */}
              <div className="bg-gradient-to-r from-blue-50 to-violet-50 rounded-lg p-4 mb-4 border border-blue-200">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-blue-600 text-xl">💰</span>
                  <span className="font-bold text-blue-800">PHASE 1: Đặt cọc trước</span>
                  <span className="text-xs bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full">🔒 LOCKED</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Phí thuê robot</span>
                    <span className="font-medium">{formatMoney(quote.rentalFee)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Phí nhân viên kỹ thuật</span>
                    <span className="font-medium">{formatMoney(quote.staffFee)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tiền cọc thiệt hại</span>
                    <span className="font-medium">{formatMoney(quote.damageDeposit)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-blue-200">
                    <span className="font-bold text-blue-800">Tổng đặt cọc</span>
                    <span className="font-bold text-blue-800 text-lg">{formatMoney(quote.totalDeposit)}</span>
                  </div>
                </div>
              </div>

              {/* === PHASE 2: PAYMENT (ADJUSTABLE) === */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-4 border border-blue-200">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-blue-600 text-xl">💳</span>
                  <span className="font-bold text-blue-800">PHASE 2: Thanh toán sau sự kiện</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Còn lại (70%)</span>
                    <span className="font-medium">{formatMoney(0.7 * (quote.rentalFee + quote.staffFee))}</span>
                  </div>
                  {quote.deliveryFee && quote.deliveryFee > 0 && (
                    <div className="flex justify-between text-sm text-purple-600">
                      <span className="flex items-center gap-1">
                        <Truck className="w-3 h-3" /> Phí giao hàng
                        {quote.deliveryDistance && <span className="text-xs">({quote.deliveryDistance}km)</span>}
                      </span>
                      <span className="font-medium">{formatMoney(quote.deliveryFee)}</span>
                    </div>
                  )}
                  {quote.customizationFee > 0 && (
                    <div className="flex justify-between text-sm text-purple-600">
                      <span>✨ Phí tùy chỉnh</span>
                      <span className="font-medium">{formatMoney(quote.customizationFee)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-blue-200">
                    <span className="font-bold text-blue-800">Tổng thanh toán</span>
                    <span className="font-bold text-blue-800 text-lg">{formatMoney(quote.totalPayment)}</span>
                  </div>
                </div>
              </div>

              {/* === GRAND TOTAL === */}
              <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white text-lg">🎯 TỔNG GIÁ TRỊ</span>
                  <span className="font-bold text-2xl text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                    {formatMoney(quote.grandTotal)}
                  </span>
                </div>
              </div>
            </div>

            {/* Staff Description */}
            {quote.staffDescription && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Staff Notes</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {quote.staffDescription}
                  </p>
                </div>
              </div>
            )}

            {/* Action Selection */}
            {!action && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Decision</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setAction('approve')}
                    className="flex items-center justify-center gap-3 p-6 border-2 border-green-500 bg-green-50 rounded-xl hover:bg-green-100 transition-colors group"
                  >
                    <CheckCircle className="w-8 h-8 text-green-600 group-hover:scale-110 transition-transform" />
                    <div className="text-left">
                      <p className="font-bold text-gray-900">Approve Quote</p>
                      <p className="text-sm text-gray-600">Send to customer</p>
                    </div>
                  </button>
                  <button
                    onClick={() => setAction('reject')}
                    className="flex items-center justify-center gap-3 p-6 border-2 border-red-500 bg-red-50 rounded-xl hover:bg-red-100 transition-colors group"
                  >
                    <XCircle className="w-8 h-8 text-red-600 group-hover:scale-110 transition-transform" />
                    <div className="text-left">
                      <p className="font-bold text-gray-900">Reject Quote</p>
                      <p className="text-sm text-gray-600">Request changes</p>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Reject Feedback */}
            {action === 'reject' && (
              <div className="animate-in slide-in-from-top-4 duration-300">
                <div className="flex items-start gap-3 p-4 bg-orange-50 border border-orange-200 rounded-lg mb-4">
                  <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-orange-900">Rejection Feedback Required</p>
                    <p className="text-xs text-orange-700 mt-1">
                      Please explain what needs to be changed so the staff can revise the quote.
                    </p>
                  </div>
                </div>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Feedback for Staff <span className="text-red-600">*</span>
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={4}
                  placeholder="Example: The service fee is too high. Please reduce it to under $250. Also, consider offering a discount on the delivery fee for this corporate client."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Staff will receive this feedback and can update the quote accordingly.
                </p>
              </div>
            )}

            {/* Approve Confirmation */}
            {action === 'approve' && (
              <div className="animate-in slide-in-from-top-4 duration-300">
                <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-green-900">Ready to Approve</p>
                    <p className="text-xs text-green-700 mt-1">
                      This quote will be sent to the customer for final approval.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-12 text-center text-red-600">
            <p>Failed to load quote details</p>
          </div>
        )}

        {/* Footer Actions */}
        {quote && !isLoading && (
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6">
            {action ? (
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setAction(null)
                    setFeedback('')
                  }}
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold disabled:opacity-50"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || (action === 'reject' && !feedback.trim())}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${action === 'approve'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                    }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : action === 'approve' ? (
                    <>
                      <CheckCircle size={20} />
                      Confirm Approval
                    </>
                  ) : (
                    <>
                      <XCircle size={20} />
                      Confirm Rejection
                    </>
                  )}
                </button>
              </div>
            ) : (
              <button
                onClick={onClose}
                disabled={isSubmitting}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Close
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}