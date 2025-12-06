// src/apis/delivery.api.ts
import http from '../utils/http'
import type {
  ActualDeliveryResponse,
  UpdateStatusRequest,
  UpdateNotesRequest,
  ConflictCheckResponse,
  AssignStaffRequest,
  StaffListResponse,
  PendingDeliveriesResponse
} from '../types/delivery.types'

const API_URL = 'https://localhost:7249/api'

/**
 * GET /api/ActualDelivery/my-deliveries
 * Returns: Array of deliveries assigned to current staff
 */
export const getMyDeliveries = async (): Promise<ActualDeliveryResponse[]> => {
  const response = await http.get(`${API_URL}/ActualDelivery/my-deliveries`)
return response.data.data
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

/**
 * GET /api/ActualDelivery/pending
 * Query params: page, pageSize, searchTerm, sortBy (date|name|customer|location)
 * Returns: Paginated list of pending deliveries (not assigned yet)
 */
export const getPendingDeliveries = async (
  page: number = 1,
  pageSize: number = 50,
  searchTerm?: string,
  sortBy: 'date' | 'name' | 'customer' | 'location' = 'date'
): Promise<PendingDeliveriesResponse> => {
  const params: any = { page, pageSize, sortBy }
  if (searchTerm) params.searchTerm = searchTerm

  const response = await http.get(`${API_URL}/ActualDelivery/pending`, { params })
  return response.data
}

/**
 * GET /api/Admin/staff
 * Query params: page, pageSize, status, searchTerm
 * Returns: Paginated list of staff members
 */
export const getStaffList = async (
  page: number = 1,
  pageSize: number = 100,
  status?: string,
  searchTerm?: string
): Promise<StaffListResponse> => {
  const params: any = { page, pageSize }
  if (status) params.status = status
  if (searchTerm) params.searchTerm = searchTerm

  const response = await http.get(`${API_URL}/Admin/staff`, { params })
  return response.data
}

/**
 * GET /api/ActualDelivery/check-conflict
 * Query params: staffId, groupScheduleId
 * Returns: Conflict check result with list of conflicting deliveries
 */
export const checkStaffConflict = async (
  staffId: number,
  groupScheduleId: number
): Promise<ConflictCheckResponse> => {
  const response = await http.get(`${API_URL}/ActualDelivery/check-conflict`, {
    params: { staffId, groupScheduleId }
  })
  return response.data
}

/**
 * PUT /api/ActualDelivery/{id}/assign-staff
 * Body: { staffId: number, notes?: string }
 * Returns: Updated delivery with assigned staff
 * Validates: Delivery must be Pending, checks for schedule conflicts
 * Changes status: Pending → Assigned
 */
export const assignStaff = async (
  deliveryId: number,
  request: AssignStaffRequest
): Promise<ActualDeliveryResponse> => {
  const response = await http.put(
    `${API_URL}/ActualDelivery/${deliveryId}/assign-staff`,
    request
  )
  return response.data
}

/**
 * PUT /api/Rentals/{rentalId}/complete
 * Returns: RentalCompletionResponse (with checkoutUrl)
 */
export const completeRental = async (rentalId: number): Promise<any> => {
  // Lưu ý: Check lại Controller bên BE là "Rentals" hay "Rental"
  const response = await http.put(`${API_URL}/Rental/${rentalId}/complete`)
  return response.data
}

/**
 * [CUSTOMER] GET /api/ActualDelivery/by-rental/{rentalId}
 * Returns: First delivery for this rental (or null)
 */
export const getDeliveryByRentalId = async (
  rentalId: number
): Promise<ActualDeliveryResponse | null> => {
  try {
    const response = await http.get(`${API_URL}/ActualDelivery/by-rental/${rentalId}`)
    return response.data
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null // No delivery yet
    }
    throw error
  }
}