import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAddBatchSale } from "@/hooks/useProductionBatches";

interface BatchSaleFormProps {
  batchId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const BatchSaleForm = ({ batchId, open, onOpenChange }: BatchSaleFormProps) => {
  const [formData, setFormData] = useState({
    sale_date: new Date().toISOString().split("T")[0],
    customer_name: "",
    quantity_sold: 0,
    price_per_piece: 0,
    invoice_number: "",
    notes: "",
  });

  const { mutate: addSale, isPending } = useAddBatchSale();

  const totalAmount = formData.quantity_sold * formData.price_per_piece;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customer_name || formData.quantity_sold <= 0) {
      return;
    }

    addSale(
      {
        batch_id: batchId,
        sale_date: formData.sale_date,
        customer_name: formData.customer_name,
        quantity_sold: formData.quantity_sold,
        price_per_piece: formData.price_per_piece,
        total_amount: totalAmount,
        invoice_number: formData.invoice_number || undefined,
        notes: formData.notes || undefined,
      },
      {
        onSuccess: () => {
          setFormData({
            sale_date: new Date().toISOString().split("T")[0],
            customer_name: "",
            quantity_sold: 0,
            price_per_piece: 0,
            invoice_number: "",
            notes: "",
          });
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record Sale</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Sale Date *</Label>
              <Input
                type="date"
                value={formData.sale_date}
                onChange={(e) =>
                  setFormData({ ...formData, sale_date: e.target.value })
                }
                required
              />
            </div>

            <div>
              <Label>Invoice Number</Label>
              <Input
                value={formData.invoice_number}
                onChange={(e) =>
                  setFormData({ ...formData, invoice_number: e.target.value })
                }
                placeholder="Optional"
              />
            </div>
          </div>

          <div>
            <Label>Customer Name *</Label>
            <Input
              value={formData.customer_name}
              onChange={(e) =>
                setFormData({ ...formData, customer_name: e.target.value })
              }
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Quantity Sold *</Label>
              <Input
                type="number"
                min="1"
                value={formData.quantity_sold || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    quantity_sold: parseInt(e.target.value) || 0,
                  })
                }
                required
              />
            </div>

            <div>
              <Label>Price Per Piece *</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.price_per_piece || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    price_per_piece: parseFloat(e.target.value) || 0,
                  })
                }
                required
              />
            </div>
          </div>

          {totalAmount > 0 && (
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground">Total Amount</div>
              <div className="text-2xl font-bold">₹{totalAmount.toFixed(2)}</div>
            </div>
          )}

          <div>
            <Label>Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Any additional notes"
              rows={2}
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
              Record Sale
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
