import http from '../utils/http'
const API_URL = 'https://localhost:7249/api/GroupSchedule'

export const getAllScheduleByGroupIdAsync = async (groupId: number) => {
    try {
        const response = await http.get(`${API_URL}/staff/get/all/schedules/${groupId}`)
        return response.data
    } catch (error: any){
        console.error('Error fetching pending rental list:', error)
        throw error
    }
}

export const addScheduleAsync = async (
    staffId: number,
    payload: {
        deliveryTime: string;
        startTime: string;
        endTime: string;
        finishTime: string;
        activityTypeGroupId: number;
        rentalId: number;
    }
) => {
    try {
        const response = await http.post(
            `${API_URL}/staff/add/schedule/${staffId}`,
            payload
        );
        return response.data;
    } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "Unexpected error"
    };
    }
};

export const updateScheduleAsync = async (
    scheduleId: number,
    payload: {
        deliveryTime: string;
        startTime: string;
        endTime: string;
        finishTime: string;
        activityTypeGroupId: number;
        rentalId: number;
    }
) => {
    try {
        const response = await http.put(
            `${API_URL}/staff/update/${scheduleId}`,
            payload
        );
        return response.data;
    } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "Unexpected error"
    };
    }
};