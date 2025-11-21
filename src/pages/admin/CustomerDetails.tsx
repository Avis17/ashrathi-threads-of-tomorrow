import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft } from 'lucide-react';
import { CustomerOverview } from '@/components/admin/customers/CustomerOverview';
import { CustomerAnalytics } from '@/components/admin/customers/CustomerAnalytics';
import { Skeleton } from '@/components/ui/skeleton';

export default function CustomerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: customer, isLoading } = useQuery({
    queryKey: ['customer', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <p className="text-lg text-muted-foreground">Customer not found</p>
        <Button onClick={() => navigate('/admin/customers')} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/admin/customers')}
            className="hover-scale"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {customer.company_name}
            </h1>
            <p className="text-muted-foreground">{customer.email}</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
          <TabsTrigger value="overview" className="text-sm font-medium">
            Overview
          </TabsTrigger>
          <TabsTrigger value="analytics" className="text-sm font-medium">
            Analytics & Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <CustomerOverview customer={customer} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <CustomerAnalytics customerId={customer.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
