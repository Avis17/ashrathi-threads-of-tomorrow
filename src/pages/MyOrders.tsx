import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { OrderStatusBadge } from '@/components/customer/OrderStatusBadge';
import { format } from 'date-fns';
import { Search, Package } from 'lucide-react';
import noDataImage from '@/assets/no-data.png';

export default function MyOrders() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['my-orders', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id
          )
        `)
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [loading, user, navigate]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading orders...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.order_number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>

      <div className="space-y-6">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by order number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList>
            <TabsTrigger value="all">All Orders</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
            <TabsTrigger value="processing">Processing</TabsTrigger>
            <TabsTrigger value="shipped">Shipped</TabsTrigger>
            <TabsTrigger value="delivered">Delivered</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>
        </Tabs>

        {isLoading ? (
          <div className="text-center py-12">Loading orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <img
              src={noDataImage}
              alt="No orders"
              className="w-48 h-48 mx-auto mb-4 opacity-50"
            />
            <p className="text-lg font-medium mb-2">No orders found</p>
            <p className="text-muted-foreground mb-4">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Start shopping to place your first order'}
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <Button onClick={() => navigate('/products')}>
                Browse Products
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{order.order_number}</h3>
                      <p className="text-sm text-muted-foreground">
                        Placed on {format(new Date(order.created_at), 'PPP')}
                      </p>
                    </div>
                    <OrderStatusBadge status={order.status} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span>{order.order_items?.length || 0} items</span>
                      </div>
                      <div className="font-semibold">
                        ₹{typeof order.total_amount === 'string' ? parseFloat(order.total_amount).toFixed(2) : order.total_amount.toFixed(2)}
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      onClick={() => navigate(`/my-orders/${order.id}`)}
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
