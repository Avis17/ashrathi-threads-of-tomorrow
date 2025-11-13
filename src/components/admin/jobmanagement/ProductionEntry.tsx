import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useJobProductionEntries } from '@/hooks/useJobProduction';
import { format } from 'date-fns';
import ProductionEntryForm from './ProductionEntryForm';

const ProductionEntry = () => {
  const { data: entries, isLoading } = useJobProductionEntries();
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Daily Production Entry</h2>
          <p className="text-muted-foreground mt-1">Record daily production activities</p>
        </div>
        <Button 
          onClick={() => setIsFormOpen(true)}
          className="bg-gradient-to-r from-primary to-secondary"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Entry
        </Button>
      </div>

      {/* Recent Entries */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">Recent Entries</h3>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-muted/50 animate-pulse rounded" />
              ))}
            </div>
          ) : entries && entries.length > 0 ? (
            <div className="space-y-3">
              {entries.slice(0, 10).map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="space-y-1">
                    <div className="font-medium">{entry.employee_name}</div>
                    <div className="text-sm text-muted-foreground">
                      {entry.section} • {format(new Date(entry.date), 'MMM dd, yyyy')}
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="font-semibold">{entry.quantity_completed} pcs</div>
                    <div className="text-sm text-muted-foreground">
                      ₹{entry.rate_per_piece} × {entry.quantity_completed} = ₹{entry.total_amount.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-12">No production entries yet</p>
          )}
        </CardContent>
      </Card>

      {/* Production Entry Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl">
          <ProductionEntryForm onClose={() => setIsFormOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductionEntry;
