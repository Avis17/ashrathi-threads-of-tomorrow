import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJobEmployee, useDeleteJobEmployee } from '@/hooks/useJobEmployees';
import { usePartPayments } from '@/hooks/usePartPayments';
import { useWeeklySettlements } from '@/hooks/useWeeklySettlements';
import { useJobProductionEntries } from '@/hooks/useJobProduction';
import { useJobBatches } from '@/hooks/useJobBatches';
import { useEmployeeReviews, calculateAverageRating } from '@/hooks/useJobEmployeeReviews';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Edit, DollarSign, User, Phone, MapPin, Briefcase, Trash2, CheckCircle2, TrendingUp, Star, ClipboardCheck } from 'lucide-react';
import { format } from 'date-fns';
import PartPaymentForm from './PartPaymentForm';
import MultiLineSettlementForm from './MultiLineSettlementForm';
import EmployeeForm from './EmployeeForm';
import EmployeePaymentRecords from './EmployeePaymentRecords';
import EmployeeReviewForm from './EmployeeReviewForm';
import EmployeeReviewsList from './EmployeeReviewsList';

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
  const { data: batches } = useJobBatches();
  const { data: reviews } = useEmployeeReviews(employeeId);
  const deleteMutation = useDeleteJobEmployee();
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showSettlementForm, setShowSettlementForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  const avgRating = calculateAverageRating(reviews);

  // Calculate accumulated unsettled advances with batch info
  const unsettledAdvancesWithBatch = useMemo(() => 
    partPayments?.filter(p => !p.is_settled).map(payment => {
      const batch = batches?.find(b => b.id === payment.batch_id);
      return {
        ...payment,
        batchInfo: batch ? {
          batch_number: batch.batch_number,
          style_name: batch.job_styles?.style_name
        } : null
      };
    }) || [],
    [partPayments, batches]
  );
  
  const unsettledAdvances = useMemo(() => 
    unsettledAdvancesWithBatch.reduce((sum, p) => sum + (p.amount || 0), 0),
    [unsettledAdvancesWithBatch]
  );
  
  // Settlements with batch info
  const settlementsWithBatch = useMemo(() => 
    settlements?.map(settlement => {
      // Get production entries for this settlement
      const settlementProduction = production?.filter(p => p.settlement_id === settlement.id) || [];
      // Get unique batches from production entries
      const batchIds = [...new Set(settlementProduction.map(p => p.batch_id).filter(Boolean))];
      const settlementBatches = batches?.filter(b => batchIds.includes(b.id)) || [];
      
      return {
        ...settlement,
        batchInfo: settlementBatches.map(b => ({
          batch_number: b.batch_number,
          style_name: b.job_styles?.style_name
        }))
      };
    }) || [],
    [settlements, production, batches]
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
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold">{employee.name}</h2>
            <p className="text-muted-foreground">{employee.employee_code}</p>
          </div>
          {avgRating !== null && (
            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    star <= Math.round(avgRating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-muted-foreground/30'
                  }`}
                />
              ))}
              <span className="ml-1 text-sm font-medium">{avgRating.toFixed(1)}</span>
            </div>
          )}
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
          <Button variant="secondary" onClick={() => setShowReviewForm(true)}>
            <ClipboardCheck className="h-4 w-4 mr-2" />
            Monthly Review
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
                <Badge className={employee.employee_type === 'direct' ? 'bg-blue-500 text-white' : 'bg-purple-500 text-white'}>
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
              {unsettledAdvancesWithBatch.length > 0 ? (
                unsettledAdvancesWithBatch.slice(0, 10).map((payment) => (
                  <div key={payment.id} className="flex justify-between items-center text-sm p-2 hover:bg-muted/50 rounded">
                    <div className="flex-1">
                      <p className="font-medium">{format(new Date(payment.payment_date), 'MMM dd, yyyy')}</p>
                      {payment.batchInfo && (
                        <p className="text-xs text-muted-foreground">
                          Batch: {payment.batchInfo.batch_number}
                          {payment.batchInfo.style_name && ` - ${payment.batchInfo.style_name}`}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">{payment.payment_mode}</p>
                      {payment.note && (
                        <p className="text-xs text-muted-foreground">{payment.note}</p>
                      )}
                    </div>
                    <Badge variant="outline" className="ml-2">
                      ₹{payment.amount.toFixed(2)}
                    </Badge>
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
              {settlementsWithBatch.length > 0 ? (
                settlementsWithBatch.slice(0, 5).map((settlement) => (
                  <div key={settlement.id} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {format(new Date(settlement.settlement_date || settlement.payment_date || ''), 'MMM dd, yyyy')}
                        </p>
                        {settlement.batchInfo && settlement.batchInfo.length > 0 && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {settlement.batchInfo.map((batch, idx) => (
                              <span key={idx}>
                                {batch.batch_number}
                                {batch.style_name && ` - ${batch.style_name}`}
                                {idx < settlement.batchInfo.length - 1 && ', '}
                              </span>
                            ))}
                          </div>
                        )}
                        <Badge 
                          variant={settlement.payment_status === 'paid' ? 'default' : 'secondary'}
                          className="mt-1"
                        >
                          {settlement.payment_status}
                        </Badge>
                      </div>
                      <Badge className="ml-2">₹{settlement.net_payable?.toFixed(2) || '0.00'}</Badge>
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
                      {settlement.remarks && (
                        <p className="text-xs text-muted-foreground mt-1">{settlement.remarks}</p>
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

      {/* Monthly Reviews Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Monthly Reviews
          </h3>
          <Button variant="outline" size="sm" onClick={() => setShowReviewForm(true)}>
            <ClipboardCheck className="h-4 w-4 mr-2" />
            Add Review
          </Button>
        </div>
        <EmployeeReviewsList employeeId={employeeId} />
      </Card>

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

      {/* Monthly Review Dialog */}
      <Dialog open={showReviewForm} onOpenChange={setShowReviewForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Monthly Review - {employee.name}</DialogTitle>
            <DialogDescription>
              Add a monthly performance review
            </DialogDescription>
          </DialogHeader>
          <EmployeeReviewForm 
            employeeId={employeeId}
            onClose={() => setShowReviewForm(false)}
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
