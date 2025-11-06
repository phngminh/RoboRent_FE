// src/apis/priceQuote.api.ts
import http from '../utils/http'
import type {
  PriceQuoteResponse,
  CreatePriceQuoteRequest,
  RentalQuotesResponse,
  ManagerQuoteListItemResponse
} from '../types/chat.types'

const API_URL = 'https://localhost:7249/api'

export const createPriceQuote = async (request: CreatePriceQuoteRequest): Promise<PriceQuoteResponse> => {
  const response = await http.post(`${API_URL}/PriceQuotes`, request)
  return response.data
}

export const getPriceQuoteById = async (id: number): Promise<PriceQuoteResponse> => {
  const response = await http.get(`${API_URL}/PriceQuotes/${id}`)
  return response.data
}

export const getQuotesByRentalId = async (rentalId: number): Promise<RentalQuotesResponse> => {
  const response = await http.get(`${API_URL}/PriceQuotes/rental/${rentalId}`)
  return response.data
}

// Helper: Check can create more (từ data đã có)
export const checkCanCreateMoreQuotes = async (rentalId: number): Promise<{ canCreateMore: boolean }> => {
  const quotes = await getQuotesByRentalId(rentalId)
  return { canCreateMore: quotes.canCreateMore }
}

// Manager Action: Accept Quote
export const acceptQuote = async (quoteId: number): Promise<{
  quote: PriceQuoteResponse
  message: string
}> => {
  const response = await http.put(`${API_URL}/PriceQuotes/${quoteId}/accept`)
  return response.data
}

// Update Quote (Staff resubmit after Manager reject)
export const updatePriceQuote = async (
  quoteId: number, 
  data: Partial<CreatePriceQuoteRequest>
): Promise<PriceQuoteResponse> => {
  const response = await http.put(`${API_URL}/PriceQuotes/${quoteId}`, data)
  return response.data
}

// Manager Action (Approve/Reject)
export const managerAction = async (
  quoteId: number,
  action: 'approve' | 'reject',
  feedback?: string
): Promise<PriceQuoteResponse> => {
  const response = await http.put(`${API_URL}/PriceQuotes/${quoteId}/manager-action`, {
    action,
    feedback: action === 'reject' ? feedback : null
  })
  return response.data
}

// Customer Action (Approve/Reject)
export const customerAction = async (
  quoteId: number,
  action: 'approve' | 'reject',
  reason?: string
): Promise<{ quote: PriceQuoteResponse; message: string }> => {
  const response = await http.put(`${API_URL}/PriceQuotes/${quoteId}/customer-action`, {
    action,
    reason: action === 'reject' ? reason : null
  })
  return response.data
}

export const getAllQuotesForManager = async (status?: string): Promise<ManagerQuoteListItemResponse[]> => {
  const params = status ? { status } : {}
  const response = await http.get(`${API_URL}/PriceQuotes`, { params })
  return response.data
}