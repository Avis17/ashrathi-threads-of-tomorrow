import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface EmployeeReview {
  id: string;
  employee_id: string;
  review_month: number;
  review_year: number;
  rating: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const useEmployeeReviews = (employeeId: string) => {
  return useQuery({
    queryKey: ['employee-reviews', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_employee_reviews')
        .select('*')
        .eq('employee_id', employeeId)
        .order('review_year', { ascending: false })
        .order('review_month', { ascending: false });
      if (error) throw error;
      return data as EmployeeReview[];
    },
    enabled: !!employeeId,
  });
};

export const useAllEmployeeReviews = () => {
  return useQuery({
    queryKey: ['all-employee-reviews'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_employee_reviews')
        .select('*');
      if (error) throw error;
      return data as EmployeeReview[];
    },
  });
};

export const useCreateEmployeeReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      employee_id: string;
      review_month: number;
      review_year: number;
      rating: number;
      notes?: string;
    }) => {
      const { data: review, error } = await supabase
        .from('job_employee_reviews')
        .insert([data])
        .select()
        .single();
      if (error) throw error;
      return review;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['employee-reviews', variables.employee_id] });
      queryClient.invalidateQueries({ queryKey: ['all-employee-reviews'] });
      toast.success('Review added successfully');
    },
    onError: (error: any) => {
      if (error.code === '23505') {
        toast.error('A review for this month already exists');
      } else {
        toast.error(error.message || 'Failed to add review');
      }
    },
  });
};

export const useUpdateEmployeeReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<EmployeeReview> }) => {
      const { data: review, error } = await supabase
        .from('job_employee_reviews')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return review;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['all-employee-reviews'] });
      toast.success('Review updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update review');
    },
  });
};

export const useDeleteEmployeeReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('job_employee_reviews')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['all-employee-reviews'] });
      toast.success('Review deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete review');
    },
  });
};

// Helper to calculate average rating
export const calculateAverageRating = (reviews: EmployeeReview[] | undefined): number | null => {
  if (!reviews || reviews.length === 0) return null;
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  return sum / reviews.length;
};
