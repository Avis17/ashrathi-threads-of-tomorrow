import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, AlertTriangle } from 'lucide-react';
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
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState('');

  const addInventoryEntry = () => {
    if (!selectedSize || !selectedColor || !quantity) {
      alert('Please fill all fields');
      return;
    }

    const qty = parseInt(quantity);
    if (isNaN(qty) || qty < 0) {
      alert('Quantity must be a positive number');
      return;
    }

    const exists = inventory.some(
      inv => inv.size === selectedSize && inv.color === selectedColor
    );
    if (exists) {
      alert('This size-color combination already exists');
      return;
    }

    onInventoryChange([
      ...inventory,
      { size: selectedSize, color: selectedColor, quantity: qty }
    ]);

    setSelectedSize('');
    setSelectedColor('');
    setQuantity('');
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
        <Badge variant="secondary" className="text-sm">
          Total Stock: {totalStock} pieces
        </Badge>
      </div>

      {/* Add New Entry Form */}
      <div className="grid grid-cols-4 gap-2 p-3 bg-background rounded-lg border">
        <div>
          <Label className="text-xs mb-1">Size</Label>
          <select
            value={selectedSize}
            onChange={(e) => setSelectedSize(e.target.value)}
            className="w-full p-2 border rounded-md text-sm bg-background"
          >
            <option value="">Select Size</option>
            {availableSizes.map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>

        <div>
          <Label className="text-xs mb-1">Color</Label>
          <select
            value={selectedColor}
            onChange={(e) => setSelectedColor(e.target.value)}
            className="w-full p-2 border rounded-md text-sm bg-background"
          >
            <option value="">Select Color</option>
            {availableColors.map(color => (
              <option key={color.name} value={color.name}>{color.name}</option>
            ))}
          </select>
        </div>

        <div>
          <Label className="text-xs mb-1">Quantity</Label>
          <Input
            type="number"
            min="0"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="0"
            className="text-sm"
          />
        </div>

        <div className="flex items-end">
          <Button
            type="button"
            onClick={addInventoryEntry}
            size="sm"
            className="w-full"
            disabled={!availableSizes.length || !availableColors.length}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
      </div>

      {!availableSizes.length || !availableColors.length ? (
        <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-900">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            Please add sizes and colors first to manage inventory
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