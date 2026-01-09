import React, { useState, useEffect, useMemo } from 'react'
import { 
  Users, UserPlus, Calendar, Search, ChevronDown, X, 
  AlertTriangle, CheckCircle2, RefreshCw, User, Package, 
  ChevronRight, ArrowUpDown, Zap, MapPin, Phone,
  ArrowLeft
} from 'lucide-react'
import { toast } from 'react-toastify'
import { 
  getPendingDeliveries, 
  getStaffList, 
  checkStaffConflict, 
  assignStaff 
} from '../../apis/delivery.api'
import type { 
  ActualDeliveryResponse, 
  StaffListItemResponse 
} from '../../types/delivery.types'
import { useNavigate } from 'react-router-dom'

// Helper functions
const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  if (date.toDateString() === today.toDateString()) return 'Today'
  if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow'
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const formatFullDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  })
}

const formatTime = (timeStr: string): string => {
  const [hours, minutes] = timeStr.split(':')
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minutes} ${ampm}`
}

const getInitials = (name: string): string => 
  name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

const getAvatarColor = (id: number): string => {
  const colors = [
    'bg-violet-500', 'bg-rose-500', 'bg-amber-500', 
    'bg-emerald-500', 'bg-sky-500', 'bg-indigo-500', 
    'bg-fuchsia-500', 'bg-cyan-500'
  ]
  return colors[id % colors.length]
}

const getUrgencyLevel = (dateStr: string): 'urgent' | 'soon' | 'normal' => {
  const eventDate = new Date(dateStr)
  const today = new Date()
  const diffDays = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays <= 1) return 'urgent'
  if (diffDays <= 3) return 'soon'
  return 'normal'
}

// Staff Dropdown Component
const StaffDropdown: React.FC<{
  deliveryId: number
  groupScheduleId: number
  onAssign: (staffId: number, staffName: string) => void
  onClose: () => void
}> = ({ deliveryId, groupScheduleId, onAssign, onClose }) => {
  const [search, setSearch] = useState('')
  const [staff, setStaff] = useState<StaffListItemResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadStaff()
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  const loadStaff = async () => {
    setLoading(true)
    try {
      const data = await getStaffList(1, 100, 'Active', search)
      setStaff(data.items)
    } catch (err) {
      console.error('Failed to load staff:', err)
      toast.error('Failed to load staff list')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search) loadStaff()
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const handleAssign = async (staffMember: StaffListItemResponse) => {
    setChecking(staffMember.accountId)
    setError(null)
    
    try {
      // Check conflict first
      const conflictCheck = await checkStaffConflict(staffMember.accountId, groupScheduleId)
      
      if (conflictCheck.hasConflict) {
        const conflictMessages = conflictCheck.conflicts
          .map(c => `${c.eventName} (${new Date(c.scheduledStart).toLocaleString()} - ${new Date(c.scheduledEnd).toLocaleString()})`)
          .join(', ')
        setError(`${staffMember.fullName}: Schedule conflict - ${conflictMessages}`)
        setChecking(null)
        return
      }

      // No conflict, proceed with assignment
      await assignStaff(deliveryId, { staffId: staffMember.accountId })
      onAssign(staffMember.accountId, staffMember.fullName)
      toast.success(`Successfully assigned to ${staffMember.fullName}`)
    } catch (err: any) {
      console.error('Assignment failed:', err)
      toast.error(err.response?.data?.Error || 'Failed to assign staff')
    } finally {
      setChecking(null)
    }
  }

  const filteredStaff = staff.filter(s => 
    s.fullName.toLowerCase().includes(search.toLowerCase()) ||
    s.phoneNumber.includes(search) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div ref={dropdownRef} className="absolute top-full left-0 mt-1 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden">
      <div className="p-2 border-b border-slate-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search staff..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-slate-100 border-0 focus:ring-2 focus:ring-violet-500 outline-none"
            autoFocus
          />
        </div>
      </div>
      
      {error && (
        <div className="px-3 py-2 bg-red-50 border-b border-red-100">
          <p className="text-xs text-red-600 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            {error}
          </p>
        </div>
      )}
      
      <div className="max-h-64 overflow-y-auto">
        {loading ? (
          <div className="px-3 py-6 text-center">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto text-slate-400" />
          </div>
        ) : filteredStaff.length === 0 ? (
          <div className="px-3 py-6 text-center text-slate-500 text-sm">
            No staff found
          </div>
        ) : (
          filteredStaff.map(staffMember => (
            <button
              key={staffMember.accountId}
              onClick={() => handleAssign(staffMember)}
              disabled={checking !== null}
              className="w-full px-3 py-2.5 flex items-center gap-3 hover:bg-violet-50 transition-colors text-left disabled:opacity-50"
            >
              <div className={`w-8 h-8 rounded-full ${getAvatarColor(staffMember.accountId)} flex items-center justify-center text-white text-xs font-bold`}>
                {checking === staffMember.accountId ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  getInitials(staffMember.fullName)
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">
                  {staffMember.fullName}
                </p>
                <p className="text-xs text-slate-500 truncate">{staffMember.email}</p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )
}

// Assignee Cell Component
const AssigneeCell: React.FC<{
  delivery: ActualDeliveryResponse
  onAssign: (deliveryId: number, staffId: number, staffName: string) => void
}> = ({ delivery, onAssign }) => {
  const [isOpen, setIsOpen] = useState(false)

  if (delivery.staffId && delivery.staffName) {
    return (
      <div className="flex items-center gap-2">
        <div className={`w-7 h-7 rounded-full ${getAvatarColor(delivery.staffId)} flex items-center justify-center text-white text-xs font-bold`}>
          {getInitials(delivery.staffName)}
        </div>
        <span className="text-sm text-slate-700">{delivery.staffName}</span>
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 border-dashed border-slate-300 hover:border-violet-400 hover:bg-violet-50 transition-all group"
      >
        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center group-hover:bg-violet-200">
          <UserPlus className="w-3.5 h-3.5 text-slate-500 group-hover:text-violet-600" />
        </div>
        <span className="text-sm text-slate-500 group-hover:text-violet-600">Assign</span>
        <ChevronDown className="w-4 h-4 text-slate-400" />
      </button>
      
      {isOpen && (
        <StaffDropdown
          deliveryId={delivery.id}
          groupScheduleId={delivery.groupScheduleId}
          onAssign={(staffId, staffName) => {
            onAssign(delivery.id, staffId, staffName)
            setIsOpen(false)
          }}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}

// Detail Panel Component
const DetailPanel: React.FC<{
  delivery: ActualDeliveryResponse
  onClose: () => void
  onAssign: (deliveryId: number, staffId: number, staffName: string) => void
}> = ({ delivery, onClose, onAssign }) => {
  const urgency = getUrgencyLevel(delivery.scheduleInfo.eventDate)

  return (
    <div className="w-[400px] border-l border-slate-200 bg-white flex flex-col h-full">
      <div className="p-4 border-b border-slate-200 flex items-start justify-between">
        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center gap-2 mb-1">
            {urgency === 'urgent' && (
              <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded-full">URGENT</span>
            )}
            {urgency === 'soon' && (
              <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">SOON</span>
            )}
            <span className="text-xs text-slate-500">#{delivery.rentalInfo.rentalId}</span>
          </div>
          <h2 className="text-lg font-bold text-slate-800 truncate">
            {delivery.rentalInfo.eventName}
          </h2>
        </div>
        <button 
          onClick={onClose} 
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-slate-400" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Date & Time */}
        <div className="p-4 bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl border border-violet-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-violet-500 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-violet-600 font-medium">EVENT DATE</p>
              <p className="font-bold text-slate-800">
                {formatFullDate(delivery.scheduleInfo.eventDate)}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div className="p-2.5 bg-white rounded-lg">
              <p className="text-xs text-slate-500 mb-0.5">Delivery</p>
              <p className="font-semibold text-slate-800">
                {formatTime(delivery.scheduleInfo.deliveryTime)}
              </p>
            </div>
            <div className="p-2.5 bg-white rounded-lg">
              <p className="text-xs text-slate-500 mb-0.5">Finish</p>
              <p className="font-semibold text-slate-800">
                {formatTime(delivery.scheduleInfo.finishTime)}
              </p>
            </div>
          </div>
        </div>
        
        {/* Location */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">LOCATION</p>
              <p className="font-bold text-slate-800">
                {delivery.scheduleInfo.eventLocation}
              </p>
              <p className="text-sm text-slate-600">{delivery.scheduleInfo.eventCity}</p>
            </div>
          </div>
        </div>
        
        {/* Customer */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-sky-500 flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-500 font-medium">CUSTOMER</p>
              <p className="font-bold text-slate-800">
                {delivery.rentalInfo.customerName}
              </p>
              <a 
                href={`tel:${delivery.rentalInfo.phoneNumber}`}
                className="text-sm text-sky-600 hover:underline flex items-center gap-1 mt-1"
              >
                <Phone className="w-3.5 h-3.5" />
                {delivery.rentalInfo.phoneNumber}
              </a>
            </div>
          </div>
        </div>
        
        {/* Notes */}
        {delivery.notes && (
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
            <p className="text-xs text-amber-600 font-medium mb-1">SPECIAL NOTES</p>
            <p className="text-sm text-amber-800">{delivery.notes}</p>
          </div>
        )}
        
        {/* Assignment */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
          <p className="text-xs text-slate-500 font-medium mb-3">ASSIGNED STAFF</p>
          <AssigneeCell delivery={delivery} onAssign={onAssign} />
        </div>
      </div>
    </div>
  )
}

// Main Component
export default function StaffAssignmentPage() {
  const navigate = useNavigate()
  const [deliveries, setDeliveries] = useState<ActualDeliveryResponse[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'customer' | 'location'>('date')
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const selectedDelivery = deliveries.find(d => d.id === selectedId)

  useEffect(() => {
    loadDeliveries()
  }, [sortBy])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) loadDeliveries()
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const loadDeliveries = async () => {
    const isRefresh = deliveries.length > 0
    isRefresh ? setRefreshing(true) : setLoading(true)
    
    try {
      const data = await getPendingDeliveries(1, 50, searchQuery || undefined, sortBy)
      setDeliveries(data.items)
    } catch (err) {
      console.error('Failed to load deliveries:', err)
      toast.error('Failed to load deliveries')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const stats = useMemo(() => {
    const urgent = deliveries.filter(d => 
      getUrgencyLevel(d.scheduleInfo.eventDate) === 'urgent'
    )
    return { total: deliveries.length, urgent: urgent.length }
  }, [deliveries])

  const handleAssign = (deliveryId: number, _staffId: number, staffName: string) => {
    setDeliveries(prev => prev.filter(d => d.id !== deliveryId))
    setSelectedId(null)
    toast.success(`Successfully assigned to ${staffName}`)
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { font-family: 'Inter', sans-serif; }
      `}</style>

      {/* Header - STANDALONE với Back Button */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Back Button */}
            <button
              onClick={() => navigate('/manager/dashboard')}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors group"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600 group-hover:text-slate-800" />
            </button>

            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <Users className="w-5 h-5 text-white" />
            </div>
            
            <div>
              <h1 className="text-xl font-bold text-slate-800">Staff Assignment</h1>
              <p className="text-sm text-slate-500">Assign staff to pending deliveries</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Stats Pills */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-100 rounded-full">
              <Package className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-semibold text-amber-700">
                {stats.total} pending
              </span>
            </div>
            {stats.urgent > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-red-100 rounded-full animate-pulse">
                <Zap className="w-4 h-4 text-red-600" />
                <span className="text-sm font-semibold text-red-700">
                  {stats.urgent} urgent
                </span>
              </div>
            )}
            
            {/* Refresh Button */}
            <button
              onClick={loadDeliveries}
              disabled={refreshing}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw className={`w-5 h-5 text-slate-600 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Toolbar */}
      <div className="bg-white border-b border-slate-200 px-6 py-3">
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search events, customers, cities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-100 border-0 focus:ring-2 focus:ring-violet-500 outline-none text-sm"
            />
          </div>
          
          {/* Sort Button */}
          <button
            onClick={() => setSortBy(prev => {
              const order: Array<'date' | 'name' | 'customer' | 'location'> = ['date', 'name', 'customer', 'location']
              const idx = order.indexOf(prev)
              return order[(idx + 1) % order.length]
            })}
            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowUpDown className="w-4 h-4" />
            Sort by {sortBy}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Table */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <RefreshCw className="w-8 h-8 animate-spin text-slate-400 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">Loading deliveries...</p>
              </div>
            </div>
          ) : deliveries.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-1">
                All caught up!
              </h3>
              <p className="text-slate-500 text-sm mb-4">No pending deliveries to assign</p>
              <button
                onClick={() => navigate('/manager/dashboard')}
                className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors text-sm font-medium"
              >
                Back to Dashboard
              </button>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Assignee
                  </th>
                  <th className="w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {deliveries.map(delivery => {
                  const urgency = getUrgencyLevel(delivery.scheduleInfo.eventDate)
                  const isSelected = selectedId === delivery.id
                  
                  return (
                    <tr
                      key={delivery.id}
                      onClick={() => setSelectedId(delivery.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-violet-50' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {urgency === 'urgent' && (
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                          )}
                          {urgency === 'soon' && (
                            <div className="w-2 h-2 rounded-full bg-amber-500" />
                          )}
                          <div>
                            <p className="font-medium text-slate-800">
                              {delivery.rentalInfo.eventName}
                            </p>
                            <p className="text-xs text-slate-500">
                              #{delivery.rentalInfo.rentalId}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col">
                          <span className={`text-sm font-medium ${
                            urgency === 'urgent' 
                              ? 'text-red-600' 
                              : urgency === 'soon' 
                                ? 'text-amber-600' 
                                : 'text-slate-800'
                          }`}>
                            {formatDate(delivery.scheduleInfo.eventDate)}
                          </span>
                          <span className="text-xs text-slate-500">
                            {formatTime(delivery.scheduleInfo.deliveryTime)} - {formatTime(delivery.scheduleInfo.finishTime)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm text-slate-800 truncate max-w-[180px]">
                            {delivery.scheduleInfo.eventLocation}
                          </span>
                          <span className="text-xs text-slate-500">
                            {delivery.scheduleInfo.eventCity}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-slate-700">
                          {delivery.rentalInfo.customerName}
                        </span>
                      </td>
                      <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                        <AssigneeCell delivery={delivery} onAssign={handleAssign} />
                      </td>
                      <td className="px-4 py-4">
                        <ChevronRight className={`w-5 h-5 transition-colors ${
                          isSelected ? 'text-violet-500' : 'text-slate-300'
                        }`} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Detail Panel */}
        {selectedDelivery && (
          <DetailPanel
            delivery={selectedDelivery}
            onClose={() => setSelectedId(null)}
            onAssign={handleAssign}
          />
        )}
      </div>
    </div>
  )
}