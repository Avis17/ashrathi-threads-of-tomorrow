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
import { useCreateJobEmployee, useUpdateJobEmployee, type JobEmployee } from '@/hooks/useJobEmployees';
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
};

const EmployeeForm = ({ employee, onClose }: EmployeeFormProps) => {
  const createMutation = useCreateJobEmployee();
  const updateMutation = useUpdateJobEmployee();
  const { data: contractors } = useJobContractors();
  
  const [showContractorForm, setShowContractorForm] = useState(false);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>(
    employee?.departments ? (employee.departments as string[]) : []
  );

  const { register, handleSubmit, setValue, watch } = useForm<FormData>({
    defaultValues: {
      employee_code: employee?.employee_code || '',
      name: employee?.name || '',
      employee_type: employee?.employee_type || 'direct',
      phone: employee?.phone || '',
      address: employee?.address || '',
      contractor_id: employee?.contractor_id || '',
      rate_type: employee?.rate_type || 'per_piece',
      date_joined: employee?.date_joined || new Date().toISOString().split('T')[0],
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
              <Label>Employee Type *</Label>
              <Select value={employeeType} onValueChange={(value) => setValue('employee_type', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="direct">Direct Worker</SelectItem>
                  <SelectItem value="contract">Contract Worker</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" {...register('phone')} placeholder="9876543210" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Textarea id="address" {...register('address')} rows={2} placeholder="Enter address" />
            </div>
          </div>
        </div>

        {/* Departments/Skills */}
        <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
          <h3 className="font-semibold text-foreground">Departments / Skills</h3>
          <p className="text-sm text-muted-foreground">Select all departments this employee can work in</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {JOB_DEPARTMENTS.map((dept) => (
              <div key={dept} className="flex items-center space-x-2">
                <Checkbox
                  id={dept}
                  checked={selectedDepartments.includes(dept)}
                  onCheckedChange={() => toggleDepartment(dept)}
                />
                <Label
                  htmlFor={dept}
                  className="text-sm font-normal cursor-pointer"
                >
                  {dept}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Contract Details */}
        {employeeType === 'contract' && (
          <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
            <h3 className="font-semibold text-foreground">Contract Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label>Contractor *</Label>
                <div className="flex gap-2">
                  <Select value={contractorId} onValueChange={(value) => setValue('contractor_id', value)}>
                    <SelectTrigger className="flex-1">
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
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setShowContractorForm(true)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                {selectedContractor && (
                  <div className="p-3 bg-background rounded-md border text-sm space-y-1">
                    <div><strong>Contact:</strong> {selectedContractor.contact_person || 'N/A'}</div>
                    <div><strong>Phone:</strong> {selectedContractor.phone || 'N/A'}</div>
                    <div><strong>Payment:</strong> {selectedContractor.payment_terms || 'N/A'}</div>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label>Rate Type</Label>
                <Select value={watch('rate_type')} onValueChange={(value) => setValue('rate_type', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="per_piece">Per Piece</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="date_joined">Date Joined</Label>
          <Input id="date_joined" type="date" {...register('date_joined')} />
        </div>

        <div className="flex gap-3 justify-end pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="bg-gradient-to-r from-primary to-secondary"
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save Employee'}
          </Button>
        </div>
      </form>

      {/* Contractor Creation Dialog */}
      <Dialog open={showContractorForm} onOpenChange={setShowContractorForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Contractor</DialogTitle>
          </DialogHeader>
          <ContractorForm
            onSuccess={(contractorId) => {
              setValue('contractor_id', contractorId);
              setShowContractorForm(false);
            }}
            onCancel={() => setShowContractorForm(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EmployeeForm;
