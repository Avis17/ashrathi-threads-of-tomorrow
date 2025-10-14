import { useNavigate } from 'react-router-dom';
import { ShoppingBag, X } from 'lucide-react';
import {
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/hooks/useCart';
import { CartItem } from './CartItem';
import { ScrollArea } from '@/components/ui/scroll-area';

export const CartDrawer = () => {
  const navigate = useNavigate();
  const { cartItems, cartTotal, cartCount } = useCart();

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (cartItems.length === 0) {
    return (
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Shopping Cart</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col items-center justify-center h-full -mt-16">
          <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-lg font-medium">Your cart is empty</p>
          <p className="text-sm text-muted-foreground text-center mt-2">
            Add some products to get started
          </p>
        </div>
      </SheetContent>
    );
  }

  return (
    <SheetContent className="w-full sm:max-w-md flex flex-col">
      <SheetHeader>
        <SheetTitle>Shopping Cart ({cartCount} items)</SheetTitle>
      </SheetHeader>

      <ScrollArea className="flex-1 -mx-6 px-6">
        <div className="space-y-4 py-4">
          {cartItems.map((item) => (
            <CartItem key={item.id} item={item} />
          ))}
        </div>
      </ScrollArea>

      <div className="space-y-4 pt-4">
        <Separator />
        <div className="flex justify-between text-lg font-semibold">
          <span>Total</span>
          <span>₹{cartTotal.toFixed(2)}</span>
        </div>
        <SheetFooter>
          <Button onClick={handleCheckout} className="w-full" size="lg">
            Proceed to Checkout
          </Button>
        </SheetFooter>
      </div>
    </SheetContent>
  );
};
