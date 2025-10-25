import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Save } from 'lucide-react';
import { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

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
  const [changes, setChanges] = useState<Record<string, boolean>>({});

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
    mutationFn: async (updates: { add: string[], remove: string[] }) => {
      const addPromises = updates.add.map(permissionId =>
        supabase.from('role_permissions').insert({ role: 'admin', permission_id: permissionId })
      );
      const removePromises = updates.remove.map(permissionId =>
        supabase.from('role_permissions').delete().eq('role', 'admin').eq('permission_id', permissionId)
      );
      await Promise.all([...addPromises, ...removePromises]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role-permissions'] });
      toast.success('Permissions updated successfully');
      setChanges({});
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update permissions');
    },
  });

  const hasPermission = (permissionId: string): boolean => {
    if (changes[permissionId] !== undefined) {
      return changes[permissionId];
    }
    return rolePermissions?.some(rp => rp.permission_id === permissionId && rp.role === 'admin') || false;
  };

  const togglePermission = (permissionId: string) => {
    const currentState = hasPermission(permissionId);
    setChanges(prev => ({ ...prev, [permissionId]: !currentState }));
  };

  const saveChanges = () => {
    const add: string[] = [];
    const remove: string[] = [];

    Object.entries(changes).forEach(([permissionId, shouldHave]) => {
      const currentlyHas = rolePermissions?.some(
        rp => rp.permission_id === permissionId && rp.role === 'admin'
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

    updatePermissionsMutation.mutate({ add, remove });
  };

  // Group permissions by category
  const groupedPermissions = permissions?.reduce((acc, perm) => {
    if (!acc[perm.category]) {
      acc[perm.category] = [];
    }
    acc[perm.category].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  if (loadingPermissions || loadingRolePerms) {
    return <div className="text-center py-8">Loading permissions...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Role Permissions Matrix</CardTitle>
        <CardDescription>
          Configure which permissions are assigned to the admin role
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="w-full">
          {Object.entries(groupedPermissions || {}).map(([category, perms]) => (
            <AccordionItem key={category} value={category}>
              <AccordionTrigger className="text-lg font-semibold capitalize">
                {category.replace(/_/g, ' ')}
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
                          checked={hasPermission(permission.id)}
                          onCheckedChange={() => togglePermission(permission.id)}
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

        {Object.keys(changes).length > 0 && (
          <div className="mt-6 flex justify-end">
            <Button
              onClick={saveChanges}
              disabled={updatePermissionsMutation.isPending}
              size="lg"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes ({Object.keys(changes).length})
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
