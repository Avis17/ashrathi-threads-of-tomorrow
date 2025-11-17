import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Trash2, AlertTriangle } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface InventoryEntry {
  size: string;
  color: string;
  quantity: number;
}

interface InventoryManagerProps {
  inventory: InventoryEntry[];
  availableSizes: string[];
  availableColors: Array<{ name: string; hex: string }>;
  onInventoryChange: (inventory: InventoryEntry[]) => void;
}

export function InventoryManager({ 
  inventory, 
  availableSizes, 
  availableColors, 
  onInventoryChange 
}: InventoryManagerProps) {
  // Auto-generate inventory combinations when sizes or colors change
  useEffect(() => {
    if (availableSizes.length > 0 && availableColors.length > 0) {
      syncInventoryWithCombinations();
    }
  }, [availableSizes, availableColors]);

  const syncInventoryWithCombinations = () => {
    const newInventory: InventoryEntry[] = [];
    
    // Generate all possible combinations
    availableSizes.forEach(size => {
      availableColors.forEach(color => {
        // Check if this combination already exists
        const existing = inventory.find(
          inv => inv.size === size && inv.color === color.name
        );
        
        // Preserve existing quantity or default to 0
        newInventory.push({
          size,
          color: color.name,
          quantity: existing?.quantity || 0
        });
      });
    });
    
    onInventoryChange(newInventory);
  };

  const removeEntry = (index: number) => {
    onInventoryChange(inventory.filter((_, i) => i !== index));
  };

  const updateQuantity = (index: number, newQty: string) => {
    const qty = parseInt(newQty);
    if (isNaN(qty) || qty < 0) return;

    const updated = [...inventory];
    updated[index].quantity = qty;
    onInventoryChange(updated);
  };

  const totalStock = inventory.reduce((sum, inv) => sum + inv.quantity, 0);

  return (
    <div className="space-y-4 border rounded-lg p-4 bg-muted/20">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">📦 Inventory Management</Label>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="text-sm">
            Total Stock: {totalStock} pieces
          </Badge>
          <Button
            type="button"
            onClick={syncInventoryWithCombinations}
            size="sm"
            variant="outline"
            disabled={!availableSizes.length || !availableColors.length}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Sync Grid
          </Button>
        </div>
      </div>

      {!availableSizes.length || !availableColors.length ? (
        <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-900">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            Please add sizes and colors first. Inventory will auto-generate all size-color combinations.
          </p>
        </div>
      ) : null}

      {/* Inventory Table */}
      {inventory.length > 0 ? (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Size</TableHead>
                <TableHead>Color</TableHead>
                <TableHead>Available Qty</TableHead>
                <TableHead className="w-[100px]">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventory.map((inv, index) => {
                const colorObj = availableColors.find(c => c.name === inv.color);
                return (
                  <TableRow key={`${inv.size}-${inv.color}`}>
                    <TableCell>
                      <Badge variant="outline">{inv.size}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {colorObj && (
                          <div
                            className="w-4 h-4 rounded-full border"
                            style={{ backgroundColor: colorObj.hex }}
                          />
                        )}
                        <span>{inv.color}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        value={inv.quantity}
                        onChange={(e) => updateQuantity(index, e.target.value)}
                        className="w-24"
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeEntry(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground text-sm">
          No inventory entries yet. Add size-color combinations above.
        </div>
      )}
    </div>
  );
}