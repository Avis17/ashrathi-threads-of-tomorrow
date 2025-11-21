import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  FileText,
  IndianRupee,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { format } from 'date-fns';

interface CustomerOverviewProps {
  customer: any;
}

export function CustomerOverview({ customer }: CustomerOverviewProps) {
  const { data: invoices, isLoading: invoicesLoading } = useQuery({
    queryKey: ['customer-invoices', customer.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select('*, invoice_payments(*)')
        .eq('customer_id', customer.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const totalInvoices = invoices?.length || 0;
  const completedInvoices = invoices?.filter(inv => inv.payment_status === 'paid')?.length || 0;
  const totalRevenue = invoices?.reduce((sum, inv) => sum + Number(inv.total_amount), 0) || 0;
  const totalPaid = invoices?.reduce((sum, inv) => sum + Number(inv.paid_amount || 0), 0) || 0;
  const pendingAmount = invoices?.reduce((sum, inv) => sum + Number(inv.balance_amount || 0), 0) || 0;
  const overdueInvoices = invoices?.filter(inv => {
    const dueDate = new Date(inv.invoice_date);
    dueDate.setDate(dueDate.getDate() + 30);
    return inv.payment_status !== 'paid' && dueDate < new Date();
  }).length || 0;

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-primary hover-scale transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Invoices
            </CardTitle>
            <FileText className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalInvoices}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {completedInvoices} completed
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 hover-scale transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₹{totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              All time revenue
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500 hover-scale transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Amount
            </CardTitle>
            <Clock className="h-5 w-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₹{pendingAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Outstanding payments
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500 hover-scale transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Overdue Invoices
            </CardTitle>
            <AlertCircle className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{overdueInvoices}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Requires attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Customer Information */}
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Customer Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Company Name</p>
                <p className="font-medium">{customer.company_name}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{customer.email}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{customer.phone}</p>
                {customer.alt_phone && (
                  <p className="text-sm text-muted-foreground">{customer.alt_phone}</p>
                )}
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="font-medium">{customer.address_1}</p>
                {customer.address_2 && <p className="text-sm">{customer.address_2}</p>}
                <p className="text-sm">{customer.city}, {customer.state}</p>
                <p className="text-sm">{customer.pincode}, {customer.country}</p>
              </div>
            </div>
            {customer.gst_number && (
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">GST Number</p>
                  <p className="font-medium">{customer.gst_number}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Invoices */}
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Recent Invoices
          </CardTitle>
        </CardHeader>
        <CardContent>
          {invoicesLoading ? (
            <div className="text-center text-muted-foreground py-8">Loading invoices...</div>
          ) : invoices && invoices.length > 0 ? (
            <div className="space-y-3">
              {invoices.slice(0, 10).map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                      <span className="font-medium">Invoice #{invoice.invoice_number}</span>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(invoice.invoice_date), 'dd MMM yyyy')}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-lg">
                      ₹{Number(invoice.total_amount).toLocaleString()}
                    </span>
                    <Badge
                      variant={
                        invoice.status === 'paid'
                          ? 'default'
                          : invoice.status === 'overdue'
                          ? 'destructive'
                          : 'secondary'
                      }
                      className="capitalize"
                    >
                      {invoice.status === 'paid' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                      {invoice.status === 'overdue' && <AlertCircle className="h-3 w-3 mr-1" />}
                      {invoice.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              No invoices found for this customer
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
