import { useForm, useFieldArray } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { useJobStyles } from '@/hooks/useJobStyles';
import { useCreateJobBatch } from '@/hooks/useJobBatches';
import { useEffect } from 'react';

interface BatchFormProps {
  onClose: () => void;
}

interface RollData {
  fabric_type: string;
  gsm: string;
  color: string;
  weight: number;
  number_of_rolls: number;
  fabric_width: string;
}

const BatchForm = ({ onClose }: BatchFormProps) => {
  const { data: styles } = useJobStyles();
  const createMutation = useCreateJobBatch();
  
  const { register, handleSubmit, setValue, watch, control } = useForm({
    defaultValues: {
      style_id: '',
      date_created: new Date().toISOString().split('T')[0],
      number_of_types: 1,
      rolls: [{ fabric_type: '', gsm: '', color: '', weight: 0, number_of_rolls: 1, fabric_width: '' }] as RollData[],
      supplier_name: '',
      lot_number: '',
      remarks: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'rolls',
  });

  const selectedStyleId = watch('style_id');
  const numberOfTypes = watch('number_of_types');
  const rolls = watch('rolls');
  const selectedStyle = styles?.find(s => s.id === selectedStyleId);

  // Calculate total weight (weight * number_of_rolls for each type)
  const totalWeight = rolls?.reduce((sum, roll) => sum + ((Number(roll.weight) || 0) * (Number(roll.number_of_rolls) || 0)), 0) || 0;

  // Update rolls array when number_of_types changes
  useEffect(() => {
    const currentTypes = fields.length;
    const targetTypes = Number(numberOfTypes) || 1;

    if (targetTypes > currentTypes) {
      for (let i = currentTypes; i < targetTypes; i++) {
        append({ fabric_type: '', gsm: '', color: '', weight: 0, number_of_rolls: 1, fabric_width: '' });
      }
    } else if (targetTypes < currentTypes) {
      for (let i = currentTypes - 1; i >= targetTypes; i--) {
        remove(i);
      }
    }
  }, [numberOfTypes, fields.length, append, remove]);

  const onSubmit = async (data: any) => {
    // Generate batch number: FF-01-YYYYMMDD-RRR (RRR = random 3 digits)
    const dateStr = data.date_created.replace(/-/g, '');
    const randomDigits = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const batchNumber = `FF-01-${dateStr}-${randomDigits}`;
    
    const batchData = {
      style_id: data.style_id,
      date_created: data.date_created,
      fabric_type: data.rolls[0]?.fabric_type || '', // Take first type's fabric for backward compatibility
      number_of_rolls: data.rolls.reduce((sum: number, roll: any) => sum + (Number(roll.number_of_rolls) || 0), 0), // Total rolls across all types
      rolls_data: data.rolls,
      total_fabric_received_kg: totalWeight,
      supplier_name: data.supplier_name || null,
      lot_number: data.lot_number || null,
      remarks: data.remarks || null,
      // Set first roll's data as default values for backward compatibility
      gsm: data.rolls[0]?.gsm || '',
      color: data.rolls[0]?.color || '',
      fabric_width: data.rolls[0]?.fabric_width || '',
      expected_pieces: 0, // Default value since we're not using it now
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

      {/* Select Style */}
      <div className="space-y-2 p-4 bg-muted/30 rounded-lg">
        <Label>Select Style *</Label>
        <Select value={selectedStyleId} onValueChange={(value) => setValue('style_id', value)}>
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
        {selectedStyle && (
          <div className="mt-2 p-3 bg-primary/5 rounded border border-primary/20">
            <div className="text-sm space-y-1">
              <div><span className="font-semibold">Pattern:</span> {selectedStyle.pattern_number}</div>
              <div><span className="font-semibold">Fabric:</span> {selectedStyle.fabric_type}</div>
              <div><span className="font-semibold">GSM Range:</span> {selectedStyle.gsm_range}</div>
            </div>
          </div>
        )}
      </div>

      {/* Basic Details */}
      <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
        <h3 className="font-semibold text-foreground">Basic Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date_created">Production Date *</Label>
            <Input id="date_created" type="date" {...register('date_created')} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="number_of_types">Number of Types *</Label>
            <Input 
              id="number_of_types" 
              type="number" 
              min="1"
              max="50"
              {...register('number_of_types', { valueAsNumber: true })} 
              required 
            />
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
          {fields.map((field, index) => (
            <Card key={field.id} className="border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-sm">Type {index + 1}</h4>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        remove(index);
                        setValue('number_of_types', fields.length - 1);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-2 md:col-span-3">
                    <Label htmlFor={`rolls.${index}.fabric_type`}>Fabric Type *</Label>
                    <Input
                      id={`rolls.${index}.fabric_type`}
                      {...register(`rolls.${index}.fabric_type`)}
                      required
                      placeholder="Airtex Cotton"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`rolls.${index}.gsm`}>GSM</Label>
                    <Input
                      id={`rolls.${index}.gsm`}
                      {...register(`rolls.${index}.gsm`)}
                      placeholder="220"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`rolls.${index}.color`}>Color</Label>
                    <Input
                      id={`rolls.${index}.color`}
                      {...register(`rolls.${index}.color`)}
                      placeholder="Red"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`rolls.${index}.fabric_width`}>Fabric Width</Label>
                    <Input
                      id={`rolls.${index}.fabric_width`}
                      {...register(`rolls.${index}.fabric_width`)}
                      placeholder='60"'
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`rolls.${index}.weight`}>Weight per Roll (kg)</Label>
                    <Input
                      id={`rolls.${index}.weight`}
                      type="number"
                      step="0.01"
                      {...register(`rolls.${index}.weight`, { valueAsNumber: true })}
                      placeholder="25"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`rolls.${index}.number_of_rolls`}>Number of Rolls</Label>
                    <Input
                      id={`rolls.${index}.number_of_rolls`}
                      type="number"
                      min="1"
                      {...register(`rolls.${index}.number_of_rolls`, { valueAsNumber: true })}
                      placeholder="3"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Total Weight</Label>
                    <div className="h-10 flex items-center px-3 bg-muted rounded-md font-semibold text-primary">
                      {((Number(rolls[index]?.weight) || 0) * (Number(rolls[index]?.number_of_rolls) || 0)).toFixed(2)} kg
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {fields.length < 50 && (
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              append({ fabric_type: '', gsm: '', color: '', weight: 0, number_of_rolls: 1, fabric_width: '' });
              setValue('number_of_types', fields.length + 1);
            }}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Type
          </Button>
        )}
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
