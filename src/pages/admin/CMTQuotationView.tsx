import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Edit, CheckCircle, Clock, FileText, Save, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCMTQuotation, useSaveCMTQuotation, recordToQuotationData } from '@/hooks/useCMTQuotations';
import { useUpdateCMTQuotationStatus, ApprovedRates } from '@/hooks/useCMTQuotationStatus';
import { generateCMTPdf } from '@/lib/cmtPdfGenerator';
import { toast } from 'sonner';
import { CMTOperation, operationCategories, machineTypes } from '@/types/cmt-quotation';

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft', icon: FileText, color: 'bg-muted-foreground' },
  { value: 'sent', label: 'Sent', icon: Clock, color: 'bg-blue-500' },
  { value: 'in_progress', label: 'In Progress', icon: Clock, color: 'bg-yellow-500' },
  { value: 'approved', label: 'Approved', icon: CheckCircle, color: 'bg-green-500' },
  { value: 'rejected', label: 'Rejected', icon: FileText, color: 'bg-destructive' },
];

const CMTQuotationView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: quotation, isLoading, refetch } = useCMTQuotation(id || null);
  const updateStatus = useUpdateCMTQuotationStatus();
  const saveQuotation = useSaveCMTQuotation();

  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [approvedRates, setApprovedRates] = useState<ApprovedRates | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Operations editing state
  const [operations, setOperations] = useState<CMTOperation[]>([]);
  const [isEditingOperations, setIsEditingOperations] = useState(false);
  
  // Company profit in rupees (for approved rates)
  const [companyProfitRupees, setCompanyProfitRupees] = useState<number>(0);

  useEffect(() => {
    if (quotation) {
      setSelectedStatus(quotation.status);
      setOperations(quotation.operations || []);
      
      // Initialize approved rates from existing data or quotation values
      const existingApproved = quotation.approved_rates as ApprovedRates | null;
      if (existingApproved) {
        setApprovedRates(existingApproved);
        // Calculate rupee value from percent
        const ops = existingApproved.operations || [];
        const opsTotal = ops.reduce((sum, op) => sum + op.rate, 0);
        const base = opsTotal + existingApproved.finishingPackingCost + existingApproved.overheadsCost;
        const profitRupees = base * (existingApproved.companyProfitPercent / 100);
        setCompanyProfitRupees(profitRupees);
      } else {
        // Initialize with current quotation values
        const ops = quotation.operations || [];
        const opsTotal = ops.reduce((sum: number, op: any) => sum + (op.ratePerPiece || 0), 0);
        const finPack = Number(quotation.finishing_packing_cost) || 0;
        const overheads = Number(quotation.overheads_cost) || 0;
        const profitPercent = Number(quotation.company_profit_percent) || 0;
        const base = opsTotal + finPack + overheads;
        const profitRupees = base * (profitPercent / 100);
        
        setApprovedRates({
          operations: ops.map((op: any) => ({ category: op.category, machineType: op.machineType, description: op.description, rate: op.ratePerPiece })),
          finishingPackingCost: finPack,
          overheadsCost: overheads,
          companyProfitPercent: profitPercent,
          finalCMTPerPiece: Number(quotation.final_cmt_per_piece) || 0,
        });
        setCompanyProfitRupees(profitRupees);
      }
    }
  }, [quotation]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground mb-4">Quotation not found</p>
        <Button variant="outline" onClick={() => navigate('/admin/cmt-quotation')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Quotations
        </Button>
      </div>
    );
  }

  const data = recordToQuotationData(quotation);
  const totalStitchingCost = data.operations.reduce((sum, op) => sum + op.ratePerPiece, 0);
  const baseCMT = totalStitchingCost + data.finishingPackingCost + data.overheadsCost;
  const profitAmount = baseCMT * (data.companyProfitPercent / 100);
  const finalCMTPerPiece = baseCMT + profitAmount;

  const handleDownloadPdf = async () => {
    try {
      toast.info('Generating PDF...');
      await generateCMTPdf(data);
      toast.success('PDF downloaded!');
    } catch (error) {
      toast.error('Failed to generate PDF');
    }
  };

  const handleStatusChange = (newStatus: string) => {
    setSelectedStatus(newStatus);
    if (newStatus === 'approved') {
      setIsEditing(true);
    }
  };

  // Calculate profit percent from rupees
  const calculateProfitPercent = (profitRupees: number, rates: ApprovedRates | null) => {
    if (!rates) return 0;
    const opsTotal = rates.operations.reduce((sum, op) => sum + op.rate, 0);
    const base = opsTotal + rates.finishingPackingCost + rates.overheadsCost;
    if (base === 0) return 0;
    return (profitRupees / base) * 100;
  };

  const handleProfitRupeesChange = (rupees: number) => {
    setCompanyProfitRupees(rupees);
    if (approvedRates) {
      const percent = calculateProfitPercent(rupees, approvedRates);
      setApprovedRates({ ...approvedRates, companyProfitPercent: percent });
    }
  };

  const handleSaveStatus = () => {
    const payload: { status: string; approved_rates?: ApprovedRates } = {
      status: selectedStatus,
    };

    if (selectedStatus === 'approved' && approvedRates) {
      // Calculate final approved CMT
      const approvedOpsTotal = approvedRates.operations.reduce((sum, op) => sum + op.rate, 0);
      const approvedBase = approvedOpsTotal + approvedRates.finishingPackingCost + approvedRates.overheadsCost;
      const approvedProfit = approvedBase * (approvedRates.companyProfitPercent / 100);
      const approvedFinal = approvedBase + approvedProfit;

      payload.approved_rates = {
        ...approvedRates,
        finalCMTPerPiece: approvedFinal,
      };
    }

    updateStatus.mutate(
      { id: quotation.id, ...payload },
      {
        onSuccess: () => {
          setIsEditing(false);
        },
      }
    );
  };

  const updateApprovedOperationRate = (index: number, rate: number) => {
    if (!approvedRates) return;
    const newOps = [...approvedRates.operations];
    newOps[index] = { ...newOps[index], rate };
    setApprovedRates({ ...approvedRates, operations: newOps });
  };

  // Operations CRUD
  const addOperation = () => {
    const newOp: CMTOperation = {
      id: crypto.randomUUID(),
      category: 'Stitching',
      machineType: 'Not Defined',
      description: '',
      smv: 0,
      ratePerPiece: 0,
      amount: 0,
    };
    setOperations([...operations, newOp]);
    
    // Also add to approved rates
    if (approvedRates) {
      setApprovedRates({
        ...approvedRates,
        operations: [...approvedRates.operations, { category: 'Stitching', machineType: 'Not Defined', description: '', rate: 0 }],
      });
    }
  };

  const removeOperation = (opId: string) => {
    const idx = operations.findIndex(op => op.id === opId);
    setOperations(operations.filter(op => op.id !== opId));
    
    // Remove from approved rates
    if (approvedRates && idx >= 0) {
      const newOps = [...approvedRates.operations];
      newOps.splice(idx, 1);
      setApprovedRates({ ...approvedRates, operations: newOps });
    }
  };

  const updateOperation = (opId: string, field: keyof CMTOperation, value: string | number) => {
    const idx = operations.findIndex(op => op.id === opId);
    setOperations(operations.map(op => {
      if (op.id === opId) {
        const updated = { ...op, [field]: value };
        if (field === 'ratePerPiece') {
          updated.amount = updated.ratePerPiece;
        }
        return updated;
      }
      return op;
    }));

    // Update approved rates
    if (approvedRates && idx >= 0 && field === 'ratePerPiece') {
      const newOps = [...approvedRates.operations];
      newOps[idx] = { ...newOps[idx], rate: value as number };
      setApprovedRates({ ...approvedRates, operations: newOps });
    }
    if (approvedRates && idx >= 0 && (field === 'category' || field === 'machineType' || field === 'description')) {
      const newOps = [...approvedRates.operations];
      newOps[idx] = { ...newOps[idx], [field]: value as string };
      setApprovedRates({ ...approvedRates, operations: newOps });
    }
  };

  const saveOperations = async () => {
    if (!quotation) return;
    
    const updatedData = recordToQuotationData(quotation);
    updatedData.operations = operations;
    
    // Recalculate totals
    const totalOps = operations.reduce((sum, op) => sum + op.ratePerPiece, 0);
    updatedData.totalStitchingCost = totalOps;
    const baseCost = totalOps + updatedData.finishingPackingCost + updatedData.overheadsCost;
    const profit = baseCost * (updatedData.companyProfitPercent / 100);
    updatedData.finalCMTPerPiece = baseCost + profit;
    updatedData.totalOrderValue = updatedData.finalCMTPerPiece * updatedData.orderQuantity;

    saveQuotation.mutate(
      { id: quotation.id, data: updatedData },
      {
        onSuccess: () => {
          setIsEditingOperations(false);
          refetch();
        },
      }
    );
  };

  const getStatusBadge = (status: string) => {
    const statusOption = STATUS_OPTIONS.find((s) => s.value === status);
    if (!statusOption) return <Badge variant="outline">{status}</Badge>;
    return (
      <Badge className={`${statusOption.color} text-white`}>
        {statusOption.label}
      </Badge>
    );
  };

  const showApprovalForm = selectedStatus === 'approved' && isEditing;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/cmt-quotation')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{quotation.quotation_no}</h1>
              {getStatusBadge(quotation.status)}
            </div>
            <p className="text-muted-foreground mt-1">
              Created on {format(new Date(quotation.date), 'dd MMM yyyy')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleDownloadPdf}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          <Button onClick={() => navigate(`/admin/cmt-quotation?edit=${quotation.id}`)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Buyer & Style Details */}
          <Card>
            <CardHeader>
              <CardTitle>Quotation Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">Buyer Information</h4>
                  <p className="font-semibold">{data.buyerName}</p>
                  {data.contactPersonName && (
                    <p className="text-sm text-muted-foreground">
                      Contact: {data.contactPersonName} {data.contactPersonPhone && `| ${data.contactPersonPhone}`}
                    </p>
                  )}
                  {data.buyerAddress && (
                    <p className="text-sm text-muted-foreground mt-1">{data.buyerAddress}</p>
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">Style Information</h4>
                  <p className="font-semibold">{data.styleName}</p>
                  <div className="grid grid-cols-2 gap-2 mt-2 text-sm text-muted-foreground">
                    <p>Code: {data.styleCode || '-'}</p>
                    <p>Fabric: {data.fabricType || '-'}</p>
                    <p>GSM: {data.gsm || '-'}</p>
                    <p>Fit: {data.fitType || '-'}</p>
                    <p>Size Range: {data.sizeRange || '-'}</p>
                    <p>Quantity: {data.orderQuantity > 0 ? `${data.orderQuantity.toLocaleString()} pcs` : '-'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Operations */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Operations Breakdown</CardTitle>
              <div className="flex items-center gap-2">
                {isEditingOperations ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setOperations(quotation.operations || []);
                        setIsEditingOperations(false);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={saveOperations}
                      disabled={saveQuotation.isPending}
                    >
                      <Save className="h-4 w-4 mr-1" />
                      {saveQuotation.isPending ? 'Saving...' : 'Save'}
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditingOperations(true)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit Operations
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-3 font-medium">Category</th>
                      <th className="text-left p-3 font-medium">Machine</th>
                      <th className="text-left p-3 font-medium">Description</th>
                      <th className="text-right p-3 font-medium">SMV</th>
                      <th className="text-right p-3 font-medium">Rate/Pc (₹)</th>
                      {showApprovalForm && (
                        <th className="text-right p-3 font-medium text-primary">Approved Rate</th>
                      )}
                      {isEditingOperations && <th className="w-10"></th>}
                    </tr>
                  </thead>
                  <tbody>
                    {(isEditingOperations ? operations : data.operations).length === 0 ? (
                      <tr>
                        <td colSpan={isEditingOperations ? 7 : (showApprovalForm ? 6 : 5)} className="text-center py-4 text-muted-foreground">
                          No operations added
                        </td>
                      </tr>
                    ) : (
                      (isEditingOperations ? operations : data.operations).map((op, idx) => (
                        <tr key={op.id} className="border-t group">
                          {isEditingOperations ? (
                            <>
                              <td className="p-2">
                                <Select
                                  value={op.category}
                                  onValueChange={(v) => updateOperation(op.id, 'category', v)}
                                >
                                  <SelectTrigger className="h-8">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {operationCategories.map(cat => (
                                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </td>
                              <td className="p-2">
                                <Select
                                  value={op.machineType}
                                  onValueChange={(v) => updateOperation(op.id, 'machineType', v)}
                                >
                                  <SelectTrigger className="h-8">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {machineTypes.map(type => (
                                      <SelectItem key={type} value={type}>
                                        {type === 'Not Defined' ? '— Not Defined —' : type}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </td>
                              <td className="p-2">
                                <Input
                                  value={op.description}
                                  onChange={(e) => updateOperation(op.id, 'description', e.target.value)}
                                  placeholder="Description"
                                  className="h-8"
                                />
                              </td>
                              <td className="p-2">
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={op.smv || ''}
                                  onChange={(e) => updateOperation(op.id, 'smv', parseFloat(e.target.value) || 0)}
                                  className="h-8 w-20 text-right"
                                />
                              </td>
                              <td className="p-2">
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={op.ratePerPiece || ''}
                                  onChange={(e) => updateOperation(op.id, 'ratePerPiece', parseFloat(e.target.value) || 0)}
                                  className="h-8 w-24 text-right"
                                />
                              </td>
                              <td className="p-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                  onClick={() => removeOperation(op.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="p-3">{op.category}</td>
                              <td className="p-3 text-muted-foreground">{op.machineType}</td>
                              <td className="p-3 text-muted-foreground">{op.description || '-'}</td>
                              <td className="p-3 text-right">{op.smv.toFixed(2)}</td>
                              <td className="p-3 text-right font-medium">₹{op.ratePerPiece.toFixed(2)}</td>
                              {showApprovalForm && approvedRates && (
                                <td className="p-3 text-right">
                                  <Input
                                    type="number"
                                    step="0.01"
                                    value={approvedRates.operations[idx]?.rate || 0}
                                    onChange={(e) => updateApprovedOperationRate(idx, parseFloat(e.target.value) || 0)}
                                    className="w-24 ml-auto text-right border-primary/30 focus:ring-primary"
                                  />
                                </td>
                              )}
                            </>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                  {(isEditingOperations ? operations : data.operations).length > 0 && (
                    <tfoot>
                      <tr className="border-t bg-muted/30">
                        <td colSpan={3} className="p-3 text-right font-semibold">Total Operations</td>
                        <td className="p-3 text-right font-semibold">
                          {(isEditingOperations ? operations : data.operations).reduce((sum, op) => sum + op.smv, 0).toFixed(2)}
                        </td>
                        <td className="p-3 text-right font-bold">
                          ₹{(isEditingOperations ? operations : data.operations).reduce((sum, op) => sum + op.ratePerPiece, 0).toFixed(2)}
                        </td>
                        {showApprovalForm && approvedRates && (
                          <td className="p-3 text-right font-bold text-primary">
                            ₹{approvedRates.operations.reduce((sum, op) => sum + op.rate, 0).toFixed(2)}
                          </td>
                        )}
                        {isEditingOperations && <td></td>}
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
              
              {isEditingOperations && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={addOperation}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Operation
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Cost Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Cost Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                {/* Quoted Values */}
                <div className="space-y-4">
                  <h4 className="font-medium text-muted-foreground">Quoted Values</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Operations Cost</span>
                      <span className="font-medium">₹{totalStitchingCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Finishing & Packing</span>
                      <span className="font-medium">₹{data.finishingPackingCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Overheads</span>
                      <span className="font-medium">₹{data.overheadsCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Company Profit</span>
                      <span className="font-medium">₹{profitAmount.toFixed(2)} ({data.companyProfitPercent}%)</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Final CMT / Piece</span>
                      <span className="text-primary">₹{finalCMTPerPiece.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Approved Values */}
                {showApprovalForm && approvedRates && (
                  <div className="space-y-4 bg-accent/50 rounded-lg p-4 border border-border">
                    <h4 className="font-medium text-primary">Approved Values</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span>Operations Cost</span>
                        <span className="font-medium text-primary">
                          ₹{approvedRates.operations.reduce((sum, op) => sum + op.rate, 0).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <Label>Finishing & Packing</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={approvedRates.finishingPackingCost}
                          onChange={(e) => setApprovedRates({
                            ...approvedRates,
                            finishingPackingCost: parseFloat(e.target.value) || 0
                          })}
                          className="w-24 text-right"
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <Label>Overheads</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={approvedRates.overheadsCost}
                          onChange={(e) => setApprovedRates({
                            ...approvedRates,
                            overheadsCost: parseFloat(e.target.value) || 0
                          })}
                          className="w-24 text-right"
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <div>
                          <Label>Company Profit (₹)</Label>
                          <p className="text-xs text-muted-foreground">
                            = {approvedRates.companyProfitPercent.toFixed(2)}%
                          </p>
                        </div>
                        <Input
                          type="number"
                          step="0.01"
                          value={companyProfitRupees || ''}
                          onChange={(e) => handleProfitRupeesChange(parseFloat(e.target.value) || 0)}
                          className="w-24 text-right"
                          placeholder="0.00"
                        />
                      </div>
                      <Separator />
                      <div className="flex justify-between text-lg font-bold">
                        <span>Final Approved CMT</span>
                        <span className="text-primary">
                          ₹{(() => {
                            const opsTotal = approvedRates.operations.reduce((sum, op) => sum + op.rate, 0);
                            const base = opsTotal + approvedRates.finishingPackingCost + approvedRates.overheadsCost;
                            const profit = base * (approvedRates.companyProfitPercent / 100);
                            return (base + profit).toFixed(2);
                          })()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Display saved approved values */}
                {quotation.status === 'approved' && quotation.approved_rates && !isEditing && (
                  <div className="space-y-4 bg-accent/50 rounded-lg p-4 border border-border">
                    <h4 className="font-medium text-primary flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Approved Values
                    </h4>
                    <div className="space-y-3">
                      {(quotation.approved_rates as ApprovedRates).operations.map((op: any, idx: number) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <div>
                            <span className="font-medium">{op.category}</span>
                            {op.machineType && op.machineType !== 'Not Defined' && (
                              <span className="text-muted-foreground ml-1">({op.machineType})</span>
                            )}
                            {op.description && (
                              <p className="text-xs text-muted-foreground">{op.description}</p>
                            )}
                          </div>
                          <span className="font-medium whitespace-nowrap">₹{op.rate.toFixed(2)}</span>
                        </div>
                      ))}
                      <Separator />
                      <div className="flex justify-between">
                        <span>Finishing & Packing</span>
                        <span className="font-medium">₹{(quotation.approved_rates as ApprovedRates).finishingPackingCost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Overheads</span>
                        <span className="font-medium">₹{(quotation.approved_rates as ApprovedRates).overheadsCost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Profit %</span>
                        <span className="font-medium">
                          {(() => {
                            const ar = quotation.approved_rates as ApprovedRates;
                            const opsTotal = ar.operations.reduce((sum, op) => sum + op.rate, 0);
                            const base = opsTotal + ar.finishingPackingCost + ar.overheadsCost;
                            const profitAmt = base * (ar.companyProfitPercent / 100);
                            return `${ar.companyProfitPercent.toFixed(2)}% (₹${profitAmt.toFixed(2)})`;
                          })()}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-lg font-bold">
                        <span>Final Approved CMT</span>
                        <span className="text-primary">₹{(quotation.approved_rates as ApprovedRates).finalCMTPerPiece.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Trims */}
          {data.trims.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Trims & Accessories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-3 font-medium">Item</th>
                        <th className="text-left p-3 font-medium">Provided By</th>
                        <th className="text-left p-3 font-medium">Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.trims.map((trim, idx) => (
                        <tr key={trim.id} className="border-t">
                          <td className="p-3">{trim.trimName || '-'}</td>
                          <td className="p-3 text-muted-foreground">{trim.providedBy}</td>
                          <td className="p-3 text-muted-foreground">{trim.remarks || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Management */}
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="mb-2 block">Change Status</Label>
                <Select value={selectedStatus} onValueChange={handleStatusChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${status.color}`} />
                          {status.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {(selectedStatus !== quotation.status || isEditing) && (
                <Button 
                  className="w-full" 
                  onClick={handleSaveStatus}
                  disabled={updateStatus.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {updateStatus.isPending ? 'Saving...' : 'Save Status'}
                </Button>
              )}

              {quotation.status === 'approved' && !isEditing && (
                <Button 
                  variant="outline"
                  className="w-full" 
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Approved Rates
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Validity */}
          <Card>
            <CardHeader>
              <CardTitle>Validity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Date</span>
                <span className="text-sm font-medium">
                  {format(new Date(quotation.date), 'dd MMM yyyy')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Valid Until</span>
                <span className="text-sm font-medium">
                  {format(new Date(quotation.valid_until), 'dd MMM yyyy')}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Signatory */}
          <Card>
            <CardHeader>
              <CardTitle>Signatory</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{data.signatoryName}</p>
              <p className="text-sm text-muted-foreground">Feather Fashions</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CMTQuotationView;
