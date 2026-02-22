import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Scissors, AlertTriangle, Target, Scale, TrendingUp } from 'lucide-react';

interface CuttingStatsCardsProps {
  totalCutPieces: number;
  totalWastagePieces: number;
  totalFabricWeight: number;
  totalActualWeight: number;
  colorsWithActualWeight: number;
  totalColors: number;
  overallActualCutWastage?: number | null;
  overallActualConfirmedWastage?: number | null;
}

export const CuttingStatsCards = ({
  totalCutPieces,
  totalWastagePieces,
  totalFabricWeight,
  totalActualWeight,
  colorsWithActualWeight,
  totalColors,
  overallActualCutWastage,
  overallActualConfirmedWastage,
}: CuttingStatsCardsProps) => {
  const goodPieces = totalCutPieces - totalWastagePieces;
  const accuracyRate = totalCutPieces > 0 ? ((goodPieces / totalCutPieces) * 100) : 100;
  const wastageRate = totalCutPieces > 0 ? ((totalWastagePieces / totalCutPieces) * 100) : 0;
  const fabricUtilization = totalFabricWeight > 0 && totalActualWeight > 0
    ? ((totalActualWeight / totalFabricWeight) * 100)
    : null;

  const getAccuracyColor = (rate: number) => {
    if (rate >= 97) return 'text-green-600 dark:text-green-400';
    if (rate >= 93) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Scissors className="h-4 w-4 text-blue-500" />
            <span className="text-xs text-muted-foreground font-medium">Total Cut</span>
          </div>
          <div className="text-2xl font-bold">{totalCutPieces}</div>
          <div className="text-xs text-muted-foreground">
            Good: {goodPieces} pcs
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            <span className="text-xs text-muted-foreground font-medium">Wastage</span>
          </div>
          <div className="text-2xl font-bold text-orange-600">{totalWastagePieces}</div>
          <div className="text-xs text-muted-foreground">
            {wastageRate.toFixed(1)}% of total
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-green-500" />
            <span className="text-xs text-muted-foreground font-medium">Accuracy</span>
          </div>
          <div className={`text-2xl font-bold ${getAccuracyColor(accuracyRate)}`}>
            {accuracyRate.toFixed(1)}%
          </div>
          <div className="text-xs text-muted-foreground">
            Yield rate
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Scale className="h-4 w-4 text-purple-500" />
            <span className="text-xs text-muted-foreground font-medium">Fabric Usage</span>
          </div>
          <div className="text-2xl font-bold">
            {fabricUtilization !== null ? `${fabricUtilization.toFixed(1)}%` : 'N/A'}
          </div>
          <div className="text-xs text-muted-foreground">
            {totalFabricWeight.toFixed(2)} kg received
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-orange-600" />
            <span className="text-xs text-muted-foreground font-medium">Actual Cut Wastage</span>
          </div>
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {overallActualCutWastage != null ? `${overallActualCutWastage.toFixed(1)}%` : 'N/A'}
          </div>
          <div className="text-xs text-muted-foreground">
            Avg per piece (cut)
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-red-600" />
            <span className="text-xs text-muted-foreground font-medium">Actual Confirmed Wastage</span>
          </div>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {overallActualConfirmedWastage != null ? `${overallActualConfirmedWastage.toFixed(1)}%` : 'N/A'}
          </div>
          <div className="text-xs text-muted-foreground">
            Avg per piece (confirmed)
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
