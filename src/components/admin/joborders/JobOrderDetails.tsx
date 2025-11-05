import { useState } from "react";
import { useJobOrderDetails, useUpdateJobOrder } from "@/hooks/useJobOrders";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Calendar, Package, User, Phone, FileText, Printer } from "lucide-react";
import { format } from "date-fns";
import { ProcessesTable } from "./ProcessesTable";
import { LaboursTable } from "./LaboursTable";
import { CostSummary } from "./CostSummary";
import { formatCurrency } from "@/lib/utils";

interface JobOrderDetailsProps {
  jobOrderId: string;
  onBack: () => void;
}

export const JobOrderDetails = ({ jobOrderId, onBack }: JobOrderDetailsProps) => {
  const { data: details, isLoading } = useJobOrderDetails(jobOrderId);
  const updateJobOrder = useUpdateJobOrder();

  if (isLoading || !details) {
    return <div className="p-8 text-center">Loading job order details...</div>;
  }

  const { order, processes, labours, costs } = details;

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      planned: { label: "Planned", variant: "secondary" as const },
      in_progress: { label: "In Progress", variant: "default" as const },
      completed: { label: "Completed", variant: "outline" as const },
      delivered: { label: "Delivered", variant: "outline" as const },
      cancelled: { label: "Cancelled", variant: "destructive" as const },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.planned;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const markAsCompleted = () => {
    updateJobOrder.mutate({ id: jobOrderId, status: "completed" });
  };

  const markAsDelivered = () => {
    updateJobOrder.mutate({ id: jobOrderId, status: "delivered" });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to List
          </Button>
          <h2 className="text-2xl font-bold">{order.id}</h2>
          <p className="text-muted-foreground">{order.product_name}</p>
        </div>
        <div className="flex gap-2">
          {order.status === "in_progress" && (
            <Button onClick={markAsCompleted}>Mark as Completed</Button>
          )}
          {order.status === "completed" && (
            <Button onClick={markAsDelivered}>Mark as Delivered</Button>
          )}
          <Button variant="outline">
            <Printer className="mr-2 h-4 w-4" />
            Print Job Sheet
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="space-y-1">
              <div className="flex items-center text-sm text-muted-foreground">
                <User className="mr-2 h-4 w-4" />
                Client
              </div>
              <div className="font-medium">{order.client_company}</div>
              <div className="text-sm text-muted-foreground">{order.contact_person}</div>
              {order.contact_number && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Phone className="mr-1 h-3 w-3" />
                  {order.contact_number}
                </div>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center text-sm text-muted-foreground">
                <Package className="mr-2 h-4 w-4" />
                Order Details
              </div>
              <div className="font-medium">{order.total_pieces} pieces</div>
              <div className="text-sm text-muted-foreground">{order.job_type}</div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="mr-2 h-4 w-4" />
                Timeline
              </div>
              <div className="text-sm">
                <div>Start: {format(new Date(order.start_date), "MMM dd, yyyy")}</div>
                <div>Due: {format(new Date(order.delivery_date), "MMM dd, yyyy")}</div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Status & Progress</div>
              <div className="flex items-center gap-2">
                {getStatusBadge(order.status)}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Progress value={order.overall_progress} className="flex-1" />
                <span className="text-sm font-medium">{Math.round(order.overall_progress)}%</span>
              </div>
            </div>
          </div>

          {order.remarks && (
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <div className="flex items-center text-sm font-medium mb-2">
                <FileText className="mr-2 h-4 w-4" />
                Remarks
              </div>
              <p className="text-sm text-muted-foreground">{order.remarks}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <ProcessesTable jobOrderId={jobOrderId} processes={processes} />

      <LaboursTable jobOrderId={jobOrderId} labours={labours} processes={processes} />

      <CostSummary jobOrderId={jobOrderId} costs={costs} />
    </div>
  );
};
