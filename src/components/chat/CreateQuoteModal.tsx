// src/components/chat/CreateQuoteModal.tsx
import { useState, useEffect } from 'react'
import { X, AlertCircle, Sparkles, Lock, Calendar, MapPin, Package, User, Clock, Zap, ArrowRight, Info, ChevronDown, ChevronUp, DollarSign, Truck, Calculator, HelpCircle, MessageSquareX } from 'lucide-react'
import { createPriceQuote, checkCanCreateMoreQuotes } from '../../apis/priceQuote.api'
import type { CreatePriceQuoteRequest } from '../../types/chat.types'
import { toast } from 'react-toastify'
import { formatDuration, formatMoney } from '../../utils/format'

// Rental info type (partial, from getRentalByIdAsync)
interface RentalInfo {
  customerName?: string
  eventName?: string
  eventDate?: string
  startTime?: string
  endTime?: string
  city?: string
  address?: string
  activityTypeName?: string
  eventActivityName?: string
  phoneNumber?: string
  email?: string
}

// Package pricing config (from seed data)
const PACKAGE_PRICING = {
  'Basic Event Package': {
    code: 'BASIC',
    hourlyRate: 3500000,
    staffFeePerHour: 150000,
    operatorCount: 1,
    damageDeposit: 5000000,
    minHours: 2
  },
  'Standard Event Package': {
    code: 'STANDARD',
    hourlyRate: 5500000,
    staffFeePerHour: 200000,
    operatorCount: 2,
    damageDeposit: 10000000,
    minHours: 2
  },
  'Premium Event Package': {
    code: 'PREMIUM',
    hourlyRate: 8500000,
    staffFeePerHour: 300000,
    operatorCount: 3,
    damageDeposit: 20000000,
    minHours: 2
  }
} as const

// Delivery fee config (simplified from BE)
const DELIVERY_FEE_CONFIG: Record<string, { fee: number; distance: number }> = {
  'Hồ Chí Minh': { fee: 0, distance: 0 },
  'HCM': { fee: 0, distance: 0 },
  'Ho Chi Minh': { fee: 0, distance: 0 },
  'Bình Dương': { fee: 300000, distance: 30 },
  'Đồng Nai': { fee: 400000, distance: 40 },
  'Long An': { fee: 350000, distance: 35 },
  'Vũng Tàu': { fee: 800000, distance: 100 },
  'Cần Thơ': { fee: 1200000, distance: 170 },
}

// Simplified quote info for rejection display
interface RejectedQuoteInfo {
  quoteNumber: number
  customerReason: string | null
  status: string
}

interface CreateQuoteModalProps {
  isOpen: boolean
  rentalId: number
  currentQuoteCount: number
  rentalInfo?: RentalInfo | null
  rejectedQuotes?: RejectedQuoteInfo[]  // Quotes rejected by customer
  onClose: () => void
  onSuccess: () => void
}

export default function CreateQuoteModal({
  isOpen,
  rentalId,
  currentQuoteCount,
  rentalInfo,
  rejectedQuotes = [],
  onClose,
  onSuccess
}: CreateQuoteModalProps) {
  const [customizationFee, setCustomizationFee] = useState<string>('')
  const [staffDescription, setStaffDescription] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [canCreate, setCanCreate] = useState(true)
  const [isAddressExpanded, setIsAddressExpanded] = useState(false)
  const [showFeeGuide, setShowFeeGuide] = useState(false)

  const customizationFeeNum = parseFloat(customizationFee) || 0

  const quoteNumber = currentQuoteCount + 1
  // const quotesRemaining = 3 - currentQuoteCount // Removed limit

  // Get package pricing
  const packageName = rentalInfo?.activityTypeName || ''
  const packagePricing = PACKAGE_PRICING[packageName as keyof typeof PACKAGE_PRICING]

  // Calculate duration
  const getDurationInfo = () => {
    if (!rentalInfo?.startTime || !rentalInfo?.endTime) return null
    try {
      const start = rentalInfo.startTime.substring(0, 5)
      const end = rentalInfo.endTime.substring(0, 5)
      const [sh, sm] = start.split(':').map(Number)
      const [eh, em] = end.split(':').map(Number)
      const rawHours = (eh * 60 + em - sh * 60 - sm) / 60

      // Apply minimum hours
      const minHours = packagePricing?.minHours || 2
      const billableHours = Math.max(rawHours, minHours)
      // Round up to 30 min increments
      const roundedHours = Math.ceil(billableHours * 2) / 2

      return {
        raw: rawHours,
        billable: roundedHours,
        formatted: formatDuration(rawHours)
      }
    } catch {
      return null
    }
  }

  const durationInfo = getDurationInfo()

  // Estimate fees
  const estimateFees = () => {
    if (!packagePricing || !durationInfo) return null

    const hours = durationInfo.billable
    const rentalFee = packagePricing.hourlyRate * hours
    const staffFee = packagePricing.staffFeePerHour * packagePricing.operatorCount * hours
    const damageDeposit = packagePricing.damageDeposit

    // Delivery fee
    let deliveryFee = 500000 // Default for unknown cities
    let deliveryDistance = 50
    const city = rentalInfo?.city || ''
    const cityConfig = Object.entries(DELIVERY_FEE_CONFIG).find(([key]) =>
      city.toLowerCase().includes(key.toLowerCase())
    )
    if (cityConfig) {
      deliveryFee = cityConfig[1].fee
      deliveryDistance = cityConfig[1].distance
    }

    const totalDeposit = 0.3 * (rentalFee + staffFee) + damageDeposit
    const totalPayment = 0.7 * (rentalFee + staffFee) + deliveryFee + customizationFeeNum
    const grandTotal = totalDeposit + totalPayment

    return {
      rentalFee,
      staffFee,
      damageDeposit,
      deliveryFee,
      deliveryDistance,
      totalDeposit,
      totalPayment,
      grandTotal,
      hours
    }
  }

  const estimatedFees = estimateFees()

  // Check can create on mount
  useEffect(() => {
    if (isOpen) {
      checkCanCreateMoreQuotes(rentalId).then(result => {
        setCanCreate(result.canCreateMore)
      }).catch(() => {
        setCanCreate(false)
      })
    }
  }, [isOpen, rentalId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (customizationFeeNum < 0) {
      toast.error('Customization fee must be non-negative')
      return
    }

    if (!staffDescription.trim()) {
      toast.error('Staff description is required')
      return
    }

    if (!canCreate) {
      toast.error('Cannot create new quote (An active quote already exists)')
      return
    }

    setIsSubmitting(true)

    try {
      const request: CreatePriceQuoteRequest = {
        rentalId,
        customizationFee: customizationFeeNum || undefined,
        staffDescription: staffDescription.trim()
      }

      await createPriceQuote(request)
      toast.success(`Quote #${quoteNumber} created successfully`)

      setCustomizationFee('')
      setStaffDescription('')

      onSuccess()
      onClose()
    } catch (error: any) {
      console.error('Failed to create quote:', error)
      toast.error(error.response?.data?.error || 'Failed to create quote')
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
      <div className="bg-gradient-to-br from-slate-50 to-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 slide-in-from-bottom-4 duration-400 border border-white/50">

        {/* ✨ Premium Dark Header */}
        <div className="sticky top-0 z-10 glass-dark rounded-t-3xl">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Animated Quote Counter */}
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30 animate-glow-pulse">
                    <div className="text-center">
                      <span className="text-2xl font-bold text-white">{quoteNumber}</span>
                      <span className="text-[10px] text-white/70 block -mt-1 uppercase">Quote</span>
                    </div>
                  </div>
                  <svg className="absolute -inset-1 w-[72px] h-[72px]" viewBox="0 0 72 72">
                    <circle cx="36" cy="36" r="34" fill="none" stroke="rgba(139, 92, 246, 0.3)" strokeWidth="2" />
                    <circle cx="36" cy="36" r="34" fill="none" stroke="url(#gradient)" strokeWidth="3"
                      strokeDasharray="213.6 213.6"
                      strokeLinecap="round" transform="rotate(-90 36 36)"
                      className="transition-all duration-500"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#6366f1" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Zap className="w-6 h-6 text-yellow-400 animate-float" />
                    Tạo báo giá
                  </h2>
                  <p className="text-sm text-slate-300 mt-1">
                    Rental #{rentalId}
                    {rentalInfo?.customerName && (
                      <span className="text-violet-300"> • {rentalInfo.customerName}</span>
                    )}
                  </p>
                </div>
              </div>

              <button onClick={handleClose} disabled={isSubmitting}
                className="p-3 hover:bg-white/10 rounded-xl transition-all duration-200 disabled:opacity-50 group">
                <X size={24} className="text-slate-400 group-hover:text-white transition-colors" />
              </button>
            </div>
          </div>
          <div className="h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500 opacity-50" />
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* 🚨 SECTION: Previous Rejection Reasons (for Quote #2, #3) */}
          {rejectedQuotes.length > 0 && (
            <div className="animate-slide-up">
              <div className="relative overflow-hidden rounded-2xl border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 p-5">
                <div className="absolute top-4 right-4">
                  <MessageSquareX className="w-6 h-6 text-orange-400 opacity-50" />
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <div className="p-1.5 bg-orange-200 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-orange-600" />
                  </div>
                  <h4 className="font-bold text-orange-900">Lý do từ chối từ khách hàng</h4>
                  <span className="text-xs text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">
                    {rejectedQuotes.length} quote bị từ chối
                  </span>
                </div>

                <div className="space-y-3">
                  {rejectedQuotes.map((quote) => (
                    <div
                      key={quote.quoteNumber}
                      className="p-3 bg-white rounded-xl border border-orange-200 shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-orange-800">
                          Quote #{quote.quoteNumber}
                        </span>
                        <span className="text-xs text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">
                          Đã từ chối
                        </span>
                      </div>
                      {quote.customerReason ? (
                        <p className="text-sm text-slate-700 italic">
                          "{quote.customerReason}"
                        </p>
                      ) : (
                        <p className="text-sm text-slate-400 italic">
                          Không có lý do cụ thể
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                <p className="text-xs text-orange-600 mt-3 flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  Xem xét feedback trên để điều chỉnh báo giá mới phù hợp hơn.
                </p>
              </div>
            </div>
          )}

          {/* 📋 SECTION 1: Rental Context */}
          {rentalInfo && (
            <div className="animate-slide-up delay-100">
              <div className="relative overflow-hidden rounded-2xl border border-slate-200/50 bg-gradient-to-br from-white to-slate-50 shadow-lg">
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-violet-200/40 to-indigo-200/40 rounded-full blur-3xl" />

                <div className="relative">
                  <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-5 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                      <h3 className="text-sm font-semibold text-white">Thông tin rental</h3>
                    </div>
                    {packagePricing && (
                      <span className="px-3 py-1 text-xs font-bold bg-violet-500/30 text-violet-200 rounded-full">
                        {packagePricing.code}
                      </span>
                    )}
                  </div>

                  <div className="p-5 grid grid-cols-2 gap-4">
                    {/* Customer */}
                    <div className="group flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                      <div className="p-2 rounded-lg bg-blue-100 text-blue-600 group-hover:scale-110 transition-transform">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wide">Khách hàng</p>
                        <p className="font-semibold text-slate-900 mt-0.5">{rentalInfo.customerName || 'N/A'}</p>
                        {rentalInfo.phoneNumber && (
                          <p className="text-xs text-slate-500">{rentalInfo.phoneNumber}</p>
                        )}
                      </div>
                    </div>

                    {/* Event Date & Time */}
                    <div className="group flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                      <div className="p-2 rounded-lg bg-violet-100 text-violet-600 group-hover:scale-110 transition-transform">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wide">Ngày & giờ</p>
                        <p className="font-semibold text-slate-900 mt-0.5">
                          {rentalInfo.eventDate ? new Date(rentalInfo.eventDate).toLocaleDateString('vi-VN') : 'N/A'}
                        </p>
                        {rentalInfo.startTime && rentalInfo.endTime && (
                          <p className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" />
                            {rentalInfo.startTime.substring(0, 5)} - {rentalInfo.endTime.substring(0, 5)}
                            {durationInfo && (
                              <span className="text-violet-600 font-medium ml-1 px-2 py-0.5 bg-violet-100 rounded-full">
                                {durationInfo.formatted}
                                {durationInfo.billable > durationInfo.raw && (
                                  <span className="text-violet-400 ml-1" title="Làm tròn lên minimum">→ {durationInfo.billable}h</span>
                                )}
                              </span>
                            )}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Package - with pricing hint */}
                    <div className="group flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                      <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600 group-hover:scale-110 transition-transform">
                        <Package className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wide">Gói dịch vụ</p>
                        <p className="font-semibold text-slate-900 mt-0.5">{rentalInfo.activityTypeName || 'N/A'}</p>
                        {packagePricing && (
                          <p className="text-xs text-emerald-600 flex items-center gap-1 mt-0.5">
                            <DollarSign className="w-3 h-3" />
                            {formatMoney(packagePricing.hourlyRate)}/h • {packagePricing.operatorCount} NV
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Location - IMPROVED: expandable */}
                    <div className="group flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                      <div className="p-2 rounded-lg bg-rose-100 text-rose-600 group-hover:scale-110 transition-transform">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-500 uppercase tracking-wide">Địa điểm</p>
                        <p className="font-semibold text-slate-900 mt-0.5">{rentalInfo.city || 'N/A'}</p>
                        {rentalInfo.address && (
                          <div>
                            <p
                              className={`text-sm text-slate-600 mt-0.5 ${isAddressExpanded ? '' : 'line-clamp-1'} cursor-pointer`}
                              onClick={() => setIsAddressExpanded(!isAddressExpanded)}
                              title="Click để xem đầy đủ"
                            >
                              {rentalInfo.address}
                            </p>
                            <button
                              type="button"
                              onClick={() => setIsAddressExpanded(!isAddressExpanded)}
                              className="text-xs text-violet-600 flex items-center gap-0.5 mt-1 hover:underline"
                            >
                              {isAddressExpanded ? (
                                <>Thu gọn <ChevronUp className="w-3 h-3" /></>
                              ) : (
                                <>Xem đầy đủ <ChevronDown className="w-3 h-3" /></>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 💰 SECTION 2: Estimated Fees Preview */}
          {estimatedFees && (
            <div className="animate-slide-up delay-200">
              <div className="relative overflow-hidden rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-5">
                <div className="absolute top-4 right-4">
                  <Calculator className="w-6 h-6 text-blue-400 opacity-50" />
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <div className="p-1.5 bg-blue-200 rounded-lg">
                    <Info className="w-4 h-4 text-blue-600" />
                  </div>
                  <h4 className="font-bold text-blue-900">Ước tính phí tự động</h4>
                  <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                    {estimatedFees.hours}h × {packagePricing?.code}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>Phí thuê robot:</span>
                    <span className="font-medium text-slate-800">~{formatMoney(estimatedFees.rentalFee)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Phí nhân viên:</span>
                    <span className="font-medium text-slate-800">~{formatMoney(estimatedFees.staffFee)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Cọc thiệt hại:</span>
                    <span className="font-medium text-slate-800">{formatMoney(estimatedFees.damageDeposit)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span className="flex items-center gap-1">
                      <Truck className="w-3 h-3" /> Phí giao hàng:
                    </span>
                    <span className="font-medium text-slate-800">
                      {estimatedFees.deliveryFee === 0 ? 'Miễn phí' : `~${formatMoney(estimatedFees.deliveryFee)}`}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-blue-200 flex justify-between items-center">
                  <span className="font-bold text-blue-900">Tổng ước tính:</span>
                  <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                    ~{formatMoney(estimatedFees.grandTotal)}
                  </span>
                </div>

                <p className="text-xs text-blue-600 mt-3 flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  Các phí trên sẽ được tính tự động khi tạo quote. Bạn chỉ cần nhập Customization Fee.
                </p>
              </div>
            </div>
          )}

          {/* ✨ SECTION 3: Customization Fee - with guidance */}
          <div className="animate-slide-up delay-300">
            <div className="relative bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-5 border-2 border-violet-200/50 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-bold text-violet-900">
                  <span className="flex items-center gap-2">
                    <span className="p-1.5 bg-violet-200 rounded-lg">
                      <Sparkles className="w-4 h-4 text-violet-600" />
                    </span>
                    Phí tùy chỉnh (Customization Fee)
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowFeeGuide(!showFeeGuide)}
                  className="text-xs text-violet-600 flex items-center gap-1 hover:underline"
                >
                  <HelpCircle className="w-4 h-4" />
                  {showFeeGuide ? 'Ẩn hướng dẫn' : 'Khi nào cần nhập?'}
                </button>
              </div>

              {/* Fee Guide - Expandable */}
              {showFeeGuide && (
                <div className="mb-4 p-3 bg-white rounded-xl border border-violet-200 text-sm">
                  <p className="font-semibold text-violet-900 mb-2">Nhập phí tùy chỉnh khi khách yêu cầu:</p>
                  <ul className="space-y-1 text-violet-700">
                    <li className="flex items-start gap-2">
                      <span className="text-violet-400">•</span>
                      <span>Robot abilities đặc biệt ngoài package (VD: hát bài custom)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-violet-400">•</span>
                      <span>Custom choreography / kịch bản riêng</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-violet-400">•</span>
                      <span>Branding logo / màu sắc trên robot</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-violet-400">•</span>
                      <span>Tích hợp với thiết bị của khách hàng</span>
                    </li>
                  </ul>
                  <p className="mt-2 text-violet-600 text-xs flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    Để 0 nếu không có yêu cầu đặc biệt
                  </p>
                </div>
              )}

              <div className="relative">
                <input
                  type="number"
                  step="100000"
                  min="0"
                  value={customizationFee}
                  onChange={(e) => setCustomizationFee(e.target.value)}
                  placeholder="0"
                  className="w-full pl-5 pr-20 py-4 text-lg font-semibold border-2 border-violet-300 rounded-xl focus:border-violet-500 bg-white input-premium transition-all duration-200"
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-violet-600 font-bold bg-violet-100 px-3 py-1 rounded-lg">
                  VND
                </span>
              </div>

              {customizationFeeNum > 0 && estimatedFees && (
                <p className="text-sm text-violet-700 mt-3 flex items-center gap-2 p-2 bg-white rounded-lg border border-violet-200">
                  <ArrowRight className="w-4 h-4" />
                  Tổng mới: <span className="font-bold">{formatMoney(estimatedFees.grandTotal)}</span>
                </p>
              )}
            </div>
          </div>

          {/* Staff Description */}
          <div className="animate-slide-up delay-400">
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Ghi chú của nhân viên <span className="text-red-500">*</span>
            </label>
            <textarea
              value={staffDescription}
              onChange={(e) => setStaffDescription(e.target.value)}
              rows={3}
              placeholder="Mô tả chi tiết về báo giá, lý do customization fee (nếu có)..."
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-violet-500 resize-none transition-all duration-200 hover:border-slate-300"
            />
            <p className="text-xs text-slate-500 mt-2 flex items-center gap-2">
              <ArrowRight className="w-3 h-3" />
              Ghi chú sẽ được gửi tới Manager để xem xét.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button type="button" onClick={handleClose} disabled={isSubmitting}
              className="flex-1 px-6 py-4 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-all duration-200 font-semibold disabled:opacity-50 border-2 border-transparent hover:border-slate-300">
              Hủy
            </button>
            <button type="submit" disabled={isSubmitting || !canCreate}
              className="flex-1 relative px-6 py-4 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white rounded-xl hover:from-violet-700 hover:via-purple-700 hover:to-indigo-700 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-500/30 hover:shadow-xl hover:shadow-violet-500/40 hover:-translate-y-0.5 active:translate-y-0 animate-shimmer">
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    Tạo Quote #{quoteNumber}
                  </>
                )}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}