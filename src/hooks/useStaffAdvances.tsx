import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface StaffAdvance {
  id: string;
  staff_id: string;
  amount: number;
  remaining_amount: number;
  advance_date: string;
  status: string;
  notes: string | null;
  created_at: string;
}

export interface StaffWeeklyPayout {
  id: string;
  staff_id: string;
  week_start_date: string;
  week_end_date: string;
  daily_rate: number;
  total_days: number;
  absent_days: number;
  working_days: number;
  gross_salary: number;
  advance_deducted: number;
  net_paid: number;
  payment_date: string;
  payment_mode: string | null;
  notes: string | null;
  created_at: string;
}

export interface StaffAdvanceDeduction {
  id: string;
  payout_id: string;
  advance_id: string;
  amount_deducted: number;
  created_at: string;
}

// ─── Advances ───

export const useStaffAdvances = (staffId: string) => {
  return useQuery({
    queryKey: ['staff-advances', staffId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('staff_advances')
        .select('*')
        .eq('staff_id', staffId)
        .order('advance_date', { ascending: false });
      if (error) throw error;
      return data as StaffAdvance[];
    },
    enabled: !!staffId,
  });
};

export const useCreateStaffAdvance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { staff_id: string; amount: number; advance_date: string; notes?: string }) => {
      const { data: advance, error } = await supabase
        .from('staff_advances')
        .insert([{ ...data, remaining_amount: data.amount, status: 'pending' }])
        .select()
        .single();
      if (error) throw error;
      return advance;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['staff-advances', variables.staff_id] });
      toast.success('Advance recorded');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to record advance');
    },
  });
};

export const useDeleteStaffAdvance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, staffId }: { id: string; staffId: string }) => {
      const { error } = await supabase.from('staff_advances').delete().eq('id', id);
      if (error) throw error;
      return staffId;
    },
    onSuccess: (staffId) => {
      queryClient.invalidateQueries({ queryKey: ['staff-advances', staffId] });
      toast.success('Advance deleted');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete advance');
    },
  });
};

// ─── Weekly Payouts ───

export const useStaffWeeklyPayouts = (staffId: string) => {
  return useQuery({
    queryKey: ['staff-weekly-payouts', staffId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('staff_weekly_payouts')
        .select('*')
        .eq('staff_id', staffId)
        .order('week_end_date', { ascending: false });
      if (error) throw error;
      return data as StaffWeeklyPayout[];
    },
    enabled: !!staffId,
  });
};

export const useCreateStaffWeeklyPayout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      payout: Omit<StaffWeeklyPayout, 'id' | 'created_at'>;
      deductions: { advance_id: string; amount_deducted: number }[];
      salaryEntries: { staff_id: string; entry_date: string; amount: number; category: string; notes?: string }[];
    }) => {
      // 1. Create payout
      const { data: payout, error: payoutError } = await supabase
        .from('staff_weekly_payouts')
        .insert([data.payout])
        .select()
        .single();
      if (payoutError) throw payoutError;

      // 2. Create advance deductions and update advance remaining amounts
      for (const ded of data.deductions) {
        const { error: dedError } = await supabase
          .from('staff_advance_deductions')
          .insert([{ payout_id: payout.id, advance_id: ded.advance_id, amount_deducted: ded.amount_deducted }]);
        if (dedError) throw dedError;

        // Update advance remaining_amount
        const { data: advance, error: advFetchErr } = await supabase
          .from('staff_advances')
          .select('remaining_amount')
          .eq('id', ded.advance_id)
          .single();
        if (advFetchErr) throw advFetchErr;

        const newRemaining = (advance.remaining_amount as number) - ded.amount_deducted;
        const { error: advUpdateErr } = await supabase
          .from('staff_advances')
          .update({
            remaining_amount: newRemaining,
            status: newRemaining <= 0 ? 'fully_deducted' : 'partially_deducted',
          })
          .eq('id', ded.advance_id);
        if (advUpdateErr) throw advUpdateErr;
      }

      // 3. Create salary entries for each working day on the calendar
      if (data.salaryEntries.length > 0) {
        for (const entry of data.salaryEntries) {
          const { error: entryErr } = await supabase
            .from('staff_salary_entries')
            .insert([entry]);
          if (entryErr) throw entryErr;
        }
      }

      return payout;
    },
    onSuccess: (_, variables) => {
      const staffId = variables.payout.staff_id;
      queryClient.invalidateQueries({ queryKey: ['staff-weekly-payouts', staffId] });
      queryClient.invalidateQueries({ queryKey: ['staff-advances', staffId] });
      queryClient.invalidateQueries({ queryKey: ['staff-salary-entries', staffId] });
      toast.success('Weekly payout recorded successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to record weekly payout');
    },
  });
};

export const useDeleteStaffWeeklyPayout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, staffId }: { id: string; staffId: string }) => {
      // Delete the payout (cascade will delete deductions)
      // But we need to restore advance amounts first
      const { data: deductions } = await supabase
        .from('staff_advance_deductions')
        .select('*')
        .eq('payout_id', id);

      if (deductions) {
        for (const ded of deductions) {
          const { data: advance } = await supabase
            .from('staff_advances')
            .select('remaining_amount, amount')
            .eq('id', ded.advance_id)
            .single();
          if (advance) {
            const newRemaining = Math.min((advance.remaining_amount as number) + (ded.amount_deducted as number), advance.amount as number);
            await supabase
              .from('staff_advances')
              .update({
                remaining_amount: newRemaining,
                status: newRemaining >= (advance.amount as number) ? 'pending' : 'partially_deducted',
              })
              .eq('id', ded.advance_id);
          }
        }
      }

      // Get payout to know dates for salary entry cleanup
      const { data: payout } = await supabase
        .from('staff_weekly_payouts')
        .select('*')
        .eq('id', id)
        .single();

      if (payout) {
        // Delete salary entries created for this payout's date range
        await supabase
          .from('staff_salary_entries')
          .delete()
          .eq('staff_id', staffId)
          .eq('category', 'Salary')
          .gte('entry_date', payout.week_start_date)
          .lte('entry_date', payout.week_end_date);
      }

      const { error } = await supabase.from('staff_weekly_payouts').delete().eq('id', id);
      if (error) throw error;
      return staffId;
    },
    onSuccess: (staffId) => {
      queryClient.invalidateQueries({ queryKey: ['staff-weekly-payouts', staffId] });
      queryClient.invalidateQueries({ queryKey: ['staff-advances', staffId] });
      queryClient.invalidateQueries({ queryKey: ['staff-salary-entries', staffId] });
      toast.success('Payout deleted and advances restored');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete payout');
    },
  });
};
