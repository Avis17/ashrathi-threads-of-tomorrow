export interface CMTOperation {
  id: string;
  category: 'Cutting' | 'Stitching' | 'Finishing' | 'Packing' | 'Accessories' | 'Checking' | 'Special';
  machineType: string;
  description: string;
  smv: number;
  ratePerPiece: number;
  amount: number;
}

export interface CMTBuyerDetails {
  buyerName: string;
  buyerAddress: string;
  contactPersonName: string;
  contactPersonPhone: string;
}

export interface CMTTrim {
  id: string;
  trimName: string;
  providedBy: 'Buyer' | 'Manufacturer';
  remarks: string;
}

export interface CMTQuotationData {
  // Header
  quotationNo: string;
  date: string;
  validUntil: string;
  
  // Buyer Details
  buyerName: string;
  buyerAddress: string;
  contactPersonName: string;
  contactPersonPhone: string;
  
  // Style Details
  styleName: string;
  styleCode: string;
  fabricType: string;
  gsm: string;
  fitType: string;
  sizeRange: string;
  orderQuantity: number;
  
  // Operations
  operations: CMTOperation[];
  
  // Trims
  trims: CMTTrim[];
  
  // Cost Summary
  totalStitchingCost: number;
  finishingPackingCost: number;
  overheadsCost: number;
  finalCMTPerPiece: number;
  totalOrderValue: number;
  
  // Terms
  termsAndConditions: string;
  
  // Signatory
  signatoryName: string;
}

export const defaultTermsAndConditions = `1. Delivery Timeline: 15-20 working days from fabric receipt
2. Payment Terms: 50% advance, 50% before dispatch
3. Rejection Allowance: 2% maximum
4. Packing: Individual polybag with hangtag
5. Quality Standard: AQL 2.5 for major defects
6. Price Validity: 30 days from quotation date
7. Fabric & Trims: To be provided by buyer unless mentioned
8. Rate Revision: Subject to change based on order quantity variation`;

export const operationCategories = ['Cutting', 'Stitching', 'Finishing', 'Packing', 'Accessories', 'Checking', 'Special'] as const;

export const machineTypes = [
  'Single Needle',
  'Double Needle', 
  'Overlock 3T',
  'Overlock 4T',
  'Overlock 5T',
  'Flatlock',
  'Coverstitch',
  'Bartack',
  'Buttonhole',
  'Button Attach',
  'Feed Off Arm',
  'Kansai',
  'Manual',
  'Iron Press',
  'Cutting Machine',
  'Band Knife',
  'Fusing Machine'
] as const;
