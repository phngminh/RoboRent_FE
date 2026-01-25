import React, { useState, useEffect } from 'react'
import { 
  Users, UserPlus, Calendar, Search, 
  AlertTriangle, CheckCircle2, RefreshCw, Package, 
  ChevronRight, ArrowLeft, MapPin, User
} from 'lucide-react'
import { toast } from 'react-toastify'
import { 
  getPendingDeliveriesGrouped, 
  getTechStaffList, 
  assignStaffBatch 
} from '../../apis/delivery.api'

import type { 
  GroupedDeliveryInfo, 
  StaffListItemResponse 
} from '../../types/delivery.types'
import { useNavigate } from 'react-router-dom'
import ConflictConfirmDialog from '../../components/ConflictConfirmDialog'

// Helper functions
const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  if (date.toDateString() === today.toDateString()) return 'Today'
  if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow'
  
  return date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  })
}

const formatTime = (value?: string | null): string => {
  if (!value) return "--:--";

  // ISO datetime
  if (value.includes("T")) {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "--:--";
    const hour = d.getHours();
    const minute = d.getMinutes();
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${String(minute).padStart(2, '0')} ${ampm}`;
  }

  // "HH:mm:ss" / "HH:mm"
  const parts = value.split(":");
  if (parts.length < 2) return "--:--";
  const hour = parseInt(parts[0]);
  const minute = parseInt(parts[1]);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return "--:--";
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${String(minute).padStart(2, '0')} ${ampm}`;
};

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
  onAssign: (staffId: number, staffName: string) => void
  onClose: () => void
}> = ({ onAssign, onClose }) => {
  const [search, setSearch] = useState('')
  const [staff, setStaff] = useState<StaffListItemResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [assigning, setAssigning] = useState<number | null>(null)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadStaff()
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      const data = await getTechStaffList(1, 100, 'Active', search)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  const handleAssign = async (staffMember: StaffListItemResponse) => {
    setAssigning(staffMember.accountId)
    
    try {
      onAssign(staffMember.accountId, staffMember.fullName)
    } finally {
      setAssigning(null)
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
              disabled={assigning !== null}
              className="w-full px-3 py-2.5 flex items-center gap-3 hover:bg-violet-50 transition-colors text-left disabled:opacity-50"
            >
              <div className={`w-8 h-8 rounded-full ${getAvatarColor(staffMember.accountId)} flex items-center justify-center text-white text-xs font-bold`}>
                {assigning === staffMember.accountId ? (
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

// Group Card Component
const GroupCard: React.FC<{
  group: GroupedDeliveryInfo
  onAssign: (group: GroupedDeliveryInfo, staffId: number, staffName: string) => void
}> = ({ group, onAssign }) => {
  const [isOpen, setIsOpen] = useState(false)
  const urgency = getUrgencyLevel(group.eventDate)

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-all">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-slate-800 truncate">
                {group.activityTypeGroupName}
              </h3>
              <p className="text-xs text-slate-500">
                {group.scheduleCount} schedule{group.scheduleCount > 1 ? 's' : ''}
              </p>
            </div>
            {urgency === 'urgent' && (
              <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded-full flex-shrink-0">
                URGENT
              </span>
            )}
            {urgency === 'soon' && (
              <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-full flex-shrink-0">
                SOON
              </span>
            )}
          </div>

          {/* Details */}
          <div className="space-y-1.5 mb-3">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Calendar className="w-4 h-4 text-violet-500 flex-shrink-0" />
              <span>
                {formatTime(group.scheduleInfo.earliestSetupTime)} - {formatTime(group.scheduleInfo.latestFinishTime)}
              </span>
            </div>
            <div className="flex items-start gap-2 text-sm text-slate-600">
              <MapPin className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
              <span className="truncate">
                {group.scheduleInfo.eventLocations.slice(0, 2).join(', ')}
                {group.scheduleInfo.eventLocations.length > 2 && ` +${group.scheduleInfo.eventLocations.length - 2} more`}
              </span>
            </div>
            <div className="flex items-start gap-2 text-sm text-slate-600">
              <User className="w-4 h-4 text-sky-500 flex-shrink-0 mt-0.5" />
              <span className="truncate">
                {group.rentalInfo.customerNames.slice(0, 2).join(', ')}
                {group.rentalInfo.customerNames.length > 2 && ` +${group.rentalInfo.customerNames.length - 2} more`}
              </span>
            </div>
          </div>
        </div>

        {/* Assign Button */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors font-medium text-sm whitespace-nowrap"
          >
            <UserPlus className="w-4 h-4" />
            Assign Staff
            <ChevronRight className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
          </button>
          
          {isOpen && (
            <StaffDropdown
              onAssign={(staffId, staffName) => {
                onAssign(group, staffId, staffName)
                setIsOpen(false)
              }}
              onClose={() => setIsOpen(false)}
            />
          )}
        </div>
      </div>
    </div>
  )
}

// Main Component
export default function StaffAssignmentPage() {
  const navigate = useNavigate()
  const [groups, setGroups] = useState<GroupedDeliveryInfo[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  // Conflict dialog state
  const [conflictDialog, setConflictDialog] = useState<{
    open: boolean
    group: GroupedDeliveryInfo | null
    staffId: number | null
    staffName: string | null
    message: string
    assignableCount: number
    totalCount: number
  }>({
    open: false,
    group: null,
    staffId: null,
    staffName: null,
    message: '',
    assignableCount: 0,
    totalCount: 0
  })

  useEffect(() => {
    loadGroups()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadGroups = async () => {
    const isRefresh = groups.length > 0
    if (isRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }
    
    try {
      // Default: next 30 days
      const today = new Date()
      const nextMonth = new Date(today)
      nextMonth.setDate(nextMonth.getDate() + 30)
      
      const from = today.toISOString().split('T')[0]
      const to = nextMonth.toISOString().split('T')[0]
      
      const data = await getPendingDeliveriesGrouped(from, to)
      setGroups(data?.groups || [])
    } catch (err) {
      console.error('Failed to load groups:', err)
      toast.error('Failed to load pending deliveries')
      setGroups([]) // Set empty array on error
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleAssign = async (group: GroupedDeliveryInfo, staffId: number, staffName: string) => {
    try {
      const response = await assignStaffBatch({
        activityTypeGroupId: group.activityTypeGroupId,
        eventDate: group.eventDate,
        staffId,
        forcePartialAssign: false
      })

      // Conflict detected - show confirmation dialog
      if (response.hasConflict && !response.success) {
        setConflictDialog({
          open: true,
          group,
          staffId,
          staffName,
          message: response.conflictMessage || 'Travel time conflict detected',
          assignableCount: group.scheduleCount - (response.conflictingScheduleIds?.length || 0),
          totalCount: group.scheduleCount
        })
        return
      }

      // Success
      toast.success(`Successfully assigned ${response.assignedCount} schedule(s) to ${staffName}`)
      loadGroups() // Reload data
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } }
      console.error('Assignment failed:', error)
      toast.error(error.response?.data?.error || 'Failed to assign staff')
    }
  }

  const handleConflictConfirm = async () => {
    const { group, staffId } = conflictDialog
    if (!group || !staffId) return

    try {
      const response = await assignStaffBatch({
        activityTypeGroupId: group.activityTypeGroupId,
        eventDate: group.eventDate,
        staffId,
        forcePartialAssign: true
      })

      toast.success(`Successfully assigned ${response.assignedCount} of ${conflictDialog.totalCount} schedule(s)`)
      setConflictDialog({ ...conflictDialog, open: false })
      loadGroups()
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } }
      console.error('Assignment failed:', error)
      toast.error(error.response?.data?.error || 'Failed to assign staff')
    }
  }

  // Group by date
  const groupedByDate = (groups || []).reduce((acc, group) => {
    const dateKey = group.eventDate
    if (!acc[dateKey]) {
      acc[dateKey] = []
    }
    acc[dateKey].push(group)
    return acc
  }, {} as Record<string, GroupedDeliveryInfo[]>)

  // Filter by search
  const filteredGroupedByDate = Object.entries(groupedByDate).reduce((acc, [date, items]) => {
    const filtered = items.filter(group =>
      group.activityTypeGroupName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.scheduleInfo.eventLocations.some(loc => loc.toLowerCase().includes(searchQuery.toLowerCase())) ||
      group.scheduleInfo.eventCities.some(city => city.toLowerCase().includes(searchQuery.toLowerCase())) ||
      group.rentalInfo.customerNames.some(name => name.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    if (filtered.length > 0) {
      acc[date] = filtered
    }
    return acc
  }, {} as Record<string, GroupedDeliveryInfo[]>)

  const totalGroups = Object.values(filteredGroupedByDate).flat().length
  const urgentGroups = Object.values(filteredGroupedByDate).flat().filter(g => getUrgencyLevel(g.eventDate) === 'urgent').length

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { font-family: 'Inter', sans-serif; }
      `}</style>

      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/manager')}
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
              <p className="text-sm text-slate-500">Assign staff to delivery groups</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {totalGroups > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-violet-100 rounded-full">
                <Package className="w-4 h-4 text-violet-600" />
                <span className="text-sm font-semibold text-violet-700">
                  {totalGroups} group{totalGroups > 1 ? 's' : ''}
                </span>
              </div>
            )}
            {urgentGroups > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-red-100 rounded-full animate-pulse">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="text-sm font-semibold text-red-700">
                  {urgentGroups} urgent
                </span>
              </div>
            )}
            
            <button
              onClick={loadGroups}
              disabled={refreshing}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw className={`w-5 h-5 text-slate-600 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Search */}
      <div className="bg-white border-b border-slate-200 px-6 py-3">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search groups, locations, customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-100 border-0 focus:ring-2 focus:ring-violet-500 outline-none text-sm"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 animate-spin text-slate-400 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">Loading groups...</p>
            </div>
          </div>
        ) : totalGroups === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-1">
              All caught up!
            </h3>
            <p className="text-slate-500 text-sm mb-4">No pending deliveries to assign</p>
            <button
              onClick={() => navigate('/manager')}
              className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors text-sm font-medium"
            >
              Back to Dashboard
            </button>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto space-y-8">
            {Object.entries(filteredGroupedByDate)
              .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
              .map(([date, items]) => (
                <div key={date}>
                  {/* Date Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-1 h-8 bg-violet-500 rounded-full" />
                    <div>
                      <h2 className="text-lg font-bold text-slate-800">{formatDate(date)}</h2>
                      <p className="text-xs text-slate-500">
                        {new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  {/* Group Cards */}
                  <div className="space-y-3 ml-6">
                    {items.map(group => (
                      <GroupCard
                        key={`${group.activityTypeGroupId}-${group.eventDate}`}
                        group={group}
                        onAssign={handleAssign}
                      />
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Conflict Confirmation Dialog */}
      <ConflictConfirmDialog
        open={conflictDialog.open}
        onClose={() => setConflictDialog({ ...conflictDialog, open: false })}
        onConfirm={handleConflictConfirm}
        message={conflictDialog.message}
        assignableCount={conflictDialog.assignableCount}
        totalCount={conflictDialog.totalCount}
      />
    </div>
  )
}
