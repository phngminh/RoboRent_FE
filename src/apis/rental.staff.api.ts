import http from '../utils/http'
const API_URL = 'https://localhost:7249/api/Rental'

export const getPendingRentalAsync = async () => {
    try {
        const response = await http.get(`${API_URL}/staff/get/pending/rentals`)
        return response.data
    } catch (error: any){
        console.error('Error fetching pending rental list:', error)
        throw error
    }
}