import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Scissors, FileText, DollarSign, Users, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useJobBatch } from '@/hooks/useJobBatches';
import { useJobProductionEntries } from '@/hooks/useJobProduction';
import { useJobBatchExpenses } from '@/hooks/useJobExpenses';
import { useBatchCuttingLogs } from '@/hooks/useBatchCuttingLogs';
import { format } from 'date-fns';
import { BatchCuttingSection } from '@/components/admin/jobmanagement/batch-details/BatchCuttingSection';
import { BatchOverviewSection } from '@/components/admin/jobmanagement/batch-details/BatchOverviewSection';
import { BatchTypesTable } from '@/components/admin/jobmanagement/batch-details/BatchTypesTable';
import { BatchProductionSection } from '@/components/admin/jobmanagement/batch-details/BatchProductionSection';
import { BatchExpensesSection } from '@/components/admin/jobmanagement/batch-details/BatchExpensesSection';

const BatchDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: batch, isLoading } = useJobBatch(id || '');
  const { data: productionEntries } = useJobProductionEntries(id || '');
  const { data: expenses } = useJobBatchExpenses(id || '');
  const { data: cuttingLogs } = useBatchCuttingLogs(id || '');

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
  const totalLabourCost = productionEntries?.reduce((sum, entry) => sum + entry.total_amount, 0) || 0;
  const totalExpenses = expenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0;
  const totalCost = totalLabourCost + totalExpenses;

  // Calculate cutting summary per type
  const cuttingSummary: Record<number, number> = {};
  cuttingLogs?.forEach(log => {
    cuttingSummary[log.type_index] = (cuttingSummary[log.type_index] || 0) + log.pieces_cut;
  });
  const totalCutPieces = Object.values(cuttingSummary).reduce((sum, val) => sum + val, 0);

  // Calculate production progress
  const totalProductionPieces = productionEntries?.reduce((sum, e) => sum + e.quantity_completed, 0) || 0;

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'created': 'bg-blue-500',
      'cutting': 'bg-yellow-500',
      'stitching': 'bg-orange-500',
      'checking': 'bg-purple-500',
      'packing': 'bg-pink-500',
      'done': 'bg-green-500',
    };
    return colors[status] || 'bg-gray-500';
  };

  // Calculate overall progress based on cutting and production
  const calculateProgress = () => {
    if (totalCutPieces === 0) return 0;
    // Progress is the ratio of production pieces to cut pieces (capped at 100%)
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
          <Badge className={`${getStatusColor(batch.status)} text-white px-3 py-1 text-sm`}>
            {batch.status.toUpperCase()}
          </Badge>
          <Badge variant="outline" className="px-3 py-1">
            Cut: {totalCutPieces} | Prod: {totalProductionPieces} | {currentProgress}%
          </Badge>
        </div>
      </div>

      {/* Overview Cards */}
      <BatchOverviewSection 
        batch={batch} 
        rollsData={rollsData}
        totalCutPieces={totalCutPieces}
        totalCost={totalCost}
        totalProductionPieces={totalProductionPieces}
      />

      {/* Main Tabs */}
      <Tabs defaultValue="cutting" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
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
          <TabsTrigger value="expenses" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Expenses
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
          />
        </TabsContent>

        <TabsContent value="production" className="mt-6">
          <BatchProductionSection batchId={id || ''} />
        </TabsContent>

        <TabsContent value="expenses" className="mt-6">
          <BatchExpensesSection batchId={id || ''} />
        </TabsContent>

        <TabsContent value="info" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Batch Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between p-3 bg-muted/30 rounded">
                  <span className="text-muted-foreground">Supplier</span>
                  <span className="font-medium">{batch.supplier_name || 'N/A'}</span>
                </div>
                <div className="flex justify-between p-3 bg-muted/30 rounded">
                  <span className="text-muted-foreground">Total Fabric</span>
                  <span className="font-medium">{batch.total_fabric_received_kg?.toFixed(2) || 0} kg</span>
                </div>
                <div className="flex justify-between p-3 bg-muted/30 rounded">
                  <span className="text-muted-foreground">Number of Rolls</span>
                  <span className="font-medium">{batch.number_of_rolls}</span>
                </div>
                <div className="flex justify-between p-3 bg-muted/30 rounded">
                  <span className="text-muted-foreground">Lot Number</span>
                  <span className="font-medium">{batch.lot_number || 'N/A'}</span>
                </div>
              </div>
              {batch.remarks && (
                <div className="p-4 bg-muted/30 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Remarks</div>
                  <div className="whitespace-pre-wrap">{batch.remarks}</div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BatchDetailsPage;
