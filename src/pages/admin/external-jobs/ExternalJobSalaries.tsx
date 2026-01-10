import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  Filter, 
  Wallet, 
  TrendingUp, 
  Clock, 
  Users,
  Edit,
  Trash2,
  Eye,
  Banknote
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { 
  useExternalJobSalaries, 
  useExternalJobSalaryStats,
  useDeleteExternalJobSalary,
  SALARY_OPERATIONS,
  ExternalJobSalary
} from "@/hooks/useExternalJobSalaries";
import { SalaryEntryForm } from "@/components/admin/external-jobs/SalaryEntryForm";
import { SalaryDetailView } from "@/components/admin/external-jobs/SalaryDetailView";
import { TrackAdvances } from "@/components/admin/external-jobs/TrackAdvances";

const ExternalJobSalaries = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [operationFilter, setOperationFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSalary, setEditingSalary] = useState<ExternalJobSalary | null>(null);
  const [viewingSalary, setViewingSalary] = useState<ExternalJobSalary | null>(null);
  const [deletingSalaryId, setDeletingSalaryId] = useState<string | null>(null);
  const [showAdvances, setShowAdvances] = useState(false);
  
  const { data: salaries, isLoading } = useExternalJobSalaries();
  const { data: stats } = useExternalJobSalaryStats();
  const deleteMutation = useDeleteExternalJobSalary();
  
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  const filteredSalaries = salaries?.filter(salary => {
    const matchesSearch = 
      salary.job_order?.job_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      salary.job_order?.style_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      salary.employee?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      salary.operation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      salary.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesOperation = operationFilter === "all" || salary.operation === operationFilter;
    const matchesStatus = statusFilter === "all" || salary.payment_status === statusFilter;
    
    return matchesSearch && matchesOperation && matchesStatus;
  }) || [];
  
  const handleDelete = async () => {
    if (deletingSalaryId) {
      await deleteMutation.mutateAsync(deletingSalaryId);
      setDeletingSalaryId(null);
    }
  };
  
  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingSalary(null);
  };
  
  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Paid</Badge>;
      case 'partial':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Partial</Badge>;
      default:
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Pending</Badge>;
    }
  };
  
  if (showAdvances) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setShowAdvances(false)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Track Advances</h1>
              <p className="text-muted-foreground mt-1">
                Manage advance payments given to tailors
              </p>
            </div>
          </div>
        </div>
        <TrackAdvances />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate("/admin/external-jobs")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Salary Management</h1>
            <p className="text-muted-foreground mt-1">
              Track and manage operation-based salary payments
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowAdvances(true)} className="gap-2">
            <Banknote className="h-4 w-4" />
            Track Advance
          </Button>
          <Button onClick={() => setIsFormOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Salary Entry
          </Button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30 border-green-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-500/20 rounded-lg">
              <Wallet className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-green-700 dark:text-green-300">Total Paid</p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                {formatAmount(stats?.totalSalaryPaid || 0)}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/30 border-red-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-500/20 rounded-lg">
              <Clock className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-red-700 dark:text-red-300">Pending</p>
              <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                {formatAmount(stats?.totalSalaryPending || 0)}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 border-blue-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-blue-700 dark:text-blue-300">This Month</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {formatAmount(stats?.thisMonthTotal || 0)}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30 border-purple-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-purple-700 dark:text-purple-300">Total Entries</p>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                {stats?.totalEntries || 0}
              </p>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by job ID, style, employee, operation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={operationFilter} onValueChange={setOperationFilter}>
            <SelectTrigger className="w-full md:w-[200px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Operation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Operations</SelectItem>
              {SALARY_OPERATIONS.map(op => (
                <SelectItem key={op} value={op}>{op}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="partial">Partial</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>
      
      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Job ID</TableHead>
              <TableHead>Style</TableHead>
              <TableHead>Employee</TableHead>
              <TableHead>Operation</TableHead>
              <TableHead className="text-right">Pieces</TableHead>
              <TableHead className="text-right">Rate</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredSalaries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                  No salary entries found
                </TableCell>
              </TableRow>
            ) : (
              filteredSalaries.map((salary) => (
                <TableRow key={salary.id}>
                  <TableCell>
                    {format(new Date(salary.payment_date), 'dd MMM yyyy')}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-mono text-sm">{salary.job_order?.job_id || '-'}</p>
                      <p className="text-xs text-muted-foreground">
                        {salary.job_order?.company?.company_name || '-'}
                      </p>
                      {getStatusBadge(salary.payment_status)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[150px] truncate" title={salary.job_order?.style_name}>
                      {salary.job_order?.style_name || '-'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{salary.employee?.name || '-'}</p>
                      {salary.employee?.contractor && (
                        <p className="text-xs text-muted-foreground">
                          {salary.employee.contractor.contractor_name}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{salary.operation}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {salary.number_of_pieces}
                  </TableCell>
                  <TableCell className="text-right">
                    ₹{salary.rate_per_piece}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatAmount(salary.total_amount)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(salary.payment_status)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setViewingSalary(salary)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingSalary(salary);
                          setIsFormOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeletingSalaryId(salary.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
      
      {/* Add/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={handleFormClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingSalary ? 'Edit Salary Entry' : 'Add Salary Entry'}
            </DialogTitle>
          </DialogHeader>
          <SalaryEntryForm
            salary={editingSalary}
            onSuccess={handleFormClose}
            onCancel={handleFormClose}
          />
        </DialogContent>
      </Dialog>
      
      {/* View Dialog */}
      <Dialog open={!!viewingSalary} onOpenChange={() => setViewingSalary(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Salary Entry Details</DialogTitle>
          </DialogHeader>
          {viewingSalary && <SalaryDetailView salary={viewingSalary} />}
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingSalaryId} onOpenChange={() => setDeletingSalaryId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Salary Entry?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the salary entry.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ExternalJobSalaries;
