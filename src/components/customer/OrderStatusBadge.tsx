import { Badge } from '@/components/ui/badge';

const statusColors: Record<string, string> = {
  pending: 'bg-amber-500 text-white hover:bg-amber-600',
  confirmed: 'bg-blue-500 text-white hover:bg-blue-600',
  processing: 'bg-purple-500 text-white hover:bg-purple-600',
  shipped: 'bg-indigo-500 text-white hover:bg-indigo-600',
  delivered: 'bg-green-500 text-white hover:bg-green-600',
  cancelled: 'bg-red-500 text-white hover:bg-red-600',
};

interface OrderStatusBadgeProps {
  status: string;
}

export const OrderStatusBadge = ({ status }: OrderStatusBadgeProps) => {
  const colorClass = statusColors[status as keyof typeof statusColors] || statusColors.pending;

  return (
    <Badge className={colorClass}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};
