import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FolderOpen, Plus, Upload, CheckCircle2, AlertCircle, FileText, Download, Calendar, User } from 'lucide-react';

interface Pattern {
  id: string;
  style_id: string;
  pattern_version: string;
  size_set: string | null;
  file_url: string | null;
  file_type: string | null;
  created_by: string | null;
  notes: string | null;
  is_approved: boolean;
  created_at: string;
}

interface Props { selectedStyleId: string | null; }

export default function PatternLibraryTab({ selectedStyleId }: Props) {
  const queryClient = useQueryClient();
  const [activeStyleId, setActiveStyleId] = useState(selectedStyleId || '');
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ pattern_version: 'V1', size_set: 'All Sizes', file_type: 'PDF', created_by: '', notes: '' });

  useEffect(() => { if (selectedStyleId) setActiveStyleId(selectedStyleId); }, [selectedStyleId]);

  const { data: styles = [] } = useQuery({
    queryKey: ['pp-styles-list'],
    queryFn: async () => {
      const { data } = await supabase.from('pp_styles').select('id, style_code, style_name').order('created_at', { ascending: false });
      return data || [];
    },
  });

  const { data: patterns = [], isLoading } = useQuery({
    queryKey: ['pp-patterns', activeStyleId],
    enabled: !!activeStyleId,
    queryFn: async () => {
      const { data, error } = await supabase.from('pp_patterns').select('*').eq('style_id', activeStyleId).order('created_at', { ascending: false });
      if (error) throw error;
      return data as Pattern[];
    },
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeStyleId) return;
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `patterns/${activeStyleId}/${form.pattern_version}-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('pp-assets').upload(path, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('pp-assets').getPublicUrl(path);
      const { error } = await supabase.from('pp_patterns').insert([{
        style_id: activeStyleId,
        pattern_version: form.pattern_version,
        size_set: form.size_set,
        file_url: publicUrl,
        file_type: ext?.toUpperCase() || form.file_type,
        created_by: form.created_by,
        notes: form.notes,
      }]);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['pp-patterns', activeStyleId] });
      toast.success('Pattern file uploaded');
      setShowForm(false);
    } catch (e: any) { toast.error(e.message); }
    finally { setUploading(false); }
  };

  const toggleApproval = async (p: Pattern) => {
    const { error } = await supabase.from('pp_patterns').update({ is_approved: !p.is_approved }).eq('id', p.id);
    if (!error) { queryClient.invalidateQueries({ queryKey: ['pp-patterns', activeStyleId] }); toast.success(p.is_approved ? 'Approval removed' : 'Pattern approved'); }
  };

  const addWithoutFile = async () => {
    if (!activeStyleId) return;
    const { error } = await supabase.from('pp_patterns').insert([{
      style_id: activeStyleId,
      pattern_version: form.pattern_version,
      size_set: form.size_set,
      file_type: form.file_type,
      created_by: form.created_by,
      notes: form.notes,
    }]);
    if (!error) { queryClient.invalidateQueries({ queryKey: ['pp-patterns', activeStyleId] }); toast.success('Pattern entry added'); setShowForm(false); }
    else toast.error(error.message);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-amber-500" />
              Pattern & Marker Library
            </CardTitle>
            <div className="flex items-center gap-3">
              <Select value={activeStyleId} onValueChange={setActiveStyleId}>
                <SelectTrigger className="w-64"><SelectValue placeholder="Select style..." /></SelectTrigger>
                <SelectContent>{styles.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.style_code} — {s.style_name}</SelectItem>)}</SelectContent>
              </Select>
              {activeStyleId && (
                <Button onClick={() => setShowForm(true)} className="gap-2">
                  <Plus className="h-4 w-4" /> Add Pattern
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
            <p className="font-medium">Select a style to view patterns</p>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <Card key={i} className="h-20 animate-pulse bg-muted/30" />)}</div>
      ) : (
        <>
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="bg-amber-50/50">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Total Patterns</p>
                <p className="text-2xl font-bold text-amber-700">{patterns.length}</p>
              </CardContent>
            </Card>
            <Card className="bg-emerald-50/50">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold text-emerald-700">{patterns.filter(p => p.is_approved).length}</p>
              </CardContent>
            </Card>
            <Card className="bg-blue-50/50">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">With Files</p>
                <p className="text-2xl font-bold text-blue-700">{patterns.filter(p => p.file_url).length}</p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-3">
            {patterns.map(pattern => (
              <Card key={pattern.id} className={`transition-all ${pattern.is_approved ? 'border-emerald-200 bg-emerald-50/20' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-muted">
                        <FileText className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">{pattern.pattern_version}</span>
                          <Badge variant="outline" className="text-xs">{pattern.size_set || 'All Sizes'}</Badge>
                          {pattern.file_type && <Badge variant="secondary" className="text-xs">{pattern.file_type}</Badge>}
                          {pattern.is_approved && <Badge className="text-xs bg-emerald-500 text-white gap-1"><CheckCircle2 className="h-3 w-3" /> Approved</Badge>}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {pattern.created_by && <span className="flex items-center gap-1"><User className="h-3 w-3" />{pattern.created_by}</span>}
                          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(pattern.created_at).toLocaleDateString()}</span>
                        </div>
                        {pattern.notes && <p className="text-xs text-muted-foreground mt-1">{pattern.notes}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {pattern.file_url && (
                        <Button variant="outline" size="sm" className="gap-1" asChild>
                          <a href={pattern.file_url} target="_blank" rel="noopener noreferrer">
                            <Download className="h-3.5 w-3.5" /> Download
                          </a>
                        </Button>
                      )}
                      <Button
                        variant={pattern.is_approved ? 'destructive' : 'outline'}
                        size="sm"
                        onClick={() => toggleApproval(pattern)}
                        className="gap-1"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {pattern.is_approved ? 'Revoke' : 'Approve'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {patterns.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center text-muted-foreground">
                  <FolderOpen className="h-10 w-10 mx-auto mb-3 opacity-20" />
                  <p className="font-medium">No patterns yet</p>
                  <p className="text-sm">Add pattern files (PDF, DXF) for this style</p>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Pattern / Marker File</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Pattern Version</Label>
                <Input value={form.pattern_version} onChange={e => setForm(f => ({ ...f, pattern_version: e.target.value }))} placeholder="V1" />
              </div>
              <div className="space-y-1">
                <Label>Size Set</Label>
                <Select value={form.size_set} onValueChange={v => setForm(f => ({ ...f, size_set: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['All Sizes', 'XS-XL', 'S-XXL', 'L-XXL', 'Sample Size M', 'Custom'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label>Created By</Label>
              <Input value={form.created_by} onChange={e => setForm(f => ({ ...f, created_by: e.target.value }))} placeholder="Pattern master name" />
            </div>
            <div className="space-y-1">
              <Label>Notes</Label>
              <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Version notes..." rows={2} />
            </div>
            <div className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-muted/20 transition-colors relative">
              <Upload className="h-5 w-5 mx-auto mb-1.5 text-muted-foreground" />
              <p className="text-sm font-medium">Upload Pattern File</p>
              <p className="text-xs text-muted-foreground">PDF, DXF, AI, PNG</p>
              <input type="file" accept=".pdf,.dxf,.ai,image/*" onChange={handleUpload} className="absolute inset-0 opacity-0 cursor-pointer" disabled={uploading} />
              {uploading && <p className="text-xs text-primary mt-1 animate-pulse">Uploading...</p>}
            </div>
            <Button variant="outline" className="w-full" onClick={addWithoutFile}>Add Entry Without File</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
