import { useState } from "react";
import { useCreateLaborCost } from "@/hooks/useProductionCosts";
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

interface LaborCostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batchId: string;
}

const LABOR_TYPES = [
  "Cutting",
  "Stitching",
  "Finishing",
  "Quality Check",
  "Packing",
  "Supervision",
  "Other",
];

export const LaborCostDialog = ({
  open,
  onOpenChange,
  batchId,
}: LaborCostDialogProps) => {
  const [laborType, setLaborType] = useState("");
  const [workerName, setWorkerName] = useState("");
  const [hoursSpent, setHoursSpent] = useState("");
  const [costPerHour, setCostPerHour] = useState("");
  const [notes, setNotes] = useState("");

  const createMutation = useCreateLaborCost();

  const handleSubmit = () => {
    if (!laborType || !hoursSpent || !costPerHour) return;

    createMutation.mutate(
      {
        production_batch_id: batchId,
        labor_type: laborType,
        worker_name: workerName || undefined,
        hours_spent: parseFloat(hoursSpent),
        cost_per_hour: parseFloat(costPerHour),
        notes: notes || undefined,
      },
      {
        onSuccess: () => {
          setLaborType("");
          setWorkerName("");
          setHoursSpent("");
          setCostPerHour("");
          setNotes("");
          onOpenChange(false);
        },
      }
    );
  };

  const totalCost =
    parseFloat(hoursSpent || "0") * parseFloat(costPerHour || "0");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Record Labor Cost</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="labor-type">Labor Type *</Label>
            <Select value={laborType} onValueChange={setLaborType}>
              <SelectTrigger id="labor-type">
                <SelectValue placeholder="Select labor type" />
              </SelectTrigger>
              <SelectContent>
                {LABOR_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="worker-name">Worker Name</Label>
            <Input
              id="worker-name"
              value={workerName}
              onChange={(e) => setWorkerName(e.target.value)}
              placeholder="Enter worker or team name"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hours">Hours Spent *</Label>
              <Input
                id="hours"
                type="number"
                step="0.5"
                min="0"
                value={hoursSpent}
                onChange={(e) => setHoursSpent(e.target.value)}
                placeholder="0.0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost-per-hour">Cost per Hour (₹) *</Label>
              <Input
                id="cost-per-hour"
                type="number"
                step="0.01"
                min="0"
                value={costPerHour}
                onChange={(e) => setCostPerHour(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>

          {hoursSpent && costPerHour && (
            <div className="rounded-lg bg-primary/10 p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Labor Cost:</span>
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
              placeholder="Any additional notes about labor work..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!laborType || !hoursSpent || !costPerHour || createMutation.isPending}
          >
            {createMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Record Labor
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
