import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowLeft, Save, Eye, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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
import { useProductionPlan, useSaveProductionPlan, useDeleteProductionPlan, type ProductionPlan } from '@/hooks/useDCDocuments';
import ProductionPlanPreview from './ProductionPlanPreview';

export default function ProductionPlanForm() {
  const { dcId, planId } = useParams<{ dcId: string; planId?: string }>();
  const navigate = useNavigate();
  const isEdit = !!planId;

  const { data: dc } = useDeliveryChallan(dcId || '');
  const { data: items = [] } = useDeliveryChallanItems(dcId || '');
  const { data: existing } = useProductionPlan(planId || '');
  const saveMutation = useSaveProductionPlan();
  const deleteMutation = useDeleteProductionPlan();

  const [showPreview, setShowPreview] = useState(false);
  const [form, setForm] = useState<Partial<ProductionPlan>>({
    delivery_challan_id: dcId || '',
    pgm_no: '',
    plan_date: format(new Date(), 'yyyy-MM-dd'),
    follow_up_by: '',
    supplier: 'Feather Fashions',
    ic_no: '',
    item_name: '',
    sizes: '',
    side_cut_style: '',
    fabric_details: '',
    original_pattern: false,
    traced_pattern: false,
    original_sample: false,
    first_sample_approval: false,
    main_label: false,
    care_label: false,
    fusing_sticker: false,
    flag_label: false,
    rope: false,
    button: false,
    metal_badges: false,
    zippers: false,
    follow_up_person: '',
    qc_person: '',
    others_detail: '',
    print_detail: '',
    embroidery_detail: '',
    stone_detail: '',
    fusing_detail: '',
    coin_detail: '',
    others_post_production: '',
    packing_type: '',
    poly_bag: false,
    atta: false,
    photo: false,
    tag: false,
    box: false,
    special_instructions: '',
    authorised_sign_1: '',
    authorised_sign_2: '',
    notes: '',
  });

  useEffect(() => {
    if (dc && !isEdit) {
      const productNames = items.map(i => i.product_name).join(', ');
      setForm(prev => ({
        ...prev,
        item_name: productNames,
        ic_no: dc.dc_number,
      }));
    }
  }, [dc, items, isEdit]);

  useEffect(() => {
    if (existing) {
      setForm({ ...existing, plan_date: existing.plan_date || '' });
    }
  }, [existing]);

  const updateField = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    const payload = {
      ...form,
      delivery_challan_id: dcId!,
      ...(isEdit ? { id: planId } : {}),
    };
    await saveMutation.mutateAsync(payload as any);
    navigate(`/admin/delivery-challan/${dcId}`);
  };

  const handleDelete = async () => {
    if (planId && dcId) {
      await deleteMutation.mutateAsync({ id: planId, dcId });
      navigate(`/admin/delivery-challan/${dcId}`);
    }
  };

  if (showPreview) {
    return <ProductionPlanPreview plan={form as ProductionPlan} onBack={() => setShowPreview(false)} />;
  }

  const CheckField = ({ field, label }: { field: string; label: string }) => (
    <div className="flex items-center gap-2">
      <Checkbox checked={!!(form as any)[field]} onCheckedChange={v => updateField(field, v)} id={field} />
      <Label htmlFor={field} className="text-sm cursor-pointer">{label}</Label>
    </div>
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/admin/delivery-challan/${dcId}`)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{isEdit ? 'Edit' : 'Create'} Production Planning Sheet</h1>
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
                  <AlertDialogTitle>Delete Production Plan?</AlertDialogTitle>
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

      {/* Basic Info */}
      <Card>
        <CardHeader><CardTitle className="text-base">Basic Information</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><Label>PGM No.</Label><Input value={form.pgm_no || ''} onChange={e => updateField('pgm_no', e.target.value)} /></div>
          <div><Label>Date</Label><Input type="date" value={form.plan_date || ''} onChange={e => updateField('plan_date', e.target.value)} /></div>
          <div><Label>Follow Up By</Label><Input value={form.follow_up_by || ''} onChange={e => updateField('follow_up_by', e.target.value)} /></div>
          <div><Label>Supplier</Label><Input value={form.supplier || ''} onChange={e => updateField('supplier', e.target.value)} /></div>
          <div><Label>IC No.</Label><Input value={form.ic_no || ''} onChange={e => updateField('ic_no', e.target.value)} /></div>
          <div><Label>Item Name</Label><Input value={form.item_name || ''} onChange={e => updateField('item_name', e.target.value)} /></div>
          <div><Label>Sizes</Label><Input value={form.sizes || ''} onChange={e => updateField('sizes', e.target.value)} placeholder="e.g. L, XL" /></div>
          <div><Label>Side Cut Style</Label><Input value={form.side_cut_style || ''} onChange={e => updateField('side_cut_style', e.target.value)} /></div>
        </CardContent>
      </Card>

      {/* Fabric Details */}
      <Card>
        <CardHeader><CardTitle className="text-base">Fabric Details</CardTitle></CardHeader>
        <CardContent>
          <Textarea value={form.fabric_details || ''} onChange={e => updateField('fabric_details', e.target.value)} rows={4} placeholder="Enter fabric details - type, roll info, weight, cost etc." />
        </CardContent>
      </Card>

      {/* Details / Approvals Checklist */}
      <Card>
        <CardHeader><CardTitle className="text-base">Details & Approvals Checklist</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <CheckField field="original_pattern" label="Original Pattern" />
          <CheckField field="traced_pattern" label="Traced Pattern" />
          <CheckField field="original_sample" label="Original Sample" />
          <CheckField field="first_sample_approval" label="1st Sample Approval" />
          <CheckField field="main_label" label="Main Label" />
          <CheckField field="care_label" label="Care Label" />
          <CheckField field="fusing_sticker" label="Fusing Sticker" />
          <CheckField field="flag_label" label="Flag Label" />
          <CheckField field="rope" label="Rope" />
          <CheckField field="button" label="Button" />
          <CheckField field="metal_badges" label="Metal Badges" />
          <CheckField field="zippers" label="Zippers" />
        </CardContent>
      </Card>

      {/* People */}
      <Card>
        <CardHeader><CardTitle className="text-base">People</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><Label>Follow Up Person</Label><Input value={form.follow_up_person || ''} onChange={e => updateField('follow_up_person', e.target.value)} /></div>
          <div><Label>QC Person</Label><Input value={form.qc_person || ''} onChange={e => updateField('qc_person', e.target.value)} /></div>
          <div><Label>Others</Label><Input value={form.others_detail || ''} onChange={e => updateField('others_detail', e.target.value)} /></div>
        </CardContent>
      </Card>

      {/* Post Production */}
      <Card>
        <CardHeader><CardTitle className="text-base">Post Production Details</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><Label>Print</Label><Input value={form.print_detail || ''} onChange={e => updateField('print_detail', e.target.value)} /></div>
          <div><Label>Embroidery</Label><Input value={form.embroidery_detail || ''} onChange={e => updateField('embroidery_detail', e.target.value)} /></div>
          <div><Label>Stone</Label><Input value={form.stone_detail || ''} onChange={e => updateField('stone_detail', e.target.value)} /></div>
          <div><Label>Fusing</Label><Input value={form.fusing_detail || ''} onChange={e => updateField('fusing_detail', e.target.value)} /></div>
          <div><Label>Coin</Label><Input value={form.coin_detail || ''} onChange={e => updateField('coin_detail', e.target.value)} /></div>
          <div><Label>Others</Label><Input value={form.others_post_production || ''} onChange={e => updateField('others_post_production', e.target.value)} /></div>
        </CardContent>
      </Card>

      {/* Packing Method */}
      <Card>
        <CardHeader><CardTitle className="text-base">Packing Method Approvals</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div><Label>Packing Type</Label><Input value={form.packing_type || ''} onChange={e => updateField('packing_type', e.target.value)} /></div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <CheckField field="poly_bag" label="Poly Bag" />
            <CheckField field="atta" label="Atta" />
            <CheckField field="photo" label="Photo" />
            <CheckField field="tag" label="Tag" />
            <CheckField field="box" label="Box" />
          </div>
        </CardContent>
      </Card>

      {/* Authorization */}
      <Card>
        <CardHeader><CardTitle className="text-base">Authorization</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><Label>Authorised Sign 1</Label><Input value={form.authorised_sign_1 || ''} onChange={e => updateField('authorised_sign_1', e.target.value)} /></div>
          <div><Label>Authorised Sign 2</Label><Input value={form.authorised_sign_2 || ''} onChange={e => updateField('authorised_sign_2', e.target.value)} /></div>
        </CardContent>
      </Card>

      {/* Special Instructions */}
      <Card>
        <CardHeader><CardTitle className="text-base">Special Instructions</CardTitle></CardHeader>
        <CardContent>
          <Textarea value={form.special_instructions || ''} onChange={e => updateField('special_instructions', e.target.value)} rows={3} placeholder="Any special instructions..." />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3 pb-8">
        <Button variant="outline" onClick={() => setShowPreview(true)}>
          <Eye className="h-4 w-4 mr-1" />Preview
        </Button>
        <Button onClick={handleSave} disabled={saveMutation.isPending}>
          <Save className="h-4 w-4 mr-1" />{saveMutation.isPending ? 'Saving...' : 'Save Production Plan'}
        </Button>
      </div>
    </div>
  );
}
