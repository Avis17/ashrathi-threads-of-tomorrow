import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Json } from '@/integrations/supabase/types';

export interface ApprovedRates {
  operations: Array<{ category: string; machineType?: string; description?: string; rate: number }>;
  finishingPackingCost: number;
  overheadsCost: number;
  companyProfitPercent: number;
  finalCMTPerPiece: number;
}

interface UpdateStatusPayload {
  id: string;
  status: string;
  approved_rates?: ApprovedRates;
}

export function useUpdateCMTQuotationStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status, approved_rates }: UpdateStatusPayload) => {
      const payload: { status: string; approved_rates?: Json } = { status };
      
      if (approved_rates) {
        // Convert to JSON-compatible format
        payload.approved_rates = JSON.parse(JSON.stringify(approved_rates));
      }

      const { data, error } = await supabase
        .from('cmt_quotations')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cmt-quotations'] });
      queryClient.invalidateQueries({ queryKey: ['cmt-quotation'] });
      toast.success('Status updated successfully!');
    },
    onError: (error: any) => {
      console.error('Update status error:', error);
      toast.error(error.message || 'Failed to update status');
    },
  });
}
