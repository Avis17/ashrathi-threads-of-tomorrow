import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJobEmployee, useDeleteJobEmployee } from '@/hooks/useJobEmployees';
import { usePartPayments } from '@/hooks/usePartPayments';
import { useWeeklySettlements } from '@/hooks/useWeeklySettlements';
import { useJobProductionEntries } from '@/hooks/useJobProduction';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Edit, DollarSign, User, Phone, MapPin, Briefcase, Trash2, CheckCircle2, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import PartPaymentForm from './PartPaymentForm';
import MultiLineSettlementForm from './MultiLineSettlementForm';
import EmployeeForm from './EmployeeForm';
import EmployeePaymentRecords from './EmployeePaymentRecords';

interface EmployeeDetailsProps {
  employeeId: string;
  onClose?: () => void;
  onEdit?: () => void;
}

const EmployeeDetails = ({ employeeId, onClose, onEdit }: EmployeeDetailsProps) => {
  const navigate = useNavigate();
  const { data: employee } = useJobEmployee(employeeId);
  const { data: partPayments } = usePartPayments(employeeId);
  const { data: settlements } = useWeeklySettlements(employeeId);
  const { data: production } = useJobProductionEntries();
  const deleteMutation = useDeleteJobEmployee();
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showSettlementForm, setShowSettlementForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Calculate accumulated unsettled advances
  const unsettledAdvances = useMemo(() => 
    partPayments?.filter(p => !p.is_settled).reduce((sum, p) => sum + (p.amount || 0), 0) || 0,
    [partPayments]
  );

  // Calculate overall earnings
  const overallStats = useMemo(() => {
    const employeeProduction = production?.filter(p => p.employee_id === employeeId) || [];
    const totalProduction = employeeProduction.reduce((sum, p) => sum + (p.total_amount || 0), 0);
    const totalPartPayments = partPayments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
    const totalSettlements = settlements?.reduce((sum, s) => sum + (s.net_payable || 0), 0) || 0;
    
    return {
      totalProduction,
      totalPartPayments,
      totalSettlements,
      netBalance: totalProduction - totalPartPayments - totalSettlements,
    };
  }, [production, partPayments, settlements, employeeId]);

  const departments = employee?.departments as string[] || [];

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(employeeId);
    navigate('/admin/job-management?tab=employees');
  };

  if (!employee) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{employee.name}</h2>
          <p className="text-muted-foreground">{employee.employee_code}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={() => setShowEditForm(true)} className="gap-2">
            <Edit className="h-4 w-4" />
            Edit
          </Button>
          <Button variant="outline" onClick={() => setShowPaymentForm(true)}>
            <DollarSign className="h-4 w-4 mr-2" />
            Record Advance Payment
          </Button>
          <Button onClick={() => setShowSettlementForm(true)}>
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Record Settlement
          </Button>
          <Button variant="destructive" onClick={() => setShowDeleteDialog(true)} className="gap-2">
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Overall Earnings Card */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-secondary/5 to-background">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Overall Earnings Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Total Production</p>
              <p className="text-xl font-bold text-green-600">₹{overallStats.totalProduction.toFixed(2)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Advances Given</p>
              <p className="text-xl font-bold text-orange-600">₹{overallStats.totalPartPayments.toFixed(2)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Settlements Paid</p>
              <p className="text-xl font-bold text-blue-600">₹{overallStats.totalSettlements.toFixed(2)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Net Balance</p>
              <p className={`text-xl font-bold ${overallStats.netBalance >= 0 ? 'text-primary' : 'text-destructive'}`}>
                ₹{overallStats.netBalance.toFixed(2)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Basic Info */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Basic Information</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Type:</span>
                <Badge variant={employee.employee_type === 'direct' ? 'default' : 'secondary'}>
                  {employee.employee_type}
                </Badge>
              </div>
              {employee.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{employee.phone}</span>
                </div>
              )}
              {employee.address && (
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span className="text-muted-foreground">{employee.address}</span>
                </div>
              )}
              {employee.contractor_name && (
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Contractor:</span>
                  <span>{employee.contractor_name}</span>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold mb-4">Skills & Departments</h3>
            <div className="flex flex-wrap gap-2">
              {departments.length > 0 ? (
                departments.map((dept) => (
                  <Badge key={dept} variant="outline">{dept}</Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No departments assigned</p>
              )}
            </div>
          </Card>
        </div>

        {/* Middle Column - Unsettled Advances */}
        <div className="space-y-6">
          <Card className="p-6 bg-gradient-to-br from-amber-500/10 to-orange-500/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Unsettled Advances
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-3xl font-bold text-amber-600">
                  ₹{unsettledAdvances.toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Total advances not yet settled
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold mb-4">Recent Advances</h3>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {partPayments && partPayments.filter(p => !p.is_settled).length > 0 ? (
                partPayments.filter(p => !p.is_settled).slice(0, 10).map((payment) => (
                  <div key={payment.id} className="flex justify-between items-center text-sm p-2 hover:bg-muted/50 rounded">
                    <div>
                      <p className="font-medium">{format(new Date(payment.payment_date), 'MMM dd, yyyy')}</p>
                      <p className="text-xs text-muted-foreground">{payment.payment_mode}</p>
                    </div>
                    <span className="font-semibold">₹{payment.amount}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No unsettled advances</p>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column - Settlement History */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Settlement History</h3>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {settlements && settlements.length > 0 ? (
                settlements.slice(0, 5).map((settlement) => (
                  <div key={settlement.id} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-sm font-medium">
                          {format(new Date(settlement.settlement_date || settlement.payment_date || ''), 'MMM dd, yyyy')}
                        </p>
                        <Badge 
                          variant={settlement.payment_status === 'paid' ? 'default' : 'secondary'}
                          className="mt-1"
                        >
                          {settlement.payment_status}
                        </Badge>
                      </div>
                      <span className="font-bold text-primary">₹{settlement.net_payable?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div className="flex justify-between">
                        <span>Production:</span>
                        <span>₹{settlement.total_production_amount?.toFixed(2) || '0.00'}</span>
                      </div>
                      {settlement.advances_deducted > 0 && (
                        <div className="flex justify-between text-destructive">
                          <span>Advances Deducted:</span>
                          <span>-₹{settlement.advances_deducted?.toFixed(2) || '0.00'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">No settlements yet</p>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Payment Records */}
      <EmployeePaymentRecords 
        employeeId={employeeId} 
        employeeName={employee.name}
      />

      {/* Part Payment Dialog */}
      <Dialog open={showPaymentForm} onOpenChange={setShowPaymentForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Advance Payment</DialogTitle>
            <DialogDescription>
              Record an advance/part payment for {employee.name}
            </DialogDescription>
          </DialogHeader>
          <PartPaymentForm 
            employeeId={employeeId}
            employeeName={employee.name}
            onSuccess={() => setShowPaymentForm(false)}
            onCancel={() => setShowPaymentForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Multi-Line Settlement Dialog */}
      <Dialog open={showSettlementForm} onOpenChange={setShowSettlementForm}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Record Settlement - {employee.name}</DialogTitle>
            <DialogDescription>
              Record multiple production entries and settle payment.
            </DialogDescription>
          </DialogHeader>
          <MultiLineSettlementForm 
            employeeId={employeeId}
            employeeName={employee.name}
            onClose={() => setShowSettlementForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Employee Dialog */}
      <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
          </DialogHeader>
          <EmployeeForm 
            employee={employee}
            onClose={() => setShowEditForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {employee.name}? This will also delete:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>All production entries</li>
                <li>All weekly settlements</li>
                <li>All part payments</li>
              </ul>
              <p className="mt-2 font-semibold text-destructive">
                This action cannot be undone.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Employee
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EmployeeDetails;
