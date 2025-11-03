import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCreatePurchaseBatch } from "@/hooks/usePurchaseBatches";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const formSchema = z.object({
  purchase_date: z.string(),
  supplier_name: z.string().min(1, "Supplier name is required"),
  supplier_contact: z.string().optional(),
  supplier_address: z.string().optional(),
  transport_cost: z.number().min(0),
  loading_cost: z.number().min(0),
  other_costs: z.number().min(0),
  payment_status: z.string(),
  notes: z.string().optional(),
});

interface MaterialRow {
  id: string;
  raw_material_id: string;
  color: string;
  quantity_kg: number;
  rate_per_kg: number;
}

export const PurchaseBatchForm = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const [materialRows, setMaterialRows] = useState<MaterialRow[]>([
    { id: crypto.randomUUID(), raw_material_id: "", color: "", quantity_kg: 0, rate_per_kg: 0 }
  ]);

  const createMutation = useCreatePurchaseBatch();

  const { data: materials } = useQuery({
    queryKey: ["raw-materials"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("raw_materials")
        .select("*")
        .eq("is_active", true);
      if (error) throw error;
      return data;
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      purchase_date: new Date().toISOString().split('T')[0],
      supplier_name: "",
      supplier_contact: "",
      supplier_address: "",
      transport_cost: 0,
      loading_cost: 0,
      other_costs: 0,
      payment_status: "pending",
      notes: "",
    },
  });

  const addMaterialRow = () => {
    setMaterialRows([...materialRows, { id: crypto.randomUUID(), raw_material_id: "", color: "", quantity_kg: 0, rate_per_kg: 0 }]);
  };

  const removeMaterialRow = (id: string) => {
    if (materialRows.length > 1) {
      setMaterialRows(materialRows.filter(row => row.id !== id));
    }
  };

  const updateMaterialRow = (id: string, field: keyof MaterialRow, value: any) => {
    setMaterialRows(materialRows.map(row => 
      row.id === id ? { ...row, [field]: value } : row
    ));
  };

  const calculateSubtotal = () => {
    return materialRows.reduce((sum, row) => sum + (row.quantity_kg * row.rate_per_kg), 0);
  };

  const calculateGrandTotal = () => {
    const subtotal = calculateSubtotal();
    const transport = form.watch("transport_cost") || 0;
    const loading = form.watch("loading_cost") || 0;
    const other = form.watch("other_costs") || 0;
    return subtotal + transport + loading + other;
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const validItems = materialRows.filter(row => 
      row.raw_material_id && row.color && row.quantity_kg > 0 && row.rate_per_kg > 0
    );

    if (validItems.length === 0) {
      form.setError("root", { message: "Please add at least one material item" });
      return;
    }

    await createMutation.mutateAsync({
      batch: values,
      items: validItems,
    });

    form.reset();
    setMaterialRows([{ id: crypto.randomUUID(), raw_material_id: "", color: "", quantity_kg: 0, rate_per_kg: 0 }]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Purchase Batch</DialogTitle>
          <DialogDescription>
            Enter multiple materials and colors in a single purchase batch
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="purchase_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purchase Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="payment_status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="partial">Partial</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Supplier Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="supplier_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supplier Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="supplier_contact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="supplier_address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Materials & Colors</CardTitle>
                  <Button type="button" size="sm" onClick={addMaterialRow}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Material
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {materialRows.map((row) => (
                  <div key={row.id} className="grid grid-cols-6 gap-4 items-end">
                    <div>
                      <FormLabel>Material</FormLabel>
                      <Select
                        value={row.raw_material_id}
                        onValueChange={(value) => updateMaterialRow(row.id, "raw_material_id", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select material" />
                        </SelectTrigger>
                        <SelectContent>
                          {materials?.map((material) => (
                            <SelectItem key={material.id} value={material.id}>
                              {material.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <FormLabel>Color</FormLabel>
                      <Input
                        value={row.color}
                        onChange={(e) => updateMaterialRow(row.id, "color", e.target.value)}
                        placeholder="Color"
                      />
                    </div>

                    <div>
                      <FormLabel>Quantity (kg)</FormLabel>
                      <Input
                        type="number"
                        value={row.quantity_kg || ""}
                        onChange={(e) => updateMaterialRow(row.id, "quantity_kg", parseFloat(e.target.value) || 0)}
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <FormLabel>Rate/kg (₹)</FormLabel>
                      <Input
                        type="number"
                        value={row.rate_per_kg || ""}
                        onChange={(e) => updateMaterialRow(row.id, "rate_per_kg", parseFloat(e.target.value) || 0)}
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <FormLabel>Amount (₹)</FormLabel>
                      <Input
                        value={(row.quantity_kg * row.rate_per_kg).toFixed(2)}
                        disabled
                      />
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeMaterialRow(row.id)}
                      disabled={materialRows.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Additional Costs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="transport_cost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Transport Cost (₹)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="loading_cost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Loading/Unloading (₹)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="other_costs"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Other Costs (₹)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-lg">
                    <span>Subtotal (Materials):</span>
                    <span className="font-semibold">₹{calculateSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-2xl font-bold">
                    <span>Grand Total:</span>
                    <span className="text-primary">₹{calculateGrandTotal().toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {form.formState.errors.root && (
              <p className="text-sm text-destructive">{form.formState.errors.root.message}</p>
            )}

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Create Purchase Batch"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
