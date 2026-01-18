import http from '../utils/http'
const API_URL = `${import.meta.env.VITE_API_URL}/ActivityTypeGroup`

export const getAllActivityTypeGroupAsync = async () => {
    try {
        const response = await http.get(`${API_URL}/staff/get/all/group`)
        return response.data
    } catch (error: any){
        console.error('Error fetching group list:', error)
        throw error
    }
}

export const getAllGroupByActivityTypeIdAsync = async (id: number) => {
    try {
        const response = await http.get(`${API_URL}/staff/get/all/group/ActivityTypeGroup/${id}`)
        return response.data
    } catch (error: any){
        console.error('Error fetching group list:', error)
        throw error
    }
}
