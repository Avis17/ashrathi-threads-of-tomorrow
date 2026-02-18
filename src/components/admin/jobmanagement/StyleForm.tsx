import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
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
import { Upload, Link as LinkIcon, X, Plus, Trash2, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';

const CATEGORIES = ['Men', 'Women', 'Kids', 'Unisex'];
const STYLE_NAMES = [
  'T-Shirt',
  'Polo T-Shirt',
  'Leggings',
  'Track Pants',
  'Shorts',
  'Joggers',
  'Nightwear',
  'Innerwear',
  'Other'
];
const FIT_OPTIONS = ['Regular', 'Slim', 'Relaxed', 'Loose', 'Tight'];

const OPERATIONS = [
  'Cutting',
  'Stitching (Singer)',
  'Stitching (Power Table)',
  'Checking',
  'Ironing',
  'Packing',
];

interface StyleFormProps {
  style?: JobStyle | null;
  onClose: () => void;
}

type OperationRate = {
  operation: string;
  rate: number;
  description: string;
};

type FormData = {
  style_code: string;
  pattern_number: string;
  style_name: string;
  custom_style_name?: string;
  garment_type: string;
  category: string;
  season: string;
  fit: string;
  min_order_qty: number;
  remarks: string;
  style_image_url: string;
  is_set_item: boolean;
  operations: OperationRate[];
  accessories_amount: number;
  accessories_description: string;
  transportation_amount: number;
  transportation_notes: string;
  company_profit: number;
};

// Helper to parse existing process_rate_details into operations array
const parseExistingOperations = (style?: JobStyle | null): OperationRate[] => {
  if (!style?.process_rate_details || !Array.isArray(style.process_rate_details)) {
    // Try to parse from object format
    const details = style?.process_rate_details as any;
    if (details?.operations && Array.isArray(details.operations)) {
      return details.operations.map((op: any) => ({
        operation: op.operation || '',
        rate: op.rate || 0,
        description: op.description || '',
      }));
    }
    return [{ operation: '', rate: 0, description: '' }];
  }
  const ops = (style.process_rate_details as any[]).map((op: any) => ({
    operation: op.operation || '',
    rate: op.rate || 0,
    description: op.description || '',
  }));
  return ops.length > 0 ? ops : [{ operation: '', rate: 0, description: '' }];
};

// Helper to parse additional costs from process_rate_details
const parseAdditionalCosts = (style?: JobStyle | null) => {
  const details = style?.process_rate_details as any;
  if (details && typeof details === 'object' && !Array.isArray(details)) {
    return {
      accessories_amount: details.accessories_amount || 0,
      accessories_description: details.accessories_description || '',
      transportation_amount: details.transportation_amount || 0,
      transportation_notes: details.transportation_notes || '',
      company_profit: details.company_profit || 0,
      is_set_item: details.is_set_item || false,
    };
  }
  return {
    accessories_amount: 0,
    accessories_description: '',
    transportation_amount: 0,
    transportation_notes: '',
    company_profit: 0,
    is_set_item: false,
  };
};

const StyleForm = ({ style, onClose }: StyleFormProps) => {
  const createMutation = useCreateJobStyle();
  const updateMutation = useUpdateJobStyle();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(style?.style_image_url || '');
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');
  const [showCustomStyleName, setShowCustomStyleName] = useState(
    style?.style_name && !STYLE_NAMES.includes(style.style_name)
  );
  const [measurementFile, setMeasurementFile] = useState<File | null>(null);
  const [measurementPreview, setMeasurementPreview] = useState<string>((style as any)?.measurement_sheet_url || '');

  const additionalCosts = parseAdditionalCosts(style);

  const { register, handleSubmit, setValue, watch, control } = useForm<FormData>({
    defaultValues: {
      style_code: style?.style_code || '',
      pattern_number: style?.pattern_number || '',
      style_name: style?.style_name && STYLE_NAMES.includes(style.style_name) 
        ? style.style_name 
        : (style?.style_name ? 'Other' : ''),
      custom_style_name: style?.style_name && !STYLE_NAMES.includes(style.style_name) 
        ? style.style_name 
        : '',
      garment_type: style?.garment_type || '',
      category: style?.category || '',
      season: style?.season || '',
      fit: style?.fit || '',
      min_order_qty: style?.min_order_qty || 0,
      remarks: style?.remarks || '',
      style_image_url: style?.style_image_url || '',
      is_set_item: additionalCosts.is_set_item,
      operations: parseExistingOperations(style),
      accessories_amount: additionalCosts.accessories_amount,
      accessories_description: additionalCosts.accessories_description,
      transportation_amount: additionalCosts.transportation_amount,
      transportation_notes: additionalCosts.transportation_notes,
      company_profit: additionalCosts.company_profit,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'operations',
  });

  const watchOperations = watch('operations');
  const watchAccessories = watch('accessories_amount') || 0;
  const watchTransportation = watch('transportation_amount') || 0;
  const watchCompanyProfit = watch('company_profit') || 0;
  const watchIsSetItem = watch('is_set_item');

  // Calculate totals
  const operationsTotal = watchOperations?.reduce((sum, op) => sum + (op.rate || 0), 0) || 0;
  const finalRatePerPiece = operationsTotal + watchAccessories + watchTransportation + watchCompanyProfit;

  // Auto-generate style code when category changes (only for new styles)
  useEffect(() => {
    if (!style && watch('category')) {
      generateStyleCode();
    }
  }, [watch('category')]);

  const generateStyleCode = async () => {
    try {
      const { data, error } = await supabase
        .from('job_styles')
        .select('style_code')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      let nextNumber = 1;
      if (data && data.length > 0) {
        const lastCode = data[0].style_code;
        const match = lastCode.match(/FF-(\d+)/);
        if (match) {
          nextNumber = parseInt(match[1]) + 1;
        }
      }

      const newCode = `FF-${String(nextNumber).padStart(3, '0')}`;
      setValue('style_code', newCode);
    } catch (error) {
      console.error('Error generating style code:', error);
    }
  };

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

  const uploadMeasurementSheet = async (): Promise<string | null> => {
    if (!measurementFile) return null;

    const fileExt = measurementFile.name.split('.').pop();
    const fileName = `measurement-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('style-images')
      .upload(fileName, measurementFile);

    if (uploadError) {
      toast.error('Failed to upload measurement sheet');
      return null;
    }

    const { data } = supabase.storage
      .from('style-images')
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  const handleMeasurementFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMeasurementFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setMeasurementPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: FormData) => {
    let imageUrl = data.style_image_url;
    let measurementSheetUrl = (style as any)?.measurement_sheet_url || null;

    // Upload files if selected
    if (imageFile) {
      const uploadedUrl = await uploadImage();
      if (uploadedUrl) {
        imageUrl = uploadedUrl;
      }
    }
    if (measurementFile) {
      const uploadedUrl = await uploadMeasurementSheet();
      if (uploadedUrl) {
        measurementSheetUrl = uploadedUrl;
      }
    }

    // Build process_rate_details with operations and additional costs
    const processRateDetails = {
      operations: data.operations.filter(op => op.operation && op.rate > 0).map(op => ({
        operation: op.operation,
        rate: op.rate,
        description: op.description || '',
      })),
      is_set_item: data.is_set_item || false,
      accessories_amount: data.accessories_amount || 0,
      accessories_description: data.accessories_description || '',
      transportation_amount: data.transportation_amount || 0,
      transportation_notes: data.transportation_notes || '',
      company_profit: data.company_profit || 0,
      final_rate_per_piece: finalRatePerPiece,
    };

    // Calculate individual operation rates for legacy fields
    const getOperationRate = (opName: string) => {
      const op = data.operations.find(o => o.operation === opName);
      return op?.rate || 0;
    };

    // Use custom style name if "Other" is selected
    const finalStyleName = data.style_name === 'Other' && data.custom_style_name 
      ? data.custom_style_name 
      : data.style_name;

    const submitData = {
      style_code: data.style_code,
      pattern_number: data.pattern_number,
      style_name: finalStyleName,
      garment_type: data.garment_type,
      category: data.category,
      season: data.season,
      fit: data.fit,
      min_order_qty: data.min_order_qty,
      remarks: data.remarks,
      style_image_url: imageUrl || null,
      measurement_sheet_url: measurementSheetUrl,
      rate_cutting: getOperationRate('Cutting'),
      rate_stitching_singer: getOperationRate('Stitching (Singer)'),
      rate_stitching_power_table: getOperationRate('Stitching (Power Table)'),
      rate_checking: getOperationRate('Checking'),
      rate_ironing: getOperationRate('Ironing'),
      rate_packing: getOperationRate('Packing'),
      process_rate_details: processRateDetails as any,
    };

    if (style) {
      await updateMutation.mutateAsync({ id: style.id, data: submitData as any });
    } else {
      await createMutation.mutateAsync(submitData as any);
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
            <Label>Category *</Label>
            <Select value={watch('category')} onValueChange={(value) => setValue('category', value)} required>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Style Code *</Label>
            <Input {...register('style_code')} required placeholder="FF-001" disabled={!style} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="is_set_item">Set Item</Label>
              <Switch
                id="is_set_item"
                checked={watchIsSetItem}
                onCheckedChange={(checked) => setValue('is_set_item', checked)}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Enable if this style is a SET (e.g., Top + Bottom combo)
            </p>
          </div>
          <div className="space-y-2">
            <Label>Style Name *</Label>
            <Select 
              value={watch('style_name')} 
              onValueChange={(value) => {
                setValue('style_name', value);
                setShowCustomStyleName(value === 'Other');
              }} 
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select style name" />
              </SelectTrigger>
              <SelectContent>
                {STYLE_NAMES.map((name) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {showCustomStyleName && (
            <div className="space-y-2">
              <Label>Custom Style Name *</Label>
              <Input {...register('custom_style_name')} required placeholder="Enter custom style name" />
            </div>
          )}
          <div className="space-y-2">
            <Label>Pattern Number *</Label>
            <Input {...register('pattern_number')} required placeholder="P001" />
          </div>
          <div className="space-y-2">
            <Label>Garment Type</Label>
            <Input {...register('garment_type')} placeholder="Leggings" />
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
            <Select value={watch('fit')} onValueChange={(value) => setValue('fit', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select fit" />
              </SelectTrigger>
              <SelectContent>
                {FIT_OPTIONS.map((fit) => (
                  <SelectItem key={fit} value={fit}>
                    {fit}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

      {/* Measurement Sheet */}
      <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
        <h3 className="font-semibold flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Measurement Sheet
        </h3>
        <div className="space-y-3">
          <div>
            <Input
              type="file"
              accept="image/*,.pdf"
              onChange={handleMeasurementFileChange}
            />
            <p className="text-xs text-muted-foreground mt-1">Upload measurement chart image (JPG, PNG, PDF)</p>
          </div>

          {measurementPreview && (
            <div className="relative w-full rounded-lg overflow-hidden border">
              <img
                src={measurementPreview}
                alt="Measurement Sheet"
                className="w-full object-contain max-h-48"
                onError={(e) => {
                  // Hide if it's a PDF (can't preview)
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
              <div className="flex items-center justify-between p-2 bg-muted/50">
                <span className="text-xs text-muted-foreground">Measurement sheet uploaded</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setMeasurementPreview('');
                    setMeasurementFile(null);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Process Rates - Simplified */}

      <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
        <h3 className="font-semibold">Process Rates (₹ per piece)</h3>
        
        {/* Operations */}
        <div className="space-y-3">
          <Label className="text-sm text-muted-foreground">Operations</Label>
          {fields.map((field, index) => (
            <div key={field.id} className="space-y-2 p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Select
                  value={watchOperations?.[index]?.operation || ''}
                  onValueChange={(value) => setValue(`operations.${index}.operation`, value)}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select operation" />
                  </SelectTrigger>
                  <SelectContent>
                    {OPERATIONS.map((op) => (
                      <SelectItem key={op} value={op}>
                        {op}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="relative w-28">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="pl-7"
                    {...register(`operations.${index}.rate`, { valueAsNumber: true })}
                  />
                </div>
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <Input
                placeholder="Description (optional) - e.g., includes overlock, hemming..."
                className="text-sm"
                {...register(`operations.${index}.description`)}
              />
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ operation: '', rate: 0, description: '' })}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Operation
          </Button>
        </div>

        {/* Accessories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
          <div className="space-y-2">
            <Label>Accessories Amount (₹)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                className="pl-7"
                {...register('accessories_amount', { valueAsNumber: true })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Accessories Description</Label>
            <Input
              placeholder="e.g., Buttons, zippers, labels..."
              {...register('accessories_description')}
            />
          </div>
        </div>

        {/* Transportation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
          <div className="space-y-2">
            <Label>Transportation Amount (₹)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                className="pl-7"
                {...register('transportation_amount', { valueAsNumber: true })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Transportation Notes</Label>
            <Input
              placeholder="e.g., Delivery charges, pickup..."
              {...register('transportation_notes')}
            />
          </div>
        </div>

        {/* Company Profit */}
        <div className="pt-4 border-t">
          <div className="space-y-2 max-w-xs">
            <Label>Company Profit (₹)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                className="pl-7"
                {...register('company_profit', { valueAsNumber: true })}
              />
            </div>
          </div>
        </div>

        {/* Final Rate Display */}
        <div className="pt-4 border-t bg-primary/5 -mx-4 px-4 py-4 -mb-4 rounded-b-lg">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Final Job Work Rate Per Piece</p>
              <div className="text-xs text-muted-foreground">
                Operations (₹{operationsTotal.toFixed(2)}) + Accessories (₹{watchAccessories.toFixed(2)}) + 
                Transportation (₹{watchTransportation.toFixed(2)}) + Profit (₹{watchCompanyProfit.toFixed(2)})
              </div>
            </div>
            <div className="text-3xl font-bold text-primary">
              ₹{finalRatePerPiece.toFixed(2)}
            </div>
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
