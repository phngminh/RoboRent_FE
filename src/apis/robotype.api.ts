import http from '../utils/http';

const API_BASE = 'https://localhost:7249/api';

export interface RoboTypeInfo {
  id: number;
  name: string;
}

export const getRoboTypesByIdsAsync = async (ids: number[]) => {
  const res = await http.post(`${API_BASE}/RoboType/bulk`, { ids })
  return res.data as RoboTypeInfo[]
}

export interface ApiResponse<T> {
  success: boolean
  data: T[]
}

export interface RoboTypeResponse {
  typeName: string
  description: string
  image?: string
}

export const getAllRoboTypes = async (): Promise<RoboTypeResponse[]> => {
  const response = await http.get<RoboTypeResponse[]>(`RoboType`)
  return response.data
}