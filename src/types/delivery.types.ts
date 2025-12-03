// src/types/delivery.types.ts

export type DeliveryStatus = 'Pending' | 'Assigned' | 'Delivering' | 'Delivered';

export interface ActualDeliveryResponse {
  id: number;
  groupScheduleId: number;
  staffId: number | null;
  staffName: string | null;
  scheduledDeliveryTime: string | null;
  scheduledPickupTime: string | null;
  actualDeliveryTime: string | null;
  actualPickupTime: string | null;
  status: DeliveryStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string | null;
  scheduleInfo: {
    eventDate: string;
    eventLocation: string;
    eventCity: string;
    deliveryTime: string;
    startTime: string;
    endTime: string;
    finishTime: string;
  };
  rentalInfo: {
    rentalId: number;
    eventName: string;
    customerName: string;
    phoneNumber: string;
  };
}

export interface UpdateStatusRequest {
  status: string;
  notes?: string;
}

export interface UpdateNotesRequest {
  notes: string;
}

export interface PendingDeliveriesResponse {
  items: ActualDeliveryResponse[]
  page: number
  pageSize: number
  totalCount: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface StaffListItemResponse {
  accountId: number
  userId: string
  email: string
  fullName: string
  phoneNumber: string
  status: string
  emailConfirmed: boolean
}

export interface StaffListResponse {
  items: StaffListItemResponse[]
  page: number
  pageSize: number
  totalCount: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface AssignStaffRequest {
  staffId: number
  notes?: string
}

export interface ConflictDetail {
  deliveryId: number
  eventName: string
  scheduledStart: string
  scheduledEnd: string
}

export interface ConflictCheckResponse {
  hasConflict: boolean
  conflicts: ConflictDetail[]
}