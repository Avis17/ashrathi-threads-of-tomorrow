import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Plus, MapPin } from 'lucide-react';
import { AddressDialog } from './AddressDialog';

interface DeliveryAddress {
  id: string;
  full_name: string;
  phone: string;
  address_line_1: string;
  address_line_2?: string | null;
  city: string;
  state: string;
  pincode: string;
  is_default?: boolean;
}

interface AddressSelectorProps {
  selectedAddress: DeliveryAddress | null;
  onSelectAddress: (address: DeliveryAddress) => void;
}

export const AddressSelector = ({ selectedAddress, onSelectAddress }: AddressSelectorProps) => {
  const { user } = useAuth();
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
      return data as DeliveryAddress[];
    },
    enabled: !!user,
  });

  // Auto-select default address or first address
  useState(() => {
    if (addresses.length > 0 && !selectedAddress) {
      const defaultAddress = addresses.find((addr) => addr.is_default) || addresses[0];
      onSelectAddress(defaultAddress);
    }
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
        <AddressDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <RadioGroup
        value={selectedAddress?.id}
        onValueChange={(value) => {
          const address = addresses.find((addr) => addr.id === value);
          if (address) onSelectAddress(address);
        }}
      >
        {addresses.map((address) => (
          <Card key={address.id} className="p-4">
            <div className="flex items-start gap-3">
              <RadioGroupItem value={address.id} id={address.id} />
              <Label htmlFor={address.id} className="flex-1 cursor-pointer">
                <div className="font-medium">{address.full_name}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  {address.address_line_1}
                  {address.address_line_2 && `, ${address.address_line_2}`}
                </div>
                <div className="text-sm text-muted-foreground">
                  {address.city}, {address.state} - {address.pincode}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Phone: {address.phone}
                </div>
                {address.is_default && (
                  <span className="inline-block mt-2 text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                    Default Address
                  </span>
                )}
              </Label>
            </div>
          </Card>
        ))}
      </RadioGroup>

      <Button variant="outline" onClick={() => setIsDialogOpen(true)} className="w-full">
        <Plus className="mr-2 h-4 w-4" />
        Add New Address
      </Button>

      <AddressDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </div>
  );
};
