import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { Calculator, Scale, ArrowRightLeft, Percent } from 'lucide-react';

// ─── Wastage Checker ───
const WastageChecker = () => {
  const [selectedStyle, setSelectedStyle] = useState<string>('');
  const [customWeightKg, setCustomWeightKg] = useState('');
  const [piecesProduced, setPiecesProduced] = useState('');
  const [avgWeightPerPiece, setAvgWeightPerPiece] = useState('');

  // Fetch all styles from all batches
  const { data: batchStyles } = useQuery({
    queryKey: ['calculator-batch-styles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_batches')
        .select('id, batch_number, style_id, total_fabric_received_kg, job_styles(id, style_name, style_code)')
        .order('date_created', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  // Build dropdown options: group by style, sum fabric across batches
  const styleOptions = useMemo(() => {
    if (!batchStyles) return [];
    const map = new Map<string, { styleId: string; label: string; totalFabricKg: number }>();
    for (const b of batchStyles) {
      const s = b.job_styles as any;
      if (!s) continue;
      const key = s.id;
      const existing = map.get(key);
      const fabric = b.total_fabric_received_kg || 0;
      if (existing) {
        existing.totalFabricKg += fabric;
      } else {
        map.set(key, {
          styleId: s.id,
          label: `${s.style_name} (${s.style_code})`,
          totalFabricKg: fabric,
        });
      }
    }
    return Array.from(map.values());
  }, [batchStyles]);

  const isCustom = selectedStyle === 'custom';
  const totalFabricKg = isCustom
    ? parseFloat(customWeightKg) || 0
    : styleOptions.find(s => s.styleId === selectedStyle)?.totalFabricKg || 0;
  const totalFabricGrams = totalFabricKg * 1000;
  const pieces = parseFloat(piecesProduced) || 0;
  const rawWeight = parseFloat(avgWeightPerPiece) || 0;

  const actualPerPiece = pieces > 0 ? totalFabricGrams / pieces : 0;
  const wastagePercent = rawWeight > 0 && pieces > 0
    ? ((actualPerPiece - rawWeight) / rawWeight) * 100
    : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Select Style</Label>
          <Select value={selectedStyle} onValueChange={(v) => { setSelectedStyle(v); setCustomWeightKg(''); }}>
            <SelectTrigger><SelectValue placeholder="Choose a style..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="custom">Custom (Manual Entry)</SelectItem>
              {styleOptions.map(s => (
                <SelectItem key={s.styleId} value={s.styleId}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Total Fabric Weight (kg)</Label>
          {isCustom ? (
            <Input
              type="number"
              placeholder="Enter weight in kg"
              value={customWeightKg}
              onChange={e => setCustomWeightKg(e.target.value)}
            />
          ) : (
            <Input value={totalFabricKg ? `${totalFabricKg} kg` : '—'} disabled />
          )}
        </div>

        <div className="space-y-2">
          <Label>Number of Pieces Produced</Label>
          <Input
            type="number"
            placeholder="Enter pieces"
            value={piecesProduced}
            onChange={e => setPiecesProduced(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Average Weight per Piece (grams)</Label>
          <Input
            type="number"
            placeholder="Enter avg weight in grams"
            value={avgWeightPerPiece}
            onChange={e => setAvgWeightPerPiece(e.target.value)}
          />
        </div>
      </div>

      {pieces > 0 && rawWeight > 0 && totalFabricKg > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
            <p className="text-xs text-muted-foreground">Actual Fabric / Piece</p>
            <p className="text-2xl font-bold text-blue-600">{actualPerPiece.toFixed(2)} g</p>
          </Card>
          <Card className={`p-4 bg-gradient-to-br ${wastagePercent > 10 ? 'from-red-500/10 to-red-500/5 border-red-500/20' : 'from-green-500/10 to-green-500/5 border-green-500/20'}`}>
            <p className="text-xs text-muted-foreground">Wastage %</p>
            <p className={`text-2xl font-bold ${wastagePercent > 10 ? 'text-red-600' : 'text-green-600'}`}>
              {wastagePercent.toFixed(2)}%
            </p>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
            <p className="text-xs text-muted-foreground">Wastage / Piece</p>
            <p className="text-2xl font-bold text-purple-600">{(actualPerPiece - rawWeight).toFixed(2)} g</p>
          </Card>
        </div>
      )}
    </div>
  );
};

// ─── Unit Converter ───
type UnitCategory = 'weight' | 'length';
const units: Record<UnitCategory, { label: string; value: string; toBase: number }[]> = {
  weight: [
    { label: 'Grams (g)', value: 'g', toBase: 1 },
    { label: 'Kilograms (kg)', value: 'kg', toBase: 1000 },
    { label: 'Pounds (lb)', value: 'lb', toBase: 453.592 },
    { label: 'Ounces (oz)', value: 'oz', toBase: 28.3495 },
    { label: 'Milligrams (mg)', value: 'mg', toBase: 0.001 },
  ],
  length: [
    { label: 'Meters (m)', value: 'm', toBase: 1 },
    { label: 'Centimeters (cm)', value: 'cm', toBase: 0.01 },
    { label: 'Inches (in)', value: 'in', toBase: 0.0254 },
    { label: 'Feet (ft)', value: 'ft', toBase: 0.3048 },
    { label: 'Yards (yd)', value: 'yd', toBase: 0.9144 },
    { label: 'Millimeters (mm)', value: 'mm', toBase: 0.001 },
  ],
};

const UnitConverter = () => {
  const [category, setCategory] = useState<UnitCategory>('weight');
  const [fromUnit, setFromUnit] = useState('kg');
  const [toUnit, setToUnit] = useState('g');
  const [inputVal, setInputVal] = useState('');

  const fromDef = units[category].find(u => u.value === fromUnit);
  const toDef = units[category].find(u => u.value === toUnit);
  const numVal = parseFloat(inputVal) || 0;
  const result = fromDef && toDef ? (numVal * fromDef.toBase) / toDef.toBase : 0;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          onClick={() => { setCategory('weight'); setFromUnit('kg'); setToUnit('g'); }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${category === 'weight' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
        >
          Weight
        </button>
        <button
          onClick={() => { setCategory('length'); setFromUnit('m'); setToUnit('cm'); }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${category === 'length' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
        >
          Length
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div className="space-y-2">
          <Label>From</Label>
          <Select value={fromUnit} onValueChange={setFromUnit}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {units[category].map(u => (
                <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="number"
            placeholder="Enter value"
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
          />
        </div>

        <div className="flex justify-center">
          <ArrowRightLeft className="h-6 w-6 text-muted-foreground" />
        </div>

        <div className="space-y-2">
          <Label>To</Label>
          <Select value={toUnit} onValueChange={setToUnit}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {units[category].map(u => (
                <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input value={numVal ? result.toLocaleString(undefined, { maximumFractionDigits: 6 }) : '—'} disabled />
        </div>
      </div>
    </div>
  );
};

// ─── Wastage by Fabric Weight ───
const WastageByWeight = () => {
  const [totalInputWeight, setTotalInputWeight] = useState('');
  const [totalPieces, setTotalPieces] = useState('');
  const [avgWeightPerPiece, setAvgWeightPerPiece] = useState('');

  const inputGrams = parseFloat(totalInputWeight) || 0;
  const pieces = parseFloat(totalPieces) || 0;
  const avgWeight = parseFloat(avgWeightPerPiece) || 0;

  const totalGarmentWeight = avgWeight * pieces;
  const wastageGrams = inputGrams - totalGarmentWeight;
  const wastagePercent = inputGrams > 0 ? (wastageGrams / inputGrams) * 100 : 0;
  const hasResult = inputGrams > 0 && pieces > 0 && avgWeight > 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Total Input Fabric Weight (grams)</Label>
          <Input
            type="number"
            placeholder="e.g. 10000"
            value={totalInputWeight}
            onChange={e => setTotalInputWeight(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Total Pieces Marked / Produced</Label>
          <Input
            type="number"
            placeholder="e.g. 60"
            value={totalPieces}
            onChange={e => setTotalPieces(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Average Weight per Piece (grams)</Label>
          <Input
            type="number"
            placeholder="e.g. 140"
            value={avgWeightPerPiece}
            onChange={e => setAvgWeightPerPiece(e.target.value)}
          />
        </div>
      </div>

      {hasResult && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-4">
          <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
            <p className="text-xs text-muted-foreground">Total Garment Weight</p>
            <p className="text-2xl font-bold text-blue-600">{totalGarmentWeight.toLocaleString()} g</p>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20">
            <p className="text-xs text-muted-foreground">Wastage</p>
            <p className="text-2xl font-bold text-orange-600">{wastageGrams.toLocaleString()} g</p>
          </Card>
          <Card className={`p-4 bg-gradient-to-br ${wastagePercent > 10 ? 'from-red-500/10 to-red-500/5 border-red-500/20' : 'from-green-500/10 to-green-500/5 border-green-500/20'}`}>
            <p className="text-xs text-muted-foreground">Wastage %</p>
            <p className={`text-2xl font-bold ${wastagePercent > 10 ? 'text-red-600' : 'text-green-600'}`}>
              {wastagePercent.toFixed(2)}%
            </p>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
            <p className="text-xs text-muted-foreground">Wastage per Piece</p>
            <p className="text-2xl font-bold text-purple-600">{pieces > 0 ? (wastageGrams / pieces).toFixed(2) : '0'} g</p>
          </Card>
        </div>
      )}
    </div>
  );
};

// ─── Main ───
const calculators = [
  { id: 'wastage', title: 'Wastage Checker (by Pieces)', description: 'Calculate fabric wastage per piece across styles', icon: Percent, component: WastageChecker },
  { id: 'wastage-weight', title: 'Wastage Checker (by Fabric Weight)', description: 'Calculate wastage from total fabric input vs garment output', icon: Scale, component: WastageByWeight },
  { id: 'converter', title: 'Unit Converter', description: 'Convert between weight and length units', icon: ArrowRightLeft, component: UnitConverter },
];

const CalculatorsManager = () => {
  const [activeCalc, setActiveCalc] = useState<string | null>(null);

  if (activeCalc) {
    const calc = calculators.find(c => c.id === activeCalc)!;
    const Comp = calc.component;
    return (
      <div className="space-y-4">
        <button onClick={() => setActiveCalc(null)} className="text-sm text-primary hover:underline">← Back to Calculators</button>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <calc.icon className="h-5 w-5" />
              {calc.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Comp />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Calculator className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Production Calculators</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {calculators.map(calc => (
          <Card
            key={calc.id}
            className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary/30"
            onClick={() => setActiveCalc(calc.id)}
          >
            <CardHeader className="pb-2">
              <div className="p-3 rounded-lg bg-primary/10 w-fit">
                <calc.icon className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-base mt-3">{calc.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{calc.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CalculatorsManager;
