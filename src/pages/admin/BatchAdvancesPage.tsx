import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Search, Banknote, Trash2 } from 'lucide-react';
import { useBatchSalaryAdvances, useDeleteBatchSalaryAdvance } from '@/hooks/useBatchSalaryAdvances';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

const BatchAdvancesPage = () => {
  const { id: batchId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: advances = [], isLoading } = useBatchSalaryAdvances(batchId || '');
  const deleteMutation = useDeleteBatchSalaryAdvance();

  const [search, setSearch] = useState('');
  const [filterOperation, setFilterOperation] = useState('all');
  const [filterStyle, setFilterStyle] = useState('all');

  // Get style names
  const styleIds = useMemo(() => [...new Set(advances.map(a => a.style_id))], [advances]);
  const { data: styles = [] } = useQuery({
    queryKey: ['styles-for-advances', styleIds],
    queryFn: async () => {
      if (styleIds.length === 0) return [];
      const { data, error } = await supabase.from('job_styles').select('id, style_code, style_name').in('id', styleIds);
      if (error) throw error;
      return data;
    },
    enabled: styleIds.length > 0,
  });

  const operations = useMemo(() => [...new Set(advances.map(a => a.operation))], [advances]);

  const filtered = useMemo(() => {
    return advances.filter(a => {
      if (filterOperation !== 'all' && a.operation !== filterOperation) return false;
      if (filterStyle !== 'all' && a.style_id !== filterStyle) return false;
      if (search) {
        const s = search.toLowerCase();
        const styleName = styles.find(st => st.id === a.style_id)?.style_name || '';
        return (
          a.operation.toLowerCase().includes(s) ||
          a.description.toLowerCase().includes(s) ||
          styleName.toLowerCase().includes(s) ||
          (a.notes || '').toLowerCase().includes(s)
        );
      }
      return true;
    });
  }, [advances, filterOperation, filterStyle, search, styles]);

  const totalAdvanced = filtered.reduce((sum, a) => sum + Number(a.amount), 0);

  const getStyleLabel = (id: string) => {
    const s = styles.find(st => st.id === id);
    return s ? `${s.style_code} — ${s.style_name}` : id;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Banknote className="h-6 w-6 text-primary" />
            Salary Advances
          </h1>
          <p className="text-sm text-muted-foreground">All advance payments recorded for this batch</p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Total Advances</div>
            <div className="text-2xl font-bold text-primary">₹{totalAdvanced.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Total Records</div>
            <div className="text-2xl font-bold">{filtered.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Operations</div>
            <div className="text-2xl font-bold">{operations.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by operation, style, notes..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterOperation} onValueChange={setFilterOperation}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Operations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Operations</SelectItem>
                {operations.map(op => (
                  <SelectItem key={op} value={op}>{op}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStyle} onValueChange={setFilterStyle}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Styles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Styles</SelectItem>
                {styles.map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.style_code} — {s.style_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Style</TableHead>
                <TableHead>Operation</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount (₹)</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Loading...</TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No advances found.</TableCell>
                </TableRow>
              ) : (
                filtered.map(adv => (
                  <TableRow key={adv.id}>
                    <TableCell className="text-sm">{format(new Date(adv.advance_date), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">{getStyleLabel(adv.style_id)}</Badge>
                    </TableCell>
                    <TableCell className="font-medium text-sm">{adv.operation}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{adv.description || '—'}</TableCell>
                    <TableCell className="text-right font-bold text-sm">₹{Number(adv.amount).toFixed(2)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">{adv.notes || '—'}</TableCell>
                    <TableCell>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-destructive"
                        onClick={() => deleteMutation.mutate({ id: adv.id, batchId: batchId || '' })}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default BatchAdvancesPage;
