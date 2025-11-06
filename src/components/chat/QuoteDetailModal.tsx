// src/components/chat/QuoteDetailModal.tsx
import { useState } from 'react'
import { X, CheckCircle, ChevronDown, ChevronUp, XCircle } from 'lucide-react'
import type { PriceQuoteResponse } from '../../types/chat.types'
import { QuoteStatus } from '../../types/chat.types'

interface QuoteDetailModalProps {
  quote: PriceQuoteResponse | null
  allQuotes?: PriceQuoteResponse[]
  isOpen: boolean
  onClose: () => void
  onRejectQuote?: (quoteId: number, reason: string) => void
  onAcceptQuote?: (quoteId: number) => void
  isCustomer?: boolean
}

export default function QuoteDetailModal({ 
  quote, 
  allQuotes = [],
  isOpen, 
  onClose,
  onRejectQuote,
  onAcceptQuote,
  isCustomer = false
}: QuoteDetailModalProps) {
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
      case QuoteStatus.PendingManager:
        return 'bg-yellow-100 text-yellow-700'
      case QuoteStatus.RejectedManager:
        return 'bg-orange-100 text-orange-700'
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

          {/* Cost Breakdown */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Cost Breakdown</h3>
            <div className="bg-gray-50 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Item</th>
                    <th className="text-right px-4 py-3 text-sm font-semibold text-gray-700">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-3 text-gray-900">Delivery & Setup</td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">
                      ${quote.delivery?.toLocaleString() || '0.00'}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-gray-900">
                      Deposit <span className="text-sm text-gray-500">(Refundable)</span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">
                      ${quote.deposit?.toLocaleString() || '0.00'}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-gray-900">Completion Payment</td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">
                      ${quote.complete?.toLocaleString() || '0.00'}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-gray-900">Service & Support</td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">
                      ${quote.service?.toLocaleString() || '0.00'}
                    </td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="bg-gray-100 border-t-2 border-gray-300">
                    <td className="px-4 py-4 text-lg font-bold text-gray-900">Total Amount</td>
                    <td className="px-4 py-4 text-right text-2xl font-bold text-blue-600">
                      ${quote.total.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
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

          {/* Manager Feedback */}
          {quote.managerFeedback && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Manager Feedback</h3>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {quote.managerFeedback}
                </p>
              </div>
            </div>
          )}

          {/* Customer Reason */}
          {quote.customerReason && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Customer Feedback</h3>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {quote.customerReason}
                </p>
              </div>
            </div>
          )}

          {/* Compare Quotes Section */}
          {hasMultipleQuotes && isCustomer && (
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
                        <tr>
                          <td className="px-4 py-2 text-gray-700">Delivery & Setup</td>
                          {allQuotes.map((q) => (
                            <td key={q.id} className="px-4 py-2 text-right text-gray-900">
                              ${q.delivery?.toLocaleString() || '0'}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="px-4 py-2 text-gray-700">Deposit</td>
                          {allQuotes.map((q) => (
                            <td key={q.id} className="px-4 py-2 text-right text-gray-900">
                              ${q.deposit?.toLocaleString() || '0'}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="px-4 py-2 text-gray-700">Service & Support</td>
                          {allQuotes.map((q) => (
                            <td key={q.id} className="px-4 py-2 text-right text-gray-900">
                              ${q.service?.toLocaleString() || '0'}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="px-4 py-2 text-gray-700">Completion Payment</td>
                          {allQuotes.map((q) => (
                            <td key={q.id} className="px-4 py-2 text-right text-gray-900">
                              ${q.complete?.toLocaleString() || '0'}
                            </td>
                          ))}
                        </tr>
                        <tr className="bg-gray-50 font-semibold">
                          <td className="px-4 py-3 text-gray-900">Total</td>
                          {allQuotes.map((q) => (
                            <td key={q.id} className={`px-4 py-3 text-right ${q.id === quote.id ? 'text-blue-600' : 'text-gray-900'}`}>
                              ${q.total.toLocaleString()}
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
              {quote.status}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6">
          {isCustomer && quote.status === QuoteStatus.PendingCustomer ? (
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
          ) : quote.status === QuoteStatus.PendingManager ? (
            <div className="text-center py-3">
              <p className="text-yellow-600 font-semibold text-lg">⏳ Waiting for Manager approval</p>
            </div>
          ) : quote.status === QuoteStatus.RejectedManager ? (
            <div className="text-center py-3">
              <p className="text-orange-600 font-semibold text-lg">📝 Quote rejected by Manager - Staff will revise</p>
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