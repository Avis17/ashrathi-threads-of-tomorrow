import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Scissors, Plus, Trash2, Calendar, CheckCircle, AlertTriangle, Scale, Pencil, Check, X, Users } from 'lucide-react';
import { useAddCuttingLog, useDeleteCuttingLog, useUpdateCuttingLog, CuttingLog, SizePieces } from '@/hooks/useBatchCuttingLogs';
import { useDeleteOperationProgress, useUpsertOperationProgress } from '@/hooks/useBatchOperationProgress';
import { useBatchCuttingWastage } from '@/hooks/useBatchCuttingWastage';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { CuttingStatsCards } from './CuttingStatsCards';
import { WastageEntryForm } from './WastageEntryForm';
import { WastageLogTable } from './WastageLogTable';

interface OperationProgressEntry {
  id: string;
  batch_id: string;
  operation: string;
  completed_pieces: number;
  mistake_pieces: number;
  type_index: number;
  size: string;
  notes: string | null;
  updated_at: string;
  created_at: string;
}

interface BatchCuttingSectionProps {
  batch: any;
  rollsData: any[];
  cuttingLogs: CuttingLog[];
  cuttingSummary: Record<number, number>;
  overallActualCutWastage?: number | null;
  overallActualConfirmedWastage?: number | null;
  operationProgress?: OperationProgressEntry[];
}

export const BatchCuttingSection = ({ batch, rollsData, cuttingLogs, cuttingSummary, overallActualCutWastage, overallActualConfirmedWastage, operationProgress = [] }: BatchCuttingSectionProps) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showWastageForm, setShowWastageForm] = useState(false);
  const [selectedTypeIndex, setSelectedTypeIndex] = useState<string>('');
  const [logDate, setLogDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [piecesCut, setPiecesCut] = useState('');
  const [notes, setNotes] = useState('');
  const [deleteLogId, setDeleteLogId] = useState<string | null>(null);
  const [deleteStaffEntryId, setDeleteStaffEntryId] = useState<string | null>(null);
  const [deleteStaffTypeIndex, setDeleteStaffTypeIndex] = useState<number | null>(null);
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [editPiecesCut, setEditPiecesCut] = useState('');
  const [sizePieces, setSizePieces] = useState<SizePieces>({});
  const [customSize, setCustomSize] = useState('');
  const [editingStaffEntryId, setEditingStaffEntryId] = useState<string | null>(null);
  const [editStaffPieces, setEditStaffPieces] = useState('');

  const addLogMutation = useAddCuttingLog();
  const deleteLogMutation = useDeleteCuttingLog();
  const updateLogMutation = useUpdateCuttingLog();
  const { data: wastageEntries } = useBatchCuttingWastage(batch.id);
  const deleteOperationMutation = useDeleteOperationProgress();
  const upsertProgressMutation = useUpsertOperationProgress();

  const COMMON_SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'];

  // Collect all sizes used across existing logs for this batch
  const existingSizes = useMemo(() => {
    const sizes = new Set<string>();
    cuttingLogs.forEach(log => {
      if (log.size_pieces && typeof log.size_pieces === 'object') {
        Object.keys(log.size_pieces).forEach(s => sizes.add(s));
      }
    });
    return [...sizes];
  }, [cuttingLogs]);

  const activeSizes = useMemo(() => {
    const all = new Set([...COMMON_SIZES, ...existingSizes, ...Object.keys(sizePieces)]);
    return [...all];
  }, [existingSizes, sizePieces]);

  const sizePiecesTotal = Object.values(sizePieces).reduce((sum, val) => sum + (val || 0), 0);

  const handleSizePieceChange = (size: string, value: string) => {
    const num = parseInt(value) || 0;
    setSizePieces(prev => {
      const updated = { ...prev };
      if (num > 0) {
        updated[size] = num;
      } else {
        delete updated[size];
      }
      return updated;
    });
  };

  const handleAddCustomSize = () => {
    const trimmed = customSize.trim().toUpperCase();
    if (trimmed && !activeSizes.includes(trimmed)) {
      setSizePieces(prev => ({ ...prev, [trimmed]: 0 }));
    }
    setCustomSize('');
  };

  const handleAddLog = async () => {
    const typeIndex = parseInt(selectedTypeIndex);
    if (isNaN(typeIndex)) return;
    const totalPieces = sizePiecesTotal > 0 ? sizePiecesTotal : parseInt(piecesCut);
    if (!totalPieces || totalPieces <= 0) return;
    const selectedType = rollsData[typeIndex];
    const cleanSizePieces = Object.keys(sizePieces).length > 0 ? sizePieces : null;
    await addLogMutation.mutateAsync({
      batch_id: batch.id,
      log_date: logDate,
      type_index: typeIndex,
      color: selectedType?.color || '',
      style_id: selectedType?.style_id || null,
      pieces_cut: totalPieces,
      size_pieces: cleanSizePieces,
      notes: notes || undefined,
    });
    setSelectedTypeIndex('');
    setPiecesCut('');
    setSizePieces({});
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

  // Aggregate size breakdown per type index (from cutting logs)
  const sizeSummaryByType = useMemo(() => {
    const map: Record<number, SizePieces> = {};
    cuttingLogs.forEach(log => {
      if (log.size_pieces && typeof log.size_pieces === 'object') {
        if (!map[log.type_index]) map[log.type_index] = {};
        Object.entries(log.size_pieces as SizePieces).forEach(([size, count]) => {
          map[log.type_index][size] = (map[log.type_index][size] || 0) + (count || 0);
        });
      }
    });
    // Merge staff cutting data for types without cutting logs
    operationProgress
      .filter(p => p.operation.toLowerCase() === 'cutting')
      .forEach(op => {
        const ti = op.type_index;
        const hasLogs = cuttingLogs.some(l => l.type_index === ti);
        if (!hasLogs && op.completed_pieces > 0) {
          if (!map[ti]) map[ti] = {};
          const size = op.size || '';
          if (size) {
            map[ti][size] = (map[ti][size] || 0) + op.completed_pieces;
          }
        }
      });
    return map;
  }, [cuttingLogs, operationProgress]);

  // Staff cutting progress from batch_operation_progress table
  const staffCuttingProgress = useMemo(() => {
    const cuttingOps = operationProgress.filter(p => p.operation.toLowerCase() === 'cutting');
    // Group by type_index, then by size
    const byType: Record<number, { sizes: Record<string, { id: string; completed: number; mistakes: number; updatedAt: string }>; totalCompleted: number; totalMistakes: number }> = {};
    cuttingOps.forEach(op => {
      if (!byType[op.type_index]) {
        byType[op.type_index] = { sizes: {}, totalCompleted: 0, totalMistakes: 0 };
      }
      const sizeKey = op.size || 'Total';
      byType[op.type_index].sizes[sizeKey] = {
        id: op.id,
        completed: op.completed_pieces,
        mistakes: op.mistake_pieces,
        updatedAt: op.updated_at,
      };
      byType[op.type_index].totalCompleted += op.completed_pieces;
      byType[op.type_index].totalMistakes += op.mistake_pieces;
    });
    return byType;
  }, [operationProgress]);

  const hasStaffCuttingData = Object.keys(staffCuttingProgress).length > 0;

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

  // Group logs by date, including staff entries for types without cutting logs
  interface UnifiedCuttingEntry {
    id: string;
    type_index: number;
    color: string;
    pieces_cut: number;
    size_pieces: SizePieces | null;
    notes: string | null;
    log_date: string;
    isStaffEntry: boolean;
    // For staff entries: keep original progress data for editing
    staffSize?: string;
    staffBatchId?: string;
  }

  const logsByDate = useMemo(() => {
    const map: Record<string, UnifiedCuttingEntry[]> = {};
    
    // Add regular cutting logs
    cuttingLogs.forEach(log => {
      if (!map[log.log_date]) map[log.log_date] = [];
      map[log.log_date].push({
        id: log.id,
        type_index: log.type_index,
        color: log.color,
        pieces_cut: log.pieces_cut,
        size_pieces: log.size_pieces as SizePieces | null,
        notes: log.notes,
        log_date: log.log_date,
        isStaffEntry: false,
      });
    });

    // Add staff cutting entries for types that have NO cutting logs
    const typesWithLogs = new Set(cuttingLogs.map(l => l.type_index));
    const staffCuttingOps = operationProgress.filter(p => p.operation.toLowerCase() === 'cutting');
    
    // Group staff entries by type_index
    const staffByType: Record<number, typeof staffCuttingOps> = {};
    staffCuttingOps.forEach(op => {
      if (!typesWithLogs.has(op.type_index)) {
        if (!staffByType[op.type_index]) staffByType[op.type_index] = [];
        staffByType[op.type_index].push(op);
      }
    });

    Object.entries(staffByType).forEach(([tiStr, ops]) => {
      const ti = parseInt(tiStr);
      const type = rollsData[ti];
      // Combine all size entries for this type into one unified entry
      const totalPieces = ops.reduce((s, o) => s + o.completed_pieces, 0);
      const sp: SizePieces = {};
      const staffNotes: string[] = [];
      ops.forEach(o => {
        if (o.size && o.completed_pieces > 0) sp[o.size] = o.completed_pieces;
        if (o.notes) staffNotes.push(o.notes);
      });
      const combinedNotes = staffNotes.length > 0 
        ? staffNotes.join(' | ') 
        : 'From Staff Production Tracker';
      const date = ops[0]?.updated_at ? format(new Date(ops[0].updated_at), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');
      if (!map[date]) map[date] = [];
      map[date].push({
        id: `staff-${ti}`,
        type_index: ti,
        color: type?.color || `Type ${ti + 1}`,
        pieces_cut: totalPieces,
        size_pieces: Object.keys(sp).length > 0 ? sp : null,
        notes: combinedNotes,
        log_date: date,
        isStaffEntry: true,
        staffBatchId: batch.id,
      });
    });

    return map;
  }, [cuttingLogs, operationProgress, rollsData, batch.id]);

  // Style-wise piece counts
  const styleIds = useMemo(() => [...new Set(rollsData.map(r => r.style_id).filter(Boolean))], [rollsData]);
  const { data: styles = [] } = useQuery({
    queryKey: ['job-styles-cutting', styleIds],
    queryFn: async () => {
      if (styleIds.length === 0) return [];
      const { data, error } = await supabase.from('job_styles').select('id, style_code, style_name').in('id', styleIds);
      if (error) throw error;
      return data;
    },
    enabled: styleIds.length > 0,
  });

  const piecesByStyle = useMemo(() => {
    const map: Record<string, { styleName: string; styleCode: string; pieces: number; colors: string[] }> = {};
    rollsData.forEach((type, index) => {
      const sid = type.style_id;
      if (!sid) return;
      const style = styles.find(s => s.id === sid);
      if (!map[sid]) {
        map[sid] = { styleName: style?.style_name || 'Unknown', styleCode: style?.style_code || '', pieces: 0, colors: [] };
      }
      map[sid].pieces += cuttingSummary[index] || 0;
      if (!map[sid].colors.includes(type.color)) map[sid].colors.push(type.color);
    });
    return Object.values(map);
  }, [rollsData, styles, cuttingSummary]);

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
        overallActualCutWastage={overallActualCutWastage}
        overallActualConfirmedWastage={overallActualConfirmedWastage}
      />

      {/* Pieces by Style */}
      {piecesByStyle.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Scissors className="h-5 w-5 text-primary" />
              Total Pieces by Style
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {piecesByStyle.map((s, i) => (
                <div key={i} className="p-4 rounded-lg border bg-muted/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold truncate">{s.styleName}</h4>
                    <Badge className="text-lg px-3 py-1 bg-primary">{s.pieces}</Badge>
                  </div>
                  {s.styleCode && <p className="text-xs text-muted-foreground">Code: {s.styleCode}</p>}
                  <div className="flex flex-wrap gap-1">
                    {s.colors.map(c => (
                      <Badge key={c} variant="outline" className="text-xs">{c}</Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-primary/10 rounded-lg flex items-center justify-between">
              <span className="font-semibold">Grand Total</span>
              <Badge className="text-lg px-4 py-1.5 bg-primary">{totalCutPieces}</Badge>
            </div>
          </CardContent>
        </Card>
      )}

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
              const typeSizes = sizeSummaryByType[index];
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
                    {typeSizes && Object.keys(typeSizes).length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {Object.entries(typeSizes).filter(([, v]) => v > 0).map(([size, count]) => (
                          <Badge key={size} variant="outline" className="text-xs font-normal">
                            {size}: <span className="font-semibold ml-0.5">{count}</span>
                          </Badge>
                        ))}
                      </div>
                    )}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>

            {/* Size-wise pieces entry */}
            <div>
              <Label className="text-base font-semibold">Size-wise Pieces</Label>
              <p className="text-xs text-muted-foreground mb-3">Enter pieces per size. Total will be calculated automatically.</p>
              <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9 gap-2">
                {activeSizes.map(size => (
                  <div key={size} className="space-y-1">
                    <Label className="text-xs text-center block">{size}</Label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={sizePieces[size] || ''}
                      onChange={(e) => handleSizePieceChange(size, e.target.value)}
                      className="text-center h-9 text-sm"
                    />
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Input
                  placeholder="Custom size..."
                  value={customSize}
                  onChange={(e) => setCustomSize(e.target.value)}
                  className="w-32 h-8 text-sm"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCustomSize()}
                />
                <Button type="button" variant="outline" size="sm" onClick={handleAddCustomSize} disabled={!customSize.trim()}>
                  <Plus className="h-3 w-3 mr-1" /> Add Size
                </Button>
              </div>
              {sizePiecesTotal > 0 && (
                <div className="mt-3 p-3 rounded-lg bg-primary/10 flex items-center justify-between">
                  <span className="font-semibold">Total Pieces</span>
                  <Badge className="text-lg px-3 py-1 bg-primary">{sizePiecesTotal}</Badge>
                </div>
              )}
            </div>

            {/* Fallback: manual total if no sizes entered */}
            {sizePiecesTotal === 0 && (
              <div>
                <Label htmlFor="pieces-cut">Or Enter Total Pieces Directly</Label>
                <Input id="pieces-cut" type="number" placeholder="Enter total quantity" value={piecesCut} onChange={(e) => setPiecesCut(e.target.value)} className="max-w-xs" />
              </div>
            )}

            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea id="notes" placeholder="Any remarks..." value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => { setShowAddForm(false); setSizePieces({}); }}>Cancel</Button>
              <Button onClick={handleAddLog} disabled={!selectedTypeIndex || (sizePiecesTotal === 0 && !piecesCut) || addLogMutation.isPending}>
                {addLogMutation.isPending ? 'Saving...' : 'Add Entry'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Staff Production Updates (from batch_operation_progress) */}
      {hasStaffCuttingData && (
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle className="h-5 w-5 text-blue-500" />
              Staff Cutting Updates
              <Badge variant="outline" className="ml-2 text-xs">From Production Tracker</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rollsData.map((type, index) => {
                const staffData = staffCuttingProgress[index];
                if (!staffData) return null;
                const cutFromLogs = cuttingSummary[index] || 0;

                return (
                  <div key={index} className="p-4 rounded-lg border border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{index + 1}</Badge>
                          <h4 className="font-semibold">{type.color}</h4>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{type.fabric_type}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{staffData.totalCompleted}</div>
                        <div className="text-xs text-muted-foreground">completed</div>
                      </div>
                    </div>

                    {/* Comparison with cutting logs */}
                    {cutFromLogs > 0 && (
                      <div className="text-xs flex items-center justify-between p-2 rounded bg-muted/50">
                        <span className="text-muted-foreground">Cutting Log Total</span>
                        <span className="font-medium">{cutFromLogs} pcs</span>
                      </div>
                    )}

                    {staffData.totalMistakes > 0 && (
                      <div className="text-xs flex items-center justify-between p-2 rounded bg-destructive/10">
                        <span className="text-destructive flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" /> Mistakes
                        </span>
                        <span className="font-medium text-destructive">{staffData.totalMistakes} pcs</span>
                      </div>
                    )}

                    {/* Size-wise breakdown */}
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">Size-wise Breakdown</p>
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(staffData.sizes)
                          .filter(([, v]) => v.completed > 0 || v.mistakes > 0)
                          .sort(([a], [b]) => {
                            const order = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'];
                            return (order.indexOf(a) === -1 ? 99 : order.indexOf(a)) - (order.indexOf(b) === -1 ? 99 : order.indexOf(b));
                          })
                          .map(([size, data]) => (
                            <div key={size} className="flex items-center gap-0.5">
                              <Badge
                                variant="outline"
                                className={`text-xs ${data.mistakes > 0 ? 'border-destructive/50 text-destructive' : 'border-blue-300 text-blue-700 dark:text-blue-300'}`}
                              >
                                {size === '' || size === 'Total' ? 'All' : size}: {data.completed}
                                {data.mistakes > 0 && <span className="ml-1 text-destructive">({data.mistakes} err)</span>}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5 text-destructive/60 hover:text-destructive"
                                onClick={() => setDeleteStaffEntryId(data.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Last updated */}
                    {Object.values(staffData.sizes).length > 0 && (
                      <p className="text-[10px] text-muted-foreground">
                        Last updated: {format(new Date(Object.values(staffData.sizes).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0].updatedAt), 'dd MMM yyyy, hh:mm a')}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Grand totals */}
            <div className="mt-4 p-3 bg-blue-100/50 dark:bg-blue-950/30 rounded-lg flex items-center justify-between">
              <span className="font-semibold">Staff Total Completed</span>
              <div className="flex items-center gap-2">
                {Object.values(staffCuttingProgress).reduce((s, d) => s + d.totalMistakes, 0) > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {Object.values(staffCuttingProgress).reduce((s, d) => s + d.totalMistakes, 0)} mistakes
                  </Badge>
                )}
                <Badge className="text-lg px-4 py-1.5 bg-blue-600">
                  {Object.values(staffCuttingProgress).reduce((s, d) => s + d.totalCompleted, 0)}
                </Badge>
              </div>
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
                          <TableHead>Source</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Color</TableHead>
                          <TableHead>Pieces</TableHead>
                          <TableHead>Size Breakdown</TableHead>
                          <TableHead>Notes</TableHead>
                          <TableHead className="w-20">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {logs.map((log) => {
                          const sp = log.size_pieces;
                          const isStaff = log.isStaffEntry;
                          return (
                          <TableRow key={log.id} className={isStaff ? 'bg-blue-50/50 dark:bg-blue-950/10' : ''}>
                            <TableCell>
                              {isStaff ? (
                                <Badge variant="outline" className="text-xs border-blue-300 text-blue-700 dark:text-blue-300">
                                  <Users className="h-3 w-3 mr-1" /> Staff
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-xs">Admin</Badge>
                              )}
                            </TableCell>
                            <TableCell><Badge variant="outline">{log.type_index + 1}</Badge></TableCell>
                            <TableCell className="font-medium">{log.color}</TableCell>
                            <TableCell>
                              {!isStaff && editingLogId === log.id ? (
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
                                <Badge
                                  className={`cursor-pointer ${isStaff ? 'bg-blue-600' : ''}`}
                                  onClick={() => {
                                    if (!isStaff) {
                                      setEditingLogId(log.id);
                                      setEditPiecesCut(log.pieces_cut.toString());
                                    }
                                  }}
                                >
                                  {log.pieces_cut} pcs
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {sp && Object.keys(sp).length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {Object.entries(sp).filter(([, v]) => v > 0).map(([size, count]) => (
                                    <Badge key={size} variant="outline" className="text-xs font-normal">
                                      {size}: <span className="font-semibold ml-0.5">{count}</span>
                                    </Badge>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{log.notes || '-'}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                {isStaff ? (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                    onClick={() => {
                                      setDeleteStaffTypeIndex(log.type_index);
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                ) : (
                                  <>
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingLogId(log.id); setEditPiecesCut(log.pieces_cut.toString()); }}>
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteLogId(log.id)}>
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                        })}
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

      {/* Delete Staff Entry Confirmation */}
      <AlertDialog open={!!deleteStaffEntryId} onOpenChange={() => setDeleteStaffEntryId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Staff Cutting Entry?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete this staff production update entry.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteStaffEntryId) {
                  deleteOperationMutation.mutate(deleteStaffEntryId);
                  setDeleteStaffEntryId(null);
                }
              }}
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
