import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCreateJobWorker } from '@/hooks/useDeliveryChallans';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onWorkerCreated?: (name: string) => void;
}

export const AddWorkerDialog = ({ open, onOpenChange, onWorkerCreated }: Props) => {
  const createJobWorker = useCreateJobWorker();
  const [newWorker, setNewWorker] = useState({
    name: '',
    address: '',
    gstin: '',
    phone: '',
    is_active: true,
  });

  const handleAdd = async () => {
    if (!newWorker.name) return;
    await createJobWorker.mutateAsync(newWorker);
    onWorkerCreated?.(newWorker.name);
    setNewWorker({ name: '', address: '', gstin: '', phone: '', is_active: true });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Job Worker / Company</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Name *</Label>
            <Input
              value={newWorker.name}
              onChange={(e) => setNewWorker({ ...newWorker, name: e.target.value })}
              placeholder="Worker / Company name"
            />
          </div>
          <div className="space-y-2">
            <Label>Address</Label>
            <Textarea
              value={newWorker.address}
              onChange={(e) => setNewWorker({ ...newWorker, address: e.target.value })}
              placeholder="Full address"
            />
          </div>
          <div className="space-y-2">
            <Label>GSTIN</Label>
            <Input
              value={newWorker.gstin}
              onChange={(e) => setNewWorker({ ...newWorker, gstin: e.target.value })}
              placeholder="GST Number"
            />
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input
              value={newWorker.phone}
              onChange={(e) => setNewWorker({ ...newWorker, phone: e.target.value })}
              placeholder="Contact number"
            />
          </div>
          <Button onClick={handleAdd} className="w-full" disabled={!newWorker.name || createJobWorker.isPending}>
            {createJobWorker.isPending ? 'Adding...' : 'Add Worker / Company'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
