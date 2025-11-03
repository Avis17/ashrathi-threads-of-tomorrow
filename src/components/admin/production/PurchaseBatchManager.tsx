import { useState } from "react";
import { Plus, Trash2, Eye, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { usePurchaseBatches, useDeletePurchaseBatch } from "@/hooks/usePurchaseBatches";
import { PurchaseBatchForm } from "./PurchaseBatchForm";
import { PurchaseBatchDetails } from "./PurchaseBatchDetails";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { format } from "date-fns";

export const PurchaseBatchManager = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const { data: batches, isLoading } = usePurchaseBatches();
  const deleteMutation = useDeletePurchaseBatch();

  const handleDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
      setDeleteId(null);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (selectedBatchId) {
    return <PurchaseBatchDetails batchId={selectedBatchId} onClose={() => setSelectedBatchId(null)} />;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Purchase Batches</CardTitle>
              <CardDescription>
                Manage material purchase batches with multiple materials and colors
              </CardDescription>
            </div>
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Purchase Batch
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Batch Code</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Subtotal</TableHead>
                <TableHead>Transport</TableHead>
                <TableHead>Loading</TableHead>
                <TableHead>Other</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {batches?.map((batch) => (
                <TableRow key={batch.id}>
                  <TableCell className="font-medium">{batch.batch_code}</TableCell>
                  <TableCell>{format(new Date(batch.purchase_date), "dd MMM yyyy")}</TableCell>
                  <TableCell>{batch.supplier_name}</TableCell>
                  <TableCell>₹{batch.subtotal.toFixed(2)}</TableCell>
                  <TableCell>₹{batch.transport_cost.toFixed(2)}</TableCell>
                  <TableCell>₹{batch.loading_cost.toFixed(2)}</TableCell>
                  <TableCell>₹{batch.other_costs.toFixed(2)}</TableCell>
                  <TableCell className="font-bold">₹{batch.total_cost.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={batch.payment_status === "paid" ? "default" : "secondary"}>
                      {batch.payment_status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedBatchId(batch.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(batch.id)}
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

      <PurchaseBatchForm open={isFormOpen} onOpenChange={setIsFormOpen} />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Purchase Batch</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this purchase batch? This action cannot be undone.
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
