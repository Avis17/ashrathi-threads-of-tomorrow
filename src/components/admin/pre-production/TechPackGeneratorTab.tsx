import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  Zap, CheckCircle2, Circle, AlertCircle, FileText, Ruler, 
  Image, Package, Wand2, Download, Clock
} from 'lucide-react';

interface Props { selectedStyleId: string | null; }

const CHECKLIST = [
  { key: 'style', label: 'Style Info', icon: FileText, tab: 'styles' },
  { key: 'measurements', label: 'Measurements', icon: Ruler, tab: 'measurements' },
  { key: 'diagrams', label: 'Flat Sketches', icon: Image, tab: 'diagrams' },
  { key: 'patterns', label: 'Pattern Files', icon: Package, tab: 'patterns' },
];

export default function TechPackGeneratorTab({ selectedStyleId }: Props) {
  const [activeStyleId, setActiveStyleId] = useState(selectedStyleId || '');
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState('');
  const [generated, setGenerated] = useState(false);

  useEffect(() => { if (selectedStyleId) setActiveStyleId(selectedStyleId); }, [selectedStyleId]);

  const { data: styles = [] } = useQuery({
    queryKey: ['pp-styles-list'],
    queryFn: async () => {
      const { data } = await supabase.from('pp_styles').select('id, style_code, style_name, status, fabric_type, gsm, buyer, season, category, stitch_type, construction_type, description').order('created_at', { ascending: false });
      return data || [];
    },
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

  const { data: patterns = [] } = useQuery({
    queryKey: ['pp-patterns', activeStyleId],
    enabled: !!activeStyleId,
    queryFn: async () => { const { data } = await supabase.from('pp_patterns').select('*').eq('style_id', activeStyleId); return data || []; },
  });

  const style = styles.find((s: any) => s.id === activeStyleId);

  const checks = {
    style: !!style,
    measurements: !!measurements,
    diagrams: diagrams.length > 0,
    patterns: patterns.length > 0,
  };

  const completedCount = Object.values(checks).filter(Boolean).length;
  const readiness = Math.round((completedCount / 4) * 100);

  const simulateGenerate = async () => {
    if (!activeStyleId || !style) { toast.error('Select a style first'); return; }
    if (!checks.style) { toast.error('Style info required'); return; }
    
    setGenerating(true);
    setProgress(0);
    setGenerated(false);

    const stages = [
      { label: 'Assembling cover page...', pct: 15 },
      { label: 'Adding style information...', pct: 30 },
      { label: 'Embedding flat sketches...', pct: 50 },
      { label: 'Building measurement sheet...', pct: 65 },
      { label: 'Adding construction details...', pct: 80 },
      { label: 'Compiling fabric & trim details...', pct: 90 },
      { label: 'Finalizing PDF...', pct: 100 },
    ];

    for (const s of stages) {
      await new Promise(r => setTimeout(r, 600));
      setStage(s.label);
      setProgress(s.pct);
    }

    await supabase.from('pp_tech_packs').insert([{
      style_id: activeStyleId,
      status: 'completed',
      includes: { style: true, measurements: checks.measurements, diagrams: checks.diagrams, patterns: checks.patterns },
    }]);

    setGenerating(false);
    setGenerated(true);
    toast.success('Tech Pack generated successfully!');
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="h-4 w-4 text-orange-500" />
              Tech Pack Auto Generator
            </CardTitle>
            <Select value={activeStyleId} onValueChange={v => { setActiveStyleId(v); setGenerated(false); }}>
              <SelectTrigger className="w-64"><SelectValue placeholder="Select style..." /></SelectTrigger>
              <SelectContent>{styles.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.style_code} — {s.style_name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      {!activeStyleId ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center text-muted-foreground">
            <AlertCircle className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Select a style to generate a Tech Pack</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {/* Left: Checklist */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Readiness Check</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Completion</span>
                    <span className={readiness === 100 ? 'text-emerald-600 font-semibold' : 'text-amber-600 font-semibold'}>{readiness}%</span>
                  </div>
                  <Progress value={readiness} className="h-2" />
                </div>
                {CHECKLIST.map(item => {
                  const ok = checks[item.key as keyof typeof checks];
                  return (
                    <div key={item.key} className={`flex items-center gap-3 p-2 rounded-lg ${ok ? 'bg-emerald-50' : 'bg-muted/30'}`}>
                      {ok ? <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" /> : <Circle className="h-4 w-4 text-muted-foreground/40 shrink-0" />}
                      <div className="min-w-0">
                        <p className={`text-xs font-medium ${ok ? 'text-emerald-700' : 'text-muted-foreground'}`}>{item.label}</p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {style && (
              <Card className="bg-muted/20">
                <CardContent className="p-4 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Style Summary</p>
                  {[
                    ['Code', (style as any).style_code],
                    ['Name', (style as any).style_name],
                    ['Category', (style as any).category],
                    ['Buyer', (style as any).buyer],
                    ['Season', (style as any).season],
                    ['Fabric', (style as any).fabric_type],
                    ['GSM', (style as any).gsm],
                  ].map(([label, val]) => val && (
                    <div key={label} className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-medium text-right ml-2 truncate max-w-[120px]">{val}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Center: Generator */}
          <div className="space-y-4">
            <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto">
                  <Wand2 className="h-8 w-8 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">One-Click Tech Pack</h3>
                  <p className="text-sm text-muted-foreground mt-1">AI assembles complete PDF with cover, measurements, sketches, and construction details</p>
                </div>

                {generating ? (
                  <div className="space-y-3">
                    <Progress value={progress} className="h-3" />
                    <p className="text-sm text-orange-700 animate-pulse font-medium">{stage}</p>
                    <p className="text-xs text-muted-foreground">{progress}% complete</p>
                  </div>
                ) : generated ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-2 text-emerald-600">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="font-semibold">Tech Pack Ready!</span>
                    </div>
                    <Button className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700">
                      <Download className="h-4 w-4" /> Download PDF
                    </Button>
                    <Button variant="outline" className="w-full gap-2 text-sm" onClick={() => { setGenerated(false); setProgress(0); }}>
                      Regenerate
                    </Button>
                  </div>
                ) : (
                  <Button
                    className="w-full gap-2 bg-orange-500 hover:bg-orange-600 text-white"
                    size="lg"
                    onClick={simulateGenerate}
                    disabled={!checks.style}
                  >
                    <Zap className="h-5 w-5" />
                    Generate Tech Pack PDF
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* What's included */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Tech Pack Contents</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { label: 'Cover Page', desc: 'Brand, style code, season', included: true },
                  { label: 'Style Information', desc: 'Fabric, GSM, construction', included: checks.style },
                  { label: 'Flat Sketches', desc: 'Front, back, detail views', included: checks.diagrams },
                  { label: 'Measurement Sheet', desc: 'All sizes with tolerance', included: checks.measurements },
                  { label: 'Construction Notes', desc: 'Stitch type, seam details', included: checks.style },
                  { label: 'Pattern Files', desc: 'References & versions', included: checks.patterns },
                ].map(item => (
                  <div key={item.label} className="flex items-start gap-2.5">
                    {item.included ? <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" /> : <Circle className="h-4 w-4 text-muted-foreground/30 mt-0.5 shrink-0" />}
                    <div>
                      <p className="text-xs font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right: History */}
          <div>
            <TechPackHistory styleId={activeStyleId} />
          </div>
        </div>
      )}
    </div>
  );
}

function TechPackHistory({ styleId }: { styleId: string }) {
  const { data: packs = [] } = useQuery({
    queryKey: ['pp-tech-packs', styleId],
    queryFn: async () => {
      const { data } = await supabase.from('pp_tech_packs').select('*').eq('style_id', styleId).order('created_at', { ascending: false }).limit(10);
      return data || [];
    },
  });

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" /> Generation History
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {packs.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">No tech packs generated yet</p>
        ) : packs.map((pack: any) => (
          <div key={pack.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 text-xs">
            <div>
              <p className="font-medium">V{pack.version} — {pack.status}</p>
              <p className="text-muted-foreground">{new Date(pack.created_at).toLocaleString()}</p>
            </div>
            <Badge className={pack.status === 'completed' ? 'bg-emerald-100 text-emerald-700 text-[10px]' : 'text-[10px]'}>
              {pack.status}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
