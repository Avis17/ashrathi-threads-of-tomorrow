import { Card, CardContent } from '@/components/ui/card';
import { Package, Scissors, DollarSign, Scale, Users } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface BatchOverviewSectionProps {
  batch: any;
  rollsData: any[];
  totalCutPieces: number;
  totalCost: number;
  totalProductionPieces?: number;
}

export const BatchOverviewSection = ({ 
  batch, 
  rollsData, 
  totalCutPieces, 
  totalCost,
  totalProductionPieces = 0 
}: BatchOverviewSectionProps) => {
  const totalFabric = batch.total_fabric_received_kg || 0;
  const numberOfTypes = rollsData.length;
  
  // Get unique styles
  const uniqueStyles = new Set(rollsData.map(r => r.style_id)).size;

  // Calculate progress based on cutting and production
  const calculateProgress = () => {
    if (totalCutPieces === 0) return 0;
    const progress = Math.min((totalProductionPieces / totalCutPieces) * 100, 100);
    return Math.round(progress);
  };

  const currentProgress = calculateProgress();

  const stats = [
    {
      title: 'Total Fabric',
      value: `${totalFabric.toFixed(2)} kg`,
      subtitle: `${batch.number_of_rolls} rolls`,
      icon: Scale,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Types/Colors',
      value: numberOfTypes,
      subtitle: `${uniqueStyles} style(s)`,
      icon: Package,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Total Cut Pieces',
      value: totalCutPieces,
      subtitle: `Expected: ${batch.expected_pieces || 'TBD'}`,
      icon: Scissors,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Production Done',
      value: totalProductionPieces,
      subtitle: totalCutPieces > 0 ? `${currentProgress}% of cut` : 'No cut pieces yet',
      icon: Users,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
    {
      title: 'Total Cost',
      value: `₹${totalCost.toFixed(2)}`,
      subtitle: totalProductionPieces > 0 ? `₹${(totalCost / totalProductionPieces).toFixed(2)}/pc` : 'Per piece: TBD',
      icon: DollarSign,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Production Progress</span>
            <span className="text-sm font-bold text-primary">{currentProgress}%</span>
          </div>
          <Progress value={currentProgress} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>Cut: {totalCutPieces} pcs</span>
            <span>Produced: {totalProductionPieces} pcs</span>
            <span>Remaining: {Math.max(0, totalCutPieces - totalProductionPieces)} pcs</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
