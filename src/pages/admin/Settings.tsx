import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Settings as SettingsIcon, Bell, Package, ShoppingCart, Mail, Plus, Trash2, Truck, Loader2, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useShippingSettings } from '@/hooks/useShippingSettings';
import { ShippingZone } from '@/lib/shippingConstants';
import CompanyVehiclesSettings from '@/components/admin/settings/CompanyVehiclesSettings';

export default function Settings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newEmail, setNewEmail] = useState('');
  
  // Fetch admin settings
  const { data: settings, isLoading: isLoadingSettings, error: settingsError } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('*')
        .single();

      if (error) throw error;
      return data;
    },
  });

  // Fetch shipping settings
  const { data: shippingSettings, isLoading: isLoadingShipping, error: shippingError } = useShippingSettings();

  // Update settings mutation
  const updateMutation = useMutation({
    mutationFn: async (updates: any) => {
      const { error } = await supabase
        .from('admin_settings')
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

  // Update shipping config mutation
  const updateShippingConfigMutation = useMutation({
    mutationFn: async (updates: { min_order_value?: number; min_items_for_free_delivery?: number }) => {
      const { error } = await supabase
        .from('shipping_config')
        .update(updates)
        .eq('id', (await supabase.from('shipping_config').select('id').single()).data?.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipping-settings'] });
      toast({
        title: 'Updated',
        description: 'Shipping configuration updated successfully.',
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

  // Update zone charge mutation
  const updateZoneChargeMutation = useMutation({
    mutationFn: async ({ zoneName, charge }: { zoneName: ShippingZone; charge: number }) => {
      const { error } = await supabase
        .from('shipping_settings')
        .update({ charge_amount: charge })
        .eq('zone_name', zoneName);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipping-settings'] });
      toast({
        title: 'Updated',
        description: 'Zone charge updated successfully.',
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

  // Show error if critical data fails
  if (settingsError || shippingError) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Settings</AlertTitle>
          <AlertDescription>
            {settingsError?.message || shippingError?.message || 'Failed to load settings'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <SettingsIcon className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Configure alerts, notifications, and shipping settings
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Low Stock Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-orange-600" />
              Low Stock Alerts
            </CardTitle>
            <CardDescription>
              Configure automatic low stock notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoadingSettings ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
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
              </>
            )}
          </CardContent>
        </Card>

        {/* Order Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-blue-600" />
              Order Alerts
            </CardTitle>
            <CardDescription>
              Get notified when new orders are placed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoadingSettings ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
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
              </>
            )}
          </CardContent>
        </Card>

        {/* Notification Recipients */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-green-600" />
              Notification Recipients
            </CardTitle>
            <CardDescription>
              Manage email addresses that receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoadingSettings ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
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
              </>
            )}
          </CardContent>
        </Card>

        {/* Alert Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-purple-600" />
              Alert Status
            </CardTitle>
            <CardDescription>
              Current notification settings summary
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingSettings ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
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
              </>
            )}
          </CardContent>
        </Card>

        {/* Shipping & Delivery Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-purple-600" />
              Shipping & Delivery Configuration
            </CardTitle>
            <CardDescription>
              Configure zone-based delivery charges and free delivery criteria
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoadingShipping ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : shippingSettings ? (
              <>
                {/* Free Delivery Settings */}
                <div className="space-y-4 border-b pb-4">
                  <h3 className="font-semibold text-lg">Free Delivery Criteria</h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="minOrderValue">Minimum Order Value (₹)</Label>
                      <Input 
                        id="minOrderValue"
                        type="number" 
                        min="0"
                        value={shippingSettings?.config.minOrderValue || 0}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          if (value >= 0) {
                            updateShippingConfigMutation.mutate({ min_order_value: value });
                          }
                        }}
                        className="max-w-[200px]"
                      />
                      <p className="text-xs text-muted-foreground">
                        Orders above this amount get free delivery
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="minItems">Minimum Items Count</Label>
                      <Input 
                        id="minItems"
                        type="number" 
                        min="1"
                        value={shippingSettings?.config.minItemsForFreeDelivery || 0}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          if (value > 0) {
                            updateShippingConfigMutation.mutate({ min_items_for_free_delivery: value });
                          }
                        }}
                        className="max-w-[200px]"
                      />
                      <p className="text-xs text-muted-foreground">
                        Orders with this many items get free delivery
                      </p>
                    </div>
                  </div>
                </div>

                {/* Zone-based Charges */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Zone-based Delivery Charges</h3>
                  
                  <div className="space-y-3">
                    {shippingSettings?.zones.map((zone) => (
                      <div key={zone.name} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                        <div className="flex-1">
                          <p className="font-medium">{zone.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {zone.states.join(', ')}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Label className="text-sm">₹</Label>
                          <Input 
                            type="number"
                            min="0"
                            step="1"
                            className="w-24"
                            value={zone.charge}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value);
                              if (value >= 0) {
                                updateZoneChargeMutation.mutate({ 
                                  zoneName: zone.name as ShippingZone, 
                                  charge: value 
                                });
                              }
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <strong>Note:</strong> Delivery charges are automatically calculated based on the customer's delivery state. 
                      Free delivery is applied when order value ≥ ₹{shippingSettings?.config.minOrderValue} or items ≥ {shippingSettings?.config.minItemsForFreeDelivery}.
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Shipping settings not available
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Company Vehicles */}
        <CompanyVehiclesSettings />
      </div>
    </div>
  );
}
