// src/components/chat/QuoteCard.tsx
import { ExternalLink } from 'lucide-react'
import type { PriceQuoteResponse } from '../../types/chat.types'
import { QuoteStatus } from '../../types/chat.types'

interface QuoteCardProps {
  quote: PriceQuoteResponse
  onViewDetails?: () => void
  isNew?: boolean 
}

export default function QuoteCard({ quote, onViewDetails, isNew = false }: QuoteCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case QuoteStatus.PendingManager:
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case QuoteStatus.RejectedManager:
        return 'bg-orange-100 text-orange-700 border-orange-200'
      case QuoteStatus.PendingCustomer:
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case QuoteStatus.RejectedCustomer:
        return 'bg-red-100 text-red-700 border-red-200'
      case QuoteStatus.Approved:
        return 'bg-green-100 text-green-700 border-green-200'
      case QuoteStatus.Expired:
        return 'bg-gray-100 text-gray-700 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case QuoteStatus.PendingManager:
        return '⏳'
      case QuoteStatus.PendingCustomer:
        return '👀'
      case QuoteStatus.RejectedManager:
        return '📝'
      case QuoteStatus.RejectedCustomer:
        return '✗'
      case QuoteStatus.Approved:
        return '✓'
      case QuoteStatus.Expired:
        return '⏰'
      default:
        return '•'
    }
  }

  return (
    <div className={`bg-white rounded-xl border-2 p-4 hover:shadow-md transition-shadow relative ${
      isNew ? 'border-orange-400 shadow-lg' : 'border-gray-200'
    }`}>
      {/* NEW Badge */}
      {isNew && (
        <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
          NEW
        </span>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900">
            Quote #{quote.quoteNumber}
          </h3>
          <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(quote.status)}`}>
            {getStatusIcon(quote.status)} {quote.status}
          </span>
        </div>
        <span className="text-xs text-gray-500">
          {new Date(quote.createdAt).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          })}
        </span>
      </div>

      {/* Price breakdown */}
      <div className="space-y-1 mb-3 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Delivery</span>
          <span>${quote.delivery?.toLocaleString() || '0.00'}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Deposit</span>
          <span>${quote.deposit?.toLocaleString() || '0.00'}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Complete</span>
          <span>${quote.complete?.toLocaleString() || '0.00'}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Service</span>
          <span>${quote.service?.toLocaleString() || '0.00'}</span>
        </div>
      </div>

      {/* Total */}
      <div className="flex justify-between items-center pt-3 border-t border-gray-200 mb-3">
        <span className="font-semibold text-gray-900">Total Amount</span>
        <span className="text-xl font-bold text-blue-600">
          ${quote.total.toLocaleString()}
        </span>
      </div>

      {/* View Details button */}
      {onViewDetails && (
        <button
          onClick={onViewDetails}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          View Details
          <ExternalLink size={16} />
        </button>
      )}
    </div>
  )
}