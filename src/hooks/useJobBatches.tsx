import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';

export type JobBatch = Database['public']['Tables']['job_batches']['Row'];

export const useJobBatches = () => {
  return useQuery({
    queryKey: ['job-batches'],
    queryFn: async () => {
      const [
        { data: batches, error },
        { data: cuttingTotals, error: cutError },
        { data: cuttingByStyle, error: cutStyleError },
        { data: payments, error: payError },
        { data: salaryEntries, error: salError },
        { data: advances, error: advError },
        { data: expenses, error: expError },
        { data: jobWorks, error: jwError },
        { data: allStyles, error: styError },
        { data: typeConfirmed, error: tcError },
      ] = await Promise.all([
        supabase.from('job_batches').select('*, job_styles(style_name, style_code)').order('date_created', { ascending: false }),
        supabase.from('batch_cutting_logs').select('batch_id, pieces_cut'),
        supabase.from('batch_cutting_logs').select('batch_id, style_id, pieces_cut'),
        supabase.from('batch_payments').select('batch_id, amount'),
        supabase.from('batch_salary_entries').select('batch_id, rate_per_piece, quantity'),
        supabase.from('batch_salary_advances').select('batch_id, amount'),
        supabase.from('job_batch_expenses').select('batch_id, amount'),
        supabase.from('batch_job_works').select('batch_id, total_amount, paid_amount'),
        supabase.from('job_styles').select('id, style_name, style_code'),
        supabase.from('batch_type_confirmed' as any).select('batch_id, delivery_status, actual_delivery_date'),
      ]);
      if (error) throw error;

      // Build style lookup
      const styleLookup: Record<string, { style_name: string; style_code: string }> = {};
      allStyles?.forEach((s: any) => { styleLookup[s.id] = { style_name: s.style_name, style_code: s.style_code }; });

      // Aggregate cutting totals per batch
      const cutMap: Record<string, number> = {};
      cuttingTotals?.forEach((l: any) => { cutMap[l.batch_id] = (cutMap[l.batch_id] || 0) + l.pieces_cut; });

      // Aggregate cutting by style per batch
      const cutByStyleMap: Record<string, Record<string, number>> = {};
      cuttingByStyle?.forEach((l: any) => {
        if (!cutByStyleMap[l.batch_id]) cutByStyleMap[l.batch_id] = {};
        if (l.style_id) {
          cutByStyleMap[l.batch_id][l.style_id] = (cutByStyleMap[l.batch_id][l.style_id] || 0) + l.pieces_cut;
        }
      });

      // Aggregate payments per batch
      const payMap: Record<string, number> = {};
      payments?.forEach((p: any) => { payMap[p.batch_id] = (payMap[p.batch_id] || 0) + Number(p.amount); });

      // Aggregate salary per batch
      const salMap: Record<string, number> = {};
      salaryEntries?.forEach((s: any) => { salMap[s.batch_id] = (salMap[s.batch_id] || 0) + (s.rate_per_piece * s.quantity); });

      // Aggregate advances per batch
      const advMap: Record<string, number> = {};
      advances?.forEach((a: any) => { advMap[a.batch_id] = (advMap[a.batch_id] || 0) + Number(a.amount); });

      // Aggregate expenses per batch
      const expMap: Record<string, number> = {};
      expenses?.forEach((e: any) => { expMap[e.batch_id] = (expMap[e.batch_id] || 0) + Number(e.amount); });

      // Aggregate job works per batch
      const jwMap: Record<string, { total: number; paid: number }> = {};
      jobWorks?.forEach((jw: any) => {
        if (!jwMap[jw.batch_id]) jwMap[jw.batch_id] = { total: 0, paid: 0 };
        jwMap[jw.batch_id].total += Number(jw.total_amount);
        jwMap[jw.batch_id].paid += Number(jw.paid_amount);
      });

      // Aggregate delivery status per batch + per type_index
      const deliveryMap: Record<string, { in_progress: number; completed: number; delivered: number; latest_delivery_date: string | null }> = {};
      // Map: batch_id → type_index → { status, actual_delivery_date }
      const deliveryByTypeIndex: Record<string, Record<number, { status: string; actual_delivery_date: string | null }>> = {};
      (typeConfirmed as any[] || []).forEach((tc: any) => {
        if (!deliveryMap[tc.batch_id]) deliveryMap[tc.batch_id] = { in_progress: 0, completed: 0, delivered: 0, latest_delivery_date: null };
        if (!deliveryByTypeIndex[tc.batch_id]) deliveryByTypeIndex[tc.batch_id] = {};
        deliveryByTypeIndex[tc.batch_id][tc.type_index] = { status: tc.delivery_status || 'in_progress', actual_delivery_date: tc.actual_delivery_date || null };
        const status = tc.delivery_status || 'in_progress';
        if (status === 'in_progress') deliveryMap[tc.batch_id].in_progress++;
        else if (status === 'completed') deliveryMap[tc.batch_id].completed++;
        else if (status === 'delivered') {
          deliveryMap[tc.batch_id].delivered++;
          if (tc.actual_delivery_date) {
            if (!deliveryMap[tc.batch_id].latest_delivery_date || tc.actual_delivery_date > deliveryMap[tc.batch_id].latest_delivery_date!) {
              deliveryMap[tc.batch_id].latest_delivery_date = tc.actual_delivery_date;
            }
          }
        }
      });

      return (batches || []).map((b: any) => {
        // Extract unique styles from rolls_data
        const rollsData = (b.rolls_data || []) as any[];
        const styleIds = [...new Set(rollsData.map((r: any) => r.style_id).filter(Boolean))] as string[];
        const batchStyles = styleIds.map(id => styleLookup[id]).filter(Boolean);

        // Style-wise cutting breakdown
        const styleCutBreakdown = cutByStyleMap[b.id] || {};
        const styleQuantities = styleIds.map(id => ({
          ...styleLookup[id],
          pieces: styleCutBreakdown[id] || 0,
        })).filter(s => s.style_name);

        // Get estimated delivery from rolls_data
        const estimatedDates = rollsData.map((r: any) => r.estimated_delivery).filter(Boolean);
        const estimatedDelivery = estimatedDates.length > 0 ? estimatedDates[0] : null;

        // Per-style delivery timing: group type_indices by style_id, compute diff per style
        const batchDeliveryByType = deliveryByTypeIndex[b.id] || {};
        const styleDeliveryMap: Record<string, { style_name: string; style_code: string; status: string; actual_delivery_date: string | null; estimated_delivery: string | null }[]> = {};
        rollsData.forEach((r: any, idx: number) => {
          if (!r.style_id) return;
          const styleInfo = styleLookup[r.style_id];
          if (!styleInfo) return;
          const typeData = batchDeliveryByType[idx] || { status: 'in_progress', actual_delivery_date: null };
          if (!styleDeliveryMap[r.style_id]) styleDeliveryMap[r.style_id] = [];
          styleDeliveryMap[r.style_id].push({
            ...styleInfo,
            status: typeData.status,
            actual_delivery_date: typeData.actual_delivery_date,
            estimated_delivery: r.estimated_delivery || null,
          });
        });

        // Aggregate per-style: pick latest actual and earliest estimated
        const styleDeliveryAnalysis = Object.entries(styleDeliveryMap).map(([styleId, entries]) => {
          const anyDelivered = entries.some(e => e.status === 'delivered');
          const latestActual = entries
            .filter(e => e.actual_delivery_date)
            .sort((a, b) => (b.actual_delivery_date! > a.actual_delivery_date! ? 1 : -1))[0]?.actual_delivery_date || null;
          const firstEstimated = entries.find(e => e.estimated_delivery)?.estimated_delivery || null;
          const overallStatus = anyDelivered ? 'delivered'
            : entries.some(e => e.status === 'completed') ? 'completed'
            : 'in_progress';
          return {
            style_id: styleId,
            style_name: entries[0].style_name,
            style_code: entries[0].style_code,
            status: overallStatus,
            actual_delivery_date: latestActual,
            estimated_delivery: firstEstimated,
          };
        });

        return {
          ...b,
          total_cut_pieces: cutMap[b.id] || 0,
          batch_styles: batchStyles,
          style_quantities: styleQuantities,
          total_payments: payMap[b.id] || 0,
          total_salary: salMap[b.id] || 0,
          total_advances: advMap[b.id] || 0,
          total_expenses: expMap[b.id] || 0,
          total_job_work: jwMap[b.id]?.total || 0,
          total_job_work_paid: jwMap[b.id]?.paid || 0,
          delivery_summary: deliveryMap[b.id] || null,
          estimated_delivery: estimatedDelivery,
          style_delivery_analysis: styleDeliveryAnalysis,
        };
      });
    },
  });
};

export const useJobBatch = (id: string) => {
  return useQuery({
    queryKey: ['job-batch', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_batches')
        .select('*, job_styles(*)')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
};

export const useCreateJobBatch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Database['public']['Tables']['job_batches']['Insert']) => {
      const { data: batch, error } = await supabase
        .from('job_batches')
        .insert([data])
        .select()
        .single();
      if (error) throw error;
      return batch;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-batches'] });
      toast.success('Batch created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create batch');
    },
  });
};

export const useUpdateJobBatch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Database['public']['Tables']['job_batches']['Update'] }) => {
      const { data: batch, error } = await supabase
        .from('job_batches')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return batch;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-batches'] });
      queryClient.invalidateQueries({ queryKey: ['job-batch'] });
      toast.success('Batch updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update batch');
    },
  });
};

export const useDeleteJobBatch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('job_batches')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-batches'] });
      toast.success('Batch deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete batch');
    },
  });
};
