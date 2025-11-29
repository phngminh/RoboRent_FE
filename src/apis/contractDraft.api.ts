import http from '../utils/http'

export interface ApiResponse<T> {
  success: boolean
  data: T[]
}

export interface SingleApiResponse<T> {
  success: boolean
  data: T
}

export interface ContractDraftResponse {
  id: number
  title: string
  bodyJson: string
  comments: string
  status: string
  contractTemplatesId: number
  rentalId: number
  staffId: number
  managerId: number
  contractTemplateTitle: string
  rentalEventName: string
  staffName: string
  managerName: string
  createdAt: string
  updatedAt: string
}

export const getAllDrafts = async (): Promise<ContractDraftResponse[]> => {
  const response = await http.get<ApiResponse<ContractDraftResponse>>(`ContractDrafts`)
  return response.data.success ? response.data.data : []
}

export const getDraftsByManager = async (id: number): Promise<ContractDraftResponse[]> => {
  const response = await http.get<ApiResponse<ContractDraftResponse>>(`ContractDrafts/manager/${id}`)
  return response.data.success ? response.data.data : []
}

export const getDraftsByStaff = async (id: number): Promise<ContractDraftResponse[]> => {
  const response = await http.get<ApiResponse<ContractDraftResponse>>(`ContractDrafts/staff/${id}`)
  return response.data.success ? response.data.data : []
}

export const getDraftById = async (id: number) => {
  const response = await http.get<SingleApiResponse<ContractDraftResponse>>(`ContractDrafts/${id}`)
  return response.data.data
}

export const getDraftsByRentalId = async (rentalId: number): Promise<ContractDraftResponse[]> => {
  const response = await http.get<ApiResponse<ContractDraftResponse>>(`ContractDrafts/rental/${rentalId}`)
  return response.data.success ? response.data.data : []
}

export const managerSigns = (id: number, signature: string) => {
  return http.patch(`/ContractDrafts/${id}/manager-sign`, { signature })
}

export const customerSigns = (id: number, signature: string) => {
  return http.patch(`/ContractDrafts/${id}/customer-sign`, { signature })
}

export const managerRejects = (id: number, reason: string) => {
  return http.patch(`/ContractDrafts/${id}/manager-reject`, { reason })
}

export const customerRejects = (id: number, reason: string) => {
  return http.patch(`/ContractDrafts/${id}/customer-reject`, { reason })
}

export const customerRequestChange = (id: number, requests: string) => {
  return http.patch(`/ContractDrafts/${id}/customer-request-change`, { requests })
}