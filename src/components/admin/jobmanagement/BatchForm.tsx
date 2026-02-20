import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Copy, ChevronDown, ChevronUp, UserPlus } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useJobStyles } from '@/hooks/useJobStyles';
import { useCreateJobBatch } from '@/hooks/useJobBatches';
import { useJobWorkers } from '@/hooks/useDeliveryChallans';
import { AddWorkerDialog } from './batch-details/AddWorkerDialog';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { JOB_DEPARTMENTS } from '@/lib/jobDepartments';

interface BatchFormProps {
  onClose: () => void;
}

interface VariationData {
  color: string;
  fabric_width: string;
  weight: number;
  number_of_rolls: number;
}

const BATCH_OPERATIONS = [
  "Cutting",
  "Stitching(Singer)",
  "Stitching(Powertable)",
  "Checking",
  "Ironing",
  "Packing",
] as const;

interface TypeData {
  style_id: string;
  fabric_type: string;
  gsm: string;
  sizes: string;
  planned_start_date: string;
  estimated_delivery_date: string;
  notes: string;
  operations: string[];
  variations: VariationData[];
}

interface FormData {
  date_taken: string;
  types: TypeData[];
  supplier_name: string;
  company_name: string;
  lot_number: string;
  remarks: string;
}

const BatchForm = ({ onClose }: BatchFormProps) => {
  const { data: styles } = useJobStyles();
  const createMutation = useCreateJobBatch();
  const { data: jobWorkers = [], refetch: refetchWorkers } = useJobWorkers(false);
  const [collapsedTypes, setCollapsedTypes] = useState<Record<number, boolean>>({});
  const [addWorkerOpen, setAddWorkerOpen] = useState(false);
  
  const { register, handleSubmit, setValue, watch, control } = useForm<FormData>({
    defaultValues: {
      date_taken: new Date().toISOString().split('T')[0],
      types: [{
        style_id: '',
        fabric_type: '',
        gsm: '',
        sizes: '',
        planned_start_date: '',
        estimated_delivery_date: '',
        notes: '',
        operations: ['Cutting', 'Stitching(Singer)', 'Checking', 'Ironing', 'Packing'],
        variations: [{ color: '', fabric_width: '', weight: 0, number_of_rolls: 1 }]
      }],
      supplier_name: '',
      company_name: '',
      lot_number: '',
      remarks: '',
    },
  });

  const { fields: typeFields, append: appendType, remove: removeType } = useFieldArray({
    control,
    name: 'types',
  });

  const types = watch('types');

  // Calculate total weight across all types and variations
  const totalWeight = types?.reduce((typeSum, type) => 
    typeSum + (type.variations?.reduce((varSum, variation) => 
      varSum + ((Number(variation.weight) || 0) * (Number(variation.number_of_rolls) || 0)), 0) || 0), 0) || 0;

  // Calculate total rolls across all types and variations
  const totalRolls = types?.reduce((typeSum, type) => 
    typeSum + (type.variations?.reduce((varSum, variation) => 
      varSum + (Number(variation.number_of_rolls) || 0), 0) || 0), 0) || 0;

  const getSelectedStyle = (styleId: string) => styles?.find(s => s.id === styleId);

  const toggleTypeCollapse = (index: number) => {
    setCollapsedTypes(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const addVariation = (typeIndex: number) => {
    const currentTypes = [...types];
    currentTypes[typeIndex].variations.push({ color: '', fabric_width: '', weight: 0, number_of_rolls: 1 });
    setValue('types', currentTypes);
  };

  const removeVariation = (typeIndex: number, variationIndex: number) => {
    const currentTypes = [...types];
    if (currentTypes[typeIndex].variations.length > 1) {
      currentTypes[typeIndex].variations.splice(variationIndex, 1);
      setValue('types', currentTypes);
    }
  };

  const duplicateVariation = (typeIndex: number, variationIndex: number) => {
    const currentTypes = [...types];
    const variationToCopy = { ...currentTypes[typeIndex].variations[variationIndex] };
    currentTypes[typeIndex].variations.push(variationToCopy);
    setValue('types', currentTypes);
  };

  const onSubmit = async (data: FormData) => {
    // Generate batch number: FF-01-YYYYMMDD-RRR (RRR = random 3 digits)
    const dateStr = data.date_taken.replace(/-/g, '');
    const randomDigits = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const batchNumber = `FF-01-${dateStr}-${randomDigits}`;
    
    // Flatten types and variations into rolls_data format with additional fields
    const flattenedRolls = data.types.flatMap(type => 
      type.variations.map(variation => ({
        style_id: type.style_id,
        fabric_type: type.fabric_type,
        gsm: type.gsm,
        sizes: type.sizes,
        planned_start_date: type.planned_start_date,
        estimated_delivery_date: type.estimated_delivery_date,
        notes: type.notes,
        operations: type.operations,
        color: variation.color,
        fabric_width: variation.fabric_width,
        weight: variation.weight,
        number_of_rolls: variation.number_of_rolls,
      }))
    );

    const batchData = {
      style_id: data.types[0]?.style_id || '',
      date_created: data.date_taken,
      fabric_type: data.types[0]?.fabric_type || '',
      number_of_rolls: totalRolls,
      rolls_data: flattenedRolls,
      total_fabric_received_kg: totalWeight,
      supplier_name: data.supplier_name || null,
      lot_number: data.lot_number || null,
      remarks: data.remarks || null,
      gsm: data.types[0]?.gsm || '',
      color: data.types[0]?.variations[0]?.color || '',
      fabric_width: data.types[0]?.variations[0]?.fabric_width || '',
      expected_pieces: 0,
      batch_number: batchNumber,
    };

    await createMutation.mutateAsync(batchData);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-h-[80vh] overflow-y-auto pr-2">
      <div className="space-y-2 sticky top-0 bg-background pb-4 z-10">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Create New Production Batch
        </h2>
        <p className="text-sm text-muted-foreground">
          Enter batch details for production tracking
        </p>
      </div>

      {/* Basic Details */}
      <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
        <h3 className="font-semibold text-foreground">Basic Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date_taken">Taken Date *</Label>
            <Input id="date_taken" type="date" {...register('date_taken')} required />
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground">Summary</Label>
            <div className="h-10 flex items-center gap-4 px-3 bg-muted rounded-md text-sm">
              <span><strong>{typeFields.length}</strong> Type(s)</span>
              <span><strong>{totalRolls}</strong> Roll(s)</span>
              <span className="font-semibold text-primary">{totalWeight.toFixed(2)} kg</span>
            </div>
          </div>
        </div>
      </div>

      {/* Type Details */}
      <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Type Details</h3>
          <div className="text-sm text-muted-foreground">
            Total Weight: <span className="font-bold text-primary">{totalWeight.toFixed(2)} kg</span>
          </div>
        </div>
        
        <div className="space-y-4">
          {typeFields.map((typeField, typeIndex) => {
            const typeVariations = types[typeIndex]?.variations || [];
            const typeWeight = typeVariations.reduce((sum, v) => 
              sum + ((Number(v.weight) || 0) * (Number(v.number_of_rolls) || 0)), 0);
            const typeRolls = typeVariations.reduce((sum, v) => sum + (Number(v.number_of_rolls) || 0), 0);
            const isCollapsed = collapsedTypes[typeIndex];
            const selectedStyle = getSelectedStyle(types[typeIndex]?.style_id);

            return (
              <Card key={typeField.id} className="border-primary/20 overflow-hidden">
                <CardHeader 
                  className="p-3 bg-primary/5 cursor-pointer hover:bg-primary/10 transition-colors"
                  onClick={() => toggleTypeCollapse(typeIndex)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {isCollapsed ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      )}
                      <h4 className="font-medium">
                        Type {typeIndex + 1}
                        {selectedStyle && (
                          <span className="text-primary ml-2">
                            — {selectedStyle.style_code}
                          </span>
                        )}
                        {types[typeIndex]?.fabric_type && (
                          <span className="text-muted-foreground ml-1">
                            • {types[typeIndex].fabric_type}
                            {types[typeIndex]?.gsm && ` (${types[typeIndex].gsm} GSM)`}
                          </span>
                        )}
                      </h4>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-muted-foreground">
                        {typeVariations.length} variation(s) • {typeRolls} roll(s) • {typeWeight.toFixed(2)} kg
                      </span>
                      {typeFields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeType(typeIndex);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className={cn("p-4 space-y-4", isCollapsed && "hidden")}>
                  {/* Style Selection for this Type */}
                  <div className="space-y-2 pb-3 border-b">
                    <Label>Select Style *</Label>
                    <Controller
                      name={`types.${typeIndex}.style_id`}
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="bg-background">
                            <SelectValue placeholder="Choose a style..." />
                          </SelectTrigger>
                          <SelectContent className="bg-popover z-50">
                            {styles?.filter(s => s.is_active).map((style) => (
                              <SelectItem key={style.id} value={style.id}>
                                {style.style_code} - {style.style_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {selectedStyle && (
                      <div className="mt-2 p-3 bg-primary/5 rounded border border-primary/20">
                        <div className="text-sm grid grid-cols-3 gap-2">
                          <div><span className="font-semibold">Pattern:</span> {selectedStyle.pattern_number}</div>
                          <div><span className="font-semibold">Fabric:</span> {selectedStyle.fabric_type}</div>
                          <div><span className="font-semibold">GSM Range:</span> {selectedStyle.gsm_range}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Fabric Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pb-3 border-b">
                    <div className="space-y-2">
                      <Label htmlFor={`types.${typeIndex}.fabric_type`}>Fabric Type *</Label>
                      <Input
                        id={`types.${typeIndex}.fabric_type`}
                        {...register(`types.${typeIndex}.fabric_type`)}
                        required
                        placeholder="e.g., Airtex Cotton"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`types.${typeIndex}.gsm`}>GSM</Label>
                      <Input
                        id={`types.${typeIndex}.gsm`}
                        {...register(`types.${typeIndex}.gsm`)}
                        placeholder="e.g., 220"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`types.${typeIndex}.sizes`}>Sizes</Label>
                      <Input
                        id={`types.${typeIndex}.sizes`}
                        {...register(`types.${typeIndex}.sizes`)}
                        placeholder="e.g., S, M, L, XL, XXL"
                      />
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-3 border-b">
                    <div className="space-y-2">
                      <Label htmlFor={`types.${typeIndex}.planned_start_date`}>Planned Start Date</Label>
                      <Input
                        id={`types.${typeIndex}.planned_start_date`}
                        type="date"
                        {...register(`types.${typeIndex}.planned_start_date`)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`types.${typeIndex}.estimated_delivery_date`}>Estimated Delivery Date</Label>
                      <Input
                        id={`types.${typeIndex}.estimated_delivery_date`}
                        type="date"
                        {...register(`types.${typeIndex}.estimated_delivery_date`)}
                      />
                    </div>
                  </div>

                  {/* Operations */}
                  <div className="space-y-2 pb-3 border-b">
                    <Label className="text-sm font-medium">Applicable Operations</Label>
                    <div className="flex flex-wrap gap-3">
                      {BATCH_OPERATIONS.map((op) => {
                        const isChecked = types[typeIndex]?.operations?.includes(op) || false;
                        return (
                          <label key={op} className="flex items-center gap-2 cursor-pointer">
                            <Checkbox
                              checked={isChecked}
                              onCheckedChange={(checked) => {
                                const currentOps = types[typeIndex]?.operations || [];
                                const newOps = checked
                                  ? [...currentOps, op]
                                  : currentOps.filter(o => o !== op);
                                setValue(`types.${typeIndex}.operations`, newOps);
                              }}
                            />
                            <span className="text-sm">{op}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Variations */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Variations</Label>
                      <Button
                        type="button"
                        variant="link"
                        size="sm"
                        className="h-auto p-0 text-primary"
                        onClick={() => addVariation(typeIndex)}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Variation
                      </Button>
                    </div>

                    {typeVariations.map((variation, varIndex) => (
                      <div 
                        key={varIndex} 
                        className="grid grid-cols-2 md:grid-cols-6 gap-2 p-3 bg-muted/50 rounded-lg items-end"
                      >
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Color</Label>
                          <Input
                            {...register(`types.${typeIndex}.variations.${varIndex}.color`)}
                            placeholder="Red"
                            className="h-9"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Fabric Width</Label>
                          <Input
                            {...register(`types.${typeIndex}.variations.${varIndex}.fabric_width`)}
                            placeholder='60"'
                            className="h-9"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Weight/Roll (kg)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            {...register(`types.${typeIndex}.variations.${varIndex}.weight`, { valueAsNumber: true })}
                            placeholder="25"
                            className="h-9"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">No. of Rolls</Label>
                          <Input
                            type="number"
                            min="1"
                            {...register(`types.${typeIndex}.variations.${varIndex}.number_of_rolls`, { valueAsNumber: true })}
                            placeholder="3"
                            className="h-9"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Total</Label>
                          <div className="h-9 flex items-center px-2 bg-background rounded-md text-sm font-semibold text-primary">
                            {((Number(variation.weight) || 0) * (Number(variation.number_of_rolls) || 0)).toFixed(2)} kg
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9"
                            onClick={() => duplicateVariation(typeIndex, varIndex)}
                            title="Duplicate variation"
                          >
                            <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                          </Button>
                          {typeVariations.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9"
                              onClick={() => removeVariation(typeIndex, varIndex)}
                            >
                              <Trash2 className="h-3.5 w-3.5 text-destructive" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Notes for this type */}
                  <div className="space-y-2 pt-2 border-t">
                    <Label htmlFor={`types.${typeIndex}.notes`}>Notes</Label>
                    <Textarea
                      id={`types.${typeIndex}.notes`}
                      {...register(`types.${typeIndex}.notes`)}
                      placeholder="Additional notes for this type..."
                      className="min-h-[60px]"
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => {
            appendType({
              style_id: '',
              fabric_type: '',
              gsm: '',
              sizes: '',
              planned_start_date: '',
              estimated_delivery_date: '',
              notes: '',
              operations: ['Cutting', 'Stitching(Singer)', 'Checking', 'Ironing', 'Packing'],
              variations: [{ color: '', fabric_width: '', weight: 0, number_of_rolls: 1 }]
            });
          }}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Type
        </Button>
      </div>

      {/* Supplier & Additional Info */}
      <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
        <h3 className="font-semibold text-foreground">Additional Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="supplier_name">Supplier Name</Label>
            <Input id="supplier_name" {...register('supplier_name')} placeholder="ABC Textiles" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lot_number">Lot Number</Label>
            <Input id="lot_number" {...register('lot_number')} placeholder="LOT-2024-001" />
          </div>
        </div>

        {/* Company / Job Worker Selection */}
        <div className="space-y-2">
          <Label>Company / Job Worker</Label>
          <div className="flex gap-2">
            <Controller
              name="company_name"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className="flex-1 bg-background">
                    <SelectValue placeholder="Select company or job worker..." />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    {jobWorkers.map((worker) => (
                      <SelectItem key={worker.id} value={worker.name}>
                        <div className="flex flex-col">
                          <span>{worker.name}</span>
                          {worker.gstin && (
                            <span className="text-xs text-muted-foreground">GSTIN: {worker.gstin}</span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setAddWorkerOpen(true)}
              title="Add new job worker / company"
            >
              <UserPlus className="h-4 w-4" />
            </Button>
          </div>
          {watch('company_name') && (
            <p className="text-xs text-muted-foreground">
              Selected: <span className="font-medium text-foreground">{watch('company_name')}</span>
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="remarks">Remarks</Label>
          <Textarea 
            id="remarks" 
            {...register('remarks')} 
            placeholder="Any additional notes..."
            className="min-h-[80px]"
          />
        </div>
      </div>

      <AddWorkerDialog
        open={addWorkerOpen}
        onOpenChange={setAddWorkerOpen}
        onWorkerCreated={(name) => {
          refetchWorkers();
          setValue('company_name', name);
        }}
      />

      {/* Action Buttons */}
      <div className="flex gap-3 justify-end pt-4 border-t sticky bottom-0 bg-background">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          className="bg-gradient-to-r from-primary to-secondary"
          disabled={createMutation.isPending}
        >
          {createMutation.isPending ? 'Creating...' : 'Create Batch'}
        </Button>
      </div>
    </form>
  );
};

export default BatchForm;
