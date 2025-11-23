import http from '../utils/http'

export interface ApiResponse<T> {
  success: boolean
  data: T[]
}

export interface ContractTemplateResponse {
  id: number
  templateCode: string
  title: string
  description: string
  bodyJson: string
  status: string
  version: string
  createdAt: string
  updatedAt: string
  createdBy: number
  updatedBy: number
  createdByName: string
  updatedByName: string
}

export interface ContractTemplateWithBodyPayload {
  templateCode: string
  title: string
  description: string
  version: string
}

export const getAllTemplates = async (): Promise<ContractTemplateResponse[]> => {
  const response = await http.get<ApiResponse<ContractTemplateResponse>>(`ContractTemplates`)
  return response.data.success ? response.data.data : []
}

export const createTemplateWithBody = (data: ContractTemplateWithBodyPayload) => {
  return http.post('/ContractTemplates/create-with-body', data)
}

export interface TemplateClauseResponse {
  id: number
  clauseCode: string
  title: string
  body: string
  isMandatory: boolean
  isEditable: boolean
  createdAt: string
  contractTemplatesId: number
  contractTemplateTitle: string
}

export const getAllClauses = async (): Promise<TemplateClauseResponse[]> => {
  const response = await http.get<ApiResponse<TemplateClauseResponse>>(`TemplateClauses`)
  return response.data.success ? response.data.data : []
}