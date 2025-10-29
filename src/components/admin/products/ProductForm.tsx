import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PRODUCT_CATEGORIES } from '@/lib/constants';
import { SizeColorManager } from './SizeColorManager';

const productSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(200),
  category: z.string().min(1, 'Category is required'),
  fabric: z.string().min(1, 'Fabric is required').max(100),
  description: z.string().optional().nullable(),
  image_url: z.string().optional().nullable(),
  additional_images: z.array(z.string()).default([]),
  hsn_code: z.string()
    .regex(/^\d{4,8}$/, 'HSN must be 4-8 digits')
    .optional()
    .or(z.literal(''))
    .nullable(),
  product_code: z.string().max(50).optional().or(z.literal('')).nullable(),
  price: z.string()
    .transform((val) => (val === '' ? null : parseFloat(val)))
    .refine((val) => val === null || val > 0, 'Price must be positive')
    .nullable(),
  discount_percentage: z.string()
    .transform((val) => (val === '' ? 0 : parseInt(val)))
    .refine((val) => val >= 0 && val <= 99, 'Discount must be between 0-99%')
    .default('0'),
  offer_messages: z.array(z.string()).default([]),
  display_order: z.string()
    .transform((val) => (val === '' ? 0 : parseInt(val)))
    .refine((val) => Number.isInteger(val), 'Must be a whole number'),
  is_active: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  is_new_arrival: z.boolean().default(false),
  is_signature: z.boolean().default(false),
  should_remove: z.boolean().default(false),
  available_sizes: z.array(z.string()).default([]),
  available_colors: z.array(z.object({
    name: z.string(),
    hex: z.string(),
  })).default([]),
});

export type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  onSubmit: (data: ProductFormData) => void;
  initialData?: any;
  isLoading?: boolean;
}

export function ProductForm({ onSubmit, initialData, isLoading }: ProductFormProps) {
  const [sizes, setSizes] = useState<string[]>(initialData?.available_sizes || []);
  const [colors, setColors] = useState<Array<{ name: string; hex: string }>>(initialData?.available_colors || []);
  const [additionalImages, setAdditionalImages] = useState<string[]>(initialData?.additional_images || []);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [offerMessages, setOfferMessages] = useState<string[]>(initialData?.offer_messages || []);
  const [newOfferMessage, setNewOfferMessage] = useState('');

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      is_active: initialData?.is_active ?? true,
      is_featured: initialData?.is_featured ?? false,
      is_new_arrival: initialData?.is_new_arrival ?? false,
      is_signature: initialData?.is_signature ?? false,
      should_remove: initialData?.should_remove ?? false,
      display_order: initialData?.display_order?.toString() || '0',
      price: initialData?.price?.toString() || '',
      discount_percentage: initialData?.discount_percentage?.toString() || '0',
      offer_messages: initialData?.offer_messages || [],
      name: initialData?.name || '',
      category: initialData?.category || '',
      fabric: initialData?.fabric || '',
      description: initialData?.description || '',
      image_url: initialData?.image_url || null,
      additional_images: initialData?.additional_images || [],
      hsn_code: initialData?.hsn_code || '',
      product_code: initialData?.product_code || '',
      available_sizes: initialData?.available_sizes || [],
      available_colors: initialData?.available_colors || [],
    },
  });

  const selectedCategory = watch('category');
  const isActive = watch('is_active');
  const isFeatured = watch('is_featured');
  const isNewArrival = watch('is_new_arrival');
  const isSignature = watch('is_signature');
  const shouldRemove = watch('should_remove');

  const handleFormSubmit = (data: ProductFormData) => {
    onSubmit({ ...data, available_sizes: sizes, available_colors: colors, additional_images: additionalImages, offer_messages: offerMessages });
  };

  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      setAdditionalImages([...additionalImages, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setAdditionalImages(additionalImages.filter((_, i) => i !== index));
  };

  const handleAddOfferMessage = () => {
    if (newOfferMessage.trim()) {
      setOfferMessages([...offerMessages, newOfferMessage.trim()]);
      setNewOfferMessage('');
    }
  };

  const handleRemoveOfferMessage = (index: number) => {
    setOfferMessages(offerMessages.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Product Name *</Label>
          <Input id="name" {...register('name')} />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <Select
            value={selectedCategory}
            onValueChange={(value) => setValue('category', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {PRODUCT_CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && (
            <p className="text-sm text-destructive">{errors.category.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="fabric">Fabric *</Label>
          <Input id="fabric" {...register('fabric')} />
          {errors.fabric && (
            <p className="text-sm text-destructive">{errors.fabric.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="image_url">Main Image URL (Optional)</Label>
          <Input id="image_url" type="text" {...register('image_url')} />
          {errors.image_url && (
            <p className="text-sm text-destructive">{errors.image_url.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Additional Images</Label>
        <div className="flex gap-2">
          <Input
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
            placeholder="Enter image URL"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddImage())}
          />
          <Button type="button" onClick={handleAddImage} variant="secondary">
            Add Image
          </Button>
        </div>
        {additionalImages.length > 0 && (
          <div className="grid grid-cols-1 gap-2 mt-2">
            {additionalImages.map((url, index) => (
              <div key={index} className="flex items-center gap-2 p-2 border rounded-md">
                <img src={url} alt={`Additional ${index + 1}`} className="w-16 h-16 object-cover rounded" />
                <span className="flex-1 text-sm truncate">{url}</span>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => handleRemoveImage(index)}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <div className="space-y-2">
          <Label htmlFor="hsn_code">HSN Code</Label>
          <Input id="hsn_code" {...register('hsn_code')} placeholder="e.g., 6203" />
          {errors.hsn_code && (
            <p className="text-sm text-destructive">{errors.hsn_code.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="product_code">Product Code</Label>
          <Input id="product_code" {...register('product_code')} placeholder="e.g., FF-001" />
          {errors.product_code && (
            <p className="text-sm text-destructive">{errors.product_code.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Price (₹)</Label>
          <Input id="price" type="number" step="0.01" {...register('price')} />
          {errors.price && (
            <p className="text-sm text-destructive">{errors.price.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="discount_percentage">Discount (%) - 0-99%</Label>
          <Input id="discount_percentage" type="number" min="0" max="99" {...register('discount_percentage')} />
          {errors.discount_percentage && (
            <p className="text-sm text-destructive">{errors.discount_percentage.message}</p>
          )}
        </div>

        <div className="space-y-3 md:col-span-2">
          <Label>Offer Messages (Optional)</Label>
          <div className="flex gap-2">
            <Input
              value={newOfferMessage}
              onChange={(e) => setNewOfferMessage(e.target.value)}
              placeholder="e.g., Limited Time Offer!"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddOfferMessage();
                }
              }}
            />
            <Button type="button" onClick={handleAddOfferMessage} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
          {offerMessages.length > 0 && (
            <div className="space-y-2">
              {offerMessages.map((message, index) => (
                <div key={index} className="flex items-center gap-2 p-2 border rounded-md bg-muted/30">
                  <Badge variant="secondary" className="flex-1">{message}</Badge>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveOfferMessage(index)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="display_order">Display Order</Label>
          <Input id="display_order" type="number" {...register('display_order')} />
          {errors.display_order && (
            <p className="text-sm text-destructive">{errors.display_order.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" {...register('description')} rows={4} />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description.message}</p>
        )}
      </div>

      <SizeColorManager
        sizes={sizes}
        colors={colors}
        onSizesChange={setSizes}
        onColorsChange={setColors}
      />

      <div className="flex flex-wrap gap-6">
        <div className="flex items-center space-x-2">
          <Switch
            id="is_active"
            checked={isActive}
            onCheckedChange={(checked) => setValue('is_active', checked)}
          />
          <Label htmlFor="is_active">Active</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="is_featured"
            checked={isFeatured}
            onCheckedChange={(checked) => setValue('is_featured', checked)}
          />
          <Label htmlFor="is_featured">Featured</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="is_new_arrival"
            checked={isNewArrival}
            onCheckedChange={(checked) => setValue('is_new_arrival', checked)}
          />
          <Label htmlFor="is_new_arrival">New Arrival</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="is_signature"
            checked={isSignature}
            onCheckedChange={(checked) => setValue('is_signature', checked)}
          />
          <Label htmlFor="is_signature">Signature Collection</Label>
        </div>

        <div className="flex items-center space-x-2 border border-destructive rounded-md p-2">
          <Switch
            id="should_remove"
            checked={shouldRemove}
            onCheckedChange={(checked) => setValue('should_remove', checked)}
          />
          <Label htmlFor="should_remove" className="text-destructive font-semibold">Remove from Website</Label>
        </div>
      </div>

      <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
        {isLoading ? 'Saving...' : initialData ? 'Update Product' : 'Add Product'}
      </Button>
    </form>
  );
}
