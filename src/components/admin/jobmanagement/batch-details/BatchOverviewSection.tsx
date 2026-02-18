import { Card, CardContent } from '@/components/ui/card';
import { Package, Scissors, DollarSign, Scale, Users } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface CostBreakdown {
  salaryTotal: number;
  expenseTotal: number;
  jobWorkTotal?: number;
}

interface BatchOverviewSectionProps {
  batch: any;
  rollsData: any[];
  totalCutPieces: number;
  totalCost: number;
  totalProductionPieces?: number;
  costBreakdown?: CostBreakdown;
  styleLookup?: Record<string, string>;
}

export const BatchOverviewSection = ({ 
  batch, 
  rollsData, 
  totalCutPieces, 
  totalCost,
  totalProductionPieces = 0,
  costBreakdown,
  styleLookup = {},
}: BatchOverviewSectionProps) => {
  const [costOpen, setCostOpen] = useState(false);
  const [fabricOpen, setFabricOpen] = useState(false);
  const totalFabric = batch.total_fabric_received_kg || 0;
  const numberOfTypes = rollsData.length;
  const uniqueStyles = new Set(rollsData.map(r => r.style_id)).size;

  // Group rollsData by style_id for style-wise fabric breakdown
  const styleWiseFabric = (() => {
    const groups: Record<string, { styleName: string; rolls: number; weight: number }> = {};
    rollsData.forEach((r: any) => {
      const key = r.style_id || 'unknown';
      const styleName = styleLookup[key] || r.style_name || `Style ${key.slice(0, 6)}`;
      if (!groups[key]) groups[key] = { styleName, rolls: 0, weight: 0 };
      const rolls = Number(r.number_of_rolls) || 0;
      const weight = Number(r.weight) || 0;
      groups[key].rolls += rolls;
      groups[key].weight += rolls * weight;
    });
    return Object.values(groups);
  })();

  const calculateProgress = () => {
    if (totalCutPieces === 0) return 0;
    const progress = Math.min((totalProductionPieces / totalCutPieces) * 100, 100);
    return Math.round(progress);
  };

  const currentProgress = calculateProgress();

  const stats = [
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

        {/* Total Fabric Card with style-wise breakdown */}
        <Card>
          <CardContent className="p-4">
            <Collapsible open={fabricOpen} onOpenChange={setFabricOpen}>
              <CollapsibleTrigger className="w-full">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Scale className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      Total Fabric
                      <ChevronDown className={`h-3 w-3 transition-transform ${fabricOpen ? 'rotate-180' : ''}`} />
                    </p>
                    <p className="text-xl font-bold">{totalFabric.toFixed(2)} kg</p>
                    <p className="text-xs text-muted-foreground">{batch.number_of_rolls} rolls</p>
                  </div>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-3 pt-3 border-t space-y-1.5 text-xs">
                  {styleWiseFabric.map((s, i) => (
                    <div key={i} className="flex justify-between items-start gap-2">
                      <span className="text-muted-foreground truncate">{s.styleName}</span>
                      <div className="text-right shrink-0">
                        <span className="font-medium">{s.weight.toFixed(2)} kg</span>
                        <span className="text-muted-foreground ml-1">({s.rolls} rolls)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>

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
                    {(costBreakdown.jobWorkTotal ?? 0) > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Job Work</span>
                        <span className="font-medium">₹{costBreakdown.jobWorkTotal!.toFixed(2)}</span>
                      </div>
                    )}
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
