import { useState } from 'react';
import { Plus, Search, Package, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useJobBatches } from '@/hooks/useJobBatches';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import BatchForm from './BatchForm';
import BatchDetails from './BatchDetails';
import { format } from 'date-fns';

const BatchesManager = () => {
  const { data: batches, isLoading } = useJobBatches();
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const filteredBatches = batches?.filter((batch: any) => 
    batch.batch_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    batch.job_styles?.style_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    setSelectedBatch(batch);
    setIsDetailsOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search batches..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
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
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleViewDetails(batch)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
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
          {selectedBatch && <BatchDetails batch={selectedBatch} onClose={() => setIsDetailsOpen(false)} />}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BatchesManager;
