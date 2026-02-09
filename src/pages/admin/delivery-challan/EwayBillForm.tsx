import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowLeft, Save, Eye, Download, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useDeliveryChallan, useDeliveryChallanItems } from '@/hooks/useDeliveryChallans';
import { useEwayBill, useSaveEwayBill, useDeleteEwayBill, type EwayBill } from '@/hooks/useDCDocuments';
import EwayBillPreview from './EwayBillPreview';

export default function EwayBillForm() {
  const { dcId, ewayId } = useParams<{ dcId: string; ewayId?: string }>();
  const navigate = useNavigate();
  const isEdit = !!ewayId;

  const { data: dc } = useDeliveryChallan(dcId || '');
  const { data: items = [] } = useDeliveryChallanItems(dcId || '');
  const { data: existingBill } = useEwayBill(ewayId || '');
  const saveMutation = useSaveEwayBill();
  const deleteMutation = useDeleteEwayBill();

  const [showPreview, setShowPreview] = useState(false);
  const [form, setForm] = useState<Partial<EwayBill>>({
    delivery_challan_id: dcId || '',
    eway_bill_no: '',
    supply_type: 'Outward-Supply',
    mode: '1 - Road',
    approx_distance: '',
    transaction_type: 'Regular',
    from_name: '',
    from_gstin: '',
    from_state: 'Tamil Nadu',
    from_address: '',
    to_name: 'Feather Fashions',
    to_gstin: '33FWTPS1281P1ZJ',
    to_state: 'Tamil Nadu',
    to_address: '251/1, Vadivel Nagar, Tiruppur, Tamil Nadu 641602',
    dispatch_from: '',
    ship_to: '251/1, Vadivel Nagar, Tiruppur, Tamil Nadu 641602',
    hsn_code: '',
    product_description: '',
    quantity: 0,
    uom: 'KGS',
    taxable_amount: 0,
    tax_rate_cgst: 2.5,
    tax_rate_sgst: 2.5,
    cgst_amount: 0,
    sgst_amount: 0,
    other_amount: 0,
    total_invoice_amount: 0,
    tax_invoice_no: '',
    tax_invoice_date: format(new Date(), 'yyyy-MM-dd'),
    irn: '',
    ack_no: '',
    ack_date: format(new Date(), 'yyyy-MM-dd'),
    transporter_id: '',
    transporter_name: '',
    doc_no: '',
    vehicle_no: '',
    vehicle_from: 'TAMILNADU',
    cewb_no: '',
    notes: '',
  });

  // Populate from DC data
  useEffect(() => {
    if (dc && !isEdit) {
      const productDesc = items.map(i => `${i.product_name}`).join(' & ');
      const totalQty = items.reduce((s, i) => s + i.quantity, 0);
      setForm(prev => ({
        ...prev,
        from_name: dc.job_worker_name,
        from_gstin: dc.job_worker_gstin || '',
        from_address: dc.job_worker_address || '',
        dispatch_from: dc.job_worker_address || '',
        vehicle_no: dc.vehicle_number,
        product_description: productDesc,
        quantity: totalQty,
      }));
    }
  }, [dc, items, isEdit]);

  // Load existing bill data
  useEffect(() => {
    if (existingBill) {
      setForm({
        ...existingBill,
        tax_invoice_date: existingBill.tax_invoice_date || '',
        ack_date: existingBill.ack_date || '',
        doc_date: existingBill.doc_date || '',
      });
    }
  }, [existingBill]);

  // Auto-calc tax amounts
  useEffect(() => {
    const taxable = form.taxable_amount || 0;
    const cgstRate = form.tax_rate_cgst || 0;
    const sgstRate = form.tax_rate_sgst || 0;
    const cgst = +(taxable * cgstRate / 100).toFixed(2);
    const sgst = +(taxable * sgstRate / 100).toFixed(2);
    const other = form.other_amount || 0;
    const total = +(taxable + cgst + sgst + other).toFixed(2);
    setForm(prev => ({
      ...prev,
      cgst_amount: cgst,
      sgst_amount: sgst,
      total_invoice_amount: total,
    }));
  }, [form.taxable_amount, form.tax_rate_cgst, form.tax_rate_sgst, form.other_amount]);

  const updateField = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    const payload = {
      ...form,
      delivery_challan_id: dcId!,
      ...(isEdit ? { id: ewayId } : {}),
    };
    await saveMutation.mutateAsync(payload as any);
    navigate(`/admin/delivery-challan/${dcId}`);
  };

  const handleDelete = async () => {
    if (ewayId && dcId) {
      await deleteMutation.mutateAsync({ id: ewayId, dcId });
      navigate(`/admin/delivery-challan/${dcId}`);
    }
  };

  if (showPreview) {
    return <EwayBillPreview bill={form as EwayBill} onBack={() => setShowPreview(false)} />;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/admin/delivery-challan/${dcId}`)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{isEdit ? 'Edit' : 'Create'} E-Way Bill</h1>
            <p className="text-sm text-muted-foreground">DC: {dc?.dc_number}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isEdit && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm"><Trash2 className="h-4 w-4 mr-1" />Delete</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete E-Way Bill?</AlertDialogTitle>
                  <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <Button variant="outline" onClick={() => setShowPreview(true)}>
            <Eye className="h-4 w-4 mr-1" />Preview
          </Button>
          <Button onClick={handleSave} disabled={saveMutation.isPending}>
            <Save className="h-4 w-4 mr-1" />{saveMutation.isPending ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Tax Invoice & IRN */}
      <Card>
        <CardHeader><CardTitle className="text-base">Tax Invoice & IRN Details</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><Label>Tax Invoice No</Label><Input value={form.tax_invoice_no || ''} onChange={e => updateField('tax_invoice_no', e.target.value)} /></div>
          <div><Label>Tax Invoice Date</Label><Input type="date" value={form.tax_invoice_date || ''} onChange={e => updateField('tax_invoice_date', e.target.value)} /></div>
          <div><Label>IRN</Label><Input value={form.irn || ''} onChange={e => updateField('irn', e.target.value)} placeholder="IRN number" /></div>
          <div><Label>Ack No</Label><Input value={form.ack_no || ''} onChange={e => updateField('ack_no', e.target.value)} /></div>
          <div><Label>Ack Date</Label><Input type="date" value={form.ack_date || ''} onChange={e => updateField('ack_date', e.target.value)} /></div>
        </CardContent>
      </Card>

      {/* E-Way Bill Details */}
      <Card>
        <CardHeader><CardTitle className="text-base">1. E-Way Bill Details</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><Label>E-Way Bill No</Label><Input value={form.eway_bill_no || ''} onChange={e => updateField('eway_bill_no', e.target.value)} /></div>
          <div><Label>Generated By (GSTIN)</Label><Input value={form.generated_by_gstin || ''} onChange={e => updateField('generated_by_gstin', e.target.value)} /></div>
          <div>
            <Label>Supply Type</Label>
            <Select value={form.supply_type || ''} onValueChange={v => updateField('supply_type', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Outward-Supply">Outward-Supply</SelectItem>
                <SelectItem value="Inward-Supply">Inward-Supply</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Mode</Label>
            <Select value={form.mode || ''} onValueChange={v => updateField('mode', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1 - Road">1 - Road</SelectItem>
                <SelectItem value="2 - Rail">2 - Rail</SelectItem>
                <SelectItem value="3 - Air">3 - Air</SelectItem>
                <SelectItem value="4 - Ship">4 - Ship</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div><Label>Approx Distance (KM)</Label><Input value={form.approx_distance || ''} onChange={e => updateField('approx_distance', e.target.value)} /></div>
          <div>
            <Label>Transaction Type</Label>
            <Select value={form.transaction_type || ''} onValueChange={v => updateField('transaction_type', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Regular">Regular</SelectItem>
                <SelectItem value="Bill To - Ship To">Bill To - Ship To</SelectItem>
                <SelectItem value="Bill From - Dispatch From">Bill From - Dispatch From</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Address Details */}
      <Card>
        <CardHeader><CardTitle className="text-base">2. Address Details</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-muted-foreground">FROM</h3>
              <div><Label>Company Name</Label><Input value={form.from_name || ''} onChange={e => updateField('from_name', e.target.value)} /></div>
              <div><Label>GSTIN</Label><Input value={form.from_gstin || ''} onChange={e => updateField('from_gstin', e.target.value)} /></div>
              <div><Label>State</Label><Input value={form.from_state || ''} onChange={e => updateField('from_state', e.target.value)} /></div>
              <div><Label>Dispatch From (Address)</Label><Textarea value={form.dispatch_from || ''} onChange={e => updateField('dispatch_from', e.target.value)} rows={2} /></div>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-muted-foreground">TO</h3>
              <div><Label>Company Name</Label><Input value={form.to_name || ''} onChange={e => updateField('to_name', e.target.value)} /></div>
              <div><Label>GSTIN</Label><Input value={form.to_gstin || ''} onChange={e => updateField('to_gstin', e.target.value)} /></div>
              <div><Label>State</Label><Input value={form.to_state || ''} onChange={e => updateField('to_state', e.target.value)} /></div>
              <div><Label>Ship To (Address)</Label><Textarea value={form.ship_to || ''} onChange={e => updateField('ship_to', e.target.value)} rows={2} /></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Goods Details */}
      <Card>
        <CardHeader><CardTitle className="text-base">3. Goods Details</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><Label>HSN Code</Label><Input value={form.hsn_code || ''} onChange={e => updateField('hsn_code', e.target.value)} /></div>
          <div className="md:col-span-2"><Label>Product Name & Description</Label><Input value={form.product_description || ''} onChange={e => updateField('product_description', e.target.value)} /></div>
          <div><Label>Quantity</Label><Input type="number" value={form.quantity || 0} onChange={e => updateField('quantity', +e.target.value)} /></div>
          <div>
            <Label>UOM</Label>
            <Select value={form.uom || 'KGS'} onValueChange={v => updateField('uom', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="KGS">KGS</SelectItem>
                <SelectItem value="PCS">PCS</SelectItem>
                <SelectItem value="MTR">MTR</SelectItem>
                <SelectItem value="NOS">NOS</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div><Label>Taxable Amount (₹)</Label><Input type="number" value={form.taxable_amount || 0} onChange={e => updateField('taxable_amount', +e.target.value)} /></div>
          <div><Label>CGST Rate (%)</Label><Input type="number" step="0.01" value={form.tax_rate_cgst || 0} onChange={e => updateField('tax_rate_cgst', +e.target.value)} /></div>
          <div><Label>SGST Rate (%)</Label><Input type="number" step="0.01" value={form.tax_rate_sgst || 0} onChange={e => updateField('tax_rate_sgst', +e.target.value)} /></div>
          <div><Label>Other Amount (₹)</Label><Input type="number" value={form.other_amount || 0} onChange={e => updateField('other_amount', +e.target.value)} /></div>
          <Separator className="md:col-span-3" />
          <div className="text-sm text-muted-foreground">CGST: ₹{(form.cgst_amount || 0).toLocaleString('en-IN')}</div>
          <div className="text-sm text-muted-foreground">SGST: ₹{(form.sgst_amount || 0).toLocaleString('en-IN')}</div>
          <div className="text-sm font-semibold">Total Invoice: ₹{(form.total_invoice_amount || 0).toLocaleString('en-IN')}</div>
        </CardContent>
      </Card>

      {/* Transport & Vehicle */}
      <Card>
        <CardHeader><CardTitle className="text-base">4. Transportation & Vehicle Details</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><Label>Transporter ID</Label><Input value={form.transporter_id || ''} onChange={e => updateField('transporter_id', e.target.value)} /></div>
          <div><Label>Transporter Name</Label><Input value={form.transporter_name || ''} onChange={e => updateField('transporter_name', e.target.value)} /></div>
          <div><Label>Doc No</Label><Input value={form.doc_no || ''} onChange={e => updateField('doc_no', e.target.value)} /></div>
          <div><Label>Vehicle No</Label><Input value={form.vehicle_no || ''} onChange={e => updateField('vehicle_no', e.target.value)} /></div>
          <div><Label>Vehicle From (State)</Label><Input value={form.vehicle_from || ''} onChange={e => updateField('vehicle_from', e.target.value)} /></div>
          <div><Label>CEWB No</Label><Input value={form.cewb_no || ''} onChange={e => updateField('cewb_no', e.target.value)} /></div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader><CardTitle className="text-base">Notes</CardTitle></CardHeader>
        <CardContent>
          <Textarea value={form.notes || ''} onChange={e => updateField('notes', e.target.value)} rows={3} placeholder="Additional notes..." />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3 pb-8">
        <Button variant="outline" onClick={() => setShowPreview(true)}>
          <Eye className="h-4 w-4 mr-1" />Preview
        </Button>
        <Button onClick={handleSave} disabled={saveMutation.isPending}>
          <Save className="h-4 w-4 mr-1" />{saveMutation.isPending ? 'Saving...' : 'Save E-Way Bill'}
        </Button>
      </div>
    </div>
  );
}
