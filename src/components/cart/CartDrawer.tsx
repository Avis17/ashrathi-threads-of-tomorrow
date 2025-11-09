import { useNavigate } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import {
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCart } from '@/hooks/useCart';
import { CartItem } from './CartItem';
import { ScrollArea } from '@/components/ui/scroll-area';
import { calculateComboPrice } from '@/lib/calculateComboPrice';

interface CartDrawerProps {
  onClose?: () => void;
}

export const CartDrawer = ({ onClose }: CartDrawerProps) => {
  const navigate = useNavigate();
  const { 
    cartItems, 
    cartCount,
    selectedCartItems,
    selectedCartTotal,
    toggleItemSelection,
    toggleAllSelection 
  } = useCart();

  const allSelected = selectedCartItems.length === cartItems.length && cartItems.length > 0;
  const someSelected = selectedCartItems.length > 0 && selectedCartItems.length < cartItems.length;

  // Group items by product_id to apply combos across variations
  const groupedByProduct = cartItems.reduce((acc, item) => {
    const productId = item.product_id;
    if (!acc[productId]) {
      acc[productId] = {
        items: [],
        totalQuantity: 0,
        basePrice: item.products?.price || 0,
        discount: item.products?.discount_percentage || 0,
        comboOffers: item.products?.combo_offers || [],
      };
    }
    acc[productId].items.push(item);
    acc[productId].totalQuantity += item.quantity;
    return acc;
  }, {} as Record<string, any>);

  // Calculate combo for each product group
  const productGroupCalculations = Object.entries(groupedByProduct).reduce((acc, [productId, group]: [string, any]) => {
    const calculation = calculateComboPrice(
      group.totalQuantity,
      group.basePrice,
      group.comboOffers,
      group.discount
    );
    acc[productId] = {
      ...calculation,
      totalQuantity: group.totalQuantity,
    };
    return acc;
  }, {} as Record<string, any>);

  const handleCheckout = () => {
    navigate('/checkout');
    onClose?.();
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
        <div className="flex items-center gap-2 pt-2 border-t">
          <Checkbox
            checked={allSelected}
            onCheckedChange={(checked) => toggleAllSelection(!!checked)}
            className={someSelected ? "data-[state=checked]:bg-primary" : ""}
          />
          <Label className="text-sm font-medium cursor-pointer" onClick={() => toggleAllSelection(!allSelected)}>
            Select All ({selectedCartItems.length} of {cartItems.length})
          </Label>
        </div>
      </SheetHeader>

      <ScrollArea className="flex-1 -mx-6 px-6">
        <div className="space-y-4 py-4">
          {cartItems.map((item) => (
            <CartItem 
              key={item.id} 
              item={item}
              productGroupCalculation={productGroupCalculations[item.product_id]}
              isSelected={item.selected_for_checkout}
              onToggleSelect={toggleItemSelection}
            />
          ))}
        </div>
      </ScrollArea>

      <div className="space-y-4 pt-4">
        <Separator />
        
        {/* Summary Stats */}
        {selectedCartItems.length < cartItems.length && (
          <div className="bg-muted/30 p-3 rounded-lg">
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Items in cart:</span>
                <span>{cartItems.length}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Selected for checkout:</span>
                <span className="text-primary">{selectedCartItems.length}</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Saved for later:</span>
                <span>{cartItems.length - selectedCartItems.length}</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between text-lg font-semibold">
          <span>
            Total
            {selectedCartItems.length < cartItems.length && (
              <span className="text-sm font-normal text-muted-foreground ml-1">
                ({selectedCartItems.length} selected)
              </span>
            )}
          </span>
          <span>₹{selectedCartTotal.toFixed(2)}</span>
        </div>

        {selectedCartItems.length === 0 && (
          <Alert>
            <AlertDescription>
              Please select at least one item to checkout
            </AlertDescription>
          </Alert>
        )}

        <SheetFooter>
          <Button 
            onClick={handleCheckout} 
            className="w-full" 
            size="lg"
            disabled={selectedCartItems.length === 0}
          >
            Checkout {selectedCartItems.length > 0 && `(${selectedCartItems.length} items)`}
          </Button>
        </SheetFooter>
      </div>
    </SheetContent>
  );
};
