import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function InvoiceReset() {
  const [newNumber, setNewNumber] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [jobOrderNewNumber, setJobOrderNewNumber] = useState('');
  const [showJobOrderConfirm, setShowJobOrderConfirm] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings } = useQuery({
    queryKey: ['invoice-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoice_settings')
        .select('*')
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: jobOrderSettings } = useQuery({
    queryKey: ['job-order-invoice-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_order_invoice_settings')
        .select('*')
        .single();
      if (error) throw error;
      return data;
    },
  });

  const resetMutation = useMutation({
    mutationFn: async (newInvoiceNumber: number) => {
      const { error } = await supabase
        .from('invoice_settings')
        .update({ 
          current_invoice_number: newInvoiceNumber,
          updated_at: new Date().toISOString()
        })
        .eq('id', settings?.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoice-settings'] });
      toast({ title: 'Invoice number reset successfully' });
      setNewNumber('');
      setShowConfirm(false);
    },
    onError: () => {
      toast({ title: 'Failed to reset invoice number', variant: 'destructive' });
    },
  });

  const handleReset = () => {
    const num = parseInt(newNumber);
    if (isNaN(num) || num < 1) {
      toast({ title: 'Please enter a valid number', variant: 'destructive' });
      return;
    }
    setShowConfirm(true);
  };

  const jobOrderResetMutation = useMutation({
    mutationFn: async (newInvoiceNumber: number) => {
      const { error } = await supabase
        .from('job_order_invoice_settings')
        .update({ 
          current_invoice_number: newInvoiceNumber,
          updated_at: new Date().toISOString()
        })
        .eq('id', jobOrderSettings?.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-order-invoice-settings'] });
      toast({ title: 'Job order invoice number reset successfully' });
      setJobOrderNewNumber('');
      setShowJobOrderConfirm(false);
    },
    onError: () => {
      toast({ title: 'Failed to reset job order invoice number', variant: 'destructive' });
    },
  });

  const confirmReset = () => {
    resetMutation.mutate(parseInt(newNumber));
  };

  const handleJobOrderReset = () => {
    const num = parseInt(jobOrderNewNumber);
    if (isNaN(num) || num < 1) {
      toast({ title: 'Please enter a valid number', variant: 'destructive' });
      return;
    }
    setShowJobOrderConfirm(true);
  };

  const confirmJobOrderReset = () => {
    jobOrderResetMutation.mutate(parseInt(jobOrderNewNumber));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Invoice Number Reset</h2>
        <p className="text-muted-foreground">Reset the starting invoice number for different invoice types</p>
      </div>

      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Warning</AlertTitle>
        <AlertDescription>
          Resetting the invoice number is a sensitive operation. Make sure you understand the implications
          before proceeding. This will affect all future invoices generated in the system.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Product Invoice Settings</CardTitle>
          <CardDescription>View and modify the product invoice numbering system</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Current Invoice Number</Label>
            <Input
              value={settings?.current_invoice_number || ''}
              disabled
              className="font-semibold text-lg"
            />
            <p className="text-sm text-muted-foreground">
              The next invoice will be numbered: {settings?.current_invoice_number}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-number">New Starting Invoice Number</Label>
            <Input
              id="new-number"
              type="number"
              min="1"
              value={newNumber}
              onChange={(e) => setNewNumber(e.target.value)}
              placeholder="Enter new invoice number"
            />
            <p className="text-sm text-muted-foreground">
              Enter the number you want the next invoice to start from
            </p>
          </div>

          <Button onClick={handleReset} disabled={!newNumber || resetMutation.isPending}>
            {resetMutation.isPending ? 'Resetting...' : 'Reset Invoice Number'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Job Order Invoice Settings</CardTitle>
          <CardDescription>View and modify the job order invoice numbering system</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Current Job Order Invoice Number</Label>
            <Input
              value={jobOrderSettings?.current_invoice_number || ''}
              disabled
              className="font-semibold text-lg"
            />
            <p className="text-sm text-muted-foreground">
              The next job order invoice will be numbered: {jobOrderSettings?.current_invoice_number}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="job-order-new-number">New Starting Job Order Invoice Number</Label>
            <Input
              id="job-order-new-number"
              type="number"
              min="1"
              value={jobOrderNewNumber}
              onChange={(e) => setJobOrderNewNumber(e.target.value)}
              placeholder="Enter new job order invoice number"
            />
            <p className="text-sm text-muted-foreground">
              Enter the number you want the next job order invoice to start from
            </p>
          </div>

          <Button onClick={handleJobOrderReset} disabled={!jobOrderNewNumber || jobOrderResetMutation.isPending}>
            {jobOrderResetMutation.isPending ? 'Resetting...' : 'Reset Job Order Invoice Number'}
          </Button>
        </CardContent>
      </Card>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will change the product invoice numbering system to start from <strong>{newNumber}</strong>.
              This action will affect all future product invoices. Make sure this is intentional and you have
              documented this change for your records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmReset}>
              Confirm Reset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showJobOrderConfirm} onOpenChange={setShowJobOrderConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will change the job order invoice numbering system to start from <strong>{jobOrderNewNumber}</strong>.
              This action will affect all future job order invoices. Make sure this is intentional and you have
              documented this change for your records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmJobOrderReset}>
              Confirm Reset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}