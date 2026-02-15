import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Scissors, Plus, Trash2, Calendar, CheckCircle, AlertTriangle, Scale, Pencil, Check, X } from 'lucide-react';
import { useAddCuttingLog, useDeleteCuttingLog, useUpdateCuttingLog, CuttingLog } from '@/hooks/useBatchCuttingLogs';
import { useBatchCuttingWastage } from '@/hooks/useBatchCuttingWastage';
import { format } from 'date-fns';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { CuttingStatsCards } from './CuttingStatsCards';
import { WastageEntryForm } from './WastageEntryForm';
import { WastageLogTable } from './WastageLogTable';

interface BatchCuttingSectionProps {
  batch: any;
  rollsData: any[];
  cuttingLogs: CuttingLog[];
  cuttingSummary: Record<number, number>;
}

export const BatchCuttingSection = ({ batch, rollsData, cuttingLogs, cuttingSummary }: BatchCuttingSectionProps) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showWastageForm, setShowWastageForm] = useState(false);
  const [selectedTypeIndex, setSelectedTypeIndex] = useState<string>('');
  const [logDate, setLogDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [piecesCut, setPiecesCut] = useState('');
  const [notes, setNotes] = useState('');
  const [deleteLogId, setDeleteLogId] = useState<string | null>(null);
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [editPiecesCut, setEditPiecesCut] = useState('');

  const addLogMutation = useAddCuttingLog();
  const deleteLogMutation = useDeleteCuttingLog();
  const updateLogMutation = useUpdateCuttingLog();
  const { data: wastageEntries } = useBatchCuttingWastage(batch.id);

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

  // Wastage summaries per type
  const wastageSummary: Record<number, { pieces: number; actualWeight: number }> = {};
  let totalWastagePieces = 0;
  let totalActualWeight = 0;
  wastageEntries?.forEach(entry => {
    if (!wastageSummary[entry.type_index]) {
      wastageSummary[entry.type_index] = { pieces: 0, actualWeight: 0 };
    }
    wastageSummary[entry.type_index].pieces += entry.wastage_pieces;
    totalWastagePieces += entry.wastage_pieces;
    if (entry.actual_weight_kg) {
      wastageSummary[entry.type_index].actualWeight += Number(entry.actual_weight_kg);
      totalActualWeight += Number(entry.actual_weight_kg);
    }
  });

  // Total fabric weight from rolls data
  const totalFabricWeight = rollsData.reduce((sum, type) => {
    return sum + ((type.number_of_rolls || 0) * (type.weight || 0));
  }, 0);

  // Count how many colors have actual weight logged
  const colorsWithActualWeight = Object.values(wastageSummary).filter(w => w.actualWeight > 0).length;

  // Group logs by date
  const logsByDate: Record<string, CuttingLog[]> = {};
  cuttingLogs.forEach(log => {
    if (!logsByDate[log.log_date]) logsByDate[log.log_date] = [];
    logsByDate[log.log_date].push(log);
  });

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <CuttingStatsCards
        totalCutPieces={totalCutPieces}
        totalWastagePieces={totalWastagePieces}
        totalFabricWeight={totalFabricWeight}
        totalActualWeight={totalActualWeight}
        colorsWithActualWeight={colorsWithActualWeight}
        totalColors={rollsData.length}
      />

      {/* Color Cards with Weight Info */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Scissors className="h-5 w-5 text-primary" />
            Cutting Progress by Color
          </CardTitle>
          <div className="flex gap-2">
            <Button onClick={() => setShowWastageForm(true)} size="sm" variant="outline" className="border-orange-300 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/20">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Add Wastage
            </Button>
            <Button onClick={() => setShowAddForm(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Cutting Entry
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rollsData.map((type, index) => {
              const cutPieces = cuttingSummary[index] || 0;
              const colorTotalWeight = (type.number_of_rolls || 0) * (type.weight || 0);
              const perPieceWeight = cutPieces > 0 ? (colorTotalWeight / cutPieces) : null;
              const colorWastage = wastageSummary[index];
              const colorActualWeight = colorWastage?.actualWeight || 0;
              const colorWastagePcs = colorWastage?.pieces || 0;
              const colorFabricWaste = colorActualWeight > 0 ? colorTotalWeight - colorActualWeight : null;

              return (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${cutPieces > 0 ? 'border-green-200 bg-green-50 dark:bg-green-950/20' : 'border-border bg-muted/30'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">{index + 1}</Badge>
                    <div className="flex items-center gap-1">
                      {colorWastagePcs > 0 && (
                        <Badge variant="destructive" className="text-xs">{colorWastagePcs} waste</Badge>
                      )}
                      {cutPieces > 0 && <CheckCircle className="h-4 w-4 text-green-500" />}
                    </div>
                  </div>
                  <h4 className="font-semibold">{type.color}</h4>
                  <p className="text-sm text-muted-foreground">{type.fabric_type} • {type.gsm} GSM</p>

                  <div className="mt-3 space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Rolls × Weight</span>
                      <span className="font-medium">{type.number_of_rolls} × {type.weight}kg = <strong>{colorTotalWeight.toFixed(2)} kg</strong></span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Pieces Cut</span>
                      <Badge variant={cutPieces > 0 ? 'default' : 'secondary'}>{cutPieces} pcs</Badge>
                    </div>
                    {perPieceWeight !== null && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Scale className="h-3 w-3" /> Per Piece Wt
                        </span>
                        <span className="font-medium">{(perPieceWeight * 1000).toFixed(0)} g</span>
                      </div>
                    )}
                    {colorActualWeight > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Actual Cut Wt</span>
                        <span className="font-medium">{colorActualWeight.toFixed(3)} kg</span>
                      </div>
                    )}
                    {colorFabricWaste !== null && (
                      <div className="flex justify-between text-orange-600 dark:text-orange-400">
                        <span>Fabric Waste</span>
                        <span className="font-medium">{colorFabricWaste.toFixed(3)} kg ({((colorFabricWaste / colorTotalWeight) * 100).toFixed(1)}%)</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 p-4 bg-primary/10 rounded-lg flex items-center justify-between">
            <span className="font-semibold text-lg">Total Cut Pieces</span>
            <div className="flex items-center gap-3">
              {totalWastagePieces > 0 && (
                <Badge variant="destructive" className="text-sm">
                  {totalWastagePieces} wastage
                </Badge>
              )}
              <Badge className="text-xl px-4 py-2 bg-primary">{totalCutPieces}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Wastage Form */}
      {showWastageForm && (
        <WastageEntryForm
          batchId={batch.id}
          rollsData={rollsData}
          onClose={() => setShowWastageForm(false)}
        />
      )}

      {/* Add Cutting Entry Form */}
      {showAddForm && (
        <Card className="border-2 border-primary/30">
          <CardHeader>
            <CardTitle className="text-lg">Add Cutting Entry</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="log-date">Date</Label>
                <Input id="log-date" type="date" value={logDate} onChange={(e) => setLogDate(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="type-select">Color/Type</Label>
                <Select value={selectedTypeIndex} onValueChange={setSelectedTypeIndex}>
                  <SelectTrigger><SelectValue placeholder="Select color/type" /></SelectTrigger>
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
                <Input id="pieces-cut" type="number" placeholder="Enter quantity" value={piecesCut} onChange={(e) => setPiecesCut(e.target.value)} />
              </div>
            </div>
            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea id="notes" placeholder="Any remarks..." value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
              <Button onClick={handleAddLog} disabled={!selectedTypeIndex || !piecesCut || addLogMutation.isPending}>
                {addLogMutation.isPending ? 'Saving...' : 'Add Entry'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Wastage Log Table */}
      <WastageLogTable wastageEntries={wastageEntries || []} batchId={batch.id} />

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
                            <TableCell><Badge variant="outline">{log.type_index + 1}</Badge></TableCell>
                            <TableCell className="font-medium">{log.color}</TableCell>
                            <TableCell>
                              {editingLogId === log.id ? (
                                <div className="flex items-center gap-1">
                                  <Input
                                    type="number"
                                    value={editPiecesCut}
                                    onChange={(e) => setEditPiecesCut(e.target.value)}
                                    className="h-8 w-20"
                                    autoFocus
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        const val = parseInt(editPiecesCut);
                                        if (!isNaN(val) && val > 0) {
                                          updateLogMutation.mutate({ id: log.id, batchId: batch.id, pieces_cut: val });
                                          setEditingLogId(null);
                                        }
                                      } else if (e.key === 'Escape') {
                                        setEditingLogId(null);
                                      }
                                    }}
                                  />
                                  <Button variant="ghost" size="icon" className="h-7 w-7 text-green-600" onClick={() => {
                                    const val = parseInt(editPiecesCut);
                                    if (!isNaN(val) && val > 0) {
                                      updateLogMutation.mutate({ id: log.id, batchId: batch.id, pieces_cut: val });
                                      setEditingLogId(null);
                                    }
                                  }}>
                                    <Check className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditingLogId(null)}>
                                    <X className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              ) : (
                                <Badge className="cursor-pointer" onClick={() => { setEditingLogId(log.id); setEditPiecesCut(log.pieces_cut.toString()); }}>
                                  {log.pieces_cut} pcs
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{log.notes || '-'}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingLogId(log.id); setEditPiecesCut(log.pieces_cut.toString()); }}>
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteLogId(log.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
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
            <AlertDialogDescription>This will permanently delete this cutting log entry.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteLog} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
