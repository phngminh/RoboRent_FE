import React, { useEffect, useState } from 'react';
import { 
  Search, 
  Filter, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  AlertCircle, 
  ExternalLink,
  Calendar,
  Wallet,
  ArrowUpRight
} from 'lucide-react';
import { toast } from 'react-toastify';
import { paymentApi } from '../../apis/payment.api';
import type { PaymentRecordResponse } from '../../types/payment.types';

// Component hiển thị Status Badge chuyên nghiệp
const StatusBadge = ({ status, expired }: { status: string, expired: boolean }) => {
  if (status === 'Pending' && expired) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500 border border-gray-200">
        <XCircle className="w-3.5 h-3.5" />
        Expired
      </span>
    );
  }

  const configs: Record<string, any> = {
    Paid: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: CheckCircle2 },
    Pending: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: Clock },
    Cancelled: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', icon: XCircle },
    Failed: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', icon: AlertCircle },
  };

  const config = configs[status] || configs.Pending;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
      <Icon className="w-3.5 h-3.5" />
      {status}
    </span>
  );
};

export default function TransactionsContent() {
  const [transactions, setTransactions] = useState<PaymentRecordResponse[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Load Data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const res = await paymentApi.getMyTransactions();
        if (res.success) {
          // Sort client-side: Mới nhất lên đầu
          const sorted = res.data.sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setTransactions(sorted);
        }
      } catch (error) {
        console.error(error);
        toast.error('Unable to load transaction history');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Format Helpers
  const formatMoney = (amount: number) => 
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  const formatDate = (dateStr: string) => 
    new Date(dateStr).toLocaleDateString('vi-VN', { 
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit' 
    });

  const checkExpired = (dateStr: string | null) => 
    dateStr ? new Date(dateStr) < new Date() : false;

  // Filter Logic
  const filteredData = transactions.filter(item => {
    const matchSearch = 
      (item.rentalName?.toLowerCase() || '').includes(search.toLowerCase()) ||
      item.orderCode.toString().includes(search);
    const matchType = typeFilter === 'All' || item.paymentType === typeFilter;
    const matchStatus = statusFilter === 'All' || item.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  // Action Handler
  const handlePay = (url: string | null) => {
    if (!url) return toast.error('Payment link is invalid');
    window.location.href = url;
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 space-y-8">
      
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Payment History</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your rental payments and track financial records.</p>
        </div>
        
        {/* Quick Stats (Optional but Professional) */}
        <div className="flex gap-4">
          <div className="bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase">Total Spent</p>
              <p className="text-sm font-bold text-gray-900">
                {formatMoney(transactions.filter(t => t.status === 'Paid').reduce((sum, t) => sum + t.amount, 0))}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by event name or reference ID..." 
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <select 
            className="px-4 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium text-gray-700 focus:outline-none focus:border-blue-500 cursor-pointer"
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
          >
            <option value="All">All Types</option>
            <option value="Deposit">Deposit (30%)</option>
            <option value="Full">Full Payment (70%)</option>
          </select>

          <select 
            className="px-4 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium text-gray-700 focus:outline-none focus:border-blue-500 cursor-pointer"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Paid">Paid</option>
          </select>
        </div>
      </div>

      {/* 3. Main Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading transactions...</div>
        ) : filteredData.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Search className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-gray-900 font-medium">No transactions found</h3>
            <p className="text-gray-500 text-sm mt-1">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Transaction Info</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="text-center py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredData.map((item) => {
                  const isExpiredLink = checkExpired(item.expiredAt);
                  
                  return (
                    <tr key={item.id} className="group hover:bg-blue-50/30 transition-colors">
                      {/* Cột 1: Thông tin chính (Event & Ref ID) */}
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-900 line-clamp-1" title={item.rentalName || ''}>
                            {item.rentalName || 'Unknown Event'}
                          </span>
                          <span className="text-xs text-gray-400 mt-1 font-mono">
                            Ref: #{item.orderCode}
                          </span>
                        </div>
                      </td>

                      {/* Cột 2: Loại thanh toán */}
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${
                          item.paymentType === 'Deposit' 
                            ? 'bg-purple-100 text-purple-700' 
                            : 'bg-indigo-100 text-indigo-700'
                        }`}>
                          {item.paymentType}
                        </span>
                      </td>

                      {/* Cột 3: Thời gian */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {formatDate(item.createdAt)}
                        </div>
                      </td>

                      {/* Cột 4: Số tiền (Căn phải) */}
                      <td className="py-4 px-6 text-right">
                        <span className="font-bold text-gray-900 tabular-nums">
                          {formatMoney(item.amount)}
                        </span>
                      </td>

                      {/* Cột 5: Status Badge (Căn giữa) */}
                      <td className="py-4 px-6 text-center">
                        <StatusBadge status={item.status} expired={isExpiredLink} />
                      </td>

                      {/* Cột 6: Action (Căn phải) */}
                      <td className="py-4 px-6 text-right">
                        {item.status === 'Pending' && !isExpiredLink ? (
                          <button
                            onClick={() => handlePay(item.checkoutUrl)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm shadow-blue-200 transition-all hover:translate-y-[-1px]"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            Pay Now
                          </button>
                        ) : item.status === 'Paid' ? (
                          <button 
                            disabled 
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-gray-400 bg-gray-100 rounded-lg text-xs font-medium cursor-default"
                          >
                            Receipt
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400 italic">No action</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination placeholder (Professional Footer) */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center text-xs text-gray-500">
          <span>Showing {filteredData.length} transaction(s)</span>
          {/* Implement pagination logic later if needed */}
        </div>
      </div>
    </div>
  );
}