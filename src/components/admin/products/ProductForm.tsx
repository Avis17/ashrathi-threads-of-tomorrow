import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PRODUCT_CATEGORIES } from '@/lib/constants';

const productSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(200),
  category: z.string().min(1, 'Category is required'),
  fabric: z.string().min(1, 'Fabric is required').max(100),
  description: z.string().optional().nullable(),
  image_url: z.string().url('Must be a valid URL'),
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
  display_order: z.string()
    .transform((val) => (val === '' ? 0 : parseInt(val)))
    .refine((val) => Number.isInteger(val), 'Must be a whole number'),
  is_active: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  is_new_arrival: z.boolean().default(false),
  is_signature: z.boolean().default(false),
});

export type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  onSubmit: (data: ProductFormData) => void;
  initialData?: any;
  isLoading?: boolean;
}

export function ProductForm({ onSubmit, initialData, isLoading }: ProductFormProps) {
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      is_active: initialData?.is_active ?? true,
      is_featured: initialData?.is_featured ?? false,
      is_new_arrival: initialData?.is_new_arrival ?? false,
      is_signature: initialData?.is_signature ?? false,
      display_order: initialData?.display_order?.toString() || '0',
      price: initialData?.price?.toString() || '',
      name: initialData?.name || '',
      category: initialData?.category || '',
      fabric: initialData?.fabric || '',
      description: initialData?.description || '',
      image_url: initialData?.image_url || '',
      hsn_code: initialData?.hsn_code || '',
      product_code: initialData?.product_code || '',
    },
  });

  const selectedCategory = watch('category');
  const isActive = watch('is_active');
  const isFeatured = watch('is_featured');
  const isNewArrival = watch('is_new_arrival');
  const isSignature = watch('is_signature');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
          <Label htmlFor="image_url">Image URL *</Label>
          <Input id="image_url" type="url" {...register('image_url')} />
          {errors.image_url && (
            <p className="text-sm text-destructive">{errors.image_url.message}</p>
          )}
        </div>

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
      </div>

      <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
        {isLoading ? 'Saving...' : initialData ? 'Update Product' : 'Add Product'}
      </Button>
    </form>
  );
}
