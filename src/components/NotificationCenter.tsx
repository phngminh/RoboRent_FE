import { useState, useEffect, useRef } from 'react'
import {
    Bell, X, Inbox, Trash2, Loader2,
    CheckCircle, XCircle, Edit, Clock, ThumbsUp, ThumbsDown,
    CalendarPlus, CalendarCheck, CalendarX, Video, VideoOff, FileText, FileCheck,
    FileX, Truck, Package, AlertTriangle, CreditCard, BadgeCheck, AlertCircle
} from 'lucide-react'
import {
    getMyNotifications,
    getUnreadNotificationCount,
    markAllNotificationsAsRead,
    markNotificationAsRead,
    deleteNotification,
    deleteAllNotifications,
    type NotificationResponse as ApiNotificationResponse
} from '../apis/notification.api'
import { signalRService } from '../utils/signalr'
import { toast } from 'react-toastify'
import { useAuth } from '../contexts/AuthContext'
import {
    NotificationType,
    getNotificationConfig,
    getNotificationNavUrl
} from '../types/notification.types'
import type { NotificationResponse, NewNotificationEvent } from '../types/notification.types'

interface NotificationCenterProps {
    textColor?: string
}

export default function NotificationCenter({ textColor = 'text-gray-700' }: NotificationCenterProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [notifications, setNotifications] = useState<NotificationResponse[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [loading, setLoading] = useState(false)
    const [loadingMore, setLoadingMore] = useState(false)
    const [hasMore, setHasMore] = useState(false)
    const [page, setPage] = useState(1)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const { user } = useAuth()

    // Load notifications when dropdown opens
    useEffect(() => {
        if (isOpen) {
            loadNotifications()
        }
    }, [isOpen])

    // Listen for new notifications via SignalR
    useEffect(() => {
        const handleNewNotification = (data: NewNotificationEvent) => {
            const newNotification: NotificationResponse = {
                id: data.Id,
                type: data.Type,
                typeName: data.TypeName,
                content: data.Content,
                rentalId: data.RentalId,
                relatedEntityId: data.RelatedEntityId,
                isRead: false,
                createdAt: data.CreatedAt
            }

            setNotifications(prev => [newNotification, ...prev])
            setUnreadCount(prev => prev + 1)
            toast.info(`🔔 ${data.Content}`, { autoClose: 5000 })
        }

        signalRService.onNewNotification(handleNewNotification)

        return () => {
            signalRService.offNewNotification()
        }
    }, [user?.id])

    // Load initial unread count
    useEffect(() => {
        loadUnreadCount()
    }, [])

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isOpen])

    const loadUnreadCount = async () => {
        try {
            const count = await getUnreadNotificationCount()
            setUnreadCount(count)
        } catch (error) {
            console.error('Failed to load unread count:', error)
        }
    }

    const loadNotifications = async () => {
        setLoading(true)
        setPage(1)
        try {
            const result = await getMyNotifications(1, 20)
            setNotifications(result.data)
            setHasMore(result.hasMore)
        } catch (error) {
            console.error('Failed to load notifications:', error)
            toast.error('Failed to load notifications')
        } finally {
            setLoading(false)
        }
    }

    const handleLoadMore = async () => {
        if (loadingMore || !hasMore) return
        setLoadingMore(true)
        try {
            const nextPage = page + 1
            const result = await getMyNotifications(nextPage, 20)
            setNotifications(prev => [...prev, ...result.data])
            setHasMore(result.hasMore)
            setPage(nextPage)
        } catch (error) {
            console.error('Failed to load more notifications:', error)
        } finally {
            setLoadingMore(false)
        }
    }

    const markAllAsRead = async () => {
        try {
            await markAllNotificationsAsRead()
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
        } catch (error) {
            console.error('Failed to mark as read:', error)
        }
    }

    const handleDelete = async (e: React.MouseEvent, id: number) => {
        e.stopPropagation()
        try {
            await deleteNotification(id)
            setNotifications(prev => prev.filter(n => n.id !== id))
        } catch (error) {
            console.error('Failed to delete notification:', error)
        }
    }

    const handleDeleteAll = async () => {
        try {
            await deleteAllNotifications()
            setNotifications([])
            setHasMore(false)
        } catch (error) {
            console.error('Failed to delete all notifications:', error)
        }
    }

    const handleNotificationClick = async (notification: NotificationResponse) => {
        if (!notification.isRead) {
            try {
                await markNotificationAsRead(notification.id)
                setNotifications(prev =>
                    prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
                )
            } catch (error) {
                console.error('Failed to mark notification as read:', error)
            }
        }

        const role = user?.role || 'customer'
        const url = getNotificationNavUrl(notification, role)
        window.location.href = url
    }

    const getIconComponent = (type: number) => {
        const config = getNotificationConfig(type as NotificationType)
        const iconMap: Record<string, React.ReactNode> = {
            'inbox': <Inbox className="w-4 h-4" />,
            'check-circle': <CheckCircle className="w-4 h-4" />,
            'x-circle': <XCircle className="w-4 h-4" />,
            'edit': <Edit className="w-4 h-4" />,
            'clock': <Clock className="w-4 h-4" />,
            'check': <CheckCircle className="w-4 h-4" />,
            'x': <XCircle className="w-4 h-4" />,
            'thumbs-up': <ThumbsUp className="w-4 h-4" />,
            'thumbs-down': <ThumbsDown className="w-4 h-4" />,
            'calendar-plus': <CalendarPlus className="w-4 h-4" />,
            'calendar-check': <CalendarCheck className="w-4 h-4" />,
            'calendar-x': <CalendarX className="w-4 h-4" />,
            'video': <Video className="w-4 h-4" />,
            'video-off': <VideoOff className="w-4 h-4" />,
            'file-text': <FileText className="w-4 h-4" />,
            'file-check': <FileCheck className="w-4 h-4" />,
            'file-x': <FileX className="w-4 h-4" />,
            'file-signature': <FileText className="w-4 h-4" />,
            'file-edit': <Edit className="w-4 h-4" />,
            'truck': <Truck className="w-4 h-4" />,
            'package': <Package className="w-4 h-4" />,
            'alert-triangle': <AlertTriangle className="w-4 h-4" />,
            'credit-card': <CreditCard className="w-4 h-4" />,
            'badge-check': <BadgeCheck className="w-4 h-4" />,
            'alert-circle': <AlertCircle className="w-4 h-4" />,
            'bell': <Bell className="w-4 h-4" />
        }
        return {
            icon: iconMap[config.icon] || <Bell className="w-4 h-4" />,
            bgColor: config.bgColor,
            label: config.label
        }
    }

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMins = Math.floor(diffMs / 60000)

        if (diffMins < 1) return 'Vừa xong'
        if (diffMins < 60) return `${diffMins} phút`
        const diffHours = Math.floor(diffMins / 60)
        if (diffHours < 24) return `${diffHours} giờ`
        const diffDays = Math.floor(diffHours / 24)
        if (diffDays < 7) return `${diffDays} ngày`
        return date.toLocaleDateString('vi-VN')
    }

    const handleBellClick = async () => {
        const wasOpen = isOpen
        setIsOpen(!isOpen)

        if (!wasOpen && unreadCount > 0) {
            setUnreadCount(0)
            await markAllAsRead()
        }
    }

    return (
        <div className="relative font-sans" ref={dropdownRef}>
            {/* Bell Button */}
            <button
                onClick={handleBellClick}
                className={`relative p-2 rounded-lg transition-all duration-200 ${isOpen ? 'bg-slate-100' : 'hover:bg-slate-100/50'
                    }`}
            >
                <Bell size={20} className={`${isOpen ? 'text-slate-700' : textColor}`} />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-semibold rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-[360px] bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden">
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="font-semibold text-slate-800 text-sm">Thông báo</h3>
                        <div className="flex items-center gap-1">
                            {notifications.length > 0 && (
                                <button
                                    onClick={handleDeleteAll}
                                    className="p-1.5 hover:bg-red-50 rounded-md transition-colors text-slate-400 hover:text-red-500"
                                    title="Xóa tất cả"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1.5 hover:bg-slate-100 rounded-md transition-colors"
                            >
                                <X className="w-4 h-4 text-slate-400" />
                            </button>
                        </div>
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-[380px] overflow-y-auto">
                        {loading ? (
                            <div className="py-12 text-center">
                                <div className="w-6 h-6 border-2 border-slate-200 border-t-slate-600 rounded-full animate-spin mx-auto" />
                                <p className="mt-3 text-xs text-slate-400">Đang tải...</p>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="py-12 text-center px-4">
                                <Inbox className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                                <p className="font-medium text-slate-600 text-sm">Không có thông báo</p>
                                <p className="text-xs text-slate-400 mt-1">Bạn đã xem hết rồi!</p>
                            </div>
                        ) : (
                            <div className="py-1">
                                {notifications.map((notification) => {
                                    const config = getIconComponent(notification.type)
                                    return (
                                        <div
                                            key={notification.id}
                                            className={`group px-4 py-3 cursor-pointer transition-colors border-l-2 ${!notification.isRead
                                                ? 'bg-blue-50/50 border-l-blue-500 hover:bg-blue-50'
                                                : 'border-l-transparent hover:bg-slate-50'
                                                }`}
                                            onClick={() => handleNotificationClick(notification)}
                                        >
                                            <div className="flex items-start gap-3">
                                                {/* Icon */}
                                                <div className={`flex-shrink-0 w-8 h-8 rounded-lg ${config.bgColor} flex items-center justify-center text-white`}>
                                                    {config.icon}
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-2 mb-0.5">
                                                        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                                                            {config.label}
                                                        </span>
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-[10px] text-slate-400">
                                                                {formatTime(notification.createdAt)}
                                                            </span>
                                                            {/* Delete button - shows on hover */}
                                                            <button
                                                                onClick={(e) => handleDelete(e, notification.id)}
                                                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-all text-slate-400 hover:text-red-500"
                                                                title="Xóa"
                                                            >
                                                                <X className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <p className={`text-sm leading-snug line-clamp-2 ${!notification.isRead ? 'font-medium text-slate-800' : 'text-slate-600'
                                                        }`}>
                                                        {notification.content}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}

                                {/* Load More Button */}
                                {hasMore && (
                                    <div className="px-4 py-3 border-t border-slate-100">
                                        <button
                                            onClick={handleLoadMore}
                                            disabled={loadingMore}
                                            className="w-full py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center gap-2"
                                        >
                                            {loadingMore ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    Đang tải...
                                                </>
                                            ) : (
                                                'Tải thêm'
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
