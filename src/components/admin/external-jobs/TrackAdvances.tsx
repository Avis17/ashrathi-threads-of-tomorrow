import { useState } from "react";
import { 
  Plus, 
  Search, 
  Filter,
  Edit,
  Trash2,
  Wallet,
  Clock,
  CheckCircle
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
import { SALARY_OPERATIONS } from "@/hooks/useExternalJobSalaries";
import { 
  useSalaryAdvances, 
  useSalaryAdvanceStats,
  useDeleteSalaryAdvance,
  SalaryAdvanceEntry
} from "@/hooks/useSalaryAdvances";
import { AdvanceEntryForm } from "./AdvanceEntryForm";

export const TrackAdvances = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [operationFilter, setOperationFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAdvance, setEditingAdvance] = useState<SalaryAdvanceEntry | null>(null);
  const [deletingAdvanceId, setDeletingAdvanceId] = useState<string | null>(null);
  
  const { data: advances, isLoading } = useSalaryAdvances();
  const { data: stats } = useSalaryAdvanceStats();
  const deleteMutation = useDeleteSalaryAdvance();
  
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  const filteredAdvances = advances?.filter(advance => {
    const matchesSearch = 
      advance.employee?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      advance.operation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      advance.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesOperation = operationFilter === "all" || advance.operation === operationFilter;
    const matchesStatus = statusFilter === "all" || advance.status === statusFilter;
    
    return matchesSearch && matchesOperation && matchesStatus;
  }) || [];
  
  const handleDelete = async () => {
    if (deletingAdvanceId) {
      await deleteMutation.mutateAsync(deletingAdvanceId);
      setDeletingAdvanceId(null);
    }
  };
  
  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingAdvance(null);
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'closed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Closed</Badge>;
      default:
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Open</Badge>;
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/30 border-amber-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/20 rounded-lg">
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-amber-700 dark:text-amber-300">Open Advances</p>
              <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                {formatAmount(stats?.totalOpen || 0)}
              </p>
              <p className="text-xs text-amber-600">{stats?.openCount || 0} entries</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30 border-green-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-500/20 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-green-700 dark:text-green-300">Closed Advances</p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                {formatAmount(stats?.totalClosed || 0)}
              </p>
              <p className="text-xs text-green-600">{stats?.closedCount || 0} entries</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 border-blue-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <Wallet className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-blue-700 dark:text-blue-300">Total Entries</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {stats?.total || 0}
              </p>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Add Button and Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <Button onClick={() => setIsFormOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Advance
        </Button>
        
        <div className="flex flex-col md:flex-row gap-4 flex-1 md:justify-end">
          <div className="relative w-full md:w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by employee, operation..."
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
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date & Time</TableHead>
              <TableHead>Employee</TableHead>
              <TableHead>Operation</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredAdvances.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No advance entries found
                </TableCell>
              </TableRow>
            ) : (
              filteredAdvances.map((advance) => (
                <TableRow key={advance.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {format(new Date(advance.advance_date), 'dd MMM yyyy')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(advance.advance_date), 'hh:mm a')}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{advance.employee?.name || '-'}</p>
                      {advance.employee?.contractor && (
                        <p className="text-xs text-muted-foreground">
                          {advance.employee.contractor.contractor_name}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{advance.operation}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold text-amber-600">
                    {formatAmount(advance.amount)}
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[200px] truncate text-muted-foreground" title={advance.notes || ''}>
                      {advance.notes || '-'}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(advance.status)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingAdvance(advance);
                          setIsFormOpen(true);
                        }}
                        disabled={advance.status === 'closed'}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeletingAdvanceId(advance.id)}
                        disabled={advance.status === 'closed'}
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingAdvance ? 'Edit Advance Entry' : 'Add Advance Entry'}
            </DialogTitle>
          </DialogHeader>
          <AdvanceEntryForm
            advance={editingAdvance}
            onSuccess={handleFormClose}
            onCancel={handleFormClose}
          />
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingAdvanceId} onOpenChange={() => setDeletingAdvanceId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Advance Entry?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the advance entry.
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
