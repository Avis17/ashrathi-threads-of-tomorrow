import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Scissors, CheckCircle } from 'lucide-react';
import { useUpdateJobBatch } from '@/hooks/useJobBatches';
import { toast } from 'sonner';

interface CuttingCompletionProps {
  batch: any;
}

interface RollType {
  fabric_type: string;
  gsm: string;
  color: string;
  weight: number;
  number_of_rolls: number;
  fabric_width: string;
}

interface CuttingDataEntry {
  type_index: number;
  cut_quantity: number;
}

export const CuttingCompletion = ({ batch }: CuttingCompletionProps) => {
  const updateBatch = useUpdateJobBatch();
  const rollsData: RollType[] = batch.rolls_data || [];
  const existingCuttingData: CuttingDataEntry[] = batch.cutting_data || [];
  
  // Initialize cut quantities from existing data or empty
  const [cutQuantities, setCutQuantities] = useState<{ [key: number]: number }>(() => {
    const initial: { [key: number]: number } = {};
    existingCuttingData.forEach((entry) => {
      initial[entry.type_index] = entry.cut_quantity;
    });
    return initial;
  });

  const handleQuantityChange = (typeIndex: number, value: string) => {
    const numValue = parseInt(value) || 0;
    setCutQuantities(prev => ({
      ...prev,
      [typeIndex]: numValue
    }));
  };

  const handleSubmit = async () => {
    // Validate that all types have quantities entered
    const allEntered = rollsData.every((_, index) => cutQuantities[index] > 0);
    
    if (!allEntered) {
      toast.error('Please enter cut quantities for all types');
      return;
    }

    // Prepare cutting data
    const cuttingData: CuttingDataEntry[] = rollsData.map((_, index) => ({
      type_index: index,
      cut_quantity: cutQuantities[index] || 0
    }));

    // Calculate total cut quantity
    const totalCutQuantity = Object.values(cutQuantities).reduce((sum, qty) => sum + qty, 0);

    if (totalCutQuantity <= 0) {
      toast.error('Total cut quantity must be greater than 0');
      return;
    }

    try {
      await updateBatch.mutateAsync({
        id: batch.id,
        data: {
          cutting_data: cuttingData as any,
          cutting_completed: true,
          cut_quantity: totalCutQuantity,
          overall_progress: 35
        }
      });
      toast.success('Cutting completion recorded successfully');
    } catch (error) {
      toast.error('Failed to save cutting data');
    }
  };

  const totalCutQuantity = Object.values(cutQuantities).reduce((sum, qty) => sum + qty, 0);

  if (batch.cutting_completed) {
    return (
      <Card className="border-l-4 border-l-green-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            Cutting Completed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {rollsData.map((type, index) => {
              const cuttingEntry = existingCuttingData.find(e => e.type_index === index);
              return (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <span className="font-medium">Type {index + 1}:</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      {type.fabric_type} • {type.gsm} GSM • {type.color}
                    </span>
                  </div>
                  <div className="font-semibold text-green-600">
                    {cuttingEntry?.cut_quantity || 0} pieces
                  </div>
                </div>
              );
            })}
            <div className="pt-3 border-t flex justify-between items-center">
              <span className="font-semibold">Total Cut Pieces:</span>
              <span className="text-xl font-bold text-green-600">{batch.cut_quantity}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scissors className="h-5 w-5 text-blue-500" />
          Cutting Completion
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Enter the final cut quantity for each type. This will mark the cutting phase as complete (35% progress).
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {rollsData.map((type, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <Label className="font-semibold">Type {index + 1}</Label>
                  <div className="text-sm text-muted-foreground mt-1 space-y-1">
                    <div><strong>Fabric:</strong> {type.fabric_type}</div>
                    <div className="flex gap-4">
                      <span><strong>GSM:</strong> {type.gsm}</span>
                      <span><strong>Color:</strong> {type.color}</span>
                      <span><strong>Width:</strong> {type.fabric_width}</span>
                    </div>
                    <div className="flex gap-4">
                      <span><strong>Weight/Roll:</strong> {type.weight} kg</span>
                      <span><strong>Rolls:</strong> {type.number_of_rolls}</span>
                      <span><strong>Total:</strong> {type.weight * type.number_of_rolls} kg</span>
                    </div>
                  </div>
                </div>
                <div className="w-32">
                  <Label htmlFor={`cut-qty-${index}`}>Cut Pieces</Label>
                  <Input
                    id={`cut-qty-${index}`}
                    type="number"
                    min="0"
                    placeholder="0"
                    value={cutQuantities[index] || ''}
                    onChange={(e) => handleQuantityChange(index, e.target.value)}
                    className="text-right font-semibold"
                  />
                </div>
              </div>
            </div>
          ))}
          
          <div className="pt-4 border-t space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-lg">Total Cut Pieces:</span>
              <span className="text-2xl font-bold text-primary">{totalCutQuantity}</span>
            </div>
            
            <Button 
              onClick={handleSubmit} 
              className="w-full"
              disabled={updateBatch.isPending || totalCutQuantity === 0 || batch.cutting_completed}
            >
              {updateBatch.isPending ? 'Saving...' : 'Complete Cutting Phase (35% Progress)'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
