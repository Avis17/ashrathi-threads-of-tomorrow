import { Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/hooks/useCart';

interface CartItemProps {
  item: {
    id: string;
    quantity: number;
    selected_size: string | null;
    selected_color: string | null;
    products: {
      id: string;
      name: string;
      image_url: string;
      price: number | null;
      product_code: string | null;
    };
  };
}

export const CartItem = ({ item }: CartItemProps) => {
  const { updateQuantity, removeFromCart } = useCart();
  const price = item.products?.price || 0;

  return (
    <div className="flex gap-4 animate-fade-in">
      <img
        src={item.products.image_url}
        alt={item.products.name}
        className="w-20 h-20 object-cover rounded-md"
      />
      <div className="flex-1 space-y-2">
        <div className="flex justify-between">
          <div>
            <h4 className="font-medium">{item.products.name}</h4>
            {item.products.product_code && (
              <p className="text-sm text-muted-foreground">
                {item.products.product_code}
              </p>
            )}
            <div className="flex gap-1 mt-1">
              {item.selected_size && (
                <Badge variant="secondary" className="text-xs">Size: {item.selected_size}</Badge>
              )}
              {item.selected_color && (
                <Badge variant="secondary" className="text-xs">{item.selected_color}</Badge>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => removeFromCart(item.id)}
            className="h-8 w-8"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => updateQuantity({ cartItemId: item.id, quantity: Math.max(1, item.quantity - 1) })}
              className="h-8 w-8"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-8 text-center">{item.quantity}</span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => updateQuantity({ cartItemId: item.id, quantity: item.quantity + 1 })}
              className="h-8 w-8"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <p className="font-semibold">₹{(price * item.quantity).toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
};
