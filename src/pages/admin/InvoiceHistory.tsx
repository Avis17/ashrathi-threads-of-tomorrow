import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDebounce } from '@/hooks/useDebounce';
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
import logo from '@/assets/logo.png';
import signature from '@/assets/signature.png';

const ITEMS_PER_PAGE = 10;

export default function InvoiceHistory() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingInvoice, setDeletingInvoice] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: invoices, isLoading } = useQuery({
    queryKey: ['invoices', debouncedSearch, currentPage],
    queryFn: async () => {
      let query = supabase
        .from('invoices')
        .select('*, customers(company_name), invoice_items(*, products(name))', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (debouncedSearch) {
        query = query.or(`invoice_number.eq.${debouncedSearch},customers.company_name.ilike.%${debouncedSearch}%`);
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
    // Fetch invoice settings for consistent formatting
    const { data: settings } = await supabase
      .from('invoice_settings')
      .select('*')
      .single();

    if (!settings) {
      toast({ title: 'Invoice settings not found', variant: 'destructive' });
      return;
    }

    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;

    // Helper to add header
    const addHeader = () => {
      try {
        doc.addImage(logo, 'PNG', 15, 12, 25, 25);
      } catch (error) {
        console.error('Failed to add logo:', error);
      }
      
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(31, 120, 110);
      doc.text(settings.company_name || 'Feather Fashions', 45, 20);
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(100, 100, 100);
      doc.text(settings.company_tagline || 'Feather-Light Comfort. Limitless Style.', 45, 26);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(60, 60, 60);
      doc.text(settings.company_address || '', 15, 34);
      doc.text(
        `GSTIN: ${settings.company_gst_number || 'N/A'} | Phone: ${settings.company_phone || ''} | Email: ${settings.company_email || ''}`,
        15, 39
      );
      doc.text(`Website: ${settings.company_website || ''}`, 15, 44);

      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.line(15, 48, pageWidth - 15, 48);
    };

    addHeader();

    // Watermark
    doc.setTextColor(245, 245, 245);
    doc.setFontSize(70);
    doc.setFont('helvetica', 'bold');
    doc.text('FEATHER FASHIONS', pageWidth / 2, pageHeight / 2, { align: 'center', angle: -45 });
    doc.setTextColor(0, 0, 0);

    // TAX INVOICE header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(invoice.invoice_type === 'tax' ? 'TAX INVOICE' : 'INVOICE', pageWidth / 2, 57, { align: 'center' });

    // Invoice details
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const formattedNum = `FF/${new Date(invoice.invoice_date).getFullYear()}-${(new Date(invoice.invoice_date).getFullYear() + 1) % 100}/${String(invoice.invoice_number).padStart(4, '0')}`;
    doc.text(`Invoice No: ${formattedNum}`, 15, 65);
    doc.text(`Date: ${format(new Date(invoice.invoice_date), 'dd/MM/yyyy')}`, 140, 65);
    if (invoice.purchase_order_no) {
      doc.text(`PO No: ${invoice.purchase_order_no}`, 15, 71);
    }
    doc.text(`Packages: ${invoice.number_of_packages}`, 140, 71);

    // Bill To & Delivery Address
    let currentY = 76;
    doc.setDrawColor(220, 220, 220);
    doc.setFillColor(250, 250, 250);
    doc.roundedRect(15, currentY, 85, 28, 2, 2, 'FD');
    doc.roundedRect(110, currentY, 85, 28, 2, 2, 'FD');

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Bill To:', 18, currentY + 6);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(invoice.customers.company_name, 18, currentY + 12);
    doc.text(invoice.customers.email || '', 18, currentY + 17);
    doc.text(invoice.customers.phone || '', 18, currentY + 22);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Delivery Address:', 113, currentY + 6);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const addressLines = doc.splitTextToSize(invoice.delivery_address, 78);
    doc.text(addressLines, 113, currentY + 12);

    currentY += 34;

    // Products table
    autoTable(doc, {
      startY: currentY,
      head: [['S.No', 'Product Description', 'HSN Code', 'Qty', 'Unit Price', 'Amount']],
      body: invoice.invoice_items.map((item: any, index: number) => [
        index + 1,
        item.products.name,
        item.hsn_code || 'N/A',
        item.quantity,
        `Rs ${item.price.toFixed(2)}`,
        `Rs ${item.amount.toFixed(2)}`,
      ]),
      theme: 'grid',
      headStyles: { 
        fillColor: [31, 120, 110],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 9,
        halign: 'center'
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 15 },
        1: { halign: 'left', cellWidth: 'auto' },
        2: { halign: 'center', cellWidth: 25 },
        3: { halign: 'center', cellWidth: 15 },
        4: { halign: 'right', cellWidth: 34 },
        5: { halign: 'right', cellWidth: 34 }
      },
      styles: { fontSize: 9, cellPadding: 3 },
      alternateRowStyles: { fillColor: [248, 248, 248] },
      margin: { left: 15, right: 15 },
      didDrawPage: () => {
        addHeader();
        // Footer
        doc.setFillColor(52, 180, 148);
        doc.rect(0, pageHeight - 15, pageWidth, 15, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text('Feather Fashions • Comfort • Style • Sustainability', pageWidth / 2, pageHeight - 10, { align: 'center' });
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.text(`featherfashions.shop | Page ${(doc as any).internal.getCurrentPageInfo().pageNumber} of ${(doc as any).internal.getNumberOfPages()}`, pageWidth / 2, pageHeight - 5, { align: 'center' });
        doc.setTextColor(0, 0, 0);
      }
    });

    currentY = (doc as any).lastAutoTable.finalY + 10;

    // Totals
    doc.setDrawColor(220, 220, 220);
    doc.setFillColor(250, 250, 250);
    const discount = invoice.discount || 0;
    const totalsHeight = invoice.invoice_type === 'tax' ? (discount > 0 ? 35 : 30) : (discount > 0 ? 27 : 22);
    doc.roundedRect(130, currentY, 65, totalsHeight, 2, 2, 'FD');

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    let yOffset = currentY + 6;
    
    doc.text('Subtotal:', 133, yOffset);
    doc.text(`Rs ${invoice.subtotal.toFixed(2)}`, 192, yOffset, { align: 'right' });
    yOffset += 5;

    if (invoice.invoice_type === 'tax') {
      if (invoice.igst_amount > 0) {
        doc.text(`IGST (${invoice.igst_rate}%):`, 133, yOffset);
        doc.text(`Rs ${invoice.igst_amount.toFixed(2)}`, 192, yOffset, { align: 'right' });
        yOffset += 5;
      } else {
        doc.text(`CGST (${invoice.cgst_rate}%):`, 133, yOffset);
        doc.text(`Rs ${invoice.cgst_amount.toFixed(2)}`, 192, yOffset, { align: 'right' });
        yOffset += 5;
        doc.text(`SGST (${invoice.sgst_rate}%):`, 133, yOffset);
        doc.text(`Rs ${invoice.sgst_amount.toFixed(2)}`, 192, yOffset, { align: 'right' });
        yOffset += 5;
      }
    }

    if (discount > 0) {
      doc.text('Discount:', 133, yOffset);
      doc.text(`- Rs ${discount.toFixed(2)}`, 192, yOffset, { align: 'right' });
      yOffset += 5;
    }

    // Grand Total
    doc.setFillColor(52, 180, 148);
    doc.roundedRect(130, yOffset - 2, 65, 7, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text('Grand Total:', 133, yOffset + 2);
    doc.text(`Rs ${invoice.total_amount.toFixed(2)}`, 192, yOffset + 2, { align: 'right' });
    doc.setTextColor(0, 0, 0);

    currentY += totalsHeight + 10;

    // Terms
    if (invoice.terms_and_conditions && invoice.terms_and_conditions.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('Terms & Conditions:', 15, currentY);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      invoice.terms_and_conditions.forEach((term: string, index: number) => {
        doc.text(`${index + 1}. ${term}`, 15, currentY + 5 + (index * 4));
      });
      currentY += 5 + (invoice.terms_and_conditions.length * 4);
    }

    // Signature
    currentY += 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Authorized Signatory', 155, currentY);
    try {
      doc.addImage(signature, 'PNG', 150, currentY + 3, 40, 15);
    } catch (error) {
      console.error('Failed to add signature:', error);
    }

    doc.save(`Invoice_${formattedNum.replace(/\//g, '_')}_${invoice.customers.company_name.replace(/\s+/g, '_')}.pdf`);
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
                <TableCell colSpan={8} className="h-64">
                  <div className="flex flex-col items-center justify-center space-y-4 text-center">
                    <img src="/src/assets/no-data.png" alt="No data found" className="w-48 h-36 object-contain opacity-50" />
                    <div>
                      <p className="text-lg font-semibold text-muted-foreground">No invoices found</p>
                      <p className="text-sm text-muted-foreground">Try a different search term</p>
                    </div>
                  </div>
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