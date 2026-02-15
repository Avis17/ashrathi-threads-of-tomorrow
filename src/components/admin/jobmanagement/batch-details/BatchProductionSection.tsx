import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { CheckCircle, AlertCircle, ChevronDown, ChevronRight, Briefcase } from 'lucide-react';
import { useBatchOperationProgress, useUpsertOperationProgress } from '@/hooks/useBatchOperationProgress';
import { useBatchJobWorks } from '@/hooks/useJobWorks';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface BatchProductionSectionProps {
  batchId: string;
  operations?: string[];
  rollsData?: any[];
  cuttingSummary?: Record<number, number>;
}

export const BatchProductionSection = ({ batchId, operations = [], rollsData = [], cuttingSummary = {} }: BatchProductionSectionProps) => {
  const { data: progressData = [] } = useBatchOperationProgress(batchId);
  const { data: jobWorks = [] } = useBatchJobWorks(batchId);
  const upsertMutation = useUpsertOperationProgress();
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [allExpanded, setAllExpanded] = useState(true);
  const [openTypes, setOpenTypes] = useState<Record<number, boolean>>({});

  // Build a map of type_index -> company names from job works
  const jobWorkByType: Record<number, string[]> = {};
  jobWorks.forEach(jw => {
    const variations = (jw.variations || []) as Array<{ type_index: number }>;
    const indices = variations.length > 0
      ? variations.map(v => v.type_index)
      : [jw.type_index];
    indices.forEach(idx => {
      if (!jobWorkByType[idx]) jobWorkByType[idx] = [];
      if (!jobWorkByType[idx].includes(jw.company_name)) {
        jobWorkByType[idx].push(jw.company_name);
      }
    });
  });

  // Build progress map: key = `${typeIndex}-${operation}`
  const progressMap: Record<string, number> = {};
  progressData.forEach(p => {
    progressMap[`${p.type_index}-${p.operation}`] = p.completed_pieces;
  });

  // Get operations for a specific type (falls back to global operations)
  const getTypeOperations = (typeIndex: number): string[] => {
    const typeOps = rollsData[typeIndex]?.operations;
    if (Array.isArray(typeOps) && typeOps.length > 0) return typeOps;
    return operations;
  };

  const getOpProgress = (typeIndex: number, op: string, typeCutPieces: number) => {
    const completed = progressMap[`${typeIndex}-${op}`] || 0;
    if (typeCutPieces === 0) return 0;
    return Math.min(Math.round((completed / typeCutPieces) * 100), 100);
  };

  const getTypeOverallProgress = (typeIndex: number, typeCutPieces: number) => {
    const typeOps = getTypeOperations(typeIndex);
    if (typeOps.length === 0 || typeCutPieces === 0) return 0;
    return Math.round(typeOps.reduce((sum, op) => sum + getOpProgress(typeIndex, op, typeCutPieces), 0) / typeOps.length);
  };

  const totalCutPieces = Object.values(cuttingSummary).reduce((sum, val) => sum + val, 0);
  const overallProgress = rollsData.length > 0
    ? Math.round(rollsData.reduce((sum, _, idx) => {
        const typeCut = cuttingSummary[idx] || 0;
        return sum + getTypeOverallProgress(idx, typeCut);
      }, 0) / rollsData.length)
    : 0;

  const handleSave = async (typeIndex: number, operation: string, maxPieces: number) => {
    const value = parseInt(editValue) || 0;
    if (value > maxPieces) return;
    await upsertMutation.mutateAsync({ batchId, operation, completedPieces: value, typeIndex });
    setEditingKey(null);
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

  const isTypeOpen = (idx: number) => {
    if (openTypes[idx] !== undefined) return openTypes[idx];
    return allExpanded;
  };

  const toggleType = (idx: number) => {
    setOpenTypes(prev => ({ ...prev, [idx]: !isTypeOpen(idx) }));
  };

  const handleExpandCollapseAll = (expanded: boolean) => {
    setAllExpanded(expanded);
    const newState: Record<number, boolean> = {};
    rollsData.forEach((_, idx) => { newState[idx] = expanded; });
    setOpenTypes(newState);
  };

  if (operations.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No operations configured for this batch.</p>
          <p className="text-sm text-muted-foreground mt-1">Edit batch details to add operations.</p>
        </CardContent>
      </Card>
    );
  }

  if (rollsData.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No types defined for this batch.</p>
        </CardContent>
      </Card>
    );
  }

  const completedTypes = rollsData.filter((_, idx) => getTypeOverallProgress(idx, cuttingSummary[idx] || 0) >= 100).length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
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
            <div className="text-sm text-muted-foreground">Types</div>
            <div className="text-2xl font-bold text-purple-600">
              {completedTypes}/{rollsData.length}
              <span className="text-sm font-normal ml-1">done</span>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-200">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Operations</div>
            <div className="text-lg font-bold text-orange-600">{operations.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Overall Progress Bar + Expand/Collapse Toggle */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex-1">
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
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1 border-t">
            <Switch
              id="expand-all"
              checked={allExpanded}
              onCheckedChange={handleExpandCollapseAll}
            />
            <Label htmlFor="expand-all" className="text-sm text-muted-foreground cursor-pointer">
              {allExpanded ? 'Collapse All Types' : 'Expand All Types'}
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Type-wise Progress */}
      {rollsData.map((type, typeIndex) => {
        const typeCutPieces = cuttingSummary[typeIndex] || 0;
        const typeOps = getTypeOperations(typeIndex);
        const typeProgress = getTypeOverallProgress(typeIndex, typeCutPieces);
        const isOpen = isTypeOpen(typeIndex);
        const typeLabel = `Type ${typeIndex + 1}: ${type.color || 'N/A'} - ${type.fabric_type || type.fabricType || 'Fabric'}`;
        const assignedCompanies = jobWorkByType[typeIndex];
        const isJobWorkAssigned = assignedCompanies && assignedCompanies.length > 0;

        return (
          <Card key={typeIndex} className={isJobWorkAssigned ? 'border-primary/40 bg-primary/5' : ''}>
            <Collapsible open={isOpen} onOpenChange={() => toggleType(typeIndex)}>
              <CollapsibleTrigger className="w-full">
                <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {isOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                      <CardTitle className="text-base">{typeLabel}</CardTitle>
                      {isJobWorkAssigned && (
                        <Badge variant="secondary" className="gap-1 bg-primary/10 text-primary border-primary/30">
                          <Briefcase className="h-3 w-3" />
                          {assignedCompanies.join(', ')}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{typeCutPieces} pcs</Badge>
                      <span className={`text-sm font-bold ${getStatusColor(typeProgress)}`}>{typeProgress}%</span>
                      <div className="w-24 h-2 rounded-full bg-secondary overflow-hidden">
                        <div className={`h-full rounded-full ${getProgressColor(typeProgress)}`} style={{ width: `${typeProgress}%` }} />
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-3 pt-0">
                  {typeCutPieces === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">No pieces cut yet for this type. Add cutting entries first.</p>
                  ) : (
                    typeOps.map((op) => {
                      const key = `${typeIndex}-${op}`;
                      const completed = progressMap[key] || 0;
                      const percent = getOpProgress(typeIndex, op, typeCutPieces);
                      const isEditing = editingKey === key;

                      return (
                        <div key={key} className="p-3 border rounded-lg space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {percent >= 100 ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <div className={`h-4 w-4 rounded-full border-2 ${percent > 0 ? 'border-yellow-500' : 'border-muted-foreground'}`} />
                              )}
                              <span className="text-sm font-medium">{op}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={percent >= 100 ? 'default' : 'outline'} className="text-xs">
                                {completed}/{typeCutPieces}
                              </Badge>
                              <span className={`text-xs font-bold ${getStatusColor(percent)}`}>{percent}%</span>
                            </div>
                          </div>

                          <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
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
                                max={typeCutPieces}
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                placeholder={`Max: ${typeCutPieces}`}
                                className="w-32 h-7 text-sm"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSave(typeIndex, op, typeCutPieces);
                                  if (e.key === 'Escape') setEditingKey(null);
                                }}
                              />
                              <Button size="sm" variant="default" className="h-7 text-xs" onClick={() => handleSave(typeIndex, op, typeCutPieces)} disabled={upsertMutation.isPending}>
                                Save
                              </Button>
                              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setEditingKey(null)}>
                                Cancel
                              </Button>
                              {parseInt(editValue) > typeCutPieces && (
                                <span className="text-xs text-destructive">Max {typeCutPieces}</span>
                              )}
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 text-xs"
                              onClick={() => {
                                setEditingKey(key);
                                setEditValue(completed.toString());
                              }}
                            >
                              Update
                            </Button>
                          )}
                        </div>
                      );
                    })
                  )}
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        );
      })}
    </div>
  );
};
