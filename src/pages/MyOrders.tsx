import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { OrderStatusBadge } from '@/components/customer/OrderStatusBadge';
import { format } from 'date-fns';
import { Search, Package, CreditCard, Banknote, ChevronRight, ShoppingBag } from 'lucide-react';
import noDataImage from '@/assets/no-data.png';

export default function MyOrders() {
  const navigate = useNavigate();
  const { user } = useAuth();
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

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.order_number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (!user) {
    navigate('/auth');
    return null;
  }

  const getPaymentMethodDisplay = (method: string | null) => {
    if (method === 'phonepe' || method === 'online') {
      return (
        <div className="flex items-center gap-1.5 text-xs font-medium text-[#0090FF]">
          <CreditCard className="h-3.5 w-3.5" />
          <span>PhonePe / Online</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1.5 text-xs font-medium text-amber-600">
        <Banknote className="h-3.5 w-3.5" />
        <span>Cash on Delivery</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Premium Header */}
      <div className="bg-black text-white py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center gap-3 mb-2">
            <ShoppingBag className="h-8 w-8 text-[#0090FF]" />
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">My Orders</h1>
          </div>
          <p className="text-gray-400 text-sm md:text-base">
            Track and manage all your Feather Fashions orders
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl -mt-4">
        {/* Search & Filters Card */}
        <Card className="mb-6 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by order number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-gray-200 focus:border-[#0090FF] focus:ring-[#0090FF]/20 rounded-full"
                />
              </div>
            </div>

            <div className="mt-4 overflow-x-auto scrollbar-hide">
              <Tabs value={statusFilter} onValueChange={setStatusFilter}>
                <TabsList className="bg-gray-100/80 p-1 rounded-full inline-flex w-auto min-w-full md:min-w-0">
                  <TabsTrigger value="all" className="rounded-full text-xs md:text-sm px-3 md:px-4 data-[state=active]:bg-black data-[state=active]:text-white">
                    All
                  </TabsTrigger>
                  <TabsTrigger value="payment_pending" className="rounded-full text-xs md:text-sm px-3 md:px-4 data-[state=active]:bg-black data-[state=active]:text-white">
                    Payment Pending
                  </TabsTrigger>
                  <TabsTrigger value="pending" className="rounded-full text-xs md:text-sm px-3 md:px-4 data-[state=active]:bg-black data-[state=active]:text-white">
                    Confirmation Pending
                  </TabsTrigger>
                  <TabsTrigger value="confirmed" className="rounded-full text-xs md:text-sm px-3 md:px-4 data-[state=active]:bg-black data-[state=active]:text-white">
                    Confirmed
                  </TabsTrigger>
                  <TabsTrigger value="processing" className="rounded-full text-xs md:text-sm px-3 md:px-4 data-[state=active]:bg-black data-[state=active]:text-white">
                    Processing
                  </TabsTrigger>
                  <TabsTrigger value="shipped" className="rounded-full text-xs md:text-sm px-3 md:px-4 data-[state=active]:bg-black data-[state=active]:text-white">
                    Shipped
                  </TabsTrigger>
                  <TabsTrigger value="delivered" className="rounded-full text-xs md:text-sm px-3 md:px-4 data-[state=active]:bg-black data-[state=active]:text-white">
                    Delivered
                  </TabsTrigger>
                  <TabsTrigger value="cancelled" className="rounded-full text-xs md:text-sm px-3 md:px-4 data-[state=active]:bg-black data-[state=active]:text-white">
                    Cancelled
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border-0 shadow-md animate-pulse">
                <CardContent className="p-6">
                  <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                  <div className="h-4 bg-gray-100 rounded w-1/4 mb-6"></div>
                  <div className="flex justify-between">
                    <div className="h-4 bg-gray-100 rounded w-1/5"></div>
                    <div className="h-10 bg-gray-200 rounded w-28"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="py-16 text-center">
              <img
                src={noDataImage}
                alt="No orders"
                className="w-32 h-32 mx-auto mb-6 opacity-40"
              />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No orders found</h3>
              <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                {searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your filters to find what you\'re looking for'
                  : 'Start shopping to place your first order and experience premium comfort'}
              </p>
              {!searchQuery && statusFilter === 'all' && (
                <Button 
                  onClick={() => navigate('/products')}
                  className="bg-black hover:bg-gray-900 text-white rounded-full px-8"
                >
                  Browse Products
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <Card 
                key={order.id} 
                className="border-0 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group bg-white"
                onClick={() => navigate(`/my-orders/${order.id}`)}
              >
                <CardContent className="p-5 md:p-6">
                  {/* Top Row - Order Number & Status */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-base md:text-lg text-gray-900 mb-1 group-hover:text-[#0090FF] transition-colors">
                        {order.order_number}
                      </h3>
                      <p className="text-xs md:text-sm text-gray-500">
                        Placed on {format(new Date(order.created_at), 'PPP')}
                      </p>
                    </div>
                    <OrderStatusBadge status={order.status} />
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-100 my-4"></div>

                  {/* Bottom Row - Details & Action */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-4 md:gap-6">
                      {/* Items Count */}
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                          <Package className="h-4 w-4 text-gray-600" />
                        </div>
                        <span className="text-sm text-gray-600">
                          {order.order_items?.length || 0} {order.order_items?.length === 1 ? 'item' : 'items'}
                        </span>
                      </div>

                      {/* Payment Method */}
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                          {order.payment_method === 'phonepe' || order.payment_method === 'online' ? (
                            <CreditCard className="h-4 w-4 text-[#0090FF]" />
                          ) : (
                            <Banknote className="h-4 w-4 text-amber-600" />
                          )}
                        </div>
                        {getPaymentMethodDisplay(order.payment_method)}
                      </div>

                      {/* Total Amount */}
                      <div className="font-bold text-lg text-gray-900">
                        ₹{typeof order.total_amount === 'string' ? parseFloat(order.total_amount).toFixed(2) : order.total_amount.toFixed(2)}
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      className="rounded-full border-gray-200 hover:bg-black hover:text-white hover:border-black transition-all group/btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/my-orders/${order.id}`);
                      }}
                    >
                      View Details
                      <ChevronRight className="h-4 w-4 ml-1 group-hover/btn:translate-x-0.5 transition-transform" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Bottom Brand Strip */}
        {filteredOrders.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-400">
              Thank you for shopping with <span className="font-semibold text-gray-600">Feather Fashions</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
