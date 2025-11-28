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

export interface CreateContractTemplatePayload {
  templateCode: string
  title: string
  description: string
  bodyJson: string
  status: string
  version: string
  createdBy: number
}

export interface CreateContractTemplateWithBodyPayload {
  templateCode: string
  title: string
  description: string
  version: string
}

export interface UpdateContractTemplatePayload {
  id: number
  templateCode: string
  title: string
  description: string
  version: string
  status: string
  bodyJson: string
  updatedBy: number
}

export const getAllTemplates = async (): Promise<ContractTemplateResponse[]> => {
  const response = await http.get<ApiResponse<ContractTemplateResponse>>(`ContractTemplates`)
  return response.data.success ? response.data.data : []
}

export const getTemplateById = (id: number) => {
  return http.get(`/ContractTemplates/${id}`)
}

export const createTemplate = (data: CreateContractTemplatePayload) => {
  return http.post('/ContractTemplates', data)
}

export const createTemplateWithBody = (data: CreateContractTemplateWithBodyPayload) => {
  return http.post('/ContractTemplates/create-with-body', data)
}

export const editTemplate = (id: number, data: UpdateContractTemplatePayload) => {
  return http.put(`/ContractTemplates/${id}`, data)
}

export const disableTemplate = (id: number) => {
  return http.delete(`/ContractTemplates/${id}`)
}

export const activateTemplate = (id: number) => {
  return http.patch(`/ContractTemplates/${id}/activate`)
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

export interface TemplateClausePayload {
  contractTemplateId: number
  titleOrCode: string
  body: string
  isMandatory: boolean
  isEditable: boolean
}

export interface UpdateTemplateClausePayload {
  clauseCode: string
  title: string
  body: string
  isMandatory: boolean
  isEditable: boolean
}

export const getAllClauses = async (): Promise<TemplateClauseResponse[]> => {
  const response = await http.get<ApiResponse<TemplateClauseResponse>>(`TemplateClauses`)
  return response.data.success ? response.data.data : []
}

export const createClause = (data: TemplateClausePayload) => {
  return http.post('/TemplateClauses', data)
}

export const editClause = (id: number, data: UpdateTemplateClausePayload) => {
  return http.put(`/TemplateClauses/${id}`, data)
}

export const deleteClause = (id: number) => {
  return http.delete(`/TemplateClauses/${id}`)
}