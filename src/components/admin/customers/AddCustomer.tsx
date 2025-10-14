import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CustomerForm, CustomerFormData } from './CustomerForm';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function AddCustomer() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formKey, setFormKey] = useState(0);

  const createMutation = useMutation({
    mutationFn: async (data: CustomerFormData) => {
      const { error } = await supabase.from('customers').insert(data as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast({ title: 'Customer added successfully' });
      setFormKey(prev => prev + 1); // Reset form
    },
    onError: () => {
      toast({ title: 'Failed to add customer', variant: 'destructive' });
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Customer</CardTitle>
        <CardDescription>Enter customer details to add to your database</CardDescription>
      </CardHeader>
      <CardContent>
        <CustomerForm
          key={formKey}
          onSubmit={(data) => createMutation.mutate(data)}
          isLoading={createMutation.isPending}
        />
      </CardContent>
    </Card>
  );
}