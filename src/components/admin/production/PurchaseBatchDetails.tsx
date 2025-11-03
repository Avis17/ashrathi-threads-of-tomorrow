import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { usePurchaseBatchDetails } from "@/hooks/usePurchaseBatches";
import { format } from "date-fns";

export const PurchaseBatchDetails = ({ batchId, onClose }: { batchId: string; onClose: () => void }) => {
  const { data, isLoading } = usePurchaseBatchDetails(batchId);

  if (isLoading || !data) {
    return <div>Loading...</div>;
  }

  const { batch, items } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold">{batch.batch_code}</h2>
          <p className="text-muted-foreground">
            Purchase Date: {format(new Date(batch.purchase_date), "dd MMM yyyy")}
          </p>
        </div>
        <div className="ml-auto">
          <Badge variant={batch.payment_status === "paid" ? "default" : "secondary"}>
            {batch.payment_status}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Supplier Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="font-semibold">Name:</span> {batch.supplier_name}
            </div>
            {batch.supplier_contact && (
              <div>
                <span className="font-semibold">Contact:</span> {batch.supplier_contact}
              </div>
            )}
            {batch.supplier_address && (
              <div>
                <span className="font-semibold">Address:</span> {batch.supplier_address}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cost Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>Materials Subtotal:</span>
              <span>₹{batch.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Transport Cost:</span>
              <span>₹{batch.transport_cost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Loading/Unloading:</span>
              <span>₹{batch.loading_cost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Other Costs:</span>
              <span>₹{batch.other_costs.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold pt-2 border-t">
              <span>Total Cost:</span>
              <span className="text-primary">₹{batch.total_cost.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Material Items ({items.length} items)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Material</TableHead>
                <TableHead>Color</TableHead>
                <TableHead>Quantity (kg)</TableHead>
                <TableHead>Rate/kg</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Remaining (kg)</TableHead>
                <TableHead>Used %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => {
                const usedPercent = ((item.quantity_kg - item.remaining_quantity_kg) / item.quantity_kg) * 100;
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {item.raw_materials?.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.color}</Badge>
                    </TableCell>
                    <TableCell>{item.quantity_kg} kg</TableCell>
                    <TableCell>₹{item.rate_per_kg}/kg</TableCell>
                    <TableCell>₹{item.amount.toFixed(2)}</TableCell>
                    <TableCell>{item.remaining_quantity_kg.toFixed(2)} kg</TableCell>
                    <TableCell>
                      <Badge variant={usedPercent > 90 ? "destructive" : usedPercent > 50 ? "default" : "secondary"}>
                        {usedPercent.toFixed(1)}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {batch.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{batch.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
