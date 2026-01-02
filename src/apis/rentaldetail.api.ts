import http from "../utils/http";
const API_BASE = `${import.meta.env.VITE_API_URL}/RentalDetail`;

export interface CreateRobotAbilityValueRequest {
  robotAbilityId: number;
  valueText?: string | null;
  valueJson?: string | null;
  isUpdated?: boolean;
}

export interface CreateRentalDetailRequest {
  rentalId: number;
  roboTypeId: number;
  status?: string | null;
  isDeleted?: boolean | null;
  isLocked?: boolean | null;

  createRobotAbilityValueRequests: CreateRobotAbilityValueRequest[];
}

export interface RentalDetailResponse {
  id: number;
  rentalId: number;
  roboTypeId: number;
  robotAbilityId: number | null;
  script: string;
  branding: string;
  scenario: string;
  status: string;
  isDeleted: boolean;
}

export interface UpdateRentalDetailItem {
  id: number;
  rentalId: number;
  roboTypeId: number;
  robotAbilityId: number | null;
  script?: string;
  branding?: string;
  scenario?: string;
  status?: string;
  isDeleted?: boolean;
}

/**
 * ✅ BULK CREATE: backend expects a list
 * FE will send: CreateRentalDetailRequest[]
 */
export const createRentalDetailsBulkAsync = async (
  items: CreateRentalDetailRequest[]
) => {
  const res = await http.post(`${API_BASE}`, items);
  return res.data;
};

export const getRentalDetailsByRentalIdAsync = async (rentalId: number) => {
  const res = await http.get(`${API_BASE}/rental/${rentalId}`);
  return res.data as {
    success: boolean;
    data: RentalDetailResponse[];
  };
};

export const updateRentalDetailsAsync = async (
  rentalId: number,
  items: UpdateRentalDetailItem[]
) => {
  const res = await http.put(`${API_BASE}/${rentalId}`, items);
  return res.data;
};
