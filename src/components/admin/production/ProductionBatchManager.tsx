import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Eye } from "lucide-react";
import { useProductionBatches } from "@/hooks/useProductionBatches";
import { ProductionBatchForm } from "./ProductionBatchForm";
import { ProductionBatchDetails } from "./ProductionBatchDetails";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

export const ProductionBatchManager = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const { data: batches, isLoading } = useProductionBatches();

  if (isLoading) return <div>Loading...</div>;

  if (selectedBatchId) {
    return (
      <ProductionBatchDetails
        batchId={selectedBatchId}
        onClose={() => setSelectedBatchId(null)}
      />
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "planning":
        return "secondary";
      case "in_production":
        return "default";
      case "completed":
        return "outline";
      case "partially_sold":
        return "default";
      case "fully_sold":
        return "default";
      default:
        return "secondary";
    }
  };

  const getStatusLabel = (status: string) => {
    return status.replace(/_/g, " ").toUpperCase();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Production Batches</h2>
          <p className="text-muted-foreground">
            Track complete production workflow from materials to sales
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Batch
        </Button>
      </div>

      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Batch Code</th>
                <th className="text-left p-2">Date</th>
                <th className="text-left p-2">Product</th>
                <th className="text-right p-2">Target Qty</th>
                <th className="text-right p-2">Actual Qty</th>
                <th className="text-right p-2">Total Cost</th>
                <th className="text-right p-2">Cost/Piece</th>
                <th className="text-right p-2">Sold</th>
                <th className="text-right p-2">Sales Amount</th>
                <th className="text-center p-2">Status</th>
                <th className="text-center p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {batches?.map((batch) => (
                <tr key={batch.id} className="border-b hover:bg-muted/50">
                  <td className="p-2 font-mono text-sm">{batch.batch_code}</td>
                  <td className="p-2">{new Date(batch.batch_date).toLocaleDateString()}</td>
                  <td className="p-2">{batch.product_name}</td>
                  <td className="p-2 text-right">{batch.target_quantity}</td>
                  <td className="p-2 text-right">{batch.actual_quantity}</td>
                  <td className="p-2 text-right">{formatCurrency(batch.total_cost)}</td>
                  <td className="p-2 text-right">{formatCurrency(batch.cost_per_piece)}</td>
                  <td className="p-2 text-right">{batch.total_sold_quantity}</td>
                  <td className="p-2 text-right">{formatCurrency(batch.total_sales_amount)}</td>
                  <td className="p-2 text-center">
                    <Badge variant={getStatusColor(batch.status)}>
                      {getStatusLabel(batch.status)}
                    </Badge>
                  </td>
                  <td className="p-2 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedBatchId(batch.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <ProductionBatchForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
      />
    </div>
  );
};
