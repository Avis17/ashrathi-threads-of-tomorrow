export interface DeliveryChallan {
  id: string;
  dc_number: string;
  dc_date: string;
  dc_type: 'job_work' | 'return' | 'rework';
  purpose: 'stitching' | 'ironing' | 'packing' | 'embroidery' | 'printing';
  purposes?: string[];
  job_work_direction: 'given' | 'taken';
  job_worker_name: string;
  job_worker_address?: string;
  job_worker_gstin?: string;
  vehicle_number: string;
  driver_name: string;
  driver_mobile: string;
  expected_return_date?: string;
  total_quantity: number;
  status: 'created' | 'dispatched' | 'closed';
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface DeliveryChallanItem {
  id: string;
  delivery_challan_id: string;
  product_name: string;
  sku?: string;
  size?: string;
  color?: string;
  quantity: number;
  uom: 'pcs' | 'kg';
  remarks?: string;
  created_at: string;
}

export interface JobWorker {
  id: string;
  name: string;
  address?: string;
  gstin?: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateDeliveryChallanInput {
  dc_date: string;
  dc_type: 'job_work' | 'return' | 'rework';
  purpose: 'stitching' | 'ironing' | 'packing' | 'embroidery' | 'printing';
  purposes: string[];
  job_work_direction: 'given' | 'taken';
  job_worker_name: string;
  job_worker_address?: string;
  job_worker_gstin?: string;
  vehicle_number: string;
  driver_name: string;
  driver_mobile: string;
  expected_return_date?: string;
  notes?: string;
  items: Omit<DeliveryChallanItem, 'id' | 'delivery_challan_id' | 'created_at'>[];
}

export const DC_TYPE_LABELS: Record<DeliveryChallan['dc_type'], string> = {
  job_work: 'Job Work (Outbound)',
  return: 'Return (Inbound)',
  rework: 'Rework',
};

export const PURPOSE_LABELS: Record<DeliveryChallan['purpose'], string> = {
  stitching: 'Stitching',
  ironing: 'Ironing',
  packing: 'Packing',
  embroidery: 'Embroidery',
  printing: 'Printing',
};

export const STATUS_LABELS: Record<DeliveryChallan['status'], string> = {
  created: 'Created',
  dispatched: 'Dispatched',
  closed: 'Closed',
};

export const JOB_WORK_DIRECTION_LABELS: Record<DeliveryChallan['job_work_direction'], string> = {
  given: 'Job Work Given',
  taken: 'Job Work Taken',
};

export const JOB_WORK_DIRECTION_DESCRIPTIONS: Record<DeliveryChallan['job_work_direction'], string> = {
  given: 'We send work to job workers',
  taken: 'We receive work from companies',
};
