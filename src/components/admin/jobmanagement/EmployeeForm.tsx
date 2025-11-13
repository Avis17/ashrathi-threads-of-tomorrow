import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateJobEmployee, useUpdateJobEmployee, type JobEmployee } from '@/hooks/useJobEmployees';

interface EmployeeFormProps {
  employee?: JobEmployee | null;
  onClose: () => void;
}

const EmployeeForm = ({ employee, onClose }: EmployeeFormProps) => {
  const createMutation = useCreateJobEmployee();
  const updateMutation = useUpdateJobEmployee();
  
  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: employee || {
      employee_code: '',
      name: '',
      employee_type: 'direct',
      phone: '',
      address: '',
      contractor_name: '',
      rate_type: 'per_piece',
      date_joined: new Date().toISOString().split('T')[0],
    },
  });

  const employeeType = watch('employee_type');

  const onSubmit = async (data: any) => {
    if (employee) {
      await updateMutation.mutateAsync({ id: employee.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          {employee ? 'Edit Employee' : 'Add New Employee'}
        </h2>
        <p className="text-sm text-muted-foreground">
          Enter employee details
        </p>
      </div>

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

      {employeeType === 'contract' && (
        <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
          <h3 className="font-semibold text-foreground">Contract Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contractor_name">Contractor Name</Label>
              <Input id="contractor_name" {...register('contractor_name')} placeholder="ABC Contractors" />
            </div>
            <div className="space-y-2">
              <Label>Rate Type</Label>
              <Select defaultValue={watch('rate_type')} onValueChange={(value) => setValue('rate_type', value)}>
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
  );
};

export default EmployeeForm;
