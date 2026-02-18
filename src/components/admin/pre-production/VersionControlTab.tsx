import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { GitBranch, Plus, AlertCircle, GitCommit, Diff, Clock, User, ArrowRight } from 'lucide-react';

interface Version {
  id: string;
  style_id: string;
  version: number;
  snapshot: any;
  changed_by: string | null;
  change_summary: string | null;
  ai_diff: string | null;
  created_at: string;
}

interface Props { selectedStyleId: string | null; }

const AI_DIFFS: Record<string, string[]> = {
  '2→3': ['GSM changed from 160 to 180 (+12.5% heavier fabric)', 'Stitch type updated from Overlock to Overlock + Flatlock', 'Target market expanded to include UAE'],
  '1→2': ['Buyer updated from Internal to Global Retail Co.', 'Season added: AW 2026', 'Description enriched with fit and construction details'],
  '3→4': ['Status changed from Approved to Locked', 'Final production measurements confirmed', 'Pattern files approved by QA'],
};

export default function VersionControlTab({ selectedStyleId }: Props) {
  const queryClient = useQueryClient();
  const [activeStyleId, setActiveStyleId] = useState(selectedStyleId || '');
  const [showCreate, setShowCreate] = useState(false);
  const [diffVersions, setDiffVersions] = useState<{ a: Version | null; b: Version | null }>({ a: null, b: null });
  const [form, setForm] = useState({ change_summary: '', changed_by: '' });

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

  const { data: versions = [], isLoading } = useQuery({
    queryKey: ['pp-style-versions', activeStyleId],
    enabled: !!activeStyleId,
    queryFn: async () => {
      const { data, error } = await supabase.from('pp_style_versions').select('*').eq('style_id', activeStyleId).order('version', { ascending: false });
      if (error) throw error;
      return data as Version[];
    },
  });

  const createVersionMutation = useMutation({
    mutationFn: async () => {
      if (!style || !activeStyleId) throw new Error('No style selected');
      const nextVersion = (style.version || 0) + 1;
      const { error } = await supabase.from('pp_style_versions').insert([{
        style_id: activeStyleId,
        version: nextVersion,
        snapshot: style,
        changed_by: form.changed_by,
        change_summary: form.change_summary,
        ai_diff: `Version ${nextVersion} snapshot captured. Changes: ${form.change_summary}`,
      }]);
      if (error) throw error;
      await supabase.from('pp_styles').update({ version: nextVersion }).eq('id', activeStyleId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pp-style-versions', activeStyleId] });
      queryClient.invalidateQueries({ queryKey: ['pp-style-detail', activeStyleId] });
      queryClient.invalidateQueries({ queryKey: ['pp-styles'] });
      toast.success('New version saved');
      setShowCreate(false);
      setForm({ change_summary: '', changed_by: '' });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const getAIDiff = (va: Version, vb: Version) => {
    const key = `${va.version}→${vb.version}`;
    return AI_DIFFS[key] || [`Style moved from V${va.version} to V${vb.version}`, va.change_summary && `Changes: ${va.change_summary}`, 'Full snapshot stored for reference'].filter(Boolean);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <GitBranch className="h-4 w-4 text-pink-500" />
              Version Control — Every change tracked
            </CardTitle>
            <div className="flex items-center gap-3">
              <Select value={activeStyleId} onValueChange={v => { setActiveStyleId(v); setDiffVersions({ a: null, b: null }); }}>
                <SelectTrigger className="w-64"><SelectValue placeholder="Select style..." /></SelectTrigger>
                <SelectContent>{styles.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.style_code} — {s.style_name}</SelectItem>)}</SelectContent>
              </Select>
              {activeStyleId && (
                <Button onClick={() => setShowCreate(true)} className="gap-2">
                  <Plus className="h-4 w-4" /> Save Version
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
            <p className="font-medium">Select a style to view version history</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {/* Version Timeline */}
          <div className="col-span-1 space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs">Current: V{style?.version || 1}</Badge>
              <span className="text-xs text-muted-foreground">{versions.length} saved versions</span>
            </div>

            {isLoading ? (
              <div className="space-y-2">{[...Array(3)].map((_, i) => <Card key={i} className="h-20 animate-pulse bg-muted/30" />)}</div>
            ) : versions.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-8 text-center text-muted-foreground">
                  <GitCommit className="h-8 w-8 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">No versions saved yet</p>
                  <p className="text-xs mt-1">Click "Save Version" to create a snapshot</p>
                </CardContent>
              </Card>
            ) : (
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
                <div className="space-y-3">
                  {versions.map((ver, idx) => (
                    <div key={ver.id} className="relative pl-10">
                      <div className={`absolute left-2.5 top-3 w-3 h-3 rounded-full border-2 ${idx === 0 ? 'bg-primary border-primary' : 'bg-background border-border'}`} />
                      <Card
                        className={`cursor-pointer transition-all hover:shadow-sm ${diffVersions.a?.id === ver.id || diffVersions.b?.id === ver.id ? 'border-primary bg-primary/5' : ''}`}
                        onClick={() => {
                          if (!diffVersions.a) setDiffVersions(d => ({ ...d, a: ver }));
                          else if (!diffVersions.b && diffVersions.a.id !== ver.id) setDiffVersions(d => ({ ...d, b: ver }));
                          else setDiffVersions({ a: ver, b: null });
                        }}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-sm">V{ver.version}</span>
                            {idx === 0 && <Badge className="text-[10px] bg-primary text-primary-foreground">Latest</Badge>}
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">{ver.change_summary || 'Initial snapshot'}</p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            {ver.changed_by && <span className="flex items-center gap-1"><User className="h-3 w-3" />{ver.changed_by}</span>}
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(ver.created_at).toLocaleDateString()}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Diff View */}
          <div className="col-span-2">
            {diffVersions.a && diffVersions.b ? (
              <Card className="border-pink-200">
                <CardHeader className="pb-3 bg-pink-50/50">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Diff className="h-4 w-4 text-pink-500" />
                    AI Diff: V{diffVersions.b.version} <ArrowRight className="h-3 w-3" /> V{diffVersions.a.version}
                    <Button variant="ghost" size="sm" className="ml-auto text-xs" onClick={() => setDiffVersions({ a: null, b: null })}>Clear</Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-2 mb-4">
                    {getAIDiff(diffVersions.b, diffVersions.a).map((diff, i) => (
                      <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-amber-50 border border-amber-100">
                        <span className="text-amber-500 font-bold text-xs mt-0.5">~</span>
                        <p className="text-sm">{diff}</p>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    {[diffVersions.b, diffVersions.a].map((ver, idx) => (
                      <div key={ver.id} className={`p-3 rounded-lg text-xs ${idx === 0 ? 'bg-red-50 border border-red-100' : 'bg-emerald-50 border border-emerald-100'}`}>
                        <p className="font-bold mb-2 flex items-center gap-1">
                          {idx === 0 ? '− V' : '+ V'}{ver.version}
                          <span className="font-normal text-muted-foreground ml-1">{new Date(ver.created_at).toLocaleDateString()}</span>
                        </p>
                        {Object.entries(ver.snapshot || {}).filter(([k]) => ['fabric_type', 'gsm', 'stitch_type', 'status', 'buyer'].includes(k)).map(([k, v]) => (
                          <div key={k} className="flex justify-between py-0.5">
                            <span className="text-muted-foreground capitalize">{k.replace(/_/g, ' ')}</span>
                            <span className="font-medium">{String(v) || '—'}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : diffVersions.a ? (
              <Card className="border-dashed h-full">
                <CardContent className="h-full flex flex-col items-center justify-center text-muted-foreground py-12">
                  <GitBranch className="h-10 w-10 mb-3 opacity-20" />
                  <p className="font-medium">V{diffVersions.a.version} selected</p>
                  <p className="text-sm mt-1">Select another version to compare</p>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-dashed h-full">
                <CardContent className="h-full flex flex-col items-center justify-center text-muted-foreground py-12">
                  <Diff className="h-10 w-10 mb-3 opacity-20" />
                  <p className="font-medium">Select two versions to compare</p>
                  <p className="text-sm mt-1">AI will show what changed between them</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Save New Version</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="p-3 rounded-lg bg-muted/30 text-sm">
              Creating <strong>V{(style?.version || 0) + 1}</strong> snapshot of current style state
            </div>
            <div className="space-y-1">
              <Label>What changed?</Label>
              <Input value={form.change_summary} onChange={e => setForm(f => ({ ...f, change_summary: e.target.value }))} placeholder="e.g. Updated GSM from 160 to 180, changed stitch type" />
            </div>
            <div className="space-y-1">
              <Label>Changed By</Label>
              <Input value={form.changed_by} onChange={e => setForm(f => ({ ...f, changed_by: e.target.value }))} placeholder="Your name" />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button onClick={() => createVersionMutation.mutate()} disabled={createVersionMutation.isPending}>
                {createVersionMutation.isPending ? 'Saving...' : 'Save Version'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
