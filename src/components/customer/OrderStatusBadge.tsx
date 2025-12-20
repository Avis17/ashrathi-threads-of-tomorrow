import { Badge } from '@/components/ui/badge';

const statusConfig: Record<string, { color: string; label: string }> = {
  pending: { 
    color: 'bg-amber-500 text-white hover:bg-amber-600', 
    label: 'Confirmation Pending' 
  },
  payment_pending: { 
    color: 'bg-orange-500 text-white hover:bg-orange-600', 
    label: 'Payment Pending' 
  },
  confirmed: { 
    color: 'bg-blue-500 text-white hover:bg-blue-600', 
    label: 'Confirmed' 
  },
  processing: { 
    color: 'bg-purple-500 text-white hover:bg-purple-600', 
    label: 'Processing' 
  },
  shipped: { 
    color: 'bg-indigo-500 text-white hover:bg-indigo-600', 
    label: 'Shipped' 
  },
  delivered: { 
    color: 'bg-green-500 text-white hover:bg-green-600', 
    label: 'Delivered' 
  },
  cancelled: { 
    color: 'bg-red-500 text-white hover:bg-red-600', 
    label: 'Cancelled' 
  },
};

interface OrderStatusBadgeProps {
  status: string;
}

export const OrderStatusBadge = ({ status }: OrderStatusBadgeProps) => {
  const config = statusConfig[status] || statusConfig.pending;

  return (
    <Badge className={config.color}>
      {config.label}
    </Badge>
  );
};
