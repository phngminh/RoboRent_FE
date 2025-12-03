import http from '../utils/http'

export interface ApiResponse<T> {
  success: boolean
  data: T[]
}

export interface DraftClausesResponse {
  id: number
  title: string
  body: string
  isModified: boolean
  contractDraftsId: number
  templateClausesId: number
  contractDraftTitle: string
  templateClauseTitle: string
  templateClauseIsMandatory: boolean
  templateClauseIsEditable: boolean
  createdAt: string
}

export const getDraftsByContractId = async (id: number): Promise<DraftClausesResponse[]> => {
  const response = await http.get<ApiResponse<DraftClausesResponse>>(`DraftClauses/contract-draft/${id}`)
  return response.data.success ? response.data.data : []
}