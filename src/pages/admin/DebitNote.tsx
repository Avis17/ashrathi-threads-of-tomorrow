import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Plus, Trash2, Download, Eye, Save, ArrowLeft } from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/invoiceUtils';
import { generateDebitNotePDF } from '@/lib/debitNoteUtils';

interface DebitNoteItem {
  description: string;
  hsn_code: string;
  quantity: number;
  rate: number;
  amount: number;
}

export default function DebitNote() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const isEdit = !!id;

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
  const [loading, setLoading] = useState(false);

  // Load existing debit note for editing
  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      const [{ data: note }, { data: noteItems }] = await Promise.all([
        supabase.from('debit_notes').select('*').eq('id', id).single(),
        supabase.from('debit_note_items').select('*').eq('debit_note_id', id).order('sort_order'),
      ]);
      if (note) {
        setDebitNoteNo(note.debit_note_no);
        setDebitNoteDate(note.debit_note_date);
        setOriginalInvoiceNo(note.original_invoice_no || '');
        setOriginalInvoiceDate(note.original_invoice_date || '');
        setPartyName(note.party_name);
        setPartyAddress(note.party_address || '');
        setPartyGstin(note.party_gstin || '');
        setPartyState(note.party_state || '');
        setPartyStateCode(note.party_state_code || '');
        setReason(note.reason || '');
        setTaxType(note.tax_type as 'intra' | 'inter');
        setCgstRate(String(note.cgst_rate));
        setSgstRate(String(note.sgst_rate));
        setIgstRate(String(note.igst_rate));
      }
      if (noteItems?.length) {
        setItems(noteItems.map((i: any) => ({
          description: i.description,
          hsn_code: i.hsn_code || '',
          quantity: Number(i.quantity),
          rate: Number(i.rate),
          amount: Number(i.amount),
        })));
      }
      setLoading(false);
    };
    load();
  }, [id]);

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

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!debitNoteNo || !partyName || items.some(i => !i.description || i.amount <= 0)) {
        throw new Error('Please fill in all required fields.');
      }

      const noteData = {
        debit_note_no: debitNoteNo,
        debit_note_date: debitNoteDate,
        original_invoice_no: originalInvoiceNo || null,
        original_invoice_date: originalInvoiceDate || null,
        party_name: partyName,
        party_address: partyAddress || null,
        party_gstin: partyGstin || null,
        party_state: partyState || null,
        party_state_code: partyStateCode || null,
        reason: reason || null,
        tax_type: taxType,
        cgst_rate: parseFloat(cgstRate),
        sgst_rate: parseFloat(sgstRate),
        igst_rate: parseFloat(igstRate),
        subtotal,
        cgst_amount: cgstAmt,
        sgst_amount: sgstAmt,
        igst_amount: igstAmt,
        total_amount: roundedTotal,
      };

      let noteId = id;

      if (isEdit) {
        const { error } = await supabase.from('debit_notes').update(noteData).eq('id', id);
        if (error) throw error;
        // Delete old items and re-insert
        await supabase.from('debit_note_items').delete().eq('debit_note_id', id);
      } else {
        const { data, error } = await supabase.from('debit_notes').insert(noteData).select('id').single();
        if (error) throw error;
        noteId = data.id;
      }

      // Insert items
      const itemsData = items.map((item, i) => ({
        debit_note_id: noteId,
        description: item.description,
        hsn_code: item.hsn_code || null,
        quantity: item.quantity,
        rate: item.rate,
        amount: item.amount,
        sort_order: i,
      }));

      const { error: itemsError } = await supabase.from('debit_note_items').insert(itemsData);
      if (itemsError) throw itemsError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debit-notes'] });
      toast({ title: 'Saved', description: `Debit note ${isEdit ? 'updated' : 'created'} successfully.` });
      navigate('/admin/debit-note');
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err.message || 'Failed to save.', variant: 'destructive' });
    },
  });

  const handlePreview = async () => {
    if (!debitNoteNo || !partyName || items.some(i => !i.description || i.amount <= 0)) {
      toast({ title: 'Missing fields', description: 'Please fill in all required fields.', variant: 'destructive' });
      return;
    }
    const noteData = {
      debit_note_no: debitNoteNo, debit_note_date: debitNoteDate,
      original_invoice_no: originalInvoiceNo, original_invoice_date: originalInvoiceDate,
      party_name: partyName, party_address: partyAddress, party_gstin: partyGstin,
      party_state: partyState, party_state_code: partyStateCode, reason,
      tax_type: taxType, cgst_rate: cgstRate, sgst_rate: sgstRate, igst_rate: igstRate,
      subtotal, cgst_amount: cgstAmt, sgst_amount: sgstAmt, igst_amount: igstAmt, total_amount: roundedTotal,
    };
    const url = await generateDebitNotePDF(noteData, items, 'preview');
    if (url) { setPreviewPdfUrl(url as string); setPreviewOpen(true); }
  };

  const handleDownload = async () => {
    if (!debitNoteNo || !partyName || items.some(i => !i.description || i.amount <= 0)) {
      toast({ title: 'Missing fields', description: 'Please fill in all required fields.', variant: 'destructive' });
      return;
    }
    const noteData = {
      debit_note_no: debitNoteNo, debit_note_date: debitNoteDate,
      original_invoice_no: originalInvoiceNo, original_invoice_date: originalInvoiceDate,
      party_name: partyName, party_address: partyAddress, party_gstin: partyGstin,
      party_state: partyState, party_state_code: partyStateCode, reason,
      tax_type: taxType, cgst_rate: cgstRate, sgst_rate: sgstRate, igst_rate: igstRate,
      subtotal, cgst_amount: cgstAmt, sgst_amount: sgstAmt, igst_amount: igstAmt, total_amount: roundedTotal,
    };
    await generateDebitNotePDF(noteData, items, 'download');
    toast({ title: 'Downloaded', description: 'Debit note PDF saved.' });
  };

  if (loading) return <p className="text-muted-foreground p-6">Loading...</p>;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/debit-note')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">{isEdit ? 'Edit' : 'Create'} Debit Note</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePreview}><Eye className="h-4 w-4 mr-2" />Preview</Button>
          <Button variant="outline" onClick={handleDownload}><Download className="h-4 w-4 mr-2" />Download</Button>
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
            <Save className="h-4 w-4 mr-2" />{saveMutation.isPending ? 'Saving...' : 'Save'}
          </Button>
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
            <Button onClick={handleDownload}><Download className="h-4 w-4 mr-2" />Download</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
