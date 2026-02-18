import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Save, Ruler, Download, AlertCircle } from 'lucide-react';

interface MeasurementRow {
  id: string;
  pom: string;
  xs: string; s: string; m: string; l: string; xl: string; xxl: string;
  tolerance: string;
  remarks: string;
}

const DEFAULT_ROWS: MeasurementRow[] = [
  { id: '1', pom: 'Chest Width (at 1" below armhole)', xs: '40', s: '42', m: '44', l: '46', xl: '48', xxl: '50', tolerance: '±0.5', remarks: 'Half measure' },
  { id: '2', pom: 'Body Length (front)', xs: '24', s: '25', m: '26', l: '27', xl: '28', xxl: '29', tolerance: '±0.5', remarks: '' },
  { id: '3', pom: 'Shoulder Width', xs: '13', s: '14', m: '15', l: '16', xl: '17', xxl: '18', tolerance: '±0.3', remarks: 'Seam to seam' },
  { id: '4', pom: 'Sleeve Length', xs: '6', s: '6.5', m: '7', l: '7.5', xl: '8', xxl: '8.5', tolerance: '±0.3', remarks: '' },
  { id: '5', pom: 'Armhole Circumference', xs: '14', s: '15', m: '16', l: '17', xl: '18', xxl: '19', tolerance: '±0.5', remarks: 'Full measure' },
  { id: '6', pom: 'Neck Opening Width', xs: '6.5', s: '7', m: '7.5', l: '8', xl: '8.5', xxl: '9', tolerance: '±0.3', remarks: '' },
  { id: '7', pom: 'Neck Depth (front)', xs: '2', s: '2.2', m: '2.4', l: '2.5', xl: '2.5', xxl: '2.5', tolerance: '±0.2', remarks: '' },
  { id: '8', pom: 'Hem Width', xs: '40', s: '42', m: '44', l: '46', xl: '48', xxl: '50', tolerance: '±0.5', remarks: 'Half measure' },
];

interface Props { selectedStyleId: string | null; }

export default function MeasurementBuilderTab({ selectedStyleId }: Props) {
  const queryClient = useQueryClient();
  const [rows, setRows] = useState<MeasurementRow[]>(DEFAULT_ROWS);
  const [measurementId, setMeasurementId] = useState<string | null>(null);

  const { data: styles = [] } = useQuery({
    queryKey: ['pp-styles-list'],
    queryFn: async () => {
      const { data } = await supabase.from('pp_styles').select('id, style_code, style_name').order('created_at', { ascending: false });
      return data || [];
    },
  });

  const [activeStyleId, setActiveStyleId] = useState(selectedStyleId || '');

  useEffect(() => { if (selectedStyleId) setActiveStyleId(selectedStyleId); }, [selectedStyleId]);

  const { data: measurement, isLoading } = useQuery({
    queryKey: ['pp-measurements', activeStyleId],
    enabled: !!activeStyleId,
    queryFn: async () => {
      const { data } = await supabase.from('pp_measurements').select('*').eq('style_id', activeStyleId).single();
      return data;
    },
  });

  useEffect(() => {
    if (measurement) {
      setRows((measurement.rows as any) || DEFAULT_ROWS);
      setMeasurementId(measurement.id);
    } else {
      setRows(DEFAULT_ROWS);
      setMeasurementId(null);
    }
  }, [measurement]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!activeStyleId) throw new Error('Select a style first');
      if (measurementId) {
        const { error } = await supabase.from('pp_measurements').update({ rows: rows as any, updated_at: new Date().toISOString() }).eq('id', measurementId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('pp_measurements').insert([{ style_id: activeStyleId, rows: rows as any, template_name: 'Standard' }]).select().single();
        if (error) throw error;
        setMeasurementId(data.id);
      }
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['pp-measurements', activeStyleId] }); toast.success('Measurements saved'); },
    onError: (e: any) => toast.error(e.message),
  });

  const addRow = () => {
    setRows(r => [...r, { id: Date.now().toString(), pom: '', xs: '', s: '', m: '', l: '', xl: '', xxl: '', tolerance: '±0.5', remarks: '' }]);
  };

  const updateRow = (id: string, field: string, value: string) => {
    setRows(r => r.map(row => row.id === id ? { ...row, [field]: value } : row));
  };

  const removeRow = (id: string) => setRows(r => r.filter(row => row.id !== id));

  const selectedStyle = styles.find((s: any) => s.id === activeStyleId);

  return (
    <div className="space-y-4">
      {/* Style selector */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Ruler className="h-4 w-4 text-blue-500" />
              Measurement Sheet Builder
            </CardTitle>
            <div className="flex items-center gap-3">
              <Select value={activeStyleId} onValueChange={setActiveStyleId}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select a style..." />
                </SelectTrigger>
                <SelectContent>
                  {styles.map((s: any) => (
                    <SelectItem key={s.id} value={s.id}>{s.style_code} — {s.style_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={() => saveMutation.mutate()} disabled={!activeStyleId || saveMutation.isPending} className="gap-2">
                <Save className="h-4 w-4" />
                {saveMutation.isPending ? 'Saving...' : 'Save Sheet'}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {!activeStyleId ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center text-muted-foreground">
            <AlertCircle className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Select a style from the Style Master tab</p>
            <p className="text-sm mt-1">Or use the dropdown above to pick a style</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                {selectedStyle && (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-xs">{(selectedStyle as any).style_code}</Badge>
                    <span className="font-semibold">{(selectedStyle as any).style_name}</span>
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-1">All measurements in inches · Edit any cell directly</p>
              </div>
              <Button variant="outline" size="sm" onClick={addRow} className="gap-1">
                <Plus className="h-3.5 w-3.5" /> Add Row
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 border-b">
                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs w-64">Point of Measurement (POM)</th>
                    {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(size => (
                      <th key={size} className="px-3 py-2.5 font-medium text-xs text-center w-16">
                        <span className="bg-primary text-primary-foreground px-2 py-0.5 rounded text-[11px]">{size}</span>
                      </th>
                    ))}
                    <th className="px-3 py-2.5 font-medium text-xs text-center text-muted-foreground">Tolerance</th>
                    <th className="px-3 py-2.5 font-medium text-xs text-left text-muted-foreground">Remarks</th>
                    <th className="w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, idx) => (
                    <tr key={row.id} className={`border-b hover:bg-muted/30 transition-colors ${idx % 2 === 0 ? '' : 'bg-muted/10'}`}>
                      <td className="px-2 py-1.5">
                        <Input
                          value={row.pom}
                          onChange={e => updateRow(row.id, 'pom', e.target.value)}
                          className="h-7 text-xs border-0 bg-transparent hover:bg-background focus:bg-background px-1"
                          placeholder="Point of measurement..."
                        />
                      </td>
                      {(['xs', 's', 'm', 'l', 'xl', 'xxl'] as const).map(size => (
                        <td key={size} className="px-1 py-1.5 text-center">
                          <Input
                            value={row[size]}
                            onChange={e => updateRow(row.id, size, e.target.value)}
                            className="h-7 text-xs text-center border-0 bg-transparent hover:bg-background focus:bg-background px-1 w-14"
                            placeholder="—"
                          />
                        </td>
                      ))}
                      <td className="px-1 py-1.5 text-center">
                        <Input
                          value={row.tolerance}
                          onChange={e => updateRow(row.id, 'tolerance', e.target.value)}
                          className="h-7 text-xs text-center border-0 bg-transparent hover:bg-background focus:bg-background px-1 w-16 text-amber-600"
                        />
                      </td>
                      <td className="px-1 py-1.5">
                        <Input
                          value={row.remarks}
                          onChange={e => updateRow(row.id, 'remarks', e.target.value)}
                          className="h-7 text-xs border-0 bg-transparent hover:bg-background focus:bg-background px-1"
                          placeholder="Optional note..."
                        />
                      </td>
                      <td className="px-1 py-1.5">
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => removeRow(row.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t flex items-center justify-between text-xs text-muted-foreground">
              <span>{rows.length} measurement points</span>
              <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={addRow}>
                <Plus className="h-3 w-3" /> Add Measurement Point
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
