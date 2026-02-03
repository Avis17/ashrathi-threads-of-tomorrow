import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CMTQuotationData } from '@/types/cmt-quotation';
import { toast } from 'sonner';

export interface CMTQuotationRecord {
  id: string;
  quotation_no: string;
  date: string;
  valid_until: string;
  buyer_name: string;
  buyer_address: string | null;
  contact_person_name: string | null;
  contact_person_phone: string | null;
  style_name: string;
  style_code: string | null;
  fabric_type: string | null;
  gsm: string | null;
  fit_type: string | null;
  size_range: string | null;
  order_quantity: number;
  operations: any[];
  trims: any[];
  total_stitching_cost: number;
  finishing_packing_cost: number;
  overheads_cost: number;
  company_profit_percent: number;
  final_cmt_per_piece: number;
  total_order_value: number;
  terms_and_conditions: string | null;
  signatory_name: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
}

export function useCMTQuotations() {
  return useQuery({
    queryKey: ['cmt-quotations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cmt_quotations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as CMTQuotationRecord[];
    },
  });
}

export function useCMTQuotation(id: string | null) {
  return useQuery({
    queryKey: ['cmt-quotation', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('cmt_quotations')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as CMTQuotationRecord;
    },
    enabled: !!id,
  });
}

export function useSaveCMTQuotation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id?: string; data: CMTQuotationData }) => {
      const payload = {
        quotation_no: data.quotationNo,
        date: data.date,
        valid_until: data.validUntil,
        buyer_name: data.buyerName,
        buyer_address: data.buyerAddress,
        contact_person_name: data.contactPersonName,
        contact_person_phone: data.contactPersonPhone,
        style_name: data.styleName,
        style_code: data.styleCode,
        fabric_type: data.fabricType,
        gsm: data.gsm,
        fit_type: data.fitType,
        size_range: data.sizeRange,
        order_quantity: data.orderQuantity,
        operations: JSON.parse(JSON.stringify(data.operations)),
        trims: JSON.parse(JSON.stringify(data.trims)),
        total_stitching_cost: data.totalStitchingCost,
        finishing_packing_cost: data.finishingPackingCost,
        overheads_cost: data.overheadsCost,
        company_profit_percent: data.companyProfitPercent,
        final_cmt_per_piece: data.finalCMTPerPiece,
        total_order_value: data.totalOrderValue,
        terms_and_conditions: data.termsAndConditions,
        signatory_name: data.signatoryName,
      };

      if (id) {
        const { data: result, error } = await supabase
          .from('cmt_quotations')
          .update(payload)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return result;
      } else {
        const { data: result, error } = await supabase
          .from('cmt_quotations')
          .insert(payload)
          .select()
          .single();

        if (error) throw error;
        return result;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cmt-quotations'] });
      toast.success('Quotation saved successfully!');
    },
    onError: (error: any) => {
      console.error('Save error:', error);
      toast.error(error.message || 'Failed to save quotation');
    },
  });
}

export function useDeleteCMTQuotation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('cmt_quotations')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cmt-quotations'] });
      toast.success('Quotation deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete quotation');
    },
  });
}

export function recordToQuotationData(record: CMTQuotationRecord): CMTQuotationData {
  return {
    quotationNo: record.quotation_no,
    date: record.date,
    validUntil: record.valid_until,
    buyerName: record.buyer_name,
    buyerAddress: record.buyer_address || '',
    contactPersonName: record.contact_person_name || '',
    contactPersonPhone: record.contact_person_phone || '',
    styleName: record.style_name,
    styleCode: record.style_code || '',
    fabricType: record.fabric_type || '',
    gsm: record.gsm || '',
    fitType: record.fit_type || '',
    sizeRange: record.size_range || '',
    orderQuantity: record.order_quantity || 0,
    operations: record.operations || [],
    trims: record.trims || [],
    totalStitchingCost: Number(record.total_stitching_cost) || 0,
    finishingPackingCost: Number(record.finishing_packing_cost) || 0,
    overheadsCost: Number(record.overheads_cost) || 0,
    companyProfitPercent: Number(record.company_profit_percent) || 0,
    finalCMTPerPiece: Number(record.final_cmt_per_piece) || 0,
    totalOrderValue: Number(record.total_order_value) || 0,
    termsAndConditions: record.terms_and_conditions || '',
    signatoryName: record.signatory_name || 'For Feather Fashions',
  };
}
