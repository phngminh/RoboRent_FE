import http from '../utils/http'

export interface RentalRequestResponse {
  id: number
  eventName: string
  phoneNumber: string
  email: string
  createdDate: string
  updatedDate: string
  status: string
  accountId: number
  eventId: number
  rentalPackageId: number
}

export const getRequestByCustomer = async (accountId: number) => {
  const response = await http.get<RentalRequestResponse[]>(`Rental/my-rentals/${accountId}`)
  return response.data
}