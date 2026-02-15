import { Card, CardContent } from '@/components/ui/card';
import { Package, Scissors, DollarSign, Scale, Users } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface CostBreakdown {
  salaryTotal: number;
  expenseTotal: number;
}

interface BatchOverviewSectionProps {
  batch: any;
  rollsData: any[];
  totalCutPieces: number;
  totalCost: number;
  totalProductionPieces?: number;
  costBreakdown?: CostBreakdown;
}

export const BatchOverviewSection = ({ 
  batch, 
  rollsData, 
  totalCutPieces, 
  totalCost,
  totalProductionPieces = 0,
  costBreakdown,
}: BatchOverviewSectionProps) => {
  const [costOpen, setCostOpen] = useState(false);
  const totalFabric = batch.total_fabric_received_kg || 0;
  const numberOfTypes = rollsData.length;
  const uniqueStyles = new Set(rollsData.map(r => r.style_id)).size;

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

        {/* Total Cost Card with breakdown */}
        <Card>
          <CardContent className="p-4">
            <Collapsible open={costOpen} onOpenChange={setCostOpen}>
              <CollapsibleTrigger className="w-full">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/10">
                    <DollarSign className="h-5 w-5 text-amber-500" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      Total Cost
                      <ChevronDown className={`h-3 w-3 transition-transform ${costOpen ? 'rotate-180' : ''}`} />
                    </p>
                    <p className="text-xl font-bold">₹{totalCost.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">
                      {totalProductionPieces > 0 ? `₹${(totalCost / totalProductionPieces).toFixed(2)}/pc` : 'Per piece: TBD'}
                    </p>
                  </div>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                {costBreakdown && (
                  <div className="mt-3 pt-3 border-t space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Salary</span>
                      <span className="font-medium">₹{costBreakdown.salaryTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Expenses</span>
                      <span className="font-medium">₹{costBreakdown.expenseTotal.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>
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
