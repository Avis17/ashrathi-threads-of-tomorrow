import { Card, CardContent } from '@/components/ui/card';
import { Package, TrendingUp, AlertTriangle, XCircle, Layers, Activity } from 'lucide-react';
import { useStockSummary } from '@/hooks/useStockInventory';
import { Skeleton } from '@/components/ui/skeleton';

export const StockOverviewCards = () => {
  const { data: stockSummary, isLoading } = useStockSummary();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const totalProducts = stockSummary?.length || 0;
  const totalAvailable = stockSummary?.reduce((sum, p) => sum + p.total_available, 0) || 0;
  const lowStockCount = stockSummary?.filter(p => p.stock_status === 'low_stock').length || 0;
  const outOfStockCount = stockSummary?.filter(p => p.stock_status === 'out_of_stock').length || 0;
  const totalBatches = stockSummary?.reduce((sum, p) => sum + p.batch_count, 0) || 0;
  const avgStockLevel = totalProducts > 0 ? Math.round(totalAvailable / totalProducts) : 0;

  const cards = [
    {
      title: 'Total Products',
      value: totalProducts,
      icon: Package,
      gradient: 'from-blue-500 to-cyan-500',
      textColor: 'text-blue-600',
    },
    {
      title: 'Total Available Units',
      value: totalAvailable.toLocaleString(),
      icon: TrendingUp,
      gradient: 'from-emerald-500 to-teal-500',
      textColor: 'text-emerald-600',
    },
    {
      title: 'Low Stock Alerts',
      value: lowStockCount,
      icon: AlertTriangle,
      gradient: 'from-amber-500 to-orange-500',
      textColor: 'text-amber-600',
      badge: lowStockCount > 0,
    },
    {
      title: 'Out of Stock',
      value: outOfStockCount,
      icon: XCircle,
      gradient: 'from-red-500 to-rose-500',
      textColor: 'text-red-600',
      badge: outOfStockCount > 0,
    },
    {
      title: 'Active Batches',
      value: totalBatches,
      icon: Layers,
      gradient: 'from-purple-500 to-pink-500',
      textColor: 'text-purple-600',
    },
    {
      title: 'Avg. Stock Level',
      value: avgStockLevel,
      icon: Activity,
      gradient: 'from-indigo-500 to-blue-500',
      textColor: 'text-indigo-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card, index) => (
        <Card
          key={index}
          className="relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-5`} />
          <CardContent className="p-6 relative">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground font-medium">{card.title}</p>
                <p className={`text-3xl font-bold ${card.textColor}`}>
                  {card.value}
                </p>
              </div>
              <div className={`p-3 rounded-xl bg-gradient-to-br ${card.gradient} shadow-lg`}>
                <card.icon className="h-6 w-6 text-white" />
              </div>
            </div>
            {card.badge && Number(card.value) > 0 && (
              <div className="mt-3 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium animate-pulse">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-600" />
                  Requires Attention
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
