// src/components/chat/CustomerQuoteDetailModal.tsx
import { useState } from 'react'
import { X, CheckCircle, ChevronDown, ChevronUp, XCircle, Truck } from 'lucide-react'
import type { PriceQuoteResponse } from '../../types/chat.types'
import { QuoteStatus } from '../../types/chat.types'
import { formatMoney } from '../../utils/format'

interface CustomerQuoteDetailModalProps {
  quote: PriceQuoteResponse | null
  allQuotes?: PriceQuoteResponse[]
  isOpen: boolean
  onClose: () => void
  onRejectQuote?: (quoteId: number, reason: string) => void
  onAcceptQuote?: (quoteId: number) => void
}

export default function CustomerQuoteDetailModal({
  quote,
  allQuotes = [],
  isOpen,
  onClose,
  onRejectQuote,
  onAcceptQuote
}: CustomerQuoteDetailModalProps) {
  const [showCompare, setShowCompare] = useState(false)
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  if (!isOpen || !quote) return null

  const whatsIncluded = [
    'Comprehensive Service Package',
    'Dedicated Account Manager',
    '24/7 Priority Support',
    'Advanced Analytics Reporting',
    'Custom Integration Options',
    'Quarterly Performance Reviews'
  ]

  const handleAccept = () => {
    if (onAcceptQuote) {
      onAcceptQuote(quote.id)
    }
  }

  const handleShowRejectForm = () => {
    setShowRejectForm(true)
  }

  const handleCancelReject = () => {
    setShowRejectForm(false)
    setRejectReason('')
  }

  const handleReject = () => {
    if (onRejectQuote) {
      onRejectQuote(quote.id, rejectReason.trim())
      setShowRejectForm(false)
      setRejectReason('')
    }
  }

  // Filter out current quote for comparison
  const otherQuotes = allQuotes.filter(q => q.id !== quote.id)
  const hasMultipleQuotes = otherQuotes.length > 0

  // Get status display
  const getStatusBadge = (status: string) => {
    switch (status) {
      case QuoteStatus.PendingCustomer:
        return 'bg-blue-100 text-blue-700'
      case QuoteStatus.RejectedCustomer:
        return 'bg-red-100 text-red-700'
      case QuoteStatus.Approved:
        return 'bg-green-100 text-green-700'
      case QuoteStatus.Expired:
        return 'bg-gray-100 text-gray-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case QuoteStatus.PendingManager:
        return 'Awaiting Manager Approval'
      case QuoteStatus.RejectedManager:
        return 'Needs Revision'
      case QuoteStatus.PendingCustomer:
        return 'Awaiting Your Review'
      case QuoteStatus.RejectedCustomer:
        return 'Rejected'
      case QuoteStatus.Approved:
        return 'Approved'
      case QuoteStatus.Expired:
        return 'Expired'
      default:
        return status
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Quote #{quote.quoteNumber} Details
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Created on {new Date(quote.createdAt || '').toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* What's Included */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">What's Included</h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3">
              {whatsIncluded.map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
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
                  <span className="text-gray-600">Phí thuê robot (30%)</span>
                  <span className="font-medium">{formatMoney(0.3 * quote.rentalFee)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Phí nhân viên (30%)</span>
                  <span className="font-medium">{formatMoney(0.3 * quote.staffFee)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Cọc thiệt hại</span>
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

          {/* Staff Notes */}
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

          {/* Compare Quotes Section */}
          {hasMultipleQuotes && (
            <div className="border border-gray-200 rounded-lg">
              <button
                onClick={() => setShowCompare(!showCompare)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <h3 className="text-lg font-semibold text-gray-900">Compare Quotes</h3>
                {showCompare ? (
                  <ChevronUp className="w-5 h-5 text-gray-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                )}
              </button>

              {showCompare && (
                <div className="border-t border-gray-200 p-4">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Item</th>
                          {allQuotes.map((q) => (
                            <th key={q.id} className="text-right px-4 py-3 text-sm font-semibold text-gray-700">
                              Quote #{q.quoteNumber}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {/* Deposit Components */}
                        <tr>
                          <td className="px-4 py-2 text-emerald-700 font-medium">Tổng đặt cọc</td>
                          {allQuotes.map((q) => (
                            <td key={q.id} className="px-4 py-2 text-right text-emerald-700 font-semibold">
                              {formatMoney(q.totalDeposit)}
                            </td>
                          ))}
                        </tr>
                        {/* Payment Components */}
                        <tr>
                          <td className="px-4 py-2 text-blue-700 font-medium">Tổng thanh toán</td>
                          {allQuotes.map((q) => (
                            <td key={q.id} className="px-4 py-2 text-right text-blue-700 font-semibold">
                              {formatMoney(q.totalPayment)}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="px-4 py-2 text-purple-700">Phí giao hàng</td>
                          {allQuotes.map((q) => (
                            <td key={q.id} className="px-4 py-2 text-right text-purple-700">
                              {formatMoney(q.deliveryFee || 0)}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="px-4 py-2 text-amber-700">Phí tùy chỉnh</td>
                          {allQuotes.map((q) => (
                            <td key={q.id} className="px-4 py-2 text-right text-amber-700">
                              {formatMoney(q.customizationFee)}
                            </td>
                          ))}
                        </tr>
                        <tr className="bg-gray-100 font-bold">
                          <td className="px-4 py-3 text-gray-900">Tổng giá trị</td>
                          {allQuotes.map((q) => (
                            <td key={q.id} className={`px-4 py-3 text-right ${q.id === quote.id ? 'text-blue-600' : 'text-gray-900'}`}>
                              {formatMoney(q.grandTotal)}
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Status */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Quote Status</h3>
            <div className={`inline-block px-4 py-2 rounded-lg font-medium ${getStatusBadge(quote.status || '')}`}>
              {getStatusText(quote.status || '')}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6">
          {quote.status === QuoteStatus.PendingCustomer ? (
            <>
              {!showRejectForm ? (
                <div className="flex gap-3">
                  <button
                    onClick={handleShowRejectForm}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors font-semibold"
                  >
                    <XCircle size={20} />
                    Reject Quote
                  </button>
                  <button
                    onClick={handleAccept}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                  >
                    <CheckCircle size={20} />
                    Accept This Quote
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason for rejection (optional)
                    </label>
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Let us know why this quote doesn't work for you..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleCancelReject}
                      className="flex-1 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleReject}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
                    >
                      <XCircle size={20} />
                      Confirm Rejection
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : quote.status === QuoteStatus.Approved ? (
            <div className="text-center py-3">
              <p className="text-green-600 font-semibold text-lg">✅ This quote has been accepted</p>
            </div>
          ) : quote.status === QuoteStatus.Expired ? (
            <div className="text-center py-3">
              <p className="text-red-600 font-semibold text-lg">⏰ This quote has expired (3 quotes limit reached)</p>
            </div>
          ) : quote.status === QuoteStatus.RejectedCustomer ? (
            <div className="text-center py-3">
              <p className="text-red-600 font-semibold text-lg">❌ Quote rejected - New quote will be created</p>
            </div>
          ) : (
            <button
              onClick={onClose}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  )
}