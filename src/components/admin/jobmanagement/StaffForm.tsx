import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useJobEmployees } from '@/hooks/useJobEmployees';
import { useCreateStaffMember, useStaffMembers } from '@/hooks/useStaff';

interface StaffFormProps {
  onClose: () => void;
}

const StaffForm = ({ onClose }: StaffFormProps) => {
  const { data: employees } = useJobEmployees();
  const { data: existingStaff } = useStaffMembers();
  const createStaff = useCreateStaffMember();

  const [employeeId, setEmployeeId] = useState('');
  const [salaryType, setSalaryType] = useState<string>('');
  const [salaryAmount, setSalaryAmount] = useState('');
  const [joinedDate, setJoinedDate] = useState<Date | undefined>();
  const [notes, setNotes] = useState('');

  // Filter out employees already added as staff
  const existingEmployeeIds = new Set(existingStaff?.map(s => s.employee_id) || []);
  const availableEmployees = employees?.filter(e => !existingEmployeeIds.has(e.id)) || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId) return;

    await createStaff.mutateAsync({
      employee_id: employeeId,
      salary_type: salaryType || undefined,
      salary_amount: salaryAmount ? parseFloat(salaryAmount) : undefined,
      joined_date: joinedDate ? format(joinedDate, 'yyyy-MM-dd') : undefined,
      notes: notes || undefined,
    });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Employee *</Label>
        <Select value={employeeId} onValueChange={setEmployeeId}>
          <SelectTrigger>
            <SelectValue placeholder="Select an employee" />
          </SelectTrigger>
          <SelectContent>
            {availableEmployees.map((emp) => (
              <SelectItem key={emp.id} value={emp.id}>
                {emp.name} ({emp.employee_code})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Salary Type</Label>
          <Select value={salaryType} onValueChange={setSalaryType}>
            <SelectTrigger>
              <SelectValue placeholder="Optional" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Salary Amount</Label>
          <Input
            type="number"
            placeholder="Optional"
            value={salaryAmount}
            onChange={(e) => setSalaryAmount(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Joined Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn('w-full justify-start text-left font-normal', !joinedDate && 'text-muted-foreground')}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {joinedDate ? format(joinedDate, 'PPP') : 'Pick a date'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={joinedDate}
              onSelect={setJoinedDate}
              initialFocus
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label>Notes</Label>
        <Textarea
          placeholder="Any notes about this staff member..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={!employeeId || createStaff.isPending}>
          {createStaff.isPending ? 'Adding...' : 'Add Staff'}
        </Button>
      </div>
    </form>
  );
};

export default StaffForm;
