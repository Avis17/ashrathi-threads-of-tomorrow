import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Search, UserPlus, UserMinus } from 'lucide-react';
import { toast } from 'sonner';
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

interface User {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  is_super_admin: boolean;
  has_role: boolean;
}

export const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionType, setActionType] = useState<'add' | 'remove'>('add');
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

      // Check which users have admin roles and super admin status
      const usersWithRoles = await Promise.all(
        (data || []).map(async (user) => {
          const [roleResult, superAdminResult] = await Promise.all([
            supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', user.id)
              .eq('role', 'admin')
              .maybeSingle(),
            supabase.rpc('is_super_admin', { _user_id: user.id }),
          ]);

          return {
            ...user,
            has_role: !!roleResult.data,
            is_super_admin: superAdminResult.data || false,
          };
        })
      );

      return usersWithRoles;
    },
  });

  const assignRoleMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: 'admin' });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-rbac'] });
      toast.success('Admin role assigned successfully');
      setSelectedUser(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to assign role');
    },
  });

  const removeRoleMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', 'admin');
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-rbac'] });
      toast.success('Admin role removed successfully');
      setSelectedUser(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to remove role');
    },
  });

  const handleAction = (user: User, type: 'add' | 'remove') => {
    if (user.is_super_admin && type === 'remove') {
      toast.error('Cannot remove super admin role');
      return;
    }
    setSelectedUser(user);
    setActionType(type);
  };

  const confirmAction = () => {
    if (!selectedUser) return;
    
    if (actionType === 'add') {
      assignRoleMutation.mutate(selectedUser.id);
    } else {
      removeRoleMutation.mutate(selectedUser.id);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            Assign or remove admin roles from users. Super admin role cannot be modified.
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
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{user.email}</p>
                      {user.is_super_admin && (
                        <Badge variant="default" className="gap-1">
                          <Crown className="h-3 w-3" />
                          Super Admin
                        </Badge>
                      )}
                      {user.has_role && !user.is_super_admin && (
                        <Badge variant="secondary">Admin</Badge>
                      )}
                    </div>
                    {user.full_name && (
                      <p className="text-sm text-muted-foreground">{user.full_name}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Joined {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {!user.has_role && (
                      <Button
                        size="sm"
                        onClick={() => handleAction(user, 'add')}
                        disabled={assignRoleMutation.isPending}
                      >
                        <UserPlus className="h-4 w-4 mr-1" />
                        Assign Admin
                      </Button>
                    )}
                    {user.has_role && !user.is_super_admin && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleAction(user, 'remove')}
                        disabled={removeRoleMutation.isPending}
                      >
                        <UserMinus className="h-4 w-4 mr-1" />
                        Remove Admin
                      </Button>
                    )}
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

      <AlertDialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === 'add' ? 'Assign Admin Role' : 'Remove Admin Role'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === 'add'
                ? `Are you sure you want to assign admin role to ${selectedUser?.email}? They will gain access to the admin dashboard.`
                : `Are you sure you want to remove admin role from ${selectedUser?.email}? They will lose access to the admin dashboard.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmAction}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
