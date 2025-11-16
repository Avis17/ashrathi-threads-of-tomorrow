import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle } from 'lucide-react';
import { useUpdateJobBatch } from '@/hooks/useJobBatches';
import { toast } from 'sonner';

interface CheckingCompletionProps {
  batch: any;
}

export const CheckingCompletion = ({ batch }: CheckingCompletionProps) => {
  const updateBatch = useUpdateJobBatch();
  const [checkedQuantity, setCheckedQuantity] = useState(batch.checked_quantity || 0);

  const handleSubmit = async () => {
    if (checkedQuantity <= 0) {
      toast.error('Checked quantity must be greater than 0');
      return;
    }

    try {
      await updateBatch.mutateAsync({
        id: batch.id,
        data: {
          checked_quantity: checkedQuantity,
          overall_progress: 85
        }
      });
      toast.success('Checking completion recorded successfully');
    } catch (error) {
      toast.error('Failed to save checking data');
    }
  };

  if (batch.checked_quantity > 0) {
    return (
      <Card className="border-l-4 border-l-green-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            Checking Completed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <span className="font-medium">Total Checked Pieces:</span>
            <div className="font-semibold text-green-600">
              {batch.checked_quantity} pieces
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-l-4 border-l-green-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-600">
          <CheckCircle className="h-5 w-5" />
          Record Checking Completion
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="checkedQty">Checked Quantity (pieces)</Label>
          <Input
            id="checkedQty"
            type="number"
            value={checkedQuantity}
            onChange={(e) => setCheckedQuantity(parseInt(e.target.value) || 0)}
            placeholder="Enter checked quantity"
            min="0"
          />
        </div>
        
        <Button 
          onClick={handleSubmit} 
          disabled={updateBatch.isPending || checkedQuantity <= 0}
          className="w-full"
        >
          {updateBatch.isPending ? 'Saving...' : 'Complete Checking'}
        </Button>
      </CardContent>
    </Card>
  );
};
