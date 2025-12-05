import http from '../utils/http'
const API_URL = `${import.meta.env.VITE_API_URL}/Rental`

export const getRentalByAccountIdAsync = async (
    customerId: number,
    page: number = 1,
    pageSize: number = 5,
    search: string = ''
) => {
    try {
        const response = await http.get(
            `${API_URL}/customer/${customerId}`,
            {
                params: {
                    page,
                    pageSize,
                    search
                }
            }
        )

        return response.data
    } catch (error: any){
        console.error('Error fetching rental list:', error)
        throw error
    }
}

export const customerCreateRentalAsync = async (
data: any
) => {
    try {
        const res = await http.post(`${API_URL}/create`, data);
        return res.data
    } catch (error: any){
        console.error('Error create rental:', error)
        throw error
    }
}

export const getRentalByIdAsync = async (rentalId: number) => {
    try{
        const res = await http.get(`${API_URL}/${rentalId}`)
        return res.data
    } catch (error: any){
        console.error('Error fetching rental by id:', error)
        throw error
    }
}

export const customerUpdateRentalAsync = async (
    data: any
) => {
    try{
        const res = await http.put(`${API_URL}/update`, data)
        return res.data
    } catch (error: any){
        console.error('Error update rental:', error)
        throw error
    }
}

export const customerSendRentalAsync = async (
    rentalId: number
) => {
    try{
        const res = await http.put(`${API_URL}/customer/send/${rentalId}`)
        return res.data
    }catch (error: any){
        console.error('Error send rental:', error)
        throw error
    }
}

export const customerCancelRentalAsync = async (
    rentalId: number
) => {
    try{
        const res = await http.put(`${API_URL}/customer/cancel/rental/${rentalId}`)
        return res.data
    }catch (error: any){
        console.error('Error send rental:', error)
        throw error
    }
}

export const customerDeleteRentalAsync = async (
    rentalId: number
) => {
    try{
        const res = await http.put(`${API_URL}/customer/delete/rental/${rentalId}`)
        return res.data
    }catch (error: any){
        console.error('Error send rental:', error)
        throw error
    }
}