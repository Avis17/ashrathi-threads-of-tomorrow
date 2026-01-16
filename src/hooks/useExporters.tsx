import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Exporter {
  id: string;
  sl_no: number | null;
  name: string;
  hall_no: string | null;
  stall_no: string | null;
  address: string | null;
  state: string | null;
  contact_person: string | null;
  mobile_number: string;
  landline_number: string | null;
  email: string | null;
  website: string | null;
  products_on_display: string | null;
  export_markets: string | null;
  is_active: boolean | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExporterInput {
  sl_no?: number | null;
  name: string;
  hall_no?: string | null;
  stall_no?: string | null;
  address?: string | null;
  state?: string | null;
  contact_person?: string | null;
  mobile_number: string;
  landline_number?: string | null;
  email?: string | null;
  website?: string | null;
  products_on_display?: string | null;
  export_markets?: string | null;
  is_active?: boolean;
  notes?: string | null;
}

export function useExporters() {
  const queryClient = useQueryClient();

  const { data: exporters = [], isLoading, error } = useQuery({
    queryKey: ['exporters'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exporters')
        .select('*')
        .order('sl_no', { ascending: true });
      
      if (error) throw error;
      return data as Exporter[];
    },
  });

  const addExporter = useMutation({
    mutationFn: async (exporter: ExporterInput) => {
      const { data, error } = await supabase
        .from('exporters')
        .insert([exporter])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exporters'] });
      toast.success('Exporter added successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add exporter: ${error.message}`);
    },
  });

  const updateExporter = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<ExporterInput>) => {
      const { data, error } = await supabase
        .from('exporters')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exporters'] });
      toast.success('Exporter updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update exporter: ${error.message}`);
    },
  });

  const deleteExporter = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('exporters')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exporters'] });
      toast.success('Exporter deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete exporter: ${error.message}`);
    },
  });

  const bulkAddExporters = useMutation({
    mutationFn: async (exportersList: ExporterInput[]) => {
      const { data, error } = await supabase
        .from('exporters')
        .upsert(exportersList, { onConflict: 'mobile_number' })
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['exporters'] });
      toast.success(`${data?.length || 0} exporters imported successfully`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to import exporters: ${error.message}`);
    },
  });

  return {
    exporters,
    isLoading,
    error,
    addExporter,
    updateExporter,
    deleteExporter,
    bulkAddExporters,
  };
}
