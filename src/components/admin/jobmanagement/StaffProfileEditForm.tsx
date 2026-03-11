import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUpdateStaffMember, type StaffMember } from '@/hooks/useStaff';

interface StaffProfileEditFormProps {
  staff: StaffMember;
  onClose: () => void;
}

const StaffProfileEditForm = ({ staff, onClose }: StaffProfileEditFormProps) => {
  const updateStaff = useUpdateStaffMember();

  const [form, setForm] = useState({
    salary_type: staff.salary_type || '',
    salary_amount: staff.salary_amount?.toString() || '',
    joined_date: staff.joined_date || '',
    date_of_birth: staff.date_of_birth || '',
    gender: staff.gender || '',
    blood_group: staff.blood_group || '',
    father_name: staff.father_name || '',
    marital_status: staff.marital_status || '',
    qualification: staff.qualification || '',
    education: staff.education || '',
    aadhar_number: staff.aadhar_number || '',
    pan_number: staff.pan_number || '',
    driving_license: staff.driving_license || '',
    place: staff.place || '',
    address: staff.address || '',
    emergency_contact_name: staff.emergency_contact_name || '',
    emergency_contact_phone: staff.emergency_contact_phone || '',
    bank_account_number: staff.bank_account_number || '',
    bank_name: staff.bank_name || '',
    ifsc_code: staff.ifsc_code || '',
    notes: staff.notes || '',
  });

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateStaff.mutateAsync({
      id: staff.id,
      data: {
        salary_type: form.salary_type || null,
        salary_amount: form.salary_amount ? parseFloat(form.salary_amount) : null,
        joined_date: form.joined_date || null,
        date_of_birth: form.date_of_birth || null,
        gender: form.gender || null,
        blood_group: form.blood_group || null,
        father_name: form.father_name || null,
        marital_status: form.marital_status || null,
        qualification: form.qualification || null,
        education: form.education || null,
        aadhar_number: form.aadhar_number || null,
        pan_number: form.pan_number || null,
        driving_license: form.driving_license || null,
        place: form.place || null,
        address: form.address || null,
        emergency_contact_name: form.emergency_contact_name || null,
        emergency_contact_phone: form.emergency_contact_phone || null,
        bank_account_number: form.bank_account_number || null,
        bank_name: form.bank_name || null,
        ifsc_code: form.ifsc_code || null,
        notes: form.notes || null,
      },
    });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
      {/* Employment Details */}
      <div>
        <h4 className="font-semibold text-sm mb-3 text-muted-foreground uppercase tracking-wide">Employment</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Salary Type</Label>
            <Select value={form.salary_type} onValueChange={(v) => handleChange('salary_type', v)}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Daily Rate (₹)</Label>
            <Input type="number" value={form.salary_amount} onChange={(e) => handleChange('salary_amount', e.target.value)} placeholder="e.g. 300" />
          </div>
          <div className="space-y-2">
            <Label>Joined Date</Label>
            <Input type="date" value={form.joined_date} onChange={(e) => handleChange('joined_date', e.target.value)} />
          </div>
        </div>
      </div>

      {/* Personal Details */}
      <div>
        <h4 className="font-semibold text-sm mb-3 text-muted-foreground uppercase tracking-wide">Personal Details</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Date of Birth</Label>
            <Input type="date" value={form.date_of_birth} onChange={(e) => handleChange('date_of_birth', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Gender</Label>
            <Select value={form.gender} onValueChange={(v) => handleChange('gender', v)}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Father's Name</Label>
            <Input value={form.father_name} onChange={(e) => handleChange('father_name', e.target.value)} placeholder="Father's name" />
          </div>
          <div className="space-y-2">
            <Label>Marital Status</Label>
            <Select value={form.marital_status} onValueChange={(v) => handleChange('marital_status', v)}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Single</SelectItem>
                <SelectItem value="married">Married</SelectItem>
                <SelectItem value="divorced">Divorced</SelectItem>
                <SelectItem value="widowed">Widowed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Blood Group</Label>
            <Select value={form.blood_group} onValueChange={(v) => handleChange('blood_group', v)}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                  <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Place</Label>
            <Input value={form.place} onChange={(e) => handleChange('place', e.target.value)} placeholder="Hometown / Place" />
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <Label>Address</Label>
          <Textarea value={form.address} onChange={(e) => handleChange('address', e.target.value)} placeholder="Full address" rows={2} />
        </div>
      </div>

      {/* Education */}
      <div>
        <h4 className="font-semibold text-sm mb-3 text-muted-foreground uppercase tracking-wide">Education & Qualification</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Education</Label>
            <Input value={form.education} onChange={(e) => handleChange('education', e.target.value)} placeholder="e.g. 10th, 12th, Graduate" />
          </div>
          <div className="space-y-2">
            <Label>Qualification</Label>
            <Input value={form.qualification} onChange={(e) => handleChange('qualification', e.target.value)} placeholder="e.g. ITI, Diploma" />
          </div>
        </div>
      </div>

      {/* ID Documents */}
      <div>
        <h4 className="font-semibold text-sm mb-3 text-muted-foreground uppercase tracking-wide">ID Documents</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Aadhar Number</Label>
            <Input value={form.aadhar_number} onChange={(e) => handleChange('aadhar_number', e.target.value)} placeholder="12-digit Aadhar" maxLength={12} />
          </div>
          <div className="space-y-2">
            <Label>PAN Number</Label>
            <Input value={form.pan_number} onChange={(e) => handleChange('pan_number', e.target.value)} placeholder="PAN card number" maxLength={10} />
          </div>
          <div className="space-y-2">
            <Label>Driving License</Label>
            <Input value={form.driving_license} onChange={(e) => handleChange('driving_license', e.target.value)} placeholder="DL number" />
          </div>
        </div>
      </div>

      {/* Emergency Contact */}
      <div>
        <h4 className="font-semibold text-sm mb-3 text-muted-foreground uppercase tracking-wide">Emergency Contact</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Contact Name</Label>
            <Input value={form.emergency_contact_name} onChange={(e) => handleChange('emergency_contact_name', e.target.value)} placeholder="Emergency contact name" />
          </div>
          <div className="space-y-2">
            <Label>Contact Phone</Label>
            <Input value={form.emergency_contact_phone} onChange={(e) => handleChange('emergency_contact_phone', e.target.value)} placeholder="Phone number" />
          </div>
        </div>
      </div>

      {/* Bank Details */}
      <div>
        <h4 className="font-semibold text-sm mb-3 text-muted-foreground uppercase tracking-wide">Bank Details</h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Bank Name</Label>
            <Input value={form.bank_name} onChange={(e) => handleChange('bank_name', e.target.value)} placeholder="Bank name" />
          </div>
          <div className="space-y-2">
            <Label>Account Number</Label>
            <Input value={form.bank_account_number} onChange={(e) => handleChange('bank_account_number', e.target.value)} placeholder="Account number" />
          </div>
          <div className="space-y-2">
            <Label>IFSC Code</Label>
            <Input value={form.ifsc_code} onChange={(e) => handleChange('ifsc_code', e.target.value)} placeholder="IFSC code" />
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label>Notes</Label>
        <Textarea value={form.notes} onChange={(e) => handleChange('notes', e.target.value)} placeholder="Any additional notes..." rows={3} />
      </div>

      <div className="flex justify-end gap-2 pt-2 sticky bottom-0 bg-background pb-2">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={updateStaff.isPending}>
          {updateStaff.isPending ? 'Saving...' : 'Save Profile'}
        </Button>
      </div>
    </form>
  );
};

export default StaffProfileEditForm;
