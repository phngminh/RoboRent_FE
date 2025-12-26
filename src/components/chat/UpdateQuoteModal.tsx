// src/components/chat/UpdateQuoteModal.tsx
import { useState, useEffect } from 'react'
import { X, AlertCircle, RefreshCw, Truck, Sparkles, Lock, Wallet, CreditCard, ArrowRight, Zap, TrendingUp, TrendingDown } from 'lucide-react'
import { getPriceQuoteById, updatePriceQuote } from '../../apis/priceQuote.api'
import type { PriceQuoteResponse, UpdatePriceQuoteRequest } from '../../types/chat.types'
import { QuoteStatus } from '../../types/chat.types'
import { toast } from 'react-toastify'
import { formatMoney } from '../../utils/format'

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

  // Form fields - Only Phase 2 adjustable fields
  const [deliveryFee, setDeliveryFee] = useState<string>('')
  const [customizationFee, setCustomizationFee] = useState<string>('')
  const [staffDescription, setStaffDescription] = useState<string>('')

  const deliveryFeeNum = parseFloat(deliveryFee) || 0
  const customizationFeeNum = parseFloat(customizationFee) || 0

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
        toast.error('Chỉ có thể chỉnh sửa quote bị Manager từ chối')
        onClose()
        return
      }

      setQuote(data)

      // Pre-fill form with current values
      setDeliveryFee(data.deliveryFee?.toString() || '0')
      setCustomizationFee(data.customizationFee?.toString() || '0')
      setStaffDescription(data.staffDescription || '')
    } catch (error) {
      console.error('Failed to load quote:', error)
      toast.error('Không thể tải thông tin báo giá')
      onClose()
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (deliveryFeeNum < 0 || customizationFeeNum < 0) {
      toast.error('Các khoản phí phải >= 0')
      return
    }

    if (!staffDescription.trim()) {
      toast.error('Ghi chú nhân viên là bắt buộc')
      return
    }

    // Check if anything changed
    if (quote) {
      const noChanges =
        deliveryFeeNum === (quote.deliveryFee || 0) &&
        customizationFeeNum === quote.customizationFee &&
        staffDescription.trim() === (quote.staffDescription || '')

      if (noChanges) {
        toast.error('Vui lòng thay đổi ít nhất một trường trước khi gửi lại')
        return
      }
    }

    setIsSubmitting(true)

    try {
      const request: UpdatePriceQuoteRequest = {
        deliveryFee: deliveryFeeNum,
        customizationFee: customizationFeeNum,
        staffDescription: staffDescription.trim()
      }

      await updatePriceQuote(quoteId, request)
      toast.success('Đã cập nhật và gửi lại báo giá cho Manager')

      onSuccess()
      onClose()
    } catch (error: any) {
      console.error('Failed to update quote:', error)
      toast.error(error.response?.data?.error || 'Không thể cập nhật báo giá')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onClose()
    }
  }

  // Calculate new totals preview
  const newTotalPayment = quote
    ? 0.7 * (quote.rentalFee + quote.staffFee) + deliveryFeeNum + customizationFeeNum
    : 0
  const newGrandTotal = quote ? quote.totalDeposit + newTotalPayment : 0

  // Calculate differences
  const paymentDiff = quote ? newTotalPayment - quote.totalPayment : 0
  const grandTotalDiff = quote ? newGrandTotal - quote.grandTotal : 0

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
      <div className="bg-gradient-to-br from-slate-50 to-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-400 border border-white/50">

        {/* ✨ Premium Dark Header */}
        <div className="sticky top-0 z-10 glass-dark rounded-t-3xl">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Update Icon */}
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
                  <RefreshCw className="w-7 h-7 text-white" />
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    Cập nhật báo giá
                  </h2>
                  {quote && (
                    <p className="text-sm text-slate-300 mt-1">
                      Quote #{quote.quoteNumber} • Rental #{quote.rentalId}
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={handleClose}
                disabled={isSubmitting}
                className="p-3 hover:bg-white/10 rounded-xl transition-all duration-200 disabled:opacity-50 group"
              >
                <X size={24} className="text-slate-400 group-hover:text-white transition-colors" />
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 opacity-50" />
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="inline-block w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-slate-600">Đang tải thông tin...</p>
            </div>
          ) : quote ? (
            <form onSubmit={handleSubmit} className="p-6 space-y-5">

              {/* Manager Feedback - Prominent */}
              {quote.managerFeedback && (
                <div className="animate-slide-up">
                  <div className="relative overflow-hidden bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl border-2 border-red-200 p-5">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-200/50 to-transparent rounded-full blur-3xl" />

                    <div className="relative">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-red-200 rounded-xl">
                          <AlertCircle className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                          <p className="font-bold text-red-900">Phản hồi từ Manager</p>
                          <p className="text-sm text-red-700">Cần xử lý trước khi gửi lại:</p>
                        </div>
                      </div>
                      <div className="bg-white rounded-xl p-4 border border-red-200">
                        <p className="text-slate-800 whitespace-pre-wrap leading-relaxed">
                          {quote.managerFeedback}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* PHASE 1: LOCKED */}
              <div className="animate-slide-up delay-100">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-5 border border-slate-700">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/20 to-transparent rounded-full blur-2xl" />

                  <div className="relative">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-2 bg-blue-500/20 rounded-xl">
                        <Wallet className="w-5 h-5 text-blue-400" />
                      </div>
                      <span className="font-bold text-white">PHASE 1</span>
                      <span className="flex items-center gap-1 text-xs bg-slate-700 text-slate-300 px-2.5 py-1 rounded-full">
                        <Lock className="w-3 h-3" /> Không thể sửa
                      </span>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-slate-300">
                        <span>Phí thuê robot</span>
                        <span className="font-medium text-white">{formatMoney(quote.rentalFee)}</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>Phí nhân viên</span>
                        <span className="font-medium text-white">{formatMoney(quote.staffFee)}</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>Cọc thiệt hại</span>
                        <span className="font-medium text-white">{formatMoney(quote.damageDeposit)}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-slate-700">
                        <span className="font-bold text-blue-400">Tổng đặt cọc</span>
                        <span className="font-bold text-blue-400 text-lg">{formatMoney(quote.totalDeposit)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* PHASE 2: ADJUSTABLE */}
              <div className="animate-slide-up delay-200">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-50 to-indigo-50 p-5 border-2 border-violet-200">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-violet-200/50 to-transparent rounded-full blur-2xl" />

                  <div className="relative">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-2 bg-violet-200 rounded-xl">
                        <CreditCard className="w-5 h-5 text-violet-600" />
                      </div>
                      <span className="font-bold text-violet-900">PHASE 2</span>
                      <span className="text-xs bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full font-semibold">
                        ✏️ Có thể sửa
                      </span>
                    </div>

                    <div className="space-y-4">
                      {/* Remaining 70% - Read only */}
                      <div className="flex justify-between text-sm text-slate-600 py-2 border-b border-violet-100">
                        <span>Còn lại (70%)</span>
                        <span className="font-medium">{formatMoney(0.7 * (quote.rentalFee + quote.staffFee))}</span>
                      </div>

                      {/* Delivery Fee - Editable */}
                      <div>
                        <label className="block text-sm font-bold text-violet-800 mb-2">
                          <span className="flex items-center gap-2">
                            <Truck className="w-4 h-4" />
                            Phí giao hàng
                            <span className="text-xs font-normal text-violet-600 bg-violet-100 px-2 py-0.5 rounded">
                              Gốc: {formatMoney(quote.deliveryFee || 0)}
                            </span>
                          </span>
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            step="1000"
                            min="0"
                            value={deliveryFee}
                            onChange={(e) => setDeliveryFee(e.target.value)}
                            placeholder="0"
                            className="w-full pl-4 pr-16 py-3 text-lg border-2 border-violet-300 rounded-xl focus:border-violet-500 bg-white input-premium transition-all duration-200"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-violet-600 font-bold">VND</span>
                        </div>
                      </div>

                      {/* Customization Fee - Editable */}
                      <div>
                        <label className="block text-sm font-bold text-violet-800 mb-2">
                          <span className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4" />
                            Phí tùy chỉnh
                            <span className="text-xs font-normal text-violet-600 bg-violet-100 px-2 py-0.5 rounded">
                              Gốc: {formatMoney(quote.customizationFee)}
                            </span>
                          </span>
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            step="1000"
                            min="0"
                            value={customizationFee}
                            onChange={(e) => setCustomizationFee(e.target.value)}
                            placeholder="0"
                            className="w-full pl-4 pr-16 py-3 text-lg border-2 border-violet-300 rounded-xl focus:border-violet-500 bg-white input-premium transition-all duration-200"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-violet-600 font-bold">VND</span>
                        </div>
                      </div>

                      {/* New Total Payment */}
                      <div className="flex justify-between items-center pt-3 border-t border-violet-200">
                        <span className="font-bold text-violet-700">Tổng thanh toán mới</span>
                        <div className="text-right">
                          <span className={`font-bold text-xl ${paymentDiff !== 0 ? 'text-orange-600' : 'text-violet-700'}`}>
                            {formatMoney(newTotalPayment)}
                          </span>
                          {paymentDiff !== 0 && (
                            <span className={`flex items-center justify-end gap-1 text-sm ${paymentDiff > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                              {paymentDiff > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                              {paymentDiff > 0 ? '+' : ''}{formatMoney(paymentDiff)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grand Total Preview */}
              <div className="animate-slide-up delay-300">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-violet-900 to-indigo-900 p-5">
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 via-purple-600/10 to-indigo-600/10 animate-shimmer" />

                  <div className="relative flex justify-between items-center">
                    <span className="font-bold text-white text-lg">🎯 TỔNG MỚI</span>
                    <div className="text-right">
                      <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-300 via-purple-300 to-indigo-300">
                        {formatMoney(newGrandTotal)}
                      </span>
                      {grandTotalDiff !== 0 && (
                        <p className={`text-sm flex items-center justify-end gap-1 ${grandTotalDiff > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                          {grandTotalDiff > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {grandTotalDiff > 0 ? '+' : ''}{formatMoney(grandTotalDiff)} so với gốc
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Staff Description */}
              <div className="animate-slide-up delay-400">
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Ghi chú cập nhật <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={staffDescription}
                  onChange={(e) => setStaffDescription(e.target.value)}
                  rows={4}
                  placeholder="Giải thích những thay đổi bạn đã thực hiện dựa trên phản hồi của Manager..."
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-violet-500 resize-none transition-all duration-200 hover:border-slate-300"
                />
                <p className="text-xs text-slate-500 mt-2 flex items-center gap-2">
                  <ArrowRight className="w-3 h-3" />
                  Mô tả cách bạn đã xử lý các vấn đề Manager nêu ra.
                </p>
              </div>

              {/* Info Box */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-blue-200 rounded-lg">
                    <Zap className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-blue-900">Sau khi gửi:</p>
                    <p className="text-sm text-blue-700 mt-1">
                      ✓ Quote sẽ được gửi lại cho Manager để phê duyệt
                    </p>
                  </div>
                </div>
              </div>

              {/* ✨ Premium Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-4 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-all duration-200 font-semibold disabled:opacity-50 border-2 border-transparent hover:border-slate-300"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 relative px-6 py-4 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white rounded-xl hover:from-orange-600 hover:via-red-600 hover:to-pink-600 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 hover:-translate-y-0.5 active:translate-y-0 animate-shimmer"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Đang cập nhật...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-5 h-5" />
                        Cập nhật & Gửi lại
                      </>
                    )}
                  </span>
                </button>
              </div>
            </form>
          ) : (
            <div className="p-12 text-center text-red-600">
              <p>Không thể tải thông tin báo giá</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}