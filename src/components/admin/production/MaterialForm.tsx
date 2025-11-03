import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useCreateMaterial, useUpdateMaterial, useMaterials } from "@/hooks/useMaterials";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MaterialFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingId?: string | null;
}

export const MaterialForm = ({ open, onOpenChange, editingId }: MaterialFormProps) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    unit: "kg",
    current_cost_per_unit: 0,
    available_stock: 0,
    reorder_level: 0,
    is_active: true,
  });

  const { mutate: createMaterial, isPending: isCreating } = useCreateMaterial();
  const { mutate: updateMaterial, isPending: isUpdating } = useUpdateMaterial();
  const { data: materials } = useMaterials();

  useEffect(() => {
    if (editingId && materials) {
      const material = materials.find((m) => m.id === editingId);
      if (material) {
        setFormData({
          name: material.name,
          description: material.description || "",
          unit: material.unit,
          current_cost_per_unit: material.current_cost_per_unit,
          available_stock: material.available_stock,
          reorder_level: material.reorder_level,
          is_active: material.is_active,
        });
      }
    } else {
      setFormData({
        name: "",
        description: "",
        unit: "kg",
        current_cost_per_unit: 0,
        available_stock: 0,
        reorder_level: 0,
        is_active: true,
      });
    }
  }, [editingId, materials, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || formData.current_cost_per_unit <= 0) {
      return;
    }

    if (editingId) {
      updateMaterial({ id: editingId, ...formData }, {
        onSuccess: () => onOpenChange(false),
      });
    } else {
      createMaterial(formData, {
        onSuccess: () => onOpenChange(false),
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editingId ? "Edit Material" : "Create New Material"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Material Name *</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Cotton Fabric"
              required
            />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Optional description"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Unit *</Label>
              <Select
                value={formData.unit}
                onValueChange={(value) => setFormData({ ...formData, unit: value })}
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
                value={formData.current_cost_per_unit || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    current_cost_per_unit: parseFloat(e.target.value) || 0,
                  })
                }
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Available Stock</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.available_stock || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    available_stock: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>

            <div>
              <Label>Reorder Level</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.reorder_level || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    reorder_level: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label>Active Status</Label>
            <Switch
              checked={formData.is_active}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, is_active: checked })
              }
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating || isUpdating}>
              {editingId ? "Update" : "Create"} Material
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
