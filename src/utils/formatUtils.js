/**
 * Format a date string to a more readable format
 * @param {string} dateString - ISO date string
 * @return {string} Formatted date string
 */
export const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    return 'Invalid date';
  }
};

/**
 * Format a number as a currency value
 * @param {number} value - The value to format
 * @return {string} Formatted currency string
 */
export const formatCurrency = (value) => {
  if (value === null || value === undefined) return '$0';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};