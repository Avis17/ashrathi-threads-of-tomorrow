import { Scissors, Zap, Flame, CheckCircle, Package, DollarSign, Users } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useJobProductionEntries } from '@/hooks/useJobProduction';
import { useJobBatchExpenses } from '@/hooks/useJobExpenses';
import { format } from 'date-fns';

interface BatchDetailsProps {
  batch: any;
  onClose: () => void;
}

const BatchDetails = ({ batch }: BatchDetailsProps) => {
  const { data: productionEntries } = useJobProductionEntries(batch.id);
  const { data: expenses } = useJobBatchExpenses(batch.id);

  const sections = [
    { name: 'Cutting', qty: batch.cut_quantity, icon: Scissors, color: 'text-blue-500' },
    { name: 'Stitching', qty: batch.stitched_quantity, icon: Zap, color: 'text-purple-500' },
    { name: 'Ironing', qty: batch.checked_quantity, icon: Flame, color: 'text-orange-500' },
    { name: 'Checking', qty: batch.checked_quantity, icon: CheckCircle, color: 'text-green-500' },
    { name: 'Packing', qty: batch.packed_quantity, icon: Package, color: 'text-pink-500' },
  ];

  const calculateProgress = (qty: number) => {
    return batch.expected_pieces > 0 ? (qty / batch.expected_pieces) * 100 : 0;
  };

  const totalLabourCost = productionEntries?.reduce((sum, entry) => sum + entry.total_amount, 0) || 0;
  const totalExpenses = expenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0;
  const totalCost = totalLabourCost + totalExpenses;
  const costPerPiece = batch.final_quantity > 0 ? totalCost / batch.final_quantity : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Package className="h-6 w-6 text-primary" />
          {batch.batch_number}
        </h2>
        <div className="mt-2 flex flex-wrap gap-2 text-sm text-muted-foreground">
          <span><strong>Style:</strong> {batch.job_styles?.style_name}</span>
          <span>•</span>
          <span><strong>Date:</strong> {format(new Date(batch.date_created), 'MMM dd, yyyy')}</span>
          <span>•</span>
          <span><strong>Fabric:</strong> {batch.fabric_type} {batch.gsm} GSM</span>
          <span>•</span>
          <span><strong>Color:</strong> {batch.color}</span>
        </div>
      </div>

      {/* Production Progress */}
      <Card className="border-l-4 border-l-primary">
        <CardContent className="p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Production Progress
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Expected Pieces:</span>
              <span className="font-bold text-lg">{batch.expected_pieces}</span>
            </div>
            {sections.map((section) => {
              const Icon = section.icon;
              const progress = calculateProgress(section.qty);
              return (
                <div key={section.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${section.color}`} />
                      <span className="font-medium">{section.name}</span>
                    </div>
                    <span className="font-semibold">
                      {section.qty}/{batch.expected_pieces} ({progress.toFixed(0)}%)
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              );
            })}
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Final Quantity:</span>
                <Badge className="text-lg px-4 py-1 bg-gradient-to-r from-primary to-secondary">
                  {batch.final_quantity} pieces
                </Badge>
              </div>
              {batch.wastage_percent > 0 && (
                <div className="text-sm text-muted-foreground mt-2">
                  Wastage: {batch.expected_pieces - batch.final_quantity} pieces ({batch.wastage_percent}%)
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cost Summary */}
      <Card className="border-l-4 border-l-green-500">
        <CardContent className="p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-500" />
            Cost Summary
          </h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between py-2">
              <span className="text-muted-foreground">Labour Cost</span>
              <span className="font-semibold text-lg">₹{totalLabourCost.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-muted-foreground">Expenses</span>
              <span className="font-semibold text-lg">₹{totalExpenses.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-t-2 border-primary/20">
              <span className="font-bold text-lg">TOTAL COST</span>
              <span className="font-bold text-2xl text-primary">₹{totalCost.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between py-2 bg-muted/50 rounded px-3">
              <span className="font-semibold">Cost Per Piece</span>
              <span className="font-bold text-xl text-secondary">₹{costPerPiece.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Details Tabs */}
      <Tabs defaultValue="production" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="production">
            <Users className="h-4 w-4 mr-2" />
            Production
          </TabsTrigger>
          <TabsTrigger value="expenses">
            <DollarSign className="h-4 w-4 mr-2" />
            Expenses
          </TabsTrigger>
          <TabsTrigger value="info">
            <Package className="h-4 w-4 mr-2" />
            Info
          </TabsTrigger>
        </TabsList>

        <TabsContent value="production" className="mt-4">
          <Card>
            <CardContent className="p-6">
              {productionEntries && productionEntries.length > 0 ? (
                <div className="space-y-4">
                  {productionEntries.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between p-3 bg-muted/30 rounded">
                      <div>
                        <div className="font-medium">{entry.employee_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {entry.section} • {format(new Date(entry.date), 'MMM dd, yyyy')}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{entry.quantity_completed} pcs</div>
                        <div className="text-sm text-muted-foreground">₹{entry.total_amount.toFixed(2)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No production entries yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses" className="mt-4">
          <Card>
            <CardContent className="p-6">
              {expenses && expenses.length > 0 ? (
                <div className="space-y-4">
                  {expenses.map((expense) => (
                    <div key={expense.id} className="flex items-center justify-between p-3 bg-muted/30 rounded">
                      <div>
                        <div className="font-medium">{expense.item_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {expense.expense_type} • {format(new Date(expense.date), 'MMM dd, yyyy')}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-lg">₹{expense.amount.toFixed(2)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No expenses recorded</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="info" className="mt-4">
          <Card>
            <CardContent className="p-6 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Supplier:</span>
                <span className="font-medium">{batch.supplier_name || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Lot Number:</span>
                <span className="font-medium">{batch.lot_number || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fabric Width:</span>
                <span className="font-medium">{batch.fabric_width || 'N/A'}</span>
              </div>
              {batch.remarks && (
                <div className="pt-3 border-t">
                  <div className="text-muted-foreground mb-1">Remarks:</div>
                  <div className="text-foreground">{batch.remarks}</div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BatchDetails;
