import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface StaffMember {
  id: string;
  employee_id: string;
  salary_type: string | null;
  salary_amount: number | null;
  joined_date: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  employee?: {
    id: string;
    name: string;
    phone: string | null;
    employee_code: string;
    departments: string[] | null;
    is_active: boolean;
  };
}

export interface StaffSalaryEntry {
  id: string;
  staff_id: string;
  entry_date: string;
  amount: number;
  category: string;
  notes: string | null;
  created_at: string;
}

export interface StaffAbsence {
  id: string;
  staff_id: string;
  from_date: string;
  to_date: string;
  reason: string | null;
  created_at: string;
}

export const useStaffMembers = () => {
  return useQuery({
    queryKey: ['staff-members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('staff_members')
        .select('*, employee:job_employees(id, name, phone, employee_code, departments, is_active)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as unknown as StaffMember[];
    },
  });
};

export const useStaffMember = (id: string) => {
  return useQuery({
    queryKey: ['staff-member', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('staff_members')
        .select('*, employee:job_employees(id, name, phone, employee_code, departments, is_active)')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as unknown as StaffMember;
    },
    enabled: !!id,
  });
};

export const useCreateStaffMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { employee_id: string; salary_type?: string; salary_amount?: number; joined_date?: string; notes?: string }) => {
      const { data: staff, error } = await supabase
        .from('staff_members')
        .insert([data])
        .select()
        .single();
      if (error) throw error;
      return staff;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-members'] });
      toast.success('Staff member added successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add staff member');
    },
  });
};

export const useStaffSalaryEntries = (staffId: string) => {
  return useQuery({
    queryKey: ['staff-salary-entries', staffId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('staff_salary_entries')
        .select('*')
        .eq('staff_id', staffId)
        .order('entry_date', { ascending: false });
      if (error) throw error;
      return data as StaffSalaryEntry[];
    },
    enabled: !!staffId,
  });
};

export const useCreateStaffSalaryEntry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { staff_id: string; entry_date: string; amount: number; category: string; notes?: string }) => {
      const { data: entry, error } = await supabase
        .from('staff_salary_entries')
        .insert([data])
        .select()
        .single();
      if (error) throw error;
      return entry;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['staff-salary-entries', variables.staff_id] });
      toast.success('Salary entry added');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add salary entry');
    },
  });
};

export const useDeleteStaffSalaryEntry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, staffId }: { id: string; staffId: string }) => {
      const { error } = await supabase.from('staff_salary_entries').delete().eq('id', id);
      if (error) throw error;
      return staffId;
    },
    onSuccess: (staffId) => {
      queryClient.invalidateQueries({ queryKey: ['staff-salary-entries', staffId] });
      toast.success('Entry deleted');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete entry');
    },
  });
};

export const useStaffAbsences = (staffId: string) => {
  return useQuery({
    queryKey: ['staff-absences', staffId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('staff_absences')
        .select('*')
        .eq('staff_id', staffId)
        .order('from_date', { ascending: false });
      if (error) throw error;
      return data as StaffAbsence[];
    },
    enabled: !!staffId,
  });
};

export const useCreateStaffAbsence = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { staff_id: string; from_date: string; to_date: string; reason?: string }) => {
      const { data: absence, error } = await supabase
        .from('staff_absences')
        .insert([data])
        .select()
        .single();
      if (error) throw error;
      return absence;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['staff-absences', variables.staff_id] });
      toast.success('Absence recorded');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to record absence');
    },
  });
};

export const useDeleteStaffAbsence = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, staffId }: { id: string; staffId: string }) => {
      const { error } = await supabase.from('staff_absences').delete().eq('id', id);
      if (error) throw error;
      return staffId;
    },
    onSuccess: (staffId) => {
      queryClient.invalidateQueries({ queryKey: ['staff-absences', staffId] });
      toast.success('Absence deleted');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete absence');
    },
  });
};

export const STAFF_SALARY_CATEGORIES = [
  'Salary',
  'Food',
  'Accommodation',
  'Transport',
  'Beverage',
  'Cosmetics',
  'Medical',
  'Advance',
  'Bonus',
  'Overtime',
  'Festival Bonus',
  'Clothing',
  'Phone Recharge',
  'Personal Loan',
  'Grocery',
  'Other',
] as const;
