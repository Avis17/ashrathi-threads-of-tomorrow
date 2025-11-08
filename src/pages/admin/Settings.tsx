import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Settings as SettingsIcon, Bell, Package, ShoppingCart, Mail, Plus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function Settings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newEmail, setNewEmail] = useState('');

  // Fetch settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_settings' as any)
        .select('*')
        .single();
      
      if (error) throw error;
      return data as any;
    },
  });

  // Update settings mutation
  const updateMutation = useMutation({
    mutationFn: async (updates: any) => {
      const { error } = await supabase
        .from('admin_settings' as any)
        .update(updates)
        .eq('id', settings?.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      toast({
        title: 'Settings Updated',
        description: 'Alert settings have been saved successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Update Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleAddEmail = () => {
    if (!newEmail || !newEmail.includes('@')) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address.',
        variant: 'destructive',
      });
      return;
    }

    const currentEmails = settings?.notification_emails || [];
    if (currentEmails.includes(newEmail)) {
      toast({
        title: 'Duplicate Email',
        description: 'This email is already in the list.',
        variant: 'destructive',
      });
      return;
    }

    updateMutation.mutate({
      notification_emails: [...currentEmails, newEmail],
    });
    setNewEmail('');
  };

  const handleRemoveEmail = (email: string) => {
    const currentEmails = settings?.notification_emails || [];
    updateMutation.mutate({
      notification_emails: currentEmails.filter((e: string) => e !== email),
    });
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <SettingsIcon className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Alert Settings</h1>
          <p className="text-muted-foreground">
            Configure automated email notifications for inventory and orders
          </p>
        </div>
      </div>

      {/* Low Stock Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-orange-600" />
            Low Stock Alerts
          </CardTitle>
          <CardDescription>
            Get notified when product inventory drops below the threshold
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Enable Low Stock Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Receive email notifications for low inventory
              </p>
            </div>
            <Switch
              checked={settings?.low_stock_alerts_enabled}
              onCheckedChange={(checked) =>
                updateMutation.mutate({ low_stock_alerts_enabled: checked })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="threshold">Stock Threshold (pieces)</Label>
            <div className="flex gap-2">
              <Input
                id="threshold"
                type="number"
                min="1"
                value={settings?.low_stock_threshold}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (value > 0) {
                    updateMutation.mutate({ low_stock_threshold: value });
                  }
                }}
                className="max-w-[200px]"
              />
              <Badge variant="secondary" className="flex items-center gap-1">
                <Bell className="h-3 w-3" />
                Alert when ≤ {settings?.low_stock_threshold} pieces
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              You'll receive an alert when any size-color combination drops to this level or below
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Order Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-green-600" />
            Order Alerts
          </CardTitle>
          <CardDescription>
            Get notified when new orders are placed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Enable Order Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Receive email notifications for new orders
              </p>
            </div>
            <Switch
              checked={settings?.order_alerts_enabled}
              onCheckedChange={(checked) =>
                updateMutation.mutate({ order_alerts_enabled: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Emails */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-blue-600" />
            Notification Recipients
          </CardTitle>
          <CardDescription>
            Email addresses that will receive alert notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="admin@example.com"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddEmail()}
            />
            <Button onClick={handleAddEmail} disabled={updateMutation.isPending}>
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>

          <div className="space-y-2">
            {settings?.notification_emails?.map((email: string) => (
              <div
                key={email}
                className="flex items-center justify-between p-3 bg-muted rounded-lg"
              >
                <span className="text-sm font-medium">{email}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveEmail(email)}
                  disabled={updateMutation.isPending || settings.notification_emails.length === 1}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>

          {settings?.notification_emails?.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No notification emails configured. Add at least one email address.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Status Summary */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Alert Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className={`h-3 w-3 rounded-full ${settings?.low_stock_alerts_enabled ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
              <span className="text-sm">
                Low Stock Alerts: <strong>{settings?.low_stock_alerts_enabled ? 'Active' : 'Inactive'}</strong>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className={`h-3 w-3 rounded-full ${settings?.order_alerts_enabled ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
              <span className="text-sm">
                Order Alerts: <strong>{settings?.order_alerts_enabled ? 'Active' : 'Inactive'}</strong>
              </span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Recipients: {settings?.notification_emails?.length || 0} email address(es) configured
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
