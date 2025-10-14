import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { AddressSelector } from '@/components/checkout/AddressSelector';
import { Loader2, ArrowLeft } from 'lucide-react';

interface DeliveryAddress {
  id: string;
  full_name: string;
  phone: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  pincode: string;
  is_default?: boolean;
}

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, cartTotal, clearCart } = useCart();
  const [selectedAddress, setSelectedAddress] = useState<DeliveryAddress | null>(null);
  const [customerNotes, setCustomerNotes] = useState('');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth?redirect=/checkout');
      return;
    }
    if (cartItems.length === 0) {
      navigate('/products');
      toast({
        title: 'Cart is empty',
        description: 'Please add some products to your cart first',
      });
    }
  }, [user, cartItems, navigate]);

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast({
        title: 'Address Required',
        description: 'Please select a delivery address',
        variant: 'destructive',
      });
      return;
    }

    setIsPlacingOrder(true);

    try {
      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user!.id,
          delivery_name: selectedAddress.full_name,
          delivery_phone: selectedAddress.phone,
          delivery_address_line_1: selectedAddress.address_line_1,
          delivery_address_line_2: selectedAddress.address_line_2,
          delivery_city: selectedAddress.city,
          delivery_state: selectedAddress.state,
          delivery_pincode: selectedAddress.pincode,
          subtotal: cartTotal,
          shipping_charges: 0,
          total_amount: cartTotal,
          customer_notes: customerNotes || null,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cartItems.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.products.name,
        product_code: item.products.product_code,
        product_image_url: item.products.image_url,
        quantity: item.quantity,
        unit_price: item.products.price || 0,
        total_price: (item.products.price || 0) * item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Clear cart
      await clearCart();

      toast({
        title: 'Order Placed Successfully!',
        description: `Your order ${order.order_number} has been placed`,
      });

      navigate(`/my-orders/${order.id}`);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to place order',
        variant: 'destructive',
      });
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (!user || cartItems.length === 0) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <Button
        variant="ghost"
        onClick={() => navigate('/products')}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Continue Shopping
      </Button>

      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Left Side - Address Selection */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Address</CardTitle>
            </CardHeader>
            <CardContent>
              <AddressSelector
                selectedAddress={selectedAddress}
                onSelectAddress={setSelectedAddress}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Additional Notes (Optional)</CardTitle>
            </CardHeader>
            <CardContent>
              <Label htmlFor="notes">Order Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any special instructions for your order..."
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                className="mt-2"
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Side - Order Summary */}
        <div>
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="flex-1">
                      {item.products.name} x {item.quantity}
                    </span>
                    <span className="font-medium">
                      ₹{((item.products.price || 0) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>₹{cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span className="text-green-600">FREE</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>₹{cartTotal.toFixed(2)}</span>
              </div>

              <div className="bg-muted p-3 rounded-md text-sm">
                <p className="font-medium mb-1">Payment Method</p>
                <p className="text-muted-foreground">Cash on Delivery (COD)</p>
              </div>

              <Button
                onClick={handlePlaceOrder}
                disabled={!selectedAddress || isPlacingOrder}
                className="w-full"
                size="lg"
              >
                {isPlacingOrder && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Place Order
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
