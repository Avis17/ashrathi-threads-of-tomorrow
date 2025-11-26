import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateJobStyle, useUpdateJobStyle, type JobStyle } from '@/hooks/useJobStyles';
import { supabase } from '@/integrations/supabase/client';
import { Upload, Link as LinkIcon, X, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { JOB_ORDER_CATEGORIES, OPERATIONS } from '@/lib/jobOrderCategories';

interface StyleFormProps {
  style?: JobStyle | null;
  onClose: () => void;
}

type CategoryItem = { 
  name: string; 
  rate: number;
  customName?: string;
};

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
  
  // State for operations and categories
  const [selectedOperations, setSelectedOperations] = useState<string[]>(() => {
    if (style?.process_rate_details && Array.isArray(style.process_rate_details)) {
      return (style.process_rate_details as any[]).map((op: any) => op.operation);
    }
    return [];
  });
  
  const [operationCategories, setOperationCategories] = useState<Record<string, CategoryItem[]>>(() => {
    if (style?.process_rate_details && Array.isArray(style.process_rate_details)) {
      const result: Record<string, CategoryItem[]> = {};
      (style.process_rate_details as any[]).forEach((op: any) => {
        result[op.operation] = op.categories || [];
      });
      return result;
    }
    return {};
  });

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

  const toggleOperation = (operation: string) => {
    if (selectedOperations.includes(operation)) {
      setSelectedOperations(selectedOperations.filter((op) => op !== operation));
      const newCategories = { ...operationCategories };
      delete newCategories[operation];
      setOperationCategories(newCategories);
    } else {
      setSelectedOperations([...selectedOperations, operation]);
      setOperationCategories({
        ...operationCategories,
        [operation]: [],
      });
    }
  };

  const addCategory = (operation: string) => {
    setOperationCategories({
      ...operationCategories,
      [operation]: [
        ...(operationCategories[operation] || []),
        { name: "", rate: 0, customName: "" },
      ],
    });
  };

  const updateCategory = (operation: string, index: number, field: "name" | "rate" | "customName", value: string | number) => {
    const newCategories = { ...operationCategories };
    if (field === "name") {
      newCategories[operation][index].name = value as string;
      if (value !== "Other") {
        newCategories[operation][index].customName = "";
      }
    } else if (field === "rate") {
      newCategories[operation][index].rate = value as number;
    } else if (field === "customName") {
      newCategories[operation][index].customName = value as string;
    }
    setOperationCategories(newCategories);
  };

  const removeCategory = (operation: string, index: number) => {
    const newCategories = { ...operationCategories };
    newCategories[operation].splice(index, 1);
    setOperationCategories(newCategories);
  };

  const calculateOperationTotal = (operation: string): number => {
    const cats = operationCategories[operation] || [];
    return cats.reduce((sum, cat) => sum + (cat.rate || 0), 0);
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

    // Build process_rate_details from selected operations
    const processRateDetails = selectedOperations.map((op) => ({
      operation: op,
      categories: (operationCategories[op] || []).map((cat) => ({
        name: cat.name === "Other" && cat.customName ? cat.customName : cat.name,
        rate: cat.rate,
      })),
    }));

    // Calculate total rates for each operation
    const rates = {
      rate_cutting: calculateOperationTotal("Cutting"),
      rate_stitching_singer: calculateOperationTotal("Stitching (Singer)"),
      rate_stitching_power_table: 
        calculateOperationTotal("Stitching (Power Table) - Overlock") + 
        calculateOperationTotal("Stitching (Power Table) - Flatlock"),
      rate_ironing: calculateOperationTotal("Ironing"),
      rate_checking: calculateOperationTotal("Checking"),
      rate_packing: calculateOperationTotal("Packing"),
    };

    const submitData = {
      ...data,
      ...rates,
      style_image_url: imageUrl || null,
      process_rate_details: processRateDetails as any,
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
        <p className="text-sm text-muted-foreground">
          Select operations and add categories with rates. Total rate per operation will be calculated automatically.
        </p>
        <div className="space-y-6">
          {OPERATIONS.map((operation) => (
            <div key={operation} className="space-y-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedOperations.includes(operation)}
                  onCheckedChange={() => toggleOperation(operation)}
                />
                <span className="font-medium">{operation}</span>
                {selectedOperations.includes(operation) && (
                  <span className="ml-auto text-sm font-semibold text-primary">
                    Total: ₹{calculateOperationTotal(operation).toFixed(2)}
                  </span>
                )}
              </div>

              {selectedOperations.includes(operation) && (
                <div className="ml-6 space-y-2">
                  {operationCategories[operation]?.map((category, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex gap-2">
                        <Select
                          value={category.name}
                          onValueChange={(value) => updateCategory(operation, index, "name", value)}
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {JOB_ORDER_CATEGORIES[operation as keyof typeof JOB_ORDER_CATEGORIES]?.map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {cat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Rate ₹"
                          value={category.rate || ''}
                          onChange={(e) => updateCategory(operation, index, "rate", parseFloat(e.target.value) || 0)}
                          className="w-32"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeCategory(operation, index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      {category.name === "Other" && (
                        <Input
                          placeholder="Enter custom category name"
                          value={category.customName || ""}
                          onChange={(e) => updateCategory(operation, index, "customName", e.target.value)}
                          className="ml-0"
                        />
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addCategory(operation)}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Category
                  </Button>
                </div>
              )}
            </div>
          ))}
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
