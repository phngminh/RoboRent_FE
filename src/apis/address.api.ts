import http from '../utils/http'
const API_URL = `${import.meta.env.VITE_API_URL}/Admin/address`


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