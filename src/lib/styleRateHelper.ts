import { Database } from '@/integrations/supabase/types';

type JobStyle = Database['public']['Tables']['job_styles']['Row'];

export const getStyleRateForDepartment = (
  style: JobStyle | undefined | null,
  department: string
): number => {
  if (!style) return 0;

  const rateMap: Record<string, keyof JobStyle> = {
    'Cutting': 'rate_cutting',
    'Stitching(Singer)': 'rate_stitching_singer',
    'Stitching(Powertable)': 'rate_stitching_power_table',
    'Ironing': 'rate_ironing',
    'Checking': 'rate_checking',
    'Packing': 'rate_packing',
  };
  
  const rateKey = rateMap[department];
  if (!rateKey) return 0;
  
  const rate = style[rateKey];
  return rate ? Number(rate) : 0;
};

export const getDepartmentDisplayName = (department: string): string => {
  return department;
};
