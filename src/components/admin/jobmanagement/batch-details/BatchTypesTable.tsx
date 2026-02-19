import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FileText, Check, Pencil } from 'lucide-react';
import { useBatchTypeConfirmed, useUpsertBatchTypeConfirmed } from '@/hooks/useBatchTypeConfirmed';

interface BatchTypesTableProps {
  rollsData: any[];
  cuttingSummary: Record<number, number>;
  batchId: string;
}

export const BatchTypesTable = ({ rollsData, cuttingSummary, batchId }: BatchTypesTableProps) => {
  const { data: confirmedMap = {} } = useBatchTypeConfirmed(batchId);
  const upsert = useUpsertBatchTypeConfirmed();

  // editing state: typeIndex -> local value
  const [editing, setEditing] = useState<Record<number, string>>({});
  const [activeEdit, setActiveEdit] = useState<number | null>(null);

  const handleEdit = (index: number) => {
    setActiveEdit(index);
    setEditing(prev => ({ ...prev, [index]: String(confirmedMap[index] ?? 0) }));
  };

  const handleSave = async (index: number) => {
    const val = parseInt(editing[index] ?? '0', 10);
    await upsert.mutateAsync({ batchId, typeIndex: index, confirmedPieces: isNaN(val) ? 0 : val });
    setActiveEdit(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Types & Colors Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">#</TableHead>
                <TableHead>Color</TableHead>
                <TableHead>Fabric Type</TableHead>
                <TableHead>GSM</TableHead>
                <TableHead>Width</TableHead>
                <TableHead>Rolls</TableHead>
                <TableHead>Weight (kg)</TableHead>
                <TableHead>Cut Pieces</TableHead>
                <TableHead>Confirmed</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Delivery Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rollsData.map((type, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Badge variant="outline">{index + 1}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{type.color}</div>
                  </TableCell>
                  <TableCell>{type.fabric_type}</TableCell>
                  <TableCell>{type.gsm}</TableCell>
                  <TableCell>{type.fabric_width}"</TableCell>
                  <TableCell>{type.number_of_rolls}</TableCell>
                  <TableCell>
                    <div>
                      <span className="font-medium">{(type.weight * type.number_of_rolls).toFixed(2)}</span>
                      <span className="text-xs text-muted-foreground ml-1">({type.weight}/roll)</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={cuttingSummary[index] > 0 ? 'default' : 'secondary'}>
                      {cuttingSummary[index] || 0} pcs
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {activeEdit === index ? (
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          min={0}
                          value={editing[index] ?? '0'}
                          onChange={e => setEditing(prev => ({ ...prev, [index]: e.target.value }))}
                          className="h-8 w-24 text-sm"
                          autoFocus
                          onKeyDown={e => { if (e.key === 'Enter') handleSave(index); if (e.key === 'Escape') setActiveEdit(null); }}
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-primary"
                          onClick={() => handleSave(index)}
                          disabled={upsert.isPending}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Badge variant={confirmedMap[index] > 0 ? 'default' : 'secondary'} className="cursor-pointer">
                          {confirmedMap[index] ?? 0} pcs
                        </Badge>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-muted-foreground hover:text-primary"
                          onClick={() => handleEdit(index)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    {type.planned_start_date ? new Date(type.planned_start_date).toLocaleDateString() : '-'}
                  </TableCell>
                  <TableCell className="text-sm">
                    {type.estimated_delivery_date ? new Date(type.estimated_delivery_date).toLocaleDateString() : '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {rollsData.length === 0 && (
          <p className="text-center text-muted-foreground py-8">No types/colors defined</p>
        )}

        {/* Notes Section */}
        {rollsData.some(type => type.notes) && (
          <div className="mt-6 space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground">Notes per Type</h4>
            {rollsData.map((type, index) => type.notes && (
              <div key={index} className="p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-xs">{index + 1}</Badge>
                  <span className="font-medium text-sm">{type.color}</span>
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{type.notes}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
