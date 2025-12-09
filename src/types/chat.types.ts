// src/types/chat.types.ts

// Đổi từ enum sang const để tránh lỗi erasableSyntaxOnly
export const MessageType = {
  Text: 0,
  Demo: 1,
  PriceQuoteNotification: 2,
  ContractNotification: 3,
  SystemNotification: 4
} as const

export type MessageType = typeof MessageType[keyof typeof MessageType]

export const DemoStatus = {
  Pending: 'Pending',
  Accepted: 'Accepted',
  Rejected: 'Rejected'
} as const

export type DemoStatus = typeof DemoStatus[keyof typeof DemoStatus]

export const QuoteStatus = {
  PendingManager: 'PendingManager',
  RejectedManager: 'RejectedManager',
  PendingCustomer: 'PendingCustomer',
  RejectedCustomer: 'RejectedCustomer',
  Approved: 'Approved',
  Expired: 'Expired'
} as const

export type QuoteStatus = typeof QuoteStatus[keyof typeof QuoteStatus]

export interface AccountInfo {
  id: number
  fullName: string
  phoneNumber: string
}

export interface ChatRoomResponse {
  id: number
  rentalId: number
  staff: AccountInfo
  customer: AccountInfo
  createdAt: string
  messages: ChatMessageResponse[]
}

export interface ChatMessageResponse {
  id: number
  chatRoomId: number
  rentalId: number
  senderId: number
  senderName: string
  senderRole: 'Staff' | 'Customer' | 'System'
  messageType: MessageType
  content: string
  videoUrls: string[] | null
  relatedEntityId: number | null
  status: DemoStatus | null
  isRead: boolean
  createdAt: string
}

export interface ChatMessagesPageResponse {
  messages: ChatMessageResponse[]
  page: number
  pageSize: number
  totalCount: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface SendMessageRequest {
  rentalId: number
  messageType: MessageType
  content: string
  videoUrls?: string[]
  relatedEntityId?: number | null
}

export interface UpdateMessageStatusRequest {
  status: DemoStatus
}

export interface PriceQuoteResponse {
  id: number
  rentalId: number
  deposit: number | null
  complete: number | null
  service: number | null
  deliveryFee: number | null      
  deliveryDistance: number | null 
  total: number
  staffDescription: string | null
  managerFeedback: string | null
  customerReason: string | null 
  createdAt: string
  status: QuoteStatus
  quoteNumber: number
}

export interface CreatePriceQuoteRequest {
  rentalId: number
  deposit?: number
  complete?: number
  service?: number
  staffDescription?: string
  managerFeedback?: string
}

export interface RentalQuotesResponse {
  rentalId: number
  quotes: {
    id: number
    quoteNumber: number
    total: number
    status: QuoteStatus
    createdAt: string
  }[]
  totalQuotes: number
  canCreateMore: boolean
}

// Placeholder types (APIs chưa có)
export interface RentalDetailsPlaceholder {
  id: number
  eventDate: string
  eventTime: string
  eventAddress: string
  packageName: string
  robotsRequested: number
  customizationNotes: string
  companyName: string
  customerName: string
  phoneNumber: string
  email: string
}

export interface ChatRoomListItem {
  id: number
  rentalId: number
  customerName?: string
  staffName?: string
  packageName?: string
  eventDate?: string
  status?: string
  rentalStatus?: string 
  lastMessage?: string
  lastMessageTime?: string
  unreadCount: number
  createdAt: string
}

export interface ChatRoomListResponse {
  rooms: ChatRoomListItem[]
  page: number
  pageSize: number
  totalCount: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface DeliveryFeePreviewResponse {
  rentalId: number
  city: string
  deliveryFee: number
  distanceKm: number | null
  description: string
}

export interface ManagerQuoteListItemResponse {
  id: number
  rentalId: number
  quoteNumber: number
  customerName: string
  packageName: string
  eventDate: string
  deliveryFee: number | null
  deliveryDistance: number | null
  deposit: number | null
  complete: number | null
  service: number | null
  total: number
  staffDescription: string | null
  managerFeedback: string | null
  status: QuoteStatus
  createdAt: string | null  // ✅ nullable
}