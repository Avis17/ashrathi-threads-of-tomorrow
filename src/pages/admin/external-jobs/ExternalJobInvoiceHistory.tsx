import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Eye, Search, FileText, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatCurrencyAscii, numberToWords, sanitizePdfText, formatInvoiceNumberWithTemplate } from "@/lib/invoiceUtils";
import logo from "@/assets/logo.png";
import signature from "@/assets/signature.png";
import { toast } from "sonner";

interface ExternalJobInvoice {
  id: string;
  invoice_number: string;
  invoice_date: string | null;
  invoice_data: any;
  job_order_id: string;
  created_at: string | null;
  external_job_orders: {
    job_id: string;
    style_name: string;
    number_of_pieces: number;
    rate_per_piece: number;
    total_amount: number;
    total_with_gst: number | null;
    gst_percentage: number | null;
    accessories_cost: number | null;
    delivery_charge: number | null;
    is_custom_job: boolean | null;
    custom_products_data: any;
    external_job_companies: {
      company_name: string;
      address: string;
      contact_number: string;
      gst_number: string | null;
    };
  };
}

const ExternalJobInvoiceHistory = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const { data: invoices, isLoading } = useQuery({
    queryKey: ['external-job-invoices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('external_job_invoices')
        .select(`
          *,
          external_job_orders (
            job_id,
            style_name,
            number_of_pieces,
            rate_per_piece,
            total_amount,
            total_with_gst,
            gst_percentage,
            accessories_cost,
            delivery_charge,
            is_custom_job,
            custom_products_data,
            external_job_companies (
              company_name,
              address,
              contact_number,
              gst_number
            )
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ExternalJobInvoice[];
    },
  });

  const { data: invoiceSettings } = useQuery({
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

  const filteredInvoices = invoices?.filter((invoice) => {
    const searchLower = search.toLowerCase();
    return (
      invoice.invoice_number.toLowerCase().includes(searchLower) ||
      invoice.external_job_orders?.job_id?.toLowerCase().includes(searchLower) ||
      invoice.external_job_orders?.style_name?.toLowerCase().includes(searchLower) ||
      invoice.external_job_orders?.external_job_companies?.company_name?.toLowerCase().includes(searchLower)
    );
  });

  const downloadInvoice = (invoice: ExternalJobInvoice) => {
    const jobOrder = invoice.external_job_orders;
    const company = jobOrder.external_job_companies;
    const invoiceData = invoice.invoice_data || {};
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // Company details (left side)
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Feather Fashions", 14, 15);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Vadivel Nagar, 251/1, Thottipalayam", 14, 20);
    doc.text("Pooluvapatti, Tiruppur, TN - 641602", 14, 24);
    doc.text("GST: 33FWTPS1281P1ZJ", 14, 28);
    doc.text("Ph: +91 97892 25510", 14, 32);

    // Add logo
    doc.addImage(logo, "PNG", pageWidth - 50, 4, 45, 35);

    // Invoice title
    const invoiceType = invoiceData.invoiceType || 'without_gst';
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(invoiceType === "with_gst" ? "TAX INVOICE" : "INVOICE", pageWidth / 2, 45, { align: "center" });

    // Invoice number and date
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const invoiceDate = invoice.invoice_date ? new Date(invoice.invoice_date) : new Date();
    const invoiceFormat = invoiceSettings?.invoice_number_format || 'FF/{fiscal_year}/{number}';
    const formattedInvoiceNumber = formatInvoiceNumberWithTemplate(
      parseInt(invoice.invoice_number), 
      invoiceDate, 
      invoiceFormat
    );
    doc.text(`Invoice No: ${formattedInvoiceNumber}`, 14, 55);
    doc.text(`Date: ${format(invoiceDate, 'dd-MM-yyyy')}`, pageWidth - 14, 55, { align: "right" });

    // Bill to
    doc.setFont("helvetica", "bold");
    doc.text("Bill To:", 14, 65);
    doc.setFont("helvetica", "normal");
    doc.text(sanitizePdfText(company.company_name), 14, 70);
    const addressLines = doc.splitTextToSize(sanitizePdfText(company.address), 80);
    doc.text(addressLines, 14, 75);
    doc.text(`Contact: ${company.contact_number}`, 14, 75 + (addressLines.length * 5));
    if (company.gst_number) {
      doc.text(`GST: ${company.gst_number}`, 14, 80 + (addressLines.length * 5));
    }

    // Table
    const tableStartY = 95 + (addressLines.length * 5);
    
    const isCustomJob = jobOrder.is_custom_job;
    const customProducts = jobOrder.custom_products_data as Array<{
      name: string;
      rate: number;
      quantity: number;
      total: number;
    }> | null;
    
    let subtotal = 0;
    const tableData: string[][] = [];
    
    if (isCustomJob && customProducts && customProducts.length > 0) {
      customProducts.forEach((product, index) => {
        const lineTotal = product.rate * product.quantity;
        subtotal += lineTotal;
        tableData.push([
          (index + 1).toString(),
          sanitizePdfText(product.name),
          product.quantity.toString(),
          formatCurrencyAscii(product.rate),
          formatCurrencyAscii(lineTotal),
        ]);
      });
    } else {
      subtotal = jobOrder.rate_per_piece * jobOrder.number_of_pieces;
      tableData.push([
        "1",
        sanitizePdfText(jobOrder.style_name),
        jobOrder.number_of_pieces.toString(),
        formatCurrencyAscii(jobOrder.rate_per_piece),
        formatCurrencyAscii(subtotal),
      ]);
    }
    
    const gstRate = invoiceData.gstRate || jobOrder.gst_percentage || 0;
    let cgstAmount = 0;
    let sgstAmount = 0;
    let total = subtotal;

    if (invoiceType === "with_gst" && gstRate > 0) {
      const rate = gstRate / 2;
      cgstAmount = (subtotal * rate) / 100;
      sgstAmount = (subtotal * rate) / 100;
      total = subtotal + cgstAmount + sgstAmount;
    }

    if (jobOrder.accessories_cost) total += jobOrder.accessories_cost;
    if (jobOrder.delivery_charge) total += jobOrder.delivery_charge;

    if (jobOrder.accessories_cost && jobOrder.accessories_cost > 0) {
      tableData.push(["", "Accessories Cost", "", "", formatCurrencyAscii(jobOrder.accessories_cost)]);
    }

    if (jobOrder.delivery_charge && jobOrder.delivery_charge > 0) {
      tableData.push(["", "Delivery Charge", "", "", formatCurrencyAscii(jobOrder.delivery_charge)]);
    }

    autoTable(doc, {
      startY: tableStartY,
      head: [["S.No", "Description", "Qty", "Rate/Pc", "Amount"]],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [45, 64, 87], textColor: 255, fontStyle: "bold" },
      styles: { fontSize: 10, cellPadding: 4 },
      columnStyles: {
        0: { halign: "center", cellWidth: 20 },
        1: { halign: "left", cellWidth: 80 },
        2: { halign: "center", cellWidth: 25 },
        3: { halign: "right", cellWidth: 30 },
        4: { halign: "right", cellWidth: 35 },
      },
    });

    let finalY = (doc as any).lastAutoTable.finalY + 5;

    if (invoiceType === "with_gst" && gstRate > 0) {
      doc.text(`Subtotal: ${formatCurrencyAscii(subtotal)}`, pageWidth - 14, finalY, { align: "right" });
      doc.text(`CGST @ ${gstRate / 2}%: ${formatCurrencyAscii(cgstAmount)}`, pageWidth - 14, finalY + 5, { align: "right" });
      doc.text(`SGST @ ${gstRate / 2}%: ${formatCurrencyAscii(sgstAmount)}`, pageWidth - 14, finalY + 10, { align: "right" });
      doc.setFont("helvetica", "bold");
      doc.text(`Total: ${formatCurrencyAscii(total)}`, pageWidth - 14, finalY + 18, { align: "right" });
      finalY += 18;
    } else {
      doc.setFont("helvetica", "bold");
      doc.text(`Total: ${formatCurrencyAscii(total)}`, pageWidth - 14, finalY, { align: "right" });
    }

    // Amount in words
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    const amountInWords = numberToWords(Math.round(total));
    doc.text(`Amount in words: ${amountInWords} Rupees Only`, 14, finalY + 10);

    // Payment details
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Payment Details:", 14, finalY + 20);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    
    const accountType = invoiceData.accountType || 'company';
    if (accountType === "company") {
      doc.text(`Bank: ${invoiceData.bankName || 'Kotak Mahindra Bank'}`, 14, finalY + 25);
      doc.text(`A/c: ${invoiceData.accountNumber || '1600000017'}`, 14, finalY + 30);
      doc.text(`IFSC: ${invoiceData.ifscCode || 'KKBK0008823'}`, 14, finalY + 35);
      doc.text(`Branch: ${invoiceData.branch || 'PN Road, Tirupur'}`, 14, finalY + 40);
    } else {
      doc.text(`Phone/GPay/PhonePe: ${invoiceData.phoneNumber || '9629336553'}`, 14, finalY + 25);
      doc.text(`UPI ID: ${invoiceData.upiId || 'pvadivelsiva1@ybl'}`, 14, finalY + 30);
    }

    // Signature
    doc.addImage(signature, "PNG", pageWidth - 50, finalY + 20, 35, 20);
    doc.setFont("helvetica", "bold");
    doc.text("Authorized Signatory", pageWidth - 32, finalY + 45, { align: "center" });

    // Footer
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    const footerY = doc.internal.pageSize.height - 20;
    doc.text("Thank you for your business!", pageWidth / 2, footerY, { align: "center" });
    doc.text("Feather Fashions - Crafted with precision, designed for comfort", pageWidth / 2, footerY + 5, { align: "center" });

    const invoiceSuffix = invoice.invoice_number.slice(-4).padStart(4, '0');
    doc.save(`Job-Invoice-${jobOrder.job_id}-${invoiceSuffix}.pdf`);
    toast.success('Invoice downloaded successfully');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/admin/external-jobs")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Invoice History</h1>
          <p className="text-muted-foreground mt-1">
            View and download all generated invoices for external job orders
          </p>
        </div>
      </div>

      <Card className="p-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by invoice number, job ID, style, or company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Badge variant="secondary" className="text-sm">
            {filteredInvoices?.length || 0} invoices
          </Badge>
        </div>

        {filteredInvoices && filteredInvoices.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice No.</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Job ID</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Style</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => {
                const invoiceDate = invoice.invoice_date ? new Date(invoice.invoice_date) : new Date(invoice.created_at || '');
                const invoiceFormat = invoiceSettings?.invoice_number_format || 'FF/{fiscal_year}/{number}';
                const formattedNumber = formatInvoiceNumberWithTemplate(
                  parseInt(invoice.invoice_number),
                  invoiceDate,
                  invoiceFormat
                );
                const amount = invoice.external_job_orders?.total_with_gst || invoice.external_job_orders?.total_amount || 0;
                
                return (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-mono font-medium">
                      {formattedNumber}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {format(invoiceDate, 'dd MMM yyyy')}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono">
                      {invoice.external_job_orders?.job_id || '-'}
                    </TableCell>
                    <TableCell>
                      {invoice.external_job_orders?.external_job_companies?.company_name || '-'}
                    </TableCell>
                    <TableCell>
                      {invoice.external_job_orders?.style_name || '-'}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrencyAscii(amount)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/admin/external-jobs/details/${invoice.job_order_id}`)}
                          title="View Job Order"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => downloadInvoice(invoice)}
                          title="Download Invoice"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">No invoices found</h3>
            <p className="text-muted-foreground">
              {search ? 'No invoices match your search criteria.' : 'No invoices have been generated yet.'}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ExternalJobInvoiceHistory;
