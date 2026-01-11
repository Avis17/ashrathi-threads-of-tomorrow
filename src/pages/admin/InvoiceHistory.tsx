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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Download, Trash2, Search, Eye, Edit } from 'lucide-react';
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
import { useNavigate } from 'react-router-dom';
// Dynamic import for jsPDF - reduces bundle size
const loadPdfLibs = async () => {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable')
  ]);
  return { jsPDF, autoTable };
};
import logo from '@/assets/logo.png';
import signature from '@/assets/signature.png';
import { Badge } from '@/components/ui/badge';
import { formatCurrencyAscii, sanitizePdfText, numberToWords, formatInvoiceNumber, groupByHSN } from '@/lib/invoiceUtils';

const ITEMS_PER_PAGE = 10;

export default function InvoiceHistory() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [currentPage, setCurrentPage] = useState(1);
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all');
  const [deletingInvoice, setDeletingInvoice] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: invoices, isLoading } = useQuery({
    queryKey: ['invoices', debouncedSearch, currentPage, paymentStatusFilter],
    queryFn: async () => {
      let query = supabase
        .from('invoices')
        .select('*, customers(*), invoice_items(*, products(name, product_code))', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (debouncedSearch) {
        query = query.or(`invoice_number.eq.${debouncedSearch},customers.company_name.ilike.%${debouncedSearch}%`);
      }

      if (paymentStatusFilter !== 'all') {
        query = query.eq('payment_status', paymentStatusFilter);
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

    const { jsPDF, autoTable } = await loadPdfLibs();
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;
    let currentY = 50;
    const formattedInvoiceNumber = formatInvoiceNumber(invoice.invoice_number, new Date(invoice.invoice_date));

    // Helper to add header on each page
    const addHeader = () => {
      // Company details on LEFT, Logo on RIGHT
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(45, 64, 87); // Feather Navy #2D4057
      doc.text('Feather Fashions', 15, 18);
      
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(100, 100, 100);
      doc.text('Crafted with Precision, Designed for Comfort', 15, 23);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(60, 60, 60);
      const companyAddress = settings.company_address || 'Vadivel Nagar, 251/1, Thottipalayam, Pooluvapatti, Tiruppur, Tamil Nadu 641602';
      const addressLines = doc.splitTextToSize(companyAddress, 90);
      let yPos = 28;
      addressLines.forEach((line: string) => {
        doc.text(line, 15, yPos);
        yPos += 4;
      });
      doc.text(`GST: ${settings.company_gst_number || 'N/A'}`, 15, yPos);
      doc.text(`Email: ${settings.company_email || 'hello@featherfashions.in'}`, 15, yPos + 4);
      doc.text(`Website: ${settings.company_website || 'featherfashions.in'}`, 15, yPos + 8);

      // Logo on the RIGHT
      try {
        doc.addImage(logo, 'PNG', pageWidth - 45, 12, 30, 30);
      } catch (error) {
        console.error('Failed to add logo:', error);
      }

      doc.setDrawColor(184, 134, 11); // Feather Gold accent
      doc.setLineWidth(1);
      doc.line(15, 48, pageWidth - 15, 48);
    };

    // Function to add watermark on page
    const addWatermark = () => {
      const logoWidth = 150;
      const logoHeight = 150;
      const centerX = pageWidth / 2;
      const centerY = pageHeight / 2;
      
      try {
        doc.saveGraphicsState();
        doc.setGState({ opacity: 0.15 });
        doc.addImage(
          logo,
          'PNG',
          centerX - (logoWidth / 2),
          centerY - (logoHeight / 2),
          logoWidth,
          logoHeight,
          undefined,
          'NONE',
          -45
        );
        doc.restoreGraphicsState();
      } catch (error) {
        console.error('Failed to add watermark logo:', error);
      }
    };

    const ensureSpace = (height: number) => {
      const bottomMargin = 25;
      if (currentY + height > pageHeight - bottomMargin) {
        doc.addPage();
        addHeader();
        addWatermark();
        currentY = 57;
      }
    };

    // Add header and watermark for first page
    addHeader();
    addWatermark();

    // Premium styled invoice header bar
    currentY = 55;
    doc.setFillColor(45, 64, 87); // Feather Navy
    doc.roundedRect(15, currentY, pageWidth - 30, 10, 1, 1, 'F');
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(`TAX INVOICE — ${formattedInvoiceNumber}`, pageWidth / 2, currentY + 7, { align: 'center' });

    // Invoice details
    currentY = 70;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    doc.text(`Date: ${format(new Date(invoice.invoice_date), 'dd/MM/yyyy')}`, 15, currentY);
    
    currentY = 75;
    if (invoice.purchase_order_no) {
      doc.text(`PO No: ${invoice.purchase_order_no}`, 15, currentY);
    }
    doc.text(`Packages: ${invoice.number_of_packages}`, 140, currentY);

    // Bill To & Delivery Address
    currentY = 80;
    doc.setDrawColor(220, 220, 220);
    doc.setFillColor(255, 253, 247); // Warm cream tint
    doc.roundedRect(15, currentY, 85, 28, 2, 2, 'FD');
    doc.roundedRect(110, currentY, 85, 28, 2, 2, 'FD');

    // Bill To
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Bill To:', 18, currentY + 6);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(invoice.customers.company_name || '', 18, currentY + 12);
    doc.text(invoice.customers.email || '', 18, currentY + 17);
    doc.text(invoice.customers.phone || '', 18, currentY + 22);
    if (invoice.customers.gst_number) {
      doc.text(`GST: ${invoice.customers.gst_number}`, 18, currentY + 27);
    }

    // Delivery Address
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Delivery Address:', 113, currentY + 6);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const addressLines = doc.splitTextToSize(invoice.delivery_address || '', 78);
    doc.text(addressLines, 113, currentY + 12);

    currentY += 34;

    // Products table
    autoTable(doc, {
      startY: currentY,
      head: [['S.No', 'Product Description', 'HSN Code', 'Qty', 'Unit Price', 'Amount']],
      body: invoice.invoice_items.map((item: any, index: number) => {
        // Handle both custom products and regular products safely
        const productName = item.custom_product_name || item.products?.name || 'Unknown Product';
        const productCode = item.product_code || item.products?.product_code || '';
        const wrappedName = doc.splitTextToSize(`${productName}\n${productCode}`, 58);
        return [
          index + 1,
          wrappedName.join('\n'),
          item.hsn_code || '-',
          item.quantity,
          formatCurrencyAscii(item.price),
          formatCurrencyAscii(item.amount),
        ];
      }),
      theme: 'grid',
      headStyles: { 
        fillColor: [45, 64, 87], // Feather Navy
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 9,
        halign: 'center'
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 15 },
        1: { halign: 'left', cellWidth: 'auto', minCellWidth: 50 },
        2: { halign: 'center', cellWidth: 25 },
        3: { halign: 'center', cellWidth: 15 },
        4: { halign: 'right', cellWidth: 34, overflow: 'hidden' },
        5: { halign: 'right', cellWidth: 34, overflow: 'hidden' }
      },
      styles: {
        fontSize: 9,
        cellPadding: 3,
        overflow: 'linebreak',
        cellWidth: 'wrap'
      },
      rowPageBreak: 'avoid',
      alternateRowStyles: { fillColor: [255, 253, 247] }, // Warm cream
      margin: { left: 15, right: 15, top: 57, bottom: 25 },
      showHead: 'everyPage',
      didDrawPage: () => {
        const pageW = (doc as any).internal.pageSize.getWidth();
        const pageH = (doc as any).internal.pageSize.getHeight();
        const currentPage = (doc as any).internal.getCurrentPageInfo().pageNumber;
        
        if (currentPage > 1) {
          addHeader();
          addWatermark();
        }
        
        // Premium footer bar with brand message
        doc.setFillColor(45, 64, 87); // Feather Navy
        doc.rect(0, pageH - 18, pageW, 18, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text('Thank you for supporting Feather Fashions', pageW / 2, pageH - 11, { align: 'center' });
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(7);
        doc.text('Crafted with precision, designed for comfort', pageW / 2, pageH - 6.5, { align: 'center' });
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        const pageCount = (doc as any).internal.getNumberOfPages();
        doc.text(`Page ${currentPage} of ${pageCount}`, pageW / 2, pageH - 2.5, { align: 'center' });
        doc.setTextColor(0, 0, 0);
      }
    });

    currentY = (doc as any).lastAutoTable.finalY + 10;

    // HSN Summary Table
    const hasValidHSN = invoice.invoice_items.some((item: any) => item.hsn_code && item.hsn_code.trim() !== '');
    
    if (hasValidHSN) {
      ensureSpace(40);
      const hsnGroups = groupByHSN(invoice.invoice_items.filter((item: any) => item.hsn_code && item.hsn_code.trim() !== '').map((item: any) => ({
        hsn_code: item.hsn_code || '-',
        quantity: item.quantity,
        amount: item.amount
      })));

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('HSN Summary', 15, currentY);
      currentY += 5;

      autoTable(doc, {
        startY: currentY,
        head: [['HSN Code', 'Total Qty', 'Taxable Amount']],
        body: Object.entries(hsnGroups).map(([hsn, data]) => [
          hsn,
          data.qty.toString(),
          formatCurrencyAscii(data.amount)
        ]),
        theme: 'plain',
        headStyles: {
          fillColor: [248, 250, 252],
          textColor: [0, 0, 0],
          fontStyle: 'bold',
          fontSize: 9,
          halign: 'left'
        },
        bodyStyles: {
          fontSize: 8,
          textColor: [0, 0, 0]
        },
        columnStyles: {
          0: { cellWidth: 40, halign: 'left' },
          1: { halign: 'left', cellWidth: 30 },
          2: { halign: 'left', cellWidth: 40 }
        },
        margin: { left: 15, right: 15 },
        tableWidth: 110
      });

      currentY = (doc as any).lastAutoTable.finalY + 10;
    }

    ensureSpace(80);

    // Totals Section
    doc.setDrawColor(220, 220, 220);
    doc.setFillColor(250, 250, 250);
    const discount = invoice.discount || 0;
    const hasIGST = invoice.igst_amount > 0;
    const totalsHeight = hasIGST ? (discount > 0 ? 27 : 22) : (discount > 0 ? 35 : 30);
    doc.roundedRect(130, currentY, 65, totalsHeight, 2, 2, 'FD');

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    let yOffset = currentY + 6;
    
    doc.text('Subtotal:', 133, yOffset);
    doc.text(sanitizePdfText(formatCurrencyAscii(invoice.subtotal)), 192, yOffset, { align: 'right' });
    yOffset += 5;

    if (hasIGST) {
      doc.text(`IGST (${invoice.igst_rate}%):`, 133, yOffset);
      doc.text(sanitizePdfText(formatCurrencyAscii(invoice.igst_amount)), 192, yOffset, { align: 'right' });
      yOffset += 5;
    } else {
      doc.text(`CGST (${invoice.cgst_rate}%):`, 133, yOffset);
      doc.text(sanitizePdfText(formatCurrencyAscii(invoice.cgst_amount)), 192, yOffset, { align: 'right' });
      yOffset += 5;
      doc.text(`SGST (${invoice.sgst_rate}%):`, 133, yOffset);
      doc.text(sanitizePdfText(formatCurrencyAscii(invoice.sgst_amount)), 192, yOffset, { align: 'right' });
      yOffset += 5;
    }

    if (discount > 0) {
      doc.setFont('helvetica', 'normal');
      doc.text('Discount:', 133, yOffset);
      doc.text(`- ${sanitizePdfText(formatCurrencyAscii(discount))}`, 192, yOffset, { align: 'right' });
      yOffset += 5;
    }

    // Grand Total
    doc.setFillColor(52, 180, 148);
    doc.roundedRect(130, yOffset - 2, 65, 7, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text('Grand Total:', 133, yOffset + 2);
    doc.text(sanitizePdfText(formatCurrencyAscii(invoice.total_amount)), 192, yOffset + 2, { align: 'right' });
    doc.setTextColor(0, 0, 0);

    // Amount in words
    const amountInWords = numberToWords(Math.floor(invoice.total_amount));
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Amount in Words:', 15, currentY + 6);
    doc.setFont('helvetica', 'normal');
    const wordsText = `Rupees ${amountInWords} Only`;
    const wrappedWords = doc.splitTextToSize(wordsText, 105);
    doc.text(wrappedWords, 15, currentY + 12);
    
    currentY += totalsHeight + 10;

    // Payment & Bank Details
    ensureSpace(26);
    doc.setDrawColor(220, 220, 220);
    doc.setFillColor(255, 253, 247); // Warm cream
    doc.roundedRect(15, currentY, 180, 20, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Payment Mode:', 18, currentY + 6);
    doc.setFont('helvetica', 'normal');
    doc.text(settings.payment_modes || 'Cash / Bank Transfer / UPI', 50, currentY + 6);

    doc.setFont('helvetica', 'bold');
    doc.text('Bank Details:', 18, currentY + 11);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const bankDetails = `Bank: ${settings.bank_name || 'N/A'} | A/C No: ${settings.bank_account_number || 'N/A'} | IFSC: ${settings.bank_ifsc_code || 'N/A'} | Branch: ${settings.bank_branch || 'N/A'}`;
    doc.text(bankDetails, 18, currentY + 15);
    
    currentY += 26;

    // Terms & Conditions
    const terms = invoice.terms_and_conditions && invoice.terms_and_conditions.length > 0 && invoice.terms_and_conditions.some((t: string) => t.trim() !== '')
      ? invoice.terms_and_conditions.filter((t: string) => t.trim() !== '')
      : (Array.isArray(settings.default_terms) ? settings.default_terms : []);
    
    if (terms.length > 0) {
      const termsHeight = 5 + (terms.length * 4) + 5;
      ensureSpace(termsHeight);
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('Terms & Conditions:', 15, currentY);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      terms.forEach((term: string, index: number) => {
        if (term.trim()) {
          doc.text(`${index + 1}. ${term}`, 15, currentY + 5 + (index * 4));
        }
      });
      
      currentY += termsHeight;
    }

    // Signature Section
    ensureSpace(25);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Authorized Signatory', 155, currentY);
    
    try {
      doc.addImage(signature, 'PNG', 150, currentY + 3, 40, 15);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.text('(Company Seal)', 165, currentY + 20, { align: 'center' });
    } catch (error) {
      console.error('Failed to add signature:', error);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.text('(Signature & Company Seal)', 165, currentY + 10, { align: 'center' });
    }

    doc.save(`Invoice_${formattedInvoiceNumber.replace(/\//g, '_')}_${invoice.customers.company_name.replace(/\s+/g, '_')}.pdf`);
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
        <Select value={paymentStatusFilter} onValueChange={(value) => {
          setPaymentStatusFilter(value);
          setCurrentPage(1);
        }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Payment Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="unpaid">Unpaid</SelectItem>
            <SelectItem value="partial">Partial</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
          </SelectContent>
        </Select>
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
              <TableHead>Payment Status</TableHead>
              <TableHead>Invoice Date</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices?.data?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-64">
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
              invoices?.data?.map((invoice: any, index: number) => {
                const getPaymentStatusBadge = (status: string) => {
                  const styles = {
                    paid: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
                    partial: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
                    unpaid: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
                  };
                  return (
                    <Badge className={styles[status as keyof typeof styles] || styles.unpaid}>
                      {status.toUpperCase()}
                    </Badge>
                  );
                };
                
                return (
                  <TableRow key={invoice.id}>
                    <TableCell>{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</TableCell>
                    <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                    <TableCell>{invoice.customers.company_name}</TableCell>
                    <TableCell className="max-w-xs truncate">{invoice.delivery_address}</TableCell>
                    <TableCell>₹{invoice.total_amount.toFixed(2)}</TableCell>
                    <TableCell>{getPaymentStatusBadge(invoice.payment_status || 'unpaid')}</TableCell>
                    <TableCell>{format(new Date(invoice.invoice_date), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>{format(new Date(invoice.created_at), 'dd/MM/yyyy HH:mm')}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/admin/invoices/${invoice.id}`)}
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/admin/invoices/edit/${invoice.id}`)}
                          title="Edit Invoice"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => downloadInvoice(invoice)}
                          title="Download PDF"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeletingInvoice(invoice.id)}
                          title="Delete Invoice"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
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