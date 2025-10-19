export const DEPARTMENTS = [
  "Tailoring",
  "Cutting",
  "Packing",
  "Quality Control",
  "Finishing",
  "Embroidery",
  "Printing",
  "Warehouse",
  "Dispatch",
  "Maintenance",
  "Administration",
  "Sales",
  "Design",
  "Production Planning",
  "Other"
] as const;

export type Department = typeof DEPARTMENTS[number];
