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

/**
 * Format invoice number to FY format: FF/2025-26/0025
 */
export const formatInvoiceNumber = (invoiceNum: number, invoiceDate: Date): string => {
  const year = invoiceDate.getFullYear();
  const month = invoiceDate.getMonth() + 1; // getMonth() is 0-indexed
  
  let fiscalYear: string;
  if (month >= 4) {
    // Apr-Dec: Use current year to next year
    const nextYearShort = (year + 1) % 100;
    fiscalYear = `${year}-${nextYearShort.toString().padStart(2, '0')}`;
  } else {
    // Jan-Mar: Use previous year to current year
    const currentYearShort = year % 100;
    fiscalYear = `${year - 1}-${currentYearShort.toString().padStart(2, '0')}`;
  }
  
  return `FF/${fiscalYear}/${invoiceNum.toString().padStart(4, '0')}`;
};

/**
 * Format invoice number using a configurable template
 * Supported placeholders:
 * - {fiscal_year}: FY format (e.g., 2025-26)
 * - {year}: Full year (e.g., 2025)
 * - {month}: Month (e.g., 01-12)
 * - {number}: Invoice number padded to 4 digits
 * - {number:X}: Invoice number padded to X digits (e.g., {number:6} for 6 digits)
 */
export const formatInvoiceNumberWithTemplate = (
  invoiceNum: number, 
  invoiceDate: Date, 
  template: string
): string => {
  const year = invoiceDate.getFullYear();
  const month = invoiceDate.getMonth() + 1;
  
  // Calculate fiscal year
  let fiscalYear: string;
  if (month >= 4) {
    const nextYearShort = (year + 1) % 100;
    fiscalYear = `${year}-${nextYearShort.toString().padStart(2, '0')}`;
  } else {
    const currentYearShort = year % 100;
    fiscalYear = `${year - 1}-${currentYearShort.toString().padStart(2, '0')}`;
  }
  
  // Replace placeholders
  let result = template
    .replace('{fiscal_year}', fiscalYear)
    .replace('{year}', year.toString())
    .replace('{month}', month.toString().padStart(2, '0'));
  
  // Handle {number:X} pattern for custom padding
  const numberPattern = /\{number:(\d+)\}/;
  const match = result.match(numberPattern);
  if (match) {
    const padding = parseInt(match[1]);
    result = result.replace(numberPattern, invoiceNum.toString().padStart(padding, '0'));
  } else {
    // Default to 4-digit padding
    result = result.replace('{number}', invoiceNum.toString().padStart(4, '0'));
  }
  
  return result;
};

/**
 * Mask bank account number (show only last 4 digits)
 * Example: XXXXXX8901
 */
export const maskBankAccount = (accountNumber: string): string => {
  if (!accountNumber || accountNumber.length < 4) return accountNumber;
  return 'X'.repeat(Math.max(0, accountNumber.length - 4)) + accountNumber.slice(-4);
};

/**
 * Group invoice items by HSN code for GST summary
 */
export const groupByHSN = (items: Array<{ hsn_code: string; quantity: number; amount: number }>) => {
  const grouped: Record<string, { qty: number; amount: number }> = {};
  
  items.forEach(item => {
    if (!grouped[item.hsn_code]) {
      grouped[item.hsn_code] = { qty: 0, amount: 0 };
    }
    grouped[item.hsn_code].qty += item.quantity;
    grouped[item.hsn_code].amount += item.amount;
  });
  
  return grouped;
};

/**
 * State GST codes mapping
 */
export const STATE_GST_CODES: Record<string, string> = {
  'Andaman and Nicobar Islands': '35',
  'Andhra Pradesh': '37',
  'Arunachal Pradesh': '12',
  'Assam': '18',
  'Bihar': '10',
  'Chandigarh': '04',
  'Chhattisgarh': '22',
  'Dadra and Nagar Haveli': '26',
  'Daman and Diu': '25',
  'Delhi': '07',
  'Goa': '30',
  'Gujarat': '24',
  'Haryana': '06',
  'Himachal Pradesh': '02',
  'Jammu and Kashmir': '01',
  'Jharkhand': '20',
  'Karnataka': '29',
  'Kerala': '32',
  'Ladakh': '38',
  'Lakshadweep': '31',
  'Madhya Pradesh': '23',
  'Maharashtra': '27',
  'Manipur': '14',
  'Meghalaya': '17',
  'Mizoram': '15',
  'Nagaland': '13',
  'Odisha': '21',
  'Puducherry': '34',
  'Punjab': '03',
  'Rajasthan': '08',
  'Sikkim': '11',
  'Tamil Nadu': '33',
  'Telangana': '36',
  'Tripura': '16',
  'Uttar Pradesh': '09',
  'Uttarakhand': '05',
  'West Bengal': '19',
};
