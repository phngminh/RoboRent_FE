import http from '../utils/http'
const API_URL = `${import.meta.env.VITE_API_URL}/ActivityType`

export const getActivityTypeByEAIdAsync = async (
    eventActivityId: number
) => {
    try {
        const response = await http.get(`${API_URL}/${eventActivityId}`)

        return response.data
    } catch (error: any) {
        console.error('Error fetching event activity list:', error)
        throw error
    }
}
