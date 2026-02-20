import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Scissors, FileText, DollarSign, Users, Settings, Edit, IndianRupee, Briefcase, BarChart3, Receipt, CreditCard, UserPlus, Save, Truck, CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useJobBatch, useUpdateJobBatch } from '@/hooks/useJobBatches';
import { useBatchTypeConfirmed } from '@/hooks/useBatchTypeConfirmed';
import { useJobProductionEntries } from '@/hooks/useJobProduction';
import { useJobBatchExpenses } from '@/hooks/useJobExpenses';
import { useBatchCuttingLogs } from '@/hooks/useBatchCuttingLogs';
import { useBatchSalaryEntries } from '@/hooks/useBatchSalary';
import { useBatchJobWorks } from '@/hooks/useJobWorks';
import { useBatchOperationProgress } from '@/hooks/useBatchOperationProgress';
import { useJobWorkers } from '@/hooks/useDeliveryChallans';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, parseISO } from 'date-fns';
import { BatchCuttingSection } from '@/components/admin/jobmanagement/batch-details/BatchCuttingSection';
import { BatchOverviewSection } from '@/components/admin/jobmanagement/batch-details/BatchOverviewSection';
import { BatchTypesTable } from '@/components/admin/jobmanagement/batch-details/BatchTypesTable';
import { BatchProductionSection } from '@/components/admin/jobmanagement/batch-details/BatchProductionSection';
import { BatchExpensesSection } from '@/components/admin/jobmanagement/batch-details/BatchExpensesSection';
import { BatchSalarySection } from '@/components/admin/jobmanagement/batch-details/BatchSalarySection';
import { BatchJobWorkSection } from '@/components/admin/jobmanagement/batch-details/BatchJobWorkSection';
import EditBatchDialog from '@/components/admin/jobmanagement/EditBatchDialog';
import { GenerateInvoiceDialog } from '@/components/admin/jobmanagement/batch-details/GenerateInvoiceDialog';
import { BatchPaymentSection } from '@/components/admin/jobmanagement/batch-details/BatchPaymentSection';
import { BatchWeightAnalysisCard } from '@/components/admin/jobmanagement/batch-details/BatchWeightAnalysisCard';
import { AddWorkerDialog } from '@/components/admin/jobmanagement/batch-details/AddWorkerDialog';
import { CreateDCFromBatchDialog } from '@/components/admin/jobmanagement/batch-details/CreateDCFromBatchDialog';

const BATCH_STATUSES = [
  { value: 'created', label: 'Created', color: 'bg-blue-500' },
  { value: 'draft', label: 'Draft', color: 'bg-gray-500' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-yellow-500' },
  { value: 'completed', label: 'Completed', color: 'bg-green-500' },
  { value: 'payment_pending', label: 'Payment Pending', color: 'bg-orange-500' },
];

const PAYMENT_STATUSES = [
  { value: 'unpaid', label: 'Unpaid', color: 'bg-red-500' },
  { value: 'partial', label: 'Partial', color: 'bg-orange-500' },
  { value: 'paid', label: 'Paid', color: 'bg-green-500' },
  { value: 'on_hold', label: 'On Hold', color: 'bg-gray-500' },
];

const BatchDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: batch, isLoading } = useJobBatch(id || '');
  const { data: productionEntries } = useJobProductionEntries(id || '');
  const { data: expenses } = useJobBatchExpenses(id || '');
  const { data: cuttingLogs } = useBatchCuttingLogs(id || '');
  const { data: salaryEntries } = useBatchSalaryEntries(id || '');
  const { data: jobWorks } = useBatchJobWorks(id || '');
  const { data: operationProgress } = useBatchOperationProgress(id || '');
  const { data: typeConfirmedData } = useBatchTypeConfirmed(id || '');
  const confirmedMap = typeConfirmedData?.confirmedMap ?? {};
  const { data: allStyles = [] } = useQuery({
    queryKey: ['job-styles-all'],
    queryFn: async () => {
      const { data, error } = await supabase.from('job_styles').select('id, style_name, style_code');
      if (error) throw error;
      return data || [];
    },
  });
  const styleLookup: Record<string, string> = {};
  allStyles.forEach((s: any) => { styleLookup[s.id] = s.style_name; });
  const updateBatchMutation = useUpdateJobBatch();
  const { data: jobWorkers = [], refetch: refetchWorkers } = useJobWorkers(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const [addWorkerOpen, setAddWorkerOpen] = useState(false);
  const [createDCOpen, setCreateDCOpen] = useState(false);
  const [infoForm, setInfoForm] = useState<{
    supplier_name: string;
    lot_number: string;
    remarks: string;
    company_name: string;
  } | null>(null);
  // styleDetailsForm: map from style_id -> { fabric_type, gsm, sizes, planned_start_date, estimated_delivery_date, operations }
  const [styleDetailsForm, setStyleDetailsForm] = useState<Record<string, { fabric_type: string; gsm: string; sizes: string; planned_start_date: string; estimated_delivery_date: string; operations: string[] }> | null>(null);
  const [styleDatePopovers, setStyleDatePopovers] = useState<Record<string, { start: boolean; delivery: boolean }>>({});

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading batch details...</p>
        </div>
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="text-center py-12">
        <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">Batch not found</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/admin/job-management')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Job Management
        </Button>
      </div>
    );
  }

  const rollsData = (batch.rolls_data || []) as any[];
  
  // Extract unique operations across all types
  const batchOperations: string[] = Array.from(
    new Set(rollsData.flatMap((type: any) => type.operations || []))
  );
  
  const totalLabourCost = productionEntries?.reduce((sum, entry) => sum + entry.total_amount, 0) || 0;
  const totalExpenses = expenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0;
  const totalSalary = salaryEntries?.reduce((sum, e) => sum + (e.rate_per_piece * e.quantity), 0) || 0;
  const totalJobWorkPaid = jobWorks?.reduce((sum, jw) => sum + jw.paid_amount, 0) || 0;
  const totalCost = totalSalary + totalExpenses + totalJobWorkPaid;

  // Calculate cutting summary per type
  const cuttingSummary: Record<number, number> = {};
  cuttingLogs?.forEach(log => {
    cuttingSummary[log.type_index] = (cuttingSummary[log.type_index] || 0) + log.pieces_cut;
  });
  const totalCutPieces = Object.values(cuttingSummary).reduce((sum, val) => sum + val, 0);

  // Calculate production progress from batch_operation_progress (non-cutting operations)
  const totalProductionPieces = (() => {
    if (!operationProgress || operationProgress.length === 0) return 0;
    // Get unique type indices
    const typeIndices = new Set(operationProgress.map(p => p.type_index));
    let total = 0;
    typeIndices.forEach(ti => {
      const nonCuttingOps = operationProgress.filter(p => p.type_index === ti && p.operation !== 'Cutting');
      if (nonCuttingOps.length > 0) {
        // Use minimum across non-cutting ops (bottleneck) for this type
        total += Math.min(...nonCuttingOps.map(o => o.completed_pieces));
      }
    });
    return total;
  })();

  const getStatusColor = (status: string) => {
    const found = BATCH_STATUSES.find(s => s.value === status);
    return found?.color || 'bg-gray-500';
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!id) return;
    await updateBatchMutation.mutateAsync({ id, data: { status: newStatus } });
  };

  const handlePaymentStatusChange = async (newStatus: string) => {
    if (!id) return;
    await updateBatchMutation.mutateAsync({ id, data: { payment_status: newStatus } });
  };

  // Calculate overall progress based on cutting and production
  const calculateProgress = () => {
    if (totalCutPieces === 0) return 0;
    const progress = Math.min((totalProductionPieces / totalCutPieces) * 100, 100);
    return Math.round(progress);
  };

  const currentProgress = calculateProgress();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/job-management')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Package className="h-6 w-6 text-primary" />
              {batch.batch_number}
            </h1>
            <p className="text-sm text-muted-foreground">
              Created on {format(new Date(batch.date_created), 'MMMM dd, yyyy')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Select value={batch.status || 'created'} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[180px]">
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${getStatusColor(batch.status || 'created')}`} />
                <span className="text-sm font-medium">
                  {BATCH_STATUSES.find(s => s.value === batch.status)?.label || batch.status?.toUpperCase()}
                </span>
              </div>
            </SelectTrigger>
            <SelectContent>
              {BATCH_STATUSES.map(s => (
                <SelectItem key={s.value} value={s.value}>
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${s.color}`} />
                    {s.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={(batch as any).payment_status || 'unpaid'} onValueChange={handlePaymentStatusChange}>
            <SelectTrigger className="w-[160px]">
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${PAYMENT_STATUSES.find(s => s.value === ((batch as any).payment_status || 'unpaid'))?.color || 'bg-gray-500'}`} />
                <span className="text-sm font-medium">
                  {PAYMENT_STATUSES.find(s => s.value === ((batch as any).payment_status || 'unpaid'))?.label || 'Unpaid'}
                </span>
              </div>
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_STATUSES.map(s => (
                <SelectItem key={s.value} value={s.value}>
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${s.color}`} />
                    {s.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Badge variant="outline" className="px-3 py-1">
            Cut: {totalCutPieces} | Prod: {totalProductionPieces} | {currentProgress}%
          </Badge>
          <Button variant="outline" size="sm" onClick={() => setCreateDCOpen(true)}>
            <Truck className="h-4 w-4 mr-1" />
            Create DC
          </Button>
          <Button variant="default" size="sm" onClick={() => navigate(`/admin/job-management/batch/${id}/dashboard`)}>
            <BarChart3 className="h-4 w-4 mr-1" />
            Dashboard
          </Button>
          <Button variant="outline" size="sm" onClick={() => setInvoiceDialogOpen(true)}>
            <Receipt className="h-4 w-4 mr-1" />
            Invoice
          </Button>
          <Button variant="outline" size="sm" onClick={() => setEditDialogOpen(true)}>
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <BatchOverviewSection 
        batch={batch} 
        rollsData={rollsData}
        totalCutPieces={totalCutPieces}
        totalCost={totalCost}
        totalProductionPieces={totalProductionPieces}
        costBreakdown={{ salaryTotal: totalSalary, expenseTotal: totalExpenses, jobWorkTotal: totalJobWorkPaid }}
        styleLookup={styleLookup}
        cuttingSummary={cuttingSummary}
        operationProgress={operationProgress || []}
      />

      {/* Weight Analysis Card */}
      {(() => {
        // Build style-wise fabric info
        const styleMap: Record<string, { styleName: string; totalWeightKg: number; totalCutPieces: number }> = {};
        rollsData.forEach((r: any, idx: number) => {
          const key = r.style_id || 'unknown';
          const name = styleLookup[key] || r.style_name || `Style ${key.slice(0, 6)}`;
          if (!styleMap[key]) styleMap[key] = { styleName: name, totalWeightKg: 0, totalCutPieces: 0 };
          styleMap[key].totalWeightKg += (Number(r.number_of_rolls) || 0) * (Number(r.weight) || 0);
          styleMap[key].totalCutPieces += cuttingSummary[idx] || 0;
        });
        const styleList = Object.entries(styleMap).map(([styleId, info]) => ({ styleId, ...info }));
        return (
          <BatchWeightAnalysisCard
            batchId={id || ''}
            styles={styleList}
          />
        );
      })()}

      {/* Main Tabs */}
      <Tabs defaultValue="cutting" className="w-full">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="cutting" className="flex items-center gap-2">
            <Scissors className="h-4 w-4" />
            Cutting
          </TabsTrigger>
          <TabsTrigger value="types" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Types/Colors
          </TabsTrigger>
          <TabsTrigger value="production" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Production
          </TabsTrigger>
          <TabsTrigger value="salary" className="flex items-center gap-2">
            <IndianRupee className="h-4 w-4" />
            Salary
          </TabsTrigger>
          <TabsTrigger value="expenses" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Expenses
          </TabsTrigger>
          <TabsTrigger value="jobwork" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Job Work
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Payments
          </TabsTrigger>
          <TabsTrigger value="info" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Info
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cutting" className="mt-6">
          <BatchCuttingSection 
            batch={batch} 
            rollsData={rollsData} 
            cuttingLogs={cuttingLogs || []} 
            cuttingSummary={cuttingSummary}
          />
        </TabsContent>

        <TabsContent value="types" className="mt-6">
          <BatchTypesTable 
            rollsData={rollsData} 
            cuttingSummary={cuttingSummary}
            batchId={id || ''}
          />
        </TabsContent>

        <TabsContent value="production" className="mt-6">
          <BatchProductionSection batchId={id || ''} operations={batchOperations} rollsData={rollsData} cuttingSummary={cuttingSummary} styleLookup={styleLookup} />
        </TabsContent>

        <TabsContent value="salary" className="mt-6">
          <BatchSalarySection batchId={id || ''} rollsData={rollsData} cuttingSummary={cuttingSummary} totalCutPieces={totalCutPieces} />
        </TabsContent>

        <TabsContent value="expenses" className="mt-6">
          <BatchExpensesSection batchId={id || ''} totalCutPieces={totalCutPieces} />
        </TabsContent>

        <TabsContent value="jobwork" className="mt-6">
          <BatchJobWorkSection batchId={id || ''} rollsData={rollsData} cuttingSummary={cuttingSummary} />
        </TabsContent>

        <TabsContent value="payments" className="mt-6">
          <BatchPaymentSection batchId={id || ''} rollsData={rollsData} />
        </TabsContent>

        <TabsContent value="info" className="mt-6">
          {(() => {
            const form = infoForm ?? {
              supplier_name: batch.supplier_name || '',
              lot_number: batch.lot_number || '',
              remarks: batch.remarks || '',
              company_name: (batch as any).company_name || '',
            };
            const setForm = (updates: Partial<typeof form>) =>
              setInfoForm({ ...form, ...updates });

            // Build style-wise defaults from rollsData (first entry per style defines the shared fields)
            const styleDefaults: Record<string, { fabric_type: string; gsm: string; sizes: string; styleName: string; planned_start_date: string; estimated_delivery_date: string; operations: string[] }> = {};
            rollsData.forEach((r: any) => {
              const sid = r.style_id || '__unknown__';
              if (!styleDefaults[sid]) {
                styleDefaults[sid] = {
                  fabric_type: r.fabric_type || '',
                  gsm: r.gsm || '',
                  sizes: r.sizes || '',
                  planned_start_date: r.planned_start_date || '',
                  estimated_delivery_date: r.estimated_delivery_date || '',
                  operations: Array.isArray(r.operations) ? r.operations : batchOperations,
                  styleName: styleLookup[sid] || 'Unknown Style',
                };
              }
            });

            const styleForm = styleDetailsForm ?? Object.fromEntries(
              Object.entries(styleDefaults).map(([sid, v]) => [sid, {
                fabric_type: v.fabric_type,
                gsm: v.gsm,
                sizes: v.sizes,
                planned_start_date: v.planned_start_date,
                estimated_delivery_date: v.estimated_delivery_date,
                operations: v.operations,
              }])
            );
            const setStyleField = (sid: string, field: string, value: any) =>
              setStyleDetailsForm({ ...styleForm, [sid]: { ...styleForm[sid], [field]: value } });

            const AVAILABLE_OPERATIONS = ['Cutting', 'Stitching (Singer)', 'Stitching (Power Table)', 'Checking', 'Ironing', 'Packing', 'Accessories'];

            const handleSave = async () => {
              // Apply style-wise changes back to all rolls of that style
              const updatedRollsData = rollsData.map((r: any) => {
                const sid = r.style_id || '__unknown__';
                const overrides = styleForm[sid];
                if (!overrides) return r;
                return {
                  ...r,
                  fabric_type: overrides.fabric_type,
                  gsm: overrides.gsm,
                  sizes: overrides.sizes,
                  planned_start_date: overrides.planned_start_date || null,
                  estimated_delivery_date: overrides.estimated_delivery_date || null,
                  operations: overrides.operations,
                };
              });

              await updateBatchMutation.mutateAsync({
                id: id!,
                data: {
                  supplier_name: form.supplier_name || null,
                  lot_number: form.lot_number || null,
                  remarks: form.remarks || null,
                  rolls_data: updatedRollsData,
                  ...(form.company_name !== undefined ? { company_name: form.company_name } : {}),
                } as any,
              });
              setInfoForm(null);
              setStyleDetailsForm(null);
            };

            return (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Batch Information</CardTitle>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={updateBatchMutation.isPending}
                    className="gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {updateBatchMutation.isPending ? 'Saving...' : 'Save'}
                  </Button>
                </CardHeader>
                <CardContent className="space-y-5">
                  {/* Read-only stats */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between p-3 bg-muted/30 rounded">
                      <span className="text-muted-foreground">Total Fabric</span>
                      <span className="font-medium">{batch.total_fabric_received_kg?.toFixed(2) || 0} kg</span>
                    </div>
                    <div className="flex justify-between p-3 bg-muted/30 rounded">
                      <span className="text-muted-foreground">Number of Rolls</span>
                      <span className="font-medium">{batch.number_of_rolls}</span>
                    </div>
                  </div>

                  {/* Style-wise editable details */}
                  {Object.entries(styleDefaults).length > 0 && (
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold">Style Details</Label>
                      <div className="space-y-4">
                        {Object.entries(styleDefaults).map(([sid, defaults]) => {
                          const startPopper = styleDatePopovers[sid]?.start || false;
                          const deliveryPopper = styleDatePopovers[sid]?.delivery || false;
                          const currentOps: string[] = styleForm[sid]?.operations ?? defaults.operations;
                          return (
                            <div key={sid} className="border rounded-lg p-4 space-y-4">
                              <p className="text-sm font-semibold text-foreground">{defaults.styleName}</p>

                              {/* Fabric / GSM / Sizes */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div className="space-y-1.5">
                                  <Label className="text-xs">Fabric Type</Label>
                                  <Input
                                    value={styleForm[sid]?.fabric_type ?? defaults.fabric_type}
                                    onChange={(e) => setStyleField(sid, 'fabric_type', e.target.value)}
                                    placeholder="e.g., Cotton"
                                    className="h-9"
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <Label className="text-xs">GSM</Label>
                                  <Input
                                    value={styleForm[sid]?.gsm ?? defaults.gsm}
                                    onChange={(e) => setStyleField(sid, 'gsm', e.target.value)}
                                    placeholder="e.g., 220"
                                    className="h-9"
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <Label className="text-xs">Sizes</Label>
                                  <Input
                                    value={styleForm[sid]?.sizes ?? defaults.sizes}
                                    onChange={(e) => setStyleField(sid, 'sizes', e.target.value)}
                                    placeholder="e.g., S, M, L, XL"
                                    className="h-9"
                                  />
                                </div>
                              </div>

                              {/* Dates */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                  <Label className="text-xs">Planned Start Date</Label>
                                  <Popover open={startPopper} onOpenChange={(o) => setStyleDatePopovers(prev => ({ ...prev, [sid]: { ...prev[sid], start: o } }))}>
                                    <PopoverTrigger asChild>
                                      <Button
                                        variant="outline"
                                        className={cn('w-full h-9 justify-start text-left font-normal', !(styleForm[sid]?.planned_start_date || defaults.planned_start_date) && 'text-muted-foreground')}
                                      >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {(styleForm[sid]?.planned_start_date || defaults.planned_start_date)
                                          ? format(parseISO(styleForm[sid]?.planned_start_date || defaults.planned_start_date), 'dd MMM yyyy')
                                          : 'Pick date'}
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0 z-50" align="start">
                                      <Calendar
                                        mode="single"
                                        selected={(styleForm[sid]?.planned_start_date || defaults.planned_start_date) ? parseISO(styleForm[sid]?.planned_start_date || defaults.planned_start_date) : undefined}
                                        onSelect={(date) => {
                                          if (date) {
                                            setStyleField(sid, 'planned_start_date', format(date, 'yyyy-MM-dd'));
                                            setStyleDatePopovers(prev => ({ ...prev, [sid]: { ...prev[sid], start: false } }));
                                          }
                                        }}
                                        className={cn('p-3 pointer-events-auto')}
                                      />
                                    </PopoverContent>
                                  </Popover>
                                </div>
                                <div className="space-y-1.5">
                                  <Label className="text-xs">Estimated Delivery Date</Label>
                                  <Popover open={deliveryPopper} onOpenChange={(o) => setStyleDatePopovers(prev => ({ ...prev, [sid]: { ...prev[sid], delivery: o } }))}>
                                    <PopoverTrigger asChild>
                                      <Button
                                        variant="outline"
                                        className={cn('w-full h-9 justify-start text-left font-normal', !(styleForm[sid]?.estimated_delivery_date || defaults.estimated_delivery_date) && 'text-muted-foreground')}
                                      >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {(styleForm[sid]?.estimated_delivery_date || defaults.estimated_delivery_date)
                                          ? format(parseISO(styleForm[sid]?.estimated_delivery_date || defaults.estimated_delivery_date), 'dd MMM yyyy')
                                          : 'Pick date'}
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0 z-50" align="start">
                                      <Calendar
                                        mode="single"
                                        selected={(styleForm[sid]?.estimated_delivery_date || defaults.estimated_delivery_date) ? parseISO(styleForm[sid]?.estimated_delivery_date || defaults.estimated_delivery_date) : undefined}
                                        onSelect={(date) => {
                                          if (date) {
                                            setStyleField(sid, 'estimated_delivery_date', format(date, 'yyyy-MM-dd'));
                                            setStyleDatePopovers(prev => ({ ...prev, [sid]: { ...prev[sid], delivery: false } }));
                                          }
                                        }}
                                        className={cn('p-3 pointer-events-auto')}
                                      />
                                    </PopoverContent>
                                  </Popover>
                                </div>
                              </div>

                              {/* Operations */}
                              <div className="space-y-1.5">
                                <Label className="text-xs">Applicable Operations</Label>
                                <div className="flex flex-wrap gap-2">
                                  {AVAILABLE_OPERATIONS.map(op => {
                                    const isActive = currentOps.includes(op);
                                    return (
                                      <button
                                        key={op}
                                        type="button"
                                        onClick={() => {
                                          const next = isActive
                                            ? currentOps.filter(o => o !== op)
                                            : [...currentOps, op];
                                          setStyleField(sid, 'operations', next);
                                        }}
                                        className={cn(
                                          'px-3 py-1 rounded-full text-xs border transition-colors',
                                          isActive
                                            ? 'bg-primary text-primary-foreground border-primary'
                                            : 'bg-background text-muted-foreground border-border hover:border-primary hover:text-foreground'
                                        )}
                                      >
                                        {op}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Editable fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Supplier Name</Label>
                      <Input
                        value={form.supplier_name}
                        onChange={(e) => setForm({ supplier_name: e.target.value })}
                        placeholder="ABC Textiles"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Lot Number</Label>
                      <Input
                        value={form.lot_number}
                        onChange={(e) => setForm({ lot_number: e.target.value })}
                        placeholder="LOT-2024-001"
                      />
                    </div>
                  </div>

                  {/* Company / Job Worker */}
                  <div className="space-y-2">
                    <Label>Company / Job Worker</Label>
                    <div className="flex gap-2">
                      <Select
                        value={form.company_name}
                        onValueChange={(val) => setForm({ company_name: val })}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select company or job worker..." />
                        </SelectTrigger>
                        <SelectContent className="z-50">
                          {form.company_name && !jobWorkers.find(w => w.name === form.company_name) && (
                            <SelectItem value={form.company_name}>
                              {form.company_name} (current)
                            </SelectItem>
                          )}
                          {jobWorkers.map((worker) => (
                            <SelectItem key={worker.id} value={worker.name}>
                              <div className="flex flex-col">
                                <span>{worker.name}</span>
                                {worker.gstin && (
                                  <span className="text-xs text-muted-foreground">GSTIN: {worker.gstin}</span>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setAddWorkerOpen(true)}
                        title="Add new job worker / company"
                      >
                        <UserPlus className="h-4 w-4" />
                      </Button>
                    </div>
                    {form.company_name && (
                      <p className="text-xs text-muted-foreground">
                        Selected: <span className="font-medium text-foreground">{form.company_name}</span>
                      </p>
                    )}
                  </div>

                  {/* Remarks */}
                  <div className="space-y-2">
                    <Label>Remarks</Label>
                    <Textarea
                      value={form.remarks}
                      onChange={(e) => setForm({ remarks: e.target.value })}
                      placeholder="Any additional notes..."
                      className="min-h-[100px]"
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })()}
        </TabsContent>
      </Tabs>


      {/* Edit Batch Dialog */}
      <EditBatchDialog 
        open={editDialogOpen} 
        onOpenChange={setEditDialogOpen} 
        batch={batch} 
      />

      {/* Generate Invoice Dialog */}
      <GenerateInvoiceDialog
        open={invoiceDialogOpen}
        onOpenChange={setInvoiceDialogOpen}
        batchId={id || ''}
        batchNumber={batch.batch_number}
        rollsData={rollsData}
        cuttingSummary={cuttingSummary}
      />

      {/* Add Worker Dialog */}
      <AddWorkerDialog
        open={addWorkerOpen}
        onOpenChange={setAddWorkerOpen}
        onWorkerCreated={(name) => {
          refetchWorkers();
          setInfoForm(prev => prev ? { ...prev, company_name: name } : {
            supplier_name: batch.supplier_name || '',
            lot_number: batch.lot_number || '',
            remarks: batch.remarks || '',
            company_name: name,
          });
        }}
      />

      {/* Create DC from Batch Dialog */}
      <CreateDCFromBatchDialog
        open={createDCOpen}
        onOpenChange={setCreateDCOpen}
        batchId={id || ''}
        batchNumber={batch.batch_number}
        rollsData={rollsData}
        cuttingSummary={cuttingSummary}
        confirmedMap={confirmedMap}
        styleLookup={styleLookup}
        companyName={(batch as any).company_name || ''}
      />
    </div>
  );
};

export default BatchDetailsPage;
