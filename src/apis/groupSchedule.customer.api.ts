import http from '../utils/http'
const API_URL = 'https://localhost:7249/api/GroupSchedule'

export const getGroupScheduleByRentalIdForCustomerAsync = async (rentalId: number) => {
    try {
        const response = await http.get(`${API_URL}/customer/get/schedule/${rentalId}`)
        return response.data
    } catch (error: any){
        console.error('Error fetching Schedule:', error)
        throw error
    }
}