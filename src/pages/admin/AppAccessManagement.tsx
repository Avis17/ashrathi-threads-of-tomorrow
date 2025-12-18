import { useState } from 'react';
import { Plus, Shield, ShieldCheck, ShieldX, Users, MapPin, BarChart3, Factory, Package, Trash2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useAppAccess, InternalApp } from '@/hooks/useAppAccess';
import { format } from 'date-fns';

const APP_INFO: Record<InternalApp, { name: string; icon: React.ReactNode; description: string }> = {
  market_intel: {
    name: 'Market Intel',
    icon: <MapPin className="h-4 w-4" />,
    description: 'Field intelligence for shop visits',
  },
  analytics_hub: {
    name: 'Analytics Hub',
    icon: <BarChart3 className="h-4 w-4" />,
    description: 'Advanced business analytics',
  },
  production_tracker: {
    name: 'Production Tracker',
    icon: <Factory className="h-4 w-4" />,
    description: 'Real-time production monitoring',
  },
  inventory_scanner: {
    name: 'Inventory Scanner',
    icon: <Package className="h-4 w-4" />,
    description: 'Mobile inventory management',
  },
  admin_forms: {
    name: 'Admin Forms',
    icon: <Users className="h-4 w-4" />,
    description: 'Data entry forms for staff',
  },
};

export default function AppAccessManagement() {
  const { toast } = useToast();
  const { allAccessRecords, recordsLoading, grantAccess, revokeAccess, deleteAccess } = useAppAccess();
  
  const [newEmail, setNewEmail] = useState('');
  const [selectedApp, setSelectedApp] = useState<InternalApp>('market_intel');

  const handleAddAccess = async () => {
    if (!newEmail.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter an email address',
        variant: 'destructive',
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      toast({
        title: 'Error',
        description: 'Please enter a valid email address',
        variant: 'destructive',
      });
      return;
    }

    try {
      await grantAccess.mutateAsync({ email: newEmail, appName: selectedApp });
      toast({
        title: 'Access Granted',
        description: `${newEmail} now has access to ${APP_INFO[selectedApp].name}`,
      });
      setNewEmail('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to grant access. Email may already have access to this app.',
        variant: 'destructive',
      });
    }
  };

  const handleToggleAccess = async (email: string, appName: InternalApp, currentlyApproved: boolean) => {
    try {
      if (currentlyApproved) {
        await revokeAccess.mutateAsync({ email, appName });
        toast({ title: 'Access Revoked', description: `Access revoked for ${email}` });
      } else {
        await grantAccess.mutateAsync({ email, appName });
        toast({ title: 'Access Granted', description: `Access granted for ${email}` });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update access', variant: 'destructive' });
    }
  };

  const handleDelete = async (email: string, appName: InternalApp) => {
    try {
      await deleteAccess.mutateAsync({ email, appName });
      toast({ title: 'Removed', description: `${email} removed from access list` });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to remove access', variant: 'destructive' });
    }
  };

  const approvedCount = allAccessRecords.filter(r => r.is_approved).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">App Access Management</h1>
          <p className="text-muted-foreground">Manage user access to internal applications by email</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Users className="h-3 w-3" />
            {approvedCount} Approved
          </Badge>
        </div>
      </div>

      {/* Add Access Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-green-600" />
            Add User Access
          </CardTitle>
          <CardDescription>
            Enter an email address to grant access to an internal app
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                type="email"
                placeholder="Enter user email..."
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddAccess()}
              />
            </div>
            <Select value={selectedApp} onValueChange={(v) => setSelectedApp(v as InternalApp)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(APP_INFO).map(([key, info]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      {info.icon}
                      {info.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleAddAccess} disabled={grantAccess.isPending}>
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Access List Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Access List
          </CardTitle>
          <CardDescription>
            All users with access to internal applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recordsLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : allAccessRecords.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Mail className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No users have been added yet</p>
              <p className="text-sm">Add an email above to grant access</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Application</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allAccessRecords.map((record) => {
                  const appInfo = APP_INFO[record.app_name];
                  return (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">
                        {record.user_email}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {appInfo?.icon}
                          <span>{appInfo?.name || record.app_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {record.is_approved ? (
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                            <ShieldCheck className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                            <ShieldX className="h-3 w-3 mr-1" />
                            Revoked
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {record.approved_at 
                          ? format(new Date(record.approved_at), 'dd MMM yyyy')
                          : '-'
                        }
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant={record.is_approved ? "outline" : "default"}
                            size="sm"
                            onClick={() => handleToggleAccess(record.user_email, record.app_name, record.is_approved)}
                            disabled={revokeAccess.isPending || grantAccess.isPending}
                          >
                            {record.is_approved ? 'Revoke' : 'Grant'}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(record.user_email, record.app_name)}
                            disabled={deleteAccess.isPending}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
