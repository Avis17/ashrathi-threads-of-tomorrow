import { useState } from 'react';
import { Search, Shield, ShieldCheck, ShieldX, Users, MapPin, BarChart3, Factory, Package } from 'lucide-react';
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
};

export default function AppAccessManagement() {
  const { toast } = useToast();
  const { allAccessRecords, recordsLoading, grantAccess, revokeAccess, searchUserByEmail } = useAppAccess();
  
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ id: string; email: string; full_name: string | null }>>([]);
  const [selectedApp, setSelectedApp] = useState<InternalApp>('market_intel');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchEmail.trim()) return;
    
    setIsSearching(true);
    const results = await searchUserByEmail(searchEmail);
    setSearchResults(results);
    setIsSearching(false);
  };

  const handleGrantAccess = async (userId: string, userEmail: string) => {
    try {
      await grantAccess.mutateAsync({ userId, appName: selectedApp, userEmail });
      toast({
        title: 'Access Granted',
        description: `User ${userEmail} now has access to ${APP_INFO[selectedApp].name}`,
      });
      setSearchResults([]);
      setSearchEmail('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to grant access',
        variant: 'destructive',
      });
    }
  };

  const handleRevokeAccess = async (userId: string, appName: InternalApp) => {
    try {
      await revokeAccess.mutateAsync({ userId, appName });
      toast({
        title: 'Access Revoked',
        description: 'User access has been revoked',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to revoke access',
        variant: 'destructive',
      });
    }
  };

  const approvedRecords = allAccessRecords.filter(r => r.is_approved);
  const pendingRecords = allAccessRecords.filter(r => !r.is_approved);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">App Access Management</h1>
          <p className="text-muted-foreground">Manage user access to internal applications</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Users className="h-3 w-3" />
            {approvedRecords.length} Approved Users
          </Badge>
        </div>
      </div>

      {/* Grant Access Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-green-600" />
            Grant App Access
          </CardTitle>
          <CardDescription>
            Search for a user by email and grant them access to an internal app
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                placeholder="Search user by email..."
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
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
            <Button onClick={handleSearch} disabled={isSearching}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="border rounded-lg divide-y">
              {searchResults.map((user) => (
                <div key={user.id} className="p-3 flex items-center justify-between hover:bg-muted/50">
                  <div>
                    <p className="font-medium">{user.full_name || 'No Name'}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleGrantAccess(user.id, user.email)}
                    disabled={grantAccess.isPending}
                  >
                    <ShieldCheck className="h-4 w-4 mr-1" />
                    Grant Access
                  </Button>
                </div>
              ))}
            </div>
          )}

          {searchResults.length === 0 && searchEmail && !isSearching && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No users found. Try a different email.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Active Access Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Active Access Permissions
          </CardTitle>
          <CardDescription>
            Users with approved access to internal applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recordsLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : approvedRecords.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No users have been granted access yet
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User ID</TableHead>
                  <TableHead>Application</TableHead>
                  <TableHead>Approved At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {approvedRecords.map((record) => {
                  const appInfo = APP_INFO[record.app_name];
                  return (
                    <TableRow key={record.id}>
                      <TableCell className="font-mono text-xs">
                        {record.user_id.slice(0, 8)}...
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {appInfo?.icon}
                          <span>{appInfo?.name || record.app_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {record.approved_at 
                          ? format(new Date(record.approved_at), 'dd MMM yyyy, HH:mm')
                          : '-'
                        }
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRevokeAccess(record.user_id, record.app_name)}
                          disabled={revokeAccess.isPending}
                        >
                          <ShieldX className="h-4 w-4 mr-1" />
                          Revoke
                        </Button>
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
