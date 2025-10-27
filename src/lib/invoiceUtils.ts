// Invoice utility functions

/**
 * Format currency in Indian Rupee format with proper spacing
 */
export const formatCurrency = (amount: number): string => {
  return `₹${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

/**
 * Convert number to Indian currency words
 */
export const numberToWords = (num: number): string => {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

  const convertLessThanThousand = (n: number): string => {
    if (n === 0) return '';
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
    return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convertLessThanThousand(n % 100) : '');
  };

  if (num === 0) return 'Zero';

  const crore = Math.floor(num / 10000000);
  const lakh = Math.floor((num % 10000000) / 100000);
  const thousand = Math.floor((num % 100000) / 1000);
  const remainder = num % 1000;

  let result = '';
  if (crore > 0) result += convertLessThanThousand(crore) + ' Crore ';
  if (lakh > 0) result += convertLessThanThousand(lakh) + ' Lakh ';
  if (thousand > 0) result += convertLessThanThousand(thousand) + ' Thousand ';
  if (remainder > 0) result += convertLessThanThousand(remainder);

  return result.trim();
};

/**
 * Sanitize text for jsPDF: normalize spaces and remove non-ASCII glyphs
 */
export const sanitizePdfText = (text: string): string => {
  if (text == null) return '';
  const normalized = String(text).replace(/[\u00A0\u202F\u2009\u200A\u200B]/g, ' ');
  // Keep printable ASCII only (space to ~)
  return normalized.replace(/[^ -~]/g, '');
};

// Indian number grouping for integers (e.g., 12,34,567)
const toIndianGrouping = (intStr: string): string => {
  if (!intStr) return '0';
  if (intStr.length <= 3) return intStr;
  const last3 = intStr.slice(-3);
  const lead = intStr.slice(0, -3);
  const leadGrouped = lead.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  return `${leadGrouped},${last3}`;
};

/**
 * ASCII-only currency formatter for PDFs (avoids ₹ glyph issues)
 * Example: Rs 1,23,456.78
 */
export const formatCurrencyAscii = (amount: number): string => {
  const n = Number.isFinite(amount) ? amount : 0;
  const sign = n < 0 ? '-' : '';
  const s = Math.abs(n).toFixed(2);
  const [intPart, frac] = s.split('.');
  const grouped = toIndianGrouping(intPart);
  return sanitizePdfText(`${sign}Rs ${grouped}.${frac}`);
};
