import http from '../utils/http'
const API_URL = `${import.meta.env.VITE_API_URL}/ChecklistDeliveryEvidence`

export interface CreateChecklistDeliveryEvidenceRequest {
  checklistDeliveryId: number
  checklistDeliveryItemId: number
  scope: number
  type: number
  url: string
  fileName: string
  fileSizeBytes: number
  capturedAt: string
  uploadedByStaffId: number
  metaJson?: string
  createdAt?: string
}

export const CreateEvidence = async (data: CreateChecklistDeliveryEvidenceRequest) => {
  try {
    // POST directly to the provided local API URL
    const res = await http.post(API_URL, data)
    return res.data
  } catch (error: any) {
    console.error('Error creating checklist delivery evidence:', error)
    throw error
  }
}