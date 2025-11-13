import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateJobStyle, useUpdateJobStyle, type JobStyle } from '@/hooks/useJobStyles';
import { Scissors, Zap, Flame, CheckCircle, Package } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';

interface StyleFormProps {
  style?: JobStyle | null;
  onClose: () => void;
}

type StyleFormData = Database['public']['Tables']['job_styles']['Insert'];

const StyleForm = ({ style, onClose }: StyleFormProps) => {
  const createMutation = useCreateJobStyle();
  const updateMutation = useUpdateJobStyle();
  
  const { register, handleSubmit, setValue, watch } = useForm<StyleFormData>({
    defaultValues: style ? {
      style_code: style.style_code,
      pattern_number: style.pattern_number,
      style_name: style.style_name,
      garment_type: style.garment_type,
      category: style.category,
      fabric_type: style.fabric_type,
      gsm_range: style.gsm_range,
      season: style.season,
      fit: style.fit,
      fabric_per_piece: style.fabric_per_piece,
      rate_cutting: style.rate_cutting,
      rate_stitching_singer: style.rate_stitching_singer,
      rate_stitching_power_table: style.rate_stitching_power_table,
      rate_ironing: style.rate_ironing,
      rate_checking: style.rate_checking,
      rate_packing: style.rate_packing,
    } : {
      style_code: '',
      pattern_number: '',
      style_name: '',
      garment_type: 'kids',
      category: '',
      fabric_type: '',
      gsm_range: '',
      season: 'all-season',
      fit: 'regular',
      fabric_per_piece: 0,
      rate_cutting: 0,
      rate_stitching_singer: 0,
      rate_stitching_power_table: 0,
      rate_ironing: 0,
      rate_checking: 0,
      rate_packing: 0,
    },
  });

  const garmentType = watch('garment_type');

  const onSubmit = async (data: StyleFormData) => {
    if (style) {
      await updateMutation.mutateAsync({ id: style.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          {style ? 'Edit Style' : 'Create New Style'}
        </h2>
        <p className="text-sm text-muted-foreground">
          Enter the style details and process rates
        </p>
      </div>

      {/* Basic Information */}
      <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
        <h3 className="font-semibold text-foreground">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="style_code">Style Code *</Label>
            <Input id="style_code" {...register('style_code')} required placeholder="FF-001" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pattern_number">Pattern Number *</Label>
            <Input id="pattern_number" {...register('pattern_number')} required placeholder="001" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="style_name">Style Name *</Label>
            <Input id="style_name" {...register('style_name')} required placeholder="Girls Cotton Leggings" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="garment_type">Garment Type *</Label>
            <Select value={garmentType} onValueChange={(value) => setValue('garment_type', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kids">Kids</SelectItem>
                <SelectItem value="women">Women</SelectItem>
                <SelectItem value="men">Men</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input id="category" {...register('category')} placeholder="Leggings, T-shirt, etc." />
          </div>
        </div>
      </div>

      {/* Fabric Details */}
      <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
        <h3 className="font-semibold text-foreground">Fabric Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fabric_type">Fabric Type</Label>
            <Input id="fabric_type" {...register('fabric_type')} placeholder="Polyester Lycra" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gsm_range">GSM Range</Label>
            <Input id="gsm_range" {...register('gsm_range')} placeholder="180-220 GSM" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fabric_per_piece">Fabric Per Piece (meters)</Label>
            <Input 
              id="fabric_per_piece" 
              type="number" 
              step="0.01"
              {...register('fabric_per_piece', { valueAsNumber: true })} 
              placeholder="0.25" 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="season">Season</Label>
            <Select defaultValue={watch('season')} onValueChange={(value) => setValue('season', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-season">All Season</SelectItem>
                <SelectItem value="summer">Summer</SelectItem>
                <SelectItem value="winter">Winter</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Process Rates */}
      <div className="space-y-4 p-4 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg border-2 border-primary/20">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          💰 Process Rates (₹ per piece)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="rate_cutting" className="flex items-center gap-2">
              <Scissors className="h-4 w-4 text-primary" />
              Cutting
            </Label>
            <Input 
              id="rate_cutting" 
              type="number" 
              step="0.01"
              {...register('rate_cutting', { valueAsNumber: true })} 
              placeholder="2.00"
              className="font-mono"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rate_stitching_singer" className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              Stitching (Singer)
            </Label>
            <Input 
              id="rate_stitching_singer" 
              type="number" 
              step="0.01"
              {...register('rate_stitching_singer', { valueAsNumber: true })} 
              placeholder="8.00"
              className="font-mono"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rate_stitching_power_table" className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-secondary" />
              Stitching (Power)
            </Label>
            <Input 
              id="rate_stitching_power_table" 
              type="number" 
              step="0.01"
              {...register('rate_stitching_power_table', { valueAsNumber: true })} 
              placeholder="10.00"
              className="font-mono"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rate_ironing" className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-500" />
              Ironing
            </Label>
            <Input 
              id="rate_ironing" 
              type="number" 
              step="0.01"
              {...register('rate_ironing', { valueAsNumber: true })} 
              placeholder="3.00"
              className="font-mono"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rate_checking" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Checking
            </Label>
            <Input 
              id="rate_checking" 
              type="number" 
              step="0.01"
              {...register('rate_checking', { valueAsNumber: true })} 
              placeholder="2.00"
              className="font-mono"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rate_packing" className="flex items-center gap-2">
              <Package className="h-4 w-4 text-blue-500" />
              Packing
            </Label>
            <Input 
              id="rate_packing" 
              type="number" 
              step="0.01"
              {...register('rate_packing', { valueAsNumber: true })} 
              placeholder="1.50"
              className="font-mono"
            />
          </div>
        </div>
      </div>

      {/* Remarks */}
      <div className="space-y-2">
        <Label htmlFor="remarks">Remarks</Label>
        <Textarea id="remarks" {...register('remarks')} rows={3} placeholder="Additional notes..." />
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end pt-4 border-t">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          className="bg-gradient-to-r from-primary to-secondary"
          disabled={createMutation.isPending || updateMutation.isPending}
        >
          {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save Style'}
        </Button>
      </div>
    </form>
  );
};

export default StyleForm;
