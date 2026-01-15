import http from '../utils/http'
const API_URL = `${import.meta.env.VITE_API_URL}/ChecklistDeliveryItem`

export const getChecklistDeliveryItemByChecklistDeliveryIdAsync = async (id: number
) => {
    try {
        const response = await http.get(`${API_URL}/${id}`)

        return response.data.data
    } catch (error: any) {
        console.error('Error fetching event activity list:', error)
        throw error
    }
}