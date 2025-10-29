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
import { Badge } from '@/components/ui/badge';

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

      // Create order items with discounted prices
      const orderItems = cartItems.map((item) => {
        const basePrice = item.products.price || 0;
        const discount = item.products.discount_percentage || 0;
        const unitPrice = discount > 0 ? basePrice * (1 - discount / 100) : basePrice;
        
        return {
          order_id: order.id,
          product_id: item.product_id,
          product_name: item.products.name,
          product_code: item.products.product_code,
          product_image_url: item.products.image_url,
          quantity: item.quantity,
          unit_price: unitPrice,
          total_price: unitPrice * item.quantity,
          selected_size: item.selected_size,
          selected_color: item.selected_color,
        };
      });

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
          <Card className="sticky top-4 border-2">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5">
              <CardTitle className="text-xl">Order Summary</CardTitle>
              <p className="text-sm text-muted-foreground">{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}</p>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {/* Items List */}
              <div className="space-y-4">
                {cartItems.map((item) => {
                  const basePrice = item.products.price || 0;
                  const discount = item.products.discount_percentage || 0;
                  const discountedPrice = discount > 0 ? basePrice * (1 - discount / 100) : basePrice;
                  const itemTotal = discountedPrice * item.quantity;
                  const originalTotal = basePrice * item.quantity;
                  
                  return (
                    <div key={item.id} className="space-y-2 pb-3 border-b border-border/50 last:border-0 animate-fade-in">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 pr-2">
                          <p className="font-medium text-sm leading-tight">{item.products.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Qty: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          {discount > 0 ? (
                            <div className="space-y-0.5">
                              <p className="font-bold text-sm">₹{itemTotal.toFixed(2)}</p>
                              <p className="text-xs text-muted-foreground line-through">₹{originalTotal.toFixed(2)}</p>
                            </div>
                          ) : (
                            <p className="font-bold text-sm">₹{itemTotal.toFixed(2)}</p>
                          )}
                        </div>
                      </div>
                      {discount > 0 && (
                        <div className="flex items-center gap-1.5">
                          <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300 text-xs">
                            {discount}% OFF
                          </Badge>
                          <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                            You save ₹{(originalTotal - itemTotal).toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <Separator className="my-4" />

              {/* Price Breakdown */}
              <div className="space-y-3">
                {(() => {
                  const originalTotal = cartItems.reduce((total, item) => {
                    const basePrice = item.products.price || 0;
                    return total + (basePrice * item.quantity);
                  }, 0);
                  const totalSavings = originalTotal - cartTotal;
                  const hasDiscount = totalSavings > 0;

                  return (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Original Price</span>
                        <span className={hasDiscount ? "line-through text-muted-foreground" : "font-medium"}>
                          ₹{originalTotal.toFixed(2)}
                        </span>
                      </div>
                      
                      {hasDiscount && (
                        <div className="flex justify-between text-sm animate-fade-in">
                          <span className="text-green-600 dark:text-green-400 font-medium">Discount Savings</span>
                          <span className="text-green-600 dark:text-green-400 font-bold">
                            - ₹{totalSavings.toFixed(2)}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Delivery Charges</span>
                        <span className="text-green-600 dark:text-green-400 font-semibold">FREE</span>
                      </div>

                      {hasDiscount && (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-200 dark:border-green-800 rounded-lg p-3 animate-fade-in">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="bg-green-500 rounded-full p-1">
                                <svg className="w-4 h-4 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                  <path d="M5 13l4 4L19 7"></path>
                                </svg>
                              </div>
                              <div>
                                <p className="text-sm font-bold text-green-700 dark:text-green-300">Total Savings</p>
                                <p className="text-xs text-green-600 dark:text-green-400">You're saving big!</p>
                              </div>
                            </div>
                            <p className="text-lg font-bold text-green-700 dark:text-green-300">
                              ₹{totalSavings.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>

              <Separator className="my-4" />

              {/* Final Total */}
              <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-4 animate-scale-in">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
                    <p className="text-2xl font-bold text-foreground">₹{cartTotal.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="default" className="bg-primary text-primary-foreground">
                      Final Price
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-muted/50 p-3 rounded-lg border border-border/50">
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 rounded-full p-2">
                    <svg className="w-4 h-4 text-primary" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Payment Method</p>
                    <p className="text-xs text-muted-foreground">Cash on Delivery (COD)</p>
                  </div>
                </div>
              </div>

              {/* Place Order Button */}
              <Button
                onClick={handlePlaceOrder}
                disabled={!selectedAddress || isPlacingOrder}
                className="w-full mt-4 hover-scale"
                size="lg"
              >
                {isPlacingOrder && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isPlacingOrder ? 'Placing Order...' : 'Place Order Securely'}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                🔒 Secure checkout • Safe payment
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
