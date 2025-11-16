import { useState } from 'react';
import { Plus, Search, Package, Eye, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useJobBatches, useDeleteJobBatch } from '@/hooks/useJobBatches';
import { Dialog, DialogContent } from '@/components/ui/dialog';
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
} from '@/components/ui/alert-dialog';
import BatchForm from './BatchForm';
import BatchDetails from './BatchDetails';
import { format } from 'date-fns';

const BatchesManager = () => {
  const { data: batches, isLoading } = useJobBatches();
  const deleteBatchMutation = useDeleteJobBatch();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [deleteBatchId, setDeleteBatchId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const filteredBatches = batches?.filter((batch: any) => {
    const matchesSearch = 
      batch.batch_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      batch.job_styles?.style_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || batch.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    const colors: any = {
      'created': 'bg-blue-500',
      'cutting': 'bg-yellow-500',
      'stitching': 'bg-orange-500',
      'checking': 'bg-purple-500',
      'packing': 'bg-pink-500',
      'done': 'bg-green-500',
    };
    return colors[status] || 'bg-gray-500';
  };

  const handleViewDetails = (batch: any) => {
    setSelectedBatchId(batch.id);
    setIsDetailsOpen(true);
  };

  const handleDeleteClick = (batchId: string) => {
    setDeleteBatchId(batchId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (deleteBatchId) {
      await deleteBatchMutation.mutateAsync(deleteBatchId);
      setDeleteDialogOpen(false);
      setDeleteBatchId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-4 flex-1 w-full">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search batches..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="created">Created</SelectItem>
              <SelectItem value="cutting">Cutting</SelectItem>
              <SelectItem value="stitching">Stitching</SelectItem>
              <SelectItem value="checking">Checking</SelectItem>
              <SelectItem value="packing">Packing</SelectItem>
              <SelectItem value="done">Done</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button 
          onClick={() => setIsFormOpen(true)}
          className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create New Batch
        </Button>
      </div>

      {/* Batches Table */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-muted/50 animate-pulse rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Batch Number</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Style</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Quantity</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredBatches?.map((batch: any) => (
                  <tr key={batch.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-primary" />
                        <span className="font-mono font-semibold text-sm">{batch.batch_number}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium text-sm">{batch.job_styles?.style_name}</div>
                        <div className="text-xs text-muted-foreground">{batch.job_styles?.style_code}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {format(new Date(batch.date_created), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        <div className="font-semibold">{batch.final_quantity || batch.expected_pieces} pcs</div>
                        <div className="text-xs text-muted-foreground">Expected: {batch.expected_pieces}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={`${getStatusColor(batch.status)} text-white`}>
                        {batch.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleViewDetails(batch)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleDeleteClick(batch.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredBatches?.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No batches found</p>
        </div>
      )}

      {/* Batch Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <BatchForm onClose={() => setIsFormOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Batch Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          {selectedBatchId && <BatchDetails batchId={selectedBatchId} onClose={() => setIsDetailsOpen(false)} />}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Batch?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete batch <span className="font-semibold">{batches?.find(b => b.id === deleteBatchId)?.batch_number}</span> and all associated records including:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Production entries</li>
                <li>Batch expenses</li>
                <li>Weekly settlements</li>
                <li>Part payments</li>
              </ul>
              <p className="mt-2 font-semibold text-destructive">This action cannot be undone.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BatchesManager;
