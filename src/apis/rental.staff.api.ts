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

export const getReceivedRentalByStaffIdAsync = async (staffId: number) => {
    try {
        const response = await http.get(`${API_URL}/staff/get/received/rentals/${staffId}`)
        return response.data
    } catch (error: any){
        console.error('Error fetching receive rental list:', error)
        throw error
    }
}

export const getRentalByIdAsync = async (rentalId: number) => {
    try {
        const response = await http.get(`${API_URL}/${rentalId}`)
        return response.data
    } catch (error: any){
        console.error('Error fetching rental infor:', error)
        throw error
    }
} 

export const receiveRentalAsync = async (rentalId: number, staffId: number) => {
    try {
        const response = await http.put(`${API_URL}/staff/receive/${rentalId}/${staffId}`)
        return response.data
    } catch (error: any){
        console.error('Error fetching rental infor:', error)
        throw error
    }
} 