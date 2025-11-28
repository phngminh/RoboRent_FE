import http from '../utils/http'
const API_URL = 'https://localhost:7249/api/ActivityTypeGroup'

export const getAllActivityTypeGroupAsync = async () => {
    try {
        const response = await http.get(`${API_URL}/staff/get/all/group`)
        return response.data
    } catch (error: any){
        console.error('Error fetching group list:', error)
        throw error
    }
}

