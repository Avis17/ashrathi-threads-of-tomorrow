import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { formatCurrency, cn } from '@/lib/utils';
import { format, parseISO, startOfDay, endOfDay } from 'date-fns';
import {
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  CalendarIcon,
  Building2,
  IndianRupee,
  Receipt,
  TrendingUp,
} from 'lucide-react';

interface CompanyExpense {
  id: string;
  cash_request_id: string;
  employee_code: string | null;
  category: string;
  item_name: string;
  amount: number;
  date: string;
  note: string | null;
  supplier_name: string | null;
  batch_number: string | null;
  created_at: string;
}

export default function CompanyExpenses() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();

  const { data: expenses = [], isLoading, refetch } = useQuery({
    queryKey: ['company-expenses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_expenses')
        .select('*')
        .order('date', { ascending: false });
      if (error) throw error;
      return (data || []) as CompanyExpense[];
    },
  });

  const categories = useMemo(() => [...new Set(expenses.map((e) => e.category))].sort(), [expenses]);

  const filtered = useMemo(() => {
    return expenses.filter((e) => {
      if (categoryFilter !== 'all' && e.category !== categoryFilter) return false;
      if (dateFrom || dateTo) {
        const expDate = parseISO(e.date);
        if (dateFrom && expDate < startOfDay(dateFrom)) return false;
        if (dateTo && expDate > endOfDay(dateTo)) return false;
      }
      if (search) {
        const q = search.toLowerCase();
        return (
          e.item_name.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q) ||
          (e.employee_code || '').toLowerCase().includes(q) ||
          (e.supplier_name || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [expenses, categoryFilter, dateFrom, dateTo, search]);

  const stats = useMemo(() => {
    const totalAmount = expenses.reduce((s, e) => s + Number(e.amount), 0);
    const filteredAmount = filtered.reduce((s, e) => s + Number(e.amount), 0);
    const byCategory: Record<string, number> = {};
    expenses.forEach((e) => {
      byCategory[e.category] = (byCategory[e.category] || 0) + Number(e.amount);
    });
    return { totalAmount, totalCount: expenses.length, filteredAmount, filteredCount: filtered.length, byCategory };
  }, [expenses, filtered]);

  const clearFilters = () => {
    setSearch('');
    setCategoryFilter('all');
    setDateFrom(undefined);
    setDateTo(undefined);
  };

  const hasActiveFilters = search || categoryFilter !== 'all' || dateFrom || dateTo;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Company Expenses</h1>
          <p className="text-muted-foreground mt-1">Non-batch related company expenses from approved bills</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Expenses</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(stats.totalAmount)}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stats.totalCount} entries</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <IndianRupee className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Categories</p>
                <p className="text-2xl font-bold mt-1">{categories.length}</p>
                <p className="text-xs text-muted-foreground mt-0.5">unique categories</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <Receipt className="h-5 w-5 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Filtered Total</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(stats.filteredAmount)}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stats.filteredCount} entries</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-5 pb-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filters</span>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 text-xs ml-auto">
                Clear all
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search item, category, code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("justify-start text-left font-normal", !dateFrom && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFrom ? format(dateFrom, 'dd MMM yyyy') : 'From date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} initialFocus className="p-3 pointer-events-auto" />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("justify-start text-left font-normal", !dateTo && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateTo ? format(dateTo, 'dd MMM yyyy') : 'To date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={dateTo} onSelect={setDateTo} initialFocus className="p-3 pointer-events-auto" />
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading expenses...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <AlertCircle className="h-10 w-10 mb-3" />
              <p className="font-medium">No expenses found</p>
              <p className="text-sm">Company expenses will appear here when bills with batch "COMPANY" are approved</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Employee Code</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Item / Reason</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Note</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell className="text-sm whitespace-nowrap">
                      {(() => {
                        try { return format(parseISO(expense.date), 'dd MMM yyyy'); } catch { return expense.date; }
                      })()}
                    </TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground">{expense.employee_code || '-'}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-normal">{expense.category}</Badge>
                    </TableCell>
                    <TableCell className="max-w-[250px] truncate">{expense.item_name}</TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">{formatCurrency(Number(expense.amount))}</TableCell>
                    <TableCell className="max-w-[150px] truncate text-sm text-muted-foreground">{expense.note || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
