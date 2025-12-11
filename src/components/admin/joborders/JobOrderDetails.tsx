import { useState, useEffect } from "react";
import { useJobOrderDetails, useUpdateJobOrder } from "@/hooks/useJobOrders";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Calendar, Package, User, Phone, FileText, Printer, Receipt } from "lucide-react";
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
  
  const [gstEnabled, setGstEnabled] = useState(false);
  const [gstPercentage, setGstPercentage] = useState<number>(0);

  useEffect(() => {
    if (details?.order) {
      setGstEnabled((details.order.gst_percentage || 0) > 0);
      setGstPercentage(details.order.gst_percentage || 0);
    }
  }, [details?.order]);

  if (isLoading || !details) {
    return <div className="p-8 text-center">Loading job order details...</div>;
  }

  const { order, processes, labours, costs } = details;

  const baseTotal = costs?.total_cost || 0;
  const gstAmount = gstEnabled ? (baseTotal * gstPercentage) / 100 : 0;
  const totalWithGst = baseTotal + gstAmount;

  const handleGstUpdate = () => {
    updateJobOrder.mutate({
      id: jobOrderId,
      gst_percentage: gstEnabled ? gstPercentage : 0,
      gst_amount: gstAmount,
      total_with_gst: totalWithGst,
    });
  };

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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Total Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Base Total (Costs):</span>
            <span className="font-medium">{formatCurrency(baseTotal)}</span>
          </div>
          {order.gst_percentage > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">GST ({order.gst_percentage}%):</span>
              <span className="font-medium">{formatCurrency(order.gst_amount)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold pt-2 border-t">
            <span>Final Total Amount:</span>
            <span className="text-primary">
              {formatCurrency(order.gst_percentage > 0 ? order.total_with_gst : baseTotal)}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            GST Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="gst-enabled"
              checked={gstEnabled}
              onCheckedChange={(checked) => setGstEnabled(!!checked)}
            />
            <Label htmlFor="gst-enabled" className="cursor-pointer">
              Apply GST
            </Label>
          </div>

          {gstEnabled && (
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="gst-percentage">GST Percentage (%)</Label>
                <Input
                  id="gst-percentage"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={gstPercentage}
                  onChange={(e) => setGstPercentage(parseFloat(e.target.value) || 0)}
                  placeholder="Enter GST percentage"
                />
              </div>
              <Button onClick={handleGstUpdate} className="w-full">
                {order.gst_percentage > 0 ? 'Update GST' : 'Add GST'}
              </Button>
            </div>
          )}

          {!gstEnabled && order.gst_percentage > 0 && (
            <Button onClick={handleGstUpdate} variant="outline" className="w-full">
              Remove GST
            </Button>
          )}

          <div className="space-y-3 pt-4 border-t">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Base Total:</span>
              <span className="font-medium">{formatCurrency(baseTotal)}</span>
            </div>
            {gstEnabled && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">GST ({gstPercentage}%):</span>
                <span className="font-medium">{formatCurrency(gstAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold pt-2 border-t">
              <span>Final Total:</span>
              <span className="text-primary">{formatCurrency(totalWithGst)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
