import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateProductionBatch } from "@/hooks/useProductionBatches";
import { useProducts } from "@/hooks/useProducts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProductionBatchFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ProductionBatchForm = ({ open, onOpenChange }: ProductionBatchFormProps) => {
  const [formData, setFormData] = useState({
    batch_date: new Date().toISOString().split("T")[0],
    product_id: "",
    product_name: "",
    target_quantity: 0,
    actual_quantity: 0,
    notes: "",
  });

  const { mutate: createBatch, isPending } = useCreateProductionBatch();
  const { data: products } = useProducts();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.product_name || formData.target_quantity <= 0) {
      return;
    }

    createBatch(
      {
        batch_date: formData.batch_date,
        product_id: formData.product_id || null,
        product_name: formData.product_name,
        target_quantity: formData.target_quantity,
        actual_quantity: formData.actual_quantity,
        notes: formData.notes || undefined,
      },
      {
        onSuccess: () => {
          setFormData({
            batch_date: new Date().toISOString().split("T")[0],
            product_id: "",
            product_name: "",
            target_quantity: 0,
            actual_quantity: 0,
            notes: "",
          });
          onOpenChange(false);
        },
      }
    );
  };

  const handleProductChange = (productId: string) => {
    const product = products?.find((p) => p.id === productId);
    setFormData({
      ...formData,
      product_id: productId,
      product_name: product?.name || "",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Production Batch</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Batch Date</Label>
              <Input
                type="date"
                value={formData.batch_date}
                onChange={(e) =>
                  setFormData({ ...formData, batch_date: e.target.value })
                }
                required
              />
            </div>

            <div>
              <Label>Select Product (Optional)</Label>
              <Select onValueChange={handleProductChange} value={formData.product_id}>
                <SelectTrigger>
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {products?.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Product Name *</Label>
            <Input
              value={formData.product_name}
              onChange={(e) =>
                setFormData({ ...formData, product_name: e.target.value })
              }
              placeholder="Enter product name"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Target Quantity *</Label>
              <Input
                type="number"
                min="1"
                value={formData.target_quantity || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    target_quantity: parseInt(e.target.value) || 0,
                  })
                }
                required
              />
            </div>

            <div>
              <Label>Actual Quantity (if completed)</Label>
              <Input
                type="number"
                min="0"
                value={formData.actual_quantity || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    actual_quantity: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
          </div>

          <div>
            <Label>Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Add any notes or special instructions"
              rows={3}
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
              Create Batch
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
