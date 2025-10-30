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
import { Plus, Eye } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { AddToStockInventoryDialog } from "./AddToStockInventoryDialog";

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
                          onClick={() => updateStatusMutation.mutate({ id: batch.id, status: "completed" })}
                        >
                          Complete
                        </Button>
                      )}
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
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
    </Card>
  );
}
