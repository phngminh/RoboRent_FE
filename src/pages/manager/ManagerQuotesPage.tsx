// src/pages/manager/ManagerQuotesPage.tsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, DollarSign, Clock, CheckCircle, XCircle, Calendar, Package, User } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { signalRService } from '../../utils/signalr'
import { getAllQuotesForManager } from '../../apis/priceQuote.api'
import type { ManagerQuoteListItemResponse } from '../../types/chat.types'
import { QuoteStatus } from '../../types/chat.types'
import Header from '../../components/header'
import QuoteApprovalModal from '../../components/manager/QuoteApprovalModal'
import { toast } from 'react-toastify'
import { formatMoney } from '../../utils/format'

export default function ManagerQuotesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'reviewed'>('pending')
  const [selectedQuote, setSelectedQuote] = useState<number | null>(null)
  const [quotes, setQuotes] = useState<ManagerQuoteListItemResponse[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Load quotes from API
  useEffect(() => {
    loadQuotes()
  }, [])

  const loadQuotes = async () => {
    setIsLoading(true)
    try {
      const data = await getAllQuotesForManager()
      setQuotes(data)
    } catch (error) {
      console.error('Failed to load quotes:', error)
      toast.error('Failed to load quotes')
    } finally {
      setIsLoading(false)
    }
  }

  // SignalR listener
  useEffect(() => {
    const setupSignalR = async () => {
      try {
        await signalRService.connect()

        const handleQuoteStatusChanged = (data: {
          QuoteId: number
          Status: string
          QuoteNumber: number
          Total: number
        }) => {
          console.log('📢 Manager: Quote status changed:', data)
          // Refresh quotes list
          loadQuotes()
        }

        signalRService.onQuoteStatusChanged(handleQuoteStatusChanged)
      } catch (error) {
        console.error('SignalR setup failed:', error)
      }
    }

    setupSignalR()

    return () => {
      signalRService.offQuoteStatusChanged()
    }
  }, [])

  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = 
      quote.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quote.rentalId.toString().includes(searchQuery) ||
      quote.packageName.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesFilter = 
      filterStatus === 'all' ||
      (filterStatus === 'pending' && quote.status === QuoteStatus.PendingManager) ||
      (filterStatus === 'reviewed' && quote.status !== QuoteStatus.PendingManager)

    return matchesSearch && matchesFilter
  })

  const pendingCount = quotes.filter(q => q.status === QuoteStatus.PendingManager).length
  const reviewedCount = quotes.filter(q => q.status !== QuoteStatus.PendingManager).length

  const getStatusBadge = (status: string) => {
    switch (status) {
      case QuoteStatus.PendingManager:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
            <Clock size={14} />
            Pending Review
          </span>
        )
      case QuoteStatus.PendingCustomer:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
            <CheckCircle size={14} />
            Approved
          </span>
        )
      case QuoteStatus.RejectedManager:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
            <XCircle size={14} />
            Rejected
          </span>
        )
      default:
        return (
          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
            {status}
          </span>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="pt-16">
        {/* Header Section */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Price Quote Management</h1>
                <p className="text-gray-600 mt-1">Review and approve customer quotes</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-gray-500">Pending Review</p>
                  <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
                </div>
                <div className="w-px h-12 bg-gray-300" />
                <div className="text-right">
                  <p className="text-sm text-gray-500">Reviewed</p>
                  <p className="text-2xl font-bold text-green-600">{reviewedCount}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4 mb-6">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by customer, rental ID, or package..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Status Filter */}
            <div className="flex gap-2 bg-white border border-gray-300 rounded-lg p-1">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filterStatus === 'all'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                All ({quotes.length})
              </button>
              <button
                onClick={() => setFilterStatus('pending')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filterStatus === 'pending'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Pending ({pendingCount})
              </button>
              <button
                onClick={() => setFilterStatus('reviewed')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filterStatus === 'reviewed'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Reviewed ({reviewedCount})
              </button>
            </div>
          </div>

          {/* Quotes Grid */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-600 mt-4">Loading quotes...</p>
            </div>
          ) : filteredQuotes.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredQuotes.map((quote) => (
                <div
                  key={quote.id}
                  className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-gray-900">
                          Quote #{quote.quoteNumber}
                        </h3>
                        {getStatusBadge(quote.status)}
                      </div>
                      <p className="text-sm text-gray-500">
                        Rental ID: #{quote.rentalId} • Created {quote.createdAt ? new Date(quote.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="space-y-2 mb-4 pb-4 border-b border-gray-200">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-purple-600" />
                      <span className="font-medium text-gray-900">{quote.customerName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Package className="w-4 h-4 text-purple-600" />
                      <span>{quote.packageName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4 text-purple-600" />
                      <span>{quote.eventDate}</span>
                    </div>
                  </div>

                  {/* Price Breakdown */}
                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex justify-between text-gray-600">
                      <span>Delivery Fee (Auto)</span>
                      <span className="font-medium">{formatMoney(quote.deliveryFee ?? 0)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Deposit</span>
                      <span className="font-medium">{formatMoney(quote.deposit ?? 0)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Completion</span>
                      <span className="font-medium">{formatMoney(quote.complete ?? 0)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Service</span>
                      <span className="font-medium">{formatMoney(quote.service ?? 0)}</span>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="flex justify-between items-center pt-4 border-t border-gray-200 mb-4">
                    <span className="text-lg font-bold text-gray-900">Total Amount</span>
                    <span className="text-2xl font-bold text-purple-600">
                      {formatMoney(quote.total)}
                    </span>
                  </div>

                  {/* Staff Description */}
                  {quote.staffDescription && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                      <p className="text-xs font-semibold text-blue-900 mb-1">Staff Notes:</p>
                      <p className="text-sm text-blue-800">{quote.staffDescription}</p>
                    </div>
                  )}

                  {/* Actions */}
                  {quote.status === QuoteStatus.PendingManager && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => setSelectedQuote(quote.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                      >
                        <DollarSign size={18} />
                        Review Quote
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg font-medium">No quotes found</p>
              <p className="text-gray-500 text-sm mt-1">
                {searchQuery
                  ? 'Try adjusting your search criteria'
                  : 'All quotes have been reviewed'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quote Approval Modal */}
      {selectedQuote && (
        <QuoteApprovalModal
          quoteId={selectedQuote}
          rentalInfo={quotes.find(q => q.id === selectedQuote)}
          isOpen={!!selectedQuote}
          onClose={() => setSelectedQuote(null)}
          onSuccess={() => {
            setSelectedQuote(null)
            loadQuotes()
            toast.success('Quote reviewed successfully')
          }}
        />
      )}
    </div>
  )
}