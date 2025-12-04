// src/apis/chat.api.ts
import http from '../utils/http'
import type {
  ChatRoomResponse,
  ChatMessagesPageResponse,
  ChatMessageResponse,
  SendMessageRequest,
  UpdateMessageStatusRequest,
  ChatRoomListResponse
} from '../types/chat.types'

const API_URL = `${import.meta.env.VITE_API_URL}`

export const createOrGetChatRoom = async (
  rentalId: number,
  staffId: number,
  customerId: number
): Promise<ChatRoomResponse> => {
  const response = await http.post(
    `${API_URL}/Chat/rooms?rentalId=${rentalId}&staffId=${staffId}&customerId=${customerId}`
  )
  return response.data
}

export const getChatRoomByRentalId = async (rentalId: number): Promise<ChatRoomResponse> => {
  const response = await http.get(`${API_URL}/Chat/rooms/${rentalId}`)
  return response.data
}

export const getChatMessages = async (
  rentalId: number,
  page: number = 1,
  pageSize: number = 50
): Promise<ChatMessagesPageResponse> => {
  const response = await http.get(`${API_URL}/Chat/messages/${rentalId}`, {
    params: { page, pageSize }
  })
  return response.data
}

export const sendMessage = async (request: SendMessageRequest): Promise<ChatMessageResponse> => {
  const response = await http.post(`${API_URL}/Chat/send-message`, request)
  return response.data
}

export const updateMessageStatus = async (
  messageId: number,
  request: UpdateMessageStatusRequest
): Promise<ChatMessageResponse> => {
  const response = await http.put(`${API_URL}/Chat/messages/${messageId}/status`, request)
  return response.data
}

export const getUnreadCount = async (rentalId: number): Promise<{ rentalId: number; unreadCount: number }> => {
  const response = await http.get(`${API_URL}/Chat/unread-count/${rentalId}`)
  return response.data
}

export const getMyChatRooms = async (
  page: number = 1,
  pageSize: number = 50
): Promise<ChatRoomListResponse> => {
  const response = await http.get(`${API_URL}/Chat/rooms`, {
    params: { page, pageSize }
  })
  return response.data
}

export const getStaffChatRooms = async (
  staffId: number,
  page: number = 1,
  pageSize: number = 50
): Promise<ChatRoomListResponse> => {
  const response = await http.get(`${API_URL}/Chat/rooms/staff/${staffId}`, {
    params: { page, pageSize }
  })
  return response.data
}

export const getCustomerChatRooms = async (
  customerId: number,
  page: number = 1,
  pageSize: number = 50
): Promise<ChatRoomListResponse> => {
  const response = await http.get(`${API_URL}/Chat/rooms/customer/${customerId}`, {
    params: { page, pageSize }
  })
  return response.data
}