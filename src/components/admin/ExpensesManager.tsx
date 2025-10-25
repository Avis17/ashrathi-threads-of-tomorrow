import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, CheckCircle, Eye, TrendingUp, DollarSign, Clock, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { ExpenseForm } from './expenses/ExpenseForm';
import { ExpenseDetailsDialog } from './expenses/ExpenseDetailsDialog';
import { DynamicPagination } from './DynamicPagination';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EXPENSE_CATEGORIES } from '@/lib/expenseCategories';

export default function ExpensesManager() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [viewingExpense, setViewingExpense] = useState<any>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterBranch, setFilterBranch] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const queryClient = useQueryClient();

  const { data: branches } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('branches')
        .select('id, building_name')
        .eq('is_active', true)
        .order('building_name');
      if (error) throw error;
      return data || [];
    },
  });

  const { data: expensesData, isLoading } = useQuery({
    queryKey: ['expenses', currentPage, pageSize, filterCategory, filterBranch, filterStatus],
    queryFn: async () => {
      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from('expenses')
        .select('*, branches(building_name)', { count: 'exact' });

      if (filterCategory !== 'all') {
        query = query.eq('category', filterCategory as any);
      }
      
      if (filterBranch !== 'all') {
        query = query.eq('branch_id', filterBranch);
      }

      if (filterStatus !== 'all') {
        query = query.eq('is_approved', filterStatus === 'approved');
      }

      query = query.order('expense_date', { ascending: false }).range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;
      return { expenses: data || [], count: count || 0 };
    },
  });

  const { data: allExpensesData } = useQuery({
    queryKey: ['all-expenses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expenses')
        .select('amount, is_approved, expense_date');
      if (error) throw error;
      return data || [];
    },
  });

  const stats = useMemo(() => {
    if (!allExpensesData) return null;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const totalExpenses = allExpensesData.reduce((sum, exp) => sum + Number(exp.amount), 0);
    const approvedExpenses = allExpensesData.filter(exp => exp.is_approved);
    const pendingExpenses = allExpensesData.filter(exp => !exp.is_approved);
    const approvedAmount = approvedExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
    const pendingAmount = pendingExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0);

    const currentMonthExpenses = allExpensesData.filter(exp => {
      const expDate = new Date(exp.expense_date);
      return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
    });
    const monthlyTotal = currentMonthExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0);

    return {
      totalExpenses,
      totalCount: allExpensesData.length,
      approvedCount: approvedExpenses.length,
      approvedAmount,
      pendingCount: pendingExpenses.length,
      pendingAmount,
      monthlyTotal,
    };
  }, [allExpensesData]);

  const addMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from('expenses').insert([{
        ...data,
        amount: parseFloat(data.amount),
        branch_id: data.branch_id || null,
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success('Expense added successfully');
      setIsDialogOpen(false);
    },
    onError: () => toast.error('Failed to add expense'),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase
        .from('expenses')
        .update({
          ...data,
          amount: parseFloat(data.amount),
          branch_id: data.branch_id || null,
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success('Expense updated successfully');
      setIsDialogOpen(false);
      setEditingExpense(null);
    },
    onError: () => toast.error('Failed to update expense'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('expenses').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success('Expense deleted successfully');
    },
    onError: () => toast.error('Failed to delete expense'),
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('expenses')
        .update({
          is_approved: true,
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success('Expense approved');
    },
    onError: () => toast.error('Failed to approve expense'),
  });

  const handleSubmit = (data: any) => {
    if (editingExpense) {
      updateMutation.mutate({ id: editingExpense.id, data });
    } else {
      addMutation.mutate(data);
    }
  };

  const handleEdit = (expense: any) => {
    setEditingExpense(expense);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this expense?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleView = (expense: any) => {
    setViewingExpense(expense);
    setIsViewDialogOpen(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const getCategoryLabel = (category: string) => {
    const categoryKey = category as keyof typeof EXPENSE_CATEGORIES;
    return EXPENSE_CATEGORIES[categoryKey]?.label || category;
  };

  const filteredStats = useMemo(() => {
    if (!expensesData?.expenses) return null;
    const data = expensesData.expenses;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const totalExpenses = data.reduce((sum: number, exp: any) => sum + Number(exp.amount), 0);
    const approvedExpenses = data.filter((exp: any) => exp.is_approved);
    const pendingExpenses = data.filter((exp: any) => !exp.is_approved);
    const approvedAmount = approvedExpenses.reduce((sum: number, exp: any) => sum + Number(exp.amount), 0);
    const pendingAmount = pendingExpenses.reduce((sum: number, exp: any) => sum + Number(exp.amount), 0);

    const currentMonthExpenses = data.filter((exp: any) => {
      const expDate = new Date(exp.expense_date);
      return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
    });
    const monthlyTotal = currentMonthExpenses.reduce((sum: number, exp: any) => sum + Number(exp.amount), 0);

    return {
      totalExpenses,
      totalCount: data.length,
      approvedCount: approvedExpenses.length,
      approvedAmount,
      pendingCount: pendingExpenses.length,
      pendingAmount,
      monthlyTotal,
    };
  }, [expensesData]);

  const totalPages = Math.ceil((expensesData?.count || 0) / pageSize);

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Expenses Management</h2>
        <Button
          onClick={() => {
            setEditingExpense(null);
            setIsDialogOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Expense
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalExpenses)}</div>
              <p className="text-xs text-muted-foreground mt-1">{stats.totalCount} total records</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-background border-blue-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.monthlyTotal)}</div>
              <p className="text-xs text-muted-foreground mt-1">Current month expenses</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 via-green-500/5 to-background border-green-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.approvedAmount)}</div>
              <p className="text-xs text-muted-foreground mt-1">{stats.approvedCount} approved expenses</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/10 via-orange-500/5 to-background border-orange-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.pendingAmount)}</div>
              <p className="text-xs text-muted-foreground mt-1">{stats.pendingCount} pending expenses</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtered Stats */}
      {(filterCategory !== 'all' || filterBranch !== 'all' || filterStatus !== 'all') && filteredStats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-4">
          <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Filtered Total</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(filteredStats.totalExpenses)}</div>
              <p className="text-xs text-muted-foreground mt-1">{filteredStats.totalCount} records</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-background border-blue-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Filtered This Month</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(filteredStats.monthlyTotal)}</div>
              <p className="text-xs text-muted-foreground mt-1">Current month in filter</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 via-green-500/5 to-background border-green-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Filtered Approved</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(filteredStats.approvedAmount)}</div>
              <p className="text-xs text-muted-foreground mt-1">{filteredStats.approvedCount} approved</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/10 via-orange-500/5 to-background border-orange-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Filtered Pending</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(filteredStats.pendingAmount)}</div>
              <p className="text-xs text-muted-foreground mt-1">{filteredStats.pendingCount} pending</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {Object.entries(EXPENSE_CATEGORIES).map(([key, value]) => (
                    <SelectItem key={key} value={key}>
                      {value.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Branch</label>
              <Select value={filterBranch} onValueChange={setFilterBranch}>
                <SelectTrigger>
                  <SelectValue placeholder="All Branches" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Branches</SelectItem>
                  {branches?.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.building_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <p>Loading expenses...</p>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Subcategory</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expensesData?.expenses.map((expense: any) => (
                  <TableRow key={expense.id}>
                    <TableCell>
                      {new Date(expense.expense_date).toLocaleDateString('en-IN')}
                    </TableCell>
                    <TableCell>{getCategoryLabel(expense.category)}</TableCell>
                    <TableCell>{expense.subcategory}</TableCell>
                    <TableCell>{expense.description}</TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(expense.amount)}
                    </TableCell>
                    <TableCell>
                      {expense.branches?.building_name || '-'}
                    </TableCell>
                    <TableCell>
                      {expense.is_approved ? (
                        <Badge variant="default" className="bg-green-600">
                          Approved
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Pending</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleView(expense)}
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {!expense.is_approved && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => approveMutation.mutate(expense.id)}
                            title="Approve"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(expense)}
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(expense.id)}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <DynamicPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={expensesData?.count || 0}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={handlePageSizeChange}
          />
        </>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingExpense ? 'Edit Expense' : 'Add New Expense'}
            </DialogTitle>
          </DialogHeader>
          <ExpenseForm
            expense={editingExpense}
            onSubmit={handleSubmit}
            onCancel={() => {
              setIsDialogOpen(false);
              setEditingExpense(null);
            }}
          />
        </DialogContent>
      </Dialog>

      <ExpenseDetailsDialog
        expense={viewingExpense}
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
      />
    </div>
  );
}
