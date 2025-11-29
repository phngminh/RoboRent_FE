import http from '../utils/http'

export interface RentalRequestResponse {
  id: number
  eventName: string
  phoneNumber: string
  email: string
  description: string
  eventDate: string
  startTime: string
  endTime: string
  address: string
  createdDate: string
  status: string
  accountId: number
  eventId: number
  eventActivityId: number
  activityTypeId: number
  eventActivityName: string
  activityTypeName: string
}

export const getRequestByCustomer = async (accountId: number) => {
  const response = await http.get<RentalRequestResponse[]>(`Rental/my-rentals/${accountId}`)
  return response.data
}

export const getAllRequests = async () => {
  const response = await http.get<RentalRequestResponse[]>(`Rental/all`)
  return response.data
}

export const getRequestById = async (requestId: number) => {
  const response = await http.get<RentalRequestResponse>(`Rental/${requestId}`)
  return response.data
}