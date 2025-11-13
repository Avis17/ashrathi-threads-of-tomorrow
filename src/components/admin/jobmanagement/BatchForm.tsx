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
import { useJobStyles } from '@/hooks/useJobStyles';
import { useCreateJobBatch } from '@/hooks/useJobBatches';

interface BatchFormProps {
  onClose: () => void;
}

const BatchForm = ({ onClose }: BatchFormProps) => {
  const { data: styles } = useJobStyles();
  const createMutation = useCreateJobBatch();
  
  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      style_id: '',
      date_created: new Date().toISOString().split('T')[0],
      fabric_type: '',
      gsm: '',
      color: '',
      total_fabric_received_kg: 0,
      expected_pieces: 0,
      wastage_percent: 5,
      supplier_name: '',
      lot_number: '',
      fabric_width: '',
      remarks: '',
    },
  });

  const selectedStyleId = watch('style_id');
  const selectedStyle = styles?.find(s => s.id === selectedStyleId);

  const onSubmit = async (data: any) => {
    await createMutation.mutateAsync(data);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
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
          <SelectTrigger>
            <SelectValue placeholder="Choose a style..." />
          </SelectTrigger>
          <SelectContent>
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

      {/* Fabric Details */}
      <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
        <h3 className="font-semibold text-foreground">Fabric Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date_created">Production Date *</Label>
            <Input id="date_created" type="date" {...register('date_created')} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fabric_type">Fabric Type *</Label>
            <Input id="fabric_type" {...register('fabric_type')} required placeholder="Polyester Lycra" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gsm">GSM *</Label>
            <Input id="gsm" {...register('gsm')} required placeholder="200" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="color">Color *</Label>
            <Input id="color" {...register('color')} required placeholder="Navy Blue" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="total_fabric_received_kg">Total Fabric (kg) *</Label>
            <Input 
              id="total_fabric_received_kg" 
              type="number" 
              step="0.01"
              {...register('total_fabric_received_kg', { valueAsNumber: true })} 
              required 
              placeholder="180"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="expected_pieces">Expected Pieces *</Label>
            <Input 
              id="expected_pieces" 
              type="number"
              {...register('expected_pieces', { valueAsNumber: true })} 
              required 
              placeholder="720"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="wastage_percent">Wastage %</Label>
            <Input 
              id="wastage_percent" 
              type="number"
              step="0.1"
              {...register('wastage_percent', { valueAsNumber: true })} 
              placeholder="5"
            />
          </div>
        </div>
      </div>

      {/* Supplier Information */}
      <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
        <h3 className="font-semibold text-foreground">Supplier Information (Optional)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="supplier_name">Supplier Name</Label>
            <Input id="supplier_name" {...register('supplier_name')} placeholder="ABC Fabrics" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lot_number">Lot Number</Label>
            <Input id="lot_number" {...register('lot_number')} placeholder="LOT-2025-001" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fabric_width">Fabric Width</Label>
            <Input id="fabric_width" {...register('fabric_width')} placeholder="60 inches" />
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
          disabled={createMutation.isPending}
        >
          {createMutation.isPending ? 'Creating...' : 'Create Batch'}
        </Button>
      </div>
    </form>
  );
};

export default BatchForm;
