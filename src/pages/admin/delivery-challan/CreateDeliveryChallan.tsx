import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowLeft, Plus, Trash2, Save, Printer, User, Truck, Package, Calendar, FileText, Building2, ArrowUpRight, ArrowDownLeft, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useJobWorkers, useCreateDeliveryChallan, useCreateJobWorker, useDeliveryChallan, useDeliveryChallanItems, useUpdateDeliveryChallan } from '@/hooks/useDeliveryChallans';
import { useExternalJobOrder } from '@/hooks/useExternalJobOrders';
import { DC_TYPE_LABELS, PURPOSE_LABELS, JOB_WORK_DIRECTION_LABELS, JOB_WORK_DIRECTION_DESCRIPTIONS } from '@/types/deliveryChallan';
import type { CreateDeliveryChallanInput, DeliveryChallanItem, JobWorker } from '@/types/deliveryChallan';
import VehicleSelector from '@/components/admin/delivery-challan/VehicleSelector';

interface ItemRow {
  id: string;
  product_name: string;
  sku: string;
  size: string;
  color: string;
  quantity: number;
  uom: 'pcs' | 'kg';
  remarks: string;
}

const emptyItem = (): ItemRow => ({
  id: crypto.randomUUID(),
  product_name: '',
  sku: '',
  size: '',
  color: '',
  quantity: 0,
  uom: 'pcs',
  remarks: '',
});

const ALL_PURPOSES = ['cutting', 'stitching', 'checking', 'ironing', 'packing', 'embroidery', 'printing'] as const;

// Map job operations to DC purposes
const mapOperationsToPurposes = (operations: any[]): string[] => {
  const purposes: string[] = [];
  operations.forEach(op => {
    const opName = op.operation_name?.toLowerCase() || '';
    if (opName.includes('stitch') || opName.includes('singer') || opName.includes('overlock') || opName.includes('flatlock')) {
      if (!purposes.includes('stitching')) purposes.push('stitching');
    }
    if (opName.includes('iron')) {
      if (!purposes.includes('ironing')) purposes.push('ironing');
    }
    if (opName.includes('pack')) {
      if (!purposes.includes('packing')) purposes.push('packing');
    }
    if (opName.includes('embroid')) {
      if (!purposes.includes('embroidery')) purposes.push('embroidery');
    }
    if (opName.includes('print')) {
      if (!purposes.includes('printing')) purposes.push('printing');
    }
  });
  return purposes.length > 0 ? purposes : ['stitching'];
};

export default function CreateDeliveryChallan() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const isEditMode = !!id;
  
  // Check if coming from job order
  const fromJob = searchParams.get('from') === 'job';
  const jobId = searchParams.get('jobId');
  
  const { data: jobWorkers = [] } = useJobWorkers();
  const { data: existingDC, isLoading: dcLoading } = useDeliveryChallan(id || '');
  const { data: existingItems = [], isLoading: itemsLoading } = useDeliveryChallanItems(id || '');
  const { data: jobOrderData, isLoading: jobOrderLoading } = useExternalJobOrder(jobId || '');
  const createDC = useCreateDeliveryChallan();
  const updateDC = useUpdateDeliveryChallan();
  const createJobWorker = useCreateJobWorker();
  
  const [isPrefilledFromJob, setIsPrefilledFromJob] = useState(false);

  const [jobWorkDirection, setJobWorkDirection] = useState<'given' | 'taken'>('given');
  const [selectedPurposes, setSelectedPurposes] = useState<string[]>(['stitching']);
  
  const [formData, setFormData] = useState<{
    dc_date: string;
    dc_type: 'job_work' | 'return' | 'rework';
    job_worker_name: string;
    job_worker_address: string;
    job_worker_gstin: string;
    vehicle_number: string;
    driver_name: string;
    driver_mobile: string;
    expected_return_date: string;
    notes: string;
  }>({
    dc_date: format(new Date(), 'yyyy-MM-dd'),
    dc_type: 'job_work',
    job_worker_name: '',
    job_worker_address: '',
    job_worker_gstin: '',
    vehicle_number: '',
    driver_name: '',
    driver_mobile: '',
    expected_return_date: '',
    notes: '',
  });

  const [items, setItems] = useState<ItemRow[]>([emptyItem()]);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>('');
  const [showAddWorker, setShowAddWorker] = useState(false);
  const [newWorker, setNewWorker] = useState({
    name: '',
    address: '',
    gstin: '',
    phone: '',
    is_active: true,
  });

  // Prefill form data when editing
  useEffect(() => {
    if (isEditMode && existingDC) {
      setFormData({
        dc_date: existingDC.dc_date,
        dc_type: existingDC.dc_type,
        job_worker_name: existingDC.job_worker_name,
        job_worker_address: existingDC.job_worker_address || '',
        job_worker_gstin: existingDC.job_worker_gstin || '',
        vehicle_number: existingDC.vehicle_number,
        driver_name: existingDC.driver_name,
        driver_mobile: existingDC.driver_mobile,
        expected_return_date: existingDC.expected_return_date || '',
        notes: existingDC.notes || '',
      });
      setJobWorkDirection(existingDC.job_work_direction || 'given');
      // Use purposes array if available, otherwise fall back to single purpose
      if (existingDC.purposes && existingDC.purposes.length > 0) {
        setSelectedPurposes(existingDC.purposes);
      } else if (existingDC.purpose) {
        setSelectedPurposes([existingDC.purpose]);
      }
    }
  }, [isEditMode, existingDC]);

  // Prefill items when editing
  useEffect(() => {
    if (isEditMode && existingItems.length > 0) {
      setItems(existingItems.map(item => ({
        id: item.id,
        product_name: item.product_name,
        sku: item.sku || '',
        size: item.size || '',
        color: item.color || '',
        quantity: item.quantity,
        uom: item.uom as 'pcs' | 'kg',
        remarks: item.remarks || '',
      })));
    }
  }, [isEditMode, existingItems]);

  // Auto-populate from job order data
  useEffect(() => {
    if (fromJob && jobOrderData && !isEditMode && !isPrefilledFromJob) {
      // Set direction to 'taken' for job work taken
      setJobWorkDirection('taken');
      
      // Map purposes from operations
      const purposes = mapOperationsToPurposes(jobOrderData.external_job_operations || []);
      setSelectedPurposes(purposes);
      
      // Set company details
      setFormData(prev => ({
        ...prev,
        dc_type: 'return',
        job_worker_name: jobOrderData.external_job_companies?.company_name || '',
        job_worker_address: jobOrderData.external_job_companies?.address || '',
        job_worker_gstin: jobOrderData.external_job_companies?.gst_number || '',
        notes: `Job Order: ${jobOrderData.job_id}${jobOrderData.notes ? '\n' + jobOrderData.notes : ''}`,
      }));
      
      // Pre-fill first item with style and quantity
      setItems([{
        id: crypto.randomUUID(),
        product_name: jobOrderData.style_name || '',
        sku: '',
        size: '',
        color: '',
        quantity: jobOrderData.number_of_pieces || 0,
        uom: 'pcs',
        remarks: '',
      }]);
      
      setIsPrefilledFromJob(true);
    }
  }, [fromJob, jobOrderData, isEditMode, isPrefilledFromJob]);

  // Auto-populate from prefill query param (e.g., from Job Work page)
  useEffect(() => {
    const prefillStr = searchParams.get('prefill');
    if (prefillStr && !isEditMode && !fromJob) {
      try {
        const prefill = JSON.parse(prefillStr);
        setFormData(prev => ({
          ...prev,
          dc_type: prefill.dc_type || prev.dc_type,
          job_worker_name: prefill.job_worker_name || prev.job_worker_name,
          job_worker_address: prefill.job_worker_address || prev.job_worker_address,
          job_worker_gstin: prefill.job_worker_gstin || prev.job_worker_gstin,
        }));
        if (prefill.job_work_direction) {
          setJobWorkDirection(prefill.job_work_direction);
        }
        if (prefill.purposes?.length > 0) {
          setSelectedPurposes(prefill.purposes);
        } else if (prefill.purpose) {
          setSelectedPurposes([prefill.purpose]);
        }
        if (prefill.items?.length > 0) {
          setItems(prefill.items.map((item: any) => ({
            id: crypto.randomUUID(),
            product_name: item.product_name || '',
            sku: item.sku || '',
            size: item.size || '',
            color: item.color || '',
            quantity: item.quantity || 0,
            uom: (item.uom as 'pcs' | 'kg') || 'pcs',
            remarks: item.remarks || '',
          })));
        }
      } catch (e) {
        // Invalid JSON, ignore
      }
    }
  }, [searchParams, isEditMode, fromJob]);

  const handleWorkerSelect = (workerId: string) => {
    setSelectedWorkerId(workerId);
    const worker = jobWorkers.find(w => w.id === workerId);
    if (worker) {
      setFormData(prev => ({
        ...prev,
        job_worker_name: worker.name,
        job_worker_address: worker.address || '',
        job_worker_gstin: worker.gstin || '',
      }));
    }
  };

  const handlePurposeToggle = (purpose: string) => {
    setSelectedPurposes(prev => {
      if (prev.includes(purpose)) {
        // Don't allow removing if it's the only one selected
        if (prev.length === 1) return prev;
        return prev.filter(p => p !== purpose);
      }
      return [...prev, purpose];
    });
  };

  const handleAddItem = () => {
    setItems([...items, emptyItem()]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const handleItemChange = (id: string, field: keyof ItemRow, value: string | number) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const totalQuantity = items.reduce((sum, item) => sum + (item.quantity || 0), 0);

  const handleAddJobWorker = async () => {
    if (!newWorker.name) return;
    await createJobWorker.mutateAsync(newWorker);
    setShowAddWorker(false);
    setNewWorker({ name: '', address: '', gstin: '', phone: '', is_active: true });
  };

  const handleSubmit = async (andPrint = false) => {
    const validItems = items.filter(item => item.product_name && item.quantity > 0);
    
    if (!formData.job_worker_name || !formData.vehicle_number) {
      return;
    }

    if (validItems.length === 0) {
      return;
    }

    if (selectedPurposes.length === 0) {
      return;
    }

    const primaryPurpose = selectedPurposes[0] as 'cutting' | 'stitching' | 'checking' | 'ironing' | 'packing' | 'embroidery' | 'printing';

    if (isEditMode && id) {
      // Update existing DC with items
      await updateDC.mutateAsync({
        id,
        ...formData,
        purpose: primaryPurpose,
        purposes: selectedPurposes,
        job_work_direction: jobWorkDirection,
        expected_return_date: formData.expected_return_date || null,
        items: validItems.map(({ id: itemId, ...item }) => ({
          ...item,
          sku: item.sku || undefined,
          size: item.size || undefined,
          color: item.color || undefined,
          remarks: item.remarks || undefined,
        })),
      } as any);
      
      if (andPrint) {
        navigate(`/admin/delivery-challan/print/${id}`);
      } else {
        navigate('/admin/delivery-challan');
      }
    } else {
      // Create new DC
      const input: CreateDeliveryChallanInput = {
        ...formData,
        purpose: primaryPurpose,
        purposes: selectedPurposes,
        job_work_direction: jobWorkDirection,
        expected_return_date: formData.expected_return_date || undefined,
        items: validItems.map(({ id, ...item }) => ({
          ...item,
          sku: item.sku || undefined,
          size: item.size || undefined,
          color: item.color || undefined,
          remarks: item.remarks || undefined,
        })),
      };

      const result = await createDC.mutateAsync(input);
      
      if (andPrint) {
        navigate(`/admin/delivery-challan/print/${result.id}`);
      } else {
        navigate('/admin/delivery-challan');
      }
    }
  };

  if (isEditMode && (dcLoading || itemsLoading)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (fromJob && jobOrderLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Dynamic labels based on direction
  const partyLabel = jobWorkDirection === 'given' ? 'Job Worker Details' : 'Principal Company Details';
  const partyIcon = jobWorkDirection === 'given' ? User : Building2;
  const PartyIcon = partyIcon;

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{isEditMode ? 'Edit Delivery Challan' : 'Create Delivery Challan'}</h1>
            <p className="text-muted-foreground text-sm">{isEditMode ? 'Update the DC details' : 'Fill in the details to create a new DC'}</p>
          </div>
        </div>
      </div>

      {/* Pre-filled from Job Order Banner */}
      {isPrefilledFromJob && jobOrderData && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
          <Info className="h-5 w-5 text-blue-600 flex-shrink-0" />
          <div>
            <p className="font-medium text-blue-800">Pre-filled from Job Order</p>
            <p className="text-sm text-blue-600">
              Data loaded from {jobOrderData.job_id} - {jobOrderData.external_job_companies?.company_name}
            </p>
          </div>
        </div>
      )}

      {/* Job Work Direction Toggle */}
      <Card className="border-0 shadow-md overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-indigo-500/5 to-indigo-500/10 border-b">
          <CardTitle className="flex items-center gap-2 text-lg">
            <ArrowUpRight className="h-5 w-5 text-indigo-600" />
            Job Work Direction
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setJobWorkDirection('given')}
              className={`flex items-start gap-4 p-4 rounded-lg border-2 transition-all ${
                jobWorkDirection === 'given'
                  ? 'border-primary bg-primary/5'
                  : 'border-muted hover:border-muted-foreground/30'
              }`}
            >
              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                jobWorkDirection === 'given' ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}>
                <ArrowUpRight className="h-5 w-5" />
              </div>
              <div className="text-left">
                <p className="font-semibold">{JOB_WORK_DIRECTION_LABELS.given}</p>
                <p className="text-sm text-muted-foreground">{JOB_WORK_DIRECTION_DESCRIPTIONS.given}</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setJobWorkDirection('taken')}
              className={`flex items-start gap-4 p-4 rounded-lg border-2 transition-all ${
                jobWorkDirection === 'taken'
                  ? 'border-primary bg-primary/5'
                  : 'border-muted hover:border-muted-foreground/30'
              }`}
            >
              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                jobWorkDirection === 'taken' ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}>
                <ArrowDownLeft className="h-5 w-5" />
              </div>
              <div className="text-left">
                <p className="font-semibold">{JOB_WORK_DIRECTION_LABELS.taken}</p>
                <p className="text-sm text-muted-foreground">{JOB_WORK_DIRECTION_DESCRIPTIONS.taken}</p>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* DC Header Section */}
      <Card className="border-0 shadow-md overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-primary" />
            Delivery Challan Details
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label>DC Number</Label>
              <Input value="Auto-generated" disabled className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label>DC Date *</Label>
              <Input
                type="date"
                value={formData.dc_date}
                onChange={(e) => setFormData({ ...formData, dc_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>DC Type *</Label>
              <Select
                value={formData.dc_type}
                onValueChange={(v) => setFormData({ ...formData, dc_type: v as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(DC_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Expected Return Date</Label>
              <Input
                type="date"
                value={formData.expected_return_date}
                onChange={(e) => setFormData({ ...formData, expected_return_date: e.target.value })}
              />
            </div>
          </div>

          {/* Purpose Multi-Select */}
          <div className="mt-6 space-y-3">
            <Label>Purpose * (Select one or more)</Label>
            <div className="flex flex-wrap gap-4">
              {ALL_PURPOSES.map((purpose) => (
                <div key={purpose} className="flex items-center space-x-2">
                  <Checkbox
                    id={`purpose-${purpose}`}
                    checked={selectedPurposes.includes(purpose)}
                    onCheckedChange={() => handlePurposeToggle(purpose)}
                  />
                  <label
                    htmlFor={`purpose-${purpose}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {PURPOSE_LABELS[purpose]}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Job Worker / Principal Company Section */}
      <Card className="border-0 shadow-md overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-500/5 to-blue-500/10 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <PartyIcon className="h-5 w-5 text-blue-600" />
              {partyLabel}
            </CardTitle>
            <Dialog open={showAddWorker} onOpenChange={setShowAddWorker}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add New {jobWorkDirection === 'given' ? 'Worker' : 'Company'}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New {jobWorkDirection === 'given' ? 'Job Worker' : 'Company'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Name *</Label>
                    <Input
                      value={newWorker.name}
                      onChange={(e) => setNewWorker({ ...newWorker, name: e.target.value })}
                      placeholder={jobWorkDirection === 'given' ? 'Worker name' : 'Company name'}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Address</Label>
                    <Textarea
                      value={newWorker.address}
                      onChange={(e) => setNewWorker({ ...newWorker, address: e.target.value })}
                      placeholder="Full address"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>GSTIN</Label>
                    <Input
                      value={newWorker.gstin}
                      onChange={(e) => setNewWorker({ ...newWorker, gstin: e.target.value })}
                      placeholder="GST Number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input
                      value={newWorker.phone}
                      onChange={(e) => setNewWorker({ ...newWorker, phone: e.target.value })}
                      placeholder="Contact number"
                    />
                  </div>
                  <Button onClick={handleAddJobWorker} className="w-full" disabled={!newWorker.name}>
                    Add {jobWorkDirection === 'given' ? 'Job Worker' : 'Company'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Select {jobWorkDirection === 'given' ? 'Job Worker' : 'Company'} *</Label>
              <Select value={selectedWorkerId} onValueChange={handleWorkerSelect}>
                <SelectTrigger>
                  <SelectValue placeholder={`Select a ${jobWorkDirection === 'given' ? 'job worker' : 'company'}`} />
                </SelectTrigger>
                <SelectContent>
                  {jobWorkers.map((worker) => (
                    <SelectItem key={worker.id} value={worker.id}>
                      {worker.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Or Enter Manually *</Label>
              <Input
                value={formData.job_worker_name}
                onChange={(e) => setFormData({ ...formData, job_worker_name: e.target.value })}
                placeholder={jobWorkDirection === 'given' ? 'Job worker name' : 'Company name'}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Address</Label>
              <Textarea
                value={formData.job_worker_address}
                onChange={(e) => setFormData({ ...formData, job_worker_address: e.target.value })}
                placeholder="Full address"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>GSTIN (Optional)</Label>
              <Input
                value={formData.job_worker_gstin}
                onChange={(e) => setFormData({ ...formData, job_worker_gstin: e.target.value })}
                placeholder="GST Number"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transport Details */}
      <Card className="border-0 shadow-md overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-emerald-500/5 to-emerald-500/10 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Truck className="h-5 w-5 text-emerald-600" />
              Transport Details
            </CardTitle>
            <VehicleSelector 
              onSelect={(vehicle) => {
                setFormData(prev => ({
                  ...prev,
                  vehicle_number: vehicle.vehicle_number,
                  driver_name: vehicle.driver_name,
                  driver_mobile: vehicle.driver_mobile,
                }));
              }}
            />
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label>Vehicle Number *</Label>
              <Input
                value={formData.vehicle_number}
                onChange={(e) => setFormData({ ...formData, vehicle_number: e.target.value.toUpperCase() })}
                placeholder="e.g., KA01AB1234"
              />
            </div>
            <div className="space-y-2">
              <Label>Driver Name</Label>
              <Input
                value={formData.driver_name}
                onChange={(e) => setFormData({ ...formData, driver_name: e.target.value })}
                placeholder="Driver's name (optional)"
              />
            </div>
            <div className="space-y-2">
              <Label>Driver Mobile</Label>
              <Input
                value={formData.driver_mobile}
                onChange={(e) => setFormData({ ...formData, driver_mobile: e.target.value })}
                placeholder="10-digit mobile (optional)"
                maxLength={10}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Item Details */}
      <Card className="border-0 shadow-md overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-purple-500/5 to-purple-500/10 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Package className="h-5 w-5 text-purple-600" />
              Material / Product Details
            </CardTitle>
            <Button variant="outline" size="sm" onClick={handleAddItem} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Row
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="w-[200px]">Product/Fabric Name *</TableHead>
                  <TableHead className="w-[100px]">SKU</TableHead>
                  <TableHead className="w-[80px]">Size</TableHead>
                  <TableHead className="w-[100px]">Color</TableHead>
                  <TableHead className="w-[100px]">Quantity *</TableHead>
                  <TableHead className="w-[80px]">UOM</TableHead>
                  <TableHead className="w-[150px]">Remarks</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Input
                        value={item.product_name}
                        onChange={(e) => handleItemChange(item.id, 'product_name', e.target.value)}
                        placeholder="Enter product name"
                        className="border-0 bg-transparent focus:bg-muted/50"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={item.sku}
                        onChange={(e) => handleItemChange(item.id, 'sku', e.target.value)}
                        placeholder="SKU"
                        className="border-0 bg-transparent focus:bg-muted/50"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={item.size}
                        onChange={(e) => handleItemChange(item.id, 'size', e.target.value)}
                        placeholder="Size"
                        className="border-0 bg-transparent focus:bg-muted/50"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={item.color}
                        onChange={(e) => handleItemChange(item.id, 'color', e.target.value)}
                        placeholder="Color"
                        className="border-0 bg-transparent focus:bg-muted/50"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={item.quantity || ''}
                        onChange={(e) => handleItemChange(item.id, 'quantity', parseInt(e.target.value) || 0)}
                        placeholder="0"
                        className="border-0 bg-transparent focus:bg-muted/50"
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={item.uom}
                        onValueChange={(v: 'pcs' | 'kg') => handleItemChange(item.id, 'uom', v)}
                      >
                        <SelectTrigger className="border-0 bg-transparent">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pcs">pcs</SelectItem>
                          <SelectItem value="kg">kg</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input
                        value={item.remarks}
                        onChange={(e) => handleItemChange(item.id, 'remarks', e.target.value)}
                        placeholder="Remarks"
                        className="border-0 bg-transparent focus:bg-muted/50"
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={items.length === 1}
                        className="h-8 w-8 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow className="bg-muted/50">
                  <TableCell colSpan={4} className="font-semibold text-right">
                    Total Quantity:
                  </TableCell>
                  <TableCell className="font-bold text-lg">{totalQuantity}</TableCell>
                  <TableCell colSpan={3}></TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Declaration */}
      <Card className="border-0 shadow-md bg-amber-50/50 dark:bg-amber-900/10">
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground italic">
            <strong>Declaration:</strong> {jobWorkDirection === 'given' 
              ? 'Goods sent for job work only. Not for sale. Ownership remains with M/s Feather Fashions.'
              : 'Goods returned after job work completion. These goods were received from the Principal Company for processing.'}
          </p>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-6">
          <div className="space-y-2">
            <Label>Additional Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional notes or instructions..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-end gap-4 pb-8">
        <Button variant="outline" onClick={() => navigate(-1)}>
          Cancel
        </Button>
        <Button
          onClick={() => handleSubmit(false)}
          disabled={createDC.isPending || updateDC.isPending}
          className="gap-2"
        >
          <Save className="h-4 w-4" />
          {isEditMode ? 'Update DC' : 'Save DC'}
        </Button>
        <Button
          onClick={() => handleSubmit(true)}
          disabled={createDC.isPending || updateDC.isPending}
          variant="secondary"
          className="gap-2"
        >
          <Printer className="h-4 w-4" />
          {isEditMode ? 'Update & Print' : 'Save & Print'}
        </Button>
      </div>
    </div>
  );
}
