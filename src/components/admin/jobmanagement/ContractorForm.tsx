import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCreateJobContractor, useUpdateJobContractor } from '@/hooks/useJobContractors';

interface ContractorFormProps {
  contractor?: any;
  onSuccess: (contractorId?: string) => void;
  onCancel: () => void;
}

const ContractorForm = ({ contractor, onSuccess, onCancel }: ContractorFormProps) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: contractor || {}
  });
  const createContractor = useCreateJobContractor();
  const updateContractor = useUpdateJobContractor();

  const onSubmit = async (formData: any) => {
    if (contractor) {
      // Update existing
      await updateContractor.mutateAsync({
        id: contractor.id,
        data: {
          contractor_name: formData.contractor_name,
          contact_person: formData.contact_person || null,
          phone: formData.phone || null,
          email: formData.email || null,
          address: formData.address || null,
          gst_number: formData.gst_number || null,
          payment_terms: formData.payment_terms || null,
        }
      });
      onSuccess();
    } else {
      // Create new
      const code = `CONT-${Date.now().toString().slice(-6)}`;
      const newContractor = await createContractor.mutateAsync({
        contractor_code: code,
        contractor_name: formData.contractor_name,
        contact_person: formData.contact_person || null,
        phone: formData.phone || null,
        email: formData.email || null,
        address: formData.address || null,
        gst_number: formData.gst_number || null,
        payment_terms: formData.payment_terms || null,
      });
      onSuccess(newContractor.id);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Contractor Name *</Label>
          <Input
            {...register('contractor_name', { required: 'Required' })}
            placeholder="Enter contractor name"
          />
          {errors.contractor_name && (
            <span className="text-sm text-destructive">Required</span>
          )}
        </div>

        <div className="space-y-2">
          <Label>Contact Person</Label>
          <Input
            {...register('contact_person')}
            placeholder="Enter contact person"
          />
        </div>

        <div className="space-y-2">
          <Label>Phone</Label>
          <Input
            {...register('phone')}
            placeholder="Enter phone number"
          />
        </div>

        <div className="space-y-2">
          <Label>Email</Label>
          <Input
            type="email"
            {...register('email')}
            placeholder="Enter email"
          />
        </div>

        <div className="space-y-2">
          <Label>GST Number</Label>
          <Input
            {...register('gst_number')}
            placeholder="Enter GST number"
          />
        </div>

        <div className="space-y-2">
          <Label>Payment Terms</Label>
          <Input
            {...register('payment_terms')}
            placeholder="e.g., Net 30 days"
          />
        </div>

        <div className="space-y-2 col-span-2">
          <Label>Address</Label>
          <Textarea
            {...register('address')}
            placeholder="Enter full address"
            rows={2}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={createContractor.isPending || updateContractor.isPending}>
          {createContractor.isPending || updateContractor.isPending 
            ? 'Saving...' 
            : contractor ? 'Update Contractor' : 'Create Contractor'
          }
        </Button>
      </div>
    </form>
  );
};

export default ContractorForm;
