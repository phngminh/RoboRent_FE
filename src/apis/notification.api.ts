import http from '../utils/http'

const API_URL = `${import.meta.env.VITE_API_URL}`

export interface NotificationResponse {
    id: number
    type: number
    typeName: string
    content: string
    rentalId?: number
    relatedEntityId?: number
    isRead: boolean
    createdAt: string
    readAt?: string
}

export interface NotificationsResponse {
    success: boolean
    data: NotificationResponse[]
    page: number
    pageSize: number
    totalCount: number
    hasMore: boolean
}

export interface UnreadCountResponse {
    success: boolean
    unreadCount: number
}

// Get notifications for current user with pagination info
export const getMyNotifications = async (page = 1, pageSize = 20): Promise<{ data: NotificationResponse[], hasMore: boolean, totalCount: number }> => {
    const response = await http.get<NotificationsResponse>(`${API_URL}/Notifications`, {
        params: { page, pageSize }
    })
    return {
        data: response.data.data,
        hasMore: response.data.hasMore,
        totalCount: response.data.totalCount
    }
}

// Get unread notification count
export const getUnreadNotificationCount = async (): Promise<number> => {
    const response = await http.get<UnreadCountResponse>(`${API_URL}/Notifications/unread-count`)
    return response.data.unreadCount
}

// Mark a specific notification as read
export const markNotificationAsRead = async (id: number): Promise<void> => {
    await http.patch(`${API_URL}/Notifications/${id}/read`)
}

// Mark all notifications as read
export const markAllNotificationsAsRead = async (): Promise<void> => {
    await http.patch(`${API_URL}/Notifications/mark-all-read`)
}

// Soft delete a single notification
export const deleteNotification = async (id: number): Promise<void> => {
    await http.delete(`${API_URL}/Notifications/${id}`)
}

// Soft delete all notifications
export const deleteAllNotifications = async (): Promise<void> => {
    await http.delete(`${API_URL}/Notifications/all`)
}

