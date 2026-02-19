import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Scale, Edit, TrendingDown, TrendingUp, Minus, Plus, X, ChevronDown } from 'lucide-react';
import { useBatchWeightAnalysis, useUpsertWeightAnalysis } from '@/hooks/useBatchWeightAnalysis';

interface StyleFabricInfo {
  styleId: string;
  styleName: string;
  totalWeightKg: number;
  totalCutPieces: number;
}

interface BatchWeightAnalysisCardProps {
  batchId: string;
  styles: StyleFabricInfo[];
}

// One row in the size-weights table
interface SizeWeightEntry {
  size: string;
  weight: string; // grams
}

interface StyleForm {
  isSetItem: boolean;
  // For non-set: list of size → weight rows; we average for final value
  sizeWeights: SizeWeightEntry[];
  wastagePercent: string;
  // For set: top rows + bottom rows
  topSizeWeights: SizeWeightEntry[];
  bottomSizeWeights: SizeWeightEntry[];
  topWastagePercent: string;
  bottomWastagePercent: string;
  notes: string;
}

const newSizeRow = (): SizeWeightEntry => ({ size: '', weight: '' });

const emptyForm = (): StyleForm => ({
  isSetItem: false,
  sizeWeights: [newSizeRow()],
  wastagePercent: '',
  topSizeWeights: [newSizeRow()],
  bottomSizeWeights: [newSizeRow()],
  topWastagePercent: '',
  bottomWastagePercent: '',
  notes: '',
});

// Average of non-empty, valid weight rows
const avgOf = (rows: SizeWeightEntry[]): number | null => {
  const vals = rows.map(r => parseFloat(r.weight)).filter(v => !isNaN(v) && v > 0);
  if (vals.length === 0) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
};

// SizeWeightsTable sub-component
const SizeWeightsTable = ({
  rows,
  onChange,
  label,
}: {
  rows: SizeWeightEntry[];
  onChange: (rows: SizeWeightEntry[]) => void;
  label: string;
}) => {
  const avg = avgOf(rows);

  const update = (idx: number, field: keyof SizeWeightEntry, val: string) => {
    const next = rows.map((r, i) => (i === idx ? { ...r, [field]: val } : r));
    onChange(next);
  };

  const addRow = () => onChange([...rows, newSizeRow()]);

  const removeRow = (idx: number) => {
    if (rows.length === 1) return;
    onChange(rows.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
        {avg !== null && (
          <span className="text-xs font-medium text-primary">Avg: {avg.toFixed(1)} g</span>
        )}
      </div>
      <div className="space-y-1.5">
        <div className="grid grid-cols-[1fr_1fr_auto] gap-1.5 text-xs text-muted-foreground px-0.5 mb-0.5">
          <span>Size / Label</span>
          <span>Weight (g)</span>
          <span />
        </div>
        {rows.map((row, idx) => (
          <div key={idx} className="grid grid-cols-[1fr_1fr_auto] gap-1.5 items-center">
            <Input
              className="h-8 text-sm"
              placeholder="e.g. L"
              value={row.size}
              onChange={e => update(idx, 'size', e.target.value)}
            />
            <Input
              className="h-8 text-sm"
              type="number"
              placeholder="e.g. 450"
              value={row.weight}
              onChange={e => update(idx, 'weight', e.target.value)}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
              onClick={() => removeRow(idx)}
              disabled={rows.length === 1}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
      </div>
      <Button type="button" variant="outline" size="sm" className="h-7 text-xs w-full" onClick={addRow}>
        <Plus className="h-3 w-3 mr-1" />
        Add Size
      </Button>
      {avg !== null && (
        <div className="text-xs p-2 bg-muted/50 rounded flex justify-between">
          <span className="text-muted-foreground">Average across {rows.filter(r => parseFloat(r.weight) > 0).length} size(s)</span>
          <span className="font-semibold">{avg.toFixed(2)} g</span>
        </div>
      )}
    </div>
  );
};

export const BatchWeightAnalysisCard = ({ batchId, styles }: BatchWeightAnalysisCardProps) => {
  const { data: analyses = [] } = useBatchWeightAnalysis(batchId);
  const upsert = useUpsertWeightAnalysis();
  const [openStyleId, setOpenStyleId] = useState<string | null>(null);
  const [form, setForm] = useState<StyleForm>(emptyForm());

  const getAnalysis = (styleId: string) => analyses.find(a => a.style_id === styleId);

  const openDialog = (style: StyleFabricInfo) => {
    const existing = getAnalysis(style.styleId);
    if (existing) {
      // Restore saved size-weight rows from notes JSON if present, else reconstruct from avg
      let sizeWeights: SizeWeightEntry[] = [newSizeRow()];
      let topSizeWeights: SizeWeightEntry[] = [newSizeRow()];
      let bottomSizeWeights: SizeWeightEntry[] = [newSizeRow()];

      try {
        const parsed = existing.notes ? JSON.parse(existing.notes) : null;
        if (parsed?._sizeWeights) sizeWeights = parsed._sizeWeights;
        if (parsed?._topSizeWeights) topSizeWeights = parsed._topSizeWeights;
        if (parsed?._bottomSizeWeights) bottomSizeWeights = parsed._bottomSizeWeights;
      } catch {
        // Fall back: show a single row with the saved average
        if (existing.actual_weight_grams) sizeWeights = [{ size: '', weight: existing.actual_weight_grams.toString() }];
        if (existing.top_weight_grams) topSizeWeights = [{ size: '', weight: existing.top_weight_grams.toString() }];
        if (existing.bottom_weight_grams) bottomSizeWeights = [{ size: '', weight: existing.bottom_weight_grams.toString() }];
      }

      setForm({
        isSetItem: existing.is_set_item,
        sizeWeights,
        wastagePercent: existing.wastage_percent?.toString() || '',
        topSizeWeights,
        bottomSizeWeights,
        topWastagePercent: existing.top_wastage_percent?.toString() || '',
        bottomWastagePercent: existing.bottom_wastage_percent?.toString() || '',
        notes: '',
      });
    } else {
      setForm(emptyForm());
    }
    setOpenStyleId(style.styleId);
  };

  const handleSave = async () => {
    if (!openStyleId) return;

    const avgWeight = avgOf(form.sizeWeights);
    const avgTop = avgOf(form.topSizeWeights);
    const avgBottom = avgOf(form.bottomSizeWeights);

    // Store size rows inside notes as JSON for restoring later
    const notesPayload = JSON.stringify({
      _sizeWeights: form.sizeWeights,
      _topSizeWeights: form.topSizeWeights,
      _bottomSizeWeights: form.bottomSizeWeights,
    });

    await upsert.mutateAsync({
      batch_id: batchId,
      style_id: openStyleId,
      is_set_item: form.isSetItem,
      actual_weight_grams: avgWeight,
      wastage_percent: form.wastagePercent ? parseFloat(form.wastagePercent) : null,
      top_weight_grams: avgTop,
      bottom_weight_grams: avgBottom,
      top_wastage_percent: form.topWastagePercent ? parseFloat(form.topWastagePercent) : null,
      bottom_wastage_percent: form.bottomWastagePercent ? parseFloat(form.bottomWastagePercent) : null,
      notes: notesPayload,
    });
    setOpenStyleId(null);
  };

  // --- Prediction logic ---
  const calcPrediction = (style: StyleFabricInfo) => {
    const a = getAnalysis(style.styleId);
    if (!a) return null;
    const totalGrams = style.totalWeightKg * 1000;

    if (a.is_set_item) {
      const tw = a.top_weight_grams;
      const bw = a.bottom_weight_grams;
      const twp = a.top_wastage_percent ?? 0;
      const bwp = a.bottom_wastage_percent ?? 0;
      if (!tw || !bw) return null;
      const effectivePerSet = tw * (1 + twp / 100) + bw * (1 + bwp / 100);
      const predictedSets = effectivePerSet > 0 ? Math.floor(totalGrams / effectivePerSet) : 0;
      const actualCut = style.totalCutPieces;
      const diff = actualCut - predictedSets;
      const fabricConsumedByActual = actualCut * (tw + bw);
      const actualWastageGrams = totalGrams - fabricConsumedByActual;
      const actualWastagePct = totalGrams > 0 ? (actualWastageGrams / totalGrams) * 100 : 0;
      return { predictedSets, actualCut, diff, actualWastagePct, isSet: true, effectivePerSet };
    } else {
      const aw = a.actual_weight_grams;
      const wp = a.wastage_percent ?? 0;
      if (!aw) return null;
      const effectivePerPiece = aw * (1 + wp / 100);
      const predictedPieces = effectivePerPiece > 0 ? Math.floor(totalGrams / effectivePerPiece) : 0;
      const actualCut = style.totalCutPieces;
      const diff = actualCut - predictedPieces;
      const fabricConsumedByActual = actualCut * aw;
      const actualWastageGrams = totalGrams - fabricConsumedByActual;
      const actualWastagePct = totalGrams > 0 ? (actualWastageGrams / totalGrams) * 100 : 0;
      return { predictedPieces, actualCut, diff, actualWastagePct, isSet: false, effectivePerPiece };
    }
  };

  if (styles.length === 0) return null;

  const currentStyle = styles.find(s => s.styleId === openStyleId);

  // Live preview values inside dialog
  const liveAvgWeight = avgOf(form.sizeWeights);
  const liveAvgTop = avgOf(form.topSizeWeights);
  const liveAvgBottom = avgOf(form.bottomSizeWeights);

  const livePreviewPieces = (() => {
    if (!currentStyle) return null;
    const totalG = currentStyle.totalWeightKg * 1000;
    if (form.isSetItem) {
      if (!liveAvgTop || !liveAvgBottom) return null;
      const eff = liveAvgTop * (1 + parseFloat(form.topWastagePercent || '0') / 100) +
                  liveAvgBottom * (1 + parseFloat(form.bottomWastagePercent || '0') / 100);
      return { pieces: Math.floor(totalG / eff), effPer: eff, unit: 'set' };
    } else {
      if (!liveAvgWeight) return null;
      const eff = liveAvgWeight * (1 + parseFloat(form.wastagePercent || '0') / 100);
      return { pieces: Math.floor(totalG / eff), effPer: eff, unit: 'pc' };
    }
  })();

  return (
    <>
      <Collapsible defaultOpen={false}>
        <Card>
          <CardHeader className="pb-3">
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Scale className="h-4 w-4 text-primary" />
                  Weight Analysis & Piece Prediction
                </CardTitle>
                <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 [[data-state=open]_&]:rotate-180" />
              </div>
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="space-y-4 pt-0">
              {styles.map(style => {
                const pred = calcPrediction(style);
                const analysis = getAnalysis(style.styleId);
                return (
                  <div key={style.styleId} className="border rounded-lg p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{style.styleName}</span>
                    {analysis?.is_set_item && (
                      <Badge variant="secondary" className="text-xs">Set Item</Badge>
                    )}
                    {analysis && (
                      <Badge variant="outline" className="text-xs">
                        Avg: {analysis.is_set_item
                          ? `${analysis.top_weight_grams?.toFixed(1)}g + ${analysis.bottom_weight_grams?.toFixed(1)}g`
                          : `${analysis.actual_weight_grams?.toFixed(1)}g`}
                      </Badge>
                    )}
                  </div>
                  <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => openDialog(style)}>
                    <Edit className="h-3 w-3 mr-1" />
                    {analysis ? 'Edit' : 'Enter Weight'}
                  </Button>
                </div>

                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span>Total Fabric: <span className="font-medium text-foreground">{style.totalWeightKg.toFixed(2)} kg ({(style.totalWeightKg * 1000).toFixed(0)} g)</span></span>
                  <span>Cut Pieces: <span className="font-medium text-foreground">{style.totalCutPieces}</span></span>
                </div>

                {pred && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <div className="bg-muted/40 rounded p-2 text-xs">
                      <div className="text-muted-foreground mb-0.5">{pred.isSet ? 'Avg Top + Bottom' : 'Avg Weight'}</div>
                      {pred.isSet ? (
                        <div className="font-semibold">{analysis!.top_weight_grams?.toFixed(1)}g + {analysis!.bottom_weight_grams?.toFixed(1)}g</div>
                      ) : (
                        <div className="font-semibold">{analysis!.actual_weight_grams?.toFixed(1)}g</div>
                      )}
                      <div className="text-muted-foreground mt-0.5">
                        {pred.isSet
                          ? `+${analysis!.top_wastage_percent ?? 0}% / +${analysis!.bottom_wastage_percent ?? 0}%`
                          : `+${analysis!.wastage_percent ?? 0}% wastage`}
                      </div>
                    </div>

                    <div className="bg-primary/10 rounded p-2 text-xs">
                      <div className="text-muted-foreground mb-0.5">Predicted Pieces</div>
                      <div className="font-bold text-primary text-base">
                        {pred.isSet ? pred.predictedSets : pred.predictedPieces}
                      </div>
                      <div className="text-muted-foreground mt-0.5">
                        ~{pred.isSet ? pred.effectivePerSet.toFixed(1) : pred.effectivePerPiece.toFixed(1)}g / {pred.isSet ? 'set' : 'pc'}
                      </div>
                    </div>

                    <div className={`rounded p-2 text-xs ${pred.diff > 0 ? 'bg-green-500/10' : pred.diff < 0 ? 'bg-destructive/10' : 'bg-muted/40'}`}>
                      <div className="text-muted-foreground mb-0.5">Actual vs Predicted</div>
                      <div className={`font-bold text-base flex items-center gap-1 ${
                        pred.diff > 0 ? 'text-green-600 dark:text-green-400' :
                        pred.diff < 0 ? 'text-destructive' : 'text-foreground'
                      }`}>
                        {pred.diff > 0 ? <TrendingUp className="h-3 w-3" /> :
                         pred.diff < 0 ? <TrendingDown className="h-3 w-3" /> :
                         <Minus className="h-3 w-3" />}
                        {pred.diff > 0 ? '+' : ''}{pred.diff}
                      </div>
                      <div className="text-muted-foreground mt-0.5">
                        {pred.diff > 0 ? 'Extra cut' : pred.diff < 0 ? 'Short cut' : 'Exact match'}
                      </div>
                    </div>

                    <div className="bg-amber-500/10 rounded p-2 text-xs">
                      <div className="text-muted-foreground mb-0.5">Actual Wastage</div>
                      <div className="font-bold text-amber-600 dark:text-amber-400 text-base">
                        {pred.actualWastagePct.toFixed(1)}%
                      </div>
                      <div className="text-muted-foreground mt-0.5">
                        {((style.totalWeightKg * 1000) - (pred.actualCut * (pred.isSet
                          ? (analysis!.top_weight_grams! + analysis!.bottom_weight_grams!)
                          : analysis!.actual_weight_grams!))).toFixed(0)}g waste
                      </div>
                    </div>
                  </div>
                )}

                {!analysis && (
                  <p className="text-xs text-muted-foreground italic">
                    No weight data yet. Click "Enter Weight" to begin analysis.
                  </p>
                )}

                {analysis && !pred && (
                  <p className="text-xs text-muted-foreground italic">Complete weight entry to see predictions.</p>
                )}
              </div>
            );
          })}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Dialog */}
      <Dialog open={!!openStyleId} onOpenChange={open => !open && setOpenStyleId(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Scale className="h-4 w-4" />
              Weight Analysis — {currentStyle?.styleName}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-1">
            {/* Fabric summary */}
            {currentStyle && (
              <div className="p-3 bg-muted/40 rounded text-sm flex justify-between">
                <span className="text-muted-foreground">Total Fabric</span>
                <span className="font-medium">
                  {currentStyle.totalWeightKg.toFixed(2)} kg = {(currentStyle.totalWeightKg * 1000).toFixed(0)} g
                </span>
              </div>
            )}

            {/* Set item toggle */}
            <div className="flex items-center justify-between border rounded-lg p-3">
              <div>
                <p className="font-medium text-sm">Set Item</p>
                <p className="text-xs text-muted-foreground">Enter top & bottom weights separately</p>
              </div>
              <Switch
                checked={form.isSetItem}
                onCheckedChange={val => setForm(f => ({ ...f, isSetItem: val }))}
              />
            </div>

            {!form.isSetItem ? (
              <>
                <SizeWeightsTable
                  label="Product Weights by Size"
                  rows={form.sizeWeights}
                  onChange={rows => setForm(f => ({ ...f, sizeWeights: rows }))}
                />
                <div className="space-y-1.5">
                  <Label className="text-xs">Wastage % (cutting loss)</Label>
                  <Input
                    type="number"
                    placeholder="e.g. 20"
                    value={form.wastagePercent}
                    onChange={e => setForm(f => ({ ...f, wastagePercent: e.target.value }))}
                  />
                </div>
              </>
            ) : (
              <>
                <SizeWeightsTable
                  label="Top Weights by Size"
                  rows={form.topSizeWeights}
                  onChange={rows => setForm(f => ({ ...f, topSizeWeights: rows }))}
                />
                <div className="space-y-1.5">
                  <Label className="text-xs">Top Wastage %</Label>
                  <Input
                    type="number"
                    placeholder="e.g. 15"
                    value={form.topWastagePercent}
                    onChange={e => setForm(f => ({ ...f, topWastagePercent: e.target.value }))}
                  />
                </div>
                <div className="border-t pt-4">
                  <SizeWeightsTable
                    label="Bottom Weights by Size"
                    rows={form.bottomSizeWeights}
                    onChange={rows => setForm(f => ({ ...f, bottomSizeWeights: rows }))}
                  />
                  <div className="space-y-1.5 mt-3">
                    <Label className="text-xs">Bottom Wastage %</Label>
                    <Input
                      type="number"
                      placeholder="e.g. 10"
                      value={form.bottomWastagePercent}
                      onChange={e => setForm(f => ({ ...f, bottomWastagePercent: e.target.value }))}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Live preview */}
            {livePreviewPieces && (
              <div className="p-3 bg-primary/10 rounded text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Avg weight used</span>
                  <span className="font-medium">
                    {form.isSetItem
                      ? `${liveAvgTop?.toFixed(1)}g + ${liveAvgBottom?.toFixed(1)}g`
                      : `${liveAvgWeight?.toFixed(1)}g`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Effective per {livePreviewPieces.unit}</span>
                  <span className="font-medium">{livePreviewPieces.effPer.toFixed(1)}g</span>
                </div>
                <div className="flex justify-between font-semibold text-primary">
                  <span>Predicted {livePreviewPieces.unit === 'set' ? 'sets' : 'pieces'}</span>
                  <span>~{livePreviewPieces.pieces}</span>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" onClick={() => setOpenStyleId(null)}>Cancel</Button>
              <Button onClick={handleSave} disabled={upsert.isPending}>
                {upsert.isPending ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
