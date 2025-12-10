// Utility function to format money with Vietnamese Dong symbol
export const formatMoney = (amount: number, options?: {
  showSymbol?: boolean;
}): string => {
  const formatted = new Intl.NumberFormat('vi-VN').format(amount);
  return options?.showSymbol !== false ? `${formatted} ₫` : formatted;
};

