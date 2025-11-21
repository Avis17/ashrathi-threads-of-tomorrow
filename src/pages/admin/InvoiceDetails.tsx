import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowLeft, Download, Plus, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

export default function InvoiceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [addPaymentOpen, setAddPaymentOpen] = useState(false);
  const [completePaymentOpen, setCompletePaymentOpen] = useState(false);

  // Payment form state
  const [paymentDate, setPaymentDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [amountPaid, setAmountPaid] = useState('');
  const [paymentMode, setPaymentMode] = useState('cash');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');

  const { data: invoice, isLoading } = useQuery({
    queryKey: ['invoice', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select('*, customers(*), invoice_items(*, products(name))')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: payments } = useQuery({
    queryKey: ['invoice-payments', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoice_payments')
        .select('*')
        .eq('invoice_id', id)
        .order('payment_date', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const addPaymentMutation = useMutation({
    mutationFn: async () => {
      const amount = parseFloat(amountPaid);
      if (!amount || amount <= 0) {
        throw new Error('Please enter a valid amount');
      }
      
      const remainingBalance = (invoice?.balance_amount || 0);
      if (amount > remainingBalance) {
        throw new Error(`Amount cannot exceed remaining balance of ₹${remainingBalance.toFixed(2)}`);
      }

      const { error } = await supabase
        .from('invoice_payments')
        .insert([{
          invoice_id: id,
          payment_date: paymentDate,
          amount_paid: amount,
          payment_mode: paymentMode,
          reference_number: referenceNumber || null,
          notes: notes || null,
        }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoice', id] });
      queryClient.invalidateQueries({ queryKey: ['invoice-payments', id] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast({ title: 'Payment recorded successfully' });
      setAddPaymentOpen(false);
      resetPaymentForm();
    },
    onError: (error: Error) => {
      toast({ title: error.message || 'Failed to record payment', variant: 'destructive' });
    },
  });

  const completePaymentMutation = useMutation({
    mutationFn: async () => {
      const remainingBalance = invoice?.balance_amount || 0;
      
      const { error } = await supabase
        .from('invoice_payments')
        .insert([{
          invoice_id: id,
          payment_date: paymentDate,
          amount_paid: remainingBalance,
          payment_mode: paymentMode,
          reference_number: referenceNumber || null,
          notes: 'Final payment - Invoice completed',
        }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoice', id] });
      queryClient.invalidateQueries({ queryKey: ['invoice-payments', id] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast({ title: 'Invoice marked as paid' });
      setCompletePaymentOpen(false);
      resetPaymentForm();
    },
    onError: (error: Error) => {
      toast({ title: error.message || 'Failed to complete payment', variant: 'destructive' });
    },
  });

  const resetPaymentForm = () => {
    setPaymentDate(format(new Date(), 'yyyy-MM-dd'));
    setAmountPaid('');
    setPaymentMode('cash');
    setReferenceNumber('');
    setNotes('');
  };

  const getPaymentStatusBadge = (status: string) => {
    const styles = {
      paid: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
      partial: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
      unpaid: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
    };
    
    const icons = {
      paid: <CheckCircle2 className="w-3 h-3" />,
      partial: <Clock className="w-3 h-3" />,
      unpaid: <AlertCircle className="w-3 h-3" />,
    };

    return (
      <Badge className={`${styles[status as keyof typeof styles]} flex items-center gap-1`}>
        {icons[status as keyof typeof icons]}
        {status.toUpperCase()}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <p className="text-lg text-muted-foreground">Invoice not found</p>
        <Button onClick={() => navigate('/admin/invoices')} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  const formattedInvoiceNumber = `FF/${new Date(invoice.invoice_date).getFullYear()}-${(new Date(invoice.invoice_date).getFullYear() + 1) % 100}/${String(invoice.invoice_number).padStart(4, '0')}`;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/admin/invoices')}
            className="hover-scale"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Invoice {formattedInvoiceNumber}
            </h1>
            <p className="text-muted-foreground">{invoice.customers.company_name}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/admin/invoices/edit/${id}`)}>
            Edit Invoice
          </Button>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Status Card */}
        <Card className="border-2 hover:shadow-lg transition-all">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Payment Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Status</span>
              {getPaymentStatusBadge(invoice.payment_status)}
            </div>
            <Separator />
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Amount</span>
                <span className="font-semibold">₹{invoice.total_amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Paid Amount</span>
                <span className="font-semibold text-emerald-600">₹{(invoice.paid_amount || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Balance</span>
                <span className="font-semibold text-rose-600">₹{(invoice.balance_amount || 0).toFixed(2)}</span>
              </div>
            </div>
            
            {invoice.payment_status !== 'paid' && (
              <>
                <Separator />
                <div className="space-y-2">
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => setAddPaymentOpen(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Payment
                  </Button>
                  <Button
                    className="w-full"
                    onClick={() => setCompletePaymentOpen(true)}
                    disabled={invoice.balance_amount <= 0}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Mark as Paid
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Invoice Details */}
        <Card className="lg:col-span-2 border-2 hover:shadow-lg transition-all">
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Invoice Date</span>
              <p className="font-medium">{format(new Date(invoice.invoice_date), 'dd MMM yyyy')}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Invoice Type</span>
              <p className="font-medium">{invoice.invoice_type}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Packages</span>
              <p className="font-medium">{invoice.number_of_packages}</p>
            </div>
            {invoice.purchase_order_no && (
              <div>
                <span className="text-muted-foreground">PO Number</span>
                <p className="font-medium">{invoice.purchase_order_no}</p>
              </div>
            )}
            <div className="col-span-2">
              <span className="text-muted-foreground">Delivery Address</span>
              <p className="font-medium">{invoice.delivery_address}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoice Items */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle>Invoice Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>HSN Code</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.invoice_items.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.products.name}</TableCell>
                  <TableCell>{item.hsn_code}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>₹{item.price.toFixed(2)}</TableCell>
                  <TableCell className="text-right">₹{item.amount.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Payment History */}
      {payments && payments.length > 0 && (
        <Card className="border-2">
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment: any) => (
                  <TableRow key={payment.id}>
                    <TableCell>{format(new Date(payment.payment_date), 'dd MMM yyyy')}</TableCell>
                    <TableCell className="font-semibold text-emerald-600">
                      ₹{payment.amount_paid.toFixed(2)}
                    </TableCell>
                    <TableCell className="capitalize">{payment.payment_mode.replace('_', ' ')}</TableCell>
                    <TableCell>{payment.reference_number || '-'}</TableCell>
                    <TableCell>{payment.notes || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Add Payment Dialog */}
      <Dialog open={addPaymentOpen} onOpenChange={setAddPaymentOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Balance: ₹{(invoice.balance_amount || 0).toFixed(2)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="payment-date">Payment Date</Label>
              <Input
                id="payment-date"
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="amount">Amount Paid *</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                step="0.01"
                max={invoice.balance_amount}
              />
            </div>
            <div>
              <Label htmlFor="payment-mode">Payment Mode</Label>
              <Select value={paymentMode} onValueChange={setPaymentMode}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="reference">Reference Number</Label>
              <Input
                id="reference"
                placeholder="Transaction ID / Cheque No."
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddPaymentOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => addPaymentMutation.mutate()}>
              Record Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Complete Payment Dialog */}
      <Dialog open={completePaymentOpen} onOpenChange={setCompletePaymentOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Payment</DialogTitle>
            <DialogDescription>
              This will mark the invoice as fully paid with the remaining balance of ₹{(invoice.balance_amount || 0).toFixed(2)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="complete-date">Payment Date</Label>
              <Input
                id="complete-date"
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="complete-mode">Payment Mode</Label>
              <Select value={paymentMode} onValueChange={setPaymentMode}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="complete-reference">Reference Number</Label>
              <Input
                id="complete-reference"
                placeholder="Transaction ID / Cheque No."
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCompletePaymentOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => completePaymentMutation.mutate()}>
              Mark as Paid
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}