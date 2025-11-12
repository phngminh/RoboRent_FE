// src/components/chat/StaffQuoteDetailModal.tsx
import { X, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react'
import type { PriceQuoteResponse } from '../../types/chat.types'
import { QuoteStatus } from '../../types/chat.types'

interface StaffQuoteDetailModalProps {
  quote: PriceQuoteResponse | null
  isOpen: boolean
  onClose: () => void
  onUpdateQuote?: (quoteId: number) => void
}

export default function StaffQuoteDetailModal({ 
  quote, 
  isOpen, 
  onClose,
  onUpdateQuote
}: StaffQuoteDetailModalProps) {
  if (!isOpen || !quote) return null

  const whatsIncluded = [
    'Comprehensive Service Package',
    'Dedicated Account Manager',
    '24/7 Priority Support',
    'Advanced Analytics Reporting',
    'Custom Integration Options',
    'Quarterly Performance Reviews'
  ]

  const getStatusConfig = (status: string) => {
    switch (status) {
      case QuoteStatus.PendingManager:
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-300',
          text: 'text-yellow-800',
          icon: '⏳',
          label: 'Pending Manager Review'
        }
      case QuoteStatus.RejectedManager:
        return {
          bg: 'bg-orange-50',
          border: 'border-orange-300',
          text: 'text-orange-800',
          icon: '❌',
          label: 'Rejected by Manager - Action Required'
        }
      case QuoteStatus.PendingCustomer:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-300',
          text: 'text-blue-800',
          icon: '👀',
          label: 'Waiting for Customer Response'
        }
      case QuoteStatus.Approved:
        return {
          bg: 'bg-green-50',
          border: 'border-green-300',
          text: 'text-green-800',
          icon: '✅',
          label: 'Accepted by Customer'
        }
      case QuoteStatus.RejectedCustomer:
        return {
          bg: 'bg-red-50',
          border: 'border-red-300',
          text: 'text-red-800',
          icon: '✗',
          label: 'Rejected by Customer'
        }
      case QuoteStatus.Expired:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-300',
          text: 'text-gray-800',
          icon: '⏰',
          label: 'Quote Expired'
        }
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-300',
          text: 'text-gray-800',
          icon: '•',
          label: status
        }
    }
  }

  const statusConfig = getStatusConfig(quote.status || '')

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
          <div className="flex items-center justify-between mb-4">
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

          {/* Big Status Badge */}
          <div className={`${statusConfig.bg} ${statusConfig.border} border-2 rounded-xl p-4 flex items-center gap-3`}>
            <span className="text-3xl">{statusConfig.icon}</span>
            <div className="flex-1">
              <p className={`text-lg font-bold ${statusConfig.text}`}>
                {statusConfig.label}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {quote.status === QuoteStatus.PendingManager && 'Waiting for manager approval before sending to customer'}
                {quote.status === QuoteStatus.RejectedManager && 'Manager has requested changes - please update and resubmit'}
                {quote.status === QuoteStatus.PendingCustomer && 'Quote has been sent to customer - awaiting their decision'}
                {quote.status === QuoteStatus.Approved && 'Customer has accepted this quote - proceed with contract'}
                {quote.status === QuoteStatus.RejectedCustomer && 'Customer has rejected this quote - review feedback and create new quote'}
                {quote.status === QuoteStatus.Expired && 'This quote has expired (3 quotes limit reached)'}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Manager Feedback - Prominent Display */}
          {quote.managerFeedback && (
            <div className="animate-in slide-in-from-top-4 duration-300">
              <div className="bg-orange-50 border-2 border-orange-300 rounded-xl p-5">
                <div className="flex items-start gap-3 mb-3">
                  <AlertCircle className="w-6 h-6 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-lg font-bold text-orange-900 mb-1">
                      Manager Feedback
                    </p>
                    <p className="text-sm text-orange-700">
                      Please address the following concerns before resubmitting:
                    </p>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-orange-200">
                  <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                    {quote.managerFeedback}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Customer Rejection Reason */}
          {quote.customerReason && (
            <div className="bg-red-50 border-2 border-red-300 rounded-xl p-5">
              <div className="flex items-start gap-3 mb-3">
                <AlertCircle className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-lg font-bold text-red-900 mb-1">
                    Customer Feedback
                  </p>
                  <p className="text-sm text-red-700">
                    Customer rejected this quote with the following reason:
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-red-200">
                <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                  {quote.customerReason}
                </p>
              </div>
            </div>
          )}

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
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Notes</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {quote.staffDescription}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6">
          {quote.status === QuoteStatus.RejectedManager && onUpdateQuote ? (
            <button
              onClick={() => onUpdateQuote(quote.id)}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-semibold"
            >
              <RefreshCw size={20} />
              Update & Resubmit Quote
            </button>
          ) : quote.status === QuoteStatus.PendingManager ? (
            <div className="text-center py-3">
              <p className="text-yellow-600 font-semibold text-lg">⏳ Waiting for Manager approval</p>
            </div>
          ) : quote.status === QuoteStatus.PendingCustomer ? (
            <div className="text-center py-3">
              <p className="text-blue-600 font-semibold text-lg">👀 Customer is reviewing this quote</p>
            </div>
          ) : quote.status === QuoteStatus.Approved ? (
            <div className="text-center py-3">
              <p className="text-green-600 font-semibold text-lg">✅ Quote accepted - Ready for contract</p>
            </div>
          ) : quote.status === QuoteStatus.RejectedCustomer ? (
            <div className="text-center py-3">
              <p className="text-red-600 font-semibold text-lg">❌ Customer rejected - Create new quote</p>
            </div>
          ) : quote.status === QuoteStatus.Expired ? (
            <div className="text-center py-3">
              <p className="text-gray-600 font-semibold text-lg">⏰ Quote expired (3 quotes limit reached)</p>
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