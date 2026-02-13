import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Settings, CheckCircle, AlertCircle } from 'lucide-react';
import { useBatchOperationProgress, useUpsertOperationProgress } from '@/hooks/useBatchOperationProgress';
import { useBatchCuttingLogs } from '@/hooks/useBatchCuttingLogs';

interface BatchProductionSectionProps {
  batchId: string;
  operations?: string[];
}

export const BatchProductionSection = ({ batchId, operations = [] }: BatchProductionSectionProps) => {
  const { data: progressData = [] } = useBatchOperationProgress(batchId);
  const { data: cuttingLogs = [] } = useBatchCuttingLogs(batchId);
  const upsertMutation = useUpsertOperationProgress();
  const [editingOp, setEditingOp] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  // Total cut pieces
  const totalCutPieces = cuttingLogs.reduce((sum, log) => sum + log.pieces_cut, 0);

  // Map progress by operation
  const progressMap: Record<string, number> = {};
  progressData.forEach(p => {
    progressMap[p.operation] = p.completed_pieces;
  });

  // Calculate per-operation progress
  const getOpProgress = (op: string) => {
    const completed = progressMap[op] || 0;
    if (totalCutPieces === 0) return 0;
    return Math.min(Math.round((completed / totalCutPieces) * 100), 100);
  };

  // Overall progress = average of all operation progresses
  const overallProgress = operations.length > 0
    ? Math.round(operations.reduce((sum, op) => sum + getOpProgress(op), 0) / operations.length)
    : 0;

  const totalCompletedAcrossOps = operations.reduce((sum, op) => sum + (progressMap[op] || 0), 0);

  const handleSave = async (operation: string) => {
    const value = parseInt(editValue) || 0;
    if (value > totalCutPieces) {
      return; // Don't allow more than cut pieces
    }
    await upsertMutation.mutateAsync({
      batchId,
      operation,
      completedPieces: value,
    });
    setEditingOp(null);
    setEditValue('');
  };

  const getStatusColor = (percent: number) => {
    if (percent >= 100) return 'text-green-600';
    if (percent >= 50) return 'text-yellow-600';
    return 'text-muted-foreground';
  };

  const getProgressColor = (percent: number) => {
    if (percent >= 100) return 'bg-green-500';
    if (percent >= 50) return 'bg-yellow-500';
    return 'bg-primary';
  };

  if (operations.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No operations configured for this batch.</p>
          <p className="text-sm text-muted-foreground mt-1">
            Edit batch details to add operations like Cutting, Stitching, Checking, etc.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-200">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Total Cut Pieces</div>
            <div className="text-2xl font-bold text-blue-600">{totalCutPieces}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-200">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Overall Progress</div>
            <div className="text-2xl font-bold text-green-600">{overallProgress}%</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-200">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Operations</div>
            <div className="text-2xl font-bold text-purple-600">
              {operations.filter(op => getOpProgress(op) >= 100).length}/{operations.length}
              <span className="text-sm font-normal ml-1">done</span>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-200">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Bottleneck</div>
            <div className="text-lg font-bold text-orange-600 truncate">
              {operations.length > 0
                ? operations.reduce((min, op) => getOpProgress(op) < getOpProgress(min) ? op : min, operations[0])
                : 'N/A'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overall Progress Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Batch Progress</span>
            <span className={`text-sm font-bold ${getStatusColor(overallProgress)}`}>{overallProgress}%</span>
          </div>
          <div className="relative h-4 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className={`h-full transition-all duration-500 rounded-full ${getProgressColor(overallProgress)}`}
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Operation-wise Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Operation Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {operations.map((op) => {
            const completed = progressMap[op] || 0;
            const percent = getOpProgress(op);
            const isEditing = editingOp === op;

            return (
              <div key={op} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {percent >= 100 ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <div className={`h-5 w-5 rounded-full border-2 ${percent > 0 ? 'border-yellow-500' : 'border-muted-foreground'}`} />
                    )}
                    <span className="font-medium">{op}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={percent >= 100 ? 'default' : 'outline'}>
                      {completed} / {totalCutPieces} pcs
                    </Badge>
                    <span className={`text-sm font-bold ${getStatusColor(percent)}`}>{percent}%</span>
                  </div>
                </div>

                <div className="relative h-3 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${getProgressColor(percent)}`}
                    style={{ width: `${percent}%` }}
                  />
                </div>

                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={0}
                      max={totalCutPieces}
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      placeholder={`Max: ${totalCutPieces}`}
                      className="w-40 h-8"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSave(op);
                        if (e.key === 'Escape') setEditingOp(null);
                      }}
                    />
                    <Button size="sm" variant="default" className="h-8" onClick={() => handleSave(op)} disabled={upsertMutation.isPending}>
                      Save
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8" onClick={() => setEditingOp(null)}>
                      Cancel
                    </Button>
                    {parseInt(editValue) > totalCutPieces && (
                      <span className="text-xs text-destructive">Cannot exceed {totalCutPieces}</span>
                    )}
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    onClick={() => {
                      setEditingOp(op);
                      setEditValue(completed.toString());
                    }}
                  >
                    Update Count
                  </Button>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};
