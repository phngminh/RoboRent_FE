// src/types/delivery.types.ts

export type DeliveryStatus = 'Pending' | 'Assigned' | 'Delivering' | 'Delivered' | 'Collecting' | 'Collected' | 'Completed';

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