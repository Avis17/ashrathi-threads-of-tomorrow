import { useState } from "react";
import { useJobOrders, useDeleteJobOrder } from "@/hooks/useJobOrders";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, Eye, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Card } from "@/components/ui/card";

interface JobOrdersManagerProps {
  onCreateNew: () => void;
  onEdit: (id: string) => void;
  onView: (id: string) => void;
}

export const JobOrdersManager = ({ onCreateNew, onEdit, onView }: JobOrdersManagerProps) => {
  const { data: jobOrders, isLoading } = useJobOrders();
  const deleteJobOrder = useDeleteJobOrder();

  const getStatusBadge = (status: string) => {
    const colorClasses: Record<string, string> = {
      planned: "bg-gray-500 text-white hover:bg-gray-600",
      in_progress: "bg-blue-500 text-white hover:bg-blue-600",
      completed: "bg-green-500 text-white hover:bg-green-600",
      delivered: "bg-emerald-500 text-white hover:bg-emerald-600",
      cancelled: "bg-red-500 text-white hover:bg-red-600",
    };
    const labels: Record<string, string> = {
      planned: "Planned",
      in_progress: "In Progress",
      completed: "Completed",
      delivered: "Delivered",
      cancelled: "Cancelled",
    };
    return <Badge className={colorClasses[status] || "bg-gray-500 text-white"}>{labels[status] || status}</Badge>;
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading job orders...</div>;
  }

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Job Orders</h2>
          <p className="text-muted-foreground">Manage external job work orders</p>
        </div>
        <Button onClick={onCreateNew}>
          <Plus className="mr-2 h-4 w-4" />
          Create Job Order
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Job ID</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Delivery</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobOrders?.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{order.client_company}</div>
                    <div className="text-sm text-muted-foreground">{order.contact_person}</div>
                  </div>
                </TableCell>
                <TableCell>{order.product_name}</TableCell>
                <TableCell>{order.total_pieces}</TableCell>
                <TableCell className="text-sm">{order.job_type}</TableCell>
                <TableCell>{format(new Date(order.delivery_date), "MMM dd, yyyy")}</TableCell>
                <TableCell>{getStatusBadge(order.status)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 min-w-[120px]">
                    <Progress value={order.overall_progress} className="flex-1" />
                    <span className="text-sm text-muted-foreground">{Math.round(order.overall_progress)}%</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => onView(order.id)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onEdit(order.id)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Job Order?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete {order.id} and all associated data.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteJobOrder.mutate(order.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {(!jobOrders || jobOrders.length === 0) && (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                  No job orders found. Create your first job order to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};
