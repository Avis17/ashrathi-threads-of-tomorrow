import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import {
  IndianRupee, Plus, Banknote, Trash2, Loader2, TrendingUp, Wallet, Receipt, PiggyBank, ExternalLink, Pencil, Filter, CalendarIcon, X,
} from 'lucide-react';
import { useBatchSalaryEntries, useDeleteBatchSalary, BatchSalaryEntry } from '@/hooks/useBatchSalary';
import { useBatchSalaryAdvances, useDeleteBatchSalaryAdvance, BatchSalaryAdvance } from '@/hooks/useBatchSalaryAdvances';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { format, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { RecordSalaryDialog } from './RecordSalaryDialog';
import { GiveAdvanceDialog } from './GiveAdvanceDialog';
import { FinalizedRatesCard } from './FinalizedRatesCard';

interface StyleInfo {
  id: string;
  style_code: string;
  style_name: string;
}

interface Props {
  batchId: string;
  rollsData: any[];
  cuttingSummary: Record<number, number>;
  totalCutPieces?: number;
}

export const BatchSalarySection = ({ batchId, rollsData, cuttingSummary, totalCutPieces = 0 }: Props) => {
  const navigate = useNavigate();
  const [showSalaryDialog, setShowSalaryDialog] = useState(false);
  const [showAdvanceDialog, setShowAdvanceDialog] = useState(false);
  const [editingEntry, setEditingEntry] = useState<BatchSalaryEntry | null>(null);
  const [editingAdvance, setEditingAdvance] = useState<BatchSalaryAdvance | null>(null);
  const [operationFilter, setOperationFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [advOperationFilter, setAdvOperationFilter] = useState<string>('all');
  const [advDateRange, setAdvDateRange] = useState<DateRange | undefined>(undefined);

  const { data: existingEntries = [], isLoading: loadingEntries } = useBatchSalaryEntries(batchId);
  const { data: allAdvances = [], isLoading: loadingAdvances } = useBatchSalaryAdvances(batchId);
  const deleteMutation = useDeleteBatchSalary();
  const deleteAdvanceMutation = useDeleteBatchSalaryAdvance();

  // Build style groups from rolls
  const styleGroups = useMemo(() => {
    const groups: Record<string, { styleId: string; typeIndices: number[] }> = {};
    rollsData.forEach((type, idx) => {
      const sid = type.style_id;
      if (!sid) return;
      if (!groups[sid]) groups[sid] = { styleId: sid, typeIndices: [] };
      groups[sid].typeIndices.push(idx);
    });
    return Object.values(groups);
  }, [rollsData]);

  const styleIds = styleGroups.map(g => g.styleId);

  const { data: styles = [] } = useQuery({
    queryKey: ['styles-for-salary', styleIds],
    queryFn: async () => {
      if (styleIds.length === 0) return [];
      const { data, error } = await supabase
        .from('job_styles')
        .select('id, style_code, style_name')
        .in('id', styleIds);
      if (error) throw error;
      return data as StyleInfo[];
    },
    enabled: styleIds.length > 0,
  });

  // Style options with cut pieces
  const styleOptions = useMemo(() => {
    return styleGroups.map(g => {
      const style = styles.find(s => s.id === g.styleId);
      const totalPieces = g.typeIndices.reduce((sum, idx) => sum + (cuttingSummary[idx] || 0), 0);
      return {
        id: g.styleId,
        style_code: style?.style_code || 'Unknown',
        style_name: style?.style_name || 'Unknown',
        totalCutPieces: totalPieces,
      };
    });
  }, [styleGroups, styles, cuttingSummary]);

  // Stats calculations
  const totalSalary = existingEntries.reduce((sum, e) => sum + (e.rate_per_piece * e.quantity), 0);
  const totalPaidAmount = existingEntries.reduce((sum, e) => sum + e.paid_amount, 0);
  const totalAdvances = allAdvances.reduce((sum, a) => sum + Number(a.amount), 0);
  const totalPaid = totalPaidAmount + totalAdvances;
  const totalBalance = totalSalary - totalAdvances;
  const perPieceCost = existingEntries.reduce((sum, e) => sum + e.rate_per_piece, 0);
  const entryCount = existingEntries.length;
  const advanceCount = allAdvances.length;

  // Unique operations for filter
  const uniqueOperations = useMemo(() => {
    const ops = new Set(existingEntries.map(e => e.operation));
    return Array.from(ops).sort();
  }, [existingEntries]);

  // Filtered entries
  const filteredEntries = useMemo(() => {
    return existingEntries.filter(entry => {
      if (operationFilter !== 'all' && entry.operation !== operationFilter) return false;
      if (dateRange?.from) {
        const entryDate = new Date(entry.updated_at);
        const from = startOfDay(dateRange.from);
        const to = dateRange.to ? endOfDay(dateRange.to) : endOfDay(dateRange.from);
        if (!isWithinInterval(entryDate, { start: from, end: to })) return false;
      }
      return true;
    });
  }, [existingEntries, operationFilter, dateRange]);

  const hasActiveFilters = operationFilter !== 'all' || !!dateRange?.from;

  const clearFilters = () => {
    setOperationFilter('all');
    setDateRange(undefined);
  };

  // Advance filters
  const uniqueAdvanceOperations = useMemo(() => {
    const ops = new Set(allAdvances.map(a => a.operation));
    return Array.from(ops).sort();
  }, [allAdvances]);

  const filteredAdvances = useMemo(() => {
    return allAdvances.filter(adv => {
      if (advOperationFilter !== 'all' && adv.operation !== advOperationFilter) return false;
      if (advDateRange?.from) {
        const advDate = new Date(adv.advance_date);
        const from = startOfDay(advDateRange.from);
        const to = advDateRange.to ? endOfDay(advDateRange.to) : endOfDay(advDateRange.from);
        if (!isWithinInterval(advDate, { start: from, end: to })) return false;
      }
      return true;
    });
  }, [allAdvances, advOperationFilter, advDateRange]);

  const hasAdvanceFilters = advOperationFilter !== 'all' || !!advDateRange?.from;

  const clearAdvanceFilters = () => {
    setAdvOperationFilter('all');
    setAdvDateRange(undefined);
  };

  const getStyleName = (styleId: string) => {
    const s = styles.find(st => st.id === styleId);
    return s ? s.style_code : 'Unknown';
  };

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync({ id, batchId });
  };

  const handleDeleteAdvance = async (id: string) => {
    await deleteAdvanceMutation.mutateAsync({ id, batchId });
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <IndianRupee className="h-5 w-5 mx-auto mb-1 text-primary" />
            <div className="text-xs text-muted-foreground">Total Salary</div>
            <div className="text-lg font-bold">₹{totalSalary.toFixed(0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Banknote className="h-5 w-5 mx-auto mb-1 text-amber-500" />
            <div className="text-xs text-muted-foreground">Total Advances</div>
            <div className="text-lg font-bold text-amber-600">₹{totalAdvances.toFixed(0)}</div>
            <div className="text-[10px] text-muted-foreground">{advanceCount} txn{advanceCount !== 1 ? 's' : ''}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Wallet className="h-5 w-5 mx-auto mb-1 text-emerald-500" />
            <div className="text-xs text-muted-foreground">Total Paid</div>
            <div className="text-lg font-bold text-emerald-600">₹{totalPaid.toFixed(0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <Receipt className="h-5 w-5 mx-auto mb-1 text-orange-500" />
            <div className="text-xs text-muted-foreground text-center mb-2">Cost/Piece by Op</div>
            <div className="space-y-1 max-h-[80px] overflow-y-auto">
              {(() => {
                const opMap: Record<string, number> = {};
                existingEntries.forEach(e => {
                  opMap[e.operation] = (opMap[e.operation] || 0) + e.rate_per_piece;
                });
                const ops = Object.entries(opMap);
                if (ops.length === 0) return <div className="text-xs text-muted-foreground text-center">No data</div>;
                return ops.map(([op, amt]) => (
                  <div key={op} className="flex justify-between text-[11px]">
                    <span className="text-muted-foreground truncate mr-1">{op}</span>
                    <span className="font-semibold text-orange-600 whitespace-nowrap">₹{amt.toFixed(2)}</span>
                  </div>
                ));
              })()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-5 w-5 mx-auto mb-1 text-blue-500" />
            <div className="text-xs text-muted-foreground">Per Piece Cost</div>
            <div className="text-lg font-bold text-blue-600">₹{perPieceCost.toFixed(2)}</div>
            <div className="text-[10px] text-muted-foreground">{totalCutPieces} pcs</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <PiggyBank className="h-5 w-5 mx-auto mb-1 text-violet-500" />
            <div className="text-xs text-muted-foreground">Entries</div>
            <div className="text-lg font-bold text-violet-600">{entryCount}</div>
            <div className="text-[10px] text-muted-foreground">salary records</div>
          </CardContent>
        </Card>
      </div>

      {/* Finalized Rates */}
      <FinalizedRatesCard batchId={batchId} />

      {/* Header + Actions */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <IndianRupee className="h-5 w-5 text-primary" />
          Salary Management
        </h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/admin/job-management/batch/${batchId}/advances`)}
          >
            <ExternalLink className="h-4 w-4 mr-1" />
            Advance History
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowAdvanceDialog(true)}>
            <Banknote className="h-4 w-4 mr-1" />
            Give Advance
          </Button>
          <Button size="sm" onClick={() => setShowSalaryDialog(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Record Salary
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={operationFilter} onValueChange={setOperationFilter}>
            <SelectTrigger className="w-[180px] h-9">
              <SelectValue placeholder="All Operations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Operations</SelectItem>
              {uniqueOperations.map(op => (
                <SelectItem key={op} value={op}>{op}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className={cn("h-9 justify-start text-left font-normal", !dateRange?.from && "text-muted-foreground")}>
              <CalendarIcon className="h-4 w-4 mr-2" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>{format(dateRange.from, 'dd/MM/yy')} – {format(dateRange.to, 'dd/MM/yy')}</>
                ) : format(dateRange.from, 'dd/MM/yy')
              ) : 'Date Range'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={setDateRange}
              numberOfMonths={2}
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9 text-muted-foreground">
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}

        {hasActiveFilters && (
          <span className="text-xs text-muted-foreground">
            Showing {filteredEntries.length} of {existingEntries.length} entries
          </span>
        )}
      </div>

      {/* Recorded Entries List */}
      <Card>
        <CardContent className="p-0">
          {loadingEntries ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : existingEntries.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <IndianRupee className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">No salary entries recorded yet</p>
              <p className="text-xs mt-1">Click "Record Salary" to add the first entry</p>
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Filter className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No entries match the current filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Style</TableHead>
                    <TableHead>Operation</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Pieces</TableHead>
                    <TableHead className="text-right">Rate (₹)</TableHead>
                    <TableHead className="text-right">Amount (₹)</TableHead>
                    <TableHead className="text-right">Paid (₹)</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEntries.map(entry => {
                    const amount = entry.rate_per_piece * entry.quantity;
                    return (
                      <TableRow key={entry.id}>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">
                            {getStyleName(entry.style_id)}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium text-sm">{entry.operation}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{entry.description || '—'}</TableCell>
                        <TableCell className="text-right text-sm">{entry.quantity}</TableCell>
                        <TableCell className="text-right text-sm">₹{entry.rate_per_piece.toFixed(2)}</TableCell>
                        <TableCell className="text-right font-medium text-sm">₹{amount.toFixed(2)}</TableCell>
                        <TableCell className="text-right text-sm">
                          <span className="text-emerald-600 font-medium">₹{entry.paid_amount.toFixed(2)}</span>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                          {entry.notes || '—'}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {format(new Date(entry.updated_at), 'dd/MM/yy')}
                        </TableCell>
                        <TableCell className="flex gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={() => {
                              setEditingEntry(entry);
                              setShowSalaryDialog(true);
                            }}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-destructive"
                            onClick={() => handleDelete(entry.id)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Advance Entries Summary */}
      {allAdvances.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Banknote className="h-4 w-4 text-amber-500" />
              Recent Advances ({allAdvances.length})
            </h4>

            {/* Advance Filters */}
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={advOperationFilter} onValueChange={setAdvOperationFilter}>
                  <SelectTrigger className="w-[180px] h-9">
                    <SelectValue placeholder="All Operations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Operations</SelectItem>
                    {uniqueAdvanceOperations.map(op => (
                      <SelectItem key={op} value={op}>{op}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className={cn("h-9 justify-start text-left font-normal", !advDateRange?.from && "text-muted-foreground")}>
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {advDateRange?.from ? (
                      advDateRange.to ? (
                        <>{format(advDateRange.from, 'dd/MM/yy')} – {format(advDateRange.to, 'dd/MM/yy')}</>
                      ) : format(advDateRange.from, 'dd/MM/yy')
                    ) : 'Date Range'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={advDateRange}
                    onSelect={setAdvDateRange}
                    numberOfMonths={2}
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>

              {hasAdvanceFilters && (
                <Button variant="ghost" size="sm" onClick={clearAdvanceFilters} className="h-9 text-muted-foreground">
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              )}

              {hasAdvanceFilters && (
                <span className="text-xs text-muted-foreground">
                  Showing {filteredAdvances.length} of {allAdvances.length} advances
                </span>
              )}
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Style</TableHead>
                    <TableHead>Operation</TableHead>
                    <TableHead className="text-right">Amount (₹)</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAdvances.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-muted-foreground text-sm">
                        {hasAdvanceFilters ? 'No advances match the current filters' : 'No advances'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAdvances.map(adv => (
                      <TableRow key={adv.id}>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {getStyleName(adv.style_id)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{adv.operation}</TableCell>
                        <TableCell className="text-right font-medium text-sm text-amber-600">
                          ₹{Number(adv.amount).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {format(new Date(adv.advance_date), 'dd/MM/yy')}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{adv.notes || '—'}</TableCell>
                        <TableCell className="flex gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={() => {
                              setEditingAdvance(adv);
                              setShowAdvanceDialog(true);
                            }}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-destructive"
                            onClick={() => handleDeleteAdvance(adv.id)}
                            disabled={deleteAdvanceMutation.isPending}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialogs */}
      <RecordSalaryDialog
        open={showSalaryDialog}
        onOpenChange={(open) => {
          setShowSalaryDialog(open);
          if (!open) setEditingEntry(null);
        }}
        batchId={batchId}
        styles={styleOptions}
        editEntry={editingEntry}
      />
      <GiveAdvanceDialog
        open={showAdvanceDialog}
        onOpenChange={(open) => {
          setShowAdvanceDialog(open);
          if (!open) setEditingAdvance(null);
        }}
        batchId={batchId}
        styles={styleOptions}
        editAdvance={editingAdvance}
      />
    </div>
  );
};
