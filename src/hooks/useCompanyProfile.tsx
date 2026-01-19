import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface StitchingMachine {
  id: string;
  type: string;
  count: number;
  brand?: string;
  notes?: string;
}

export interface MeasurementTools {
  tape: boolean;
  gsm_cutter: boolean;
  shade_card: boolean;
  needle_detector: boolean;
}

export interface CompanyProfile {
  id: string;
  company_name: string;
  brand_name: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  gst_number: string | null;
  company_code: string | null;
  
  cutting_tables_count: number | null;
  cutting_table_size: string | null;
  fabric_inspection_tables_count: number | null;
  fabric_inspection_table_size: string | null;
  cutting_notes: string | null;
  cutting_images: string[] | null;
  
  stitching_machines: StitchingMachine[] | null;
  stitching_notes: string | null;
  stitching_images: string[] | null;
  
  checking_tables_count: number | null;
  checking_table_size: string | null;
  measurement_tools: MeasurementTools | null;
  checking_notes: string | null;
  checking_images: string[] | null;
  
  ironing_tables_count: number | null;
  steam_iron_count: number | null;
  vacuum_table_available: boolean | null;
  boiler_available: boolean | null;
  ironing_notes: string | null;
  ironing_images: string[] | null;
  
  generator_available: boolean | null;
  generator_capacity: string | null;
  compressor_available: boolean | null;
  compressor_capacity: string | null;
  power_connection_type: string | null;
  utilities_notes: string | null;
  utilities_images: string[] | null;
  
  packing_tables_count: number | null;
  polybag_sealing_available: boolean | null;
  tagging_barcode_support: boolean | null;
  storage_racks_available: boolean | null;
  packing_notes: string | null;
  packing_images: string[] | null;
  
  total_employees: number | null;
  cutting_staff: number | null;
  stitching_staff: number | null;
  checking_staff: number | null;
  ironing_staff: number | null;
  packing_staff: number | null;
  daily_production_capacity: string | null;
  staff_notes: string | null;
  
  general_remarks: string | null;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export type CompanyProfileInput = Omit<CompanyProfile, 'id' | 'created_at' | 'updated_at'>;

export const defaultCompanyProfile: CompanyProfileInput = {
  company_name: 'Feather Fashions',
  brand_name: 'Feather Fashions Garments',
  address: '',
  city: 'Tirupur',
  state: 'Tamil Nadu',
  country: 'India',
  contact_person: '',
  phone: '+91 9988322555',
  email: 'hello@featherfashions.in',
  website: 'www.featherfashions.in',
  gst_number: '',
  company_code: '',
  
  cutting_tables_count: 0,
  cutting_table_size: '',
  fabric_inspection_tables_count: 0,
  fabric_inspection_table_size: '',
  cutting_notes: '',
  cutting_images: [],
  
  stitching_machines: [],
  stitching_notes: '',
  stitching_images: [],
  
  checking_tables_count: 0,
  checking_table_size: '',
  measurement_tools: { tape: false, gsm_cutter: false, shade_card: false, needle_detector: false },
  checking_notes: '',
  checking_images: [],
  
  ironing_tables_count: 0,
  steam_iron_count: 0,
  vacuum_table_available: false,
  boiler_available: false,
  ironing_notes: '',
  ironing_images: [],
  
  generator_available: false,
  generator_capacity: '',
  compressor_available: false,
  compressor_capacity: '',
  power_connection_type: '',
  utilities_notes: '',
  utilities_images: [],
  
  packing_tables_count: 0,
  polybag_sealing_available: false,
  tagging_barcode_support: false,
  storage_racks_available: false,
  packing_notes: '',
  packing_images: [],
  
  total_employees: 0,
  cutting_staff: 0,
  stitching_staff: 0,
  checking_staff: 0,
  ironing_staff: 0,
  packing_staff: 0,
  daily_production_capacity: '',
  staff_notes: '',
  
  general_remarks: '',
  is_active: true,
  created_by: null,
};

export function useCompanyProfile() {
  const queryClient = useQueryClient();

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['company-profile'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_profiles')
        .select('*')
        .eq('is_active', true)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      
      // Transform the data to match our types
      if (data) {
        return {
          ...data,
          stitching_machines: (data.stitching_machines as unknown as StitchingMachine[]) || [],
          measurement_tools: (data.measurement_tools as unknown as MeasurementTools) || defaultCompanyProfile.measurement_tools,
        } as CompanyProfile;
      }
      return null;
    },
  });

  const saveProfile = useMutation({
    mutationFn: async (profileData: CompanyProfileInput) => {
      // Check if profile exists
      const { data: existing } = await supabase
        .from('company_profiles')
        .select('id')
        .eq('is_active', true)
        .limit(1)
        .maybeSingle();

      if (existing) {
        // Update existing
        const { data, error } = await supabase
          .from('company_profiles')
          .update({
            ...profileData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        // Create new
        const { data, error } = await supabase
          .from('company_profiles')
          .insert([profileData])
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-profile'] });
      toast.success('Company profile saved successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to save profile: ${error.message}`);
    },
  });

  return {
    profile,
    isLoading,
    error,
    saveProfile,
  };
}
