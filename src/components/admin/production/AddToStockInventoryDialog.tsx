import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package } from "lucide-react";
import { useCreateBatchInventory } from "@/hooks/useStockInventory";
import { toast } from "sonner";

interface ProductionBatch {
  id: string;
  batch_number: string;
  product_id: string;
  actual_quantity: number;
  products: {
    name: string;
    product_code: string;
  };
}

export function AddToStockInventoryDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [producedQuantity, setProducedQuantity] = useState("");
  const [qualityPassed, setQualityPassed] = useState("");
  const [qualityFailed, setQualityFailed] = useState("");
  const [warehouseLocation, setWarehouseLocation] = useState("");
  const [manufacturingDate, setManufacturingDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [expiryDate, setExpiryDate] = useState("");
  const [notes, setNotes] = useState("");

  const { data: completedBatches } = useQuery({
    queryKey: ["completed-batches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("production_batches")
        .select(`
          id,
          batch_number,
          product_id,
          actual_quantity,
          products!inner(name, product_code)
        `)
        .eq("status", "completed")
        .order("completed_at", { ascending: false });
      if (error) throw error;
      return data as ProductionBatch[];
    },
  });

  const createMutation = useCreateBatchInventory();

  const selectedBatch = completedBatches?.find((b) => b.id === selectedBatchId);

  const resetForm = () => {
    setSelectedBatchId("");
    setProducedQuantity("");
    setQualityPassed("");
    setQualityFailed("");
    setWarehouseLocation("");
    setManufacturingDate(new Date().toISOString().split("T")[0]);
    setExpiryDate("");
    setNotes("");
    setIsOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedBatch) {
      toast.error("Please select a batch");
      return;
    }

    const produced = parseInt(producedQuantity);
    const passed = parseInt(qualityPassed);
    const failed = parseInt(qualityFailed);

    if (passed + failed > produced) {
      toast.error("Quality check total cannot exceed produced quantity");
      return;
    }

    // Get product code for batch number generation
    const { data: product } = await supabase
      .from("products")
      .select("product_code")
      .eq("id", selectedBatch.product_id)
      .single();

    if (!product?.product_code) {
      toast.error("Product code not found");
      return;
    }

    // Call the database function to generate batch number
    const { data: batchNumberData, error: batchError } = await supabase.rpc(
      "generate_custom_batch_number",
      {
        product_code: product.product_code,
        production_date: manufacturingDate,
      }
    );

    if (batchError) {
      toast.error("Failed to generate batch number");
      return;
    }

    const inventoryData = {
      batch_id: selectedBatchId,
      product_id: selectedBatch.product_id,
      batch_number: batchNumberData,
      produced_quantity: produced,
      quality_check_passed: passed,
      quality_check_failed: failed,
      available_quantity: passed,
      dispatched_quantity: 0,
      warehouse_location: warehouseLocation || null,
      manufacturing_date: manufacturingDate,
      expiry_date: expiryDate || null,
      notes: notes || null,
      status: "in_stock",
    };

    createMutation.mutate(inventoryData, {
      onSuccess: () => {
        resetForm();
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Package className="h-4 w-4 mr-2" />
          Add to Stock Inventory
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add to Stock Inventory</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Select Completed Batch *</Label>
            <Select value={selectedBatchId} onValueChange={setSelectedBatchId} required>
              <SelectTrigger>
                <SelectValue placeholder="Select batch" />
              </SelectTrigger>
              <SelectContent>
                {completedBatches?.map((batch) => (
                  <SelectItem key={batch.id} value={batch.id}>
                    {batch.batch_number} - {batch.products.product_code} -{" "}
                    {batch.products.name} (Qty: {batch.actual_quantity})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedBatch && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium">Selected Product:</p>
              <p className="text-sm text-muted-foreground">
                {selectedBatch.products.product_code} - {selectedBatch.products.name}
              </p>
              <p className="text-sm text-muted-foreground">
                Batch Actual Quantity: {selectedBatch.actual_quantity}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="produced_quantity">Produced Quantity *</Label>
              <Input
                id="produced_quantity"
                type="number"
                min="0"
                value={producedQuantity}
                onChange={(e) => setProducedQuantity(e.target.value)}
                placeholder={selectedBatch?.actual_quantity.toString()}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="manufacturing_date">Manufacturing Date *</Label>
              <Input
                id="manufacturing_date"
                type="date"
                value={manufacturingDate}
                onChange={(e) => setManufacturingDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quality_passed">Quality Check Passed *</Label>
              <Input
                id="quality_passed"
                type="number"
                min="0"
                value={qualityPassed}
                onChange={(e) => setQualityPassed(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quality_failed">Quality Check Failed *</Label>
              <Input
                id="quality_failed"
                type="number"
                min="0"
                value={qualityFailed}
                onChange={(e) => setQualityFailed(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="warehouse_location">Warehouse Location</Label>
              <Input
                id="warehouse_location"
                value={warehouseLocation}
                onChange={(e) => setWarehouseLocation(e.target.value)}
                placeholder="e.g., A1-Rack-3"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiry_date">Expiry Date</Label>
              <Input
                id="expiry_date"
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes about this batch..."
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={resetForm}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Adding..." : "Add to Inventory"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
