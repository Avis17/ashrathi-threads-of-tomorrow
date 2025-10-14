import { Badge } from '@/components/ui/badge';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  processing: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  shipped: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  delivered: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

interface OrderStatusBadgeProps {
  status: string;
}

export const OrderStatusBadge = ({ status }: OrderStatusBadgeProps) => {
  const colorClass = statusColors[status as keyof typeof statusColors] || statusColors.pending;

  return (
    <Badge className={colorClass} variant="secondary">
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};
