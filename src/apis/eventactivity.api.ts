import http from '../utils/http'
const API_URL = 'https://localhost:7249/api/EventActivity'

export const getAllEventActivityAsync = async () => {
    try{
        const response = await http.get(`${API_URL}`)
        
        return response.data
    } catch (error : any){
        console.error('Error fetching event activity list:', error)
        throw error
    }
}