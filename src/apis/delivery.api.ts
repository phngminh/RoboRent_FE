// src/apis/delivery.api.ts
import http from '../utils/http'
import type {
  ActualDeliveryResponse,
  UpdateStatusRequest,
  UpdateNotesRequest
} from '../types/delivery.types'

const API_URL = 'https://localhost:7249/api'

/**
 * GET /api/ActualDelivery/my-deliveries
 * Returns: Array of deliveries assigned to current staff
 */
export const getMyDeliveries = async (): Promise<ActualDeliveryResponse[]> => {
  const response = await http.get(`${API_URL}/ActualDelivery/my-deliveries`)
  return response.data
}

/**
 * GET /api/ActualDelivery/{id}
 * Returns: Full delivery details
 */
export const getDeliveryById = async (id: number): Promise<ActualDeliveryResponse> => {
  const response = await http.get(`${API_URL}/ActualDelivery/${id}`)
  return response.data
}

/**
 * PUT /api/ActualDelivery/{id}/status
 * Body: { status: string, notes?: string }
 * Returns: Updated delivery
 * Validates: Status transition rules
 * Auto-fills: actualDeliveryTime (when Delivered), actualPickupTime (when Collected)
 */
export const updateDeliveryStatus = async (
  id: number,
  request: UpdateStatusRequest
): Promise<ActualDeliveryResponse> => {
  const response = await http.put(`${API_URL}/ActualDelivery/${id}/status`, request)
  return response.data
}

/**
 * PUT /api/ActualDelivery/{id}/notes
 * Body: { notes: string }
 * Returns: Updated delivery
 */
export const updateDeliveryNotes = async (
  id: number,
  request: UpdateNotesRequest
): Promise<ActualDeliveryResponse> => {
  const response = await http.put(`${API_URL}/ActualDelivery/${id}/notes`, request)
  return response.data
}