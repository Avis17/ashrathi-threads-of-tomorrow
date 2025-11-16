import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Flame, CheckCircle } from 'lucide-react';
import { useUpdateJobBatch } from '@/hooks/useJobBatches';
import { toast } from 'sonner';

interface IroningCompletionProps {
  batch: any;
}

export const IroningCompletion = ({ batch }: IroningCompletionProps) => {
  const updateBatch = useUpdateJobBatch();
  const [ironingQuantity, setIroningQuantity] = useState(batch.ironing_quantity || 0);

  const handleSubmit = async () => {
    if (ironingQuantity <= 0) {
      toast.error('Ironing quantity must be greater than 0');
      return;
    }

    try {
      await updateBatch.mutateAsync({
        id: batch.id,
        data: {
          ironing_quantity: ironingQuantity,
          overall_progress: 70
        }
      });
      toast.success('Ironing completion recorded successfully');
    } catch (error) {
      toast.error('Failed to save ironing data');
    }
  };

  if (batch.ironing_quantity > 0) {
    return (
      <Card className="border-l-4 border-l-green-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            Ironing Completed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <span className="font-medium">Total Ironed Pieces:</span>
            <div className="font-semibold text-green-600">
              {batch.ironing_quantity} pieces
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-l-4 border-l-orange-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-600">
          <Flame className="h-5 w-5" />
          Record Ironing Completion
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="ironingQty">Ironing Quantity (pieces)</Label>
          <Input
            id="ironingQty"
            type="number"
            value={ironingQuantity}
            onChange={(e) => setIroningQuantity(parseInt(e.target.value) || 0)}
            placeholder="Enter ironing quantity"
            min="0"
          />
        </div>
        
        <Button 
          onClick={handleSubmit} 
          disabled={updateBatch.isPending || ironingQuantity <= 0}
          className="w-full"
        >
          {updateBatch.isPending ? 'Saving...' : 'Complete Ironing'}
        </Button>
      </CardContent>
    </Card>
  );
};
