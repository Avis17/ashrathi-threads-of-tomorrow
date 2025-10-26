import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Search, UserPlus, UserMinus, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { getRoleColor } from '@/lib/roleUtils';

interface User {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  is_super_admin: boolean;
  roles: Array<{ role: string; display_name: string }>;
}

export const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionType, setActionType] = useState<'add' | 'remove'>('add');
  const [isAddRoleDialogOpen, setIsAddRoleDialogOpen] = useState(false);
  const [selectedRoleToAdd, setSelectedRoleToAdd] = useState('');
  const [roleToRemove, setRoleToRemove] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ['users-rbac', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('id, email, full_name, created_at')
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.ilike('email', `%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Get all user roles and super admin status
      const usersWithRoles = await Promise.all(
        (data || []).map(async (user) => {
          const [rolesResult, superAdminResult, rolesData] = await Promise.all([
            supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', user.id),
            supabase.rpc('is_super_admin', { _user_id: user.id }),
            supabase.from('roles').select('name, display_name'),
          ]);

          const userRoles = (rolesResult.data || []).map(r => {
            const roleInfo = rolesData.data?.find(rd => rd.name === r.role);
            return {
              role: r.role,
              display_name: roleInfo?.display_name || r.role,
            };
          });

          return {
            ...user,
            roles: userRoles,
            is_super_admin: superAdminResult.data || false,
          };
        })
      );

      return usersWithRoles;
    },
  });

  // Fetch available roles
  const { data: availableRoles } = useQuery({
    queryKey: ['all-roles'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_all_roles');
      if (error) throw error;
      return data;
    },
  });

  const assignRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-rbac'] });
      toast.success('Role assigned successfully');
      setIsAddRoleDialogOpen(false);
      setSelectedUser(null);
      setSelectedRoleToAdd('');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to assign role');
    },
  });

  const removeRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-rbac'] });
      toast.success('Role removed successfully');
      setRoleToRemove(null);
      setSelectedUser(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to remove role');
    },
  });

  const handleAddRole = (user: User) => {
    setSelectedUser(user);
    setIsAddRoleDialogOpen(true);
  };

  const handleRemoveRole = (user: User, role: string) => {
    if (user.is_super_admin) {
      toast.error('Cannot remove roles from super admin');
      return;
    }
    setSelectedUser(user);
    setRoleToRemove(role);
  };

  const confirmAddRole = () => {
    if (!selectedUser || !selectedRoleToAdd) return;
    assignRoleMutation.mutate({ userId: selectedUser.id, role: selectedRoleToAdd });
  };

  const confirmRemoveRole = () => {
    if (!selectedUser || !roleToRemove) return;
    removeRoleMutation.mutate({ userId: selectedUser.id, role: roleToRemove });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            Assign or remove roles from users. Super admin role cannot be modified.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users by email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading users...</div>
          ) : (
            <div className="space-y-3">
              {users?.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium">{user.email}</p>
                      {user.is_super_admin && (
                        <Badge variant="default" className="gap-1">
                          <Crown className="h-3 w-3" />
                          Super Admin
                        </Badge>
                      )}
                      {user.roles.map((r) => (
                        <div key={r.role} className="flex items-center gap-1">
                          <Badge className={getRoleColor(r.role)}>
                            {r.display_name}
                          </Badge>
                          {!user.is_super_admin && (
                            <button
                              onClick={() => handleRemoveRole(user, r.role)}
                              className="text-destructive hover:text-destructive/80 ml-1"
                            >
                              <UserMinus className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    {user.full_name && (
                      <p className="text-sm text-muted-foreground">{user.full_name}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Joined {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleAddRole(user)}
                      disabled={assignRoleMutation.isPending}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Role
                    </Button>
                  </div>
                </div>
              ))}

              {users?.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No users found
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Role Dialog */}
      <Dialog open={isAddRoleDialogOpen} onOpenChange={setIsAddRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Role to User</DialogTitle>
            <DialogDescription>
              Select a role to assign to {selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="role">Select Role</Label>
              <select
                id="role"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={selectedRoleToAdd}
                onChange={(e) => setSelectedRoleToAdd(e.target.value)}
              >
                <option value="">Choose a role...</option>
                {availableRoles
                  ?.filter(role => !selectedUser?.roles.some(r => r.role === role.name))
                  .map((role: any) => (
                    <option key={role.name} value={role.name}>
                      {role.display_name}
                    </option>
                  ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddRoleDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={confirmAddRole}
              disabled={!selectedRoleToAdd || assignRoleMutation.isPending}
            >
              Add Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Role Confirmation */}
      <AlertDialog open={!!roleToRemove} onOpenChange={() => setRoleToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Role</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove the role "{roleToRemove}" from {selectedUser?.email}? 
              They will lose all permissions associated with this role.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemoveRole}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove Role
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
