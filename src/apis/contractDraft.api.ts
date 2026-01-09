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

export interface SignContractResponse {
  success: boolean
  data: {
    id: number
    status: string
    depositPayment?: {
      orderCode: number
      amount: number
      checkoutUrl: string
      expiresAt: string
    }
  }
  message: string
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

export const getDraftById = async (id: number): Promise<ContractDraftResponse> => {
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

export const managerRejects = (id: number, reason: string) => {
  return http.patch(`/ContractDrafts/${id}/manager-cancel`, { reason })
}

export const customerRejects = (id: number, reason: string) => {
  return http.patch(`/ContractDrafts/${id}/customer-reject`, { reason })
}

export const customerRequestChange = (id: number, comment: string) => {
  return http.patch(`/ContractDrafts/${id}/customer-request-change`, { comment })
}

export const customerSignsWithFile = async (id: number, file: File) => {
  const formData = new FormData()
  formData.append('signedContractFile', file)
  const response = await http.post<SignContractResponse>(`/ContractDrafts/${id}/customer-sign-file`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

export const downloadContractAsPdf = (id: number) => {
  return http.get(`/ContractDrafts/${id}/download/pdf`, { responseType: 'blob' })
}

export const downloadContractAsWord = (id: number) => {
  return http.get(`/ContractDrafts/${id}/download/word`, { responseType: 'blob' })
}

export interface CreateContractDraftPayload {
  title: string
  comments: string
  rentalId: number
  contractTemplatesId: number
  managerId: number
}

export interface ReviseContractDraftPayload {
  id: number
  title: string
  comments: string
  bodyJson: string
}

export const sendDraftToManager = (id: number) => {
  return http.patch(`/ContractDrafts/${id}/send-to-manager`)
}

export const createDraft = (data: CreateContractDraftPayload) => {
  return http.post('/ContractDrafts', data)
}

export const reviseDraft = (id: number, data: ReviseContractDraftPayload) => {
  return http.patch(`/ContractDrafts/${id}/revise`, data)
}