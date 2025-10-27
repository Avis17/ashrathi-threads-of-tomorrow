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
import { Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { TAX_TYPES } from '@/lib/constants';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import logo from '@/assets/logo.png';
import signature from '@/assets/signature.png';

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
  const total = subtotal + cgstAmount + sgstAmount + igstAmount;

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

  // Helper function to convert number to words (Indian currency)
  const numberToWords = (num: number): string => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

    const convertLessThanThousand = (n: number): string => {
      if (n === 0) return '';
      if (n < 10) return ones[n];
      if (n < 20) return teens[n - 10];
      if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
      return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + convertLessThanThousand(n % 100) : '');
    };

    if (num === 0) return 'Zero';

    const crore = Math.floor(num / 10000000);
    const lakh = Math.floor((num % 10000000) / 100000);
    const thousand = Math.floor((num % 100000) / 1000);
    const remainder = Math.floor(num % 1000);

    let result = '';
    if (crore > 0) result += convertLessThanThousand(crore) + ' Crore ';
    if (lakh > 0) result += convertLessThanThousand(lakh) + ' Lakh ';
    if (thousand > 0) result += convertLessThanThousand(thousand) + ' Thousand ';
    if (remainder > 0) result += convertLessThanThousand(remainder);

    return result.trim();
  };

  const generatePDF = () => {
    if (!selectedCustomer) {
      toast({ title: 'Please select a customer', variant: 'destructive' });
      return;
    }

    const doc = new jsPDF();
    const invoiceNumber = invoiceSettings?.current_invoice_number || 1;

    // Add watermark (faint logo in background)
    doc.saveGraphicsState();
    doc.setGState({ opacity: 0.1 });
    doc.addImage(logo, 'PNG', 60, 110, 90, 90);
    doc.restoreGraphicsState();

    // ========== HEADER SECTION ==========
    // Logo
    doc.addImage(logo, 'PNG', 15, 12, 25, 25);
    
    // Company name and tagline
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(31, 120, 110); // Feather green color
    doc.text('FEATHER FASHIONS', 45, 20);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 100, 100);
    doc.text('Feather-Light Comfort. Limitless Style.', 45, 26);

    // Company details
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(60, 60, 60);
    doc.text('Sathya Complex, 176/1, Sathy Road, Annur, Tamil Nadu - 641653', 15, 34);
    doc.text('GSTIN: 33AAGFF1234F1Z5 | Phone: +91 97892 25510 | Email: info@featherfashions.shop', 15, 39);
    doc.text('Website: featherfashions.shop', 15, 44);

    // Separator line
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(15, 48, 195, 48);

    // TAX INVOICE header
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('TAX INVOICE', 105, 57, { align: 'center' });

    // Invoice number and date
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Invoice No: ${invoiceNumber}`, 15, 65);
    doc.text(`Date: ${format(new Date(invoiceDate), 'dd/MM/yyyy')}`, 140, 65);
    if (purchaseOrderNo) {
      doc.text(`PO No: ${purchaseOrderNo}`, 15, 71);
    }
    doc.text(`Packages: ${numberOfPackages}`, 140, 71);

    // ========== BILL TO & DELIVERY ADDRESS SECTION ==========
    doc.setDrawColor(220, 220, 220);
    doc.setFillColor(250, 250, 250);
    doc.roundedRect(15, 76, 85, 28, 2, 2, 'FD');
    doc.roundedRect(110, 76, 85, 28, 2, 2, 'FD');

    // Bill To
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Bill To:', 18, 82);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(selectedCustomer.company_name, 18, 88);
    doc.text(selectedCustomer.email, 18, 93);
    doc.text(selectedCustomer.phone, 18, 98);
    if (selectedCustomer.gst_number) {
      doc.text(`GST: ${selectedCustomer.gst_number}`, 18, 103);
    }

    // Delivery Address
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Delivery Address:', 113, 82);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const addressLines = doc.splitTextToSize(deliveryAddress, 78);
    doc.text(addressLines, 113, 88);

    // ========== PRODUCTS TABLE ==========
    autoTable(doc, {
      startY: 110,
      head: [['S.No', 'Product Description', 'HSN Code', 'Qty', 'Unit Price (₹)', 'Amount (₹)']],
      body: items.map((item, index) => {
        const product = products?.find(p => p.id === item.product_id);
        return [
          index + 1,
          `${product?.name || ''}\n${item.product_code}`,
          item.hsn_code || 'N/A',
          item.quantity,
          '₹' + item.price.toFixed(2),
          '₹' + item.amount.toFixed(2),
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
        1: { halign: 'left', cellWidth: 60 },
        2: { halign: 'center', cellWidth: 25 },
        3: { halign: 'center', cellWidth: 15 },
        4: { halign: 'right', cellWidth: 35 },
        5: { halign: 'right', cellWidth: 35 }
      },
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      alternateRowStyles: { fillColor: [248, 248, 248] },
    });

    const tableEndY = (doc as any).lastAutoTable.finalY || 160;

    // ========== TOTALS SECTION ==========
    const totalsStartY = tableEndY + 5;
    doc.setDrawColor(220, 220, 220);
    doc.setFillColor(250, 250, 250);
    doc.roundedRect(130, totalsStartY, 65, taxType === 'intra' ? 30 : 22, 2, 2, 'FD');

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    let yOffset = totalsStartY + 6;
    
    doc.text('Subtotal:', 133, yOffset);
    doc.text('₹' + subtotal.toFixed(2), 192, yOffset, { align: 'right' });
    yOffset += 5;

    if (taxType === 'intra') {
      doc.text(`CGST (${cgstRate}%):`, 133, yOffset);
      doc.text('₹' + cgstAmount.toFixed(2), 192, yOffset, { align: 'right' });
      yOffset += 5;
      doc.text(`SGST (${sgstRate}%):`, 133, yOffset);
      doc.text('₹' + sgstAmount.toFixed(2), 192, yOffset, { align: 'right' });
      yOffset += 5;
    } else {
      doc.text(`IGST (${igstRate}%):`, 133, yOffset);
      doc.text('₹' + igstAmount.toFixed(2), 192, yOffset, { align: 'right' });
      yOffset += 5;
    }

    // Grand Total with highlight
    doc.setFillColor(42, 170, 138);
    doc.roundedRect(130, yOffset - 2, 65, 7, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text('Grand Total:', 133, yOffset + 2);
    doc.text('₹' + total.toFixed(2), 192, yOffset + 2, { align: 'right' });
    doc.setTextColor(0, 0, 0);

    // Amount in words
    const amountInWords = numberToWords(Math.floor(total));
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Amount in Words:', 15, totalsStartY + 6);
    doc.setFont('helvetica', 'normal');
    const wordsText = `Rupees ${amountInWords} Only`;
    const wrappedWords = doc.splitTextToSize(wordsText, 105);
    doc.text(wrappedWords, 15, totalsStartY + 12);

    // ========== PAYMENT & BANK DETAILS ==========
    const bankDetailsY = totalsStartY + 35;
    doc.setDrawColor(220, 220, 220);
    doc.setFillColor(250, 250, 250);
    doc.roundedRect(15, bankDetailsY, 180, 20, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Payment Mode:', 18, bankDetailsY + 6);
    doc.setFont('helvetica', 'normal');
    doc.text('Cash / Bank Transfer / UPI', 50, bankDetailsY + 6);

    doc.setFont('helvetica', 'bold');
    doc.text('Bank Details:', 18, bankDetailsY + 11);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('Bank: State Bank of India | A/C No: 12345678901 | IFSC: SBIN0001234 | Branch: Annur', 18, bankDetailsY + 15);

    // ========== TERMS & CONDITIONS ==========
    const termsY = bankDetailsY + 26;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Terms & Conditions:', 15, termsY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    termsAndConditions.forEach((term, index) => {
      doc.text(`${index + 1}. ${term}`, 15, termsY + 5 + (index * 4));
    });

    // ========== SIGNATURE SECTION ==========
    const signatureY = termsY + 20;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Authorized Signatory', 155, signatureY);
    
    // Add signature image
    doc.addImage(signature, 'PNG', 150, signatureY + 3, 40, 15);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text('(Company Seal)', 165, signatureY + 20, { align: 'center' });

    // ========== FOOTER BAR ==========
    doc.setFillColor(31, 120, 110);
    doc.rect(0, 285, 210, 12, 'F');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text('Thank you for choosing Feather Fashions! 🦚', 105, 291, { align: 'center' });

    doc.save(`Invoice_${invoiceNumber}_${selectedCustomer.company_name.replace(/\s+/g, '_')}.pdf`);
  };

  const handleVerifyAndPrint = async () => {
    await createInvoiceMutation.mutateAsync();
    generatePDF();
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div className="space-y-2">
              <Label>Number of Packages</Label>
              <Input
                type="number"
                min="1"
                value={numberOfPackages}
                onChange={(e) => setNumberOfPackages(e.target.value)}
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
            <Label>Purchase Order Number</Label>
            <Input
              value={purchaseOrderNo}
              onChange={(e) => setPurchaseOrderNo(e.target.value)}
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
            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span>Total:</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button onClick={handleVerifyAndPrint} disabled={createInvoiceMutation.isPending}>
          {createInvoiceMutation.isPending ? 'Processing...' : 'Verify & Print Invoice'}
        </Button>
      </div>
    </div>
  );
}