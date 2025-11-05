import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { JobOrderLabour, JobOrderProcess, useAddJobOrderLabour, useUpdateLabourPayment } from "@/hooks/useJobOrders";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";

interface LaboursTableProps {
  jobOrderId: string;
  labours: JobOrderLabour[];
  processes: JobOrderProcess[];
}

export const LaboursTable = ({ jobOrderId, labours, processes }: LaboursTableProps) => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [paymentLabour, setPaymentLabour] = useState<JobOrderLabour | null>(null);
  const addLabour = useAddJobOrderLabour();
  const updatePayment = useUpdateLabourPayment();

  const { register, handleSubmit, setValue, reset } = useForm();

  const onSubmit = (data: any) => {
    addLabour.mutate(
      { job_order_id: jobOrderId, ...data },
      {
        onSuccess: () => {
          setShowAddDialog(false);
          reset();
        },
      }
    );
  };

  const onPaymentSubmit = (data: any) => {
    if (!paymentLabour) return;
    updatePayment.mutate(
      {
        id: paymentLabour.id,
        paid_amount: data.paid_amount,
        payment_status: data.payment_status,
        payment_date: data.payment_date,
      },
      {
        onSuccess: () => {
          setPaymentLabour(null);
          reset();
        },
      }
    );
  };

  const getPaymentBadge = (status: string) => {
    const config = {
      pending: { label: "Pending", variant: "secondary" as const },
      partial: { label: "Partial", variant: "default" as const },
      paid: { label: "Paid", variant: "outline" as const },
    };
    return <Badge variant={config[status as keyof typeof config]?.variant}>{config[status as keyof typeof config]?.label}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Labour Details</CardTitle>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Labour
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Labour</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input {...register("name")} placeholder="Worker name" />
                  </div>
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Input {...register("role")} placeholder="e.g., Tailor" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Process Assigned</Label>
                  <Select onValueChange={(value) => setValue("process_assigned", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select process" />
                    </SelectTrigger>
                    <SelectContent>
                      {processes.map((process) => (
                        <SelectItem key={process.id} value={process.process_name}>
                          {process.process_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Rate per Piece (₹)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      {...register("rate_per_piece", { valueAsNumber: true })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Total Pieces</Label>
                    <Input
                      type="number"
                      {...register("total_pieces", { valueAsNumber: true })}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Add Labour</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={!!paymentLabour} onOpenChange={(open) => !open && setPaymentLabour(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Update Payment - {paymentLabour?.name}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onPaymentSubmit)} className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground">Total Amount</div>
                  <div className="text-2xl font-bold">{paymentLabour && formatCurrency(paymentLabour.total_amount)}</div>
                </div>

                <div className="space-y-2">
                  <Label>Paid Amount (₹)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    defaultValue={paymentLabour?.paid_amount}
                    {...register("paid_amount", { valueAsNumber: true })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Payment Status</Label>
                  <Select
                    defaultValue={paymentLabour?.payment_status}
                    onValueChange={(value) => setValue("payment_status", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="partial">Partial</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Payment Date</Label>
                  <Input
                    type="date"
                    defaultValue={paymentLabour?.payment_date || undefined}
                    {...register("payment_date")}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setPaymentLabour(null)}>
                    Cancel
                  </Button>
                  <Button type="submit">Update Payment</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Process</TableHead>
              <TableHead>Rate/Piece</TableHead>
              <TableHead>Pieces</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead>Paid</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {labours.map((labour) => (
              <TableRow key={labour.id}>
                <TableCell className="font-medium">{labour.name}</TableCell>
                <TableCell>{labour.role}</TableCell>
                <TableCell>{labour.process_assigned}</TableCell>
                <TableCell>{formatCurrency(labour.rate_per_piece)}</TableCell>
                <TableCell>{labour.total_pieces}</TableCell>
                <TableCell>{formatCurrency(labour.total_amount)}</TableCell>
                <TableCell>{formatCurrency(labour.paid_amount)}</TableCell>
                <TableCell>{getPaymentBadge(labour.payment_status)}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" onClick={() => setPaymentLabour(labour)}>
                    Pay
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {labours.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground py-4">
                  No labours added yet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
