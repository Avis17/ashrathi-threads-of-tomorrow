export const JOB_DEPARTMENTS = [
  "Cutting",
  "Stitching(Singer)",
  "Stitching(Powertable)",
  "Ironing",
  "Checking",
  "Packing",
  "Maintenance"
] as const;

export type JobDepartment = typeof JOB_DEPARTMENTS[number];
