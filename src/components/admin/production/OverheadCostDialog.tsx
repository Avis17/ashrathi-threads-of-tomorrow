import { useState } from "react";
import { useCreateOverheadCost } from "@/hooks/useProductionCosts";
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

interface OverheadCostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batchId: string;
}

const OVERHEAD_TYPES = [
  "Electricity",
  "Machine Depreciation",
  "Rent Allocation",
  "Maintenance",
  "Water & Utilities",
  "Factory Supplies",
  "Quality Control",
  "Transportation",
  "Other",
];

export const OverheadCostDialog = ({
  open,
  onOpenChange,
  batchId,
}: OverheadCostDialogProps) => {
  const [costType, setCostType] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const createMutation = useCreateOverheadCost();

  const handleSubmit = () => {
    if (!costType || !amount) return;

    createMutation.mutate(
      {
        production_batch_id: batchId,
        cost_type: costType,
        amount: parseFloat(amount),
        description: description || undefined,
      },
      {
        onSuccess: () => {
          setCostType("");
          setAmount("");
          setDescription("");
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Record Overhead Cost</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cost-type">Cost Type *</Label>
            <Select value={costType} onValueChange={setCostType}>
              <SelectTrigger id="cost-type">
                <SelectValue placeholder="Select overhead type" />
              </SelectTrigger>
              <SelectContent>
                {OVERHEAD_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₹) *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>

          {amount && (
            <div className="rounded-lg bg-primary/10 p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Overhead Cost:</span>
                <span className="text-xl font-bold">
                  ₹{parseFloat(amount).toFixed(2)}
                </span>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide details about this overhead cost..."
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!costType || !amount || createMutation.isPending}
          >
            {createMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Record Overhead
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
