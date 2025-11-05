import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { JobOrderCostSummary, useUpdateCostSummary } from "@/hooks/useJobOrders";
import { formatCurrency } from "@/lib/utils";
import { Pencil } from "lucide-react";

interface CostSummaryProps {
  jobOrderId: string;
  costs: JobOrderCostSummary | null;
}

export const CostSummary = ({ jobOrderId, costs }: CostSummaryProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [materialCost, setMaterialCost] = useState(costs?.material_cost || 0);
  const [transportCost, setTransportCost] = useState(costs?.transport_cost || 0);
  const [miscCost, setMiscCost] = useState(costs?.misc_cost || 0);
  const updateCostSummary = useUpdateCostSummary();

  const handleSave = () => {
    updateCostSummary.mutate(
      {
        job_order_id: jobOrderId,
        material_cost: materialCost,
        transport_cost: transportCost,
        misc_cost: miscCost,
      },
      {
        onSuccess: () => setIsEditing(false),
      }
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Cost Summary</CardTitle>
          {!isEditing && (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit Costs
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="space-y-2">
            <Label className="text-muted-foreground">Material Cost</Label>
            {isEditing ? (
              <Input
                type="number"
                step="0.01"
                value={materialCost}
                onChange={(e) => setMaterialCost(Number(e.target.value))}
              />
            ) : (
              <div className="text-2xl font-bold">{formatCurrency(costs?.material_cost || 0)}</div>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground">Labour Cost</Label>
            <div className="text-2xl font-bold">{formatCurrency(costs?.labour_cost || 0)}</div>
            <div className="text-xs text-muted-foreground">Auto-calculated</div>
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground">Transport Cost</Label>
            {isEditing ? (
              <Input
                type="number"
                step="0.01"
                value={transportCost}
                onChange={(e) => setTransportCost(Number(e.target.value))}
              />
            ) : (
              <div className="text-2xl font-bold">{formatCurrency(costs?.transport_cost || 0)}</div>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground">Misc. Cost</Label>
            {isEditing ? (
              <Input
                type="number"
                step="0.01"
                value={miscCost}
                onChange={(e) => setMiscCost(Number(e.target.value))}
              />
            ) : (
              <div className="text-2xl font-bold">{formatCurrency(costs?.misc_cost || 0)}</div>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground">Total Cost</Label>
            <div className="text-2xl font-bold text-primary">{formatCurrency(costs?.total_cost || 0)}</div>
          </div>
        </div>

        {isEditing && (
          <div className="flex gap-2 mt-4">
            <Button onClick={handleSave}>Save Changes</Button>
            <Button variant="outline" onClick={() => {
              setIsEditing(false);
              setMaterialCost(costs?.material_cost || 0);
              setTransportCost(costs?.transport_cost || 0);
              setMiscCost(costs?.misc_cost || 0);
            }}>
              Cancel
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
