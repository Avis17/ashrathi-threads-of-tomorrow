import { Plus, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CMTOperation, operationCategories, machineTypes } from '@/types/cmt-quotation';

interface CMTOperationsTableProps {
  operations: CMTOperation[];
  onOperationsChange: (operations: CMTOperation[]) => void;
}

export function CMTOperationsTable({ operations, onOperationsChange }: CMTOperationsTableProps) {
  const addOperation = () => {
    const newOperation: CMTOperation = {
      id: crypto.randomUUID(),
      category: 'Stitching',
      machineType: 'Not Defined',
      description: '',
      smv: 0,
      ratePerPiece: 0,
      amount: 0,
    };
    onOperationsChange([...operations, newOperation]);
  };

  const removeOperation = (id: string) => {
    onOperationsChange(operations.filter(op => op.id !== id));
  };

  const updateOperation = (id: string, field: keyof CMTOperation, value: string | number) => {
    const updated = operations.map(op => {
      if (op.id === id) {
        const updatedOp = { ...op, [field]: value };
        // Auto-calculate amount
        if (field === 'ratePerPiece' || field === 'smv') {
          updatedOp.amount = updatedOp.ratePerPiece;
        }
        return updatedOp;
      }
      return op;
    });
    onOperationsChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Operations Breakdown</h3>
        <Button onClick={addOperation} variant="outline" size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Operation
        </Button>
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-10"></TableHead>
              <TableHead className="w-32">Category</TableHead>
              <TableHead className="w-36">Machine Type</TableHead>
              <TableHead>Operation Description</TableHead>
              <TableHead className="w-24 text-right">SMV</TableHead>
              <TableHead className="w-28 text-right">Rate/Pc (₹)</TableHead>
              <TableHead className="w-28 text-right">Amount (₹)</TableHead>
              <TableHead className="w-16"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {operations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No operations added. Click "Add Operation" to start.
                </TableCell>
              </TableRow>
            ) : (
              operations.map((operation, index) => (
                <TableRow key={operation.id} className="group">
                  <TableCell className="cursor-grab">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                  </TableCell>
                  <TableCell>
                    <Select
                      value={operation.category}
                      onValueChange={(value) => updateOperation(operation.id, 'category', value)}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {operationCategories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {operation.machineType === 'Not Defined' ? (
                      <Select
                        value={operation.machineType}
                        onValueChange={(value) => updateOperation(operation.id, 'machineType', value)}
                      >
                        <SelectTrigger className="h-9 text-muted-foreground">
                          <SelectValue placeholder="Not Defined" />
                        </SelectTrigger>
                        <SelectContent>
                          {machineTypes.map(type => (
                            <SelectItem key={type} value={type}>{type === 'Not Defined' ? '— Not Defined —' : type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Select
                        value={operation.machineType}
                        onValueChange={(value) => updateOperation(operation.id, 'machineType', value)}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {machineTypes.map(type => (
                            <SelectItem key={type} value={type}>{type === 'Not Defined' ? '— Not Defined —' : type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </TableCell>
                  <TableCell>
                    <Input
                      value={operation.description}
                      onChange={(e) => updateOperation(operation.id, 'description', e.target.value)}
                      placeholder="e.g., Shoulder attach with piping"
                      className="h-9"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.01"
                      value={operation.smv || ''}
                      onChange={(e) => updateOperation(operation.id, 'smv', parseFloat(e.target.value) || 0)}
                      className="h-9 text-right"
                      placeholder="0.00"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.01"
                      value={operation.ratePerPiece || ''}
                      onChange={(e) => updateOperation(operation.id, 'ratePerPiece', parseFloat(e.target.value) || 0)}
                      className="h-9 text-right"
                      placeholder="0.00"
                    />
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ₹{operation.ratePerPiece.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive"
                      onClick={() => removeOperation(operation.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {operations.length > 0 && (
        <div className="flex justify-end gap-8 text-sm">
          <div className="text-muted-foreground">
            Total SMV: <span className="font-semibold text-foreground">{operations.reduce((sum, op) => sum + op.smv, 0).toFixed(2)}</span>
          </div>
          <div className="text-muted-foreground">
            Total CMT Cost: <span className="font-semibold text-foreground">₹{operations.reduce((sum, op) => sum + op.ratePerPiece, 0).toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
