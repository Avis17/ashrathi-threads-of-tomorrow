import { Card, CardContent } from '@/components/ui/card';
import { Package, Scissors, DollarSign, Scale } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface BatchOverviewSectionProps {
  batch: any;
  rollsData: any[];
  totalCutPieces: number;
  totalCost: number;
}

export const BatchOverviewSection = ({ batch, rollsData, totalCutPieces, totalCost }: BatchOverviewSectionProps) => {
  const totalFabric = batch.total_fabric_received_kg || 0;
  const numberOfTypes = rollsData.length;
  
  // Get unique styles
  const uniqueStyles = new Set(rollsData.map(r => r.style_id)).size;

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
      title: 'Total Cost',
      value: `₹${totalCost.toFixed(2)}`,
      subtitle: batch.final_quantity > 0 ? `₹${(totalCost / batch.final_quantity).toFixed(2)}/pc` : 'Per piece: TBD',
      icon: DollarSign,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm font-bold text-primary">{batch.overall_progress || 0}%</span>
          </div>
          <Progress value={batch.overall_progress || 0} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>Cutting</span>
            <span>Stitching</span>
            <span>Checking</span>
            <span>Packing</span>
            <span>Done</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
