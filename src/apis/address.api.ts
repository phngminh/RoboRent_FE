import http from '../utils/http'
const API_URL = 'https://localhost:7249/api/Admin/address'

export const getAllProvincesAsync = async () => {
    try {
        const response = await http.get(`${API_URL}/province?URL=https://provinces.open-api.vn/api/v2/p/`)
        return response.data
    } catch (error) {
        console.error('Error fetching provinces list:', error)
        throw error
    }
}

export const getAllWardsAsync = async () => {
    try {
        const response = await http.get(`${API_URL}/province?URL=https://provinces.open-api.vn/api/v2/w/`)
        return response.data
    } catch (error) {
        console.error('Error fetching wards list:', error)
        throw error
    }
}