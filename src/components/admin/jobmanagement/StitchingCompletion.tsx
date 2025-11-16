import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Zap, CheckCircle } from 'lucide-react';
import { useUpdateJobBatch } from '@/hooks/useJobBatches';
import { toast } from 'sonner';

interface StitchingCompletionProps {
  batch: any;
}

export const StitchingCompletion = ({ batch }: StitchingCompletionProps) => {
  const updateBatch = useUpdateJobBatch();
  const [stitchedQuantity, setStitchedQuantity] = useState(batch.stitched_quantity || 0);

  const handleSubmit = async () => {
    if (stitchedQuantity <= 0) {
      toast.error('Stitched quantity must be greater than 0');
      return;
    }

    try {
      await updateBatch.mutateAsync({
        id: batch.id,
        data: {
          stitched_quantity: stitchedQuantity,
          overall_progress: 50
        }
      });
      toast.success('Stitching completion recorded successfully');
    } catch (error) {
      toast.error('Failed to save stitching data');
    }
  };

  if (batch.stitched_quantity > 0) {
    return (
      <Card className="border-l-4 border-l-green-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            Stitching Completed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <span className="font-medium">Total Stitched Pieces:</span>
            <div className="font-semibold text-green-600">
              {batch.stitched_quantity} pieces
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-l-4 border-l-purple-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-600">
          <Zap className="h-5 w-5" />
          Record Stitching Completion
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="stitchedQty">Stitched Quantity (pieces)</Label>
          <Input
            id="stitchedQty"
            type="number"
            value={stitchedQuantity}
            onChange={(e) => setStitchedQuantity(parseInt(e.target.value) || 0)}
            placeholder="Enter stitched quantity"
            min="0"
          />
        </div>
        
        <Button 
          onClick={handleSubmit} 
          disabled={updateBatch.isPending || stitchedQuantity <= 0}
          className="w-full"
        >
          {updateBatch.isPending ? 'Saving...' : 'Complete Stitching'}
        </Button>
      </CardContent>
    </Card>
  );
};
