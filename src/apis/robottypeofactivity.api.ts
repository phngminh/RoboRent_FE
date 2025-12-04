import http from '../utils/http'
const API_URL = `${import.meta.env.VITE_API_URL}/RobotTypeOfActivity`

export interface RobotTypeOfActivityDto {
  activityTypeId: number;
  roboTypeId: number;
  amount: number;
  roboTypeName: string;
}

export const getRobotTypesOfActivityAsync = async (activityTypeId: number) => {
    try{
        const res = await http.get(`${API_URL}/${activityTypeId}`);
        return res.data as RobotTypeOfActivityDto[];
    }catch(error: any){
        console.error('Error fetching rental list:', error)
        throw error
    }
};