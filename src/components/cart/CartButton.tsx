import { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/hooks/useCart';
import { Sheet, SheetTrigger } from '@/components/ui/sheet';
import { CartDrawer } from './CartDrawer';

export const CartButton = () => {
  const { cartCount } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-[#111111]/80 hover:text-[#1EC9FF] hover:bg-transparent">
          <ShoppingCart className="h-5 w-5" />
          {cartCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {cartCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <CartDrawer onClose={() => setOpen(false)} />
    </Sheet>
  );
};
