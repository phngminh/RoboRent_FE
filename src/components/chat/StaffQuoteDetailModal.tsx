// src/components/chat/StaffQuoteDetailModal.tsx
import { X, CheckCircle, AlertCircle, RefreshCw, Truck, Sparkles, Wallet, CreditCard, Lock, Clock, User, FileText, Zap } from 'lucide-react'
import type { PriceQuoteResponse } from '../../types/chat.types'
import { QuoteStatus } from '../../types/chat.types'
import { formatMoney } from '../../utils/format'

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
    { icon: '🤖', text: 'Robot thuê theo gói' },
    { icon: '👨‍💼', text: 'Nhân viên kỹ thuật đi kèm' },
    { icon: '🛡️', text: 'Bảo hiểm thiệt hại cơ bản' },
    { icon: '🚚', text: 'Vận chuyển đến địa điểm' },
    { icon: '🔧', text: 'Hỗ trợ kỹ thuật 24/7' },
    { icon: '📊', text: 'Báo cáo sau sự kiện' }
  ]

  const getStatusConfig = (status: string) => {
    switch (status) {
      case QuoteStatus.PendingManager:
        return {
          bg: 'from-amber-500 to-yellow-500',
          bgLight: 'bg-amber-50',
          border: 'border-amber-200',
          text: 'text-amber-800',
          icon: '⏳',
          label: 'Đang chờ Manager duyệt',
          description: 'Báo giá đang chờ manager xem xét trước khi gửi cho khách hàng',
          glow: 'shadow-amber-200/50'
        }
      case QuoteStatus.RejectedManager:
        return {
          bg: 'from-orange-500 to-red-500',
          bgLight: 'bg-orange-50',
          border: 'border-orange-200',
          text: 'text-orange-800',
          icon: '⚠️',
          label: 'Manager yêu cầu sửa',
          description: 'Manager đã gửi phản hồi - vui lòng cập nhật và gửi lại',
          glow: 'shadow-orange-200/50'
        }
      case QuoteStatus.PendingCustomer:
        return {
          bg: 'from-blue-500 to-indigo-500',
          bgLight: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-800',
          icon: '👀',
          label: 'Đang chờ khách hàng',
          description: 'Báo giá đã được gửi cho khách hàng - đang chờ phản hồi',
          glow: 'shadow-blue-200/50'
        }
      case QuoteStatus.Approved:
        return {
          bg: 'from-emerald-500 to-green-500',
          bgLight: 'bg-emerald-50',
          border: 'border-emerald-200',
          text: 'text-emerald-800',
          icon: '✅',
          label: 'Khách hàng đã chấp nhận',
          description: 'Tuyệt vời! Bạn có thể tiến hành tạo hợp đồng',
          glow: 'shadow-emerald-200/50'
        }
      case QuoteStatus.RejectedCustomer:
        return {
          bg: 'from-red-500 to-rose-500',
          bgLight: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-800',
          icon: '❌',
          label: 'Khách hàng từ chối',
          description: 'Xem lý do bên dưới và tạo báo giá mới nếu cần',
          glow: 'shadow-red-200/50'
        }
      case QuoteStatus.Expired:
        return {
          bg: 'from-slate-500 to-gray-500',
          bgLight: 'bg-slate-50',
          border: 'border-slate-200',
          text: 'text-slate-700',
          icon: '⏰',
          label: 'Báo giá hết hạn',
          description: 'Đã đạt giới hạn 3 báo giá cho rental này',
          glow: 'shadow-slate-200/50'
        }
      default:
        return {
          bg: 'from-slate-500 to-gray-500',
          bgLight: 'bg-slate-50',
          border: 'border-slate-200',
          text: 'text-slate-700',
          icon: '•',
          label: status,
          description: '',
          glow: ''
        }
    }
  }

  const statusConfig = getStatusConfig(quote.status || '')

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-400">

        {/* ✨ Premium Header with Status */}
        <div className="relative overflow-hidden">
          {/* Gradient Background */}
          <div className={`absolute inset-0 bg-gradient-to-r ${statusConfig.bg} opacity-90`} />

          {/* Decorative patterns */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOGMxOSA5IDE4LTguMDU5IDE4LTE4cy04LjA1OS0xOC0xOC0xOHoiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiBzdHJva2Utd2lkdGg9IjIiLz48L2c+PC9zdmc+')] opacity-30" />

          <div className="relative p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                {/* Quote Number Badge */}
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                  <div className="text-center">
                    <span className="text-2xl font-black text-white">#{quote.quoteNumber}</span>
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    {statusConfig.icon} {statusConfig.label}
                  </h2>
                  <p className="text-white/80 text-sm mt-1 max-w-md">
                    {statusConfig.description}
                  </p>
                  <p className="text-white/60 text-xs mt-2 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(quote.createdAt || '').toLocaleDateString('vi-VN', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-3 hover:bg-white/20 rounded-xl transition-all duration-200 group"
              >
                <X size={24} className="text-white/80 group-hover:text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-280px)] p-6 space-y-6">

          {/* Manager Feedback - Prominent Display */}
          {quote.managerFeedback && (
            <div className="animate-slide-up">
              <div className="relative overflow-hidden bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl border-2 border-orange-200 p-5">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-200/50 to-transparent rounded-full blur-3xl" />

                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-orange-200 rounded-xl">
                      <AlertCircle className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-orange-900">Phản hồi từ Manager</p>
                      <p className="text-sm text-orange-700">Vui lòng xử lý các vấn đề sau:</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-orange-200 shadow-sm">
                    <p className="text-slate-800 whitespace-pre-wrap leading-relaxed">
                      {quote.managerFeedback}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Customer Rejection Reason */}
          {quote.customerReason && (
            <div className="animate-slide-up delay-100">
              <div className="relative overflow-hidden bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl border-2 border-red-200 p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-red-200 rounded-xl">
                    <User className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-red-900">Lý do từ chối</p>
                    <p className="text-sm text-red-700">Khách hàng đã gửi phản hồi:</p>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-red-200 shadow-sm">
                  <p className="text-slate-800 whitespace-pre-wrap leading-relaxed">
                    {quote.customerReason}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* What's Included */}
          <div className="animate-slide-up delay-100">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              Dịch vụ bao gồm
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {whatsIncluded.map((item, index) => (
                <div key={index} className="group flex items-center gap-3 p-3 bg-slate-50 hover:bg-emerald-50 rounded-xl transition-colors border border-transparent hover:border-emerald-200">
                  <span className="text-xl group-hover:scale-110 transition-transform">{item.icon}</span>
                  <span className="text-sm text-slate-700 font-medium">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="animate-slide-up delay-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-violet-600" />
              Chi tiết báo giá
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              {/* === PHASE 1: DEPOSIT === */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-5 border border-slate-700">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/20 to-transparent rounded-full blur-2xl" />

                <div className="relative">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-blue-500/20 rounded-xl">
                      <Wallet className="w-5 h-5 text-blue-400" />
                    </div>
                    <span className="font-bold text-white">PHASE 1</span>
                    <span className="flex items-center gap-1 text-xs bg-slate-700 text-slate-300 px-2.5 py-1 rounded-full">
                      <Lock className="w-3 h-3" /> Đặt cọc
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-slate-300">
                      <span>Phí thuê robot (30%)</span>
                      <span className="font-semibold text-white">{formatMoney(0.3 * quote.rentalFee)}</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Phí nhân viên (30%)</span>
                      <span className="font-semibold text-white">{formatMoney(0.3 * quote.staffFee)}</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Cọc thiệt hại</span>
                      <span className="font-semibold text-white">{formatMoney(quote.damageDeposit)}</span>
                    </div>
                    <div className="flex justify-between pt-3 border-t border-slate-700">
                      <span className="font-bold text-blue-400">Tổng cọc</span>
                      <span className="font-bold text-blue-400 text-xl">{formatMoney(quote.totalDeposit)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* === PHASE 2: PAYMENT === */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-50 to-indigo-50 p-5 border border-violet-200">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-violet-200/50 to-transparent rounded-full blur-2xl" />

                <div className="relative">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-violet-200 rounded-xl">
                      <CreditCard className="w-5 h-5 text-violet-600" />
                    </div>
                    <span className="font-bold text-violet-900">PHASE 2</span>
                    <span className="text-xs bg-violet-200 text-violet-700 px-2.5 py-1 rounded-full">Thanh toán sau</span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-slate-600">
                      <span>Còn lại (70%)</span>
                      <span className="font-semibold">{formatMoney(0.7 * (quote.rentalFee + quote.staffFee))}</span>
                    </div>
                    {quote.deliveryFee && quote.deliveryFee > 0 && (
                      <div className="flex justify-between text-violet-600">
                        <span className="flex items-center gap-1.5">
                          <Truck className="w-4 h-4" /> Phí giao hàng
                          {quote.deliveryDistance && (
                            <span className="text-xs bg-violet-100 px-1.5 py-0.5 rounded">
                              {quote.deliveryDistance}km
                            </span>
                          )}
                        </span>
                        <span className="font-semibold">{formatMoney(quote.deliveryFee)}</span>
                      </div>
                    )}
                    {quote.customizationFee > 0 && (
                      <div className="flex justify-between text-violet-600">
                        <span className="flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4" /> Phí tùy chỉnh
                        </span>
                        <span className="font-semibold">{formatMoney(quote.customizationFee)}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-3 border-t border-violet-200">
                      <span className="font-bold text-violet-700">Tổng thanh toán</span>
                      <span className="font-bold text-violet-700 text-xl">{formatMoney(quote.totalPayment)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* === GRAND TOTAL === */}
            <div className="mt-4 relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-violet-900 to-indigo-900 p-5">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 via-purple-600/10 to-indigo-600/10 animate-shimmer" />

              <div className="relative flex justify-between items-center">
                <span className="font-bold text-white text-xl flex items-center gap-2">
                  🎯 TỔNG GIÁ TRỊ
                </span>
                <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-300 via-purple-300 to-indigo-300">
                  {formatMoney(quote.grandTotal)}
                </span>
              </div>
            </div>
          </div>

          {/* Staff Notes */}
          {quote.staffDescription && (
            <div className="animate-slide-up delay-300">
              <h3 className="text-lg font-bold text-slate-900 mb-3">📝 Ghi chú của bạn</h3>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-200">
                <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {quote.staffDescription}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-white border-t border-slate-200 p-6">
          {quote.status === QuoteStatus.RejectedManager && onUpdateQuote ? (
            <button
              onClick={() => onUpdateQuote(quote.id)}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl transition-all duration-200 font-bold text-lg shadow-lg shadow-orange-300/30 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 animate-shimmer"
            >
              <RefreshCw size={22} />
              Cập nhật & Gửi lại
            </button>
          ) : quote.status === QuoteStatus.PendingManager ? (
            <div className="text-center py-4 bg-amber-50 rounded-xl border border-amber-200">
              <p className="text-amber-700 font-bold text-lg flex items-center justify-center gap-2">
                <span className="animate-pulse">⏳</span> Đang chờ Manager duyệt
              </p>
            </div>
          ) : quote.status === QuoteStatus.PendingCustomer ? (
            <div className="text-center py-4 bg-blue-50 rounded-xl border border-blue-200">
              <p className="text-blue-700 font-bold text-lg flex items-center justify-center gap-2">
                👀 Khách hàng đang xem xét
              </p>
            </div>
          ) : quote.status === QuoteStatus.Approved ? (
            <div className="text-center py-4 bg-emerald-50 rounded-xl border border-emerald-200">
              <p className="text-emerald-700 font-bold text-lg flex items-center justify-center gap-2">
                <Zap className="w-5 h-5" /> Đã chấp nhận - Sẵn sàng tạo hợp đồng!
              </p>
            </div>
          ) : quote.status === QuoteStatus.RejectedCustomer ? (
            <div className="text-center py-4 bg-red-50 rounded-xl border border-red-200">
              <p className="text-red-700 font-bold text-lg flex items-center justify-center gap-2">
                ❌ Khách hàng từ chối - Tạo báo giá mới
              </p>
            </div>
          ) : quote.status === QuoteStatus.Expired ? (
            <div className="text-center py-4 bg-slate-100 rounded-xl border border-slate-200">
              <p className="text-slate-600 font-bold text-lg flex items-center justify-center gap-2">
                ⏰ Hết hạn (đã đạt giới hạn 3 báo giá)
              </p>
            </div>
          ) : (
            <button
              onClick={onClose}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl transition-all duration-200"
            >
              Đóng
            </button>
          )}
        </div>
      </div>
    </div>
  )
}