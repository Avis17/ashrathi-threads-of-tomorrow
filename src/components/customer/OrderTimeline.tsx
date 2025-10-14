import { format } from 'date-fns';
import { CheckCircle2, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

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

export const OrderTimeline = ({ order }: OrderTimelineProps) => {
  const steps = [
    { key: 'pending', label: 'Order Placed', timestamp: order.created_at },
    { key: 'confirmed', label: 'Confirmed', timestamp: order.confirmed_at },
    { key: 'processing', label: 'Processing', timestamp: null },
    { key: 'shipped', label: 'Shipped', timestamp: order.shipped_at },
    { key: 'delivered', label: 'Delivered', timestamp: order.delivered_at },
  ];

  if (order.status === 'cancelled') {
    return (
      <div className="space-y-4">
        <div className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className="rounded-full bg-red-500 p-1">
              <Circle className="h-3 w-3 text-white" />
            </div>
            <div className="w-px h-full bg-border" />
          </div>
          <div className="pb-4 flex-1">
            <p className="font-medium text-red-600">Order Cancelled</p>
            {order.cancelled_at && (
              <p className="text-xs text-muted-foreground mt-1">
                {format(new Date(order.cancelled_at), 'PPp')}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  const currentStepIndex = steps.findIndex((step) => step.key === order.status);

  return (
    <div className="space-y-4">
      {steps.map((step, index) => {
        const isCompleted = index <= currentStepIndex;
        const isCurrent = index === currentStepIndex;

        return (
          <div key={step.key} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'rounded-full p-1',
                  isCompleted ? 'bg-primary' : 'bg-muted'
                )}
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-3 w-3 text-white" />
                ) : (
                  <Circle className="h-3 w-3 text-muted-foreground" />
                )}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'w-px h-full',
                    isCompleted ? 'bg-primary' : 'bg-border'
                  )}
                />
              )}
            </div>
            <div className="pb-4 flex-1">
              <p
                className={cn(
                  'font-medium',
                  isCompleted ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                {step.label}
              </p>
              {step.timestamp && (
                <p className="text-xs text-muted-foreground mt-1">
                  {format(new Date(step.timestamp), 'PPp')}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
