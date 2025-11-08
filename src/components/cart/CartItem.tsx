import { Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/hooks/useCart';
import { calculateComboPrice, PriceCalculation } from '@/lib/calculateComboPrice';

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
      discount_percentage: number | null;
      combo_offers: Array<{ quantity: number; price: number }> | null;
    };
  };
  productGroupCalculation?: PriceCalculation & { totalQuantity: number };
}

export const CartItem = ({ item, productGroupCalculation }: CartItemProps) => {
  const { updateQuantity, removeFromCart } = useCart();
  const basePrice = item.products?.price || 0;
  const discount = item.products?.discount_percentage || 0;
  const comboOffers = item.products?.combo_offers || [];

  // Use product group calculation if available (combo across variations)
  const calculation = productGroupCalculation 
    ? {
        ...productGroupCalculation,
        finalPrice: (productGroupCalculation.finalPrice / productGroupCalculation.totalQuantity) * item.quantity,
        savings: (productGroupCalculation.savings / productGroupCalculation.totalQuantity) * item.quantity,
        originalPrice: (productGroupCalculation.originalPrice / productGroupCalculation.totalQuantity) * item.quantity,
      }
    : calculateComboPrice(item.quantity, basePrice, comboOffers, discount);
  
  const hasCombo = calculation.breakdown.some(b => b.type === 'combo');
  const isGroupCombo = !!productGroupCalculation && hasCombo;

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
            <div className="flex gap-1 mt-1 flex-wrap">
              {item.selected_size && (
                <Badge variant="secondary" className="text-xs">Size: {item.selected_size}</Badge>
              )}
              {item.selected_color && (
                <Badge variant="secondary" className="text-xs">{item.selected_color}</Badge>
              )}
              {hasCombo && (
                <Badge className="text-xs bg-green-600">
                  🎁 Combo {isGroupCombo ? 'Across Variations' : 'Deal'}
                </Badge>
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

        {/* Combo Breakdown */}
        {hasCombo && !isGroupCombo && (
          <div className="text-xs space-y-1 bg-muted/50 p-2 rounded">
            {calculation.breakdown.map((b, idx) => (
              <div key={idx} className="flex justify-between">
                {b.type === 'combo' ? (
                  <>
                    <span>🎁 {b.quantity} pcs @ ₹{b.price}</span>
                    <span className="font-medium">₹{b.price.toFixed(2)}</span>
                  </>
                ) : (
                  <>
                    <span>{b.quantity} pcs @ regular</span>
                    <span>₹{b.price.toFixed(2)}</span>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
        {isGroupCombo && (
          <div className="text-xs bg-muted/50 p-2 rounded">
            <p className="text-muted-foreground">
              ✨ Combo applied across all sizes/colors of this product
            </p>
          </div>
        )}

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
          <div className="text-right">
            <p className="font-semibold">₹{calculation.finalPrice.toFixed(2)}</p>
            {calculation.savings > 0 && (
              <p className="text-xs text-green-600">
                Save ₹{calculation.savings.toFixed(2)}
              </p>
            )}
            {calculation.originalPrice !== calculation.finalPrice && !hasCombo && (
              <p className="text-xs text-muted-foreground line-through">
                ₹{calculation.originalPrice.toFixed(2)}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
