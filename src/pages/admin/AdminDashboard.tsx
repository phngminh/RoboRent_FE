import React, { useState, useEffect } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import {
    TrendingUp, AlertCircle, DollarSign, Package, Bot,
    Calendar, Clock, CheckCircle, XCircle, Loader, Zap, ArrowUp, ArrowDown
} from 'lucide-react';
import { getOverview, getRobots, getRentals } from '../../apis/dashboard.api';
import type {
    DashboardOverviewResponse,
    DashboardRobotsResponse,
    DashboardRentalsResponse
} from '../../apis/dashboard.api';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const formatCurrency = (value: number): string => {
    if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toLocaleString('vi-VN');
};

const formatFullCurrency = (value: number): string => {
    return value.toLocaleString('vi-VN') + '₫';
};

const COLORS = {
    primary: '#6366f1',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6',
    purple: '#8b5cf6',
};

const CHART_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

// ============================================================================
// COMPONENTS
// ============================================================================

const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: { value: number; isPositive: boolean };
    gradient: string;
}> = ({ title, value, icon, trend, gradient }) => (
    <div className="group relative overflow-hidden rounded-2xl bg-white border border-slate-200 p-6 transition-all duration-300 hover:shadow-xl hover:border-slate-300">
        <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
                <div className="text-white">{icon}</div>
            </div>
            {trend && (
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${trend.isPositive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                    {trend.isPositive ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                    <span>{Math.abs(trend.value)}%</span>
                </div>
            )}
        </div>

        <h3 className="text-sm font-medium text-slate-600 mb-2">{title}</h3>
        <p className="text-3xl font-bold text-slate-800 tracking-tight">{value}</p>
    </div>
);

const AlertBadge: React.FC<{
    title: string;
    count: number;
    color: string;
    icon: React.ReactNode;
}> = ({ title, count, color, icon }) => (
    <div className={`flex items-center gap-4 p-4 rounded-xl bg-white border border-slate-200 border-l-4 transition-all duration-200 hover:shadow-lg hover:translate-x-1`}
        style={{ borderLeftColor: color }}>
        <div className="flex-shrink-0" style={{ color }}>
            {icon}
        </div>
        <div className="flex-1">
            <p className="text-sm text-slate-600">{title}</p>
            <p className="text-2xl font-bold text-slate-800">{count}</p>
        </div>
    </div>
);

const GlassCard: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({
    title,
    children,
    className = ''
}) => (
    <div className={`bg-white rounded-2xl border border-slate-200 p-6 transition-all duration-300 hover:shadow-xl ${className}`}>
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">{title}</h2>
        <div>{children}</div>
    </div>
);

const LoadingState: React.FC = () => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader className="w-12 h-12 text-violet-500 animate-spin" />
        <p className="text-slate-600">Đang tải dữ liệu...</p>
    </div>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const AdminDashboard: React.FC = () => {
    const [overviewData, setOverviewData] = useState<DashboardOverviewResponse | null>(null);
    const [robotsData, setRobotsData] = useState<DashboardRobotsResponse | null>(null);
    const [rentalsData, setRentalsData] = useState<DashboardRentalsResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const [overview, robots, rentals] = await Promise.all([
                    getOverview(),
                    getRobots(),
                    getRentals({ pageSize: 10 })
                ]);
                setOverviewData(overview);
                setRobotsData(robots);
                setRentalsData(rentals);
            } catch (error) {
                console.error('Failed to load dashboard:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    if (loading || !overviewData || !robotsData || !rentalsData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-rose-50/30 p-6">
                <LoadingState />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-rose-50/30 p-6">

            <div className="relative z-10 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-slate-800 mb-2 flex items-center gap-3">
                            <Zap className="w-10 h-10 text-violet-500" />
                            Admin Dashboard
                        </h1>
                        <p className="text-slate-600">Tổng quan hoạt động kinh doanh RoboRent</p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-sm">
                        <Clock size={16} className="text-slate-500" />
                        <span className="text-sm text-slate-700 font-medium">
                            {new Date().toLocaleDateString('vi-VN', {
                                weekday: 'short',
                                day: 'numeric',
                                month: 'short'
                            })}
                        </span>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title="Doanh thu tháng này"
                        value={formatCurrency(overviewData.kpis.revenueThisMonth) + '₫'}
                        icon={<DollarSign size={24} />}
                        trend={{ value: overviewData.kpis.revenueTrend, isPositive: overviewData.kpis.revenueTrend >= 0 }}
                        gradient="from-green-400 to-emerald-600"
                    />
                    <StatCard
                        title="Đơn thuê đang hoạt động"
                        value={overviewData.kpis.activeOrders}
                        icon={<Package size={24} />}
                        gradient="from-blue-400 to-indigo-600"
                    />
                    <StatCard
                        title="Robots đang thuê"
                        value={`${robotsData.overview.renting}/${robotsData.overview.total}`}
                        icon={<Bot size={24} />}
                        gradient="from-purple-400 to-violet-600"
                    />
                    <StatCard
                        title="Tỷ lệ sử dụng Robot"
                        value={`${robotsData.overview.utilization}%`}
                        icon={<TrendingUp size={24} />}
                        gradient="from-orange-400 to-amber-600"
                    />
                </div>

                {/* Alerts Section */}
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <AlertCircle size={20} />
                        Cần xử lý
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <AlertBadge
                            title="Báo giá chờ duyệt"
                            count={overviewData.alerts.pendingQuotes}
                            color={COLORS.info}
                            icon={<Package size={20} />}
                        />
                        <AlertBadge
                            title="Hợp đồng chờ ký"
                            count={overviewData.alerts.pendingContracts}
                            color={COLORS.warning}
                            icon={<Calendar size={20} />}
                        />
                        <AlertBadge
                            title="Báo cáo sự cố"
                            count={overviewData.alerts.pendingReports}
                            color={COLORS.danger}
                            icon={<AlertCircle size={20} />}
                        />
                        <AlertBadge
                            title="Đơn chưa thanh toán"
                            count={rentalsData.alerts.unpaidOrders}
                            color={COLORS.danger}
                            icon={<XCircle size={20} />}
                        />
                    </div>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <GlassCard title="📈 Xu hướng doanh thu 6 tháng">
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={overviewData.revenueChart}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                                <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
                                <Tooltip
                                    formatter={(value) => [formatFullCurrency(Number(value)), 'Doanh thu']}
                                    contentStyle={{
                                        background: 'rgba(255,255,255,0.95)',
                                        border: 'none',
                                        borderRadius: '12px',
                                        boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke={COLORS.primary}
                                    strokeWidth={3}
                                    fill="url(#colorRevenue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </GlassCard>

                    <GlassCard title="🤖 Trạng thái Robot theo loại">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={robotsData.byType} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                                <XAxis type="number" stroke="#64748b" fontSize={12} />
                                <YAxis dataKey="typeName" type="category" stroke="#64748b" fontSize={12} width={100} />
                                <Tooltip
                                    contentStyle={{
                                        background: 'rgba(255,255,255,0.95)',
                                        border: 'none',
                                        borderRadius: '12px',
                                        boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                                    }}
                                />
                                <Legend />
                                <Bar dataKey="available" name="Sẵn sàng" fill={COLORS.success} radius={[0, 4, 4, 0]} />
                                <Bar dataKey="renting" name="Đang thuê" fill={COLORS.info} radius={[0, 4, 4, 0]} />
                                <Bar dataKey="maintenance" name="Bảo trì" fill={COLORS.warning} radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </GlassCard>
                </div>

                {/* Second Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <GlassCard title="📊 Phân bổ doanh thu theo gói">
                        <ResponsiveContainer width="100%" height={280}>
                            <PieChart>
                                <Pie
                                    data={overviewData.packageDistribution as unknown as Record<string, unknown>[]}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={3}
                                    dataKey="revenue"
                                    nameKey="package"
                                >
                                    {overviewData.packageDistribution.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value) => [formatFullCurrency(Number(value)), 'Doanh thu']}
                                    contentStyle={{
                                        background: 'rgba(255,255,255,0.95)',
                                        border: 'none',
                                        borderRadius: '12px',
                                        boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                                    }}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </GlassCard>

                    <GlassCard title="📅 Đơn thuê sắp tới">
                        <div className="space-y-3 max-h-[280px] overflow-y-auto pr-2">
                            {rentalsData.rentals.slice(0, 5).map((rental) => (
                                <div key={rental.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 hover:bg-slate-100 hover:shadow-md transition-all duration-200">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                            <p className="font-semibold text-slate-800 text-sm">{rental.customerName}</p>
                                            <p className="text-xs text-slate-500">{rental.eventName || 'Chưa có tên sự kiện'}</p>
                                        </div>
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${rental.status === 'Active' || rental.status === 'Confirmed'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {rental.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                        <Calendar size={12} />
                                        <span>{rental.eventDate ? new Date(rental.eventDate).toLocaleDateString('vi-VN') : 'N/A'}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </GlassCard>
                </div>

                {/* Payment Stats */}
                <GlassCard title="💰 Tình trạng thanh toán">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 border-l-4 border-green-500">
                            <CheckCircle size={32} className="text-green-500 flex-shrink-0" />
                            <div>
                                <p className="text-sm text-slate-600">Đã thanh toán</p>
                                <p className="text-2xl font-bold text-slate-800">{rentalsData.paymentStats.paid.count}</p>
                                <p className="text-xs text-slate-500">{formatCurrency(rentalsData.paymentStats.paid.amount)}₫</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 border-l-4 border-yellow-500">
                            <Clock size={32} className="text-yellow-500 flex-shrink-0" />
                            <div>
                                <p className="text-sm text-slate-600">Thanh toán một phần</p>
                                <p className="text-2xl font-bold text-slate-800">{rentalsData.paymentStats.partial.count}</p>
                                <p className="text-xs text-slate-500">{formatCurrency(rentalsData.paymentStats.partial.amount)}₫</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 border-l-4 border-red-500">
                            <XCircle size={32} className="text-red-500 flex-shrink-0" />
                            <div>
                                <p className="text-sm text-slate-600">Chưa thanh toán</p>
                                <p className="text-2xl font-bold text-slate-800">{rentalsData.paymentStats.unpaid.count}</p>
                                <p className="text-xs text-slate-500">{formatCurrency(rentalsData.paymentStats.unpaid.amount)}₫</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 border-l-4 border-blue-500">
                            <TrendingUp size={32} className="text-blue-500 flex-shrink-0" />
                            <div>
                                <p className="text-sm text-slate-600">Tỷ lệ thu hồi</p>
                                <p className="text-4xl font-bold text-slate-800">{rentalsData.paymentStats.collectionRate}%</p>
                            </div>
                        </div>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
};

export default AdminDashboard;
