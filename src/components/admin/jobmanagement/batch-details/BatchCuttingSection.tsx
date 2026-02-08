import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Scissors, Plus, Trash2, Calendar, CheckCircle } from 'lucide-react';
import { useAddCuttingLog, useDeleteCuttingLog, CuttingLog } from '@/hooks/useBatchCuttingLogs';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface BatchCuttingSectionProps {
  batch: any;
  rollsData: any[];
  cuttingLogs: CuttingLog[];
  cuttingSummary: Record<number, number>;
}

export const BatchCuttingSection = ({ batch, rollsData, cuttingLogs, cuttingSummary }: BatchCuttingSectionProps) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedTypeIndex, setSelectedTypeIndex] = useState<string>('');
  const [logDate, setLogDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [piecesCut, setPiecesCut] = useState('');
  const [notes, setNotes] = useState('');
  const [deleteLogId, setDeleteLogId] = useState<string | null>(null);

  const addLogMutation = useAddCuttingLog();
  const deleteLogMutation = useDeleteCuttingLog();

  const handleAddLog = async () => {
    const typeIndex = parseInt(selectedTypeIndex);
    if (isNaN(typeIndex) || !piecesCut) return;

    const selectedType = rollsData[typeIndex];
    
    await addLogMutation.mutateAsync({
      batch_id: batch.id,
      log_date: logDate,
      type_index: typeIndex,
      color: selectedType?.color || '',
      style_id: selectedType?.style_id || null,
      pieces_cut: parseInt(piecesCut),
      notes: notes || undefined,
    });

    // Reset form
    setSelectedTypeIndex('');
    setPiecesCut('');
    setNotes('');
    setShowAddForm(false);
  };

  const handleDeleteLog = async () => {
    if (deleteLogId) {
      await deleteLogMutation.mutateAsync({ id: deleteLogId, batchId: batch.id });
      setDeleteLogId(null);
    }
  };

  const totalCutPieces = Object.values(cuttingSummary).reduce((sum, val) => sum + val, 0);

  // Group logs by date
  const logsByDate: Record<string, CuttingLog[]> = {};
  cuttingLogs.forEach(log => {
    if (!logsByDate[log.log_date]) {
      logsByDate[log.log_date] = [];
    }
    logsByDate[log.log_date].push(log);
  });

  return (
    <div className="space-y-6">
      {/* Summary Cards per Type */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Scissors className="h-5 w-5 text-blue-500" />
            Cutting Progress by Color
          </CardTitle>
          <Button onClick={() => setShowAddForm(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Cutting Entry
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rollsData.map((type, index) => {
              const cutPieces = cuttingSummary[index] || 0;
              return (
                <div 
                  key={index} 
                  className={`p-4 rounded-lg border ${cutPieces > 0 ? 'border-green-200 bg-green-50 dark:bg-green-950/20' : 'border-muted bg-muted/30'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">{index + 1}</Badge>
                    {cutPieces > 0 && <CheckCircle className="h-4 w-4 text-green-500" />}
                  </div>
                  <h4 className="font-semibold">{type.color}</h4>
                  <p className="text-sm text-muted-foreground">{type.fabric_type} • {type.gsm} GSM</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {type.number_of_rolls} rolls × {type.weight}kg
                    </span>
                    <Badge variant={cutPieces > 0 ? 'default' : 'secondary'} className="text-lg px-3">
                      {cutPieces} pcs
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 p-4 bg-primary/10 rounded-lg flex items-center justify-between">
            <span className="font-semibold text-lg">Total Cut Pieces</span>
            <Badge className="text-xl px-4 py-2 bg-primary">{totalCutPieces}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Add Entry Form */}
      {showAddForm && (
        <Card className="border-2 border-primary/30">
          <CardHeader>
            <CardTitle className="text-lg">Add Cutting Entry</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="log-date">Date</Label>
                <Input
                  id="log-date"
                  type="date"
                  value={logDate}
                  onChange={(e) => setLogDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="type-select">Color/Type</Label>
                <Select value={selectedTypeIndex} onValueChange={setSelectedTypeIndex}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select color/type" />
                  </SelectTrigger>
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
                <Label htmlFor="pieces-cut">Pieces Cut</Label>
                <Input
                  id="pieces-cut"
                  type="number"
                  placeholder="Enter quantity"
                  value={piecesCut}
                  onChange={(e) => setPiecesCut(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any remarks about this cutting entry..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleAddLog} 
                disabled={!selectedTypeIndex || !piecesCut || addLogMutation.isPending}
              >
                {addLogMutation.isPending ? 'Saving...' : 'Add Entry'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cutting Logs History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Cutting Log History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(logsByDate).length > 0 ? (
            <div className="space-y-6">
              {Object.entries(logsByDate)
                .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
                .map(([date, logs]) => (
                  <div key={date}>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline" className="text-sm">
                        {format(new Date(date), 'EEEE, MMMM dd, yyyy')}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {logs.reduce((sum, l) => sum + l.pieces_cut, 0)} pieces
                      </span>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Type</TableHead>
                          <TableHead>Color</TableHead>
                          <TableHead>Pieces</TableHead>
                          <TableHead>Notes</TableHead>
                          <TableHead className="w-20">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {logs.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell>
                              <Badge variant="outline">{log.type_index + 1}</Badge>
                            </TableCell>
                            <TableCell className="font-medium">{log.color}</TableCell>
                            <TableCell>
                              <Badge>{log.pieces_cut} pcs</Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                              {log.notes || '-'}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => setDeleteLogId(log.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No cutting entries recorded yet. Click "Add Cutting Entry" to start tracking.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteLogId} onOpenChange={() => setDeleteLogId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Cutting Entry?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this cutting log entry. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteLog}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
