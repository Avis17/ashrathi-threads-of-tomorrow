import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Plus, Search, Eye, Printer, Edit, Filter, Truck, Package, FileText, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
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
import { useDeliveryChallans } from '@/hooks/useDeliveryChallans';
import { DC_TYPE_LABELS, PURPOSE_LABELS, STATUS_LABELS, JOB_WORK_DIRECTION_LABELS } from '@/types/deliveryChallan';
import type { DeliveryChallan } from '@/types/deliveryChallan';

const statusColors: Record<DeliveryChallan['status'], string> = {
  created: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  dispatched: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  closed: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
};

const dcTypeColors: Record<DeliveryChallan['dc_type'], string> = {
  job_work: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  return: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20',
  rework: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
};

const directionColors: Record<'given' | 'taken', string> = {
  given: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
  taken: 'bg-teal-500/10 text-teal-600 border-teal-500/20',
};

export default function DeliveryChallanList() {
  const navigate = useNavigate();
  const { data: challans = [], isLoading } = useDeliveryChallans();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [directionFilter, setDirectionFilter] = useState<string>('all');

  const filteredChallans = challans.filter((dc) => {
    const matchesSearch =
      dc.dc_number.toLowerCase().includes(search.toLowerCase()) ||
      dc.job_worker_name.toLowerCase().includes(search.toLowerCase()) ||
      dc.vehicle_number.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || dc.status === statusFilter;
    const matchesType = typeFilter === 'all' || dc.dc_type === typeFilter;
    const matchesDirection = directionFilter === 'all' || (dc.job_work_direction || 'given') === directionFilter;
    
    return matchesSearch && matchesStatus && matchesType && matchesDirection;
  });

  const stats = {
    total: challans.length,
    given: challans.filter(d => (d.job_work_direction || 'given') === 'given').length,
    taken: challans.filter(d => d.job_work_direction === 'taken').length,
    created: challans.filter(d => d.status === 'created').length,
    dispatched: challans.filter(d => d.status === 'dispatched').length,
    closed: challans.filter(d => d.status === 'closed').length,
  };

  const getDisplayPurposes = (dc: DeliveryChallan) => {
    if (dc.purposes && dc.purposes.length > 0) {
      return dc.purposes.map(p => PURPOSE_LABELS[p as keyof typeof PURPOSE_LABELS] || p).join(', ');
    }
    return PURPOSE_LABELS[dc.purpose] || dc.purpose;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/95 to-primary/90 p-8 text-primary-foreground">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
              <Truck className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Delivery Challan</h1>
              <p className="text-primary-foreground/70 mt-1">Manage job work movements and dispatches</p>
            </div>
          </div>
          <Button
            onClick={() => navigate('/admin/delivery-challan/create')}
            size="lg"
            className="bg-white text-primary hover:bg-white/90 shadow-lg gap-2"
          >
            <Plus className="h-5 w-5" />
            Create New DC
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-slate-50 to-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Total DCs</p>
                <p className="text-3xl font-bold mt-1">{stats.total}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center">
                <FileText className="h-6 w-6 text-slate-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-indigo-50 to-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Given</p>
                <p className="text-3xl font-bold mt-1 text-indigo-600">{stats.given}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                <ArrowUpRight className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-teal-50 to-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Taken</p>
                <p className="text-3xl font-bold mt-1 text-teal-600">{stats.taken}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-teal-100 flex items-center justify-center">
                <ArrowDownLeft className="h-6 w-6 text-teal-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Created</p>
                <p className="text-3xl font-bold mt-1 text-amber-600">{stats.created}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center">
                <Package className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Dispatched</p>
                <p className="text-3xl font-bold mt-1 text-blue-600">{stats.dispatched}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Truck className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Closed</p>
                <p className="text-3xl font-bold mt-1 text-emerald-600">{stats.closed}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                <FileText className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by DC No, Job Worker, or Vehicle..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-11"
              />
            </div>
            <div className="flex gap-3 flex-wrap">
              <Select value={directionFilter} onValueChange={setDirectionFilter}>
                <SelectTrigger className="w-[160px] h-11">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Direction" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Direction</SelectItem>
                  <SelectItem value="given">Job Work Given</SelectItem>
                  <SelectItem value="taken">Job Work Taken</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[160px] h-11">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="DC Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="job_work">Job Work</SelectItem>
                  <SelectItem value="return">Return</SelectItem>
                  <SelectItem value="rework">Rework</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px] h-11">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="created">Created</SelectItem>
                  <SelectItem value="dispatched">Dispatched</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/30 border-b px-6 py-4">
          <CardTitle className="text-lg font-semibold">Delivery Challans</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredChallans.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">No Delivery Challans Found</h3>
              <p className="text-muted-foreground mt-1">
                {search || statusFilter !== 'all' || typeFilter !== 'all' || directionFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Create your first Delivery Challan to get started'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/20 hover:bg-muted/20">
                    <TableHead className="font-semibold">DC No</TableHead>
                    <TableHead className="font-semibold">Date</TableHead>
                    <TableHead className="font-semibold">Direction</TableHead>
                    <TableHead className="font-semibold">Job Worker / Company</TableHead>
                    <TableHead className="font-semibold">Type</TableHead>
                    <TableHead className="font-semibold">Purpose</TableHead>
                    <TableHead className="font-semibold">Vehicle No</TableHead>
                    <TableHead className="font-semibold text-right">Total Qty</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredChallans.map((dc) => {
                    const direction = dc.job_work_direction || 'given';
                    return (
                      <TableRow key={dc.id} className="group hover:bg-muted/50 transition-colors">
                        <TableCell className="font-mono font-semibold text-primary">
                          {dc.dc_number}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(new Date(dc.dc_date), 'dd MMM yyyy')}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={directionColors[direction]}>
                            {direction === 'given' ? (
                              <><ArrowUpRight className="h-3 w-3 mr-1" /> Given</>
                            ) : (
                              <><ArrowDownLeft className="h-3 w-3 mr-1" /> Taken</>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium max-w-[200px] truncate">
                          {dc.job_worker_name}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={dcTypeColors[dc.dc_type]}>
                            {DC_TYPE_LABELS[dc.dc_type].split(' ')[0]}
                          </Badge>
                        </TableCell>
                        <TableCell className="capitalize max-w-[150px] truncate" title={getDisplayPurposes(dc)}>
                          {getDisplayPurposes(dc)}
                        </TableCell>
                        <TableCell className="font-mono text-sm">{dc.vehicle_number}</TableCell>
                        <TableCell className="text-right font-semibold">{dc.total_quantity}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusColors[dc.status]}>
                            {STATUS_LABELS[dc.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/admin/delivery-challan/${dc.id}`)}
                              className="h-8 w-8"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/admin/delivery-challan/print/${dc.id}`)}
                              className="h-8 w-8"
                            >
                              <Printer className="h-4 w-4" />
                            </Button>
                            {dc.status === 'created' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigate(`/admin/delivery-challan/edit/${dc.id}`)}
                                className="h-8 w-8"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
