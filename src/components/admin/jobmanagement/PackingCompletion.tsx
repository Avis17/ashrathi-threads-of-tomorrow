import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Package, CheckCircle } from 'lucide-react';
import { useUpdateJobBatch } from '@/hooks/useJobBatches';
import { toast } from 'sonner';

interface PackingCompletionProps {
  batch: any;
}

export const PackingCompletion = ({ batch }: PackingCompletionProps) => {
  const updateBatch = useUpdateJobBatch();
  const [packedQuantity, setPackedQuantity] = useState(batch.packed_quantity || 0);

  const handleSubmit = async () => {
    if (packedQuantity <= 0) {
      toast.error('Packed quantity must be greater than 0');
      return;
    }

    try {
      await updateBatch.mutateAsync({
        id: batch.id,
        data: {
          packed_quantity: packedQuantity,
          final_quantity: packedQuantity,
          overall_progress: 100,
          status: 'completed'
        }
      });
      toast.success('Packing completion recorded successfully - Batch is now complete!');
    } catch (error) {
      toast.error('Failed to save packing data');
    }
  };

  if (batch.packed_quantity > 0) {
    return (
      <Card className="border-l-4 border-l-green-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            Packing Completed - Batch Complete!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <span className="font-medium">Total Packed Pieces:</span>
            <div className="font-semibold text-green-600">
              {batch.packed_quantity} pieces
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-l-4 border-l-pink-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-pink-600">
          <Package className="h-5 w-5" />
          Record Packing Completion
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="packedQty">Packed Quantity (pieces)</Label>
          <Input
            id="packedQty"
            type="number"
            value={packedQuantity}
            onChange={(e) => setPackedQuantity(parseInt(e.target.value) || 0)}
            placeholder="Enter packed quantity"
            min="0"
          />
        </div>
        
        <Button 
          onClick={handleSubmit} 
          disabled={updateBatch.isPending || packedQuantity <= 0}
          className="w-full"
        >
          {updateBatch.isPending ? 'Saving...' : 'Complete Packing'}
        </Button>
      </CardContent>
    </Card>
  );
};
