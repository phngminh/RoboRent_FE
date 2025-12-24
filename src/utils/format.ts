// Utility function to format money with Vietnamese Dong symbol
export const formatMoney = (amount: number, options?: {
  showSymbol?: boolean;
}): string => {
  const formatted = new Intl.NumberFormat('vi-VN').format(amount);
  return options?.showSymbol !== false ? `${formatted} ₫` : formatted;
};

/**
 * Format duration from decimal hours to human-readable format
 * @param hours - Duration in decimal hours (e.g., 1.5 = 1h 30m)
 * @returns Formatted string like "1h 30m" or "45 phút"
 */
export const formatDuration = (hours: number): string => {
  if (hours <= 0) return '0 phút';

  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);

  if (h === 0) return `${m} phút`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};

