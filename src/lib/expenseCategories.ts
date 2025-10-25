export const EXPENSE_CATEGORIES = {
  branch_setup: {
    label: 'Branch Setup',
    subcategories: ['Cleaning Setup', 'Initial Setup', 'Documentation', 'Registration Fees']
  },
  electrical: {
    label: 'Electrical',
    subcategories: ['Wiring', 'Fitting', 'Lights', 'Switches', 'Circuit Breakers', 'Electrical Materials', 'Installation']
  },
  plumbing: {
    label: 'Plumbing',
    subcategories: ['Pipe Fitting', 'Tap Installation', 'Drainage', 'Water Tank', 'Plumbing Materials']
  },
  carpentry: {
    label: 'Carpentry',
    subcategories: ['Furniture', 'Shelving', 'Doors', 'Windows', 'Wooden Fittings', 'Materials']
  },
  painting: {
    label: 'Painting',
    subcategories: ['Wall Painting', 'Exterior Painting', 'Touch Up', 'Materials', 'Labour']
  },
  labour: {
    label: 'Labour',
    subcategories: ['Construction Labour', 'Helper', 'Skilled Labour', 'Overtime', 'Food & Accommodation']
  },
  materials: {
    label: 'Materials',
    subcategories: ['Construction Materials', 'Hardware', 'Tools', 'Safety Equipment', 'Miscellaneous']
  },
  equipment: {
    label: 'Equipment',
    subcategories: ['Machinery', 'Tools', 'Equipment Rental', 'Equipment Maintenance']
  },
  maintenance: {
    label: 'Maintenance',
    subcategories: ['Repair', 'Servicing', 'Replacement', 'AMC', 'Emergency Repair']
  },
  utilities: {
    label: 'Utilities',
    subcategories: ['Electricity Bill', 'Water Bill', 'Internet', 'Phone', 'Gas']
  },
  travel: {
    label: 'Travel',
    subcategories: ['Local Travel', 'Outstation Travel', 'Fuel', 'Vehicle Maintenance', 'Toll']
  },
  food: {
    label: 'Food',
    subcategories: ['Labour Food', 'Staff Meals', 'Client Entertainment', 'Refreshments']
  },
  office_supplies: {
    label: 'Office Supplies',
    subcategories: ['Stationery', 'Printing', 'Computer Supplies', 'Furniture']
  },
  rent: {
    label: 'Rent',
    subcategories: ['Building Rent', 'Equipment Rent', 'Vehicle Rent']
  },
  other: {
    label: 'Other',
    subcategories: ['Miscellaneous', 'Unforeseen Expenses', 'Other']
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
