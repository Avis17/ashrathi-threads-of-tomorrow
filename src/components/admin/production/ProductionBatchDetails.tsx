import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";
import { useBatchDetails, useUpdateProductionBatch } from "@/hooks/useProductionBatches";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { BatchMaterialForm } from "./BatchMaterialForm";
import { BatchCostForm } from "./BatchCostForm";
import { BatchSaleForm } from "./BatchSaleForm";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProductionBatchDetailsProps {
  batchId: string;
  onClose: () => void;
}

export const ProductionBatchDetails = ({
  batchId,
  onClose,
}: ProductionBatchDetailsProps) => {
  const { data, isLoading } = useBatchDetails(batchId);
  const { mutate: updateBatch } = useUpdateProductionBatch();
  
  const [showMaterialForm, setShowMaterialForm] = useState(false);
  const [showCostForm, setShowCostForm] = useState(false);
  const [showSaleForm, setShowSaleForm] = useState(false);
  const [actualQty, setActualQty] = useState("");

  if (isLoading || !data) return <div>Loading...</div>;

  const { batch, materials, costs, sales } = data;

  const handleUpdateActualQty = () => {
    const qty = parseInt(actualQty);
    if (qty > 0) {
      updateBatch({
        id: batch.id,
        actual_quantity: qty,
        status: "completed",
      });
      setActualQty("");
    }
  };

  const profitMargin = batch.total_sales_amount > 0
    ? ((batch.total_sales_amount - batch.total_cost) / batch.total_sales_amount) * 100
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onClose}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold">{batch.batch_code}</h2>
          <p className="text-muted-foreground">{batch.product_name}</p>
        </div>
        <Badge>{batch.status.replace(/_/g, " ").toUpperCase()}</Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Target Quantity</div>
          <div className="text-2xl font-bold">{batch.target_quantity}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Actual Quantity</div>
          <div className="text-2xl font-bold">{batch.actual_quantity}</div>
          {batch.actual_quantity === 0 && (
            <div className="mt-2 flex gap-2">
              <Input
                type="number"
                placeholder="Enter qty"
                value={actualQty}
                onChange={(e) => setActualQty(e.target.value)}
              />
              <Button size="sm" onClick={handleUpdateActualQty}>
                Set
              </Button>
            </div>
          )}
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Total Cost</div>
          <div className="text-2xl font-bold">{formatCurrency(batch.total_cost)}</div>
          <div className="text-sm text-muted-foreground mt-1">
            {formatCurrency(batch.cost_per_piece)}/piece
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Sales</div>
          <div className="text-2xl font-bold">{batch.total_sold_quantity} sold</div>
          <div className="text-sm text-muted-foreground mt-1">
            {formatCurrency(batch.total_sales_amount)}
          </div>
        </Card>
      </div>

      {/* Cost Breakdown */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Cost Breakdown</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-muted-foreground">Material Cost</div>
            <div className="text-xl font-bold">{formatCurrency(batch.total_material_cost)}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Labor Cost</div>
            <div className="text-xl font-bold">{formatCurrency(batch.total_labor_cost)}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Overhead Cost</div>
            <div className="text-xl font-bold">{formatCurrency(batch.total_overhead_cost)}</div>
          </div>
        </div>
      </Card>

      {/* Profit Analysis */}
      {batch.total_sales_amount > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Profit Analysis</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Total Revenue</div>
              <div className="text-xl font-bold">{formatCurrency(batch.total_sales_amount)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Net Profit</div>
              <div className="text-xl font-bold">
                {formatCurrency(batch.total_sales_amount - batch.total_cost)}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Profit Margin</div>
              <div className="text-xl font-bold">{profitMargin.toFixed(2)}%</div>
            </div>
          </div>
        </Card>
      )}

      {/* Materials Used */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Materials Used</h3>
          <Button size="sm" onClick={() => setShowMaterialForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Material
          </Button>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">Material</th>
              <th className="text-right p-2">Quantity</th>
              <th className="text-right p-2">Cost/Unit</th>
              <th className="text-right p-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {materials.map((m) => (
              <tr key={m.id} className="border-b">
                <td className="p-2">{m.material_name}</td>
                <td className="p-2 text-right">{m.quantity_used}</td>
                <td className="p-2 text-right">{formatCurrency(m.cost_per_unit)}</td>
                <td className="p-2 text-right">{formatCurrency(m.total_cost)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Other Costs */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Other Costs</h3>
          <Button size="sm" onClick={() => setShowCostForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Cost
          </Button>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">Type</th>
              <th className="text-left p-2">Description</th>
              <th className="text-right p-2">Amount</th>
            </tr>
          </thead>
          <tbody>
            {costs.map((c) => (
              <tr key={c.id} className="border-b">
                <td className="p-2 capitalize">
                  {c.cost_type}
                  {c.subcategory && ` - ${c.subcategory}`}
                </td>
                <td className="p-2">{c.description}</td>
                <td className="p-2 text-right">{formatCurrency(c.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Sales Records */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Sales Records</h3>
          <Button size="sm" onClick={() => setShowSaleForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Record Sale
          </Button>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">Date</th>
              <th className="text-left p-2">Customer</th>
              <th className="text-right p-2">Quantity</th>
              <th className="text-right p-2">Price/Piece</th>
              <th className="text-right p-2">Total</th>
              <th className="text-left p-2">Invoice</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((s) => (
              <tr key={s.id} className="border-b">
                <td className="p-2">{new Date(s.sale_date).toLocaleDateString()}</td>
                <td className="p-2">{s.customer_name}</td>
                <td className="p-2 text-right">{s.quantity_sold}</td>
                <td className="p-2 text-right">{formatCurrency(s.price_per_piece)}</td>
                <td className="p-2 text-right">{formatCurrency(s.total_amount)}</td>
                <td className="p-2">{s.invoice_number || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <BatchMaterialForm
        batchId={batchId}
        open={showMaterialForm}
        onOpenChange={setShowMaterialForm}
      />
      <BatchCostForm
        batchId={batchId}
        open={showCostForm}
        onOpenChange={setShowCostForm}
      />
      <BatchSaleForm
        batchId={batchId}
        open={showSaleForm}
        onOpenChange={setShowSaleForm}
      />
    </div>
  );
};
