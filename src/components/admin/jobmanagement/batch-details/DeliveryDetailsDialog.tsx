import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Truck, CalendarIcon, StickyNote, Plus, Trash2, Scale, Package } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { WeightEntry, BatchDeliveryInfo, useUpsertBatchDeliveryInfo } from '@/hooks/useBatchDeliveryInfo';
import { toast } from 'sonner';

const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'];
const DEFAULT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

interface StyleGroup {
  styleId: string;
  styleName: string;
  typeIndices: number[];
}

interface DeliveryDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  styleGroup: StyleGroup | null;
  batchId: string;
  existingDate: string | null;
  existingNotes: string | null;
  existingDeliveryInfo: BatchDeliveryInfo | null;
  rollsData: any[];
  totalFabricWeightKg: number;
  isSetItem: boolean;
  availableSizes: string[];
  onConfirmDelivery: (date: string | null, notes: string | null) => void;
}

export function DeliveryDetailsDialog({
  open,
  onOpenChange,
  styleGroup,
  batchId,
  existingDate,
  existingNotes,
  existingDeliveryInfo,
  rollsData,
  totalFabricWeightKg,
  isSetItem,
  availableSizes,
  onConfirmDelivery,
}: DeliveryDetailsDialogProps) {
  const [deliveryDate, setDeliveryDate] = useState<Date | undefined>(undefined);
  const [notes, setNotes] = useState('');
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [piecesGiven, setPiecesGiven] = useState(0);
  const [samplePiecesGiven, setSamplePiecesGiven] = useState(0);
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([]);

  const upsertMutation = useUpsertBatchDeliveryInfo();

  // Calculate total fabric weight for this style's types (sum of weight_per_roll * rolls for each type)
  const styleFabricWeightGrams = useMemo(() => {
    if (!styleGroup) return 0;
    let totalGrams = 0;
    styleGroup.typeIndices.forEach(idx => {
      const type = rollsData[idx];
      if (type) {
        const weightPerRollKg = parseFloat(type.weight_per_roll) || 0;
        const rolls = parseInt(type.rolls) || 0;
        totalGrams += weightPerRollKg * rolls * 1000;
      }
    });
    return totalGrams;
  }, [styleGroup, rollsData]);

  useEffect(() => {
    if (open && styleGroup) {
      setDeliveryDate(existingDate ? parseISO(existingDate) : undefined);
      setNotes(existingNotes || '');
      if (existingDeliveryInfo) {
        setPiecesGiven(existingDeliveryInfo.pieces_given);
        setSamplePiecesGiven(existingDeliveryInfo.sample_pieces_given);
        setWeightEntries(existingDeliveryInfo.weight_entries || []);
      } else {
        setPiecesGiven(0);
        setSamplePiecesGiven(0);
        setWeightEntries([]);
      }
    }
  }, [open, styleGroup, existingDate, existingNotes, existingDeliveryInfo]);

  const totalPieces = piecesGiven + samplePiecesGiven;

  const totalProductWeightGrams = useMemo(
    () => weightEntries.reduce((sum, e) => sum + (e.weight_grams || 0), 0),
    [weightEntries]
  );

  // Total product weight = per-piece weight * total pieces
  const totalEstimatedProductWeight = totalProductWeightGrams * totalPieces;

  const fabricWastagePercent = useMemo(() => {
    if (styleFabricWeightGrams <= 0 || totalEstimatedProductWeight <= 0) return 0;
    const wastage = ((styleFabricWeightGrams - totalEstimatedProductWeight) / styleFabricWeightGrams) * 100;
    return Math.max(0, wastage);
  }, [styleFabricWeightGrams, totalEstimatedProductWeight]);

  const effectiveSizes = availableSizes.length > 0 ? availableSizes : DEFAULT_SIZES;

  const addWeightEntry = () => {
    setWeightEntries(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        size: effectiveSizes[0] || 'M',
        part: isSetItem ? 'top' : 'single',
        weight_grams: 0,
      },
    ]);
  };

  const removeWeightEntry = (id: string) => {
    setWeightEntries(prev => prev.filter(e => e.id !== id));
  };

  const updateWeightEntry = (id: string, field: keyof WeightEntry, value: any) => {
    setWeightEntries(prev =>
      prev.map(e => (e.id === id ? { ...e, [field]: value } : e))
    );
  };

  const handleSave = async () => {
    if (!styleGroup) return;
    const dateStr = deliveryDate ? format(deliveryDate, 'yyyy-MM-dd') : null;

    try {
      await upsertMutation.mutateAsync({
        batch_id: batchId,
        style_id: styleGroup.styleId,
        pieces_given: piecesGiven,
        sample_pieces_given: samplePiecesGiven,
        weight_entries: weightEntries,
        total_product_weight_grams: totalProductWeightGrams,
        total_fabric_weight_grams: styleFabricWeightGrams,
        fabric_wastage_percent: parseFloat(fabricWastagePercent.toFixed(2)),
      });
      onConfirmDelivery(dateStr, notes || null);
      toast.success('Delivery details saved');
    } catch (err) {
      toast.error('Failed to save delivery details');
    }
  };

  if (!styleGroup) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-blue-600" />
            Delivery Details
          </DialogTitle>
          <p className="text-sm text-muted-foreground">{styleGroup.styleName}</p>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Delivery Date */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Delivery Date</Label>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn('w-full justify-start text-left font-normal', !deliveryDate && 'text-muted-foreground')}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {deliveryDate ? format(deliveryDate, 'dd MMM yyyy') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-[300]" align="start" onInteractOutside={e => e.preventDefault()}>
                <Calendar
                  mode="single"
                  selected={deliveryDate}
                  onSelect={date => { setDeliveryDate(date); setCalendarOpen(false); }}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Pieces Given */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-1.5">
                <Package className="h-3.5 w-3.5" />
                Pieces Given
              </Label>
              <Input
                type="number"
                min={0}
                value={piecesGiven || ''}
                onChange={e => setPiecesGiven(parseInt(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-1.5">
                <Package className="h-3.5 w-3.5" />
                Sample Pieces
              </Label>
              <Input
                type="number"
                min={0}
                value={samplePiecesGiven || ''}
                onChange={e => setSamplePiecesGiven(parseInt(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
          </div>

          <div className="flex items-center justify-between px-3 py-2 bg-muted/50 rounded-lg">
            <span className="text-sm font-medium">Total Pieces</span>
            <Badge variant="secondary" className="text-sm">{totalPieces}</Badge>
          </div>

          {/* Actual Product Weight Entries */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium flex items-center gap-1.5">
                <Scale className="h-3.5 w-3.5" />
                Actual Product Weight (per piece)
              </Label>
              <Button variant="outline" size="sm" onClick={addWeightEntry} className="gap-1 h-7 text-xs">
                <Plus className="h-3 w-3" />
                Add Row
              </Button>
            </div>

            {weightEntries.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-3 border border-dashed rounded-lg">
                No weight entries yet. Click "Add Row" to start.
              </p>
            )}

            {weightEntries.map((entry, idx) => (
              <div key={entry.id} className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
                <div className="flex-1 grid grid-cols-3 gap-2">
                  {/* Size */}
                  <Select value={entry.size} onValueChange={v => updateWeightEntry(entry.id, 'size', v)}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-[300]">
                      {availableSizes.map(s => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Top/Bottom (only for set items) */}
                  {isSetItem ? (
                    <Select value={entry.part} onValueChange={v => updateWeightEntry(entry.id, 'part', v)}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="z-[300]">
                        <SelectItem value="top">Top</SelectItem>
                        <SelectItem value="bottom">Bottom</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="flex items-center text-xs text-muted-foreground pl-2">Single</div>
                  )}

                  {/* Weight */}
                  <Input
                    type="number"
                    min={0}
                    step={0.1}
                    className="h-8 text-xs"
                    placeholder="Weight (g)"
                    value={entry.weight_grams || ''}
                    onChange={e => updateWeightEntry(entry.id, 'weight_grams', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={() => removeWeightEntry(entry.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}

            {weightEntries.length > 0 && (
              <div className="flex items-center justify-between px-3 py-2 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium">Total Weight / Piece</span>
                <Badge variant="secondary" className="text-sm">{totalProductWeightGrams.toFixed(1)} g</Badge>
              </div>
            )}
          </div>

          {/* Wastage Calculation Summary */}
          {totalPieces > 0 && totalProductWeightGrams > 0 && (
            <div className="space-y-2 p-3 border rounded-lg bg-muted/20">
              <h4 className="text-sm font-semibold flex items-center gap-1.5">
                <Scale className="h-4 w-4 text-primary" />
                Fabric Wastage Calculation
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between p-2 bg-background rounded">
                  <span className="text-muted-foreground">Total Fabric Issued</span>
                  <span className="font-medium">{(styleFabricWeightGrams / 1000).toFixed(2)} kg</span>
                </div>
                <div className="flex justify-between p-2 bg-background rounded">
                  <span className="text-muted-foreground">Total Product Weight</span>
                  <span className="font-medium">{(totalEstimatedProductWeight / 1000).toFixed(2)} kg</span>
                </div>
                <div className="flex justify-between p-2 bg-background rounded">
                  <span className="text-muted-foreground">Wastage Weight</span>
                  <span className="font-medium">{((styleFabricWeightGrams - totalEstimatedProductWeight) / 1000).toFixed(2)} kg</span>
                </div>
                <div className="flex justify-between p-2 bg-background rounded">
                  <span className="text-muted-foreground">Wastage %</span>
                  <span className={cn(
                    'font-bold',
                    fabricWastagePercent > 20 ? 'text-destructive' : fabricWastagePercent > 10 ? 'text-amber-600' : 'text-green-600'
                  )}>
                    {fabricWastagePercent.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-1.5">
              <StickyNote className="h-3.5 w-3.5" />
              Delivery Notes
            </Label>
            <Textarea
              placeholder="Add any delivery notes..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={upsertMutation.isPending} className="gap-2">
            <Truck className="h-4 w-4" />
            {upsertMutation.isPending ? 'Saving...' : 'Confirm Delivery'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
