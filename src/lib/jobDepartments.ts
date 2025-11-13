export const JOB_DEPARTMENTS = [
  "Cutting",
  "Stitching(Singer)",
  "Stitching(Powertable)",
  "Ironing",
  "Checking",
  "Packing",
  "Maintenance",
  "Complete Master"
] as const;

export type JobDepartment = typeof JOB_DEPARTMENTS[number];
