import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download, Trash2, Search } from 'lucide-react';
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
import { Skeleton } from '@/components/ui/skeleton';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const ITEMS_PER_PAGE = 10;

export default function InvoiceHistory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingInvoice, setDeletingInvoice] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: invoices, isLoading } = useQuery({
    queryKey: ['invoices', searchTerm, currentPage],
    queryFn: async () => {
      let query = supabase
        .from('invoices')
        .select('*, customers(company_name), invoice_items(*, products(name))', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`invoice_number.eq.${searchTerm},customers.company_name.ilike.%${searchTerm}%`);
      }

      const { data, error, count } = await query
        .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1);

      if (error) throw error;
      return { data, count };
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast({ title: 'Invoice deleted successfully' });
      setDeletingInvoice(null);
    },
    onError: () => {
      toast({ title: 'Failed to delete invoice', variant: 'destructive' });
    },
  });

  const downloadInvoice = async (invoice: any) => {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text('FEATHER FASHIONS', 105, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.text('TAX INVOICE', 105, 28, { align: 'center' });

    doc.setFontSize(10);
    doc.text(`Invoice No: ${invoice.invoice_number}`, 20, 45);
    doc.text(`Date: ${format(new Date(invoice.invoice_date), 'dd/MM/yyyy')}`, 20, 52);

    doc.text('Bill To:', 20, 65);
    doc.text(invoice.customers.company_name, 20, 72);

    doc.text('Delivery Address:', 120, 65);
    const addressLines = doc.splitTextToSize(invoice.delivery_address, 70);
    doc.text(addressLines, 120, 72);

    autoTable(doc, {
      startY: 95,
      head: [['S.No', 'Product', 'HSN Code', 'Price', 'Qty', 'Amount']],
      body: invoice.invoice_items.map((item: any, index: number) => [
        index + 1,
        item.products.name,
        item.hsn_code,
        item.price.toFixed(2),
        item.quantity,
        item.amount.toFixed(2),
      ]),
      foot: [
        ['', '', '', '', 'Subtotal:', invoice.subtotal.toFixed(2)],
        ...(invoice.cgst_amount > 0 ? [
          ['', '', '', '', `CGST (${invoice.cgst_rate}%):`, invoice.cgst_amount.toFixed(2)],
          ['', '', '', '', `SGST (${invoice.sgst_rate}%):`, invoice.sgst_amount.toFixed(2)],
        ] : [
          ['', '', '', '', `IGST (${invoice.igst_rate}%):`, invoice.igst_amount.toFixed(2)],
        ]),
        ['', '', '', '', 'Total:', invoice.total_amount.toFixed(2)],
      ],
    });

    doc.save(`Invoice_${invoice.invoice_number}.pdf`);
  };

  const totalPages = invoices?.count ? Math.ceil(invoices.count / ITEMS_PER_PAGE) : 0;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Invoice History</h2>
        <p className="text-muted-foreground">View and manage all generated invoices</p>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by invoice number or customer..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10"
          />
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SI No</TableHead>
              <TableHead>Invoice No</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Delivery Address</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Invoice Date</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices?.data?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  No invoices found
                </TableCell>
              </TableRow>
            ) : (
              invoices?.data?.map((invoice: any, index: number) => (
                <TableRow key={invoice.id}>
                  <TableCell>{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</TableCell>
                  <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                  <TableCell>{invoice.customers.company_name}</TableCell>
                  <TableCell className="max-w-xs truncate">{invoice.delivery_address}</TableCell>
                  <TableCell>₹{invoice.total_amount.toFixed(2)}</TableCell>
                  <TableCell>{format(new Date(invoice.invoice_date), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>{format(new Date(invoice.created_at), 'dd/MM/yyyy HH:mm')}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => downloadInvoice(invoice)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletingInvoice(invoice.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => setCurrentPage(page)}
                  isActive={currentPage === page}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      <AlertDialog open={!!deletingInvoice} onOpenChange={() => setDeletingInvoice(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this invoice. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingInvoice && deleteMutation.mutate(deletingInvoice)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}