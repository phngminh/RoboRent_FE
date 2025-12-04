import http from '../utils/http';
import type { PaymentListResponse } from '../types/payment.types';

// Hardcode URL hoặc lấy từ Env (đảm bảo đúng port backend của bạn)
const API_URL = `${import.meta.env.VITE_API_URL}`; 

export const paymentApi = {
  /**
   * GET /api/payment/my-transactions
   * Lấy danh sách giao dịch của khách hàng.
   * Logic: Sort backend hoặc client đều được, ở đây client sẽ sort lại theo ngày mới nhất.
   */
  getMyTransactions: async () => {
    const response = await http.get<PaymentListResponse>(`${API_URL}/payment/my-transactions`);
    return response.data;
  }
};