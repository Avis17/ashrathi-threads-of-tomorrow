import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Save } from 'lucide-react';
import { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { getRoleColor } from '@/lib/roleUtils';

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
  action: string;
  resource: string;
}

const actionColors: Record<string, string> = {
  view: 'bg-green-500/10 text-green-700 border-green-500/20',
  create: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
  update: 'bg-orange-500/10 text-orange-700 border-orange-500/20',
  delete: 'bg-red-500/10 text-red-700 border-red-500/20',
  manage: 'bg-purple-500/10 text-purple-700 border-purple-500/20',
  approve: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20',
  generate: 'bg-indigo-500/10 text-indigo-700 border-indigo-500/20',
};

export const RolePermissionsMatrix = () => {
  const queryClient = useQueryClient();
  const [changes, setChanges] = useState<Record<string, Record<string, boolean>>>({});
  const [selectedRole, setSelectedRole] = useState<string>('admin');

  const { data: roles } = useQuery({
    queryKey: ['all-roles'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_all_roles');
      if (error) throw error;
      return data;
    },
  });

  const { data: permissions, isLoading: loadingPermissions } = useQuery({
    queryKey: ['permissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('permissions')
        .select('*')
        .order('category')
        .order('resource')
        .order('action');
      if (error) throw error;
      return data as Permission[];
    },
  });

  const { data: rolePermissions, isLoading: loadingRolePerms } = useQuery({
    queryKey: ['role-permissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('role_permissions')
        .select('role, permission_id');
      if (error) throw error;
      return data;
    },
  });

  const updatePermissionsMutation = useMutation({
    mutationFn: async (updates: { role: string; add: string[]; remove: string[] }) => {
      const addPromises = updates.add.map(permissionId =>
        supabase.from('role_permissions').insert({ role: updates.role, permission_id: permissionId })
      );
      const removePromises = updates.remove.map(permissionId =>
        supabase.from('role_permissions').delete().eq('role', updates.role).eq('permission_id', permissionId)
      );
      await Promise.all([...addPromises, ...removePromises]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role-permissions'] });
      queryClient.invalidateQueries({ queryKey: ['all-roles'] });
      toast.success('Permissions updated successfully');
      setChanges({});
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update permissions');
    },
  });

  const hasPermission = (role: string, permissionId: string): boolean => {
    if (changes[role]?.[permissionId] !== undefined) {
      return changes[role][permissionId];
    }
    return rolePermissions?.some(rp => rp.permission_id === permissionId && rp.role === role) || false;
  };

  const togglePermission = (role: string, permissionId: string) => {
    const currentState = hasPermission(role, permissionId);
    setChanges(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [permissionId]: !currentState,
      },
    }));
  };

  const saveChanges = () => {
    const add: string[] = [];
    const remove: string[] = [];

    const roleChanges = changes[selectedRole] || {};
    Object.entries(roleChanges).forEach(([permissionId, shouldHave]) => {
      const currentlyHas = rolePermissions?.some(
        rp => rp.permission_id === permissionId && rp.role === selectedRole
      );
      if (shouldHave && !currentlyHas) {
        add.push(permissionId);
      } else if (!shouldHave && currentlyHas) {
        remove.push(permissionId);
      }
    });

    if (add.length === 0 && remove.length === 0) {
      toast.info('No changes to save');
      return;
    }

    updatePermissionsMutation.mutate({ role: selectedRole, add, remove });
  };

  // Group permissions by category
  const groupedPermissions = permissions?.reduce((acc, perm) => {
    if (!acc[perm.category]) {
      acc[perm.category] = [];
    }
    acc[perm.category].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  // Count pending changes for current role
  const pendingChangesCount = Object.keys(changes[selectedRole] || {}).length;

  if (loadingPermissions || loadingRolePerms) {
    return <div className="text-center py-8">Loading permissions...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Role Permissions Matrix</CardTitle>
        <CardDescription>
          Configure which permissions are assigned to each role
        </CardDescription>
        <div className="pt-4">
          <Label htmlFor="roleSelector">Select Role to Manage</Label>
          <select
            id="roleSelector"
            className="w-full md:w-64 mt-2 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            {roles?.map((role: any) => (
              <option key={role.name} value={role.name}>
                {role.display_name} ({role.permission_count || 0} permissions)
              </option>
            ))}
          </select>
        </div>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="w-full">
          {Object.entries(groupedPermissions || {}).map(([category, perms]) => (
            <AccordionItem key={category} value={category}>
              <AccordionTrigger className="text-lg font-semibold capitalize">
                {category.replace(/_/g, ' ')} ({perms.filter(p => hasPermission(selectedRole, p.id)).length}/{perms.length})
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 pt-2">
                  {perms.map((permission) => (
                    <div
                      key={permission.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={hasPermission(selectedRole, permission.id)}
                          onCheckedChange={() => togglePermission(selectedRole, permission.id)}
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{permission.description}</p>
                            <Badge variant="outline" className={actionColors[permission.action]}>
                              {permission.action}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{permission.name}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {pendingChangesCount > 0 && (
          <div className="mt-6 flex justify-end">
            <Button
              onClick={saveChanges}
              disabled={updatePermissionsMutation.isPending}
              size="lg"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes ({pendingChangesCount})
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
