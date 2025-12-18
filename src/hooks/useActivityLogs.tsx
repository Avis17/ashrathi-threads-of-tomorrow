import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ActivityLog {
  id: string;
  user_id: string | null;
  user_email: string | null;
  user_name: string | null;
  action: 'create' | 'update' | 'delete' | 'view' | 'export' | 'login' | 'logout' | 'other';
  entity_type: string;
  entity_id: string | null;
  entity_name: string | null;
  description: string;
  old_values: Record<string, any> | null;
  new_values: Record<string, any> | null;
  ip_address: string | null;
  user_agent: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
}

export const useActivityLogs = (filters?: {
  action?: string;
  entityType?: string;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['activity-logs', filters],
    queryFn: async () => {
      let query = supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.action && filters.action !== 'all') {
        query = query.eq('action', filters.action);
      }
      if (filters?.entityType && filters.entityType !== 'all') {
        query = query.eq('entity_type', filters.entityType);
      }
      if (filters?.userId) {
        query = query.eq('user_id', filters.userId);
      }
      if (filters?.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }
      if (filters?.dateTo) {
        query = query.lte('created_at', filters.dateTo + 'T23:59:59');
      }
      if (filters?.search) {
        query = query.or(`description.ilike.%${filters.search}%,entity_name.ilike.%${filters.search}%,user_name.ilike.%${filters.search}%`);
      }
      if (filters?.limit) {
        query = query.limit(filters.limit);
      } else {
        query = query.limit(500);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ActivityLog[];
    },
  });
};

export const useActivityStats = () => {
  return useQuery({
    queryKey: ['activity-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const logs = data as ActivityLog[];
      const today = new Date().toISOString().split('T')[0];
      const thisWeekStart = new Date();
      thisWeekStart.setDate(thisWeekStart.getDate() - 7);

      const todayLogs = logs.filter(l => l.created_at.startsWith(today));
      const weekLogs = logs.filter(l => new Date(l.created_at) >= thisWeekStart);

      const actionBreakdown = logs.reduce((acc, log) => {
        acc[log.action] = (acc[log.action] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const entityBreakdown = logs.reduce((acc, log) => {
        acc[log.entity_type] = (acc[log.entity_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const userActivity = logs.reduce((acc, log) => {
        const key = log.user_email || 'Unknown';
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const hourlyActivity = logs.slice(0, 100).reduce((acc, log) => {
        const hour = new Date(log.created_at).getHours();
        acc[hour] = (acc[hour] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);

      return {
        totalLogs: logs.length,
        todayCount: todayLogs.length,
        weekCount: weekLogs.length,
        createCount: actionBreakdown.create || 0,
        updateCount: actionBreakdown.update || 0,
        deleteCount: actionBreakdown.delete || 0,
        actionBreakdown,
        entityBreakdown,
        userActivity,
        hourlyActivity,
        recentLogs: logs.slice(0, 10),
      };
    },
  });
};

export const useLogActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      action: string;
      entityType: string;
      entityId?: string;
      entityName?: string;
      description?: string;
      oldValues?: Record<string, any>;
      newValues?: Record<string, any>;
      metadata?: Record<string, any>;
    }) => {
      const { data, error } = await supabase.rpc('log_activity', {
        p_action: params.action,
        p_entity_type: params.entityType,
        p_entity_id: params.entityId || null,
        p_entity_name: params.entityName || null,
        p_description: params.description || null,
        p_old_values: params.oldValues || null,
        p_new_values: params.newValues || null,
        p_metadata: params.metadata || null,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity-logs'] });
      queryClient.invalidateQueries({ queryKey: ['activity-stats'] });
    },
  });
};
