import { useState, useEffect, useRef } from 'react'
import { Bell, X, MessageCircle, FileText, DollarSign, Video, Inbox } from 'lucide-react'
import { getMyChatRooms, getChatMessages, markRentalAsRead } from '../apis/chat.api'
import { signalRService } from '../utils/signalr'
import { MessageType, type ChatMessageResponse } from '../types/chat.types'
import { toast } from 'react-toastify'
import { useAuth } from '../contexts/AuthContext'

interface NotificationCenterProps {
    textColor?: string
}

export default function NotificationCenter({ textColor = 'text-gray-700' }: NotificationCenterProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [notifications, setNotifications] = useState<ChatMessageResponse[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [loading, setLoading] = useState(false)
    const [roomIds, setRoomIds] = useState<number[]>([])
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
        const handleNewMessage = (message: ChatMessageResponse) => {
            // Only count notifications from others
            if (message.messageType !== MessageType.Text && !message.isRead && message.senderId !== user?.id) {
                setNotifications(prev => [message, ...prev])
                setUnreadCount(prev => prev + 1)

                if (message.messageType === MessageType.ContractNotification) {
                    toast.info(message.content, { autoClose: 5000 })
                }
            }
        }

        // 🎯 NEW: Handle quote events
        const handleQuoteCreated = (data: { QuoteId: number; QuoteNumber: number; Total: number }) => {
            setUnreadCount(prev => prev + 1)
            toast.info(`💰 Báo giá mới #${data.QuoteNumber} đã được tạo!`, { autoClose: 5000 })
        }

        const handleQuoteStatusChanged = (data: { QuoteId: number; Status: string; QuoteNumber: number }) => {
            setUnreadCount(prev => prev + 1)
            const statusText = data.Status === 'Approved' ? 'đã được duyệt ✅' : 'đã bị từ chối ❌'
            toast.info(`Báo giá #${data.QuoteNumber} ${statusText}`, { autoClose: 5000 })
        }

        const handleQuoteRejected = (data: { QuoteId: number; QuoteNumber: number; Reason: string }) => {
            setUnreadCount(prev => prev + 1)
            toast.warning(`Customer từ chối báo giá #${data.QuoteNumber}`, { autoClose: 5000 })
        }

        // 🎯 NEW: Handle contract events
        const handleContractPendingSignature = (data: { ContractId: number; Message: string }) => {
            setUnreadCount(prev => prev + 1)
            toast.info(`📝 ${data.Message}`, { autoClose: 5000 })
        }

        const handleContractActivated = (data: { ContractId: number; Message: string }) => {
            setUnreadCount(prev => prev + 1)
            toast.success(`🎉 ${data.Message}`, { autoClose: 5000 })
        }

        const handleContractChangeRequested = (data: { ContractId: number; ChangeRequest: string }) => {
            setUnreadCount(prev => prev + 1)
            toast.info(`📋 Yêu cầu sửa hợp đồng: ${data.ChangeRequest}`, { autoClose: 5000 })
        }

        signalRService.onReceiveMessage(handleNewMessage)
        signalRService.onQuoteCreated(handleQuoteCreated)
        signalRService.onQuoteStatusChanged(handleQuoteStatusChanged)
        signalRService.onQuoteRejected(handleQuoteRejected)
        signalRService.onContractPendingCustomerSignature(handleContractPendingSignature)
        signalRService.onContractActivated(handleContractActivated)
        signalRService.onContractChangeRequested(handleContractChangeRequested)

        return () => {
            signalRService.offReceiveMessage()
            signalRService.offQuoteCreated()
            signalRService.offQuoteStatusChanged()
            signalRService.offQuoteRejected()
            signalRService.offContractPendingCustomerSignature()
            signalRService.offContractActivated()
            signalRService.offContractChangeRequested()
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
            const response = await getMyChatRooms(1, 50)
            let count = 0
            const ids: number[] = []

            for (const room of response.rooms) {
                ids.push(room.rentalId)
                const messages = await getChatMessages(room.rentalId, 1, 20)
                const unreadNotifications = messages.messages.filter(m =>
                    m.messageType !== MessageType.Text &&
                    !m.isRead &&
                    m.senderId !== user?.id  // 🎯 Don't count own messages!
                )
                count += unreadNotifications.length
            }

            setRoomIds(ids)
            setUnreadCount(count)
        } catch (error) {
            console.error('Failed to load unread count:', error)
        }
    }

    const loadNotifications = async () => {
        setLoading(true)
        try {
            const response = await getMyChatRooms(1, 50)
            const allNotifications: ChatMessageResponse[] = []

            for (const room of response.rooms) {
                const messages = await getChatMessages(room.rentalId, 1, 20)
                const roomNotifications = messages.messages.filter(m =>
                    m.messageType !== MessageType.Text &&
                    m.senderId !== user?.id  // 🎯 CRITICAL: Don't show own messages!
                )
                allNotifications.push(...roomNotifications)
            }

            allNotifications.sort((a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )

            setNotifications(allNotifications.slice(0, 20))
        } catch (error) {
            console.error('Failed to load notifications:', error)
            toast.error('Failed to load notifications')
        } finally {
            setLoading(false)
        }
    }

    const markAllAsRead = async () => {
        try {
            // Mark all rooms as read
            await Promise.all(roomIds.map(id => markRentalAsRead(id)))
            // Update local state
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
        } catch (error) {
            console.error('Failed to mark as read:', error)
        }
    }

    const handleNotificationClick = (notification: ChatMessageResponse) => {
        const rolePrefix = user?.role?.toLowerCase() || 'customer'
        window.location.href = `/${rolePrefix}/chat/${notification.chatRoomId}`
    }

    const getNotificationConfig = (type: MessageType): { icon: React.ReactNode; bg: string; label: string } => {
        switch (type) {
            case MessageType.Demo:
                return { icon: <Video className="w-4 h-4" />, bg: 'bg-rose-500', label: 'Demo' }
            case MessageType.PriceQuoteNotification:
                return { icon: <DollarSign className="w-4 h-4" />, bg: 'bg-emerald-500', label: 'Quote' }
            case MessageType.ContractNotification:
                return { icon: <FileText className="w-4 h-4" />, bg: 'bg-blue-500', label: 'Contract' }
            case MessageType.SystemNotification:
                return { icon: <Bell className="w-4 h-4" />, bg: 'bg-amber-500', label: 'System' }
            default:
                return { icon: <MessageCircle className="w-4 h-4" />, bg: 'bg-slate-500', label: 'Message' }
        }
    }

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMins = Math.floor(diffMs / 60000)

        if (diffMins < 1) return 'Just now'
        if (diffMins < 60) return `${diffMins}m`
        const diffHours = Math.floor(diffMins / 60)
        if (diffHours < 24) return `${diffHours}h`
        const diffDays = Math.floor(diffHours / 24)
        if (diffDays < 7) return `${diffDays}d`
        return date.toLocaleDateString()
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
                        <h3 className="font-semibold text-slate-800 text-sm">Notifications</h3>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1 hover:bg-slate-100 rounded-md transition-colors"
                        >
                            <X className="w-4 h-4 text-slate-400" />
                        </button>
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-[380px] overflow-y-auto">
                        {loading ? (
                            <div className="py-12 text-center">
                                <div className="w-6 h-6 border-2 border-slate-200 border-t-slate-600 rounded-full animate-spin mx-auto" />
                                <p className="mt-3 text-xs text-slate-400">Loading...</p>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="py-12 text-center px-4">
                                <Inbox className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                                <p className="font-medium text-slate-600 text-sm">No notifications</p>
                                <p className="text-xs text-slate-400 mt-1">You're all caught up!</p>
                            </div>
                        ) : (
                            <div className="py-1">
                                {notifications.map((notification) => {
                                    const config = getNotificationConfig(notification.messageType)
                                    return (
                                        <div
                                            key={notification.id}
                                            className={`px-4 py-3 cursor-pointer transition-colors border-l-2 ${!notification.isRead
                                                ? 'bg-blue-50/50 border-l-blue-500 hover:bg-blue-50'
                                                : 'border-l-transparent hover:bg-slate-50'
                                                }`}
                                            onClick={() => handleNotificationClick(notification)}
                                        >
                                            <div className="flex items-start gap-3">
                                                {/* Icon */}
                                                <div className={`flex-shrink-0 w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center text-white`}>
                                                    {config.icon}
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-2 mb-0.5">
                                                        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                                                            {config.label}
                                                        </span>
                                                        <span className="text-[10px] text-slate-400">
                                                            {formatTime(notification.createdAt)}
                                                        </span>
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
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
