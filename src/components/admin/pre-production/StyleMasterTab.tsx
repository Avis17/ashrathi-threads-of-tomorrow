import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Plus, Search, Filter, Eye, Edit2, Lock, 
  ChevronRight, Layers, Tag, Package, User, Calendar
} from 'lucide-react';

interface Style {
  id: string;
  style_code: string;
  style_name: string;
  category: string;
  buyer: string | null;
  season: string | null;
  fabric_type: string | null;
  gsm: string | null;
  construction_type: string | null;
  stitch_type: string | null;
  status: string;
  description: string | null;
  target_market: string | null;
  version: number;
  created_at: string;
  updated_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  Draft: 'bg-muted text-muted-foreground border',
  Approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Locked: 'bg-violet-50 text-violet-700 border-violet-200',
};

const CATEGORIES = ['Nightwear', 'Pyjama Set', 'Kurti', 'Sportswear', 'Innerwear', 'Leggings', 'Kidswear', 'Casual Wear'];
const STATUSES = ['Draft', 'Approved', 'Locked'];

const emptyForm = {
  style_code: '', style_name: '', category: 'Nightwear', buyer: '',
  season: '', fabric_type: '', gsm: '', construction_type: '', stitch_type: '',
  status: 'Draft', description: '', target_market: '',
};

interface Props {
  selectedStyleId: string | null;
  onSelectStyle: (id: string) => void;
}

export default function StyleMasterTab({ selectedStyleId, onSelectStyle }: Props) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editStyle, setEditStyle] = useState<Style | null>(null);
  const [form, setForm] = useState(emptyForm);

  const { data: styles = [], isLoading } = useQuery({
    queryKey: ['pp-styles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('pp_styles').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data as Style[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof emptyForm) => {
      if (editStyle) {
        const { error } = await supabase.from('pp_styles').update({ ...data, version: editStyle.version + 1 }).eq('id', editStyle.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('pp_styles').insert([{ ...data, version: 1 }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pp-styles'] });
      toast.success(editStyle ? 'Style updated' : 'Style created');
      setShowForm(false);
      setEditStyle(null);
      setForm(emptyForm);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const lockMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('pp_styles').update({ status: 'Locked' }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['pp-styles'] }); toast.success('Style locked for production'); },
  });

  const filtered = styles.filter(s => {
    const matchSearch = s.style_name.toLowerCase().includes(search.toLowerCase()) || s.style_code.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || s.status === filterStatus;
    const matchCat = filterCategory === 'all' || s.category === filterCategory;
    return matchSearch && matchStatus && matchCat;
  });

  const openEdit = (s: Style) => {
    setEditStyle(s);
    setForm({ style_code: s.style_code, style_name: s.style_name, category: s.category, buyer: s.buyer || '', season: s.season || '', fabric_type: s.fabric_type || '', gsm: s.gsm || '', construction_type: s.construction_type || '', stitch_type: s.stitch_type || '', status: s.status, description: s.description || '', target_market: s.target_market || '' });
    setShowForm(true);
  };

  const stats = { total: styles.length, draft: styles.filter(s => s.status === 'Draft').length, approved: styles.filter(s => s.status === 'Approved').length, locked: styles.filter(s => s.status === 'Locked').length };

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Styles', value: stats.total, color: 'text-foreground', bg: 'bg-muted/50' },
          { label: 'Draft', value: stats.draft, color: 'text-muted-foreground', bg: 'bg-muted/30' },
          { label: 'Approved', value: stats.approved, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Locked', value: stats.locked, color: 'text-violet-600', bg: 'bg-violet-50' },
        ].map(stat => (
          <Card key={stat.label} className={`${stat.bg} border`}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{stat.label}</p>
              <p className={`text-3xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search style code or name..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button onClick={() => { setEditStyle(null); setForm(emptyForm); setShowForm(true); }} className="gap-2">
          <Plus className="h-4 w-4" /> New Style
        </Button>
      </div>

      {/* Style Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <Card key={i} className="h-48 animate-pulse bg-muted/30" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(style => (
            <Card
              key={style.id}
              className={`group cursor-pointer transition-all hover:shadow-md border-2 ${selectedStyleId === style.id ? 'border-primary shadow-md' : 'border-transparent hover:border-border'}`}
              onClick={() => onSelectStyle(style.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded text-muted-foreground">{style.style_code}</span>
                      <Badge className={`text-xs px-2 py-0.5 ${STATUS_COLORS[style.status]}`}>{style.status}</Badge>
                    </div>
                    <CardTitle className="text-base leading-tight truncate">{style.style_name}</CardTitle>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={e => { e.stopPropagation(); openEdit(style); }}>
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    {style.status !== 'Locked' && (
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={e => { e.stopPropagation(); lockMutation.mutate(style.id); }}>
                        <Lock className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Tag className="h-3 w-3" />
                    <span className="truncate">{style.category}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Package className="h-3 w-3" />
                    <span className="truncate">{style.fabric_type || '—'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <User className="h-3 w-3" />
                    <span className="truncate">{style.buyer || '—'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span className="truncate">{style.season || '—'}</span>
                  </div>
                </div>
                {style.gsm && (
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">{style.gsm} GSM</span>
                    <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-medium">V{style.version}</span>
                    {style.target_market && <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-medium">{style.target_market}</span>}
                  </div>
                )}
                {style.description && (
                  <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{style.description}</p>
                )}
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{new Date(style.created_at).toLocaleDateString()}</span>
                  <div className="flex items-center gap-1 text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Select <ChevronRight className="h-3 w-3" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-3 text-center py-16 text-muted-foreground">
              <Layers className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p className="font-medium">No styles found</p>
              <p className="text-sm">Create your first style to get started</p>
            </div>
          )}
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editStyle ? `Edit Style — ${editStyle.style_code}` : 'Create New Style'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="space-y-1">
              <Label>Style Code *</Label>
              <Input value={form.style_code} onChange={e => setForm(f => ({ ...f, style_code: e.target.value }))} placeholder="FF-NW-001" disabled={!!editStyle} />
            </div>
            <div className="space-y-1">
              <Label>Style Name *</Label>
              <Input value={form.style_name} onChange={e => setForm(f => ({ ...f, style_name: e.target.value }))} placeholder="Classic Pyjama Top" />
            </div>
            <div className="space-y-1">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Buyer</Label>
              <Input value={form.buyer} onChange={e => setForm(f => ({ ...f, buyer: e.target.value }))} placeholder="Buyer name" />
            </div>
            <div className="space-y-1">
              <Label>Season</Label>
              <Input value={form.season} onChange={e => setForm(f => ({ ...f, season: e.target.value }))} placeholder="SS 2026" />
            </div>
            <div className="space-y-1">
              <Label>Fabric Type</Label>
              <Input value={form.fabric_type} onChange={e => setForm(f => ({ ...f, fabric_type: e.target.value }))} placeholder="Cotton Jersey" />
            </div>
            <div className="space-y-1">
              <Label>GSM</Label>
              <Input value={form.gsm} onChange={e => setForm(f => ({ ...f, gsm: e.target.value }))} placeholder="180" />
            </div>
            <div className="space-y-1">
              <Label>Construction Type</Label>
              <Input value={form.construction_type} onChange={e => setForm(f => ({ ...f, construction_type: e.target.value }))} placeholder="Single Jersey Knit" />
            </div>
            <div className="space-y-1">
              <Label>Stitch Type</Label>
              <Input value={form.stitch_type} onChange={e => setForm(f => ({ ...f, stitch_type: e.target.value }))} placeholder="Overlock + Flatlock" />
            </div>
            <div className="space-y-1">
              <Label>Target Market</Label>
              <Input value={form.target_market} onChange={e => setForm(f => ({ ...f, target_market: e.target.value }))} placeholder="UAE, UK, South Africa" />
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Detailed description of the style..." rows={3} />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={() => saveMutation.mutate(form)} disabled={saveMutation.isPending || !form.style_code || !form.style_name}>
              {saveMutation.isPending ? 'Saving...' : editStyle ? 'Update Style' : 'Create Style'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
