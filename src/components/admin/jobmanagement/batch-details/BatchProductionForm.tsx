import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateJobProductionEntry } from '@/hooks/useJobProduction';
import { useJobEmployees } from '@/hooks/useJobEmployees';
import { JOB_DEPARTMENTS } from '@/lib/jobDepartments';
import { format } from 'date-fns';

interface BatchProductionFormProps {
  batchId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const BatchProductionForm = ({ batchId, open, onOpenChange }: BatchProductionFormProps) => {
  const [section, setSection] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [quantityCompleted, setQuantityCompleted] = useState('');
  const [ratePerPiece, setRatePerPiece] = useState('');
  const [remarks, setRemarks] = useState('');
  const [productionDate, setProductionDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const { data: employees = [] } = useJobEmployees();
  const createProductionMutation = useCreateJobProductionEntry();

  // Filter employees based on selected operation/section
  const filteredEmployees = section 
    ? employees.filter(emp => {
        const depts = (emp.departments as string[]) || [];
        return depts.includes(section) && emp.is_active;
      })
    : employees.filter(emp => emp.is_active);

  const selectedEmployee = employees.find(e => e.id === employeeId);

  const totalAmount = () => {
    const qty = parseFloat(quantityCompleted) || 0;
    const rate = parseFloat(ratePerPiece) || 0;
    return (qty * rate).toFixed(2);
  };

  const handleSubmit = async () => {
    if (!section || !employeeId || !quantityCompleted || !ratePerPiece) return;

    const employee = employees.find(e => e.id === employeeId);
    if (!employee) return;

    await createProductionMutation.mutateAsync({
      batch_id: batchId,
      date: productionDate,
      section,
      employee_id: employeeId,
      employee_name: employee.name,
      employee_type: employee.employee_type,
      quantity_completed: parseInt(quantityCompleted),
      rate_per_piece: parseFloat(ratePerPiece),
      total_amount: parseFloat(totalAmount()),
      remarks: remarks || null,
    });

    // Reset form
    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setSection('');
    setEmployeeId('');
    setQuantityCompleted('');
    setRatePerPiece('');
    setRemarks('');
    setProductionDate(format(new Date(), 'yyyy-MM-dd'));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Production Entry</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="production-date">Date</Label>
              <Input
                id="production-date"
                type="date"
                value={productionDate}
                onChange={(e) => setProductionDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="section">Operation/Section *</Label>
              <Select value={section} onValueChange={(value) => {
                setSection(value);
                setEmployeeId(''); // Reset employee when section changes
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select operation" />
                </SelectTrigger>
                <SelectContent>
                  {JOB_DEPARTMENTS.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="employee">Employee *</Label>
            <Select value={employeeId} onValueChange={setEmployeeId}>
              <SelectTrigger>
                <SelectValue placeholder={section ? "Select employee" : "Select operation first"} />
              </SelectTrigger>
              <SelectContent>
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.name} ({emp.employee_type})
                    </SelectItem>
                  ))
                ) : (
                  <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                    {section ? 'No employees found for this operation' : 'Select an operation first'}
                  </div>
                )}
              </SelectContent>
            </Select>
            {selectedEmployee && (
              <p className="text-xs text-muted-foreground mt-1">
                Type: {selectedEmployee.employee_type} • Phone: {selectedEmployee.phone || 'N/A'}
              </p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="quantity">Quantity Completed *</Label>
              <Input
                id="quantity"
                type="number"
                placeholder="0"
                value={quantityCompleted}
                onChange={(e) => setQuantityCompleted(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="rate">Rate per Piece (₹) *</Label>
              <Input
                id="rate"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={ratePerPiece}
                onChange={(e) => setRatePerPiece(e.target.value)}
              />
            </div>
            <div>
              <Label>Total Amount</Label>
              <div className="h-10 px-3 py-2 bg-muted rounded-md flex items-center font-semibold">
                ₹{totalAmount()}
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="remarks">Notes/Remarks</Label>
            <Textarea
              id="remarks"
              placeholder="Any additional notes about this production entry..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!section || !employeeId || !quantityCompleted || !ratePerPiece || createProductionMutation.isPending}
          >
            {createProductionMutation.isPending ? 'Saving...' : 'Add Entry'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
