import { useState } from 'react';
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
import { supabase } from '@/integrations/supabase/client';
import { Upload, Link as LinkIcon, X } from 'lucide-react';
import { toast } from 'sonner';

interface StyleFormProps {
  style?: JobStyle | null;
  onClose: () => void;
}

type FormData = {
  style_code: string;
  pattern_number: string;
  style_name: string;
  garment_type: string;
  category: string;
  season: string;
  fit: string;
  rate_cutting: number;
  rate_stitching_singer: number;
  rate_stitching_power_table: number;
  rate_ironing: number;
  rate_checking: number;
  rate_packing: number;
  min_order_qty: number;
  remarks: string;
  style_image_url: string;
};

const StyleForm = ({ style, onClose }: StyleFormProps) => {
  const createMutation = useCreateJobStyle();
  const updateMutation = useUpdateJobStyle();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(style?.style_image_url || '');
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');

  const { register, handleSubmit, setValue, watch } = useForm<FormData>({
    defaultValues: {
      style_code: style?.style_code || '',
      pattern_number: style?.pattern_number || '',
      style_name: style?.style_name || '',
      garment_type: style?.garment_type || '',
      category: style?.category || '',
      season: style?.season || '',
      fit: style?.fit || '',
      rate_cutting: style?.rate_cutting || 0,
      rate_stitching_singer: style?.rate_stitching_singer || 0,
      rate_stitching_power_table: style?.rate_stitching_power_table || 0,
      rate_ironing: style?.rate_ironing || 0,
      rate_checking: style?.rate_checking || 0,
      rate_packing: style?.rate_packing || 0,
      min_order_qty: style?.min_order_qty || 0,
      remarks: style?.remarks || '',
      style_image_url: style?.style_image_url || '',
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlChange = (url: string) => {
    setImagePreview(url);
    setValue('style_image_url', url);
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null;

    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('style-images')
      .upload(filePath, imageFile);

    if (uploadError) {
      toast.error('Failed to upload image');
      return null;
    }

    const { data } = supabase.storage
      .from('style-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const onSubmit = async (data: FormData) => {
    let imageUrl = data.style_image_url;

    // Upload file if selected
    if (imageFile) {
      const uploadedUrl = await uploadImage();
      if (uploadedUrl) {
        imageUrl = uploadedUrl;
      }
    }

    const submitData = {
      ...data,
      style_image_url: imageUrl || null,
    };

    if (style) {
      await updateMutation.mutateAsync({ id: style.id, data: submitData });
    } else {
      await createMutation.mutateAsync(submitData);
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          {style ? 'Edit Style' : 'Create New Style'}
        </h2>
      </div>

      {/* Basic Information */}
      <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
        <h3 className="font-semibold">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Style Code *</Label>
            <Input {...register('style_code')} required placeholder="FF-001" />
          </div>
          <div className="space-y-2">
            <Label>Pattern Number *</Label>
            <Input {...register('pattern_number')} required placeholder="P001" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Style Name *</Label>
            <Input {...register('style_name')} required placeholder="Girls Leggings" />
          </div>
          <div className="space-y-2">
            <Label>Garment Type</Label>
            <Input {...register('garment_type')} placeholder="Leggings" />
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Input {...register('category')} placeholder="Kids > Leggings" />
          </div>
          <div className="space-y-2">
            <Label>Season</Label>
            <Select value={watch('season')} onValueChange={(value) => setValue('season', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select season" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-season">All Season</SelectItem>
                <SelectItem value="summer">Summer</SelectItem>
                <SelectItem value="winter">Winter</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Fit</Label>
            <Input {...register('fit')} placeholder="Regular" />
          </div>
        </div>
      </div>

      {/* Style Image */}
      <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
        <h3 className="font-semibold">Style Image</h3>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              type="button"
              variant={uploadMode === 'file' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setUploadMode('file')}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload File
            </Button>
            <Button
              type="button"
              variant={uploadMode === 'url' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setUploadMode('url')}
            >
              <LinkIcon className="h-4 w-4 mr-2" />
              Enter URL
            </Button>
          </div>

          {uploadMode === 'file' ? (
            <div>
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
          ) : (
            <div>
              <Input
                placeholder="Enter image URL"
                value={watch('style_image_url')}
                onChange={(e) => handleUrlChange(e.target.value)}
              />
            </div>
          )}

          {imagePreview && (
            <div className="relative w-full aspect-video bg-muted rounded-lg overflow-hidden">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => {
                  setImagePreview('');
                  setImageFile(null);
                  setValue('style_image_url', '');
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Process Rates */}
      <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
        <h3 className="font-semibold">Process Rates (₹ per piece)</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Cutting</Label>
            <Input type="number" step="0.01" {...register('rate_cutting', { valueAsNumber: true })} />
          </div>
          <div className="space-y-2">
            <Label>Stitching (Singer)</Label>
            <Input type="number" step="0.01" {...register('rate_stitching_singer', { valueAsNumber: true })} />
          </div>
          <div className="space-y-2">
            <Label>Stitching (Power Table)</Label>
            <Input type="number" step="0.01" {...register('rate_stitching_power_table', { valueAsNumber: true })} />
          </div>
          <div className="space-y-2">
            <Label>Ironing</Label>
            <Input type="number" step="0.01" {...register('rate_ironing', { valueAsNumber: true })} />
          </div>
          <div className="space-y-2">
            <Label>Checking</Label>
            <Input type="number" step="0.01" {...register('rate_checking', { valueAsNumber: true })} />
          </div>
          <div className="space-y-2">
            <Label>Packing</Label>
            <Input type="number" step="0.01" {...register('rate_packing', { valueAsNumber: true })} />
          </div>
        </div>
      </div>

      {/* Additional Details */}
      <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
        <h3 className="font-semibold">Additional Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Min Order Quantity</Label>
            <Input type="number" {...register('min_order_qty', { valueAsNumber: true })} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Remarks</Label>
            <Textarea {...register('remarks')} rows={2} />
          </div>
        </div>
      </div>

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
