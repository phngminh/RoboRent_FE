import httpPython from "../utils/httpPython";
import http from '../utils/http'
const API_URL = 'https://localhost:7249/api/FaceProfiles'
const API_URL_VERI = 'https://localhost:7249/api/FaceVerification'


export async function createFaceProfileCCCD(data: {
  account_id: number;
  citizen_id: string;
  image_base64: string;
}) {
  try {
    const res = await httpPython.post("/face/face/profile/create-from-cccd", data);
    return {
      success: true,
      data: res.data
    };
  } catch (err: any) {
    console.error("Create Face Profile Error:", err);

    return {
      success: false,
      message: err?.response?.data?.detail || "Failed to create face profile"
    };
  }
}

export async function verifyFace(data: {
  account_id: number;
  image_base64: string;
  rental_id?: number;
}) {
  try {
    const res = await httpPython.post("/face/verify", data);
    return {
      success: true,
      data: res.data
    };
  } catch (err: any) {
    console.error("Verify Face Error:", err);

    return {
      success: false,
      message: err?.response?.data?.detail || "Face verification failed"
    };
  }
}

export const getFaceProfileByAccountIdAsync = async (
    AccountId: number
) => {
    try {
        const response = await http.get(`${API_URL}/customer/get/faceprofiles/${AccountId}`)
        return response.data
    } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message
    };
    }
}

export const getAllFaceVerificationsByAccountIdAsync = async (
    AccountId: number
) => {
    try {
        const response = await http.get(`${API_URL_VERI}/customer/get/all/${AccountId}`)
        return response.data
    } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message
    };
    }
}
