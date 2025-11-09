import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

interface SizeColorManagerProps {
  sizes: string[];
  colors: Array<{ name: string; hex: string; image_url?: string }>;
  onSizesChange: (sizes: string[]) => void;
  onColorsChange: (colors: Array<{ name: string; hex: string; image_url?: string }>) => void;
}

const STANDARD_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

export function SizeColorManager({ sizes, colors, onSizesChange, onColorsChange }: SizeColorManagerProps) {
  const [customSize, setCustomSize] = useState('');
  const [newColor, setNewColor] = useState({ name: '', hex: '#000000', image_url: '' });

  const toggleStandardSize = (size: string) => {
    if (sizes.includes(size)) {
      onSizesChange(sizes.filter(s => s !== size));
    } else {
      onSizesChange([...sizes, size]);
    }
  };

  const addCustomSize = () => {
    if (customSize && !sizes.includes(customSize)) {
      onSizesChange([...sizes, customSize]);
      setCustomSize('');
    }
  };

  const removeSize = (size: string) => {
    onSizesChange(sizes.filter(s => s !== size));
  };

  const addColor = () => {
    if (newColor.name && !colors.find(c => c.name === newColor.name)) {
      onColorsChange([...colors, newColor]);
      setNewColor({ name: '', hex: '#000000', image_url: '' });
    }
  };

  const removeColor = (colorName: string) => {
    onColorsChange(colors.filter(c => c.name !== colorName));
  };

  return (
    <div className="space-y-6 border rounded-lg p-4">
      {/* Sizes Section */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Available Sizes</Label>
        
        {/* Standard Sizes */}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Standard Sizes</p>
          <div className="flex flex-wrap gap-2">
            {STANDARD_SIZES.map((size) => (
              <div key={size} className="flex items-center space-x-2">
                <Checkbox
                  id={`size-${size}`}
                  checked={sizes.includes(size)}
                  onCheckedChange={() => toggleStandardSize(size)}
                />
                <Label htmlFor={`size-${size}`} className="cursor-pointer">
                  {size}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Custom Size */}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Custom Size</p>
          <div className="flex gap-2">
            <Input
              placeholder="e.g., Free Size"
              value={customSize}
              onChange={(e) => setCustomSize(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomSize())}
            />
            <Button type="button" onClick={addCustomSize} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Selected Sizes */}
        {sizes.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => (
              <Badge key={size} variant="secondary" className="gap-1">
                {size}
                <button
                  type="button"
                  onClick={() => removeSize(size)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Colors Section */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Available Colors</Label>
        
        <div className="grid gap-2">
          <div className="flex gap-2">
            <Input
              placeholder="Color name"
              value={newColor.name}
              onChange={(e) => setNewColor({ ...newColor, name: e.target.value })}
            />
            <Input
              type="color"
              value={newColor.hex}
              onChange={(e) => setNewColor({ ...newColor, hex: e.target.value })}
              className="w-20"
            />
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Color image URL (e.g., /products/black-shirt.jpg)"
              value={newColor.image_url}
              onChange={(e) => setNewColor({ ...newColor, image_url: e.target.value })}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addColor())}
            />
            <Button type="button" onClick={addColor} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Add the product image URL that shows this specific color variant
          </p>
        </div>

        {/* Selected Colors */}
        {colors.length > 0 && (
          <div className="space-y-2">
            {colors.map((color) => (
              <div key={color.name} className="flex items-center gap-2 p-2 border rounded-md bg-muted/30">
                <div
                  className="w-10 h-10 rounded-full border-2"
                  style={{ backgroundColor: color.hex }}
                />
                <div className="flex-1">
                  <div className="font-medium">{color.name}</div>
                  {color.image_url && (
                    <div className="text-xs text-muted-foreground truncate">
                      {color.image_url}
                    </div>
                  )}
                </div>
                {color.image_url && (
                  <img 
                    src={color.image_url} 
                    alt={color.name} 
                    className="w-12 h-12 object-cover rounded border" 
                  />
                )}
                <button
                  type="button"
                  onClick={() => removeColor(color.name)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
