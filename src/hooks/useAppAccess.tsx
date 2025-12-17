import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type InternalApp = 'market_intel' | 'analytics_hub' | 'production_tracker' | 'inventory_scanner';

export interface AppAccessRecord {
  id: string;
  user_id: string | null;
  user_email: string;
  app_name: InternalApp;
  is_approved: boolean;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

export function useAppAccess(appName?: InternalApp) {
  const { user, isAdmin } = useAuth();
  const queryClient = useQueryClient();

  // Check if current user has access to a specific app
  const { data: hasAccess, isLoading: accessLoading } = useQuery({
    queryKey: ['app-access', user?.email, appName],
    queryFn: async () => {
      if (!user?.email || !appName) return false;
      
      // Admins always have access
      if (isAdmin) return true;

      const { data, error } = await supabase
        .from('internal_app_access')
        .select('is_approved')
        .eq('user_email', user.email)
        .eq('app_name', appName)
        .maybeSingle();

      if (error) {
        console.error('Error checking app access:', error);
        return false;
      }

      return data?.is_approved ?? false;
    },
    enabled: !!user?.email && !!appName,
  });

  // Get all access records (admin only)
  const { data: allAccessRecords = [], isLoading: recordsLoading } = useQuery({
    queryKey: ['all-app-access'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('internal_app_access')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching access records:', error);
        return [];
      }

      return data as AppAccessRecord[];
    },
    enabled: isAdmin,
  });

  // Grant access to a user by email
  const grantAccess = useMutation({
    mutationFn: async ({ email, appName }: { email: string; appName: InternalApp }) => {
      // Check if record already exists
      const { data: existing } = await supabase
        .from('internal_app_access')
        .select('id')
        .eq('user_email', email.toLowerCase())
        .eq('app_name', appName)
        .maybeSingle();

      if (existing) {
        // Update existing record
        const { error } = await supabase
          .from('internal_app_access')
          .update({
            is_approved: true,
            approved_by: user?.id,
            approved_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Insert new record
        const { error } = await supabase
          .from('internal_app_access')
          .insert({
            user_email: email.toLowerCase(),
            app_name: appName,
            is_approved: true,
            approved_by: user?.id,
            approved_at: new Date().toISOString(),
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-app-access'] });
    },
  });

  // Revoke access from a user
  const revokeAccess = useMutation({
    mutationFn: async ({ email, appName }: { email: string; appName: InternalApp }) => {
      const { error } = await supabase
        .from('internal_app_access')
        .update({
          is_approved: false,
          updated_at: new Date().toISOString(),
        })
        .eq('user_email', email.toLowerCase())
        .eq('app_name', appName);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-app-access'] });
    },
  });

  // Delete access record
  const deleteAccess = useMutation({
    mutationFn: async ({ email, appName }: { email: string; appName: InternalApp }) => {
      const { error } = await supabase
        .from('internal_app_access')
        .delete()
        .eq('user_email', email.toLowerCase())
        .eq('app_name', appName);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-app-access'] });
    },
  });

  return {
    hasAccess: hasAccess ?? false,
    accessLoading,
    allAccessRecords,
    recordsLoading,
    grantAccess,
    revokeAccess,
    deleteAccess,
    isAdmin,
  };
}
