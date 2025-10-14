import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, MapPin, Trash2 } from 'lucide-react';
import { AddressDialog } from '@/components/checkout/AddressDialog';
import { toast } from '@/hooks/use-toast';

export const AddressList = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: addresses = [], isLoading } = useQuery({
    queryKey: ['addresses', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customer_addresses')
        .select('*')
        .eq('user_id', user!.id)
        .order('is_default', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const deleteAddress = useMutation({
    mutationFn: async (addressId: string) => {
      const { error } = await supabase
        .from('customer_addresses')
        .delete()
        .eq('id', addressId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses', user?.id] });
      toast({
        title: 'Address Deleted',
        description: 'Your address has been removed',
      });
    },
  });

  if (isLoading) {
    return <div>Loading addresses...</div>;
  }

  if (addresses.length === 0) {
    return (
      <div className="text-center py-8">
        <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground mb-4">No delivery addresses saved</p>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Address
        </Button>
        <AddressDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {addresses.map((address) => (
        <Card key={address.id} className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-medium">{address.full_name}</h3>
                {address.is_default && (
                  <Badge variant="secondary">Default</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {address.address_line_1}
                {address.address_line_2 && `, ${address.address_line_2}`}
              </p>
              <p className="text-sm text-muted-foreground">
                {address.city}, {address.state} - {address.pincode}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Phone: {address.phone}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => deleteAddress.mutate(address.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      ))}

      <Button onClick={() => setIsDialogOpen(true)} variant="outline" className="w-full">
        <Plus className="mr-2 h-4 w-4" />
        Add New Address
      </Button>

      <AddressDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </div>
  );
};
