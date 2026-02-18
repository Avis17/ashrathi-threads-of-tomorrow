import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Factory, Ruler, Image, FileText, AlertCircle, Printer, Eye } from 'lucide-react';

interface Props { selectedStyleId: string | null; }

export default function FactoryViewTab({ selectedStyleId }: Props) {
  const [activeStyleId, setActiveStyleId] = useState(selectedStyleId || '');

  useEffect(() => { if (selectedStyleId) setActiveStyleId(selectedStyleId); }, [selectedStyleId]);

  const { data: styles = [] } = useQuery({
    queryKey: ['pp-styles-list'],
    queryFn: async () => { const { data } = await supabase.from('pp_styles').select('id, style_code, style_name').order('created_at', { ascending: false }); return data || []; },
  });

  const { data: style } = useQuery({
    queryKey: ['pp-style-detail', activeStyleId],
    enabled: !!activeStyleId,
    queryFn: async () => { const { data } = await supabase.from('pp_styles').select('*').eq('id', activeStyleId).single(); return data; },
  });

  const { data: measurements } = useQuery({
    queryKey: ['pp-measurements', activeStyleId],
    enabled: !!activeStyleId,
    queryFn: async () => { const { data } = await supabase.from('pp_measurements').select('*').eq('style_id', activeStyleId).single(); return data; },
  });

  const { data: diagrams = [] } = useQuery({
    queryKey: ['pp-diagrams', activeStyleId],
    enabled: !!activeStyleId,
    queryFn: async () => { const { data } = await supabase.from('pp_diagrams').select('*').eq('style_id', activeStyleId); return data || []; },
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Factory className="h-4 w-4 text-cyan-500" />
              Factory-Friendly View
              <Badge variant="secondary" className="text-xs ml-2">Clean Production View</Badge>
            </CardTitle>
            <div className="flex items-center gap-3">
              <Select value={activeStyleId} onValueChange={setActiveStyleId}>
                <SelectTrigger className="w-64"><SelectValue placeholder="Select style..." /></SelectTrigger>
                <SelectContent>{styles.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.style_code} — {s.style_name}</SelectItem>)}</SelectContent>
              </Select>
              {activeStyleId && (
                <Button variant="outline" className="gap-2" onClick={() => window.print()}>
                  <Printer className="h-4 w-4" /> Print
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {!activeStyleId ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center text-muted-foreground">
            <AlertCircle className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Select a style to view factory sheet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="max-w-4xl mx-auto space-y-4 print:space-y-3">
          {/* Factory Header */}
          {style && (
            <Card className="bg-primary text-primary-foreground">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-primary-foreground/60 text-xs uppercase tracking-widest font-medium">Feather Fashions — Production Sheet</p>
                    <h1 className="text-3xl font-bold mt-1">{(style as any).style_name}</h1>
                    <p className="text-primary-foreground/70 font-mono mt-1">{(style as any).style_code}</p>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-primary-foreground text-primary text-sm px-4 py-1 mb-2 block">
                      {(style as any).status}
                    </Badge>
                    <p className="text-primary-foreground/60 text-xs">{(style as any).season || '—'}</p>
                    <p className="text-primary-foreground/60 text-xs">{(style as any).buyer || '—'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-2 gap-4">
            {/* Key Info */}
            {style && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2"><FileText className="h-4 w-4" /> Style Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[
                      ['Category', (style as any).category],
                      ['Fabric', (style as any).fabric_type],
                      ['GSM', (style as any).gsm ? `${(style as any).gsm} GSM` : null],
                      ['Construction', (style as any).construction_type],
                      ['Stitch Type', (style as any).stitch_type],
                      ['Target Market', (style as any).target_market],
                    ].filter(([, v]) => v).map(([label, value]) => (
                      <div key={label as string} className="flex justify-between py-1.5 border-b last:border-0 text-sm">
                        <span className="text-muted-foreground font-medium">{label}</span>
                        <span className="font-semibold">{value}</span>
                      </div>
                    ))}
                  </div>
                  {(style as any).description && (
                    <div className="mt-3 p-3 bg-muted/30 rounded-lg">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Notes</p>
                      <p className="text-sm">{(style as any).description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Flat Sketches */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2"><Image className="h-4 w-4" /> Flat Sketches</CardTitle>
              </CardHeader>
              <CardContent>
                {diagrams.length === 0 ? (
                  <div className="h-32 flex items-center justify-center border-2 border-dashed rounded-lg text-muted-foreground text-sm">
                    No sketches uploaded
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {diagrams.slice(0, 4).map((d: any) => (
                      <div key={d.id} className="aspect-square bg-muted/20 rounded-lg overflow-hidden border">
                        {d.file_url ? (
                          <img src={d.file_url} alt={d.title} className="w-full h-full object-contain p-2" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Image className="h-8 w-8 text-muted-foreground/30" />
                          </div>
                        )}
                        <p className="text-xs text-center pb-1 text-muted-foreground truncate px-1">{d.title}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Measurement Sheet */}
          {measurements && (measurements.rows as any[])?.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2"><Ruler className="h-4 w-4" /> Measurement Chart (inches)</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/50 border-b">
                        <th className="text-left px-4 py-2.5 font-semibold text-xs">Point of Measurement</th>
                        {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(s => (
                          <th key={s} className="px-3 py-2.5 text-center text-xs font-bold">{s}</th>
                        ))}
                        <th className="px-3 py-2.5 text-center text-xs font-semibold text-amber-600">Tol.</th>
                        <th className="px-3 py-2.5 text-left text-xs text-muted-foreground">Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(measurements.rows as any[]).map((row: any, idx: number) => (
                        <tr key={row.id || idx} className={`border-b ${idx % 2 === 0 ? '' : 'bg-muted/10'}`}>
                          <td className="px-4 py-2 text-xs font-medium">{row.pom}</td>
                          {['xs', 's', 'm', 'l', 'xl', 'xxl'].map(s => (
                            <td key={s} className="px-3 py-2 text-center text-xs font-mono">{row[s] || '—'}</td>
                          ))}
                          <td className="px-3 py-2 text-center text-xs font-mono text-amber-600">{row.tolerance}</td>
                          <td className="px-3 py-2 text-xs text-muted-foreground">{row.remarks}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {!measurements && (
            <Card className="border-dashed">
              <CardContent className="py-6 text-center text-muted-foreground text-sm">
                <Ruler className="h-6 w-6 mx-auto mb-2 opacity-20" />
                No measurement sheet added yet
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
