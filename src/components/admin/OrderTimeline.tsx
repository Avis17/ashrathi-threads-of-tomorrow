import { format } from "date-fns";
import { CheckCircle, Clock, Package, Truck, XCircle } from "lucide-react";

interface OrderTimelineProps {
  order: {
    status: string;
    created_at: string;
    confirmed_at?: string | null;
    shipped_at?: string | null;
    delivered_at?: string | null;
    cancelled_at?: string | null;
  };
}

export function OrderTimeline({ order }: OrderTimelineProps) {
  const steps = [
    { key: "pending", label: "Order Placed", icon: Clock, date: order.created_at },
    { key: "confirmed", label: "Confirmed", icon: CheckCircle, date: order.confirmed_at },
    { key: "processing", label: "Processing", icon: Package, date: null },
    { key: "shipped", label: "Shipped", icon: Truck, date: order.shipped_at },
    { key: "delivered", label: "Delivered", icon: CheckCircle, date: order.delivered_at },
  ];

  const statusOrder = ["pending", "confirmed", "processing", "shipped", "delivered"];
  const currentIndex = statusOrder.indexOf(order.status);

  if (order.status === "cancelled") {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-destructive">
          <XCircle className="h-5 w-5" />
          <span className="font-medium">Order Cancelled</span>
          {order.cancelled_at && (
            <span className="text-sm text-muted-foreground">
              on {format(new Date(order.cancelled_at), "MMM dd, yyyy 'at' h:mm a")}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        Order placed on {format(new Date(order.created_at), "MMM dd, yyyy 'at' h:mm a")}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {steps.map((step, index) => {
          const isCompleted = index <= currentIndex;
          const Icon = step.icon;
          return (
            <div key={step.key} className="flex items-center">
              <div className={`flex items-center gap-1 ${isCompleted ? "text-primary" : "text-muted-foreground"}`}>
                <Icon className="h-4 w-4" />
                <span className="text-xs">{step.label}</span>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-8 h-0.5 mx-2 ${index < currentIndex ? "bg-primary" : "bg-muted"}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
