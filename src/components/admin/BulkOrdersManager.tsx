import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface BulkOrder {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string;
  company_name: string | null;
  product_interest: string;
  quantity: number;
  requirements: string | null;
  status: string;
}

const BulkOrdersManager = () => {
  const [orders, setOrders] = useState<BulkOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('bulk_order_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load orders');
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from('bulk_order_requests')
      .update({ status })
      .eq('id', id);

    if (error) {
      toast.error('Failed to update status');
    } else {
      toast.success('Status updated');
      fetchOrders();
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Bulk Orders ({orders.length})</h2>
      {orders.map((order) => (
        <Card key={order.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{order.name}</CardTitle>
                {order.company_name && (
                  <p className="text-sm font-medium text-muted-foreground">{order.company_name}</p>
                )}
                <p className="text-sm text-muted-foreground">{order.email}</p>
                <p className="text-sm text-muted-foreground">{order.phone}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(order.created_at).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge>{order.status}</Badge>
                <Select
                  value={order.status}
                  onValueChange={(value) => updateStatus(order.id, value)}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="quoted">Quoted</SelectItem>
                    <SelectItem value="negotiating">Negotiating</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-semibold text-sm">Product Interest:</p>
                <p className="text-sm">{order.product_interest}</p>
              </div>
              <div>
                <p className="font-semibold text-sm">Quantity:</p>
                <p className="text-sm">{order.quantity} units</p>
              </div>
            </div>
            {order.requirements && (
              <div>
                <p className="font-semibold text-sm">Requirements:</p>
                <p className="text-sm">{order.requirements}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default BulkOrdersManager;
