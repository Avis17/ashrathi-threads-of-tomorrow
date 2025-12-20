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
import { calculateComboPrice } from '@/lib/calculateComboPrice';

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
              image_url,
              price,
              discount_percentage,
              combo_offers
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
      // Get order items to restore inventory
      const { data: orderItems } = await supabase
        .from('order_items')
        .select('product_id, selected_size, selected_color, quantity')
        .eq('order_id', orderId!);

      // Update order status
      const { error } = await supabase
        .from('orders')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
        })
        .eq('id', orderId!);

      if (error) throw error;

      // Restore inventory for each item
      if (orderItems) {
        for (const item of orderItems) {
          if (item.selected_size && item.selected_color) {
            await supabase.rpc('restore_inventory_on_cancel', {
              p_product_id: item.product_id,
              p_size: item.selected_size,
              p_color: item.selected_color,
              p_quantity: item.quantity,
            });
          }
        }
      }
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

  // Group items by product_id and calculate combo pricing
  const groupedByProduct = order.order_items?.reduce((acc: any, item: any) => {
    const productId = item.product_id;
    if (!acc[productId]) {
      acc[productId] = {
        items: [],
        totalQuantity: 0,
        basePrice: item.products?.price || 0,
        discount: item.products?.discount_percentage || 0,
        comboOffers: item.products?.combo_offers || [],
        productName: item.products?.name || item.product_name,
      };
    }
    acc[productId].items.push(item);
    acc[productId].totalQuantity += item.quantity;
    return acc;
  }, {} as Record<string, any>) || {};

  const productCalculations = Object.entries(groupedByProduct).map(([productId, group]: [string, any]) => ({
    productId,
    calculation: calculateComboPrice(
      group.totalQuantity,
      group.basePrice,
      group.comboOffers,
      group.discount
    ),
    ...group,
  }));

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Button 
        variant="outline" 
        onClick={() => navigate('/my-orders')} 
        className="mb-6 flex items-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
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
            <CardContent className="space-y-6">
              {productCalculations.map(({ productId, calculation, items, productName, totalQuantity }) => {
                const hasCombo = calculation.breakdown.some((b: any) => b.type === 'combo');
                
                return (
                  <div key={productId} className="border-b pb-4 last:border-b-0">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-lg">{productName}</h4>
                        <p className="text-sm text-muted-foreground">Total: {totalQuantity} pieces</p>
                      </div>
                      {hasCombo && (
                        <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                          🎁 Combo Applied
                        </Badge>
                      )}
                    </div>

                    {/* Variations */}
                    <div className="space-y-2 mb-3">
                      {items.map((item: any) => (
                        <div key={item.id} className="flex gap-3 text-sm">
                          <img
                            src={item.product_image_url}
                            alt={item.product_name}
                            className="w-16 h-16 object-cover rounded-md"
                          />
                          <div className="flex-1">
                            {item.product_code && (
                              <p className="text-xs text-muted-foreground">{item.product_code}</p>
                            )}
                            <div className="flex gap-2 mt-1">
                              {item.selected_size && (
                                <Badge variant="outline" className="text-xs">
                                  {item.selected_size}
                                </Badge>
                              )}
                              {item.selected_color && (
                                <Badge variant="outline" className="text-xs">
                                  {item.selected_color}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs mt-1">Qty: {item.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Combo Breakdown */}
                    {calculation.breakdown.length > 1 && (
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg p-3 mb-3">
                        <p className="text-xs font-semibold mb-2 text-green-800 dark:text-green-200">
                          💰 Price Breakdown:
                        </p>
                        <div className="space-y-1">
                          {calculation.breakdown.map((b: any, idx: number) => (
                            <div key={idx} className="flex justify-between text-xs">
                              <span className="text-muted-foreground">
                                {b.type === 'combo' 
                                  ? `🎁 ${b.quantity} pieces (combo)`
                                  : `${b.quantity} pieces (regular)`
                                }
                              </span>
                              <span className="font-medium">₹{b.price.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Price Summary for this product */}
                    <div className="flex justify-between items-end">
                      <div>
                        {calculation.savings > 0 && (
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground line-through">
                              Original: ₹{calculation.originalPrice.toFixed(2)}
                            </p>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                                🎉 You Saved ₹{calculation.savings.toFixed(2)}!
                              </Badge>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-primary">
                          ₹{calculation.finalPrice.toFixed(2)}
                        </p>
                        {calculation.savings > 0 && (
                          <p className="text-xs text-green-600 dark:text-green-400 font-semibold">
                            {((calculation.savings / calculation.originalPrice) * 100).toFixed(0)}% OFF
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
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
          <Card className="border-2 border-primary/20">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(() => {
                const totalSavings = productCalculations.reduce(
                  (sum, p) => sum + p.calculation.savings, 
                  0
                );
                const originalTotal = productCalculations.reduce(
                  (sum, p) => sum + p.calculation.originalPrice, 
                  0
                );

                return (
                  <>
                    {totalSavings > 0 && (
                      <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-4 rounded-lg text-center mb-4">
                        <p className="text-sm font-medium mb-1">🎊 Congratulations!</p>
                        <p className="text-2xl font-bold">You Saved ₹{totalSavings.toFixed(2)}</p>
                        <p className="text-xs mt-1 opacity-90">
                          {((totalSavings / originalTotal) * 100).toFixed(0)}% off your order
                        </p>
                      </div>
                    )}

                    <div className="space-y-2 text-sm">
                      {totalSavings > 0 && (
                        <div className="flex justify-between text-muted-foreground">
                          <span>Original Total</span>
                          <span className="line-through">₹{originalTotal.toFixed(2)}</span>
                        </div>
                      )}
                      {totalSavings > 0 && (
                        <div className="flex justify-between text-green-600 dark:text-green-400 font-semibold">
                          <span>Combo Savings</span>
                          <span>-₹{totalSavings.toFixed(2)}</span>
                        </div>
                      )}
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
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total Paid</span>
                      <span className="text-primary">₹{typeof order.total_amount === 'string' ? parseFloat(order.total_amount).toFixed(2) : order.total_amount.toFixed(2)}</span>
                    </div>
                    <div className="bg-muted p-3 rounded-md text-sm">
                      <p className="font-medium mb-1">Payment Method</p>
                      <p className="text-muted-foreground capitalize">
                        {order.payment_method.replace('_', ' ')}
                      </p>
                    </div>
                  </>
                );
              })()}
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
