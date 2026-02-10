import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useCreateJobProductionEntry } from '@/hooks/useJobProduction';
import { useJobEmployees } from '@/hooks/useJobEmployees';
import { JOB_DEPARTMENTS } from '@/lib/jobDepartments';
import { format } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface BatchProductionFormProps {
  batchId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const BatchProductionForm = ({ batchId, open, onOpenChange }: BatchProductionFormProps) => {
  const [section, setSection] = useState('');
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
  const [quantityCompleted, setQuantityCompleted] = useState('');
  const [ratePerPiece, setRatePerPiece] = useState('');
  const [remarks, setRemarks] = useState('');
  const [productionDate, setProductionDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: employees = [] } = useJobEmployees();
  const createProductionMutation = useCreateJobProductionEntry();

  const filteredEmployees = section
    ? employees.filter(emp => {
        const depts = (emp.departments as string[]) || [];
        return depts.includes(section) && emp.is_active;
      })
    : employees.filter(emp => emp.is_active);

  const toggleEmployee = (id: string) => {
    setSelectedEmployeeIds(prev =>
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedEmployeeIds.length === filteredEmployees.length) {
      setSelectedEmployeeIds([]);
    } else {
      setSelectedEmployeeIds(filteredEmployees.map(e => e.id));
    }
  };

  const totalAmountPerEmployee = () => {
    const qty = parseFloat(quantityCompleted) || 0;
    const rate = parseFloat(ratePerPiece) || 0;
    return (qty * rate).toFixed(2);
  };

  const grandTotal = () => {
    const perEmp = parseFloat(totalAmountPerEmployee()) || 0;
    return (perEmp * selectedEmployeeIds.length).toFixed(2);
  };

  const handleSubmit = async () => {
    if (!section || selectedEmployeeIds.length === 0 || !quantityCompleted || !ratePerPiece) return;
    setIsSubmitting(true);

    try {
      for (const empId of selectedEmployeeIds) {
        const employee = employees.find(e => e.id === empId);
        if (!employee) continue;

        await createProductionMutation.mutateAsync({
          batch_id: batchId,
          date: productionDate,
          section,
          employee_id: empId,
          employee_name: employee.name,
          employee_type: employee.employee_type,
          quantity_completed: parseInt(quantityCompleted),
          rate_per_piece: parseFloat(ratePerPiece),
          total_amount: parseFloat(totalAmountPerEmployee()),
          remarks: remarks || null,
        });
      }
      resetForm();
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSection('');
    setSelectedEmployeeIds([]);
    setQuantityCompleted('');
    setRatePerPiece('');
    setRemarks('');
    setProductionDate(format(new Date(), 'yyyy-MM-dd'));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
                setSelectedEmployeeIds([]);
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

          {/* Multi-select employees */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Employees * ({selectedEmployeeIds.length} selected)</Label>
              {filteredEmployees.length > 0 && (
                <Button type="button" variant="ghost" size="sm" onClick={selectAll} className="text-xs h-7">
                  {selectedEmployeeIds.length === filteredEmployees.length ? 'Deselect All' : 'Select All'}
                </Button>
              )}
            </div>

            {selectedEmployeeIds.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {selectedEmployeeIds.map(id => {
                  const emp = employees.find(e => e.id === id);
                  if (!emp) return null;
                  return (
                    <Badge key={id} variant="secondary" className="gap-1 pr-1">
                      {emp.name}
                      <button onClick={() => toggleEmployee(id)} className="ml-0.5 hover:bg-muted rounded-full p-0.5">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  );
                })}
              </div>
            )}

            <ScrollArea className="border rounded-md h-[160px]">
              {!section ? (
                <div className="flex items-center justify-center h-full text-sm text-muted-foreground p-4">
                  Select an operation first
                </div>
              ) : filteredEmployees.length === 0 ? (
                <div className="flex items-center justify-center h-full text-sm text-muted-foreground p-4">
                  No employees found for this operation
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {filteredEmployees.map((emp) => (
                    <label
                      key={emp.id}
                      className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer"
                    >
                      <Checkbox
                        checked={selectedEmployeeIds.includes(emp.id)}
                        onCheckedChange={() => toggleEmployee(emp.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium">{emp.name}</span>
                        <span className="text-xs text-muted-foreground ml-2">({emp.employee_type})</span>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="quantity">Qty per Employee *</Label>
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
              <Label>Total per Employee</Label>
              <div className="h-10 px-3 py-2 bg-muted rounded-md flex items-center font-semibold text-sm">
                ₹{totalAmountPerEmployee()}
              </div>
            </div>
          </div>

          {selectedEmployeeIds.length > 1 && (
            <div className="p-3 bg-muted/50 rounded-md text-sm flex justify-between items-center">
              <span className="text-muted-foreground">
                Grand Total ({selectedEmployeeIds.length} employees × ₹{totalAmountPerEmployee()})
              </span>
              <span className="font-bold text-base">₹{grandTotal()}</span>
            </div>
          )}

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
            disabled={!section || selectedEmployeeIds.length === 0 || !quantityCompleted || !ratePerPiece || isSubmitting}
          >
            {isSubmitting ? 'Saving...' : `Add ${selectedEmployeeIds.length > 1 ? selectedEmployeeIds.length + ' Entries' : 'Entry'}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
