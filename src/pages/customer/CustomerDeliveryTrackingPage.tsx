// src/pages/customer/delivery/CustomerDeliveryTrackingPage.tsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Truck, Package, CheckCircle2, Clock, MapPin, Phone, User, 
  Calendar, ArrowLeft, Timer, MessageSquare, Building2, 
  RefreshCw
} from 'lucide-react';
import Header from '../../components/header';
import { getDeliveryByRentalId } from '../../apis/delivery.api';
import type { ActualDeliveryResponse, DeliveryStatus } from '../../types/delivery.types';

// === REUSE CONFIG TỪ STAFF (copy nguyên để không phụ thuộc) ===
const STATUS_CONFIG: Record<DeliveryStatus, { 
  color: string; 
  bg: string; 
  border: string;
  gradient: string;
  icon: React.ReactNode;
  label: string;
}> = {
  Pending: { color: 'text-slate-600', bg: 'bg-slate-100', border: 'border-slate-300', gradient: 'from-slate-400 to-slate-500', icon: <Clock className="w-4 h-4" />, label: 'Pending' },
  Assigned: { color: 'text-violet-600', bg: 'bg-violet-100', border: 'border-violet-300', gradient: 'from-violet-400 to-violet-600', icon: <User className="w-4 h-4" />, label: 'Assigned' },
  Delivering: { color: 'text-amber-600', bg: 'bg-amber-100', border: 'border-amber-300', gradient: 'from-amber-400 to-orange-500', icon: <Truck className="w-4 h-4" />, label: 'Delivering' },
  Delivered: { color: 'text-emerald-600', bg: 'bg-emerald-100', border: 'border-emerald-300', gradient: 'from-emerald-400 to-teal-500', icon: <Package className="w-4 h-4" />, label: 'Delivered' },
};

const STATUS_ORDER: DeliveryStatus[] = ['Pending', 'Assigned', 'Delivering', 'Delivered'];

// === REUSE HELPER FUNCTIONS ===
const formatDateTime = (dateStr: string | null): string => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

const formatTime = (timeStr: string): string => {
  const [hours, minutes] = timeStr.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

// === REUSE COMPONENTS (copy từ staff, chỉ cần read-only) ===
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
              {index > 0 && (
                <div className={`absolute left-0 right-1/2 top-5 h-1 -translate-y-1/2 rounded-full transition-all ${isCompleted || isCurrent ? `bg-gradient-to-r ${STATUS_CONFIG[STATUS_ORDER[index - 1]].gradient}` : 'bg-slate-200'}`} style={{ right: '50%', left: '-50%' }} />
              )}
              <div className={`relative z-10 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isCompleted ? `bg-gradient-to-br ${config.gradient} text-white shadow-lg` : isCurrent ? `bg-gradient-to-br ${config.gradient} text-white shadow-xl ring-4 ring-offset-2 ${config.border} scale-110` : 'bg-slate-100 text-slate-400'}`}>
                {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : config.icon}
              </div>
              <span className={`mt-2 text-xs font-semibold ${isCurrent ? config.color : isCompleted ? 'text-slate-600' : 'text-slate-400'}`}>
                {config.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

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
    if (diff < -5) comparison = { text: `${Math.abs(diff)} min early`, color: 'text-emerald-600 bg-emerald-50' };
    else if (diff > 5) comparison = { text: `${diff} min late`, color: 'text-amber-600 bg-amber-50' };
    else comparison = { text: 'On time', color: 'text-emerald-600 bg-emerald-50' };
  }

  return (
    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-600">{icon}</div>
        <h4 className="font-semibold text-slate-700">{label}</h4>
        {comparison && <span className={`ml-auto px-2 py-0.5 rounded-md text-xs font-bold ${comparison.color}`}>{comparison.text}</span>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><p className="text-xs text-slate-500 mb-1">Scheduled</p><p className="font-semibold text-slate-800">{formatDateTime(scheduled)}</p></div>
        <div><p className="text-xs text-slate-500 mb-1">Actual</p><p className={`font-semibold ${actual ? 'text-slate-800' : 'text-slate-400'}`}>{formatDateTime(actual)}</p></div>
      </div>
    </div>
  );
};

export default function CustomerDeliveryTrackingPage() {
  const { rentalId } = useParams<{ rentalId: string }>();
  const [delivery, setDelivery] = useState<ActualDeliveryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchDelivery = async () => {
      if (!rentalId) return;
      try {
        setLoading(true);
        setError(false);
        const data = await getDeliveryByRentalId(Number(rentalId));
        setDelivery(data);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchDelivery();
  }, [rentalId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-rose-50/30">
        <Header />
        <main className="pt-20 flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="w-12 h-12 animate-spin text-violet-600 mx-auto mb-4" />
            <p className="text-lg text-slate-600">Loading delivery status...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !delivery) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-rose-50/30">
        <Header />
        <main className="pt-20 max-w-4xl mx-auto px-6">
          <div className="bg-white rounded-3xl shadow-xl p-12 text-center">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center">
              <Package className="w-12 h-12 text-violet-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3">Delivery Not Available Yet</h3>
            <p className="text-slate-600 max-w-md mx-auto">
              Your rental is still being processed. Delivery tracking will be available once a staff member is assigned.
            </p>
            <Link to="/customer/rental-requests" className="mt-6 inline-flex items-center gap-2 text-violet-600 font-semibold hover:text-violet-700">
              <ArrowLeft className="w-5 h-5" /> Back to Requests
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const config = STATUS_CONFIG[delivery.status];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-rose-50/30">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap'); * { font-family: 'Plus Jakarta Sans', sans-serif; }`}</style>
      <Header />
      <main className="pt-20 max-w-6xl mx-auto px-6 pb-12">
        {/* Back Button */}
        <Link to="/customer/rental-requests" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-6 font-medium">
          <ArrowLeft className="w-5 h-5" /> Back to My Rentals
        </Link>

        {/* Header Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden mb-6">
          <div className={`bg-gradient-to-r ${config.gradient} p-8 text-white`}>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-4 py-1.5 rounded-lg bg-white/20 font-bold flex items-center gap-2">
                    {config.icon} {delivery.status}
                  </span>
                  <span className="px-3 py-1 rounded-lg bg-white/20 text-sm">ID: #{delivery.id}</span>
                </div>
                <h1 className="text-4xl font-extrabold mb-2">{delivery.rentalInfo.eventName}</h1>
                <div className="flex items-center gap-2 text-white/80">
                  <MapPin className="w-5 h-5" />
                  <span>{delivery.scheduleInfo.eventLocation}, {delivery.scheduleInfo.eventCity}</span>
                </div>
              </div>
            </div>
            <div className="bg-white/10 rounded-2xl p-6 mt-6 backdrop-blur-xl">
              <StatusStepper currentStatus={delivery.status} />
            </div>
          </div>

          {/* Event Info Grid */}
          <div className="p-6">
            <div className="grid grid-cols-3 gap-6">
              <div className="p-5 rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200 text-center">
                <Calendar className="w-10 h-10 text-violet-600 mx-auto mb-2" />
                <p className="text-sm text-violet-700 font-semibold">Event Date</p>
                <p className="text-2xl font-bold text-slate-800">{formatDate(delivery.scheduleInfo.eventDate)}</p>
              </div>
              <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 text-center">
                <Clock className="w-10 h-10 text-amber-600 mx-auto mb-2" />
                <p className="text-sm text-amber-700 font-semibold">Event Hours</p>
                <p className="text-2xl font-bold text-slate-800">
                  {formatTime(delivery.scheduleInfo.startTime)} - {formatTime(delivery.scheduleInfo.endTime)}
                </p>
              </div>
              <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 text-center">
                <Truck className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                <p className="text-sm text-emerald-700 font-semibold">Delivery Window</p>
                <p className="text-2xl font-bold text-slate-800">
                  {formatTime(delivery.scheduleInfo.deliveryTime)} - {formatTime(delivery.scheduleInfo.finishTime)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Time Tracking + Customer Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-5 flex items-center gap-3">
              <Timer className="w-6 h-6 text-violet-600" /> Delivery Time Tracking
            </h3>
            <div className="space-y-4">
              <TimeComparison label="Delivery Time" scheduled={delivery.scheduledDeliveryTime} actual={delivery.actualDeliveryTime} icon={<Truck className="w-5 h-5" />} />
              <TimeComparison label="Pickup Time" scheduled={delivery.scheduledPickupTime} actual={delivery.actualPickupTime} icon={<Package className="w-5 h-5" />} />
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-5 flex items-center gap-3">
              <User className="w-6 h-6 text-violet-600" /> Your Information
            </h3>
            <div className="space-y-5">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  {delivery.rentalInfo.customerName.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-lg">{delivery.rentalInfo.customerName}</p>
                  <p className="text-slate-500">Event Organizer</p>
                </div>
              </div>
              <a href={`tel:${delivery.rentalInfo.phoneNumber}`} className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 hover:shadow-lg transition-shadow group">
                <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-emerald-600 font-semibold">PHONE NUMBER</p>
                  <p className="font-bold text-slate-800">{delivery.rentalInfo.phoneNumber}</p>
                </div>
              </a>
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200">
                <div className="w-12 h-12 rounded-xl bg-violet-500 text-white flex items-center justify-center">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-violet-600 font-semibold">RENTAL ID</p>
                  <p className="font-bold text-slate-800">#{delivery.rentalInfo.rentalId}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notes nếu có */}
        {delivery.notes && (
          <div className="mt-6 bg-white rounded-3xl shadow-xl border border-slate-200 p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-3">
              <MessageSquare className="w-6 h-6 text-violet-600" /> Delivery Notes from Staff
            </h3>
            <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200">
              <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{delivery.notes}</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}