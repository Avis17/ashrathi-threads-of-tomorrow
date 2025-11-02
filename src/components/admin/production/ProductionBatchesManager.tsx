import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Eye, Package, Users, DollarSign, AlertCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { AddToStockInventoryDialog } from "./AddToStockInventoryDialog";
import { MaterialUsageDialog } from "./MaterialUsageDialog";
import { LaborCostDialog } from "./LaborCostDialog";
import { OverheadCostDialog } from "./OverheadCostDialog";
import { useValidateBatchCosts } from "@/hooks/useProductionCosts";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Product {
  id: string;
  name: string;
  product_code: string;
}

interface ProductionBatch {
  id: string;
  batch_number: string;
  product_id: string;
  target_quantity: number;
  actual_quantity: number;
  status: string;
  started_at: string;
  completed_at?: string;
  total_material_cost: number;
  total_labor_cost: number;
  total_overhead_cost: number;
  total_cost: number;
  cost_per_piece: number;
  notes?: string;
  products: { name: string; product_code: string };
}

export function ProductionBatchesManager() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [targetQuantity, setTargetQuantity] = useState("");
  const [notes, setNotes] = useState("");
  const [materialDialogOpen, setMaterialDialogOpen] = useState(false);
  const [laborDialogOpen, setLaborDialogOpen] = useState(false);
  const [overheadDialogOpen, setOverheadDialogOpen] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [selectedBatchProductId, setSelectedBatchProductId] = useState("");
  const [completeAlertOpen, setCompleteAlertOpen] = useState(false);
  const [batchToComplete, setBatchToComplete] = useState<{ id: string; name: string } | null>(null);
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [batchToDelete, setBatchToDelete] = useState<{ id: string; batchNumber: string } | null>(null);

  const queryClient = useQueryClient();

  const { data: products } = useQuery({
    queryKey: ["products-production"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, product_code")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data as Product[];
    },
  });

  const { data: batches, isLoading } = useQuery({
    queryKey: ["production-batches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("production_batches")
        .select(`
          *,
          products!inner(name, product_code)
        `)
        .order("started_at", { ascending: false });
      if (error) throw error;
      return data as ProductionBatch[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("production_batches").insert([{
        product_id: selectedProduct,
        target_quantity: parseInt(targetQuantity),
        notes,
        status: "planned",
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["production-batches"] });
      toast.success("Production batch created");
      resetForm();
    },
    onError: () => toast.error("Failed to create batch"),
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const updates: any = { status };
      if (status === "in_progress") {
        updates.started_at = new Date().toISOString();
      } else if (status === "completed") {
        updates.completed_at = new Date().toISOString();
      }
      const { error } = await supabase
        .from("production_batches")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["production-batches"] });
      toast.success("Batch status updated");
    },
    onError: () => toast.error("Failed to update status"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("production_batches")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["production-batches"] });
      toast.success("Production batch deleted successfully");
      setDeleteAlertOpen(false);
      setBatchToDelete(null);
    },
    onError: () => toast.error("Failed to delete batch"),
  });

  const resetForm = () => {
    setSelectedProduct("");
    setTargetQuantity("");
    setNotes("");
    setIsDialogOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate();
  };

  const handleDeleteRequest = (batch: ProductionBatch) => {
    setBatchToDelete({ id: batch.id, batchNumber: batch.batch_number });
    setDeleteAlertOpen(true);
  };

  const confirmDelete = () => {
    if (batchToDelete) {
      deleteMutation.mutate(batchToDelete.id);
    }
  };

  const openMaterialDialog = (batchId: string, productId: string) => {
    setSelectedBatchId(batchId);
    setSelectedBatchProductId(productId);
    setMaterialDialogOpen(true);
  };

  const openLaborDialog = (batchId: string) => {
    setSelectedBatchId(batchId);
    setLaborDialogOpen(true);
  };

  const openOverheadDialog = (batchId: string) => {
    setSelectedBatchId(batchId);
    setOverheadDialogOpen(true);
  };

  const handleCompleteRequest = (batch: ProductionBatch) => {
    setBatchToComplete({ id: batch.id, name: batch.products.name });
    setCompleteAlertOpen(true);
  };

  const confirmComplete = () => {
    if (batchToComplete) {
      updateStatusMutation.mutate({ id: batchToComplete.id, status: "completed" });
    }
    setCompleteAlertOpen(false);
    setBatchToComplete(null);
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "planned":
        return "secondary";
      case "in_progress":
        return "default";
      case "completed":
        return "outline";
      default:
        return "secondary";
    }
  };

  const getStatusLabel = (status: string) => {
    return status.split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Production Batches</CardTitle>
          <div className="flex gap-2">
            <AddToStockInventoryDialog />
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Batch
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Production Batch</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Product *</Label>
                  <Select value={selectedProduct} onValueChange={setSelectedProduct} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products?.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.product_code} - {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="target_quantity">Target Quantity *</Label>
                  <Input
                    id="target_quantity"
                    type="number"
                    value={targetQuantity}
                    onChange={(e) => setTargetQuantity(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Batch</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-muted-foreground">Loading batches...</p>
        ) : batches && batches.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Batch Number</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Target Qty</TableHead>
                <TableHead>Actual Qty</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Started</TableHead>
                <TableHead>Total Cost</TableHead>
                <TableHead>Cost/Piece</TableHead>
                <TableHead>Cost Recording</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {batches.map((batch) => (
                <TableRow key={batch.id}>
                  <TableCell className="font-medium">{batch.batch_number}</TableCell>
                  <TableCell>
                    {batch.products.product_code} - {batch.products.name}
                  </TableCell>
                  <TableCell>{batch.target_quantity}</TableCell>
                  <TableCell>{batch.actual_quantity}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(batch.status)}>
                      {getStatusLabel(batch.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>{format(new Date(batch.started_at), "MMM dd, yyyy")}</TableCell>
                  <TableCell>₹{batch.total_cost.toFixed(2)}</TableCell>
                  <TableCell>₹{batch.cost_per_piece.toFixed(2)}</TableCell>
                  <TableCell>
                    {batch.status === "in_progress" && (
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openMaterialDialog(batch.id, batch.product_id)}
                          title="Record Material Usage"
                        >
                          <Package className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openLaborDialog(batch.id)}
                          title="Record Labor Cost"
                        >
                          <Users className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openOverheadDialog(batch.id)}
                          title="Record Overhead"
                        >
                          <DollarSign className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {batch.status === "planned" && (
                        <Button
                          size="sm"
                          onClick={() => updateStatusMutation.mutate({ id: batch.id, status: "in_progress" })}
                        >
                          Start
                        </Button>
                      )}
                      {batch.status === "in_progress" && (
                        <Button
                          size="sm"
                          onClick={() => handleCompleteRequest(batch)}
                        >
                          Complete
                        </Button>
                      )}
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDeleteRequest(batch)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-muted-foreground">No production batches found. Create your first batch to get started.</p>
        )}
      </CardContent>

      {/* Cost Recording Dialogs */}
      <MaterialUsageDialog
        open={materialDialogOpen}
        onOpenChange={setMaterialDialogOpen}
        batchId={selectedBatchId}
        productId={selectedBatchProductId}
      />
      <LaborCostDialog
        open={laborDialogOpen}
        onOpenChange={setLaborDialogOpen}
        batchId={selectedBatchId}
      />
      <OverheadCostDialog
        open={overheadDialogOpen}
        onOpenChange={setOverheadDialogOpen}
        batchId={selectedBatchId}
      />

      {/* Complete Batch Alert */}
      <AlertDialog open={completeAlertOpen} onOpenChange={setCompleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Complete Production Batch?</AlertDialogTitle>
            <AlertDialogDescription>
              <BatchCostValidation batchId={batchToComplete?.id || ""} />
              <p className="mt-4">
                This will mark the batch as completed and automatically calculate final costs based on recorded material, labor, and overhead expenses.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmComplete}>
              Complete Batch
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Production Batch</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete batch "{batchToDelete?.batchNumber}"? This will also delete all associated material usage, labor costs, and overhead records. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

// Cost Validation Component
function BatchCostValidation({ batchId }: { batchId: string }) {
  const { data: validation } = useValidateBatchCosts(batchId);

  if (!validation) return null;

  const hasAnyCosts = validation.has_material_costs || validation.has_labor_costs || validation.has_overhead_costs;

  return (
    <div className="space-y-2">
      <div className="flex items-start gap-2">
        {hasAnyCosts ? (
          <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
        ) : (
          <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
        )}
        <div className="space-y-1 text-sm">
          <p className="font-medium">Cost Recording Status:</p>
          <ul className="space-y-1 list-disc list-inside">
            <li className={validation.has_material_costs ? "text-green-600" : "text-muted-foreground"}>
              Material costs: {validation.material_count} {validation.has_material_costs ? "✓" : "not recorded"}
            </li>
            <li className={validation.has_labor_costs ? "text-green-600" : "text-muted-foreground"}>
              Labor costs: {validation.labor_count} {validation.has_labor_costs ? "✓" : "not recorded"}
            </li>
            <li className={validation.has_overhead_costs ? "text-green-600" : "text-muted-foreground"}>
              Overhead costs: {validation.overhead_count} {validation.has_overhead_costs ? "✓" : "not recorded"}
            </li>
          </ul>
          {!hasAnyCosts && (
            <p className="text-destructive font-medium mt-2">
              ⚠️ No costs recorded. The batch will be completed with zero cost.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
