import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, Eye, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useExternalJobOrder } from "@/hooks/useExternalJobOrders";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { formatCurrencyAscii, numberToWords, sanitizePdfText, formatInvoiceNumber } from "@/lib/invoiceUtils";
import logo from "@/assets/logo.png";
import signature from "@/assets/signature.png";
import { toast } from "sonner";
import { InvoiceLayoutEditor } from "@/components/admin/invoice-editor/InvoiceLayoutEditor";

const GenerateInvoice = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: jobOrder, isLoading } = useExternalJobOrder(id!);
  const [invoiceType, setInvoiceType] = useState<"with_gst" | "without_gst">("without_gst");
  const [gstRate, setGstRate] = useState("18");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [accountType, setAccountType] = useState<"company" | "personal">("company");
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showLayoutEditor, setShowLayoutEditor] = useState(false);
  
  // Company account details
  const [bankName, setBankName] = useState("Kotak Mahindra Bank");
  const [accountNumber, setAccountNumber] = useState("1600000017");
  const [ifscCode, setIfscCode] = useState("KKBK0008823");
  const [branch, setBranch] = useState("PN Road, Tirupur");
  
  // Personal account details
  const [phoneNumber, setPhoneNumber] = useState("9629336553");
  const [upiId, setUpiId] = useState("pvadivelsiva1@ybl");

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

  useEffect(() => {
    if (invoiceSettings) {
      setInvoiceNumber(invoiceSettings.current_invoice_number.toString());
    }
  }, [invoiceSettings]);

  const updateInvoiceNumberMutation = useMutation({
    mutationFn: async (currentNumber: number) => {
      const { error } = await supabase
        .from('job_order_invoice_settings')
        .update({ 
          current_invoice_number: currentNumber + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', invoiceSettings?.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-order-invoice-settings'] });
    },
  });

  const createPDF = (returnBlob: boolean = false): jsPDF | string => {
    if (!jobOrder) return new jsPDF();

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const company = jobOrder.external_job_companies;

    // Company details (left side)
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Feather Fashions", 14, 15);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Vadivel Nagar, 538-C, Boyampalayam PO", 14, 20);
    doc.text("Pooluvapatti, Tiruppur, TN - 641602", 14, 24);
    doc.text("GST: 33FWTPS1281P1ZJ", 14, 28);
    doc.text("Ph: +91 97892 25510", 14, 32);

    // Add logo (right side)
    doc.addImage(logo, "PNG", pageWidth - 50, 4, 45, 35);

    // Invoice title
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(invoiceType === "with_gst" ? "TAX INVOICE" : "INVOICE", pageWidth / 2, 45, { align: "center" });

    // Invoice number and date
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const formattedInvoiceNumber = invoiceNumber ? formatInvoiceNumber(parseInt(invoiceNumber), new Date()) : 'PENDING';
    doc.text(`Invoice No: ${formattedInvoiceNumber}`, 14, 55);
    doc.text(`Date: ${format(new Date(), 'dd-MM-yyyy')}`, pageWidth - 14, 55, { align: "right" });

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
    const subtotal = jobOrder.rate_per_piece * jobOrder.number_of_pieces;
    let cgstAmount = 0;
    let sgstAmount = 0;
    let total = subtotal;

    if (invoiceType === "with_gst") {
      const rate = parseFloat(gstRate) / 2;
      cgstAmount = (subtotal * rate) / 100;
      sgstAmount = (subtotal * rate) / 100;
      total = subtotal + cgstAmount + sgstAmount;
    }

    if (jobOrder.accessories_cost) total += jobOrder.accessories_cost;
    if (jobOrder.delivery_charge) total += jobOrder.delivery_charge;

    const tableData = [
      [
        "1",
        sanitizePdfText(jobOrder.style_name),
        jobOrder.number_of_pieces.toString(),
        formatCurrencyAscii(jobOrder.rate_per_piece),
        formatCurrencyAscii(subtotal),
      ],
    ];

    if (jobOrder.accessories_cost && jobOrder.accessories_cost > 0) {
      tableData.push([
        "",
        "Accessories Cost",
        "",
        "",
        formatCurrencyAscii(jobOrder.accessories_cost),
      ]);
    }

    if (jobOrder.delivery_charge && jobOrder.delivery_charge > 0) {
      tableData.push([
        "",
        "Delivery Charge",
        "",
        "",
        formatCurrencyAscii(jobOrder.delivery_charge),
      ]);
    }

    autoTable(doc, {
      startY: tableStartY,
      head: [["S.No", "Description", "Qty", "Rate/Pc", "Amount"]],
      body: tableData,
      theme: "grid",
      headStyles: {
        fillColor: [45, 64, 87],
        textColor: 255,
        fontStyle: "bold",
      },
      styles: {
        fontSize: 10,
        cellPadding: 4,
      },
      columnStyles: {
        0: { halign: "center", cellWidth: 20 },
        1: { halign: "left", cellWidth: 80 },
        2: { halign: "center", cellWidth: 25 },
        3: { halign: "right", cellWidth: 30 },
        4: { halign: "right", cellWidth: 35 },
      },
    });

    const finalY = (doc as any).lastAutoTable.finalY + 5;

    // Summary section
    if (invoiceType === "with_gst") {
      doc.text(`Subtotal: ${formatCurrencyAscii(subtotal)}`, pageWidth - 14, finalY, { align: "right" });
      doc.text(`CGST @ ${parseFloat(gstRate) / 2}%: ${formatCurrencyAscii(cgstAmount)}`, pageWidth - 14, finalY + 5, { align: "right" });
      doc.text(`SGST @ ${parseFloat(gstRate) / 2}%: ${formatCurrencyAscii(sgstAmount)}`, pageWidth - 14, finalY + 10, { align: "right" });
      doc.setFont("helvetica", "bold");
      doc.text(`Total: ${formatCurrencyAscii(total)}`, pageWidth - 14, finalY + 18, { align: "right" });
    } else {
      doc.setFont("helvetica", "bold");
      doc.text(`Total: ${formatCurrencyAscii(total)}`, pageWidth - 14, finalY, { align: "right" });
    }

    // Amount in words
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    const amountInWords = numberToWords(Math.round(total));
    doc.text(`Amount in words: ${amountInWords} Rupees Only`, 14, finalY + 25);

    // Payment details
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Payment Details:", 14, finalY + 35);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    
    if (accountType === "company") {
      doc.text(`Bank: ${bankName}`, 14, finalY + 40);
      doc.text(`A/c: ${accountNumber}`, 14, finalY + 45);
      doc.text(`IFSC: ${ifscCode}`, 14, finalY + 50);
      doc.text(`Branch: ${branch}`, 14, finalY + 55);
    } else {
      doc.text(`Phone/GPay/PhonePe: ${phoneNumber}`, 14, finalY + 40);
      doc.text(`UPI ID: ${upiId}`, 14, finalY + 45);
    }

    // Signature
    doc.addImage(signature, "PNG", pageWidth - 50, finalY + 35, 35, 20);
    doc.setFont("helvetica", "bold");
    doc.text("Authorized Signatory", pageWidth - 32, finalY + 60, { align: "center" });

    // Footer
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    const footerY = doc.internal.pageSize.height - 20;
    doc.text("Thank you for your business!", pageWidth / 2, footerY, { align: "center" });
    doc.text("Feather Fashions - Crafted with precision, designed for comfort", pageWidth / 2, footerY + 5, { align: "center" });

    if (returnBlob) {
      const blob = doc.output('blob');
      return URL.createObjectURL(blob);
    }
    
    return doc;
  };

  const handlePreview = () => {
    const blobUrl = createPDF(true) as string;
    setPreviewUrl(blobUrl);
    setShowPreview(true);
  };

  const handleClosePreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setShowPreview(false);
  };

  const handleConfirmAndDownload = () => {
    if (!jobOrder) return;
    
    const doc = createPDF(false) as jsPDF;
    doc.save(`Job-Invoice-${jobOrder.job_id}.pdf`);
    
    // Update invoice number for next invoice
    if (invoiceSettings) {
      updateInvoiceNumberMutation.mutate(invoiceSettings.current_invoice_number);
      toast.success('Invoice generated successfully');
    }
    
    handleClosePreview();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!jobOrder) {
    return <div>Job order not found</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(`/admin/external-jobs/details/${id}`)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Generate Invoice</h1>
          <p className="text-muted-foreground mt-1">
            Create invoice for job order {jobOrder.job_id}
          </p>
        </div>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <Label>Invoice Number</Label>
            <Input
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              placeholder="Auto-generated"
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              This number will auto-increment after generating the invoice
            </p>
          </div>

          <div>
            <Label className="mb-3 block">Invoice Type</Label>
            <RadioGroup value={invoiceType} onValueChange={(value: any) => setInvoiceType(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="without_gst" id="without_gst" />
                <Label htmlFor="without_gst">Without GST</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="with_gst" id="with_gst" />
                <Label htmlFor="with_gst">With GST</Label>
              </div>
            </RadioGroup>
          </div>

          {invoiceType === "with_gst" && (
            <div>
              <Label>GST Rate (%)</Label>
              <Input
                type="number"
                value={gstRate}
                onChange={(e) => setGstRate(e.target.value)}
                className="mt-2"
              />
            </div>
          )}

          <div>
            <Label className="mb-3 block">Account Type</Label>
            <RadioGroup value={accountType} onValueChange={(value: any) => setAccountType(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="company" id="company" />
                <Label htmlFor="company">Company Account</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="personal" id="personal" />
                <Label htmlFor="personal">Personal Account</Label>
              </div>
            </RadioGroup>
          </div>

          {accountType === "company" ? (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
              <h4 className="font-semibold text-sm">Company Bank Details (Editable)</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Bank Name</Label>
                  <Input
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">Account Number</Label>
                  <Input
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">IFSC Code</Label>
                  <Input
                    value={ifscCode}
                    onChange={(e) => setIfscCode(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">Branch</Label>
                  <Input
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
              <h4 className="font-semibold text-sm">Personal UPI Details (Editable)</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Phone Number (GPay/PhonePe)</Label>
                  <Input
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">UPI ID</Label>
                  <Input
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="pt-4 border-t">
            <h3 className="font-semibold mb-3">Invoice Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Style:</span>
                <span className="font-medium">{jobOrder.style_name}</span>
              </div>
              <div className="flex justify-between">
                <span>Quantity:</span>
                <span className="font-medium">{jobOrder.number_of_pieces} pcs</span>
              </div>
              <div className="flex justify-between">
                <span>Rate per Piece:</span>
                <span className="font-medium">₹{jobOrder.rate_per_piece.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-medium">₹{(jobOrder.rate_per_piece * jobOrder.number_of_pieces).toFixed(2)}</span>
              </div>
              {jobOrder.accessories_cost > 0 && (
                <div className="flex justify-between">
                  <span>Accessories:</span>
                  <span className="font-medium">₹{jobOrder.accessories_cost.toFixed(2)}</span>
                </div>
              )}
              {jobOrder.delivery_charge > 0 && (
                <div className="flex justify-between">
                  <span>Delivery:</span>
                  <span className="font-medium">₹{jobOrder.delivery_charge.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-base pt-2 border-t">
                <span>Total:</span>
                <span>₹{jobOrder.total_amount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => navigate(`/admin/external-jobs/details/${id}`)}
            >
              Cancel
            </Button>
            <Button variant="secondary" onClick={handlePreview} className="gap-2">
              <Eye className="h-4 w-4" />
              Quick Preview
            </Button>
            <Button onClick={() => setShowLayoutEditor(true)} className="gap-2">
              <Edit3 className="h-4 w-4" />
              Edit & Download
            </Button>
          </div>
        </div>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={handleClosePreview}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Invoice Preview</DialogTitle>
          </DialogHeader>
          <div className="flex-1 min-h-0">
            {previewUrl && (
              <iframe
                src={previewUrl}
                className="w-full h-full border rounded-lg"
                title="Invoice Preview"
              />
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={handleClosePreview}>
              Edit Invoice
            </Button>
            <Button onClick={handleConfirmAndDownload} className="gap-2">
              <FileText className="h-4 w-4" />
              Confirm & Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Layout Editor */}
      <InvoiceLayoutEditor
        open={showLayoutEditor}
        onClose={() => setShowLayoutEditor(false)}
        onConfirmDownload={(pdf) => {
          pdf.save(`Job-Invoice-${jobOrder.job_id}.pdf`);
          if (invoiceSettings) {
            updateInvoiceNumberMutation.mutate(invoiceSettings.current_invoice_number);
          }
        }}
        jobOrderId={id!}
        invoiceData={{
          styleName: jobOrder.style_name,
          pieces: jobOrder.number_of_pieces,
          ratePerPiece: jobOrder.rate_per_piece,
          total: jobOrder.total_amount,
          companyName: jobOrder.external_job_companies.company_name,
          companyAddress: jobOrder.external_job_companies.address,
          companyContact: jobOrder.external_job_companies.contact_number,
          companyGst: jobOrder.external_job_companies.gst_number || undefined,
          invoiceNumber: invoiceNumber ? formatInvoiceNumber(parseInt(invoiceNumber), new Date()) : 'PENDING',
          invoiceType,
          gstRate,
          accountType,
          bankDetails: { bankName, accountNumber, ifscCode, branch },
          personalDetails: { phoneNumber, upiId },
          accessoriesCost: jobOrder.accessories_cost || 0,
          deliveryCharge: jobOrder.delivery_charge || 0,
        }}
      />
    </div>
  );
};

export default GenerateInvoice;
