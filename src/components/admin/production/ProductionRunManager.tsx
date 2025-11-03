import { useState } from "react";
import { Plus, Eye, Play, CheckCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useProductionRuns, useUpdateProductionRun, useDeleteProductionRun } from "@/hooks/useProductionRuns";
import { ProductionRunForm } from "./ProductionRunForm";
import { ProductionRunDetails } from "./ProductionRunDetails";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { format } from "date-fns";

export const ProductionRunManager = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const { data: runs, isLoading } = useProductionRuns();
  const updateMutation = useUpdateProductionRun();
  const deleteMutation = useDeleteProductionRun();

  const handleStatusChange = (id: string, status: string) => {
    const updates: any = { status };
    if (status === "in_progress") {
      updates.started_at = new Date().toISOString();
    } else if (status === "completed") {
      updates.completed_at = new Date().toISOString();
    }
    updateMutation.mutate({ id, updates });
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
      setDeleteId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "default";
      case "in_progress": return "secondary";
      case "planned": return "outline";
      default: return "destructive";
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (selectedRunId) {
    return <ProductionRunDetails runId={selectedRunId} onClose={() => setSelectedRunId(null)} />;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Production Runs</CardTitle>
              <CardDescription>
                Track production from start to finish with complete cost breakdown
              </CardDescription>
            </div>
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Production Run
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Run Code</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Actual</TableHead>
                <TableHead>Total Cost</TableHead>
                <TableHead>Cost/Piece</TableHead>
                <TableHead>Started</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {runs?.map((run) => (
                <TableRow key={run.id}>
                  <TableCell className="font-medium">{run.run_code}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{run.products?.name}</div>
                      <div className="text-sm text-muted-foreground">{run.products?.product_code}</div>
                    </div>
                  </TableCell>
                  <TableCell>{run.target_quantity}</TableCell>
                  <TableCell>{run.actual_quantity}</TableCell>
                  <TableCell>₹{run.total_cost.toFixed(2)}</TableCell>
                  <TableCell>₹{run.cost_per_piece.toFixed(2)}</TableCell>
                  <TableCell>{format(new Date(run.started_at), "dd MMM yyyy")}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(run.status)}>
                      {run.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedRunId(run.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {run.status === "planned" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleStatusChange(run.id, "in_progress")}
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      )}
                      {run.status === "in_progress" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleStatusChange(run.id, "completed")}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(run.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ProductionRunForm open={isFormOpen} onOpenChange={setIsFormOpen} />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Production Run</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this production run? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
