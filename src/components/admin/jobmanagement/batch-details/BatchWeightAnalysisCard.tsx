import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Scale, Edit, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { useBatchWeightAnalysis, useUpsertWeightAnalysis } from '@/hooks/useBatchWeightAnalysis';

interface StyleFabricInfo {
  styleId: string;
  styleName: string;
  totalWeightKg: number;   // total fabric weight for this style
  totalCutPieces: number;  // total cut pieces for this style
}

interface BatchWeightAnalysisCardProps {
  batchId: string;
  styles: StyleFabricInfo[];
}

interface StyleForm {
  isSetItem: boolean;
  actualWeightGrams: string;
  wastagePercent: string;
  topWeightGrams: string;
  bottomWeightGrams: string;
  topWastagePercent: string;
  bottomWastagePercent: string;
  notes: string;
}

const emptyForm = (): StyleForm => ({
  isSetItem: false,
  actualWeightGrams: '',
  wastagePercent: '',
  topWeightGrams: '',
  bottomWeightGrams: '',
  topWastagePercent: '',
  bottomWastagePercent: '',
  notes: '',
});

export const BatchWeightAnalysisCard = ({ batchId, styles }: BatchWeightAnalysisCardProps) => {
  const { data: analyses = [] } = useBatchWeightAnalysis(batchId);
  const upsert = useUpsertWeightAnalysis();
  const [openStyleId, setOpenStyleId] = useState<string | null>(null);
  const [form, setForm] = useState<StyleForm>(emptyForm());

  const getAnalysis = (styleId: string) => analyses.find(a => a.style_id === styleId);

  const openDialog = (style: StyleFabricInfo) => {
    const existing = getAnalysis(style.styleId);
    if (existing) {
      setForm({
        isSetItem: existing.is_set_item,
        actualWeightGrams: existing.actual_weight_grams?.toString() || '',
        wastagePercent: existing.wastage_percent?.toString() || '',
        topWeightGrams: existing.top_weight_grams?.toString() || '',
        bottomWeightGrams: existing.bottom_weight_grams?.toString() || '',
        topWastagePercent: existing.top_wastage_percent?.toString() || '',
        bottomWastagePercent: existing.bottom_wastage_percent?.toString() || '',
        notes: existing.notes || '',
      });
    } else {
      setForm(emptyForm());
    }
    setOpenStyleId(style.styleId);
  };

  const handleSave = async () => {
    if (!openStyleId) return;
    await upsert.mutateAsync({
      batch_id: batchId,
      style_id: openStyleId,
      is_set_item: form.isSetItem,
      actual_weight_grams: form.actualWeightGrams ? parseFloat(form.actualWeightGrams) : null,
      wastage_percent: form.wastagePercent ? parseFloat(form.wastagePercent) : null,
      top_weight_grams: form.topWeightGrams ? parseFloat(form.topWeightGrams) : null,
      bottom_weight_grams: form.bottomWeightGrams ? parseFloat(form.bottomWeightGrams) : null,
      top_wastage_percent: form.topWastagePercent ? parseFloat(form.topWastagePercent) : null,
      bottom_wastage_percent: form.bottomWastagePercent ? parseFloat(form.bottomWastagePercent) : null,
      notes: form.notes || null,
    });
    setOpenStyleId(null);
  };

  // --- Prediction logic ---
  const calcPrediction = (style: StyleFabricInfo) => {
    const a = getAnalysis(style.styleId);
    if (!a) return null;

    const totalGrams = style.totalWeightKg * 1000;

    if (a.is_set_item) {
      // Set item: top + bottom weights with their wastages
      const tw = a.top_weight_grams;
      const bw = a.bottom_weight_grams;
      const twp = a.top_wastage_percent ?? 0;
      const bwp = a.bottom_wastage_percent ?? 0;
      if (!tw || !bw) return null;

      // Effective weight per piece (top + bottom) including wastage
      const effectiveTopPerPiece = tw * (1 + twp / 100);
      const effectiveBotPerPiece = bw * (1 + bwp / 100);
      // For a set, total fabric used per set = top fabric used + bottom fabric used
      // We assume fabric is split 50/50 unless we know better — but we can't know,
      // so we compute: total weight / (effectiveTop + effectiveBot) = predicted sets
      const effectivePerSet = effectiveTopPerPiece + effectiveBotPerPiece;
      const predictedSets = effectivePerSet > 0 ? Math.floor(totalGrams / effectivePerSet) : 0;

      // Actual cut sets = style.totalCutPieces (each set counts as 1)
      const actualCut = style.totalCutPieces;
      const diff = actualCut - predictedSets;

      // Actual wastage: fabric consumed by cut pieces / total fabric
      const fabricConsumedByActual = actualCut * (tw + bw); // ideal usage without wastage
      const actualWastageGrams = totalGrams - fabricConsumedByActual;
      const actualWastagePct = totalGrams > 0 ? (actualWastageGrams / totalGrams) * 100 : 0;

      return { predictedSets, actualCut, diff, actualWastagePct, isSet: true, effectivePerSet };
    } else {
      const aw = a.actual_weight_grams;
      const wp = a.wastage_percent ?? 0;
      if (!aw) return null;

      // Effective weight per piece including wastage
      const effectivePerPiece = aw * (1 + wp / 100);
      const predictedPieces = effectivePerPiece > 0 ? Math.floor(totalGrams / effectivePerPiece) : 0;

      const actualCut = style.totalCutPieces;
      const diff = actualCut - predictedPieces;

      // Actual wastage from cut data
      const fabricConsumedByActual = actualCut * aw;
      const actualWastageGrams = totalGrams - fabricConsumedByActual;
      const actualWastagePct = totalGrams > 0 ? (actualWastageGrams / totalGrams) * 100 : 0;

      return { predictedPieces, actualCut, diff, actualWastagePct, isSet: false, effectivePerPiece };
    }
  };

  if (styles.length === 0) return null;

  const currentStyle = styles.find(s => s.styleId === openStyleId);

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Scale className="h-4 w-4 text-primary" />
            Weight Analysis & Piece Prediction
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {styles.map(style => {
            const pred = calcPrediction(style);
            const analysis = getAnalysis(style.styleId);
            return (
              <div key={style.styleId} className="border rounded-lg p-3 space-y-3">
                {/* Style header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{style.styleName}</span>
                    {analysis?.is_set_item && (
                      <Badge variant="secondary" className="text-xs">Set Item</Badge>
                    )}
                  </div>
                  <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => openDialog(style)}>
                    <Edit className="h-3 w-3 mr-1" />
                    {analysis ? 'Edit' : 'Enter Weight'}
                  </Button>
                </div>

                {/* Fabric info */}
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span>Total Fabric: <span className="font-medium text-foreground">{style.totalWeightKg.toFixed(2)} kg ({(style.totalWeightKg * 1000).toFixed(0)} g)</span></span>
                  <span>Cut Pieces: <span className="font-medium text-foreground">{style.totalCutPieces}</span></span>
                </div>

                {/* Analysis results */}
                {analysis && !pred && (
                  <p className="text-xs text-muted-foreground italic">Enter weight to see predictions</p>
                )}

                {pred && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {/* Weight entered */}
                    <div className="bg-muted/40 rounded p-2 text-xs">
                      <div className="text-muted-foreground mb-0.5">
                        {pred.isSet ? 'Top + Bottom' : 'Product Weight'}
                      </div>
                      {pred.isSet ? (
                        <div className="font-semibold">
                          {analysis!.top_weight_grams}g + {analysis!.bottom_weight_grams}g
                        </div>
                      ) : (
                        <div className="font-semibold">{analysis!.actual_weight_grams}g</div>
                      )}
                      <div className="text-muted-foreground mt-0.5">
                        {pred.isSet
                          ? `+${analysis!.top_wastage_percent ?? 0}% / +${analysis!.bottom_wastage_percent ?? 0}% wastage`
                          : `+${analysis!.wastage_percent ?? 0}% wastage`}
                      </div>
                    </div>

                    {/* Predicted pieces */}
                    <div className="bg-blue-500/10 rounded p-2 text-xs">
                      <div className="text-muted-foreground mb-0.5">Predicted Pieces</div>
                      <div className="font-bold text-blue-600 dark:text-blue-400 text-base">
                        {pred.isSet ? pred.predictedSets : pred.predictedPieces}
                      </div>
                      <div className="text-muted-foreground mt-0.5">
                        ~{pred.isSet
                          ? pred.effectivePerSet.toFixed(1)
                          : pred.effectivePerPiece.toFixed(1)}g / {pred.isSet ? 'set' : 'pc'}
                      </div>
                    </div>

                    {/* Actual vs prediction diff */}
                    <div className={`rounded p-2 text-xs ${
                      pred.diff > 0 ? 'bg-green-500/10' : pred.diff < 0 ? 'bg-red-500/10' : 'bg-muted/40'
                    }`}>
                      <div className="text-muted-foreground mb-0.5">Actual vs Predicted</div>
                      <div className={`font-bold text-base flex items-center gap-1 ${
                        pred.diff > 0 ? 'text-green-600 dark:text-green-400' :
                        pred.diff < 0 ? 'text-red-600 dark:text-red-400' : 'text-foreground'
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

                    {/* Actual wastage */}
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
                    No weight data entered yet. Click "Enter Weight" to add analysis.
                  </p>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={!!openStyleId} onOpenChange={open => !open && setOpenStyleId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Scale className="h-4 w-4" />
              Weight Analysis — {currentStyle?.styleName}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Fabric info */}
            {currentStyle && (
              <div className="p-3 bg-muted/40 rounded text-sm flex justify-between">
                <span className="text-muted-foreground">Total Fabric</span>
                <span className="font-medium">
                  {currentStyle.totalWeightKg.toFixed(2)} kg = {(currentStyle.totalWeightKg * 1000).toFixed(0)} g
                </span>
              </div>
            )}

            {/* Set item toggle */}
            <div className="flex items-center justify-between">
              <Label htmlFor="is-set" className="font-medium">Set Item (Top + Bottom)</Label>
              <Switch
                id="is-set"
                checked={form.isSetItem}
                onCheckedChange={val => setForm(f => ({ ...f, isSetItem: val }))}
              />
            </div>

            {!form.isSetItem ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Actual Product Weight (grams)</Label>
                    <Input
                      type="number"
                      placeholder="e.g. 450"
                      value={form.actualWeightGrams}
                      onChange={e => setForm(f => ({ ...f, actualWeightGrams: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Wastage % (cutting loss)</Label>
                    <Input
                      type="number"
                      placeholder="e.g. 20"
                      value={form.wastagePercent}
                      onChange={e => setForm(f => ({ ...f, wastagePercent: e.target.value }))}
                    />
                  </div>
                </div>
                {/* Preview */}
                {form.actualWeightGrams && form.wastagePercent && (
                  <div className="text-xs p-2 bg-blue-500/10 rounded text-blue-700 dark:text-blue-300">
                    Effective per piece: {(parseFloat(form.actualWeightGrams) * (1 + parseFloat(form.wastagePercent) / 100)).toFixed(1)}g
                    {currentStyle && ` → ~${Math.floor((currentStyle.totalWeightKg * 1000) / (parseFloat(form.actualWeightGrams) * (1 + parseFloat(form.wastagePercent) / 100)))} predicted pieces`}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-xs text-muted-foreground">
                  For set items, enter the weight for the top garment and bottom garment separately. 
                  Each set counts as 1 unit.
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Top</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Top Weight (grams)</Label>
                      <Input
                        type="number"
                        placeholder="e.g. 250"
                        value={form.topWeightGrams}
                        onChange={e => setForm(f => ({ ...f, topWeightGrams: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Top Wastage %</Label>
                      <Input
                        type="number"
                        placeholder="e.g. 15"
                        value={form.topWastagePercent}
                        onChange={e => setForm(f => ({ ...f, topWastagePercent: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Bottom</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Bottom Weight (grams)</Label>
                      <Input
                        type="number"
                        placeholder="e.g. 200"
                        value={form.bottomWeightGrams}
                        onChange={e => setForm(f => ({ ...f, bottomWeightGrams: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Bottom Wastage %</Label>
                      <Input
                        type="number"
                        placeholder="e.g. 10"
                        value={form.bottomWastagePercent}
                        onChange={e => setForm(f => ({ ...f, bottomWastagePercent: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
                {/* Set preview */}
                {form.topWeightGrams && form.bottomWeightGrams && (
                  <div className="text-xs p-2 bg-blue-500/10 rounded text-blue-700 dark:text-blue-300">
                    {(() => {
                      const tw = parseFloat(form.topWeightGrams);
                      const bw = parseFloat(form.bottomWeightGrams);
                      const twp = parseFloat(form.topWastagePercent || '0');
                      const bwp = parseFloat(form.bottomWastagePercent || '0');
                      const effPerSet = tw * (1 + twp / 100) + bw * (1 + bwp / 100);
                      const totalG = (currentStyle?.totalWeightKg || 0) * 1000;
                      const predicted = Math.floor(totalG / effPerSet);
                      return `Effective per set: ${effPerSet.toFixed(1)}g → ~${predicted} predicted sets`;
                    })()}
                  </div>
                )}
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs">Notes (optional)</Label>
              <Input
                placeholder="Any remarks..."
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
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
