import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCreateMaterialUsage } from "@/hooks/useProductionCosts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface MaterialUsageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batchId: string;
  productId: string;
}

export const MaterialUsageDialog = ({
  open,
  onOpenChange,
  batchId,
  productId,
}: MaterialUsageDialogProps) => {
  const [selectedMaterialId, setSelectedMaterialId] = useState("");
  const [quantityUsed, setQuantityUsed] = useState("");
  const [notes, setNotes] = useState("");

  const createMutation = useCreateMaterialUsage();

  // Fetch BOM materials for this product
  const { data: bomMaterials, isLoading: loadingBom } = useQuery({
    queryKey: ["bom-materials", productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_materials")
        .select(`
          *,
          raw_materials:raw_material_id (
            id,
            name,
            unit,
            cost_per_unit,
            current_stock
          )
        `)
        .eq("product_id", productId);

      if (error) throw error;
      return data;
    },
    enabled: open && !!productId,
  });

  // Fetch all raw materials as fallback
  const { data: allMaterials, isLoading: loadingMaterials } = useQuery({
    queryKey: ["raw-materials-active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("raw_materials")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  const selectedMaterial = allMaterials?.find((m) => m.id === selectedMaterialId);
  const bomMaterial = bomMaterials?.find(
    (bm) => bm.raw_material_id === selectedMaterialId
  );

  const handleSubmit = () => {
    if (!selectedMaterialId || !quantityUsed) return;

    createMutation.mutate(
      {
        production_batch_id: batchId,
        raw_material_id: selectedMaterialId,
        quantity_used: parseFloat(quantityUsed),
        cost_at_time: selectedMaterial?.cost_per_unit || 0,
        notes: notes || undefined,
      },
      {
        onSuccess: () => {
          setSelectedMaterialId("");
          setQuantityUsed("");
          setNotes("");
          onOpenChange(false);
        },
      }
    );
  };

  const totalCost = selectedMaterial
    ? parseFloat(quantityUsed || "0") * selectedMaterial.cost_per_unit
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Record Material Usage</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {loadingBom || loadingMaterials ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="material">Raw Material *</Label>
                <Select value={selectedMaterialId} onValueChange={setSelectedMaterialId}>
                  <SelectTrigger id="material">
                    <SelectValue placeholder="Select material" />
                  </SelectTrigger>
                  <SelectContent>
                    {bomMaterials && bomMaterials.length > 0 && (
                      <>
                        <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                          From BOM
                        </div>
                        {bomMaterials.map((bm) => (
                          <SelectItem key={bm.id} value={bm.raw_material_id}>
                            {bm.raw_materials?.name} (Required: {bm.quantity_required}{" "}
                            {bm.raw_materials?.unit})
                          </SelectItem>
                        ))}
                      </>
                    )}
                    <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                      All Materials
                    </div>
                    {allMaterials?.map((material) => (
                      <SelectItem key={material.id} value={material.id}>
                        {material.name} - ₹{material.cost_per_unit}/{material.unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedMaterial && (
                <div className="rounded-lg bg-muted p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Current Stock:</span>
                    <span className="font-medium">
                      {selectedMaterial.current_stock} {selectedMaterial.unit}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Cost per Unit:</span>
                    <span className="font-medium">
                      ₹{selectedMaterial.cost_per_unit}/{selectedMaterial.unit}
                    </span>
                  </div>
                  {bomMaterial && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">BOM Required:</span>
                      <span className="font-medium">
                        {bomMaterial.quantity_required} {selectedMaterial.unit}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="quantity">
                  Quantity Used * ({selectedMaterial?.unit || "units"})
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  step="0.01"
                  min="0"
                  value={quantityUsed}
                  onChange={(e) => setQuantityUsed(e.target.value)}
                  placeholder="Enter quantity used"
                />
              </div>

              {quantityUsed && selectedMaterial && (
                <div className="rounded-lg bg-primary/10 p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Material Cost:</span>
                    <span className="text-xl font-bold">₹{totalCost.toFixed(2)}</span>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional notes about material usage..."
                  rows={3}
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedMaterialId || !quantityUsed || createMutation.isPending}
          >
            {createMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Record Usage
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
