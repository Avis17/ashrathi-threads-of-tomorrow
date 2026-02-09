import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// E-Way Bill types
export interface EwayBill {
  id: string;
  delivery_challan_id: string;
  eway_bill_no: string | null;
  eway_bill_date: string | null;
  valid_upto: string | null;
  generated_by_gstin: string | null;
  supply_type: string | null;
  mode: string | null;
  approx_distance: string | null;
  transaction_type: string | null;
  from_name: string | null;
  from_gstin: string | null;
  from_state: string | null;
  from_address: string | null;
  to_name: string | null;
  to_gstin: string | null;
  to_state: string | null;
  to_address: string | null;
  dispatch_from: string | null;
  ship_to: string | null;
  hsn_code: string | null;
  product_description: string | null;
  quantity: number;
  uom: string | null;
  taxable_amount: number;
  tax_rate_cgst: number;
  tax_rate_sgst: number;
  cgst_amount: number;
  sgst_amount: number;
  other_amount: number;
  total_invoice_amount: number;
  tax_invoice_no: string | null;
  tax_invoice_date: string | null;
  irn: string | null;
  ack_no: string | null;
  ack_date: string | null;
  transporter_id: string | null;
  transporter_name: string | null;
  doc_no: string | null;
  doc_date: string | null;
  vehicle_no: string | null;
  vehicle_from: string | null;
  cewb_no: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Production Plan types
export interface ProductionPlan {
  id: string;
  delivery_challan_id: string;
  pgm_no: string | null;
  plan_date: string | null;
  follow_up_by: string | null;
  supplier: string | null;
  ic_no: string | null;
  item_name: string | null;
  sizes: string | null;
  side_cut_style: string | null;
  fabric_details: string | null;
  original_pattern: boolean;
  traced_pattern: boolean;
  original_sample: boolean;
  first_sample_approval: boolean;
  main_label: boolean;
  care_label: boolean;
  fusing_sticker: boolean;
  flag_label: boolean;
  rope: boolean;
  button: boolean;
  metal_badges: boolean;
  zippers: boolean;
  follow_up_person: string | null;
  qc_person: string | null;
  others_detail: string | null;
  print_detail: string | null;
  embroidery_detail: string | null;
  stone_detail: string | null;
  fusing_detail: string | null;
  coin_detail: string | null;
  others_post_production: string | null;
  packing_type: string | null;
  poly_bag: boolean;
  atta: boolean;
  photo: boolean;
  tag: boolean;
  box: boolean;
  special_instructions: string | null;
  seal_original: boolean;
  mchart_original: boolean;
  ic_original: boolean;
  name_original: string | null;
  sign_original: string | null;
  seal_traced: boolean;
  mchart_traced: boolean;
  ic_traced: boolean;
  name_traced: string | null;
  sign_traced: string | null;
  authorised_sign_1: string | null;
  authorised_sign_2: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// E-Way Bill hooks
export const useEwayBills = (dcId: string) => {
  return useQuery({
    queryKey: ['eway-bills', dcId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dc_eway_bills')
        .select('*')
        .eq('delivery_challan_id', dcId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as EwayBill[];
    },
    enabled: !!dcId,
  });
};

export const useEwayBill = (id: string) => {
  return useQuery({
    queryKey: ['eway-bill', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dc_eway_bills')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as EwayBill;
    },
    enabled: !!id,
  });
};

export const useSaveEwayBill = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<EwayBill> & { delivery_challan_id: string }) => {
      if (id) {
        const { data: result, error } = await supabase
          .from('dc_eway_bills')
          .update(data)
          .eq('id', id)
          .select()
          .single();
        if (error) throw error;
        return result as EwayBill;
      } else {
        const { data: result, error } = await supabase
          .from('dc_eway_bills')
          .insert(data)
          .select()
          .single();
        if (error) throw error;
        return result as EwayBill;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['eway-bills', data.delivery_challan_id] });
      queryClient.invalidateQueries({ queryKey: ['eway-bill', data.id] });
      toast.success('E-Way Bill saved successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to save E-Way Bill: ' + error.message);
    },
  });
};

export const useDeleteEwayBill = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, dcId }: { id: string; dcId: string }) => {
      const { error } = await supabase.from('dc_eway_bills').delete().eq('id', id);
      if (error) throw error;
      return dcId;
    },
    onSuccess: (dcId) => {
      queryClient.invalidateQueries({ queryKey: ['eway-bills', dcId] });
      toast.success('E-Way Bill deleted');
    },
    onError: (error: Error) => {
      toast.error('Failed to delete: ' + error.message);
    },
  });
};

// Production Plan hooks
export const useProductionPlans = (dcId: string) => {
  return useQuery({
    queryKey: ['production-plans', dcId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dc_production_plans')
        .select('*')
        .eq('delivery_challan_id', dcId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as ProductionPlan[];
    },
    enabled: !!dcId,
  });
};

export const useProductionPlan = (id: string) => {
  return useQuery({
    queryKey: ['production-plan', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dc_production_plans')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as ProductionPlan;
    },
    enabled: !!id,
  });
};

export const useSaveProductionPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<ProductionPlan> & { delivery_challan_id: string }) => {
      if (id) {
        const { data: result, error } = await supabase
          .from('dc_production_plans')
          .update(data)
          .eq('id', id)
          .select()
          .single();
        if (error) throw error;
        return result as ProductionPlan;
      } else {
        const { data: result, error } = await supabase
          .from('dc_production_plans')
          .insert(data)
          .select()
          .single();
        if (error) throw error;
        return result as ProductionPlan;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['production-plans', data.delivery_challan_id] });
      queryClient.invalidateQueries({ queryKey: ['production-plan', data.id] });
      toast.success('Production Planning Sheet saved successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to save: ' + error.message);
    },
  });
};

export const useDeleteProductionPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, dcId }: { id: string; dcId: string }) => {
      const { error } = await supabase.from('dc_production_plans').delete().eq('id', id);
      if (error) throw error;
      return dcId;
    },
    onSuccess: (dcId) => {
      queryClient.invalidateQueries({ queryKey: ['production-plans', dcId] });
      toast.success('Production Plan deleted');
    },
    onError: (error: Error) => {
      toast.error('Failed to delete: ' + error.message);
    },
  });
};
