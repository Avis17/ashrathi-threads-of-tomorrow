import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAddBatchMaterial } from "@/hooks/useProductionBatches";
import { useMaterials, useCreateMaterial } from "@/hooks/useMaterials";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

interface BatchMaterialFormProps {
  batchId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const BatchMaterialForm = ({ batchId, open, onOpenChange }: BatchMaterialFormProps) => {
  const [formData, setFormData] = useState({
    material_id: "",
    material_name: "",
    quantity_used: 0,
    cost_per_unit: 0,
  });
  const [showNewMaterial, setShowNewMaterial] = useState(false);
  const [newMaterial, setNewMaterial] = useState({
    name: "",
    unit: "kg",
    current_cost_per_unit: 0,
  });

  const { mutate: addMaterial, isPending } = useAddBatchMaterial();
  const { mutate: createMaterial, isPending: isCreating } = useCreateMaterial();
  const { data: materials } = useMaterials(true);

  const totalCost = formData.quantity_used * formData.cost_per_unit;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.material_name || formData.quantity_used <= 0) {
      return;
    }

    addMaterial(
      {
        batch_id: batchId,
        material_id: formData.material_id,
        material_name: formData.material_name,
        quantity_used: formData.quantity_used,
        cost_per_unit: formData.cost_per_unit,
        total_cost: totalCost,
      },
      {
        onSuccess: () => {
          setFormData({
            material_id: "",
            material_name: "",
            quantity_used: 0,
            cost_per_unit: 0,
          });
          onOpenChange(false);
        },
      }
    );
  };

  const handleCreateNewMaterial = () => {
    if (!newMaterial.name || newMaterial.current_cost_per_unit <= 0) return;

    createMaterial(newMaterial, {
      onSuccess: () => {
        setNewMaterial({
          name: "",
          unit: "kg",
          current_cost_per_unit: 0,
        });
        setShowNewMaterial(false);
      },
    });
  };

  const handleMaterialChange = (materialId: string) => {
    const material = materials?.find((m) => m.id === materialId);
    if (material) {
      setFormData({
        ...formData,
        material_id: materialId,
        material_name: material.name,
        cost_per_unit: material.current_cost_per_unit,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Material to Batch</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!showNewMaterial ? (
            <>
              <div>
                <Label>Select Existing Material</Label>
                <Select onValueChange={handleMaterialChange} value={formData.material_id}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select material" />
                  </SelectTrigger>
                  <SelectContent>
                    {materials?.map((material) => (
                      <SelectItem key={material.id} value={material.id}>
                        {material.name} - ₹{material.current_cost_per_unit}/{material.unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="text-center">
                <Button
                  type="button"
                  variant="link"
                  onClick={() => setShowNewMaterial(true)}
                >
                  + Create New Material
                </Button>
              </div>

              <Separator />

              <div>
                <Label>Quantity Used *</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.quantity_used || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      quantity_used: parseFloat(e.target.value) || 0,
                    })
                  }
                  required
                />
              </div>

              <div>
                <Label>Cost Per Unit *</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.cost_per_unit || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      cost_per_unit: parseFloat(e.target.value) || 0,
                    })
                  }
                  required
                />
              </div>

              {totalCost > 0 && (
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground">Total Cost</div>
                  <div className="text-2xl font-bold">₹{totalCost.toFixed(2)}</div>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  Add Material
                </Button>
              </div>
            </>
          ) : (
            <>
              <div>
                <Label>Material Name *</Label>
                <Input
                  value={newMaterial.name}
                  onChange={(e) =>
                    setNewMaterial({ ...newMaterial, name: e.target.value })
                  }
                  placeholder="e.g., Cotton Fabric"
                  required
                />
              </div>

              <div>
                <Label>Unit *</Label>
                <Select
                  value={newMaterial.unit}
                  onValueChange={(value) =>
                    setNewMaterial({ ...newMaterial, unit: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">Kilogram (kg)</SelectItem>
                    <SelectItem value="meter">Meter (m)</SelectItem>
                    <SelectItem value="piece">Piece (pcs)</SelectItem>
                    <SelectItem value="liter">Liter (L)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Cost Per Unit *</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={newMaterial.current_cost_per_unit || ""}
                  onChange={(e) =>
                    setNewMaterial({
                      ...newMaterial,
                      current_cost_per_unit: parseFloat(e.target.value) || 0,
                    })
                  }
                  required
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowNewMaterial(false)}
                >
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={handleCreateNewMaterial}
                  disabled={isCreating}
                >
                  Create Material
                </Button>
              </div>
            </>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};
