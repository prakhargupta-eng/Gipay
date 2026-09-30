export const CURRENCY = '$';

/**
 * Formats a given amount into a standardized currency format (e.g. $1,000.00).
 * Handles numbers, strings, null, and undefined.
 */
export const formatCurrency = (amount: number | string | undefined | null): string => {
  if (amount == null) return `${CURRENCY}`;
  
  let strAmount = String(amount);
  
  // Strip currency symbol and non-numeric characters (except dot)
  let rawText = strAmount.replace(CURRENCY, '').replace(/[^0-9.]/g, '');
  
  if (rawText === '') return `${CURRENCY}`;
  if (rawText === '.') return `${CURRENCY}0.`;

  const parts = rawText.split('.');
  const whole = parts[0];
  const decimal = parts.length > 1 ? parts[1].slice(0, 2) : ''; // Limit to 2 decimals

  const formattedWhole = Number(whole).toLocaleString('en-US');

  if (parts.length > 1) {
    return `${CURRENCY}${formattedWhole}.${decimal}`;
  }
  
  return `${CURRENCY}${formattedWhole}`;
};
