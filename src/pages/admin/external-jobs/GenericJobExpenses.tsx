import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Plus, Pencil, Trash2, Search, Receipt, 
  TrendingUp, Calendar, DollarSign, Eye, EyeOff, Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  useGenericJobExpenses, 
  useGenericJobExpenseStats,
  useCreateGenericJobExpense,
  useUpdateGenericJobExpense,
  useDeleteGenericJobExpense,
  GenericJobExpense,
  CreateGenericJobExpenseData
} from "@/hooks/useGenericJobExpenses";
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from "@/lib/expenseCategories";
import { GenericExpenseDetailsDialog } from "@/components/admin/external-jobs/GenericExpenseDetailsDialog";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from "recharts";

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6'];

const formatAmount = (amount: number, visible: boolean) => {
  return visible ? `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}` : '₹****';
};

const GenericJobExpenses = () => {
  const navigate = useNavigate();
  const [amountsVisible, setAmountsVisible] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<GenericJobExpense | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewingExpense, setViewingExpense] = useState<GenericJobExpense | null>(null);

  // Form state
  const [formData, setFormData] = useState<CreateGenericJobExpenseData>({
    date: new Date().toISOString().split('T')[0],
    expense_time: new Date().toTimeString().slice(0, 5),
    category: '',
    subcategory: null,
    description: '',
    amount: 0,
    supplier_name: null,
    bill_number: null,
    payment_method: null,
    notes: null,
  });

  const { data: expenses, isLoading } = useGenericJobExpenses();
  const { data: stats, isLoading: statsLoading } = useGenericJobExpenseStats();
  const createMutation = useCreateGenericJobExpense();
  const updateMutation = useUpdateGenericJobExpense();
  const deleteMutation = useDeleteGenericJobExpense();

  const filteredExpenses = expenses?.filter(exp => {
    const matchesSearch = 
      exp.description?.toLowerCase().includes(search.toLowerCase()) ||
      exp.supplier_name?.toLowerCase().includes(search.toLowerCase()) ||
      exp.bill_number?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || exp.category === categoryFilter;
    return matchesSearch && matchesCategory;
  }) || [];

  const handleOpenDialog = (expense?: GenericJobExpense) => {
    if (expense) {
      setEditingExpense(expense);
      setFormData({
        date: expense.date,
        expense_time: expense.expense_time,
        category: expense.category,
        subcategory: expense.subcategory,
        description: expense.description,
        amount: expense.amount,
        supplier_name: expense.supplier_name,
        bill_number: expense.bill_number,
        payment_method: expense.payment_method,
        notes: expense.notes,
      });
    } else {
      setEditingExpense(null);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        expense_time: new Date().toTimeString().slice(0, 5),
        category: '',
        subcategory: null,
        description: '',
        amount: 0,
        supplier_name: null,
        bill_number: null,
        payment_method: null,
        notes: null,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.category || !formData.description || formData.amount <= 0) {
      return;
    }

    if (editingExpense) {
      await updateMutation.mutateAsync({ id: editingExpense.id, data: formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
    setIsDialogOpen(false);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteMutation.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  const getCategoryLabel = (categoryKey: string) => {
    const category = EXPENSE_CATEGORIES[categoryKey as keyof typeof EXPENSE_CATEGORIES];
    return category?.label || categoryKey;
  };

  const getSubcategories = (categoryKey: string) => {
    const category = EXPENSE_CATEGORIES[categoryKey as keyof typeof EXPENSE_CATEGORIES];
    return category?.subcategories || [];
  };

  if (isLoading || statsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  const safeStats = {
    totalExpenses: stats?.totalExpenses || 0,
    thisMonthExpenses: stats?.thisMonthExpenses || 0,
    lastMonthExpenses: stats?.lastMonthExpenses || 0,
    avgMonthlyExpense: stats?.avgMonthlyExpense || 0,
    categoryData: stats?.categoryData || [],
    monthlyTrend: stats?.monthlyTrend || [],
    totalCount: stats?.totalCount || 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/admin/external-jobs")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Generic Job Expenses</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Manage overhead expenses for job orders
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAmountsVisible(!amountsVisible)}
            className="gap-2"
          >
            {amountsVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {amountsVisible ? 'Hide' : 'Show'}
          </Button>
          <Button onClick={() => handleOpenDialog()} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Expense
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 sm:p-6 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-red-200 dark:border-red-800">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-3 bg-red-500/20 rounded-lg shrink-0">
              <Receipt className="h-5 w-5 sm:h-6 sm:w-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-red-700 dark:text-red-300 truncate">Total Expenses</p>
              <p className="text-xl sm:text-2xl font-bold text-red-900 dark:text-red-100 truncate">
                {formatAmount(safeStats.totalExpenses, amountsVisible)}
              </p>
              <p className="text-xs text-red-600 dark:text-red-400">{safeStats.totalCount} entries</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-3 bg-orange-500/20 rounded-lg shrink-0">
              <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-orange-700 dark:text-orange-300 truncate">This Month</p>
              <p className="text-xl sm:text-2xl font-bold text-orange-900 dark:text-orange-100 truncate">
                {formatAmount(safeStats.thisMonthExpenses, amountsVisible)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 border-amber-200 dark:border-amber-800">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-3 bg-amber-500/20 rounded-lg shrink-0">
              <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-amber-700 dark:text-amber-300 truncate">Last Month</p>
              <p className="text-xl sm:text-2xl font-bold text-amber-900 dark:text-amber-100 truncate">
                {formatAmount(safeStats.lastMonthExpenses, amountsVisible)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-3 bg-purple-500/20 rounded-lg shrink-0">
              <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-purple-700 dark:text-purple-300 truncate">Avg Monthly</p>
              <p className="text-xl sm:text-2xl font-bold text-purple-900 dark:text-purple-100 truncate">
                {formatAmount(safeStats.avgMonthlyExpense, amountsVisible)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Expenses by Category</h3>
          {safeStats.categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={safeStats.categoryData.slice(0, 8)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${getCategoryLabel(name)}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {safeStats.categoryData.slice(0, 8).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Amount']}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No expense data available
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Monthly Trend (Last 6 Months)</h3>
          {safeStats.monthlyTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={safeStats.monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" tickFormatter={(value) => `₹${(value/1000).toFixed(0)}k`} />
                <Tooltip 
                  formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Amount']}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar dataKey="amount" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No trend data available
            </div>
          )}
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by description, supplier, or bill number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {Object.entries(EXPENSE_CATEGORIES).map(([key, cat]) => (
                <SelectItem key={key} value={key}>{cat.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Expenses Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Bill No</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExpenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No expenses found
                  </TableCell>
                </TableRow>
              ) : (
                filteredExpenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell className="whitespace-nowrap">
                      {new Date(expense.date).toLocaleDateString('en-IN')}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{getCategoryLabel(expense.category)}</p>
                        {expense.subcategory && (
                          <p className="text-xs text-muted-foreground">{expense.subcategory}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">{expense.description}</TableCell>
                    <TableCell>{expense.supplier_name || '-'}</TableCell>
                    <TableCell>{expense.bill_number || '-'}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatAmount(expense.amount, amountsVisible)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setViewingExpense(expense)}
                          title="View details"
                        >
                          <Eye className="h-4 w-4 text-primary" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(expense)}
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(expense.id)}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingExpense ? 'Edit Expense' : 'Add New Expense'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expense_time">Time</Label>
                <Input
                  id="expense_time"
                  type="time"
                  value={formData.expense_time || ''}
                  onChange={(e) => setFormData({ ...formData, expense_time: e.target.value || null })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(val) => setFormData({ ...formData, category: val, subcategory: null })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(EXPENSE_CATEGORIES).map(([key, cat]) => (
                      <SelectItem key={key} value={key}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subcategory">Subcategory</Label>
                <Select 
                  value={formData.subcategory || ''} 
                  onValueChange={(val) => setFormData({ ...formData, subcategory: val || null })}
                  disabled={!formData.category}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select subcategory" />
                  </SelectTrigger>
                  <SelectContent>
                    {getSubcategories(formData.category).map((sub) => (
                      <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter expense description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="supplier_name">Supplier Name</Label>
                <Input
                  id="supplier_name"
                  value={formData.supplier_name || ''}
                  onChange={(e) => setFormData({ ...formData, supplier_name: e.target.value || null })}
                  placeholder="Supplier name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bill_number">Bill Number</Label>
                <Input
                  id="bill_number"
                  value={formData.bill_number || ''}
                  onChange={(e) => setFormData({ ...formData, bill_number: e.target.value || null })}
                  placeholder="Bill/Invoice number"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_method">Payment Method</Label>
              <Select 
                value={formData.payment_method || ''} 
                onValueChange={(val) => setFormData({ ...formData, payment_method: val || null })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((method) => (
                    <SelectItem key={method} value={method}>
                      {method.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value || null })}
                placeholder="Additional notes"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!formData.category || !formData.description || formData.amount <= 0}
            >
              {editingExpense ? 'Update' : 'Add'} Expense
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Expense</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this expense? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View Details Dialog */}
      <GenericExpenseDetailsDialog
        expense={viewingExpense}
        open={!!viewingExpense}
        onOpenChange={(open) => !open && setViewingExpense(null)}
      />
    </div>
  );
};

export default GenericJobExpenses;
