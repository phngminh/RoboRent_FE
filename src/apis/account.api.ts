import http from '../utils/http'

export interface PaginatedResponse<T> {
  items: T[]
  page: number
  pageSize: number
  totalCount: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface AccountResponse {
  accountId: number
  userId: string
  email: string
  fullName: string
  phoneNumber: string
  status: string
  emailConfirmed: string
  role: string
}

export const getAllManagers = async (): Promise<AccountResponse[]> => {
  const response = await http.get<PaginatedResponse<AccountResponse>>(`Admin/manager?page=1&pageSize=10`)
  return response.data.items
}

export const getAllAccounts = async (): Promise<AccountResponse[]> => {
  const response = await http.get<PaginatedResponse<AccountResponse>>(`Admin/accounts?page=1&pageSize=10`)
  return response.data.items
}

export const updateAccountStatus = async (accountId: number, status: string): Promise<void> => {
  await http.put(`Admin/accounts/${accountId}/status`, { status })
}