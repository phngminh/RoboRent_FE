export interface PaymentRecordResponse {
  id: number;
  rentalId: number | null;
  rentalName: string | null; // Tên sự kiện (Thông tin quan trọng nhất)
  priceQuoteId: number | null;
  paymentType: 'Deposit' | 'Full';
  amount: number;
  orderCode: number; // Dùng làm Ref ID
  paymentLinkId: string | null;
  status: string; // 'Pending', 'Paid', 'Cancelled', 'Failed'
  createdAt: string;
  paidAt: string | null;
  checkoutUrl: string | null;
  expiredAt: string | null;
}

export interface PaymentListResponse {
  success: boolean;
  data: PaymentRecordResponse[];
}