import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateJobEmployee, useUpdateJobEmployee, useJobEmployees, type JobEmployee } from '@/hooks/useJobEmployees';
import { useJobContractors } from '@/hooks/useJobContractors';
import { JOB_DEPARTMENTS } from '@/lib/jobDepartments';
import ContractorForm from './ContractorForm';
import { Plus } from 'lucide-react';

interface EmployeeFormProps {
  employee?: JobEmployee | null;
  onClose: () => void;
}

type FormData = {
  employee_code: string;
  name: string;
  employee_type: string;
  phone: string;
  address: string;
  contractor_id: string;
  rate_type: string;
  date_joined: string;
  salary_type?: string;
  salary_amount?: string;
  notes?: string;
};

const EmployeeForm = ({ employee, onClose }: EmployeeFormProps) => {
  const createMutation = useCreateJobEmployee();
  const updateMutation = useUpdateJobEmployee();
  const { data: contractors } = useJobContractors();
  const { data: allEmployees } = useJobEmployees();

  // Generate next employee code
  const generateNextCode = () => {
    if (!allEmployees || allEmployees.length === 0) return 'E001';
    
    const codes = allEmployees
      .map(emp => emp.employee_code)
      .filter(code => code && /^E\d+$/.test(code))
      .map(code => parseInt(code.replace('E', ''), 10));
    
    const maxCode = codes.length > 0 ? Math.max(...codes) : 0;
    return `E${String(maxCode + 1).padStart(3, '0')}`;
  };
  
  const [showContractorForm, setShowContractorForm] = useState(false);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>(
    employee?.departments ? (employee.departments as string[]) : []
  );

  const nextCode = !employee ? generateNextCode() : '';
  
  const { register, handleSubmit, setValue, watch } = useForm<FormData>({
    defaultValues: {
      employee_code: employee?.employee_code || nextCode,
      name: employee?.name || '',
      employee_type: employee?.employee_type || 'direct',
      phone: employee?.phone || '',
      address: employee?.address || '',
      contractor_id: employee?.contractor_id || '',
      rate_type: employee?.rate_type || 'per_piece',
      date_joined: employee?.date_joined || new Date().toISOString().split('T')[0],
      salary_type: (employee as any)?.salary_type || '',
      salary_amount: (employee as any)?.salary_amount?.toString() || '',
      notes: (employee as any)?.notes || '',
    },
  });

  const employeeType = watch('employee_type');
  const contractorId = watch('contractor_id');

  const toggleDepartment = (dept: string) => {
    setSelectedDepartments(prev =>
      prev.includes(dept) ? prev.filter(d => d !== dept) : [...prev, dept]
    );
  };

  const onSubmit = async (data: FormData) => {
    const submitData = {
      ...data,
      departments: selectedDepartments,
      contractor_id: employeeType === 'contract' ? data.contractor_id : null,
      salary_type: data.salary_type || null,
      salary_amount: data.salary_amount ? parseFloat(data.salary_amount) : null,
      notes: data.notes || null,
    };

    if (employee) {
      await updateMutation.mutateAsync({ id: employee.id, data: submitData });
    } else {
      await createMutation.mutateAsync(submitData);
    }
    onClose();
  };

  const selectedContractor = contractors?.find(c => c.id === contractorId);

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {employee ? 'Edit Employee' : 'Add New Employee'}
          </h2>
          <p className="text-sm text-muted-foreground">
            Enter employee details and select their skill departments
          </p>
        </div>

        {/* Basic Information */}
        <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
          <h3 className="font-semibold text-foreground">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employee_code">Employee Code *</Label>
              <Input id="employee_code" {...register('employee_code')} required placeholder="E001" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" {...register('name')} required placeholder="Ravi Kumar" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" {...register('phone')} placeholder="+91 98765 43210" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date_joined">Date Joined</Label>
              <Input id="date_joined" type="date" {...register('date_joined')} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Textarea id="address" {...register('address')} rows={2} placeholder="Full address..." />
            </div>
          </div>
        </div>

        {/* Employment Type */}
        <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
          <h3 className="font-semibold text-foreground">Employment Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employee_type">Employee Type *</Label>
              <Select value={employeeType} onValueChange={(value) => setValue('employee_type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="direct">Direct</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="rate_type">Rate Type</Label>
              <Select value={watch('rate_type')} onValueChange={(value) => setValue('rate_type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select rate type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="per_piece">Per Piece</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Fixed Salary Details (Optional) */}
        <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
          <h3 className="font-semibold text-foreground">Fixed Salary (Optional)</h3>
          <p className="text-sm text-muted-foreground">
            Configure fixed salary for employees with regular weekly/monthly payments
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="salary_type">Salary Type</Label>
              <Select value={watch('salary_type') || 'none'} onValueChange={(value) => setValue('salary_type', value === 'none' ? '' : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="salary_amount">Salary Amount (₹)</Label>
              <Input
                id="salary_amount"
                type="number"
                step="0.01"
                placeholder="Enter amount"
                {...register('salary_amount')}
              />
            </div>
          </div>
        </div>

        {/* Contract Worker Details */}
        {employeeType === 'contract' && (
          <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Contractor Details</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowContractorForm(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add New Contractor
              </Button>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contractor_id">Select Contractor *</Label>
              <Select value={contractorId} onValueChange={(value) => setValue('contractor_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select contractor" />
                </SelectTrigger>
                <SelectContent>
                  {contractors?.map((contractor) => (
                    <SelectItem key={contractor.id} value={contractor.id}>
                      {contractor.contractor_name} ({contractor.contractor_code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedContractor && (
              <div className="text-sm text-muted-foreground p-3 bg-background rounded border">
                <p><strong>Contact:</strong> {selectedContractor.contact_person}</p>
                <p><strong>Phone:</strong> {selectedContractor.phone}</p>
                <p><strong>Address:</strong> {selectedContractor.address}</p>
              </div>
            )}
          </div>
        )}

        {/* Departments/Skills */}
        <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
          <h3 className="font-semibold text-foreground">Departments / Skills</h3>
          <p className="text-sm text-muted-foreground">Select all departments this employee can work in</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {JOB_DEPARTMENTS.map((dept) => (
              <div key={dept} className="flex items-center space-x-2">
                <Checkbox
                  id={dept}
                  checked={selectedDepartments.includes(dept)}
                  onCheckedChange={() => toggleDepartment(dept)}
                />
                <Label htmlFor={dept} className="cursor-pointer text-sm font-normal">
                  {dept}
                </Label>
              </div>
            ))}
          </div>
          {selectedDepartments.length === 0 && (
            <p className="text-sm text-destructive">⚠️ Please select at least one department</p>
          )}
        </div>

        {/* Notes Section */}
        <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
          <h3 className="font-semibold text-foreground">Notes</h3>
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea 
              id="notes" 
              {...register('notes')} 
              rows={3} 
              placeholder="Any additional information about the employee (skills, preferences, etc.)"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending || selectedDepartments.length === 0}
            className="flex-1"
          >
            {(createMutation.isPending || updateMutation.isPending) ? 'Saving...' : (employee ? 'Update Employee' : 'Save Employee')}
          </Button>
        </div>
      </form>

      {/* Contractor Form Dialog */}
      <Dialog open={showContractorForm} onOpenChange={setShowContractorForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Contractor</DialogTitle>
          </DialogHeader>
          <ContractorForm 
            onSuccess={() => setShowContractorForm(false)}
            onCancel={() => setShowContractorForm(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EmployeeForm;
