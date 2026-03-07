import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Plus, Trash2, Download, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import logo from '@/assets/logo.png';
import signature from '@/assets/signature.png';
import { formatCurrency, numberToWords, sanitizePdfText, formatCurrencyAscii } from '@/lib/invoiceUtils';

const loadPdfLibs = async () => {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable')
  ]);
  return { jsPDF, autoTable };
};

interface DebitNoteItem {
  description: string;
  hsn_code: string;
  quantity: number;
  rate: number;
  amount: number;
}

const COMPANY_INFO = {
  name: 'FEATHER FASHIONS',
  address: '15/153, Kuttiyar Street, Erode - 638001, Tamil Nadu, India',
  gstin: '33AALPN7662P1ZR',
  phone: '+91 96006 72707',
  email: 'info.featherfashions@gmail.com',
  state: 'Tamil Nadu',
  stateCode: '33',
  pan: 'AALPN7662P',
  bank: {
    name: 'HDFC Bank',
    branch: 'Erode Main Branch',
    accountNo: '50200085396498',
    ifsc: 'HDFC0000665',
  },
};

export default function DebitNote() {
  const { toast } = useToast();
  const [debitNoteNo, setDebitNoteNo] = useState('');
  const [debitNoteDate, setDebitNoteDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [originalInvoiceNo, setOriginalInvoiceNo] = useState('');
  const [originalInvoiceDate, setOriginalInvoiceDate] = useState('');
  const [partyName, setPartyName] = useState('');
  const [partyAddress, setPartyAddress] = useState('');
  const [partyGstin, setPartyGstin] = useState('');
  const [partyState, setPartyState] = useState('');
  const [partyStateCode, setPartyStateCode] = useState('');
  const [reason, setReason] = useState('');
  const [taxType, setTaxType] = useState<'intra' | 'inter'>('intra');
  const [cgstRate, setCgstRate] = useState('9');
  const [sgstRate, setSgstRate] = useState('9');
  const [igstRate, setIgstRate] = useState('18');
  const [items, setItems] = useState<DebitNoteItem[]>([
    { description: '', hsn_code: '', quantity: 1, rate: 0, amount: 0 },
  ]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null);

  const addItem = () => {
    setItems([...items, { description: '', hsn_code: '', quantity: 1, rate: 0, amount: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof DebitNoteItem, value: string | number) => {
    const updated = [...items];
    (updated[index] as any)[field] = value;
    if (field === 'quantity' || field === 'rate') {
      updated[index].amount = updated[index].quantity * updated[index].rate;
    }
    setItems(updated);
  };

  const handleAmountChange = (index: number, amount: number) => {
    const updated = [...items];
    updated[index].amount = amount;
    if (updated[index].quantity > 0) {
      updated[index].rate = parseFloat((amount / updated[index].quantity).toFixed(2));
    }
    setItems(updated);
  };

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const cgstAmt = taxType === 'intra' ? subtotal * (parseFloat(cgstRate) / 100) : 0;
  const sgstAmt = taxType === 'intra' ? subtotal * (parseFloat(sgstRate) / 100) : 0;
  const igstAmt = taxType === 'inter' ? subtotal * (parseFloat(igstRate) / 100) : 0;
  const totalAmount = subtotal + cgstAmt + sgstAmt + igstAmt;
  const roundedTotal = Math.round(totalAmount);

  const generatePDF = async (action: 'download' | 'preview') => {
    if (!debitNoteNo || !partyName || items.some(i => !i.description || i.amount <= 0)) {
      toast({ title: 'Missing fields', description: 'Please fill in all required fields.', variant: 'destructive' });
      return;
    }

    const { jsPDF, autoTable } = await loadPdfLibs();
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const margin = 12;
    const contentW = pageW - margin * 2;
    let y = margin;

    // Background
    doc.setFillColor(250, 250, 247);
    doc.rect(0, 0, pageW, doc.internal.pageSize.getHeight(), 'F');

    // Border
    doc.setDrawColor(200, 180, 140);
    doc.setLineWidth(0.5);
    doc.rect(margin - 2, margin - 2, contentW + 4, doc.internal.pageSize.getHeight() - margin * 2 + 4);

    // Logo
    try {
      const img = new Image();
      img.src = logo;
      await new Promise(r => { img.onload = r; });
      doc.addImage(img, 'PNG', margin, y, 22, 22);
    } catch {}

    // Company header
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 30, 30);
    doc.text(sanitizePdfText(COMPANY_INFO.name), margin + 26, y + 7);

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text(sanitizePdfText(COMPANY_INFO.address), margin + 26, y + 13);
    doc.text(`GSTIN: ${COMPANY_INFO.gstin} | PAN: ${COMPANY_INFO.pan}`, margin + 26, y + 17);
    doc.text(`Phone: ${COMPANY_INFO.phone} | Email: ${COMPANY_INFO.email}`, margin + 26, y + 21);

    y += 28;

    // Title
    doc.setFillColor(139, 69, 19);
    doc.rect(margin, y, contentW, 8, 'F');
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('DEBIT NOTE', pageW / 2, y + 5.5, { align: 'center' });
    y += 12;

    // Debit Note details row
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 30, 30);

    const detailsY = y;
    const halfW = contentW / 2;

    // Left column - Party details
    doc.setFont('helvetica', 'bold');
    doc.text('Debit Note To:', margin, detailsY);
    doc.setFont('helvetica', 'normal');
    doc.text(sanitizePdfText(partyName), margin, detailsY + 5);
    if (partyAddress) {
      const addrLines = doc.splitTextToSize(sanitizePdfText(partyAddress), halfW - 5);
      doc.text(addrLines, margin, detailsY + 10);
    }
    if (partyGstin) doc.text(`GSTIN: ${partyGstin}`, margin, detailsY + 20);
    if (partyState) doc.text(`State: ${partyState}${partyStateCode ? ` (${partyStateCode})` : ''}`, margin, detailsY + 24);

    // Right column - Note details
    const rx = margin + halfW + 5;
    doc.setFont('helvetica', 'bold');
    doc.text('Debit Note No:', rx, detailsY);
    doc.setFont('helvetica', 'normal');
    doc.text(sanitizePdfText(debitNoteNo), rx + 30, detailsY);

    doc.setFont('helvetica', 'bold');
    doc.text('Date:', rx, detailsY + 5);
    doc.setFont('helvetica', 'normal');
    doc.text(format(new Date(debitNoteDate), 'dd/MM/yyyy'), rx + 30, detailsY + 5);

    if (originalInvoiceNo) {
      doc.setFont('helvetica', 'bold');
      doc.text('Orig. Invoice No:', rx, detailsY + 10);
      doc.setFont('helvetica', 'normal');
      doc.text(sanitizePdfText(originalInvoiceNo), rx + 30, detailsY + 10);
    }
    if (originalInvoiceDate) {
      doc.setFont('helvetica', 'bold');
      doc.text('Orig. Invoice Date:', rx, detailsY + 15);
      doc.setFont('helvetica', 'normal');
      doc.text(format(new Date(originalInvoiceDate), 'dd/MM/yyyy'), rx + 30, detailsY + 15);
    }

    y = detailsY + 30;

    // Reason
    if (reason) {
      doc.setFont('helvetica', 'bold');
      doc.text('Reason for Debit Note:', margin, y);
      doc.setFont('helvetica', 'normal');
      const reasonLines = doc.splitTextToSize(sanitizePdfText(reason), contentW);
      doc.text(reasonLines, margin, y + 5);
      y += 5 + reasonLines.length * 4;
    }

    y += 3;

    // Items table
    const tableBody = items.map((item, i) => [
      (i + 1).toString(),
      sanitizePdfText(item.description),
      item.hsn_code || '-',
      item.quantity.toString(),
      formatCurrencyAscii(item.rate),
      formatCurrencyAscii(item.amount),
    ]);

    autoTable(doc, {
      startY: y,
      head: [['#', 'Description', 'HSN', 'Qty', 'Rate', 'Amount']],
      body: tableBody,
      theme: 'grid',
      margin: { left: margin, right: margin },
      styles: { fontSize: 7.5, cellPadding: 2, textColor: [30, 30, 30] },
      headStyles: { fillColor: [139, 69, 19], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7.5 },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 22, halign: 'center' },
        3: { cellWidth: 18, halign: 'center' },
        4: { cellWidth: 28, halign: 'right' },
        5: { cellWidth: 30, halign: 'right' },
      },
      alternateRowStyles: { fillColor: [250, 248, 240] },
    });

    y = (doc as any).lastAutoTable.finalY + 5;

    // Tax summary - right aligned
    const summaryX = pageW - margin - 65;
    const valX = pageW - margin;

    const drawSummaryRow = (label: string, value: string, bold = false) => {
      doc.setFont('helvetica', bold ? 'bold' : 'normal');
      doc.setFontSize(8);
      doc.text(label, summaryX, y);
      doc.text(value, valX, y, { align: 'right' });
      y += 5;
    };

    drawSummaryRow('Subtotal:', formatCurrencyAscii(subtotal));
    if (taxType === 'intra') {
      drawSummaryRow(`CGST @ ${cgstRate}%:`, formatCurrencyAscii(cgstAmt));
      drawSummaryRow(`SGST @ ${sgstRate}%:`, formatCurrencyAscii(sgstAmt));
    } else {
      drawSummaryRow(`IGST @ ${igstRate}%:`, formatCurrencyAscii(igstAmt));
    }

    // Total line
    doc.setDrawColor(139, 69, 19);
    doc.setLineWidth(0.3);
    doc.line(summaryX, y - 1, valX, y - 1);
    drawSummaryRow('Total Amount:', formatCurrencyAscii(roundedTotal), true);

    // Amount in words
    y += 2;
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'italic');
    doc.text(`Amount in Words: ${numberToWords(roundedTotal)} Rupees Only`, margin, y);
    y += 8;

    // Bank details
    doc.setFillColor(245, 240, 230);
    doc.rect(margin, y, contentW / 2 - 2, 22, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(30, 30, 30);
    doc.text('Bank Details', margin + 3, y + 5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text(`Bank: ${COMPANY_INFO.bank.name}`, margin + 3, y + 10);
    doc.text(`A/C No: ${COMPANY_INFO.bank.accountNo}`, margin + 3, y + 14);
    doc.text(`IFSC: ${COMPANY_INFO.bank.ifsc}`, margin + 3, y + 18);

    // Signature block
    const sigX = margin + contentW / 2 + 5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(`For ${COMPANY_INFO.name}`, sigX, y + 5);

    try {
      const sigImg = new Image();
      sigImg.src = signature;
      await new Promise(r => { sigImg.onload = r; });
      doc.addImage(sigImg, 'PNG', sigX, y + 7, 25, 10);
    } catch {}

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text('Authorized Signatory', sigX, y + 20);

    if (action === 'download') {
      doc.save(`DebitNote-${debitNoteNo}.pdf`);
      toast({ title: 'Downloaded', description: 'Debit note PDF saved.' });
    } else {
      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      setPreviewPdfUrl(url);
      setPreviewOpen(true);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Debit Note Generator</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => generatePDF('preview')}><Eye className="h-4 w-4 mr-2" />Preview</Button>
          <Button onClick={() => generatePDF('download')}><Download className="h-4 w-4 mr-2" />Download PDF</Button>
        </div>
      </div>

      {/* Note Details */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Debit Note Details</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Debit Note No. *</Label>
            <Input value={debitNoteNo} onChange={e => setDebitNoteNo(e.target.value)} placeholder="DN-001" />
          </div>
          <div>
            <Label>Date *</Label>
            <Input type="date" value={debitNoteDate} onChange={e => setDebitNoteDate(e.target.value)} />
          </div>
          <div>
            <Label>Original Invoice No.</Label>
            <Input value={originalInvoiceNo} onChange={e => setOriginalInvoiceNo(e.target.value)} placeholder="FF/2025-26/0001" />
          </div>
          <div>
            <Label>Original Invoice Date</Label>
            <Input type="date" value={originalInvoiceDate} onChange={e => setOriginalInvoiceDate(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {/* Party Details */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Party Details</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Party Name *</Label>
            <Input value={partyName} onChange={e => setPartyName(e.target.value)} placeholder="Company name" />
          </div>
          <div>
            <Label>GSTIN</Label>
            <Input value={partyGstin} onChange={e => setPartyGstin(e.target.value)} placeholder="e.g. 33AAACH1234L1Z5" />
          </div>
          <div className="md:col-span-2">
            <Label>Address</Label>
            <Textarea value={partyAddress} onChange={e => setPartyAddress(e.target.value)} placeholder="Full address" rows={2} />
          </div>
          <div>
            <Label>State</Label>
            <Input value={partyState} onChange={e => setPartyState(e.target.value)} placeholder="Tamil Nadu" />
          </div>
          <div>
            <Label>State Code</Label>
            <Input value={partyStateCode} onChange={e => setPartyStateCode(e.target.value)} placeholder="33" />
          </div>
        </CardContent>
      </Card>

      {/* Reason */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Reason for Debit Note</CardTitle></CardHeader>
        <CardContent>
          <Textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g. Rate difference, quality issue, shortage in supply etc." rows={3} />
        </CardContent>
      </Card>

      {/* Items */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Items</CardTitle>
            <Button size="sm" variant="outline" onClick={addItem}><Plus className="h-4 w-4 mr-1" />Add Item</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="p-2 w-8">#</th>
                  <th className="p-2">Description</th>
                  <th className="p-2 w-24">HSN</th>
                  <th className="p-2 w-20">Qty</th>
                  <th className="p-2 w-28">Rate</th>
                  <th className="p-2 w-28">Amount</th>
                  <th className="p-2 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={i} className="border-b">
                    <td className="p-2 text-muted-foreground">{i + 1}</td>
                    <td className="p-2"><Input value={item.description} onChange={e => updateItem(i, 'description', e.target.value)} placeholder="Item description" /></td>
                    <td className="p-2"><Input value={item.hsn_code} onChange={e => updateItem(i, 'hsn_code', e.target.value)} placeholder="HSN" /></td>
                    <td className="p-2"><Input type="number" min={1} value={item.quantity} onChange={e => updateItem(i, 'quantity', parseInt(e.target.value) || 0)} /></td>
                    <td className="p-2"><Input type="number" min={0} step="0.01" value={item.rate} onChange={e => updateItem(i, 'rate', parseFloat(e.target.value) || 0)} /></td>
                    <td className="p-2"><Input type="number" min={0} step="0.01" value={item.amount} onChange={e => handleAmountChange(i, parseFloat(e.target.value) || 0)} /></td>
                    <td className="p-2"><Button size="icon" variant="ghost" onClick={() => removeItem(i)} disabled={items.length === 1}><Trash2 className="h-4 w-4 text-destructive" /></Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Tax */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Tax Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup value={taxType} onValueChange={(v) => setTaxType(v as 'intra' | 'inter')} className="flex gap-6">
            <div className="flex items-center gap-2">
              <RadioGroupItem value="intra" id="intra" />
              <Label htmlFor="intra">Intra-State (CGST + SGST)</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="inter" id="inter" />
              <Label htmlFor="inter">Inter-State (IGST)</Label>
            </div>
          </RadioGroup>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {taxType === 'intra' ? (
              <>
                <div>
                  <Label>CGST Rate %</Label>
                  <Input value={cgstRate} onChange={e => setCgstRate(e.target.value)} />
                </div>
                <div>
                  <Label>SGST Rate %</Label>
                  <Input value={sgstRate} onChange={e => setSgstRate(e.target.value)} />
                </div>
              </>
            ) : (
              <div>
                <Label>IGST Rate %</Label>
                <Input value={igstRate} onChange={e => setIgstRate(e.target.value)} />
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2 max-w-sm ml-auto text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
            {taxType === 'intra' ? (
              <>
                <div className="flex justify-between"><span>CGST @ {cgstRate}%</span><span>{formatCurrency(cgstAmt)}</span></div>
                <div className="flex justify-between"><span>SGST @ {sgstRate}%</span><span>{formatCurrency(sgstAmt)}</span></div>
              </>
            ) : (
              <div className="flex justify-between"><span>IGST @ {igstRate}%</span><span>{formatCurrency(igstAmt)}</span></div>
            )}
            <div className="flex justify-between font-bold border-t pt-2"><span>Total</span><span>{formatCurrency(roundedTotal)}</span></div>
          </div>
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl h-[85vh]">
          <DialogHeader><DialogTitle>Debit Note Preview</DialogTitle></DialogHeader>
          {previewPdfUrl && <iframe src={previewPdfUrl} className="w-full flex-1 rounded border" style={{ minHeight: '70vh' }} />}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>Close</Button>
            <Button onClick={() => generatePDF('download')}><Download className="h-4 w-4 mr-2" />Download</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
