import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { OrderStatusBadge } from '@/components/customer/OrderStatusBadge';
import { OrderTimeline } from '@/components/customer/OrderTimeline';
import { format } from 'date-fns';
import { ArrowLeft, Package, MapPin, Phone, User } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function OrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (
              name,
              image_url
            )
          )
        `)
        .eq('id', orderId!)
        .eq('user_id', user!.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user && !!orderId,
  });

  const cancelOrder = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('orders')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
        })
        .eq('id', orderId!);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['my-orders', user?.id] });
      toast({
        title: 'Order Cancelled',
        description: 'Your order has been cancelled successfully',
      });
    },
  });

  if (!user) {
    navigate('/auth');
    return null;
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading order details...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Order not found</div>
      </div>
    );
  }

  const canCancel = order.status === 'pending' || order.status === 'confirmed';

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Button variant="ghost" onClick={() => navigate('/my-orders')} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Orders
      </Button>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Left Side - Order Details */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Order {order.order_number}</CardTitle>
                <OrderStatusBadge status={order.status} />
              </div>
              <p className="text-sm text-muted-foreground">
                Placed on {format(new Date(order.created_at), 'PPP')}
              </p>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Items
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.order_items?.map((item: any) => (
                <div key={item.id} className="flex gap-4">
                  <img
                    src={item.product_image_url}
                    alt={item.product_name}
                    className="w-20 h-20 object-cover rounded-md"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium">{item.product_name}</h4>
                    {item.product_code && (
                      <p className="text-sm text-muted-foreground">{item.product_code}</p>
                    )}
                    <div className="flex gap-1 mt-1">
                      {item.selected_size && (
                        <Badge variant="secondary" className="text-xs">Size: {item.selected_size}</Badge>
                      )}
                      {item.selected_color && (
                        <Badge variant="secondary" className="text-xs">{item.selected_color}</Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm">Quantity: {item.quantity}</span>
                      <span className="font-semibold">₹{typeof item.total_price === 'string' ? parseFloat(item.total_price).toFixed(2) : item.total_price.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Delivery Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{order.delivery_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{order.delivery_phone}</span>
                </div>
                <p className="text-sm text-muted-foreground pl-6">
                  {order.delivery_address_line_1}
                  {order.delivery_address_line_2 && `, ${order.delivery_address_line_2}`}
                </p>
                <p className="text-sm text-muted-foreground pl-6">
                  {order.delivery_city}, {order.delivery_state} - {order.delivery_pincode}
                </p>
              </div>
            </CardContent>
          </Card>

          {order.customer_notes && (
            <Card>
              <CardHeader>
                <CardTitle>Order Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{order.customer_notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Side - Summary & Timeline */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{typeof order.subtotal === 'string' ? parseFloat(order.subtotal).toFixed(2) : order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>₹{typeof order.shipping_charges === 'string' ? parseFloat(order.shipping_charges).toFixed(2) : order.shipping_charges.toFixed(2)}</span>
                </div>
              </div>
              <Separator />
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>₹{typeof order.total_amount === 'string' ? parseFloat(order.total_amount).toFixed(2) : order.total_amount.toFixed(2)}</span>
              </div>
              <div className="bg-muted p-3 rounded-md text-sm">
                <p className="font-medium mb-1">Payment Method</p>
                <p className="text-muted-foreground">Cash on Delivery</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderTimeline order={order} />
            </CardContent>
          </Card>

          {canCancel && (
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => cancelOrder.mutate()}
              disabled={cancelOrder.isPending}
            >
              Cancel Order
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
