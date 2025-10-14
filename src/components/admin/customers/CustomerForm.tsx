import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { INDIAN_STATES } from '@/lib/constants';

const customerSchema = z.object({
  company_name: z.string().min(1, 'Company name is required').max(200),
  email: z.string().email('Invalid email address').max(255),
  phone: z.string().min(10, 'Phone must be at least 10 digits').max(15),
  alt_phone: z.string().max(15).optional(),
  gst_number: z.string()
    .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GST number format')
    .optional()
    .or(z.literal('')),
  address_1: z.string().min(1, 'Address is required').max(500),
  address_2: z.string().max(500).optional(),
  city: z.string().min(1, 'City is required').max(100),
  state: z.string().min(1, 'State is required'),
  pincode: z.string().min(6, 'Pincode must be 6 digits').max(6),
  country: z.string().default('India'),
});

export type CustomerFormData = z.infer<typeof customerSchema>;

interface CustomerFormProps {
  onSubmit: (data: CustomerFormData) => void;
  initialData?: Partial<CustomerFormData>;
  isLoading?: boolean;
}

export function CustomerForm({ onSubmit, initialData, isLoading }: CustomerFormProps) {
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      country: 'India',
      ...initialData,
    },
  });

  const selectedState = watch('state');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="company_name">Company Name *</Label>
          <Input id="company_name" {...register('company_name')} />
          {errors.company_name && (
            <p className="text-sm text-destructive">{errors.company_name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input id="email" type="email" {...register('email')} />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone *</Label>
          <Input id="phone" {...register('phone')} />
          {errors.phone && (
            <p className="text-sm text-destructive">{errors.phone.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="alt_phone">Alternate Phone</Label>
          <Input id="alt_phone" {...register('alt_phone')} />
          {errors.alt_phone && (
            <p className="text-sm text-destructive">{errors.alt_phone.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="gst_number">GST Number</Label>
          <Input id="gst_number" {...register('gst_number')} placeholder="22AAAAA0000A1Z5" />
          {errors.gst_number && (
            <p className="text-sm text-destructive">{errors.gst_number.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Address Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address_1">Address Line 1 *</Label>
            <Input id="address_1" {...register('address_1')} />
            {errors.address_1 && (
              <p className="text-sm text-destructive">{errors.address_1.message}</p>
            )}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address_2">Address Line 2</Label>
            <Input id="address_2" {...register('address_2')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">State *</Label>
            <Select
              value={selectedState}
              onValueChange={(value) => setValue('state', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                {INDIAN_STATES.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.state && (
              <p className="text-sm text-destructive">{errors.state.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">City *</Label>
            <Input id="city" {...register('city')} />
            {errors.city && (
              <p className="text-sm text-destructive">{errors.city.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="pincode">Pincode *</Label>
            <Input id="pincode" {...register('pincode')} maxLength={6} />
            {errors.pincode && (
              <p className="text-sm text-destructive">{errors.pincode.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">Country *</Label>
            <Input id="country" {...register('country')} disabled />
          </div>
        </div>
      </div>

      <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
        {isLoading ? 'Saving...' : initialData ? 'Update Customer' : 'Add Customer'}
      </Button>
    </form>
  );
}