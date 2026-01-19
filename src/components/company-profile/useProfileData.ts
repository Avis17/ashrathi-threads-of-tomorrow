import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Database } from '@/integrations/supabase/types';

export type CompanyProfile = Database['public']['Tables']['company_profiles']['Row'];
export type CompanyProfileInsert = Database['public']['Tables']['company_profiles']['Insert'];

export const defaultProfile: Partial<CompanyProfileInsert> = {
  company_name: '',
  brand_name: '',
  contact_person: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  state: '',
  country: 'India',
  gst_number: '',
  website: '',
  total_employees: 0,
  daily_production_capacity: '',
  power_connection_type: '',
  eb_power_available: true,
  power_phase: '3 Phase',
  generator_available: false,
  generator_capacity: '',
  compressor_available: false,
  compressor_capacity: '',
  boiler_available: false,
  cutting_tables_count: 0,
  cutting_table_size: '',
  cutting_staff: 0,
  cutting_notes: '',
  fabric_inspection_tables_count: 0,
  fabric_inspection_table_size: '',
  stitching_staff: 0,
  stitching_notes: '',
  checking_tables_count: 0,
  checking_table_size: '',
  checking_staff: 0,
  checking_notes: '',
  ironing_tables_count: 0,
  steam_iron_count: 0,
  vacuum_table_available: false,
  ironing_staff: 0,
  ironing_notes: '',
  packing_tables_count: 0,
  storage_racks_available: false,
  polybag_sealing_available: false,
  tagging_barcode_support: false,
  carton_packing_support: false,
  packing_staff: 0,
  packing_notes: '',
  // Quality Control
  inline_checking: false,
  final_checking: true,
  measurement_check: true,
  aql_followed: false,
  // Production Capability
  moq: '',
  lead_time: '',
  sample_lead_time: '',
  // Signatory
  authorized_signatory_name: '',
  signatory_designation: '',
  staff_notes: '',
  general_remarks: '',
};

export const useProfileData = () => {
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['company-profile'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: Partial<CompanyProfileInsert>) => {
      if (profile?.id) {
        const { error } = await supabase
          .from('company_profiles')
          .update(data)
          .eq('id', profile.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('company_profiles')
          .insert(data as CompanyProfileInsert);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-profile'] });
      toast.success('Profile saved successfully');
    },
    onError: (error) => {
      toast.error('Failed to save profile: ' + error.message);
    },
  });

  return {
    profile,
    isLoading,
    saveProfile: saveMutation.mutate,
    isSaving: saveMutation.isPending,
  };
};
