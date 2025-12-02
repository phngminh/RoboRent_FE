import http from '../utils/http'

export interface ApiResponse<T> {
  success: boolean
  data: T[]
}

export interface SingleApiResponse<T> {
  success: boolean
  data: T
}

export interface CreateContractReportPayload {
  draftClausesId: number
  accusedId: number
  description: string
  evidencePath: string
}

export interface ContractReportResponse {
  id: number
  draftClausesId: number
  draftClauseTitle: string
  reporterId: number
  reporterName: string
  reportRole: string
  accusedId: number
  accusedName: string
  description: string
  evidencePath: string
  status: string
  resolution: string
  createdAt: Date
  reviewedBy: number
  reviewerName: string
  reviewedAt: Date
  paymentId: number
  paymentLink: string
}

export const getAllReports = async (): Promise<ContractReportResponse[]> => {
  const response = await http.get<ApiResponse<ContractReportResponse>>(`ContractReports`)
  return response.data.success ? response.data.data : []
}

export const getReportById = async (id: number): Promise<ContractReportResponse> => {
  const response = await http.get<SingleApiResponse<ContractReportResponse>>(`ContractReports/${id}`)
  return response.data.data
}

export const sendReport = async (data: CreateContractReportPayload) => {
  const response = await http.post<ContractReportResponse>(`ContractReports`, data)
  return response.data
}

export const managerResolve = (id: number, resolution: string) => {
  return http.patch(`/ContractReports/${id}/resolve`, { resolution })
}

export const managerReject = (id: number, resolution: string) => {
  return http.patch(`/ContractReports/${id}/reject`, { resolution })
}