// src/pages/staff/DeliveryTrackingPage.tsx
import { useState, useEffect, useCallback } from 'react';
import { 
  Truck, Package, CheckCircle2, Clock, MapPin, Phone, User, 
  Calendar, ChevronRight, Search, RefreshCw,
  MessageSquare, X, ArrowRight,
  Building2, Timer, Bot, Send
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import Header from '../../components/header';
import { 
  getMyDeliveries, 
  updateDeliveryStatus, 
  updateDeliveryNotes,
  completeRental // ✅ Đã thêm import
} from '../../apis/delivery.api';
import type { ActualDeliveryResponse, DeliveryStatus } from '../../types/delivery.types';

// Status configuration with vibrant colors
const STATUS_CONFIG: Record<DeliveryStatus, { 
  color: string; 
  bg: string; 
  border: string;
  gradient: string;
  icon: React.ReactNode;
  label: string;
}> = {
  Pending: { 
    color: 'text-slate-600', 
    bg: 'bg-slate-100', 
    border: 'border-slate-300',
    gradient: 'from-slate-400 to-slate-500',
    icon: <Clock className="w-4 h-4" />,
    label: 'Pending'
  },
  Assigned: { 
    color: 'text-violet-600', 
    bg: 'bg-violet-100', 
    border: 'border-violet-300',
    gradient: 'from-violet-400 to-violet-600',
    icon: <User className="w-4 h-4" />,
    label: 'Assigned'
  },
  Delivering: { 
    color: 'text-amber-600', 
    bg: 'bg-amber-100', 
    border: 'border-amber-300',
    gradient: 'from-amber-400 to-orange-500',
    icon: <Truck className="w-4 h-4" />,
    label: 'Delivering'
  },
  Delivered: { 
    color: 'text-emerald-600', 
    bg: 'bg-emerald-100', 
    border: 'border-emerald-300',
    gradient: 'from-emerald-400 to-teal-500',
    icon: <Package className="w-4 h-4" />,
    label: 'Delivered'
  },
};

const STATUS_ORDER: DeliveryStatus[] = ['Pending', 'Assigned', 'Delivering', 'Delivered'];

// Helper functions
const getNextStatus = (current: DeliveryStatus): DeliveryStatus | null => {
  const currentIndex = STATUS_ORDER.indexOf(current);
  if (currentIndex === -1 || currentIndex === STATUS_ORDER.length - 1) return null;
  return STATUS_ORDER[currentIndex + 1];
};

const formatDateTime = (dateStr: string | null): string => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
};

const formatTime = (timeStr: string): string => {
  const [hours, minutes] = timeStr.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

// Status Update Modal
const StatusUpdateModal: React.FC<{
  delivery: ActualDeliveryResponse;
  onClose: () => void;
  onUpdate: (status: DeliveryStatus, notes: string) => void;
}> = ({ delivery, onClose, onUpdate }) => {
  const nextStatus = getNextStatus(delivery.status);
  const [notes, setNotes] = useState(delivery.notes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!nextStatus) return;
    setIsSubmitting(true);
    await onUpdate(nextStatus, notes);
    setIsSubmitting(false);
  };

  if (!nextStatus) return null;

  const nextConfig = STATUS_CONFIG[nextStatus];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-up">
        {/* Header */}
        <div className={`bg-gradient-to-r ${nextConfig.gradient} p-6 text-white`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-xl">
                {nextConfig.icon}
              </div>
              <div>
                <h3 className="text-xl font-bold">Update Status</h3>
                <p className="text-white/80 text-sm">Transition to next step</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Transition */}
          <div className="flex items-center justify-center gap-4 py-4">
            <div className={`px-4 py-2 rounded-xl ${STATUS_CONFIG[delivery.status].bg} ${STATUS_CONFIG[delivery.status].color} font-semibold flex items-center gap-2`}>
              {STATUS_CONFIG[delivery.status].icon}
              {delivery.status}
            </div>
            <ArrowRight className="w-6 h-6 text-slate-400" />
            <div className={`px-4 py-2 rounded-xl ${nextConfig.bg} ${nextConfig.color} font-semibold flex items-center gap-2 ring-2 ring-offset-2 ${nextConfig.border}`}>
              {nextConfig.icon}
              {nextStatus}
            </div>
          </div>

          {/* Auto-fill notice */}
          {nextStatus === 'Delivered' && (
            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200">
              <Timer className="w-5 h-5 text-amber-600" />
              <p className="text-sm text-amber-800">
                <span className="font-semibold">Auto-timestamp:</span> Actual delivery time will be recorded automatically.
              </p>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Add Notes <span className="text-slate-400 font-normal">(optional but recommended)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any observations, customer feedback, or important details..."
              className="w-full h-32 px-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-violet-400 focus:ring-4 focus:ring-violet-100 outline-none resize-none transition-all text-slate-700 placeholder:text-slate-400"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`flex-1 px-6 py-3 rounded-xl bg-gradient-to-r ${nextConfig.gradient} text-white font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50`}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Confirm Update
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Notes Modal
const NotesModal: React.FC<{
  delivery: ActualDeliveryResponse;
  onClose: () => void;
  onSave: (notes: string) => void;
}> = ({ delivery, onClose, onSave }) => {
  const [notes, setNotes] = useState(delivery.notes || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await onSave(notes);
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-up">
        <div className="bg-gradient-to-r from-violet-500 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Delivery Notes</h3>
                <p className="text-white/80 text-sm">Record important details</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any observations, customer requests, special instructions..."
            className="w-full h-40 px-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-violet-400 focus:ring-4 focus:ring-violet-100 outline-none resize-none transition-all text-slate-700 placeholder:text-slate-400"
            autoFocus
          />
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 px-6 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Calendar className="w-5 h-5" /> {/* Note: Icon changed just for safety, or use FileText */}
                  Save Notes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Status Stepper Component
const StatusStepper: React.FC<{ currentStatus: DeliveryStatus }> = ({ currentStatus }) => {
  const currentIndex = STATUS_ORDER.indexOf(currentStatus);

  return (
    <div className="relative">
      <div className="flex items-center justify-between">
        {STATUS_ORDER.map((status, index) => {
          const config = STATUS_CONFIG[status];
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div key={status} className="flex-1 flex flex-col items-center relative">
              {/* Connector Line */}
              {index > 0 && (
                <div className={`absolute left-0 right-1/2 top-5 h-1 -translate-y-1/2 rounded-full transition-all duration-500 ${
                  isCompleted || isCurrent ? `bg-gradient-to-r ${STATUS_CONFIG[STATUS_ORDER[index - 1]].gradient}` : 'bg-slate-200'
                }`} style={{ right: '50%', left: '-50%' }} />
              )}
              
              {/* Status Node */}
              <div className={`relative z-10 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                isCompleted 
                  ? `bg-gradient-to-br ${config.gradient} text-white shadow-lg` 
                  : isCurrent 
                    ? `bg-gradient-to-br ${config.gradient} text-white shadow-xl ring-4 ring-offset-2 ${config.border} scale-110` 
                    : 'bg-slate-100 text-slate-400'
              }`}>
                {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : config.icon}
              </div>
              
              {/* Label */}
              <span className={`mt-2 text-xs font-semibold transition-colors ${
                isCurrent ? config.color : isCompleted ? 'text-slate-600' : 'text-slate-400'
              }`}>
                {config.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Delivery Card Component
const DeliveryCard: React.FC<{
  delivery: ActualDeliveryResponse;
  isSelected: boolean;
  onClick: () => void;
}> = ({ delivery, isSelected, onClick }) => {
  const config = STATUS_CONFIG[delivery.status];
  const eventDate = new Date(delivery.scheduleInfo.eventDate);
  const isToday = eventDate.toDateString() === new Date().toDateString();

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-300 group ${
        isSelected 
          ? `border-transparent bg-gradient-to-r ${config.gradient} text-white shadow-xl scale-[1.02]` 
          : 'border-slate-200 bg-white hover:border-violet-300 hover:shadow-lg'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 ${
          isSelected ? 'bg-white/20 text-white' : `${config.bg} ${config.color}`
        }`}>
          {config.icon}
          {delivery.status}
        </div>
        {isToday && (
          <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${
            isSelected ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-700'
          }`}>
            TODAY
          </span>
        )}
      </div>
      
      <h3 className={`font-bold text-lg mb-1 truncate ${isSelected ? 'text-white' : 'text-slate-800'}`}>
        {delivery.rentalInfo.eventName}
      </h3>
      
      <div className={`flex items-center gap-2 text-sm mb-2 ${isSelected ? 'text-white/80' : 'text-slate-500'}`}>
        <MapPin className="w-4 h-4 flex-shrink-0" />
        <span className="truncate">{delivery.scheduleInfo.eventLocation}</span>
      </div>
      
      <div className={`flex items-center gap-4 text-sm ${isSelected ? 'text-white/80' : 'text-slate-500'}`}>
        <div className="flex items-center gap-1.5">
          <Calendar className="w-4 h-4" />
          {formatDate(delivery.scheduleInfo.eventDate)}
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-4 h-4" />
          {formatTime(delivery.scheduleInfo.deliveryTime)}
        </div>
      </div>
    </button>
  );
};

// Time Comparison Component
const TimeComparison: React.FC<{
  label: string;
  scheduled: string | null;
  actual: string | null;
  icon: React.ReactNode;
}> = ({ label, scheduled, actual, icon }) => {
  const scheduledDate = scheduled ? new Date(scheduled) : null;
  const actualDate = actual ? new Date(actual) : null;
  
  let comparison = null;
  if (scheduledDate && actualDate) {
    const diff = Math.round((actualDate.getTime() - scheduledDate.getTime()) / 60000);
    if (diff < -5) {
      comparison = { text: `${Math.abs(diff)} min early`, color: 'text-emerald-600 bg-emerald-50' };
    } else if (diff > 5) {
      comparison = { text: `${diff} min late`, color: 'text-amber-600 bg-amber-50' };
    } else {
      comparison = { text: 'On time', color: 'text-emerald-600 bg-emerald-50' };
    }
  }

  return (
    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-600">
          {icon}
        </div>
        <h4 className="font-semibold text-slate-700">{label}</h4>
        {comparison && (
          <span className={`ml-auto px-2 py-0.5 rounded-md text-xs font-bold ${comparison.color}`}>
            {comparison.text}
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-slate-500 mb-1">Scheduled</p>
          <p className="font-semibold text-slate-800">{formatDateTime(scheduled)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-1">Actual</p>
          <p className={`font-semibold ${actual ? 'text-slate-800' : 'text-slate-400'}`}>
            {formatDateTime(actual)}
          </p>
        </div>
      </div>
    </div>
  );
};

// Main Dashboard Component
export default function DeliveryTrackingPage() {
  const { user } = useAuth();
  const [deliveries, setDeliveries] = useState<ActualDeliveryResponse[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<DeliveryStatus | 'all'>('all');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // ✅ NEW STATE: Loading state cho nút Complete
  const [isCompleting, setIsCompleting] = useState(false);

  const selectedDelivery = deliveries.find(d => d.id === selectedId);

  // Load deliveries
  const loadDeliveries = async () => {
    try {
      const data = await getMyDeliveries();
      setDeliveries(data);
      
      // Auto-select first delivery if none selected
      if (!selectedId && data.length > 0) {
        setSelectedId(data[0].id);
      }
    } catch (error: any) {
      console.error('Failed to load deliveries:', error);
      toast.error('Failed to load deliveries');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDeliveries();
  }, []);

  // Filter deliveries
  const filteredDeliveries = deliveries.filter(d => {
    const matchesSearch = 
      d.rentalInfo.eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.rentalInfo.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.scheduleInfo.eventLocation.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Refresh handler
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await loadDeliveries();
      toast.success('Deliveries refreshed');
    } catch (error) {
      toast.error('Failed to refresh');
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Auto-refresh every 30 seconds ← bỏ luôn cái này
  // useEffect(() => {
  //   const interval = setInterval(handleRefresh, 30000);
  //   return () => clearInterval(interval);
  // }, [handleRefresh]);

  // Status update handler
  const handleStatusUpdate = async (newStatus: DeliveryStatus, notes: string) => {
    if (!selectedDelivery) return;

    try {
      const updated = await updateDeliveryStatus(selectedDelivery.id, {
        status: newStatus,
        notes: notes || undefined
      });
      
      // Update local state
      setDeliveries(prev => 
        prev.map(d => d.id === selectedDelivery.id ? updated : d)
      );
      
      setShowStatusModal(false);
      toast.success(`Status updated to ${newStatus}`);
    } catch (error: any) {
      console.error('Failed to update status:', error);
      toast.error(error.response?.data?.Error || 'Failed to update status');
    }
  };

  // Notes update handler
  const handleNotesUpdate = async (notes: string) => {
    if (!selectedDelivery) return;

    try {
      const updated = await updateDeliveryNotes(selectedDelivery.id, { notes });
      
      // Update local state
      setDeliveries(prev =>
        prev.map(d => d.id === selectedDelivery.id ? updated : d)
      );
      
      setShowNotesModal(false);
      toast.success('Notes saved successfully');
    } catch (error: any) {
      console.error('Failed to save notes:', error);
      toast.error(error.response?.data?.Error || 'Failed to save notes');
    }
  };

  // ✅ NEW HANDLER: Complete Rental
  const handleCompleteRental = async () => {
    if (!selectedDelivery) return;

    if (!window.confirm(`Are you sure you want to complete rental for "${selectedDelivery.rentalInfo.eventName}"?`)) {
      return;
    }

    setIsCompleting(true);
    try {
      await completeRental(selectedDelivery.rentalInfo.rentalId);
      
      toast.success('Rental completed successfully! Payment link generated for customer.');
      
      // Có thể reload list nếu cần, nhưng trạng thái delivery không đổi nên không bắt buộc
    } catch (error: any) {
      console.error('Failed to complete rental:', error);
      toast.error(error.response?.data?.message || 'Failed to complete rental');
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-rose-50/30">
      {/* Custom styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        
        * {
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes scale-up {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        
        .animate-scale-up {
          animation: scale-up 0.2s ease-out;
        }
        
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>

      <Header />

      {/* Main Content */}
      <main className="pt-16 max-w-[1600px] mx-auto p-6">
        <div className="flex gap-6">
          {/* Sidebar - Deliveries List */}
          <aside className="w-[400px] flex-shrink-0">
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden sticky top-28">
              {/* Search & Filter */}
              <div className="p-4 border-b border-slate-100">
                <div className="relative mb-3">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search deliveries..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-100 border-2 border-transparent focus:border-violet-400 focus:bg-white outline-none transition-all text-slate-700 placeholder:text-slate-400"
                  />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                  <button
                    onClick={() => setStatusFilter('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
                      statusFilter === 'all' 
                        ? 'bg-slate-800 text-white' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    All ({deliveries.length})
                  </button>
                  {(['Pending', 'Assigned', 'Delivering', 'Delivered'] as DeliveryStatus[]).map(status => {
                    const count = deliveries.filter(d => d.status === status).length;
                    const config = STATUS_CONFIG[status];
                    return (
                      <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                          statusFilter === status 
                            ? `bg-gradient-to-r ${config.gradient} text-white` 
                            : `${config.bg} ${config.color} hover:opacity-80`
                        }`}
                      >
                        {config.icon}
                        {count}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Deliveries List */}
              <div className="p-4 space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto scrollbar-thin">
                {isLoading ? (
                  <div className="text-center py-12">
                    <RefreshCw className="w-8 h-8 animate-spin text-violet-500 mx-auto mb-2" />
                    <p className="text-slate-500">Loading deliveries...</p>
                  </div>
                ) : filteredDeliveries.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                      <Package className="w-10 h-10 text-slate-300" />
                    </div>
                    <p className="text-slate-500 font-medium">No deliveries found</p>
                    <p className="text-slate-400 text-sm">Try adjusting your filters</p>
                  </div>
                ) : (
                  filteredDeliveries.map((delivery, index) => (
                    <div 
                      key={delivery.id}
                      className="animate-slide-up"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <DeliveryCard
                        delivery={delivery}
                        isSelected={selectedId === delivery.id}
                        onClick={() => setSelectedId(delivery.id)}
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          </aside>

          {/* Main Detail Area */}
          <div className="flex-1">
            {selectedDelivery ? (
              <div className="space-y-6 animate-slide-up">
                {/* Header Card */}
                <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
                  <div className={`bg-gradient-to-r ${STATUS_CONFIG[selectedDelivery.status].gradient} p-8 text-white`}>
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="px-3 py-1 rounded-lg bg-white/20 text-sm font-bold flex items-center gap-2">
                            {STATUS_CONFIG[selectedDelivery.status].icon}
                            {selectedDelivery.status}
                          </span>
                          <span className="px-3 py-1 rounded-lg bg-white/20 text-sm">
                            ID: #{selectedDelivery.id}
                          </span>
                        </div>
                        <h2 className="text-3xl font-extrabold mb-2">{selectedDelivery.rentalInfo.eventName}</h2>
                        <div className="flex items-center gap-2 text-white/80">
                          <MapPin className="w-5 h-5" />
                          <span>{selectedDelivery.scheduleInfo.eventLocation}, {selectedDelivery.scheduleInfo.eventCity}</span>
                        </div>
                      </div>
                      
                      {/* ✅ NÚT BẤM COMPLETE RENTAL VÀ CÁC NÚT KHÁC */}
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setShowNotesModal(true)}
                          className="px-5 py-3 rounded-xl bg-white/20 hover:bg-white/30 font-semibold flex items-center gap-2 transition-colors"
                        >
                          <MessageSquare className="w-5 h-5" />
                          Notes
                        </button>

                        {/* Update Status (Existing) */}
                        {getNextStatus(selectedDelivery.status) && (
                          <button 
                            onClick={() => setShowStatusModal(true)}
                            className="px-5 py-3 rounded-xl bg-white text-slate-800 font-bold flex items-center gap-2 hover:bg-white/90 transition-colors shadow-lg"
                          >
                            <ArrowRight className="w-5 h-5" />
                            Update Status
                          </button>
                        )}

                        {/* ✅ NEW: Complete Rental Button */}
                        {selectedDelivery.status === 'Delivered' && (
                          <button 
                            onClick={handleCompleteRental}
                            disabled={isCompleting}
                            className="px-5 py-3 rounded-xl bg-slate-900 text-white font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors shadow-lg disabled:opacity-50 ring-2 ring-white/20"
                          >
                            {isCompleting ? (
                              <RefreshCw className="w-5 h-5 animate-spin" />
                            ) : (
                              <CheckCircle2 className="w-5 h-5" />
                            )}
                            Complete Rental
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Status Stepper */}
                    <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-xl">
                      <StatusStepper currentStatus={selectedDelivery.status} />
                    </div>
                  </div>

                  {/* Event Info Grid */}
                  <div className="p-6">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-xl bg-violet-500 text-white flex items-center justify-center">
                            <Calendar className="w-5 h-5" />
                          </div>
                          <span className="font-semibold text-violet-700">Event Date</span>
                        </div>
                        <p className="text-xl font-bold text-slate-800">
                          {formatDate(selectedDelivery.scheduleInfo.eventDate)}
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center">
                            <Clock className="w-5 h-5" />
                          </div>
                          <span className="font-semibold text-amber-700">Event Hours</span>
                        </div>
                        <p className="text-xl font-bold text-slate-800">
                          {formatTime(selectedDelivery.scheduleInfo.startTime)} - {formatTime(selectedDelivery.scheduleInfo.endTime)}
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center">
                            <Truck className="w-5 h-5" />
                          </div>
                          <span className="font-semibold text-emerald-700">Delivery Window</span>
                        </div>
                        <p className="text-xl font-bold text-slate-800">
                          {formatTime(selectedDelivery.scheduleInfo.deliveryTime)} - {formatTime(selectedDelivery.scheduleInfo.finishTime)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Time Comparison & Customer Info */}
                <div className="grid grid-cols-2 gap-6">
                  {/* Time Comparison Card */}
                  <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 p-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <Timer className="w-5 h-5 text-violet-500" />
                      Time Tracking
                    </h3>
                    <div className="space-y-4">
                      <TimeComparison
                        label="Delivery Time"
                        scheduled={selectedDelivery.scheduledDeliveryTime}
                        actual={selectedDelivery.actualDeliveryTime}
                        icon={<Truck className="w-4 h-4" />}
                      />
                      <TimeComparison
                        label="Pickup Time"
                        scheduled={selectedDelivery.scheduledPickupTime}
                        actual={selectedDelivery.actualPickupTime}
                        icon={<Package className="w-4 h-4" />}
                      />
                    </div>
                  </div>

                  {/* Customer Info Card */}
                  <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 p-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <User className="w-5 h-5 text-violet-500" />
                      Customer Information
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-rose-500/30">
                          {selectedDelivery.rentalInfo.customerName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-lg">{selectedDelivery.rentalInfo.customerName}</p>
                          <p className="text-slate-500">Event Organizer</p>
                        </div>
                      </div>
                      <a 
                        href={`tel:${selectedDelivery.rentalInfo.phoneNumber}`}
                        className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 hover:shadow-lg transition-shadow group"
                      >
                        <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Phone className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs text-emerald-600 font-semibold mb-1">PHONE NUMBER</p>
                          <p className="font-bold text-slate-800">{selectedDelivery.rentalInfo.phoneNumber}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-emerald-500 ml-auto" />
                      </a>
                      <div className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200">
                        <div className="w-12 h-12 rounded-xl bg-violet-500 text-white flex items-center justify-center">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs text-violet-600 font-semibold mb-1">RENTAL ID</p>
                          <p className="font-bold text-slate-800">#{selectedDelivery.rentalInfo.rentalId}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes Section */}
                {selectedDelivery.notes && (
                  <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 p-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-violet-500" />
                      Delivery Notes
                    </h3>
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200">
                      <p className="text-slate-700 leading-relaxed">{selectedDelivery.notes}</p>
                      <p className="text-xs text-amber-600 mt-3 font-medium">
                        Last updated: {formatDateTime(selectedDelivery.updatedAt || selectedDelivery.createdAt)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 p-12 text-center">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center">
                  <Bot className="w-12 h-12 text-violet-400" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">Select a Delivery</h3>
                <p className="text-slate-500 max-w-md mx-auto">
                  Choose a delivery from the list to view details, update status, and manage notes.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      {showStatusModal && selectedDelivery && (
        <StatusUpdateModal
          delivery={selectedDelivery}
          onClose={() => setShowStatusModal(false)}
          onUpdate={handleStatusUpdate}
        />
      )}

      {showNotesModal && selectedDelivery && (
        <NotesModal
          delivery={selectedDelivery}
          onClose={() => setShowNotesModal(false)}
          onSave={handleNotesUpdate}
        />
      )}
    </div>
  );
}