import React, { useState } from 'react';
import { 
  RotateCcw, 
  AlertTriangle, 
  TrendingDown, 
  Clock, 
  CheckCircle2,
  Plus,
  Search,
  Eye,
  EyeOff,
  Pencil,
  Trash2,
  Package,
  BarChart3,
  PieChart,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  useReturnsRejections, 
  useReturnsStats, 
  useCreateReturnRejection, 
  useUpdateReturnRejection,
  useDeleteReturnRejection,
  ReturnRejection,
  ReturnType,
  ReasonCategory,
  ActionTaken,
  RecordStatus,
  CreateReturnRejectionData,
} from '@/hooks/useReturnsRejections';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, Legend } from 'recharts';

const REASON_COLORS: Record<string, string> = {
  stitch: '#ef4444',
  fabric: '#f97316',
  size: '#eab308',
  shade: '#8b5cf6',
  damage: '#ec4899',
  wrong_item: '#06b6d4',
  quality: '#3b82f6',
  other: '#6b7280',
};

const REASON_LABELS: Record<string, string> = {
  stitch: 'Stitch Issue',
  fabric: 'Fabric Defect',
  size: 'Size Problem',
  shade: 'Shade Variation',
  damage: 'Damage',
  wrong_item: 'Wrong Item',
  quality: 'Quality Issue',
  other: 'Other',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-500',
  in_progress: 'bg-blue-500',
  resolved: 'bg-green-500',
  closed: 'bg-gray-500',
};

interface FormData {
  return_type: ReturnType;
  product_name: string;
  quantity: number;
  reason_category: ReasonCategory;
  reason_details: string;
  cost_per_unit: number;
  action_taken: ActionTaken;
  customer_name: string;
  reported_by: string;
  reported_date: string;
  status: RecordStatus;
  notes: string;
  reference_id: string;
  reference_type: string;
}

const ReturnsRejections = () => {
  const [showAmounts, setShowAmounts] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [reasonFilter, setReasonFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ReturnRejection | null>(null);
  
  const { data: records = [], isLoading } = useReturnsRejections({
    type: typeFilter,
    status: statusFilter,
    reason: reasonFilter,
  });
  
  const { data: stats } = useReturnsStats();
  const createMutation = useCreateReturnRejection();
  const updateMutation = useUpdateReturnRejection();
  const deleteMutation = useDeleteReturnRejection();

  const initialFormData: FormData = {
    return_type: 'customer_return',
    product_name: '',
    quantity: 1,
    reason_category: 'quality',
    reason_details: '',
    cost_per_unit: 0,
    action_taken: 'pending',
    customer_name: '',
    reported_by: '',
    reported_date: format(new Date(), 'yyyy-MM-dd'),
    status: 'pending',
    notes: '',
    reference_id: '',
    reference_type: '',
  };

  const [formData, setFormData] = useState<FormData>(initialFormData);

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingRecord(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData: CreateReturnRejectionData = {
      return_type: formData.return_type,
      product_name: formData.product_name,
      quantity: formData.quantity,
      reason_category: formData.reason_category,
      reason_details: formData.reason_details || undefined,
      cost_per_unit: formData.cost_per_unit,
      action_taken: formData.action_taken,
      customer_name: formData.customer_name || undefined,
      reported_by: formData.reported_by || undefined,
      reported_date: formData.reported_date,
      status: formData.status,
      notes: formData.notes || undefined,
      reference_id: formData.reference_id || undefined,
      reference_type: formData.reference_type || undefined,
    };

    if (editingRecord) {
      await updateMutation.mutateAsync({ id: editingRecord.id, data: submitData });
    } else {
      await createMutation.mutateAsync(submitData);
    }
    
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleEdit = (record: ReturnRejection) => {
    setEditingRecord(record);
    setFormData({
      return_type: record.return_type,
      product_name: record.product_name,
      quantity: record.quantity,
      reason_category: record.reason_category,
      reason_details: record.reason_details || '',
      cost_per_unit: record.cost_per_unit,
      action_taken: (record.action_taken || 'pending') as ActionTaken,
      customer_name: record.customer_name || '',
      reported_by: record.reported_by || '',
      reported_date: record.reported_date,
      status: record.status,
      notes: record.notes || '',
      reference_id: record.reference_id || '',
      reference_type: record.reference_type || '',
    });
    setIsAddDialogOpen(true);
  };

  const filteredRecords = records.filter(record => 
    record.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.reference_id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Chart data
  const reasonChartData = stats?.reasonBreakdown 
    ? Object.entries(stats.reasonBreakdown).map(([key, value]) => ({
        name: REASON_LABELS[key] || key,
        value,
        color: REASON_COLORS[key] || '#6b7280',
      }))
    : [];

  const monthlyChartData = stats?.monthlyData
    ? Object.entries(stats.monthlyData)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-6)
        .map(([month, data]) => ({
          month: format(new Date(month + '-01'), 'MMM yy'),
          returns: data.returns,
          rejections: data.rejections,
          cost: data.cost,
        }))
    : [];

  const formatAmount = (amount: number) => {
    if (!showAmounts) return '****';
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <RotateCcw className="h-7 w-7 text-red-500" />
            Returns & Quality Issues
          </h1>
          <p className="text-gray-500 mt-1">Track returns, rejections, and improve production quality</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAmounts(!showAmounts)}
          >
            {showAmounts ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {showAmounts ? 'Hide' : 'Show'} Amounts
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={(open) => { setIsAddDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="bg-red-600 hover:bg-red-700">
                <Plus className="h-4 w-4 mr-2" />
                Record Issue
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingRecord ? 'Edit Record' : 'Record New Return/Rejection'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Type *</Label>
                    <Select 
                      value={formData.return_type} 
                      onValueChange={(v: ReturnType) => setFormData({...formData, return_type: v})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="customer_return">Customer Return</SelectItem>
                        <SelectItem value="job_rejection">Job Work Rejection</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Status *</Label>
                    <Select 
                      value={formData.status} 
                      onValueChange={(v: RecordStatus) => setFormData({...formData, status: v})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Product Name *</Label>
                    <Input 
                      value={formData.product_name}
                      onChange={(e) => setFormData({...formData, product_name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Quantity *</Label>
                    <Input 
                      type="number"
                      min="1"
                      value={formData.quantity}
                      onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 1})}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Reason Category *</Label>
                    <Select 
                      value={formData.reason_category} 
                      onValueChange={(v: ReasonCategory) => setFormData({...formData, reason_category: v})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="stitch">Stitch Issue</SelectItem>
                        <SelectItem value="fabric">Fabric Defect</SelectItem>
                        <SelectItem value="size">Size Problem</SelectItem>
                        <SelectItem value="shade">Shade Variation</SelectItem>
                        <SelectItem value="damage">Damage</SelectItem>
                        <SelectItem value="wrong_item">Wrong Item</SelectItem>
                        <SelectItem value="quality">Quality Issue</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Action Taken</Label>
                    <Select 
                      value={formData.action_taken} 
                      onValueChange={(v: ActionTaken) => setFormData({...formData, action_taken: v})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="refund">Refund</SelectItem>
                        <SelectItem value="replacement">Replacement</SelectItem>
                        <SelectItem value="repair">Repair</SelectItem>
                        <SelectItem value="rejected">Rejected Claim</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Reason Details</Label>
                  <Textarea 
                    value={formData.reason_details}
                    onChange={(e) => setFormData({...formData, reason_details: e.target.value})}
                    placeholder="Describe the issue in detail..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Cost Per Unit (₹)</Label>
                    <Input 
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.cost_per_unit}
                      onChange={(e) => setFormData({...formData, cost_per_unit: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Total Cost Impact</Label>
                    <Input 
                      value={`₹${(formData.cost_per_unit * formData.quantity).toLocaleString('en-IN')}`}
                      disabled
                      className="bg-gray-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Customer/Company Name</Label>
                    <Input 
                      value={formData.customer_name}
                      onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Reported By</Label>
                    <Input 
                      value={formData.reported_by}
                      onChange={(e) => setFormData({...formData, reported_by: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Reference ID (Invoice/Job No.)</Label>
                    <Input 
                      value={formData.reference_id}
                      onChange={(e) => setFormData({...formData, reference_id: e.target.value})}
                      placeholder="e.g., INV-001 or JOB-123"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Reported Date *</Label>
                    <Input 
                      type="date"
                      value={formData.reported_date}
                      onChange={(e) => setFormData({...formData, reported_date: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea 
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    placeholder="Additional notes..."
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => { setIsAddDialogOpen(false); resetForm(); }}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-red-600 hover:bg-red-700">
                    {editingRecord ? 'Update' : 'Save'} Record
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Customer Returns</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalReturns || 0}</p>
              </div>
              <RotateCcw className="h-8 w-8 text-orange-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Job Rejections</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalRejections || 0}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.pendingCount || 0}</p>
              </div>
              <Clock className="h-8 w-8 text-amber-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Resolved</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.resolvedCount || 0}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Cost Impact</p>
                <p className="text-2xl font-bold text-gray-900">{formatAmount(stats?.totalCostImpact || 0)}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-purple-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <PieChart className="h-5 w-5 text-red-500" />
              Issues by Reason
            </CardTitle>
          </CardHeader>
          <CardContent>
            {reasonChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <RechartsPieChart>
                  <Pie
                    data={reasonChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine={false}
                  >
                    {reasonChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-gray-400">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              Monthly Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={monthlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="returns" name="Returns" fill="#f97316" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="rejections" name="Rejections" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-gray-400">
                No data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Records Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              All Records
            </CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Search..."
                  className="pl-9 w-48"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="customer_return">Returns</SelectItem>
                  <SelectItem value="job_rejection">Rejections</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={reasonFilter} onValueChange={setReasonFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Reasons</SelectItem>
                  <SelectItem value="stitch">Stitch Issue</SelectItem>
                  <SelectItem value="fabric">Fabric Defect</SelectItem>
                  <SelectItem value="size">Size Problem</SelectItem>
                  <SelectItem value="shade">Shade Variation</SelectItem>
                  <SelectItem value="damage">Damage</SelectItem>
                  <SelectItem value="wrong_item">Wrong Item</SelectItem>
                  <SelectItem value="quality">Quality Issue</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <RotateCcw className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>No records found</p>
              <p className="text-sm">Start by recording a return or rejection</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Cost Impact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="whitespace-nowrap">
                        {format(new Date(record.reported_date), 'dd MMM yyyy')}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={record.return_type === 'customer_return' ? 'border-orange-500 text-orange-600' : 'border-red-500 text-red-600'}>
                          {record.return_type === 'customer_return' ? 'Return' : 'Rejection'}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium max-w-[150px] truncate">
                        {record.product_name}
                      </TableCell>
                      <TableCell>{record.quantity}</TableCell>
                      <TableCell>
                        <Badge 
                          style={{ backgroundColor: REASON_COLORS[record.reason_category] + '20', color: REASON_COLORS[record.reason_category], borderColor: REASON_COLORS[record.reason_category] }}
                          className="border"
                        >
                          {REASON_LABELS[record.reason_category]}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[120px] truncate">
                        {record.customer_name || '-'}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatAmount(record.total_cost_impact)}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${STATUS_COLORS[record.status]} text-white`}>
                          {record.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {record.action_taken?.replace('_', ' ') || 'Pending'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEdit(record)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:text-red-700"
                            onClick={() => {
                              if (confirm('Delete this record?')) {
                                deleteMutation.mutate(record.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReturnsRejections;
