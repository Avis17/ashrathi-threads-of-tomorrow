import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Palette, Upload, Wand2, Maximize2, Plus, AlertCircle, 
  ImageIcon, RotateCw, ZoomIn, ZoomOut, X, Eye
} from 'lucide-react';

interface Diagram {
  id: string;
  style_id: string;
  diagram_type: string;
  title: string;
  file_url: string | null;
  ai_generated: boolean;
  ai_prompt: string | null;
  notes: string | null;
  created_at: string;
}

interface LightboxState { src: string; title: string; }

interface Props { selectedStyleId: string | null; }

const DIAGRAM_TYPES = [
  { value: 'front', label: 'Front View', color: 'bg-blue-50 text-blue-700' },
  { value: 'back', label: 'Back View', color: 'bg-violet-50 text-violet-700' },
  { value: 'detail', label: 'Construction Detail', color: 'bg-amber-50 text-amber-700' },
  { value: 'side', label: 'Side View', color: 'bg-emerald-50 text-emerald-700' },
];

// Sample flat sketch SVGs for demo
const FLAT_SKETCH_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 360" fill="none" stroke="#1a1a1a" stroke-width="2">
  <!-- Body -->
  <path d="M100,80 C80,80 60,90 50,110 L30,170 L50,175 L60,200 L240,200 L250,175 L270,170 L250,110 C240,90 220,80 200,80" stroke-linecap="round"/>
  <!-- Neck -->
  <path d="M130,80 C130,60 170,60 170,80" stroke-linecap="round"/>
  <!-- Shoulders -->
  <path d="M100,80 L80,95 M200,80 L220,95"/>
  <!-- Sleeves -->
  <path d="M50,110 L30,145 L55,155 L70,130" stroke-linecap="round"/>
  <path d="M250,110 L270,145 L245,155 L230,130" stroke-linecap="round"/>
  <!-- Hem -->
  <path d="M60,200 L60,210 C80,215 220,215 240,210 L240,200"/>
  <!-- Center front line -->
  <path d="M150,80 L150,200" stroke-dasharray="4,3" stroke-width="1" stroke="#666"/>
  <!-- Construction marks -->
  <circle cx="150" cy="100" r="3" fill="#1a1a1a"/>
  <text x="155" y="104" font-size="8" fill="#666">NP</text>
  <text x="105" y="78" font-size="7" fill="#666">CB</text>
</svg>`;

export default function TechDiagramsTab({ selectedStyleId }: Props) {
  const queryClient = useQueryClient();
  const [activeStyleId, setActiveStyleId] = useState(selectedStyleId || '');
  const [lightbox, setLightbox] = useState<LightboxState | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadForm, setUploadForm] = useState({ diagram_type: 'front', title: 'Front Flat Sketch', notes: '', ai_prompt: '' });
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  useEffect(() => { if (selectedStyleId) setActiveStyleId(selectedStyleId); }, [selectedStyleId]);

  const { data: styles = [] } = useQuery({
    queryKey: ['pp-styles-list'],
    queryFn: async () => {
      const { data } = await supabase.from('pp_styles').select('id, style_code, style_name').order('created_at', { ascending: false });
      return data || [];
    },
  });

  const { data: diagrams = [], isLoading } = useQuery({
    queryKey: ['pp-diagrams', activeStyleId],
    enabled: !!activeStyleId,
    queryFn: async () => {
      const { data, error } = await supabase.from('pp_diagrams').select('*').eq('style_id', activeStyleId).order('created_at');
      if (error) throw error;
      return data as Diagram[];
    },
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeStyleId) return;
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `diagrams/${activeStyleId}/${uploadForm.diagram_type}-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('pp-assets').upload(path, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('pp-assets').getPublicUrl(path);
      const { error } = await supabase.from('pp_diagrams').insert([{
        style_id: activeStyleId,
        diagram_type: uploadForm.diagram_type,
        title: uploadForm.title,
        file_url: publicUrl,
        ai_generated: false,
        notes: uploadForm.notes,
      }]);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['pp-diagrams', activeStyleId] });
      toast.success('Diagram uploaded');
      setShowUpload(false);
    } catch (e: any) { toast.error(e.message); }
    finally { setUploading(false); }
  };

  const handleAIGenerate = async () => {
    if (!activeStyleId || !uploadForm.ai_prompt) { toast.error('Enter a prompt first'); return; }
    setGenerating(true);
    try {
      // Store as SVG data URL (demo flat sketch)
      const svgDataUrl = `data:image/svg+xml;base64,${btoa(FLAT_SKETCH_SVG)}`;
      const { error } = await supabase.from('pp_diagrams').insert([{
        style_id: activeStyleId,
        diagram_type: uploadForm.diagram_type,
        title: `AI: ${uploadForm.ai_prompt.slice(0, 60)}`,
        file_url: svgDataUrl,
        ai_generated: true,
        ai_prompt: uploadForm.ai_prompt,
        notes: 'Generated via AI flat sketch generator',
      }]);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['pp-diagrams', activeStyleId] });
      toast.success('AI flat sketch generated');
      setShowUpload(false);
    } catch (e: any) { toast.error(e.message); }
    finally { setGenerating(false); }
  };

  const deleteDiagram = async (id: string) => {
    await supabase.from('pp_diagrams').delete().eq('id', id);
    queryClient.invalidateQueries({ queryKey: ['pp-diagrams', activeStyleId] });
    toast.success('Diagram removed');
  };

  const typeInfo = (type: string) => DIAGRAM_TYPES.find(t => t.value === type) || DIAGRAM_TYPES[0];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Palette className="h-4 w-4 text-emerald-500" />
              Technical Diagrams & Flat Sketches
            </CardTitle>
            <div className="flex items-center gap-3">
              <Select value={activeStyleId} onValueChange={setActiveStyleId}>
                <SelectTrigger className="w-64"><SelectValue placeholder="Select style..." /></SelectTrigger>
                <SelectContent>{styles.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.style_code} — {s.style_name}</SelectItem>)}</SelectContent>
              </Select>
              {activeStyleId && (
                <Button onClick={() => setShowUpload(true)} className="gap-2">
                  <Plus className="h-4 w-4" /> Add Diagram
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
            <p className="font-medium">Select a style to view diagrams</p>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Card key={i} className="aspect-[3/4] animate-pulse bg-muted/30" />)}
        </div>
      ) : (
        <>
          {/* Quick add AI prompts */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="border-dashed border-2 bg-gradient-to-br from-emerald-50/50 to-transparent">
              <CardContent className="p-4">
                <p className="text-xs font-medium text-emerald-700 mb-2">Try AI Sketch Prompts:</p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "Women's pyjama top, round neck, short sleeves, front view",
                    "Elastic waist pyjama bottom, straight leg, back view",
                    "V-neck nightgown with lace trim, flutter sleeves",
                  ].map(prompt => (
                    <button
                      key={prompt}
                      onClick={() => { setUploadForm(f => ({ ...f, ai_prompt: prompt, diagram_type: 'front' })); setShowUpload(true); }}
                      className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors text-left"
                    >
                      {prompt.slice(0, 40)}...
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-blue-50/50 to-transparent">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">{diagrams.length} Diagrams</p>
                  <p className="text-xs text-muted-foreground">{diagrams.filter(d => d.ai_generated).length} AI generated</p>
                </div>
                <div className="flex flex-col gap-1">
                  {DIAGRAM_TYPES.map(t => {
                    const count = diagrams.filter(d => d.diagram_type === t.value).length;
                    return count > 0 ? (
                      <span key={t.value} className={`text-xs px-2 py-0.5 rounded-full ${t.color}`}>{t.label}: {count}</span>
                    ) : null;
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {diagrams.map(diagram => (
              <Card key={diagram.id} className="group overflow-hidden">
                <div className="relative aspect-[3/4] bg-muted/20 flex items-center justify-center cursor-pointer"
                  onClick={() => diagram.file_url && setLightbox({ src: diagram.file_url, title: diagram.title })}>
                  {diagram.file_url ? (
                    <img src={diagram.file_url} alt={diagram.title} className="w-full h-full object-contain p-4" />
                  ) : (
                    <ImageIcon className="h-16 w-16 text-muted-foreground/30" />
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    <Button size="icon" variant="secondary" className="h-9 w-9"><Maximize2 className="h-4 w-4" /></Button>
                    <Button size="icon" variant="destructive" className="h-9 w-9" onClick={e => { e.stopPropagation(); deleteDiagram(diagram.id); }}><X className="h-4 w-4" /></Button>
                  </div>
                  {diagram.ai_generated && (
                    <Badge className="absolute top-2 left-2 text-[10px] bg-violet-600 text-white gap-1">
                      <Wand2 className="h-2.5 w-2.5" /> AI
                    </Badge>
                  )}
                </div>
                <CardContent className="p-3">
                  <p className="text-sm font-medium truncate">{diagram.title}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className={`text-xs px-1.5 py-0.5 rounded ${typeInfo(diagram.diagram_type).color}`}>
                      {typeInfo(diagram.diagram_type).label}
                    </span>
                  </div>
                  {diagram.notes && <p className="text-xs text-muted-foreground mt-1 truncate">{diagram.notes}</p>}
                </CardContent>
              </Card>
            ))}
            {/* Add new card */}
            <Card className="border-dashed border-2 cursor-pointer hover:bg-muted/20 transition-colors" onClick={() => setShowUpload(true)}>
              <div className="aspect-[3/4] flex flex-col items-center justify-center gap-3 text-muted-foreground">
                <div className="p-4 rounded-full bg-muted/50"><Plus className="h-8 w-8" /></div>
                <p className="text-sm font-medium">Add Diagram</p>
                <p className="text-xs text-center px-4">Upload or generate with AI</p>
              </div>
            </Card>
          </div>

          {diagrams.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center text-muted-foreground">
                <Palette className="h-10 w-10 mx-auto mb-3 opacity-20" />
                <p className="font-medium">No diagrams yet</p>
                <p className="text-sm mt-1">Upload flat sketches or generate with AI</p>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Upload/Generate Dialog */}
      <Dialog open={showUpload} onOpenChange={setShowUpload}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Technical Diagram</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Diagram Type</Label>
                <Select value={uploadForm.diagram_type} onValueChange={v => setUploadForm(f => ({ ...f, diagram_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{DIAGRAM_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Title</Label>
                <Input value={uploadForm.title} onChange={e => setUploadForm(f => ({ ...f, title: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Notes</Label>
              <Input value={uploadForm.notes} onChange={e => setUploadForm(f => ({ ...f, notes: e.target.value }))} placeholder="Optional notes..." />
            </div>

            {/* Upload option */}
            <div className="border-2 border-dashed rounded-lg p-4 text-center hover:bg-muted/20 transition-colors cursor-pointer relative">
              <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm font-medium">Upload File</p>
              <p className="text-xs text-muted-foreground">PNG, JPG, SVG, PDF</p>
              <input type="file" accept="image/*,.pdf,.svg" onChange={handleUpload} className="absolute inset-0 opacity-0 cursor-pointer" disabled={uploading} />
              {uploading && <p className="text-xs text-primary mt-1 animate-pulse">Uploading...</p>}
            </div>

            <div className="relative flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground font-medium">OR GENERATE WITH AI</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <div className="space-y-2">
              <Label>AI Prompt</Label>
              <Textarea
                value={uploadForm.ai_prompt}
                onChange={e => setUploadForm(f => ({ ...f, ai_prompt: e.target.value }))}
                placeholder="e.g. Women's pyjama top with round neck, short sleeves, straight hem, front and back view, black and white technical flat sketch"
                rows={3}
              />
              <Button onClick={handleAIGenerate} disabled={generating || !uploadForm.ai_prompt} className="w-full gap-2">
                <Wand2 className="h-4 w-4" />
                {generating ? 'Generating Flat Sketch...' : 'Generate AI Flat Sketch'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col" onClick={() => setLightbox(null)}>
          <div className="flex items-center justify-between p-4 border-b border-white/10" onClick={e => e.stopPropagation()}>
            <p className="text-white font-medium">{lightbox.title}</p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="h-8 w-8 bg-white/10 border-white/20 text-white hover:bg-white/20" onClick={() => setZoom(z => Math.max(0.5, z - 0.25))}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-white/70 text-sm w-12 text-center">{Math.round(zoom * 100)}%</span>
              <Button variant="outline" size="icon" className="h-8 w-8 bg-white/10 border-white/20 text-white hover:bg-white/20" onClick={() => setZoom(z => Math.min(4, z + 0.25))}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8 bg-white/10 border-white/20 text-white hover:bg-white/20" onClick={() => setRotation(r => r + 90)}>
                <RotateCw className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8 bg-white/10 border-white/20 text-white hover:bg-white/20" onClick={() => { setLightbox(null); setZoom(1); setRotation(0); }}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center overflow-auto p-8" onClick={e => e.stopPropagation()}>
            <img
              src={lightbox.src}
              alt={lightbox.title}
              style={{ transform: `scale(${zoom}) rotate(${rotation}deg)`, transition: 'transform 0.2s ease', maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
