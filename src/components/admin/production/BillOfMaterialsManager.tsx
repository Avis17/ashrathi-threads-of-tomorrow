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
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  product_code: string;
}

interface RawMaterial {
  id: string;
  name: string;
  unit: string;
  cost_per_unit: number;
}

interface ProductMaterial {
  id: string;
  product_id: string;
  raw_material_id: string;
  quantity_required: number;
  wastage_percentage: number;
  notes?: string;
  products: { name: string; product_code: string };
  raw_materials: { name: string; unit: string; cost_per_unit: number };
}

export function BillOfMaterialsManager() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState("");
  const [quantity, setQuantity] = useState("");
  const [wastage, setWastage] = useState("");
  const [notes, setNotes] = useState("");

  const queryClient = useQueryClient();

  const { data: products } = useQuery({
    queryKey: ["products-bom"],
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

  const { data: materials } = useQuery({
    queryKey: ["raw-materials-bom"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("raw_materials")
        .select("id, name, unit, cost_per_unit")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data as RawMaterial[];
    },
  });

  const { data: productMaterials, isLoading } = useQuery({
    queryKey: ["product-materials"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_materials")
        .select(`
          *,
          products!inner(name, product_code),
          raw_materials!inner(name, unit, cost_per_unit)
        `)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as ProductMaterial[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("product_materials").insert({
        product_id: selectedProduct,
        raw_material_id: selectedMaterial,
        quantity_required: parseFloat(quantity),
        wastage_percentage: parseFloat(wastage || "0"),
        notes,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-materials"] });
      toast.success("Material added to BOM");
      resetForm();
    },
    onError: () => toast.error("Failed to add material to BOM"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("product_materials").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-materials"] });
      toast.success("Material removed from BOM");
    },
    onError: () => toast.error("Failed to remove material"),
  });

  const resetForm = () => {
    setSelectedProduct("");
    setSelectedMaterial("");
    setQuantity("");
    setWastage("");
    setNotes("");
    setIsDialogOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate();
  };

  const calculateCost = (material: ProductMaterial) => {
    const baseQty = material.quantity_required;
    const wastageQty = (baseQty * material.wastage_percentage) / 100;
    const totalQty = baseQty + wastageQty;
    return totalQty * material.raw_materials.cost_per_unit;
  };

  const groupedByProduct = productMaterials?.reduce((acc, item) => {
    const productKey = item.product_id;
    if (!acc[productKey]) {
      acc[productKey] = {
        product: item.products,
        materials: [],
        totalCost: 0,
      };
    }
    acc[productKey].materials.push(item);
    acc[productKey].totalCost += calculateCost(item);
    return acc;
  }, {} as Record<string, { product: { name: string; product_code: string }; materials: ProductMaterial[]; totalCost: number }>);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Bill of Materials (BOM)</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Material to BOM
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Material to Product</DialogTitle>
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
                  <Label>Raw Material *</Label>
                  <Select value={selectedMaterial} onValueChange={setSelectedMaterial} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select material" />
                    </SelectTrigger>
                    <SelectContent>
                      {materials?.map((material) => (
                        <SelectItem key={material.id} value={material.id}>
                          {material.name} ({material.unit})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity Required *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    step="0.01"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wastage">Wastage % (Optional)</Label>
                  <Input
                    id="wastage"
                    type="number"
                    step="0.01"
                    value={wastage}
                    onChange={(e) => setWastage(e.target.value)}
                    placeholder="0"
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
                  <Button type="submit">Add to BOM</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-muted-foreground">Loading BOM...</p>
        ) : groupedByProduct && Object.keys(groupedByProduct).length > 0 ? (
          <div className="space-y-6">
            {Object.values(groupedByProduct).map(({ product, materials, totalCost }) => (
              <div key={materials[0].product_id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">
                    {product.product_code} - {product.name}
                  </h3>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Total Material Cost: </span>
                    <span className="font-semibold">₹{totalCost.toFixed(2)}</span>
                  </div>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Material</TableHead>
                      <TableHead>Qty Required</TableHead>
                      <TableHead>Wastage %</TableHead>
                      <TableHead>Total Qty</TableHead>
                      <TableHead>Cost/Unit</TableHead>
                      <TableHead>Total Cost</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {materials.map((item) => {
                      const totalQty = item.quantity_required + (item.quantity_required * item.wastage_percentage / 100);
                      return (
                        <TableRow key={item.id}>
                          <TableCell>{item.raw_materials.name}</TableCell>
                          <TableCell>
                            {item.quantity_required} {item.raw_materials.unit}
                          </TableCell>
                          <TableCell>{item.wastage_percentage}%</TableCell>
                          <TableCell>
                            {totalQty.toFixed(2)} {item.raw_materials.unit}
                          </TableCell>
                          <TableCell>₹{item.raw_materials.cost_per_unit.toFixed(2)}</TableCell>
                          <TableCell>₹{calculateCost(item).toFixed(2)}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteMutation.mutate(item.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No materials in BOM. Add materials to your products to get started.</p>
        )}
      </CardContent>
    </Card>
  );
}
