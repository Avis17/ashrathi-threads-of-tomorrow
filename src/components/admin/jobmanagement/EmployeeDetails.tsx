import { useState } from 'react';
import { useJobEmployee } from '@/hooks/useJobEmployees';
import { usePartPayments } from '@/hooks/usePartPayments';
import { useWeeklySettlements } from '@/hooks/useWeeklySettlements';
import { useJobProductionEntries } from '@/hooks/useJobProduction';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ArrowLeft, Edit, DollarSign, Calendar, User, Phone, MapPin, Briefcase, TrendingUp, ClipboardList, Package } from 'lucide-react';
import { format } from 'date-fns';
import { getCurrentWeek, isSettlementDay, getWeekRange } from '@/lib/weekUtils';
import PartPaymentForm from './PartPaymentForm';
import WeeklySettlementForm from './WeeklySettlementForm';
import ProductionEntryForm from './ProductionEntryForm';
import BatchSettlementForm from './BatchSettlementForm';
import EmployeeForm from './EmployeeForm';

interface EmployeeDetailsProps {
  employeeId: string;
  onClose?: () => void;
  onEdit?: () => void;
}

const EmployeeDetails = ({ employeeId, onClose, onEdit }: EmployeeDetailsProps) => {
  const { data: employee } = useJobEmployee(employeeId);
  const { data: partPayments } = usePartPayments(employeeId);
  const { data: settlements } = useWeeklySettlements(employeeId);
  const { data: production } = useJobProductionEntries();
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showSettlementForm, setShowSettlementForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showProductionForm, setShowProductionForm] = useState(false);
  const [showBatchSettlement, setShowBatchSettlement] = useState(false);

  const currentWeek = getCurrentWeek();
  const weekProduction = production?.filter(p => 
    p.employee_id === employeeId &&
    p.date >= currentWeek.start &&
    p.date <= currentWeek.end
  );

  const weekPartPayments = partPayments?.filter(p => 
    p.payment_date >= currentWeek.start &&
    p.payment_date <= currentWeek.end
  );

  const totalWeekProduction = weekProduction?.reduce((sum, p) => sum + (p.total_amount || 0), 0) || 0;
  const totalWeekPartPayments = weekPartPayments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
  const netPayable = totalWeekProduction - totalWeekPartPayments;

  const departments = employee?.departments as string[] || [];

  if (!employee) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold">{employee.name}</h2>
            <p className="text-muted-foreground">{employee.employee_code}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowEditForm(true)} className="gap-2">
            <Edit className="h-4 w-4" />
            Edit
          </Button>
          <Button variant="outline" onClick={() => setShowPaymentForm(true)} className="gap-2">
            <DollarSign className="h-4 w-4" />
            Record Payment
          </Button>
          {isSettlementDay() && (
            <Button onClick={() => setShowSettlementForm(true)} className="gap-2">
              <Calendar className="h-4 w-4" />
              Settle Week
            </Button>
          )}
        </div>
      </div>

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

        {/* Middle Column - Current Week */}
        <div className="space-y-6">
          <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5">
            <h3 className="font-semibold mb-4">Current Week Summary</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {getWeekRange(currentWeek.start, currentWeek.end)}
            </p>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Production Earnings</span>
                <span className="font-semibold text-lg">₹{totalWeekProduction.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Part Payments</span>
                <span className="font-semibold text-lg text-destructive">-₹{totalWeekPartPayments.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="font-medium">Net Payable</span>
                <span className="font-bold text-xl text-primary">₹{netPayable.toFixed(2)}</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold mb-4">Recent Part Payments</h3>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {weekPartPayments && weekPartPayments.length > 0 ? (
                weekPartPayments.map((payment) => (
                  <div key={payment.id} className="flex justify-between items-center text-sm p-2 hover:bg-muted/50 rounded">
                    <div>
                      <p className="font-medium">{format(new Date(payment.payment_date), 'MMM dd, yyyy')}</p>
                      <p className="text-xs text-muted-foreground">{payment.payment_mode}</p>
                    </div>
                    <span className="font-semibold">₹{payment.amount}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No payments this week</p>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column - History */}
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
                          {getWeekRange(settlement.week_start_date, settlement.week_end_date)}
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
                      <div className="flex justify-between">
                        <span>Part Payments:</span>
                        <span>-₹{settlement.total_part_payments?.toFixed(2) || '0.00'}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No settlement history</p>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Dialogs */}
      <Dialog open={showPaymentForm} onOpenChange={setShowPaymentForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Part Payment</DialogTitle>
            <DialogDescription>
              Record an advance or part payment for {employee.name}
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

      <Dialog open={showSettlementForm} onOpenChange={setShowSettlementForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Weekly Settlement</DialogTitle>
            <DialogDescription>
              Complete weekly salary settlement for {employee.name}
            </DialogDescription>
          </DialogHeader>
          <WeeklySettlementForm
            employeeId={employeeId}
            employeeName={employee.name}
            onSuccess={() => setShowSettlementForm(false)}
            onCancel={() => setShowSettlementForm(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
            <DialogDescription>
              Update employee information and details
            </DialogDescription>
          </DialogHeader>
          <EmployeeForm
            employee={employee}
            onClose={() => setShowEditForm(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showProductionForm} onOpenChange={setShowProductionForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Record Production</DialogTitle>
            <DialogDescription>
              Record daily production work for {employee.name}
            </DialogDescription>
          </DialogHeader>
          <ProductionEntryForm onClose={() => setShowProductionForm(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={showBatchSettlement} onOpenChange={setShowBatchSettlement}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Batch Settlement</DialogTitle>
            <DialogDescription>
              Settle production work for a specific batch
            </DialogDescription>
          </DialogHeader>
          <BatchSettlementForm
            employeeId={employeeId}
            employeeName={employee.name}
            onClose={() => setShowBatchSettlement(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmployeeDetails;