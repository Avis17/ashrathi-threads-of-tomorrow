import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, ShoppingCart, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface Purchase {
  id: string;
  purchase_date: string;
  material_id: string;
  color: string;
  quantity_kg: number;
  rate_per_kg: number;
  transport_cost: number;
  other_costs: number;
  total_cost: number;
  supplier_name: string | null;
  remarks: string | null;
  raw_materials: {
    name: string;
    unit: string;
  };
}

interface RawMaterial {
  id: string;
  name: string;
  unit: string;
  supplier_name: string | null;
}

const COLORS = [
  "White", "Black", "Navy Blue", "Royal Blue", "Sky Blue",
  "Red", "Maroon", "Pink", "Green", "Olive Green",
  "Yellow", "Orange", "Grey", "Beige", "Brown", "Purple"
];

export const PurchasesManager = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    purchase_date: new Date().toISOString().split('T')[0],
    material_id: "",
    color: "",
    quantity_kg: "",
    rate_per_kg: "",
    transport_cost: "0",
    other_costs: "0",
    supplier_name: "",
    remarks: "",
  });

  const queryClient = useQueryClient();

  const { data: purchases = [], isLoading } = useQuery({
    queryKey: ["purchases"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("purchases")
        .select(`
          *,
          raw_materials (name, unit)
        `)
        .order("purchase_date", { ascending: false });
      if (error) throw error;
      return data as Purchase[];
    },
  });

  const { data: materials = [] } = useQuery({
    queryKey: ["raw-materials-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("raw_materials")
        .select("id, name, unit, supplier_name")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data as RawMaterial[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      // Insert purchase
      const { data: purchase, error: purchaseError } = await supabase
        .from("purchases")
        .insert([data])
        .select()
        .single();
      
      if (purchaseError) throw purchaseError;

      // Update material stock by fetching current stock first
      const { data: material, error: fetchError } = await supabase
        .from("raw_materials")
        .select("current_stock")
        .eq("id", data.material_id)
        .single();
      
      if (fetchError) throw fetchError;

      const { error: updateError } = await supabase
        .from("raw_materials")
        .update({ 
          current_stock: material.current_stock + parseFloat(data.quantity_kg)
        })
        .eq("id", data.material_id);
      
      if (updateError) throw updateError;

      return purchase;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      queryClient.invalidateQueries({ queryKey: ["raw-materials"] });
      toast.success("Purchase recorded successfully");
      setDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to record purchase");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("purchases").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      toast.success("Purchase deleted");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete purchase");
    },
  });

  const resetForm = () => {
    setFormData({
      purchase_date: new Date().toISOString().split('T')[0],
      material_id: "",
      color: "",
      quantity_kg: "",
      rate_per_kg: "",
      transport_cost: "0",
      other_costs: "0",
      supplier_name: "",
      remarks: "",
    });
  };

  const handleSubmit = () => {
    if (!formData.material_id || !formData.color || !formData.quantity_kg || !formData.rate_per_kg) {
      toast.error("Please fill required fields");
      return;
    }

    createMutation.mutate({
      ...formData,
      quantity_kg: parseFloat(formData.quantity_kg),
      rate_per_kg: parseFloat(formData.rate_per_kg),
      transport_cost: parseFloat(formData.transport_cost),
      other_costs: parseFloat(formData.other_costs),
    });
  };

  const totalPurchased = purchases.reduce((sum, p) => sum + p.quantity_kg, 0);
  const totalAmount = purchases.reduce((sum, p) => sum + p.total_cost, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Raw Material Purchases</h2>
          <p className="text-muted-foreground">Track fabric purchases with color and cost details</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Purchase
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{purchases.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Fabric (kg)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPurchased.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalAmount.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : purchases.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">No purchases recorded yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Material</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>Qty (kg)</TableHead>
                  <TableHead>Rate/kg</TableHead>
                  <TableHead>Transport</TableHead>
                  <TableHead>Other</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchases.map((purchase) => (
                  <TableRow key={purchase.id}>
                    <TableCell>{format(new Date(purchase.purchase_date), "dd MMM yyyy")}</TableCell>
                    <TableCell className="font-medium">{purchase.raw_materials.name}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-1 rounded-md bg-primary/10 text-sm">
                        {purchase.color}
                      </span>
                    </TableCell>
                    <TableCell>{purchase.quantity_kg}</TableCell>
                    <TableCell>₹{purchase.rate_per_kg}</TableCell>
                    <TableCell>₹{purchase.transport_cost}</TableCell>
                    <TableCell>₹{purchase.other_costs}</TableCell>
                    <TableCell className="font-bold">₹{purchase.total_cost.toFixed(2)}</TableCell>
                    <TableCell>{purchase.supplier_name || "-"}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteMutation.mutate(purchase.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Record New Purchase</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Purchase Date *</Label>
              <Input
                type="date"
                value={formData.purchase_date}
                onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Material *</Label>
              <Select
                value={formData.material_id}
                onValueChange={(value) => {
                  const material = materials.find(m => m.id === value);
                  setFormData({ 
                    ...formData, 
                    material_id: value,
                    supplier_name: material?.supplier_name || ""
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select material" />
                </SelectTrigger>
                <SelectContent>
                  {materials.map((mat) => (
                    <SelectItem key={mat.id} value={mat.id}>
                      {mat.name} ({mat.unit})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Color *</Label>
              <Select
                value={formData.color}
                onValueChange={(value) => setFormData({ ...formData, color: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select color" />
                </SelectTrigger>
                <SelectContent>
                  {COLORS.map((color) => (
                    <SelectItem key={color} value={color}>
                      {color}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Quantity (kg) *</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.quantity_kg}
                onChange={(e) => setFormData({ ...formData, quantity_kg: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label>Rate per kg (₹) *</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.rate_per_kg}
                onChange={(e) => setFormData({ ...formData, rate_per_kg: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label>Transport Cost (₹)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.transport_cost}
                onChange={(e) => setFormData({ ...formData, transport_cost: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label>Other Costs (₹)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.other_costs}
                onChange={(e) => setFormData({ ...formData, other_costs: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label>Supplier Name</Label>
              <Input
                value={formData.supplier_name}
                onChange={(e) => setFormData({ ...formData, supplier_name: e.target.value })}
                placeholder="Supplier name"
              />
            </div>

            <div className="col-span-2 space-y-2">
              <Label>Remarks</Label>
              <Textarea
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                placeholder="Additional notes..."
                rows={3}
              />
            </div>
          </div>

          {formData.quantity_kg && formData.rate_per_kg && (
            <div className="rounded-lg bg-primary/10 p-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Material Cost:</span>
                  <span>₹{(parseFloat(formData.quantity_kg) * parseFloat(formData.rate_per_kg)).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Transport:</span>
                  <span>₹{parseFloat(formData.transport_cost || "0").toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Other:</span>
                  <span>₹{parseFloat(formData.other_costs || "0").toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold border-t pt-2">
                  <span>Total Cost:</span>
                  <span>₹{(
                    parseFloat(formData.quantity_kg) * parseFloat(formData.rate_per_kg) +
                    parseFloat(formData.transport_cost || "0") +
                    parseFloat(formData.other_costs || "0")
                  ).toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={createMutation.isPending}>
              {createMutation.isPending ? "Recording..." : "Record Purchase"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};