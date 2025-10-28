import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Trash2, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { TAX_TYPES } from '@/lib/constants';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import logo from '@/assets/logo.png';
import signature from '@/assets/signature.png';
import { formatCurrency, numberToWords, formatCurrencyAscii, sanitizePdfText, formatInvoiceNumber, groupByHSN, maskBankAccount } from '@/lib/invoiceUtils';

interface InvoiceItem {
  product_id: string;
  hsn_code: string;
  product_code: string;
  price: number;
  quantity: number;
  amount: number;
}

export default function InvoiceGenerator() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [invoiceDate, setInvoiceDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [invoiceType, setInvoiceType] = useState('Feather Fashions');
  const [customerId, setCustomerId] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [purchaseOrderNo, setPurchaseOrderNo] = useState('');
  const [numberOfPackages, setNumberOfPackages] = useState('1');
  const [taxType, setTaxType] = useState<'intra' | 'inter'>('intra');
  const [cgstRate, setCgstRate] = useState('9');
  const [sgstRate, setSgstRate] = useState('9');
  const [igstRate, setIgstRate] = useState('18');
  const [discount, setDiscount] = useState(0);
  const [termsAndConditions, setTermsAndConditions] = useState([
    'Payment is due within 30 days of invoice date.',
    'Goods once sold will not be taken back or exchanged.',
    'All disputes are subject to Annur jurisdiction only.',
  ]);
  const [items, setItems] = useState<InvoiceItem[]>([{
    product_id: '',
    hsn_code: '',
    product_code: '',
    price: 0,
    quantity: 1,
    amount: 0,
  }]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null);

  const { data: customers } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('is_active', true)
        .order('company_name');
      if (error) throw error;
      return data;
    },
  });

  const { data: products } = useQuery({
    queryKey: ['products-with-price'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .not('price', 'is', null);
      if (error) throw error;
      return data;
    },
  });

  const { data: invoiceSettings } = useQuery({
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

  const selectedCustomer = customers?.find(c => c.id === customerId);

  const handleCustomerChange = (value: string) => {
    setCustomerId(value);
    const customer = customers?.find(c => c.id === value);
    if (customer) {
      setDeliveryAddress(`${customer.address_1}${customer.address_2 ? ', ' + customer.address_2 : ''}, ${customer.city}, ${customer.state} - ${customer.pincode}`);
    }
  };

  const handleProductChange = (index: number, productId: string) => {
    const product = products?.find(p => p.id === productId);
    if (product) {
      const newItems = [...items];
      newItems[index] = {
        ...newItems[index],
        product_id: productId,
        hsn_code: product.hsn_code || '',
        product_code: product.product_code || '',
        price: Number(product.price) || 0,
        amount: Number(product.price) * newItems[index].quantity,
      };
      setItems(newItems);
    }
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    const newItems = [...items];
    newItems[index].quantity = quantity;
    newItems[index].amount = newItems[index].price * quantity;
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, {
      product_id: '',
      hsn_code: '',
      product_code: '',
      price: 0,
      quantity: 1,
      amount: 0,
    }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const cgstAmount = taxType === 'intra' ? (subtotal * Number(cgstRate)) / 100 : 0;
  const sgstAmount = taxType === 'intra' ? (subtotal * Number(sgstRate)) / 100 : 0;
  const igstAmount = taxType === 'inter' ? (subtotal * Number(igstRate)) / 100 : 0;
  const totalBeforeDiscount = subtotal + cgstAmount + sgstAmount + igstAmount;
  const total = totalBeforeDiscount - discount;

  const createInvoiceMutation = useMutation({
    mutationFn: async () => {
      if (!customerId || items.some(i => !i.product_id)) {
        throw new Error('Please fill all required fields');
      }

      const invoiceNumber = invoiceSettings?.current_invoice_number || 1;

      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert([{
          invoice_number: invoiceNumber,
          invoice_date: invoiceDate,
          invoice_type: invoiceType,
          customer_id: customerId,
          delivery_address: deliveryAddress,
          purchase_order_no: purchaseOrderNo || null,
          number_of_packages: Number(numberOfPackages),
          subtotal,
          cgst_rate: Number(cgstRate),
          cgst_amount: cgstAmount,
          sgst_rate: Number(sgstRate),
          sgst_amount: sgstAmount,
          igst_rate: Number(igstRate),
          igst_amount: igstAmount,
          total_amount: total,
          discount: discount,
          terms_and_conditions: termsAndConditions,
        }])
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(items.map(item => ({
          invoice_id: invoice.id,
          ...item,
        })));

      if (itemsError) throw itemsError;

      const { error: settingsError } = await supabase
        .from('invoice_settings')
        .update({ current_invoice_number: invoiceNumber + 1, updated_at: new Date().toISOString() })
        .eq('id', invoiceSettings?.id);

      if (settingsError) throw settingsError;

      return { invoice, items };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoice-settings'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast({ title: 'Invoice created successfully' });
    },
    onError: (error: Error) => {
      toast({ title: error.message || 'Failed to create invoice', variant: 'destructive' });
    },
  });


  const generatePDF = (downloadImmediately: boolean = true) => {
    if (!selectedCustomer) {
      toast({ title: 'Please select a customer', variant: 'destructive' });
      return null;
    }

    if (!invoiceSettings) {
      toast({ title: 'Invoice settings not found', variant: 'destructive' });
      return null;
    }

    const doc = new jsPDF();
    const invoiceNumber = invoiceSettings.current_invoice_number || 1;
    const formattedInvoiceNumber = formatInvoiceNumber(invoiceNumber, new Date(invoiceDate));
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;
    let currentY = 50; // Starting Y position after header

    // Helper function to add header on each page
    const addHeader = (isFirstPage: boolean = false) => {
      // Logo and Company Info
      try {
        doc.addImage(logo, 'PNG', 15, 12, 25, 25);
      } catch (error) {
        console.error('Failed to add logo:', error);
      }
      
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(31, 120, 110);
      doc.text(invoiceSettings.company_name || 'Feather Fashions', 45, 20);
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(100, 100, 100);
      doc.text(invoiceSettings.company_tagline || 'Feather-Light Comfort. Limitless Style.', 45, 26);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(60, 60, 60);
      doc.text(invoiceSettings.company_address || '', 15, 34);
      doc.text(
        `GSTIN: ${invoiceSettings.company_gst_number || 'N/A'} | Phone: ${invoiceSettings.company_phone || ''} | Email: ${invoiceSettings.company_email || ''}`,
        15, 39
      );
      doc.text(`Website: ${invoiceSettings.company_website || ''}`, 15, 44);

      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.line(15, 48, pageWidth - 15, 48);
    };

    const ensureSpace = (height: number) => {
      const bottomMargin = 20;
      if (currentY + height > pageHeight - bottomMargin) {
        doc.addPage();
        addHeader();
        addWatermark();
        currentY = 57; // reset below header
      }
    };

    // Function to add watermark on page
    const addWatermark = () => {
      // Use very light gray color (simulates 10% opacity)
      doc.setTextColor(245, 245, 245);
      doc.setFontSize(70);
      doc.setFont('helvetica', 'bold');
      
      const centerX = pageWidth / 2;
      const centerY = pageHeight / 2;
      
      // Draw watermark text at 45-degree angle
      doc.text('FEATHER FASHIONS', centerX, centerY, {
        align: 'center',
        angle: -45
      });
      
      // Reset text color
      doc.setTextColor(0, 0, 0);
    };

    // Add header and watermark for first page
    addHeader(true);
    addWatermark();

    // Header drawn by addHeader(); removing duplicate drawing block

    // TAX INVOICE header - larger and bolder
    currentY = 57;
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('TAX INVOICE', pageWidth / 2, currentY, { align: 'center' });

    // Invoice number (FY format) and date
    currentY = 65;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Invoice No: ${formattedInvoiceNumber}`, 15, currentY);
    doc.text(`Date: ${format(new Date(invoiceDate), 'dd/MM/yyyy')}`, 140, currentY);
    
    currentY = 71;
    if (purchaseOrderNo) {
      doc.text(`PO No: ${purchaseOrderNo}`, 15, currentY);
    }
    doc.text(`Packages: ${numberOfPackages}`, 140, currentY);

    // ========== BILL TO & DELIVERY ADDRESS SECTION ==========
    currentY = 76;
    doc.setDrawColor(220, 220, 220);
    doc.setFillColor(250, 250, 250);
    doc.roundedRect(15, currentY, 85, 28, 2, 2, 'FD');
    doc.roundedRect(110, currentY, 85, 28, 2, 2, 'FD');

    // Bill To
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Bill To:', 18, currentY + 6);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(selectedCustomer.company_name, 18, currentY + 12);
    doc.text(selectedCustomer.email, 18, currentY + 17);
    doc.text(selectedCustomer.phone, 18, currentY + 22);
    if (selectedCustomer.gst_number) {
      doc.text(`GST: ${selectedCustomer.gst_number}`, 18, currentY + 27);
    }

    // Delivery Address
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Delivery Address:', 113, currentY + 6);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const addressLines = doc.splitTextToSize(deliveryAddress, 78);
    doc.text(addressLines, 113, currentY + 12);
    
    // Check if inter-state supply
    const customerState = selectedCustomer.state.toLowerCase().trim();
    const deliveryLower = deliveryAddress.toLowerCase();
    const isInterState = !deliveryLower.includes(customerState);
    
    if (isInterState) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(220, 38, 38);
      const interStateY = currentY + 12 + (addressLines.length * 4) + 2;
      doc.text('(Inter-state supply - IGST applicable)', 113, interStateY);
      doc.setTextColor(0, 0, 0);
      currentY += 40;
    } else {
      currentY += 34;
    }

    // ========== PRODUCTS TABLE ==========
    autoTable(doc, {
      startY: currentY,
      head: [['S.No', 'Product Description', 'HSN Code', 'Qty', 'Unit Price', 'Amount']],
      body: items.map((item, index) => {
        const product = products?.find(p => p.id === item.product_id);
        const productName = product?.name || '';
        const wrappedName = doc.splitTextToSize(`${productName}\n${item.product_code}`, 58);
        return [
          index + 1,
          wrappedName.join('\n'),
          item.hsn_code || 'N/A',
          item.quantity,
          formatCurrencyAscii(item.price),
          formatCurrencyAscii(item.amount),
        ];
      }),
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
      alternateRowStyles: { fillColor: [248, 248, 248] },
      margin: { left: 15, right: 15 },
      didDrawPage: (data) => {
        const pageW = (doc as any).internal.pageSize.getWidth();
        const pageH = (doc as any).internal.pageSize.getHeight();
        // Header on every page
        addHeader();
        // Enhanced footer bar
        doc.setFillColor(52, 180, 148);
        doc.rect(0, pageH - 15, pageW, 15, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text('Feather Fashions • Comfort • Style • Sustainability', pageW / 2, pageH - 10, { align: 'center' });
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        const pageCount = (doc as any).internal.getNumberOfPages();
        const currentPage = (doc as any).internal.getCurrentPageInfo().pageNumber;
        doc.text(`featherfashions.shop | Page ${currentPage} of ${pageCount}`, pageW / 2, pageH - 5, { align: 'center' });
        doc.setTextColor(0, 0, 0);
      }
    });

    currentY = (doc as any).lastAutoTable.finalY + 10;
    
    // HSN Summary Table
    ensureSpace(40);
    const hsnGroups = groupByHSN(items.map(item => ({
      hsn_code: item.hsn_code || 'N/A',
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
        0: { cellWidth: 40 },
        1: { halign: 'right', cellWidth: 30 },
        2: { halign: 'right', cellWidth: 40 }
      },
      margin: { left: 15, right: 15 },
      tableWidth: 110
    });

    currentY = (doc as any).lastAutoTable.finalY + 10;
    ensureSpace(80);

    // ========== TOTALS SECTION ==========
    doc.setDrawColor(220, 220, 220);
    doc.setFillColor(250, 250, 250);
    const totalsHeight = taxType === 'intra' ? (discount > 0 ? 35 : 30) : (discount > 0 ? 27 : 22);
    doc.roundedRect(130, currentY, 65, totalsHeight, 2, 2, 'FD');

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    let yOffset = currentY + 6;
    
    doc.text('Subtotal:', 133, yOffset);
    doc.text(sanitizePdfText(formatCurrencyAscii(subtotal)), 192, yOffset, { align: 'right' });
    yOffset += 5;

    if (taxType === 'intra') {
      doc.text(`CGST (${cgstRate}%):`, 133, yOffset);
      doc.text(sanitizePdfText(formatCurrencyAscii(cgstAmount)), 192, yOffset, { align: 'right' });
      yOffset += 5;
      doc.text(`SGST (${sgstRate}%):`, 133, yOffset);
      doc.text(sanitizePdfText(formatCurrencyAscii(sgstAmount)), 192, yOffset, { align: 'right' });
      yOffset += 5;
    } else {
      doc.text(`IGST (${igstRate}%):`, 133, yOffset);
      doc.text(sanitizePdfText(formatCurrencyAscii(igstAmount)), 192, yOffset, { align: 'right' });
      yOffset += 5;
    }

    // Discount if applicable
    if (discount > 0) {
      doc.setFont('helvetica', 'normal');
      doc.text('Discount:', 133, yOffset);
      doc.text(`- ${sanitizePdfText(formatCurrencyAscii(discount))}`, 192, yOffset, { align: 'right' });
      yOffset += 5;
    }

    // Grand Total with lighter matte green
    doc.setFillColor(52, 180, 148);
    doc.roundedRect(130, yOffset - 2, 65, 7, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text('Grand Total:', 133, yOffset + 2);
    doc.text(sanitizePdfText(formatCurrencyAscii(total)), 192, yOffset + 2, { align: 'right' });
    doc.setTextColor(0, 0, 0);

    // Amount in words
    const amountInWords = numberToWords(Math.floor(total));
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Amount in Words:', 15, currentY + 6);
    doc.setFont('helvetica', 'normal');
    const wordsText = `Rupees ${amountInWords} Only`;
    const wrappedWords = doc.splitTextToSize(wordsText, 105);
    doc.text(wrappedWords, 15, currentY + 12);
    
    currentY += totalsHeight + 10;

    // ========== PAYMENT & BANK DETAILS ==========
    ensureSpace(26);
    doc.setDrawColor(220, 220, 220);
    doc.setFillColor(250, 250, 250);
    doc.roundedRect(15, currentY, 180, 20, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Payment Mode:', 18, currentY + 6);
    doc.setFont('helvetica', 'normal');
    doc.text(invoiceSettings.payment_modes || 'Cash / Bank Transfer / UPI', 50, currentY + 6);

    doc.setFont('helvetica', 'bold');
    doc.text('Bank Details:', 18, currentY + 11);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const maskedAccount = invoiceSettings.bank_account_display || maskBankAccount(invoiceSettings.bank_account_number || 'N/A');
    const bankDetails = `Bank: ${invoiceSettings.bank_name || 'N/A'} | A/C No: ${maskedAccount} | IFSC: ${invoiceSettings.bank_ifsc_code || 'N/A'} | Branch: ${invoiceSettings.bank_branch || 'N/A'}`;
    doc.text(bankDetails, 18, currentY + 15);
    
    currentY += 26;

    // ========== TERMS & CONDITIONS ==========
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Terms & Conditions:', 15, currentY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const terms = Array.isArray(invoiceSettings.default_terms) 
      ? invoiceSettings.default_terms 
      : termsAndConditions;
    const termsHeight = 5 + (terms.length * 4) + 5;
    ensureSpace(termsHeight);
    terms.forEach((term: string, index: number) => {
      doc.text(`${index + 1}. ${term}`, 15, currentY + 5 + (index * 4));
    });
    
    currentY += termsHeight;

    // ========== SIGNATURE SECTION ==========
    ensureSpace(25);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Authorized Signatory', 155, currentY);
    
    // Add signature image with error handling
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

    // Footer drawn per page in didDrawPage

    if (downloadImmediately) {
      doc.save(`Invoice_${formattedInvoiceNumber.replace(/\//g, '_')}_${selectedCustomer.company_name.replace(/\s+/g, '_')}.pdf`);
      return null;
    } else {
      // Return blob URL for preview
      const pdfBlob = doc.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      return { url, filename: `Invoice_${formattedInvoiceNumber.replace(/\//g, '_')}_${selectedCustomer.company_name.replace(/\s+/g, '_')}.pdf`, doc };
    }
  };

  const handlePreviewInvoice = () => {
    if (!customerId || items.some(i => !i.product_id)) {
      toast({ title: 'Please fill all required fields', variant: 'destructive' });
      return;
    }

    const result = generatePDF(false);
    if (result) {
      setPreviewPdfUrl(result.url);
      setPreviewOpen(true);
    }
  };

  const handleConfirmAndDownload = async () => {
    try {
      await createInvoiceMutation.mutateAsync();
      generatePDF(true);
      setPreviewOpen(false);
      if (previewPdfUrl) {
        URL.revokeObjectURL(previewPdfUrl);
        setPreviewPdfUrl(null);
      }
    } catch (error) {
      // Error is already handled by mutation
    }
  };

  const handleClosePreview = () => {
    setPreviewOpen(false);
    if (previewPdfUrl) {
      URL.revokeObjectURL(previewPdfUrl);
      setPreviewPdfUrl(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Generate Invoice</h2>
        <p className="text-muted-foreground">Create a new invoice for your customers</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invoice Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Invoice Date</Label>
              <Input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Invoice Type</Label>
              <RadioGroup value={invoiceType} onValueChange={setInvoiceType}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Feather Fashions" id="ff" />
                  <Label htmlFor="ff" className="font-normal">Feather Fashions</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>Invoice Number</Label>
              <Input value={invoiceSettings?.current_invoice_number || ''} disabled />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Select Customer *</Label>
            <Select value={customerId} onValueChange={handleCustomerChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select customer" />
              </SelectTrigger>
              <SelectContent>
                {customers?.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.company_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Number of Packages</Label>
              <Input
                type="number"
                min="1"
                value={numberOfPackages}
                onChange={(e) => setNumberOfPackages(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Purchase Order Number</Label>
              <Input
                value={purchaseOrderNo}
                onChange={(e) => setPurchaseOrderNo(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Discount (Rs)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={discount}
                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Delivery Address</Label>
            <Input
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Terms and Conditions</Label>
            <Textarea
              value={termsAndConditions.join('\n')}
              onChange={(e) => setTermsAndConditions(e.target.value.split('\n').filter(Boolean))}
              rows={5}
              placeholder="Enter terms and conditions (one per line)"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.map((item, index) => (
            <div key={index} className="grid grid-cols-12 gap-2 items-end">
              <div className="col-span-3 space-y-2">
                <Label>Product *</Label>
                <Select
                  value={item.product_id}
                  onValueChange={(value) => handleProductChange(index, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products?.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-2 space-y-2">
                <Label>HSN Code</Label>
                <Input value={item.hsn_code} disabled />
              </div>

              <div className="col-span-2 space-y-2">
                <Label>Product Code</Label>
                <Input value={item.product_code} disabled />
              </div>

              <div className="col-span-2 space-y-2">
                <Label>Price</Label>
                <Input value={item.price} disabled />
              </div>

              <div className="col-span-1 space-y-2">
                <Label>Qty</Label>
                <Input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => handleQuantityChange(index, Number(e.target.value))}
                />
              </div>

              <div className="col-span-1 space-y-2">
                <Label>Amount</Label>
                <Input value={item.amount.toFixed(2)} disabled />
              </div>

              <div className="col-span-1">
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => removeItem(index)}
                  disabled={items.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}

          <Button type="button" variant="outline" onClick={addItem} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tax Calculation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup value={taxType} onValueChange={(v) => setTaxType(v as 'intra' | 'inter')}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="intra" id="intra" />
              <Label htmlFor="intra" className="font-normal">Intra-State (CGST + SGST)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="inter" id="inter" />
              <Label htmlFor="inter" className="font-normal">Inter-State (IGST)</Label>
            </div>
          </RadioGroup>

          {taxType === 'intra' ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>CGST Rate (%)</Label>
                <Input
                  type="number"
                  value={cgstRate}
                  onChange={(e) => setCgstRate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>SGST Rate (%)</Label>
                <Input
                  type="number"
                  value={sgstRate}
                  onChange={(e) => setSgstRate(e.target.value)}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label>IGST Rate (%)</Label>
              <Input
                type="number"
                value={igstRate}
                onChange={(e) => setIgstRate(e.target.value)}
              />
            </div>
          )}

          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
            </div>
            {taxType === 'intra' ? (
              <>
                <div className="flex justify-between">
                  <span>CGST ({cgstRate}%):</span>
                  <span>₹{cgstAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>SGST ({sgstRate}%):</span>
                  <span>₹{sgstAmount.toFixed(2)}</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between">
                <span>IGST ({igstRate}%):</span>
                <span>₹{igstAmount.toFixed(2)}</span>
              </div>
            )}
            {discount > 0 && (
              <div className="flex justify-between">
                <span>Discount:</span>
                <span className="text-red-600">- ₹{discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span>Total:</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button onClick={handlePreviewInvoice} variant="outline">
          <Eye className="h-4 w-4 mr-2" />
          Preview Invoice
        </Button>
      </div>

      <Dialog open={previewOpen} onOpenChange={handleClosePreview}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] h-[90vh] p-0">
          <DialogHeader className="p-6 pb-4">
            <DialogTitle>Invoice Preview</DialogTitle>
            <DialogDescription>
              Review the invoice before confirming generation and download
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-hidden px-6">
            {previewPdfUrl && (
              <iframe
                src={previewPdfUrl}
                className="w-full h-[calc(90vh-180px)] border rounded"
                title="Invoice Preview"
              />
            )}
          </div>

          <DialogFooter className="p-6 pt-4">
            <Button variant="outline" onClick={handleClosePreview}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmAndDownload} 
              disabled={createInvoiceMutation.isPending}
            >
              {createInvoiceMutation.isPending ? 'Processing...' : 'Confirm & Download'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}