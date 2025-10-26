import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, Users, Key, Shield, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { Role, getRoleColor, getRoleBorderColor, validateRoleName } from '@/lib/roleUtils';

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
  action: string;
}

export const RoleManager = () => {
  const queryClient = useQueryClient();
  const { isSuperAdmin } = useAuth();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [deleteRoleName, setDeleteRoleName] = useState<string | null>(null);
  
  // Form state
  const [roleName, setRoleName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  // Fetch roles
  const { data: roles, isLoading: rolesLoading } = useQuery({
    queryKey: ['all-roles'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_all_roles');
      if (error) throw error;
      return data as Role[];
    },
  });

  // Fetch permissions for creation dialog
  const { data: permissions } = useQuery({
    queryKey: ['permissions'],
    queryFn: async () => {
      const { data, error } = await supabase.from('permissions').select('*').order('category', { ascending: true });
      if (error) throw error;
      return data as Permission[];
    },
    enabled: isCreateDialogOpen,
  });

  // Create role mutation
  const createRoleMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc('create_role', {
        _name: roleName,
        _display_name: displayName,
        _description: description || null,
        _permission_ids: selectedPermissions,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Role created successfully');
      setIsCreateDialogOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['all-roles'] });
      queryClient.invalidateQueries({ queryKey: ['role_permissions'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create role');
    },
  });

  // Delete role mutation
  const deleteRoleMutation = useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase.rpc('delete_role', { _role_name: name });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Role deleted successfully');
      setDeleteRoleName(null);
      queryClient.invalidateQueries({ queryKey: ['all-roles'] });
      queryClient.invalidateQueries({ queryKey: ['role_permissions'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete role');
    },
  });

  const resetForm = () => {
    setRoleName('');
    setDisplayName('');
    setDescription('');
    setSelectedPermissions([]);
  };

  const handleCreateRole = () => {
    const validation = validateRoleName(roleName);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }
    if (!displayName.trim()) {
      toast.error('Display name is required');
      return;
    }
    createRoleMutation.mutate();
  };

  const togglePermission = (permissionId: string) => {
    setSelectedPermissions(prev =>
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  // Group permissions by category
  const groupedPermissions = permissions?.reduce((acc, perm) => {
    if (!acc[perm.category]) {
      acc[perm.category] = [];
    }
    acc[perm.category].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  if (rolesLoading) {
    return <div className="text-center py-8">Loading roles...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Role Management</CardTitle>
              <CardDescription>Create and manage system roles with permissions</CardDescription>
            </div>
            {isSuperAdmin && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Role
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {roles?.map((role) => (
              <Card key={role.name} className={`border-l-4 ${getRoleBorderColor(role.name)}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge className={getRoleColor(role.name)}>
                      {role.display_name}
                    </Badge>
                    {role.is_system_role && (
                      <Shield className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <CardTitle className="text-lg mt-2">{role.name}</CardTitle>
                  {role.description && (
                    <CardDescription className="text-sm">{role.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Users className="h-3 w-3" />
                        Users:
                      </span>
                      <span className="font-medium">{role.user_count || 0}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Key className="h-3 w-3" />
                        Permissions:
                      </span>
                      <span className="font-medium">{role.permission_count || 0}</span>
                    </div>
                    {isSuperAdmin && !role.is_system_role && (
                      <Button
                        variant="destructive"
                        size="sm"
                        className="w-full mt-2"
                        onClick={() => setDeleteRoleName(role.name)}
                      >
                        <Trash2 className="h-3 w-3 mr-2" />
                        Delete Role
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Create Role Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Role</DialogTitle>
            <DialogDescription>
              Define a new role with specific permissions. Role name cannot be changed later.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="roleName">Role Name (Technical)</Label>
              <Input
                id="roleName"
                placeholder="e.g., warehouse_manager"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value.toLowerCase())}
              />
              <p className="text-xs text-muted-foreground">
                Lowercase letters, numbers, and underscores only. Must start with a letter.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                placeholder="e.g., Warehouse Manager"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Describe the role's responsibilities..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Assign Permissions</Label>
              {groupedPermissions && (
                <Accordion type="multiple" className="w-full">
                  {Object.entries(groupedPermissions).map(([category, perms]) => (
                    <AccordionItem key={category} value={category}>
                      <AccordionTrigger className="text-sm font-medium">
                        {category} ({perms.filter(p => selectedPermissions.includes(p.id)).length}/{perms.length})
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2 pl-4">
                          {perms.map((perm) => (
                            <div key={perm.id} className="flex items-start space-x-2">
                              <Checkbox
                                id={perm.id}
                                checked={selectedPermissions.includes(perm.id)}
                                onCheckedChange={() => togglePermission(perm.id)}
                              />
                              <div className="flex-1">
                                <label htmlFor={perm.id} className="text-sm font-medium cursor-pointer">
                                  {perm.name}
                                </label>
                                <p className="text-xs text-muted-foreground">{perm.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateRole} disabled={createRoleMutation.isPending}>
              {createRoleMutation.isPending ? 'Creating...' : 'Create Role'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteRoleName} onOpenChange={() => setDeleteRoleName(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete Role
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the role "{deleteRoleName}"? This action cannot be undone.
              All permissions associated with this role will be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteRoleName && deleteRoleMutation.mutate(deleteRoleName)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Role
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
