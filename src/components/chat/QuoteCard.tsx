// src/components/chat/QuoteCard.tsx
import { ExternalLink, Truck, Lock, Wallet, CreditCard, Sparkles, Clock } from 'lucide-react'
import type { PriceQuoteResponse } from '../../types/chat.types'
import { QuoteStatus } from '../../types/chat.types'
import { formatMoney } from '../../utils/format'

interface QuoteCardProps {
  quote: PriceQuoteResponse
  onViewDetails?: () => void
  isNew?: boolean
}

export default function QuoteCard({ quote, onViewDetails, isNew = false }: QuoteCardProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case QuoteStatus.PendingManager:
        return {
          bg: 'bg-gradient-to-r from-amber-50 to-yellow-50',
          border: 'border-amber-300',
          text: 'text-amber-700',
          icon: '⏳',
          label: 'Chờ duyệt',
          glow: 'animate-glow-pending',
          dot: 'bg-amber-400'
        }
      case QuoteStatus.RejectedManager:
        return {
          bg: 'bg-gradient-to-r from-orange-50 to-amber-50',
          border: 'border-orange-300',
          text: 'text-orange-700',
          icon: '📝',
          label: 'Cần sửa',
          glow: '',
          dot: 'bg-orange-400'
        }
      case QuoteStatus.PendingCustomer:
        return {
          bg: 'bg-gradient-to-r from-blue-50 to-indigo-50',
          border: 'border-blue-300',
          text: 'text-blue-700',
          icon: '👀',
          label: 'Chờ khách hàng',
          glow: 'animate-glow-pulse',
          dot: 'bg-blue-400'
        }
      case QuoteStatus.RejectedCustomer:
        return {
          bg: 'bg-gradient-to-r from-red-50 to-rose-50',
          border: 'border-red-300',
          text: 'text-red-700',
          icon: '✗',
          label: 'Bị từ chối',
          glow: '',
          dot: 'bg-red-400'
        }
      case QuoteStatus.Approved:
        return {
          bg: 'bg-gradient-to-r from-emerald-50 to-green-50',
          border: 'border-emerald-300',
          text: 'text-emerald-700',
          icon: '✓',
          label: 'Đã duyệt',
          glow: 'animate-glow-success',
          dot: 'bg-emerald-400'
        }
      case QuoteStatus.Expired:
        return {
          bg: 'bg-gradient-to-r from-slate-50 to-gray-50',
          border: 'border-slate-300',
          text: 'text-slate-600',
          icon: '⏰',
          label: 'Hết hạn',
          glow: '',
          dot: 'bg-slate-400'
        }
      default:
        return {
          bg: 'bg-gradient-to-r from-slate-50 to-gray-50',
          border: 'border-slate-200',
          text: 'text-slate-600',
          icon: '•',
          label: status,
          glow: '',
          dot: 'bg-slate-400'
        }
    }
  }

  const statusConfig = getStatusConfig(quote.status)

  // Calculate 30% deposit portions
  const rentalFeeDeposit = 0.3 * quote.rentalFee
  const staffFeeDeposit = 0.3 * quote.staffFee

  return (
    <div className={`group relative bg-white rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${isNew
        ? 'ring-2 ring-orange-400 shadow-md shadow-orange-200/50'
        : 'shadow-md hover:shadow-violet-200/50'
      }`}>
      {/* NEW Badge */}
      {isNew && (
        <div className="absolute -top-1 -right-1 z-10">
          <div className="px-2 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-bold rounded-bl-lg rounded-tr-lg shadow animate-pulse">
            NEW
          </div>
        </div>
      )}

      <div className="p-4">
        {/* Header - Compact */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {/* Quote Number Badge */}
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-sm">
              <span className="text-sm font-bold text-white">#{quote.quoteNumber}</span>
            </div>

            {/* Status Badge */}
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-xs ${statusConfig.bg} ${statusConfig.border} ${statusConfig.glow}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot} ${statusConfig.glow ? 'animate-pulse' : ''}`} />
              <span className={`font-medium ${statusConfig.text}`}>
                {statusConfig.icon} {statusConfig.label}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-[10px] text-slate-400">
            <Clock className="w-3 h-3" />
            {new Date(quote.createdAt).toLocaleDateString('vi-VN', {
              day: '2-digit',
              month: 'short'
            })}
          </div>
        </div>

        {/* === PHASE 1: DEPOSIT - FIXED: Show 30% portions === */}
        <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 p-3 mb-2 border border-slate-700">
          <div className="flex items-center gap-1.5 mb-2">
            <div className="p-1 bg-blue-500/20 rounded">
              <Wallet className="w-3 h-3 text-blue-400" />
            </div>
            <span className="text-xs font-bold text-white">PHASE 1</span>
            <span className="flex items-center gap-0.5 text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded">
              <Lock className="w-2.5 h-2.5" /> Đặt cọc
            </span>
          </div>

          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>Phí thuê robot (30%)</span>
              <span className="font-medium text-white">{formatMoney(rentalFeeDeposit)}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Phí nhân viên (30%)</span>
              <span className="font-medium text-white">{formatMoney(staffFeeDeposit)}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Cọc thiệt hại</span>
              <span className="font-medium text-white">{formatMoney(quote.damageDeposit)}</span>
            </div>
            <div className="flex justify-between pt-1.5 border-t border-slate-700">
              <span className="font-bold text-blue-400">Tổng đặt cọc</span>
              <span className="font-bold text-blue-400">{formatMoney(quote.totalDeposit)}</span>
            </div>
          </div>
        </div>

        {/* === PHASE 2: PAYMENT === */}
        <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-violet-50 to-indigo-50 p-3 mb-2 border border-violet-200">
          <div className="flex items-center gap-1.5 mb-2">
            <div className="p-1 bg-violet-200 rounded">
              <CreditCard className="w-3 h-3 text-violet-600" />
            </div>
            <span className="text-xs font-bold text-violet-900">PHASE 2</span>
            <span className="text-[10px] bg-violet-200 text-violet-700 px-1.5 py-0.5 rounded">Thanh toán sau</span>
          </div>

          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Còn lại (70%)</span>
              <span className="font-medium">{formatMoney(0.7 * (quote.rentalFee + quote.staffFee))}</span>
            </div>
            {quote.deliveryFee && quote.deliveryFee > 0 && (
              <div className="flex justify-between text-violet-600">
                <span className="flex items-center gap-0.5">
                  <Truck className="w-2.5 h-2.5" /> Phí giao hàng
                </span>
                <span className="font-medium">{formatMoney(quote.deliveryFee)}</span>
              </div>
            )}
            {quote.customizationFee > 0 && (
              <div className="flex justify-between text-violet-600">
                <span className="flex items-center gap-0.5">
                  <Sparkles className="w-2.5 h-2.5" /> Phí tùy chỉnh
                </span>
                <span className="font-medium">{formatMoney(quote.customizationFee)}</span>
              </div>
            )}
            <div className="flex justify-between pt-1.5 border-t border-violet-200">
              <span className="font-bold text-violet-700">Tổng thanh toán</span>
              <span className="font-bold text-violet-700">{formatMoney(quote.totalPayment)}</span>
            </div>
          </div>
        </div>

        {/* === GRAND TOTAL - Compact === */}
        <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-slate-900 via-violet-900 to-indigo-900 p-3 mb-3">
          <div className="relative flex justify-between items-center">
            <span className="font-bold text-white text-sm flex items-center gap-1.5">
              🎯 TỔNG GIÁ TRỊ
            </span>
            <span className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-300 via-purple-300 to-indigo-300">
              {formatMoney(quote.grandTotal)}
            </span>
          </div>
        </div>

        {/* View Details button */}
        {onViewDetails && (
          <button
            onClick={onViewDetails}
            className="w-full group/btn relative overflow-hidden bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-700 hover:via-purple-700 hover:to-indigo-700 text-white font-medium py-2 rounded-lg transition-all duration-300 shadow shadow-violet-300/30 hover:shadow-md flex items-center justify-center gap-1.5 text-sm"
          >
            <span className="relative z-10">Xem chi tiết</span>
            <ExternalLink size={14} className="relative z-10 group-hover/btn:translate-x-0.5 transition-transform" />
          </button>
        )}
      </div>
    </div>
  )
}