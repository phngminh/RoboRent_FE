import http from '../utils/http'

const API_URL = '/manager/dashboard'

// ============ TYPES ============

// Tab 1: Overview
export interface OverviewKpis {
    revenueThisMonth: number
    revenueTrend: number
    activeOrders: number
    robotUtilization: number
    repeatRate: number
}

export interface OverviewAlerts {
    pendingQuotes: number
    pendingContracts: number
    pendingReports: number
}

export interface RevenueChartItem {
    month: string
    revenue: number
    aov: number
}

export interface PeakTimeItem {
    dayOfWeek: string
    revenue: number
    orderCount: number
}

export interface PackageDistributionItem {
    package: string
    revenue: number
    percentage: number
}

export interface RobotTypeRevenueItem {
    robotType: string
    revenue: number
    percentage: number
}

export interface SystemNotificationItem {
    id: number
    time: string
    type: string
    message: string
    rentalId?: number
}

export interface DashboardOverviewResponse {
    kpis: OverviewKpis
    alerts: OverviewAlerts
    revenueChart: RevenueChartItem[]
    peakTimeAnalysis: PeakTimeItem[]
    packageDistribution: PackageDistributionItem[]
    robotTypeRevenue: RobotTypeRevenueItem[]
    notifications: SystemNotificationItem[]
}

// Tab 2: Robots
export interface RobotFleetOverview {
    total: number
    available: number
    renting: number
    maintenance: number
    utilization: number
}

export interface RobotByTypeItem {
    typeId: number
    typeName: string
    total: number
    available: number
    renting: number
    maintenance: number
    utilization: number
}

export interface RobotListItem {
    id: number
    robotName: string
    modelName: string
    typeName: string
    status: string
    location?: string
}

export interface DashboardRobotsResponse {
    overview: RobotFleetOverview
    byType: RobotByTypeItem[]
    robots: RobotListItem[]
}

// Tab 3: Rentals
export interface RentalAlerts {
    pendingApprovals: number
    unpaidOrders: number
    unpaidAmount: number
}

export interface RentalStatistics {
    active: number
    confirmed: number
    pending: number
    completed: number
}

export interface PaymentStatItem {
    count: number
    amount: number
}

export interface PaymentStats {
    paid: PaymentStatItem
    partial: PaymentStatItem
    unpaid: PaymentStatItem
    collectionRate: number
}

export interface RentalListItem {
    id: number
    rentalCode: string
    customerName: string
    eventName?: string
    eventDate?: string
    startTime?: string
    endTime?: string
    package: string
    totalValue: number
    status: string
    paymentStatus: string
}

export interface DashboardRentalsResponse {
    alerts: RentalAlerts
    statistics: RentalStatistics
    paymentStats: PaymentStats
    rentals: RentalListItem[]
    totalCount: number
}

// Tab 4: Customers
export interface CustomerOverview {
    totalCustomers: number
    repeatRate: number
    avgLTV: number
}

export interface TopCustomerItem {
    accountId: number
    fullName: string
    email?: string
    totalSpent: number
    orderCount: number
    favoritePackage: string
}

export interface CustomerSegmentation {
    vip: number
    regular: number
    occasional: number
    oneTime: number
}

export interface DashboardCustomersResponse {
    overview: CustomerOverview
    topCustomers: TopCustomerItem[]
    segmentation: CustomerSegmentation
}

// ============ API CALLS ============

export const getOverview = async (): Promise<DashboardOverviewResponse> => {
    const response = await http.get<DashboardOverviewResponse>(`${API_URL}/overview`)
    return response.data
}

export const getRobots = async (
    status?: string,
    typeId?: number
): Promise<DashboardRobotsResponse> => {
    const params = new URLSearchParams()
    if (status) params.append('status', status)
    if (typeId) params.append('typeId', typeId.toString())

    const response = await http.get<DashboardRobotsResponse>(
        `${API_URL}/robots${params.toString() ? '?' + params.toString() : ''}`
    )
    return response.data
}

export const getRentals = async (options?: {
    status?: string
    package?: string
    fromDate?: string
    toDate?: string
    page?: number
    pageSize?: number
}): Promise<DashboardRentalsResponse> => {
    const params = new URLSearchParams()
    if (options?.status) params.append('status', options.status)
    if (options?.package) params.append('package', options.package)
    if (options?.fromDate) params.append('fromDate', options.fromDate)
    if (options?.toDate) params.append('toDate', options.toDate)
    if (options?.page) params.append('page', options.page.toString())
    if (options?.pageSize) params.append('pageSize', options.pageSize.toString())

    const response = await http.get<DashboardRentalsResponse>(
        `${API_URL}/rentals${params.toString() ? '?' + params.toString() : ''}`
    )
    return response.data
}

export const getCustomers = async (topCount = 10): Promise<DashboardCustomersResponse> => {
    const response = await http.get<DashboardCustomersResponse>(
        `${API_URL}/customers?topCount=${topCount}`
    )
    return response.data
}
