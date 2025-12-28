// Notification types matching BE NotificationType enum
// See: RoboRent_BE.Model.Enums.NotificationType

export enum NotificationType {
    // Phase 1: Request
    NewRequest = 0,
    RequestReceived = 1,
    RequestUpdate = 2,
    RequestCancelled = 3,

    // Phase 2: Quote
    QuotePendingApproval = 4,
    QuoteApproved = 5,
    QuoteRejected = 6,
    QuoteAccepted = 7,
    QuoteRejectedByCustomer = 8,

    // Phase 3: Schedule
    ScheduleCreated = 9,
    ScheduleUpdated = 10,
    ScheduleCancelled = 11,

    // Phase 4: Demo
    DemoCreated = 12,
    DemoAccepted = 13,
    DemoRejected = 14,

    // Phase 5: Contract
    ContractPendingApproval = 15,
    ContractManagerSigned = 16,
    ContractManagerRejected = 17,
    ContractCustomerSigned = 18,
    ContractChangeRequested = 19,

    // Phase 6: Delivery
    DeliveryCreated = 20,
    DeliveryAssigned = 21,
    DeliveryStatusUpdate = 22,

    // Phase 7: Contract Report
    ReportCreated = 23,
    ReportResolved = 24,
    ReportRejected = 25,

    // Phase 8: Payment
    PaymentLinkCreated = 26,
    PaymentSuccess = 27,
    PaymentFailed = 28,

    // General
    SystemNotification = 29
}

// Notification response from API
export interface NotificationResponse {
    id: number
    type: NotificationType
    typeName: string
    content: string
    rentalId?: number
    relatedEntityId?: number
    isRead: boolean
    createdAt: string
    readAt?: string
}

// SignalR NewNotification event payload
export interface NewNotificationEvent {
    Id: number
    Type: NotificationType
    TypeName: string
    Content: string
    RentalId?: number
    RelatedEntityId?: number
    CreatedAt: string
}

// Notification config for UI display
export interface NotificationConfig {
    icon: string      // Lucide icon name
    bgColor: string   // Tailwind bg class
    label: string     // Display label
}

// Get notification config by type
export const getNotificationConfig = (type: NotificationType): NotificationConfig => {
    switch (type) {
        // Request
        case NotificationType.NewRequest:
            return { icon: 'inbox', bgColor: 'bg-blue-500', label: 'Yêu cầu mới' }
        case NotificationType.RequestReceived:
            return { icon: 'check-circle', bgColor: 'bg-green-500', label: 'Đã tiếp nhận' }
        case NotificationType.RequestUpdate:
            return { icon: 'edit', bgColor: 'bg-amber-500', label: 'Cập nhật' }
        case NotificationType.RequestCancelled:
            return { icon: 'x-circle', bgColor: 'bg-red-500', label: 'Đã hủy' }

        // Quote
        case NotificationType.QuotePendingApproval:
            return { icon: 'clock', bgColor: 'bg-amber-500', label: 'Chờ duyệt' }
        case NotificationType.QuoteApproved:
            return { icon: 'check', bgColor: 'bg-green-500', label: 'Báo giá' }
        case NotificationType.QuoteRejected:
            return { icon: 'x', bgColor: 'bg-red-500', label: 'Báo giá' }
        case NotificationType.QuoteAccepted:
            return { icon: 'thumbs-up', bgColor: 'bg-green-500', label: 'Báo giá' }
        case NotificationType.QuoteRejectedByCustomer:
            return { icon: 'thumbs-down', bgColor: 'bg-red-500', label: 'Báo giá' }

        // Schedule
        case NotificationType.ScheduleCreated:
            return { icon: 'calendar-plus', bgColor: 'bg-indigo-500', label: 'Lịch trình' }
        case NotificationType.ScheduleUpdated:
            return { icon: 'calendar-check', bgColor: 'bg-indigo-500', label: 'Lịch trình' }
        case NotificationType.ScheduleCancelled:
            return { icon: 'calendar-x', bgColor: 'bg-red-500', label: 'Lịch trình' }

        // Demo
        case NotificationType.DemoCreated:
            return { icon: 'video', bgColor: 'bg-rose-500', label: 'Demo' }
        case NotificationType.DemoAccepted:
            return { icon: 'video', bgColor: 'bg-green-500', label: 'Demo' }
        case NotificationType.DemoRejected:
            return { icon: 'video-off', bgColor: 'bg-red-500', label: 'Demo' }

        // Contract
        case NotificationType.ContractPendingApproval:
            return { icon: 'file-text', bgColor: 'bg-amber-500', label: 'Hợp đồng' }
        case NotificationType.ContractManagerSigned:
            return { icon: 'file-check', bgColor: 'bg-blue-500', label: 'Hợp đồng' }
        case NotificationType.ContractManagerRejected:
            return { icon: 'file-x', bgColor: 'bg-red-500', label: 'Hợp đồng' }
        case NotificationType.ContractCustomerSigned:
            return { icon: 'file-signature', bgColor: 'bg-green-500', label: 'Hợp đồng' }
        case NotificationType.ContractChangeRequested:
            return { icon: 'file-edit', bgColor: 'bg-amber-500', label: 'Hợp đồng' }

        // Delivery
        case NotificationType.DeliveryCreated:
            return { icon: 'truck', bgColor: 'bg-cyan-500', label: 'Giao hàng' }
        case NotificationType.DeliveryAssigned:
            return { icon: 'truck', bgColor: 'bg-cyan-500', label: 'Phân công' }
        case NotificationType.DeliveryStatusUpdate:
            return { icon: 'package', bgColor: 'bg-cyan-500', label: 'Giao hàng' }

        // Report
        case NotificationType.ReportCreated:
            return { icon: 'alert-triangle', bgColor: 'bg-orange-500', label: 'Báo cáo' }
        case NotificationType.ReportResolved:
            return { icon: 'check-circle', bgColor: 'bg-green-500', label: 'Báo cáo' }
        case NotificationType.ReportRejected:
            return { icon: 'x-circle', bgColor: 'bg-red-500', label: 'Báo cáo' }

        // Payment
        case NotificationType.PaymentLinkCreated:
            return { icon: 'credit-card', bgColor: 'bg-emerald-500', label: 'Thanh toán' }
        case NotificationType.PaymentSuccess:
            return { icon: 'badge-check', bgColor: 'bg-green-500', label: 'Thanh toán' }
        case NotificationType.PaymentFailed:
            return { icon: 'alert-circle', bgColor: 'bg-red-500', label: 'Thanh toán' }

        // System
        case NotificationType.SystemNotification:
        default:
            return { icon: 'bell', bgColor: 'bg-slate-500', label: 'Hệ thống' }
    }
}

// Get navigation URL based on notification type
export const getNotificationNavUrl = (
    notification: NotificationResponse,
    role: string
): string => {
    const baseUrl = `/${role.toLowerCase()}`

    switch (notification.type) {
        // NewRequest: Staff goes to rental-requests page to receive first
        case NotificationType.NewRequest:
            return `${baseUrl}/rental-requests`

        // Other Request types → Chat (already has chat room)
        case NotificationType.RequestReceived:
        case NotificationType.RequestUpdate:
        case NotificationType.RequestCancelled:
            return `${baseUrl}/chat/${notification.rentalId}`

        // QuotePendingApproval → Manager goes to /quotes page
        case NotificationType.QuotePendingApproval:
            return `${baseUrl}/quotes`

        // Other Quote notifications → Chat
        case NotificationType.QuoteApproved:
        case NotificationType.QuoteRejected:
        case NotificationType.QuoteAccepted:
        case NotificationType.QuoteRejectedByCustomer:
            return `${baseUrl}/chat/${notification.rentalId}`

        // Schedule → Chat (schedule view in chat)
        case NotificationType.ScheduleCreated:
        case NotificationType.ScheduleUpdated:
        case NotificationType.ScheduleCancelled:
            return `${baseUrl}/chat/${notification.rentalId}`

        // Demo → Chat
        case NotificationType.DemoCreated:
        case NotificationType.DemoAccepted:
        case NotificationType.DemoRejected:
            return `${baseUrl}/chat/${notification.rentalId}`

        // Contract → Chat (contract view in chat)
        case NotificationType.ContractPendingApproval:
        case NotificationType.ContractManagerSigned:
        case NotificationType.ContractManagerRejected:
        case NotificationType.ContractCustomerSigned:
        case NotificationType.ContractChangeRequested:
            return `${baseUrl}/chat/${notification.rentalId}`

        // Delivery → Delivery calendar or detail
        case NotificationType.DeliveryCreated:
        case NotificationType.DeliveryAssigned:
        case NotificationType.DeliveryStatusUpdate:
            return `${baseUrl}/deliveries`

        // Report → Reports page
        case NotificationType.ReportCreated:
        case NotificationType.ReportResolved:
        case NotificationType.ReportRejected:
            return `${baseUrl}/reports`

        // Payment → Payment history
        case NotificationType.PaymentLinkCreated:
        case NotificationType.PaymentSuccess:
        case NotificationType.PaymentFailed:
            return notification.rentalId ? `${baseUrl}/chat/${notification.rentalId}` : `${baseUrl}/payments`

        // Default → Rental detail or home
        default:
            return notification.rentalId ? `${baseUrl}/chat/${notification.rentalId}` : baseUrl
    }
}
