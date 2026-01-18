import http from '../utils/http'
const API_URL = `${import.meta.env.VITE_API_URL}/ChecklistDelivery`

export const getChecklistDeliveryByActualDeliveryAsync = async (id: number
) => {
    try {
        const response = await http.get(`${API_URL}/staff/get/checklist/${id}`)

        return response.data.data
    } catch (error: any) {
        console.error('Error fetching event activity list:', error)
        throw error
    }
}

/** ===== Request types (based on your JSON) ===== */
export type ChecklistDeliveryItemUpdateRequest = {
  id: number;
  valueType?: string | null;
  valueBool?: boolean | null;
  valueNumber?: number | null;
  valueText?: string | null;
  valueJson?: any; // or string if you always send JSON string
  note?: string | null;
  updatedAt?: string | null; // ISO string
};

export type ChecklistDeliveryBeforeDeliveryUpdateRequest = {
  checklistDeliveryId: number;
  checklistNo?: string | null;
  type: number;
  status: number;
  checkedByStaffId?: number | null;
  checkedAt?: string | null; // ISO string
  overallResult: number;
  overallNote?: string | null;
  totalItems: number;
  passItems: number;
  failItems: number;
  metaJson?: any; // or string
  updatedAt?: string | null; // ISO string
  checklistDeliveryItemUpdateRequests: ChecklistDeliveryItemUpdateRequest[];
};

/**
 * Update checklist data (staff check before delivery)
 * POST: /api/ChecklistDelivery/staff/check/before/delivery
 */
export const staffCheckBeforeDeliveryAsync = async (
  payload: ChecklistDeliveryBeforeDeliveryUpdateRequest
) => {
  try {
    const response = await http.put(
      `${API_URL}/staff/check/before/delivery`,
      payload
    );

    // Most of your APIs return { success: true, data: ... }
    return response.data.data;
  } catch (error: any) {
    console.error("Error updating checklist before delivery:", error);
    throw error;
  }
};

/**
 * GET: /api/ChecklistDelivery/customer/get/checklist/{rentalId}
 * Example response: { success: true, data: 1 }
 */
export const getChecklistDeliveryByRentalForCustomerAsync = async (
  rentalId: number
) => {
  try {
    const response = await http.get(`${API_URL}/customer/get/checklist/${rentalId}`);

    return response.data.data;
  } catch (error: any) {
    console.error("Error fetching customer checklist by rental:", error);
    throw error;
  }
};
