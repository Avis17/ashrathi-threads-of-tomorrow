import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  CheckCircle, AlertCircle, ChevronDown, ChevronRight,
  Briefcase, AlertTriangle, Truck, CalendarClock, CalendarCheck, TrendingDown, TrendingUp, CalendarIcon,
} from 'lucide-react';
import { useBatchOperationProgress, useUpsertOperationProgress } from '@/hooks/useBatchOperationProgress';
import { useBatchJobWorks } from '@/hooks/useJobWorks';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useBatchTypeConfirmed, useUpsertDeliveryStatus, DELIVERY_STATUSES, DeliveryStatus } from '@/hooks/useBatchTypeConfirmed';
import { differenceInDays, format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

interface BatchProductionSectionProps {
  batchId: string;
  operations?: string[];
  rollsData?: any[];
  cuttingSummary?: Record<number, number>;
  styleLookup?: Record<string, string>;
}

interface StyleGroup {
  styleId: string;
  styleName: string;
  typeIndices: number[];
  // Shared dates (from first type in style)
  plannedStartDate?: string;
  estimatedDeliveryDate?: string;
}

export const BatchProductionSection = ({
  batchId,
  operations = [],
  rollsData = [],
  cuttingSummary = {},
  styleLookup = {},
}: BatchProductionSectionProps) => {
  const { data: progressData = [] } = useBatchOperationProgress(batchId);
  const { data: jobWorks = [] } = useBatchJobWorks(batchId);
  const { data: typeData } = useBatchTypeConfirmed(batchId);
  const statusMap = typeData?.statusMap ?? {};
  const actualDeliveryDateMap = typeData?.actualDeliveryDateMap ?? {};
  const upsertMutation = useUpsertOperationProgress();
  const upsertStatusMutation = useUpsertDeliveryStatus();

  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editCompleted, setEditCompleted] = useState('');
  const [editMistakes, setEditMistakes] = useState('');
  const [allExpanded, setAllExpanded] = useState(true);
  const [openStyles, setOpenStyles] = useState<Record<string, boolean>>({});
  const [openColors, setOpenColors] = useState<Record<number, boolean>>({});
  // Delivery date popover open state per styleId
  const [deliveryDatePopovers, setDeliveryDatePopovers] = useState<Record<string, boolean>>({});

  // --- Build job work lookup ---
  const jobWorkByType: Record<number, string[]> = {};
  jobWorks.forEach(jw => {
    const variations = (jw.variations || []) as Array<{ type_index: number }>;
    const indices = variations.length > 0 ? variations.map(v => v.type_index) : [jw.type_index];
    indices.forEach(idx => {
      if (!jobWorkByType[idx]) jobWorkByType[idx] = [];
      if (!jobWorkByType[idx].includes(jw.company_name)) jobWorkByType[idx].push(jw.company_name);
    });
  });

  // --- Build progress maps ---
  const completedMap: Record<string, number> = {};
  const mistakeMap: Record<string, number> = {};
  progressData.forEach(p => {
    completedMap[`${p.type_index}-${p.operation}`] = p.completed_pieces;
    mistakeMap[`${p.type_index}-${p.operation}`] = p.mistake_pieces || 0;
  });

  // --- Group rollsData by style ---
  const styleGroups: StyleGroup[] = [];
  const styleMap: Record<string, StyleGroup> = {};
  rollsData.forEach((type, idx) => {
    const sid = type.style_id || '__unknown__';
    const name = styleLookup[sid] || type.style_name || `Style ${sid.slice(0, 6)}`;
    if (!styleMap[sid]) {
      styleMap[sid] = {
        styleId: sid,
        styleName: name,
        typeIndices: [],
        plannedStartDate: type.planned_start_date || undefined,
        estimatedDeliveryDate: type.estimated_delivery_date || undefined,
      };
      styleGroups.push(styleMap[sid]);
    }
    styleMap[sid].typeIndices.push(idx);
  });

  // --- Helpers ---
  const getTypeOperations = (typeIndex: number): string[] => {
    const typeOps = rollsData[typeIndex]?.operations;
    if (Array.isArray(typeOps) && typeOps.length > 0) return typeOps;
    return operations;
  };

  const getOpProgress = (typeIndex: number, op: string, typeCutPieces: number) => {
    const completed = completedMap[`${typeIndex}-${op}`] || 0;
    if (typeCutPieces === 0) return 0;
    return Math.min(Math.round((completed / typeCutPieces) * 100), 100);
  };

  const getTypeOverallProgress = (typeIndex: number, typeCutPieces: number) => {
    const typeOps = getTypeOperations(typeIndex);
    if (typeOps.length === 0 || typeCutPieces === 0) return 0;
    return Math.round(typeOps.reduce((sum, op) => sum + getOpProgress(typeIndex, op, typeCutPieces), 0) / typeOps.length);
  };

  const getStyleProgress = (sg: StyleGroup) => {
    if (sg.typeIndices.length === 0) return 0;
    const total = sg.typeIndices.reduce((sum, idx) => sum + getTypeOverallProgress(idx, cuttingSummary[idx] || 0), 0);
    return Math.round(total / sg.typeIndices.length);
  };

  const getStyleCutPieces = (sg: StyleGroup) =>
    sg.typeIndices.reduce((sum, idx) => sum + (cuttingSummary[idx] || 0), 0);

  // Style delivery status = the status of its first type index (shared)
  const getStyleStatus = (sg: StyleGroup): DeliveryStatus =>
    (statusMap[sg.typeIndices[0]] || 'in_progress') as DeliveryStatus;

  const getStyleActualDeliveryDate = (sg: StyleGroup): string | null =>
    actualDeliveryDateMap[sg.typeIndices[0]] || null;

  const handleSetStyleStatus = (sg: StyleGroup, status: DeliveryStatus, actualDeliveryDate?: string | null) => {
    // Apply to all type indices of this style
    sg.typeIndices.forEach(idx => {
      upsertStatusMutation.mutate({ batchId, typeIndex: idx, deliveryStatus: status, actualDeliveryDate: actualDeliveryDate });
    });
  };

  const totalCutPieces = Object.values(cuttingSummary).reduce((sum, val) => sum + val, 0);
  const overallProgress =
    rollsData.length > 0
      ? Math.round(
          rollsData.reduce((sum, _, idx) => sum + getTypeOverallProgress(idx, cuttingSummary[idx] || 0), 0) /
            rollsData.length
        )
      : 0;

  const handleSave = async (typeIndex: number, operation: string, maxPieces: number) => {
    const completed = parseInt(editCompleted) || 0;
    const mistakes = parseInt(editMistakes) || 0;
    if (completed > maxPieces) return;
    await upsertMutation.mutateAsync({ batchId, operation, completedPieces: completed, mistakePieces: mistakes, typeIndex });
    setEditingKey(null);
    setEditCompleted('');
    setEditMistakes('');
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

  const isStyleOpen = (sid: string) =>
    openStyles[sid] !== undefined ? openStyles[sid] : allExpanded;

  const isColorOpen = (idx: number) =>
    openColors[idx] !== undefined ? openColors[idx] : allExpanded;

  const toggleStyle = (sid: string) =>
    setOpenStyles(prev => ({ ...prev, [sid]: !isStyleOpen(sid) }));

  const toggleColor = (idx: number) =>
    setOpenColors(prev => ({ ...prev, [idx]: !isColorOpen(idx) }));

  const handleExpandCollapseAll = (expanded: boolean) => {
    setAllExpanded(expanded);
    const sState: Record<string, boolean> = {};
    styleGroups.forEach(sg => { sState[sg.styleId] = expanded; });
    setOpenStyles(sState);
    const cState: Record<number, boolean> = {};
    rollsData.forEach((_, idx) => { cState[idx] = expanded; });
    setOpenColors(cState);
  };

  // --- Date diff helper ---
  const renderDateDiff = (planned: string | undefined, actual: string | null | undefined, isDelivered: boolean) => {
    if (!planned) return null;
    const plannedDate = parseISO(planned);

    if (isDelivered && actual) {
      // Show actual vs planned
      const actualDate = parseISO(actual);
      const diff = differenceInDays(actualDate, plannedDate);
      return (
        <div className="flex items-center gap-2 text-xs flex-wrap">
          <div className="flex items-center gap-1 text-muted-foreground">
            <CalendarClock className="h-3.5 w-3.5" />
            <span>Expected: {format(plannedDate, 'dd MMM yy')}</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <CalendarCheck className="h-3.5 w-3.5" />
            <span>Delivered: {format(actualDate, 'dd MMM yy')}</span>
          </div>
          {diff === 0 ? (
            <Badge variant="outline" className="text-xs py-0 h-5 text-green-600 border-green-400">On time</Badge>
          ) : diff > 0 ? (
            <Badge variant="outline" className="text-xs py-0 h-5 text-red-600 border-red-400 gap-1">
              <TrendingUp className="h-3 w-3" />{diff}d late
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs py-0 h-5 text-green-600 border-green-400 gap-1">
              <TrendingDown className="h-3 w-3" />{Math.abs(diff)}d early
            </Badge>
          )}
        </div>
      );
    }

    // Not delivered — compare with today
    const today = new Date();
    const diff = differenceInDays(plannedDate, today);
    return (
      <div className="flex items-center gap-2 text-xs">
        <div className="flex items-center gap-1 text-muted-foreground">
          <CalendarClock className="h-3.5 w-3.5" />
          <span>Expected: {format(plannedDate, 'dd MMM yy')}</span>
        </div>
        {diff >= 0 ? (
          <Badge variant="outline" className="text-xs py-0 h-5 text-muted-foreground">{diff}d remaining</Badge>
        ) : (
          <Badge variant="outline" className="text-xs py-0 h-5 text-red-600 border-red-400 gap-1">
            <TrendingUp className="h-3 w-3" />{Math.abs(diff)}d overdue
          </Badge>
        )}
      </div>
    );
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

  // Delivery status counts across styles
  const statusCounts = styleGroups.reduce((acc, sg) => {
    const s = getStyleStatus(sg);
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

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
            <div className="text-sm text-muted-foreground">Types Done</div>
            <div className="text-2xl font-bold text-purple-600">
              {completedTypes}/{rollsData.length}
              <span className="text-sm font-normal ml-1">done</span>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-200">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Styles</div>
            <div className="text-lg font-bold text-orange-600">{styleGroups.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Delivery Status Summary Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Truck className="h-4 w-4 text-primary" />
            Delivery Status Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-3 gap-3">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/40 border">
              <div className="h-3 w-3 rounded-full border-2 border-yellow-500 shrink-0" />
              <div>
                <div className="text-xs text-muted-foreground">In Progress</div>
                <div className="text-xl font-bold">{statusCounts['in_progress'] || 0}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/40 border">
              <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
              <div>
                <div className="text-xs text-muted-foreground">Completed</div>
                <div className="text-xl font-bold text-green-600">{statusCounts['completed'] || 0}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/40 border">
              <Truck className="h-4 w-4 text-primary shrink-0" />
              <div>
                <div className="text-xs text-muted-foreground">Delivered</div>
                <div className="text-xl font-bold text-primary">{statusCounts['delivered'] || 0}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overall Progress Bar + Expand/Collapse Toggle */}
      <Card>
        <CardContent className="p-4 space-y-3">
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
          <div className="flex items-center gap-2 pt-1 border-t">
            <Switch
              id="expand-all"
              checked={allExpanded}
              onCheckedChange={handleExpandCollapseAll}
            />
            <Label htmlFor="expand-all" className="text-sm text-muted-foreground cursor-pointer">
              {allExpanded ? 'Collapse All' : 'Expand All'}
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Style-wise groups */}
      {styleGroups.map(sg => {
        const styleProgress = getStyleProgress(sg);
        const styleCut = getStyleCutPieces(sg);
        const styleStatus = getStyleStatus(sg);
        const styleActualDeliveryDate = getStyleActualDeliveryDate(sg);
        const styleStatusDef = DELIVERY_STATUSES.find(s => s.value === styleStatus);
        const isOpen = isStyleOpen(sg.styleId);
        const datePopoverOpen = deliveryDatePopovers[sg.styleId] || false;
        const allCompanies = Array.from(
          new Set(sg.typeIndices.flatMap(idx => jobWorkByType[idx] || []))
        );
        const isJobWork = allCompanies.length > 0;
        const firstType = rollsData[sg.typeIndices[0]];
        const plannedStart = firstType?.planned_start_date;
        const estimatedDelivery = firstType?.estimated_delivery_date;

        return (
          <Card key={sg.styleId} className={isJobWork ? 'border-primary/40 bg-primary/5' : ''}>
            <Collapsible open={isOpen} onOpenChange={() => toggleStyle(sg.styleId)}>
              <CollapsibleTrigger className="w-full">
                <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors pb-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {isOpen ? <ChevronDown className="h-5 w-5 shrink-0" /> : <ChevronRight className="h-5 w-5 shrink-0" />}
                      <div className="text-left min-w-0">
                        <CardTitle className="text-base truncate">{sg.styleName}</CardTitle>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-xs text-muted-foreground">{sg.typeIndices.length} color{sg.typeIndices.length !== 1 ? 's' : ''}</span>
                          {isJobWork && (
                            <Badge variant="secondary" className="gap-1 bg-primary/10 text-primary border-primary/30 text-xs">
                              <Briefcase className="h-3 w-3" />
                              {allCompanies.join(', ')}
                            </Badge>
                          )}
                        </div>
                        <div className="mt-1.5">
                          {renderDateDiff(estimatedDelivery, styleActualDeliveryDate, styleStatus === 'delivered')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <Badge variant="outline" className="text-xs">{styleCut} pcs</Badge>
                      <div onClick={e => e.stopPropagation()} className="flex items-center gap-1">
                        <Select
                          value={styleStatus}
                          onValueChange={(val) => {
                            const newStatus = val as DeliveryStatus;
                            if (newStatus === 'delivered') {
                              setDeliveryDatePopovers(prev => ({ ...prev, [sg.styleId]: true }));
                            } else {
                              handleSetStyleStatus(sg, newStatus, null);
                            }
                          }}
                        >
                          <SelectTrigger className="w-36 h-7 text-xs bg-background border-border">
                            <div className="flex items-center gap-1.5">
                              {styleStatus === 'delivered' && <Truck className="h-3 w-3 text-primary" />}
                              {styleStatus === 'completed' && <CheckCircle className="h-3 w-3 text-green-600" />}
                              {styleStatus === 'in_progress' && <div className="h-3 w-3 rounded-full border-2 border-yellow-500" />}
                              <span>{styleStatusDef?.label}</span>
                            </div>
                          </SelectTrigger>
                          <SelectContent className="z-50 bg-background border shadow-lg">
                            {DELIVERY_STATUSES.map(s => (
                              <SelectItem key={s.value} value={s.value}>
                                <span className="flex items-center gap-2">
                                  {s.value === 'delivered' && <Truck className="h-3.5 w-3.5 text-primary" />}
                                  {s.value === 'completed' && <CheckCircle className="h-3.5 w-3.5 text-green-600" />}
                                  {s.value === 'in_progress' && <div className="h-3.5 w-3.5 rounded-full border-2 border-yellow-500" />}
                                  {s.label}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {/* Calendar icon to set/change delivery date */}
                        <Popover open={datePopoverOpen} onOpenChange={(open) => setDeliveryDatePopovers(prev => ({ ...prev, [sg.styleId]: open }))}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              className={cn(
                                'h-7 w-7 shrink-0 transition-opacity',
                                styleStatus === 'delivered' ? 'border-primary text-primary' : 'opacity-0 pointer-events-none'
                              )}
                              title="Set delivery date"
                            >
                              <CalendarIcon className="h-3.5 w-3.5" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 z-50" align="end">
                            <div className="p-3 border-b">
                              <p className="text-sm font-medium">Select Delivery Date</p>
                              <p className="text-xs text-muted-foreground">{sg.styleName}</p>
                            </div>
                            <Calendar
                              mode="single"
                              selected={styleActualDeliveryDate ? parseISO(styleActualDeliveryDate) : undefined}
                              onSelect={(date) => {
                                if (date) {
                                  const dateStr = format(date, 'yyyy-MM-dd');
                                  handleSetStyleStatus(sg, 'delivered', dateStr);
                                  setDeliveryDatePopovers(prev => ({ ...prev, [sg.styleId]: false }));
                                }
                              }}
                              className={cn('p-3 pointer-events-auto')}
                            />
                            {styleActualDeliveryDate && (
                              <div className="p-2 border-t flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">
                                  Delivered: {format(parseISO(styleActualDeliveryDate), 'dd MMM yyyy')}
                                </span>
                                <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={() => {
                                  handleSetStyleStatus(sg, 'delivered', null);
                                  setDeliveryDatePopovers(prev => ({ ...prev, [sg.styleId]: false }));
                                }}>Clear</Button>
                              </div>
                            )}
                          </PopoverContent>
                        </Popover>
                      </div>
                      <span className={`text-sm font-bold ${getStatusColor(styleProgress)}`}>{styleProgress}%</span>
                      <div className="w-24 h-2 rounded-full bg-secondary overflow-hidden">
                        <div className={`h-full rounded-full ${getProgressColor(styleProgress)}`} style={{ width: `${styleProgress}%` }} />
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <CardContent className="pt-0 pb-4 space-y-3">
                  {plannedStart && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground px-1 pb-1 border-b">
                      <CalendarClock className="h-3.5 w-3.5" />
                      <span>Planned Start: <span className="font-medium text-foreground">{format(parseISO(plannedStart), 'dd MMM yyyy')}</span></span>
                    </div>
                  )}


                  {/* Color/Variant sub-items */}
                  {sg.typeIndices.map(typeIndex => {
                    const type = rollsData[typeIndex];
                    const typeCutPieces = cuttingSummary[typeIndex] || 0;
                    const typeOps = getTypeOperations(typeIndex);
                    const typeProgress = getTypeOverallProgress(typeIndex, typeCutPieces);
                    const colorLabel = type?.color || `Variant ${typeIndex + 1}`;
                    const colorOpen = isColorOpen(typeIndex);
                    const assignedCompanies = jobWorkByType[typeIndex];
                    const isJobWorkColor = assignedCompanies && assignedCompanies.length > 0;

                    return (
                      <div
                        key={typeIndex}
                        className={`rounded-lg border ${isJobWorkColor ? 'border-primary/30 bg-primary/5' : 'border-border bg-muted/10'}`}
                      >
                        <Collapsible open={colorOpen} onOpenChange={() => toggleColor(typeIndex)}>
                          <CollapsibleTrigger className="w-full">
                            <div className="flex items-center justify-between p-3 hover:bg-muted/30 rounded-lg transition-colors cursor-pointer">
                              <div className="flex items-center gap-2">
                                {colorOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                <span className="text-sm font-medium">{colorLabel}</span>
                                {type?.fabric_type && (
                                  <span className="text-xs text-muted-foreground">· {type.fabric_type}{type.gsm ? ` / ${type.gsm} GSM` : ''}</span>
                                )}
                                {isJobWorkColor && (
                                  <Badge variant="secondary" className="text-xs gap-1 bg-primary/10 text-primary border-primary/30 py-0 h-5">
                                    <Briefcase className="h-2.5 w-2.5" />
                                    {assignedCompanies.join(', ')}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">{typeCutPieces} pcs</Badge>
                                <span className={`text-xs font-bold ${getStatusColor(typeProgress)}`}>{typeProgress}%</span>
                                <div className="w-16 h-1.5 rounded-full bg-secondary overflow-hidden">
                                  <div className={`h-full rounded-full ${getProgressColor(typeProgress)}`} style={{ width: `${typeProgress}%` }} />
                                </div>
                              </div>
                            </div>
                          </CollapsibleTrigger>

                          <CollapsibleContent>
                            <div className="px-3 pb-3 space-y-3">
                              {typeCutPieces === 0 ? (
                                <p className="text-sm text-muted-foreground py-3 text-center">No pieces cut yet. Add cutting entries first.</p>
                              ) : (
                                typeOps.map(op => {
                                  const key = `${typeIndex}-${op}`;
                                  const completed = completedMap[key] || 0;
                                  const mistakes = mistakeMap[key] || 0;
                                  const accounted = completed + mistakes;
                                  const missing = Math.max(0, typeCutPieces - accounted);
                                  const percent = getOpProgress(typeIndex, op, typeCutPieces);
                                  const isEditing = editingKey === key;

                                  return (
                                    <div key={key} className="p-3 border rounded-lg space-y-2 bg-background">
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

                                      {(completed > 0 || mistakes > 0) && (
                                        <div className="flex items-center gap-3 text-xs pt-1">
                                          <span className="text-green-600 font-medium">✓ {completed} done</span>
                                          {mistakes > 0 && (
                                            <span className="text-orange-500 font-medium flex items-center gap-1">
                                              <AlertTriangle className="h-3 w-3" />
                                              {mistakes} mistake{mistakes !== 1 ? 's' : ''}
                                            </span>
                                          )}
                                          {missing > 0 && (
                                            <span className="text-destructive font-medium">{missing} missing</span>
                                          )}
                                          {missing === 0 && accounted >= typeCutPieces && (
                                            <span className="text-muted-foreground">All {typeCutPieces} accounted</span>
                                          )}
                                        </div>
                                      )}

                                      {isEditing ? (
                                        <div className="space-y-2 pt-1">
                                          <div className="flex items-center gap-2">
                                            <div className="flex-1">
                                              <Label className="text-xs text-muted-foreground mb-1 block">Completed Pieces</Label>
                                              <Input
                                                type="number"
                                                min={0}
                                                max={typeCutPieces}
                                                value={editCompleted}
                                                onChange={(e) => setEditCompleted(e.target.value)}
                                                placeholder={`Max: ${typeCutPieces}`}
                                                className="h-7 text-sm"
                                                autoFocus
                                                onKeyDown={(e) => {
                                                  if (e.key === 'Enter') handleSave(typeIndex, op, typeCutPieces);
                                                  if (e.key === 'Escape') setEditingKey(null);
                                                }}
                                              />
                                            </div>
                                            <div className="flex-1">
                                              <Label className="text-xs text-muted-foreground mb-1 block">Mistake Pieces</Label>
                                              <Input
                                                type="number"
                                                min={0}
                                                value={editMistakes}
                                                onChange={(e) => setEditMistakes(e.target.value)}
                                                placeholder="0"
                                                className="h-7 text-sm"
                                                onKeyDown={(e) => {
                                                  if (e.key === 'Enter') handleSave(typeIndex, op, typeCutPieces);
                                                  if (e.key === 'Escape') setEditingKey(null);
                                                }}
                                              />
                                            </div>
                                          </div>
                                          {(() => {
                                            const c = parseInt(editCompleted) || 0;
                                            const m = parseInt(editMistakes) || 0;
                                            const acc = c + m;
                                            const miss = Math.max(0, typeCutPieces - acc);
                                            return (
                                              <div className="text-xs flex gap-3 px-1">
                                                <span className="text-green-600">✓ {c} done</span>
                                                {m > 0 && <span className="text-orange-500">⚠ {m} mistakes</span>}
                                                {miss > 0 ? (
                                                  <span className="text-destructive font-semibold">{miss} missing</span>
                                                ) : acc > 0 ? (
                                                  <span className="text-muted-foreground">All accounted</span>
                                                ) : null}
                                              </div>
                                            );
                                          })()}
                                          <div className="flex items-center gap-2">
                                            <Button size="sm" variant="default" className="h-7 text-xs" onClick={() => handleSave(typeIndex, op, typeCutPieces)} disabled={upsertMutation.isPending}>
                                              Save
                                            </Button>
                                            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setEditingKey(null)}>
                                              Cancel
                                            </Button>
                                            {parseInt(editCompleted) > typeCutPieces && (
                                              <span className="text-xs text-destructive">Max {typeCutPieces}</span>
                                            )}
                                          </div>
                                        </div>
                                      ) : (
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="h-6 text-xs"
                                          onClick={() => {
                                            setEditingKey(key);
                                            setEditCompleted(completed.toString());
                                            setEditMistakes(mistakes.toString());
                                          }}
                                        >
                                          Update
                                        </Button>
                                      )}
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      </div>
                    );
                  })}
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        );
      })}
    </div>
  );
};
