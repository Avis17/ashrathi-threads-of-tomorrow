import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAddCuttingWastage } from '@/hooks/useBatchCuttingWastage';
import { format } from 'date-fns';

interface WastageEntryFormProps {
  batchId: string;
  rollsData: any[];
  onClose: () => void;
}

export const WastageEntryForm = ({ batchId, rollsData, onClose }: WastageEntryFormProps) => {
  const [selectedTypeIndex, setSelectedTypeIndex] = useState<string>('');
  const [wastagePieces, setWastagePieces] = useState('');
  const [actualWeightKg, setActualWeightKg] = useState('');
  const [logDate, setLogDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [notes, setNotes] = useState('');

  const addWastageMutation = useAddCuttingWastage();

  const handleSubmit = async () => {
    const typeIndex = parseInt(selectedTypeIndex);
    if (isNaN(typeIndex) || !wastagePieces) return;

    const selectedType = rollsData[typeIndex];

    await addWastageMutation.mutateAsync({
      batch_id: batchId,
      type_index: typeIndex,
      color: selectedType?.color || '',
      wastage_pieces: parseInt(wastagePieces),
      actual_weight_kg: actualWeightKg ? parseFloat(actualWeightKg) : null,
      notes: notes || undefined,
      log_date: logDate,
    });

    setSelectedTypeIndex('');
    setWastagePieces('');
    setActualWeightKg('');
    setNotes('');
    onClose();
  };

  return (
    <Card className="border-2 border-orange-300 dark:border-orange-700">
      <CardHeader>
        <CardTitle className="text-lg">Add Wastage / Actual Weight Entry</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label>Date</Label>
            <Input type="date" value={logDate} onChange={(e) => setLogDate(e.target.value)} />
          </div>
          <div>
            <Label>Color/Type</Label>
            <Select value={selectedTypeIndex} onValueChange={setSelectedTypeIndex}>
              <SelectTrigger><SelectValue placeholder="Select color" /></SelectTrigger>
              <SelectContent>
                {rollsData.map((type, index) => (
                  <SelectItem key={index} value={index.toString()}>
                    {index + 1}. {type.color} ({type.fabric_type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Wastage Pieces</Label>
            <Input
              type="number"
              placeholder="Defective count"
              value={wastagePieces}
              onChange={(e) => setWastagePieces(e.target.value)}
            />
          </div>
          <div>
            <Label>Actual Weight (kg)</Label>
            <Input
              type="number"
              step="0.001"
              placeholder="Actual cut weight"
              value={actualWeightKg}
              onChange={(e) => setActualWeightKg(e.target.value)}
            />
          </div>
        </div>
        <div>
          <Label>Notes (Optional)</Label>
          <Textarea placeholder="Reason for wastage..." value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedTypeIndex || !wastagePieces || addWastageMutation.isPending}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            {addWastageMutation.isPending ? 'Saving...' : 'Add Entry'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
