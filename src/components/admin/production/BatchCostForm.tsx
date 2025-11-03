import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAddBatchCost } from "@/hooks/useProductionBatches";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BatchCostFormProps {
  batchId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const BatchCostForm = ({ batchId, open, onOpenChange }: BatchCostFormProps) => {
  const [formData, setFormData] = useState({
    cost_type: "labor" as "labor" | "overhead" | "transport" | "other",
    subcategory: "",
    description: "",
    amount: 0,
  });

  const { mutate: addCost, isPending } = useAddBatchCost();

  const laborSubcategories = [
    "Cutting",
    "Stitching",
    "Checking",
    "Ironing",
    "Packing",
    "Other",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.description || formData.amount <= 0) {
      return;
    }

    addCost(
      {
        batch_id: batchId,
        cost_type: formData.cost_type,
        subcategory: formData.cost_type === "labor" ? formData.subcategory : undefined,
        description: formData.description,
        amount: formData.amount,
      },
      {
        onSuccess: () => {
          setFormData({
            cost_type: "labor",
            subcategory: "",
            description: "",
            amount: 0,
          });
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Cost to Batch</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Cost Type *</Label>
            <Select
              value={formData.cost_type}
              onValueChange={(value: any) =>
                setFormData({ ...formData, cost_type: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="labor">Labor</SelectItem>
                <SelectItem value="overhead">Overhead</SelectItem>
                <SelectItem value="transport">Transport</SelectItem>
                <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {formData.cost_type === "labor" && (
          <div>
            <Label>Labor Category *</Label>
            <Select
              value={formData.subcategory}
              onValueChange={(value) =>
                setFormData({ ...formData, subcategory: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select labor category" />
              </SelectTrigger>
              <SelectContent>
                {laborSubcategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div>
          <Label>Description *</Label>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="e.g., Worker wages, Electricity bill, etc."
              required
            />
          </div>

          <div>
            <Label>Amount *</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={formData.amount || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  amount: parseFloat(e.target.value) || 0,
                })
              }
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              Add Cost
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
