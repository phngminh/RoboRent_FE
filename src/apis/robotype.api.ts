import http from '../utils/http';

const API_BASE = `${import.meta.env.VITE_API_URL}`;

export type RoboTypeInfo = {
  id: number;
  typeName?: string;
};


export const getRoboTypesByIdsAsync = async (ids: number[]) => {
  const res = await http.post(`${API_BASE}/RoboType/by-ids`, {
    ids,
  });

  return res.data as RoboTypeInfo[];
};

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