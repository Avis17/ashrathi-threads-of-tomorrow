import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowLeft, Printer, Edit, Truck, User, Package, Calendar, FileText, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDeliveryChallan, useDeliveryChallanItems, useUpdateDeliveryChallanStatus } from '@/hooks/useDeliveryChallans';
import { DC_TYPE_LABELS, PURPOSE_LABELS, STATUS_LABELS } from '@/types/deliveryChallan';
import type { DeliveryChallan } from '@/types/deliveryChallan';

const statusColors: Record<DeliveryChallan['status'], string> = {
  created: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
  dispatched: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
  closed: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
};

const statusIcons: Record<DeliveryChallan['status'], React.ReactNode> = {
  created: <Clock className="h-4 w-4" />,
  dispatched: <Truck className="h-4 w-4" />,
  closed: <CheckCircle className="h-4 w-4" />,
};

export default function DeliveryChallanView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: dc, isLoading: dcLoading } = useDeliveryChallan(id || '');
  const { data: items = [], isLoading: itemsLoading } = useDeliveryChallanItems(id || '');
  const updateStatus = useUpdateDeliveryChallanStatus();

  if (dcLoading || itemsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!dc) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <FileText className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold">Delivery Challan Not Found</h2>
        <Button variant="outline" onClick={() => navigate('/admin/delivery-challan')} className="mt-4">
          Back to List
        </Button>
      </div>
    );
  }

  const handleStatusChange = async (newStatus: DeliveryChallan['status']) => {
    await updateStatus.mutateAsync({ id: dc.id, status: newStatus });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/delivery-challan')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{dc.dc_number}</h1>
              <Badge variant="outline" className={statusColors[dc.status] + ' gap-1'}>
                {statusIcons[dc.status]}
                {STATUS_LABELS[dc.status]}
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm mt-1">
              Created on {format(new Date(dc.created_at), 'dd MMM yyyy, hh:mm a')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Select value={dc.status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Update Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created">Created</SelectItem>
              <SelectItem value="dispatched">Dispatched</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => navigate(`/admin/delivery-challan/edit/${dc.id}`)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button onClick={() => navigate(`/admin/delivery-challan/print/${dc.id}`)}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>
      </div>

      {/* DC Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Basic Info */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileText className="h-4 w-4" />
              DC Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">DC Date</span>
              <span className="font-medium">{format(new Date(dc.dc_date), 'dd MMM yyyy')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Type</span>
              <Badge variant="secondary">{DC_TYPE_LABELS[dc.dc_type]}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Purpose</span>
              <span className="font-medium capitalize">{dc.purpose}</span>
            </div>
            {dc.expected_return_date && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Expected Return</span>
                <span className="font-medium">{format(new Date(dc.expected_return_date), 'dd MMM yyyy')}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Job Worker Info */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <User className="h-4 w-4" />
              Job Worker
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="font-semibold text-lg">{dc.job_worker_name}</span>
            </div>
            {dc.job_worker_address && (
              <p className="text-sm text-muted-foreground">{dc.job_worker_address}</p>
            )}
            {dc.job_worker_gstin && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">GSTIN</span>
                <span className="font-mono">{dc.job_worker_gstin}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Transport Info */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Transport Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Vehicle No</span>
              <span className="font-mono font-semibold">{dc.vehicle_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Driver</span>
              <span className="font-medium">{dc.driver_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Mobile</span>
              <span className="font-mono">{dc.driver_mobile}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Items Table */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/30 border-b">
          <CardTitle className="text-lg flex items-center gap-2">
            <Package className="h-5 w-5" />
            Material / Product Details
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/20">
                <TableHead className="w-[50px]">#</TableHead>
                <TableHead>Product / Fabric Name</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Color</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead>UOM</TableHead>
                <TableHead>Remarks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                  <TableCell className="font-medium">{item.product_name}</TableCell>
                  <TableCell className="font-mono text-sm">{item.sku || '-'}</TableCell>
                  <TableCell>{item.size || '-'}</TableCell>
                  <TableCell>{item.color || '-'}</TableCell>
                  <TableCell className="text-right font-semibold">{item.quantity}</TableCell>
                  <TableCell className="uppercase text-sm">{item.uom}</TableCell>
                  <TableCell className="text-muted-foreground">{item.remarks || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow className="bg-primary/5">
                <TableCell colSpan={5} className="text-right font-semibold">
                  Total Quantity:
                </TableCell>
                <TableCell className="text-right font-bold text-lg text-primary">
                  {dc.total_quantity}
                </TableCell>
                <TableCell colSpan={2}></TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </Card>

      {/* Notes */}
      {dc.notes && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{dc.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Declaration */}
      <Card className="border-0 shadow-sm bg-amber-50/50 dark:bg-amber-900/10">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground italic">
            <strong>Declaration:</strong> Goods sent for job work only. Not for sale. 
            Ownership remains with M/s Feather Fashions.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
