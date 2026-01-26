// src/types/delivery.types.ts

export type DeliveryStatus = 'Pending' | 'Assigned' | 'Dispatched' | 'Delivering' | 'Delivered' | 'Returning' | 'Returned';
export type DeliveryType = 'FirstOfDay' | 'MidDay' | 'LastOfDay' | 'SoleDelivery';


export interface ActualDeliveryResponse {
  id: number;
  groupScheduleId: number;
  staffId: number | null;
  staffName: string | null;
  type: DeliveryType;
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
    packageName?: string; // New field
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

// NEW: Batch Assignment Types
export interface AssignStaffBatchRequest {
  activityTypeGroupId: number
  eventDate: string  // ISO date string (e.g., "2026-01-25")
  staffId: number
  notes?: string
  forcePartialAssign?: boolean
}

export interface AssignStaffBatchResponse {
  success: boolean
  assignedCount: number
  hasConflict: boolean
  conflictingScheduleIds?: number[]
  assignedScheduleIds?: number[]
  conflictMessage?: string
}

// NEW: Grouped Deliveries Types
export interface GroupedDeliveryInfo {
  activityTypeGroupId: number
  activityTypeGroupName: string
  eventDate: string
  deliveryIds: number[]
  groupScheduleIds: number[]
  scheduleCount: number
  scheduleInfo: {
    eventLocations: string[]
    eventCities: string[]
    earliestSetupTime: string
    latestFinishTime: string
  }
  rentalInfo: {
    eventNames: string[]
    customerNames: string[]
  }
}

export interface PendingDeliveriesGroupedResponse {
  groups: GroupedDeliveryInfo[]
  from: string
  to: string
}
