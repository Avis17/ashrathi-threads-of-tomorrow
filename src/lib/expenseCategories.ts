export const EXPENSE_CATEGORIES = {
  branch_setup: {
    label: 'Branch Setup',
    subcategories: ['Cleaning Setup', 'Initial Setup', 'Documentation', 'Registration Fees', 'Advance Payment', 'Deposit']
  },
  electrical: {
    label: 'Electrical',
    subcategories: ['Wiring', 'Fitting', 'Lights', 'Switches', 'Circuit Breakers', 'Electrical Materials', 'Installation', 'Generator', 'UPS', 'Inverter']
  },
  plumbing: {
    label: 'Plumbing',
    subcategories: ['Pipe Fitting', 'Tap Installation', 'Drainage', 'Water Tank', 'Plumbing Materials', 'Water Purifier', 'Pump Installation']
  },
  carpentry: {
    label: 'Carpentry',
    subcategories: ['Furniture', 'Shelving', 'Doors', 'Windows', 'Wooden Fittings', 'Materials', 'Cabinets', 'Workbenches']
  },
  painting: {
    label: 'Painting',
    subcategories: ['Wall Painting', 'Exterior Painting', 'Touch Up', 'Materials', 'Labour', 'Primer', 'Finishing']
  },
  labour: {
    label: 'Labour',
    subcategories: ['Construction Labour', 'Helper', 'Skilled Labour', 'Overtime', 'Food & Accommodation', 'Supervisor', 'Contract Labour']
  },
  security: {
    label: 'Security & Surveillance',
    subcategories: ['CCTV Installation', 'CCTV Maintenance', 'Security Guard', 'Alarm System', 'Access Control', 'Monitoring System']
  },
  machinery: {
    label: 'Machinery & Equipment',
    subcategories: ['Sewing Machines', 'Cutting Machines', 'Pressing Equipment', 'Packaging Machines', 'Machine Maintenance', 'Machine Repair', 'Spare Parts']
  },
  raw_materials: {
    label: 'Raw Materials',
    subcategories: ['Fabrics', 'Threads', 'Buttons', 'Zippers', 'Labels', 'Tags', 'Packaging Materials', 'Elastic', 'Interlining']
  },
  materials_purchase: {
    label: 'Materials Purchase',
    subcategories: ['Construction Materials', 'Hardware', 'Tools', 'Safety Equipment', 'Miscellaneous', 'Consumables']
  },
  equipment: {
    label: 'Equipment',
    subcategories: ['Machinery', 'Tools', 'Equipment Rental', 'Equipment Maintenance', 'Equipment Purchase', 'Installation']
  },
  maintenance: {
    label: 'Maintenance',
    subcategories: ['Repair', 'Servicing', 'Replacement', 'AMC', 'Emergency Repair', 'Preventive Maintenance']
  },
  utilities: {
    label: 'Utilities',
    subcategories: ['Electricity Bill', 'Water Bill', 'Internet', 'Phone', 'Gas', 'Sewage', 'Waste Management']
  },
  travel: {
    label: 'Travel & Transport',
    subcategories: ['Local Travel', 'Outstation Travel', 'Fuel', 'Vehicle Maintenance', 'Toll', 'Parking', 'Vehicle Insurance']
  },
  food: {
    label: 'Food & Refreshments',
    subcategories: ['Labour Food', 'Staff Meals', 'Client Entertainment', 'Refreshments', 'Pantry Supplies']
  },
  office_supplies: {
    label: 'Office Supplies',
    subcategories: ['Stationery', 'Printing', 'Computer Supplies', 'Furniture', 'Software', 'IT Equipment']
  },
  rent: {
    label: 'Rent & Lease',
    subcategories: ['Building Rent', 'Equipment Rent', 'Vehicle Rent', 'Advance Rent Payment', 'Security Deposit']
  },
  professional_fees: {
    label: 'Professional Fees',
    subcategories: ['Consultant Fees', 'Legal Fees', 'Audit Fees', 'Architect Fees', 'Design Fees', 'Training Fees']
  },
  marketing: {
    label: 'Marketing & Advertising',
    subcategories: ['Advertising', 'Branding', 'Marketing Materials', 'Website', 'Social Media', 'Events']
  },
  insurance: {
    label: 'Insurance',
    subcategories: ['Building Insurance', 'Equipment Insurance', 'Vehicle Insurance', 'Employee Insurance', 'Liability Insurance']
  },
  other: {
    label: 'Other',
    subcategories: ['Miscellaneous', 'Unforeseen Expenses', 'Other', 'Contingency']
  }
} as const;

export const PAYMENT_METHODS = [
  'cash',
  'bank_transfer',
  'cheque',
  'upi',
  'credit_card',
  'debit_card'
] as const;
