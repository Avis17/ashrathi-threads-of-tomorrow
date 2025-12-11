import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus } from "lucide-react";
import { JobOrderProcess, useAddJobOrderProcess, useUpdateJobOrderProcess } from "@/hooks/useJobOrders";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { formatCurrency } from "@/lib/utils";

const PROCESS_TYPES = ["Cutting", "Stitching", "Checking", "Ironing", "Packing", "Other"];

interface ProcessesTableProps {
  jobOrderId: string;
  processes: JobOrderProcess[];
}

export const ProcessesTable = ({ jobOrderId, processes }: ProcessesTableProps) => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingProcess, setEditingProcess] = useState<JobOrderProcess | null>(null);
  const addProcess = useAddJobOrderProcess();
  const updateProcess = useUpdateJobOrderProcess();

  const { register, handleSubmit, setValue, watch, reset } = useForm();

  const onSubmit = (data: any) => {
    if (editingProcess) {
      updateProcess.mutate(
        { id: editingProcess.id, ...data },
        {
          onSuccess: () => {
            setEditingProcess(null);
            reset();
          },
        }
      );
    } else {
      addProcess.mutate(
        { job_order_id: jobOrderId, ...data },
        {
          onSuccess: () => {
            setShowAddDialog(false);
            reset();
          },
        }
      );
    }
  };

  const getStatusBadge = (status: string) => {
    const colorClasses: Record<string, string> = {
      pending: "bg-amber-500 text-white hover:bg-amber-600",
      in_progress: "bg-blue-500 text-white hover:bg-blue-600",
      completed: "bg-green-500 text-white hover:bg-green-600",
    };
    const labels: Record<string, string> = {
      pending: "Pending",
      in_progress: "In Progress",
      completed: "Completed",
    };
    return <Badge className={colorClasses[status] || "bg-gray-500 text-white"}>{labels[status] || status}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Process Breakdown</CardTitle>
          <Dialog open={showAddDialog || !!editingProcess} onOpenChange={(open) => {
            setShowAddDialog(open);
            if (!open) {
              setEditingProcess(null);
              reset();
            }
          }}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Process
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingProcess ? "Edit Process" : "Add New Process"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label>Process Name</Label>
                  <Select
                    defaultValue={editingProcess?.process_name}
                    onValueChange={(value) => setValue("process_name", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select process" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROCESS_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Rate per Piece (₹)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      defaultValue={editingProcess?.rate_per_piece}
                      {...register("rate_per_piece", { valueAsNumber: true })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Total Pieces</Label>
                    <Input
                      type="number"
                      defaultValue={editingProcess?.total_pieces}
                      {...register("total_pieces", { valueAsNumber: true })}
                    />
                  </div>
                </div>

                {editingProcess && (
                  <>
                    <div className="space-y-2">
                      <Label>Completion %</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        defaultValue={editingProcess.completion_percent}
                        {...register("completion_percent", { valueAsNumber: true })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select
                        defaultValue={editingProcess.status}
                        onValueChange={(value) => setValue("status", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => {
                    setShowAddDialog(false);
                    setEditingProcess(null);
                    reset();
                  }}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingProcess ? "Update" : "Add"} Process
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Process</TableHead>
              <TableHead>Rate/Piece</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Total Cost</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {processes.map((process) => (
              <TableRow key={process.id}>
                <TableCell className="font-medium">{process.process_name}</TableCell>
                <TableCell>{formatCurrency(process.rate_per_piece)}</TableCell>
                <TableCell>{process.total_pieces}</TableCell>
                <TableCell>{formatCurrency(process.total_cost)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 min-w-[100px]">
                    <Progress value={process.completion_percent} className="flex-1" />
                    <span className="text-sm">{Math.round(process.completion_percent)}%</span>
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(process.status)}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" onClick={() => setEditingProcess(process)}>
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {processes.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-4">
                  No processes added yet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
