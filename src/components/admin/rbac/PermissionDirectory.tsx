import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useState } from 'react';

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

export const PermissionDirectory = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: permissions, isLoading } = useQuery({
    queryKey: ['permissions-directory', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('permissions')
        .select('*')
        .order('category')
        .order('resource');

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,resource.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Permission[];
    },
  });

  // Group by category
  const groupedPermissions = permissions?.reduce((acc, perm) => {
    if (!acc[perm.category]) {
      acc[perm.category] = [];
    }
    acc[perm.category].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Permission Directory</CardTitle>
        <CardDescription>
          Browse all available permissions in the system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search permissions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-8">Loading permissions...</div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedPermissions || {}).map(([category, perms]) => (
              <div key={category}>
                <h3 className="text-lg font-semibold mb-3 capitalize">
                  {category.replace(/_/g, ' ')}
                </h3>
                <div className="grid gap-3">
                  {perms.map((permission) => (
                    <div
                      key={permission.id}
                      className="p-4 border rounded-lg hover:bg-accent/30 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium">{permission.description}</p>
                            <Badge variant="outline" className={actionColors[permission.action]}>
                              {permission.action}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">
                            <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                              {permission.name}
                            </span>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Resource: {permission.resource}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {permissions?.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No permissions found
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
