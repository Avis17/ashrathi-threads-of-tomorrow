import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  CheckCircle, AlertCircle, ChevronDown, ChevronRight,
  Briefcase, AlertTriangle, Truck, CalendarClock, CalendarCheck, TrendingDown, TrendingUp, CalendarIcon, StickyNote,
} from 'lucide-react';
import { useBatchOperationProgress, useUpsertOperationProgress } from '@/hooks/useBatchOperationProgress';
import { useBatchJobWorks } from '@/hooks/useJobWorks';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useBatchTypeConfirmed, useUpsertDeliveryStatus, DELIVERY_STATUSES, DeliveryStatus } from '@/hooks/useBatchTypeConfirmed';
import { differenceInDays, format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

export interface BatchProductionSectionProps {
  batchId: string;
  operations?: string[];
  rollsData?: any[];
  cuttingSummary?: Record<number, number>;
  cuttingSizeSummary?: Record<number, Record<string, number>>;
  styleLookup?: Record<string, string>;
}

interface StyleGroup {
  styleId: string;
  styleName: string;
  typeIndices: number[];
  plannedStartDate?: string;
  estimatedDeliveryDate?: string;
}

const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'];

const STANDARD_OPERATIONS = ['Cutting', 'Stitching', 'Checking', 'Ironing', 'Packing'];

const normalizeOperation = (op: string): string => {
  const lower = op.toLowerCase();
  if (lower.includes('stitching') || lower.includes('singer') || lower.includes('power table') || lower.includes('powertable')) return 'Stitching';
  if (lower.includes('cutting')) return 'Cutting';
  if (lower.includes('checking')) return 'Checking';
  if (lower.includes('ironing')) return 'Ironing';
  if (lower.includes('packing')) return 'Packing';
  return op; // fallback
};

const sortSizes = (sizes: string[]) => {
  return sizes.sort((a, b) => {
    const ai = SIZE_ORDER.indexOf(a.toUpperCase());
    const bi = SIZE_ORDER.indexOf(b.toUpperCase());
    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    return a.localeCompare(b);
  });
};

const COLOR_PALETTES = [
  { bg: 'bg-blue-50', border: 'border-blue-200', accent: 'text-blue-700', pill: 'bg-blue-100 text-blue-800', bar: 'bg-blue-500' },
  { bg: 'bg-emerald-50', border: 'border-emerald-200', accent: 'text-emerald-700', pill: 'bg-emerald-100 text-emerald-800', bar: 'bg-emerald-500' },
  { bg: 'bg-violet-50', border: 'border-violet-200', accent: 'text-violet-700', pill: 'bg-violet-100 text-violet-800', bar: 'bg-violet-500' },
  { bg: 'bg-amber-50', border: 'border-amber-200', accent: 'text-amber-700', pill: 'bg-amber-100 text-amber-800', bar: 'bg-amber-500' },
  { bg: 'bg-rose-50', border: 'border-rose-200', accent: 'text-rose-700', pill: 'bg-rose-100 text-rose-800', bar: 'bg-rose-500' },
  { bg: 'bg-cyan-50', border: 'border-cyan-200', accent: 'text-cyan-700', pill: 'bg-cyan-100 text-cyan-800', bar: 'bg-cyan-500' },
  { bg: 'bg-orange-50', border: 'border-orange-200', accent: 'text-orange-700', pill: 'bg-orange-100 text-orange-800', bar: 'bg-orange-500' },
  { bg: 'bg-teal-50', border: 'border-teal-200', accent: 'text-teal-700', pill: 'bg-teal-100 text-teal-800', bar: 'bg-teal-500' },
];

export const BatchProductionSection = ({
  batchId,
  operations = [],
  rollsData = [],
  cuttingSummary = {},
  cuttingSizeSummary = {},
  styleLookup = {},
}: BatchProductionSectionProps) => {
  const { data: progressData = [] } = useBatchOperationProgress(batchId);
  const { data: jobWorks = [] } = useBatchJobWorks(batchId);
  const { data: typeData } = useBatchTypeConfirmed(batchId);
  const statusMap = typeData?.statusMap ?? {};
  const actualDeliveryDateMap = typeData?.actualDeliveryDateMap ?? {};
  const deliveryNotesMap = typeData?.deliveryNotesMap ?? {};
  const upsertMutation = useUpsertOperationProgress();
  const upsertStatusMutation = useUpsertDeliveryStatus();

  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, { completed: string; mistakes: string }>>({});
  const [allExpanded, setAllExpanded] = useState(true);
  const [openStyles, setOpenStyles] = useState<Record<string, boolean>>({});
  const [openColors, setOpenColors] = useState<Record<number, boolean>>({});
  const [openOps, setOpenOps] = useState<Record<string, boolean>>({});

  // Delivery dialog state
  const [deliveryDialogStyle, setDeliveryDialogStyle] = useState<StyleGroup | null>(null);
  const [deliveryDialogDate, setDeliveryDialogDate] = useState<Date | undefined>(undefined);
  const [deliveryDialogNotes, setDeliveryDialogNotes] = useState('');
  const [calendarOpen, setCalendarOpen] = useState(false);

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

  // --- Build size-wise progress maps ---
  // Key: `${type_index}-${operation}-${size}` => { completed, mistakes }
  const sizeProgressMap: Record<string, { completed: number; mistakes: number }> = {};
  // Also build aggregate (no size) for backward compat
  const aggProgressMap: Record<string, { completed: number; mistakes: number }> = {};
  
  progressData.forEach(p => {
    const normalizedOp = normalizeOperation(p.operation);
    const sizeKey = `${p.type_index}-${normalizedOp}-${p.size || ''}`;
    if (!sizeProgressMap[sizeKey]) {
      sizeProgressMap[sizeKey] = { completed: 0, mistakes: 0 };
    }
    sizeProgressMap[sizeKey].completed += p.completed_pieces;
    sizeProgressMap[sizeKey].mistakes += (p.mistake_pieces || 0);
    // Aggregate
    const aggKey = `${p.type_index}-${normalizedOp}`;
    if (!aggProgressMap[aggKey]) aggProgressMap[aggKey] = { completed: 0, mistakes: 0 };
    aggProgressMap[aggKey].completed += p.completed_pieces;
    aggProgressMap[aggKey].mistakes += (p.mistake_pieces || 0);
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
  const getTypeOperations = (_typeIndex: number): string[] => {
    return STANDARD_OPERATIONS;
  };

  const getTypeSizes = (typeIndex: number): string[] => {
    const sizePieces = cuttingSizeSummary[typeIndex];
    if (sizePieces && Object.keys(sizePieces).length > 0) {
      return sortSizes(Object.keys(sizePieces));
    }
    return [];
  };

  const getSizeCompleted = (typeIndex: number, op: string, size: string) => {
    // Cutting is auto-completed from cutting logs
    if (op === 'Cutting') return cuttingSizeSummary[typeIndex]?.[size] || 0;
    return sizeProgressMap[`${typeIndex}-${op}-${size}`]?.completed || 0;
  };

  const getSizeMistakes = (typeIndex: number, op: string, size: string) => {
    if (op === 'Cutting') return 0;
    return sizeProgressMap[`${typeIndex}-${op}-${size}`]?.mistakes || 0;
  };

  const getOpTotalCompleted = (typeIndex: number, op: string) => {
    // Cutting is auto-completed from cutting logs
    if (op === 'Cutting') return cuttingSummary[typeIndex] || 0;
    return aggProgressMap[`${typeIndex}-${op}`]?.completed || 0;
  };

  const getOpTotalMistakes = (typeIndex: number, op: string) => {
    if (op === 'Cutting') return 0;
    return aggProgressMap[`${typeIndex}-${op}`]?.mistakes || 0;
  };

  const getOpProgress = (typeIndex: number, op: string, typeCutPieces: number) => {
    // Cutting is always 100% if there are cut pieces
    if (op === 'Cutting') return typeCutPieces > 0 ? 100 : 0;
    const completed = getOpTotalCompleted(typeIndex, op);
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

  const getStyleStatus = (sg: StyleGroup): DeliveryStatus =>
    (statusMap[sg.typeIndices[0]] || 'in_progress') as DeliveryStatus;

  const getStyleActualDeliveryDate = (sg: StyleGroup): string | null =>
    actualDeliveryDateMap[sg.typeIndices[0]] || null;

  const getStyleDeliveryNotes = (sg: StyleGroup): string | null =>
    deliveryNotesMap[sg.typeIndices[0]] || null;

  const openDeliveryDialog = (sg: StyleGroup) => {
    const existingDate = getStyleActualDeliveryDate(sg);
    const existingNotes = getStyleDeliveryNotes(sg);
    setDeliveryDialogStyle(sg);
    setDeliveryDialogDate(existingDate ? parseISO(existingDate) : undefined);
    setDeliveryDialogNotes(existingNotes || '');
    setCalendarOpen(false);
  };

  const closeDeliveryDialog = () => {
    setDeliveryDialogStyle(null);
    setDeliveryDialogDate(undefined);
    setDeliveryDialogNotes('');
    setCalendarOpen(false);
  };

  const handleConfirmDelivery = () => {
    if (!deliveryDialogStyle) return;
    const dateStr = deliveryDialogDate ? format(deliveryDialogDate, 'yyyy-MM-dd') : null;
    deliveryDialogStyle.typeIndices.forEach(idx => {
      upsertStatusMutation.mutate({
        batchId,
        typeIndex: idx,
        deliveryStatus: 'delivered',
        actualDeliveryDate: dateStr,
        deliveryNotes: deliveryDialogNotes || null,
      });
    });
    closeDeliveryDialog();
  };

  const handleSetStyleStatus = (sg: StyleGroup, status: DeliveryStatus) => {
    if (status === 'delivered') {
      openDeliveryDialog(sg);
      return;
    }
    sg.typeIndices.forEach(idx => {
      upsertStatusMutation.mutate({ batchId, typeIndex: idx, deliveryStatus: status, actualDeliveryDate: null, deliveryNotes: null });
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

  const handleSaveSize = async (typeIndex: number, operation: string, size: string, maxPieces: number) => {
    const key = `${typeIndex}-${operation}-${size}`;
    const vals = editValues[key];
    const completed = parseInt(vals?.completed) || 0;
    const mistakes = parseInt(vals?.mistakes) || 0;
    if (completed > maxPieces) return;
    await upsertMutation.mutateAsync({ batchId, operation, completedPieces: completed, mistakePieces: mistakes, typeIndex, size });
    setEditingKey(null);
    setEditValues({});
  };

  const getStatusColor = (percent: number) => {
    if (percent >= 100) return 'text-green-600';
    if (percent >= 50) return 'text-yellow-600';
    return 'text-muted-foreground';
  };

  const getProgressColor = (percent: number) => {
    if (percent >= 100) return 'bg-green-500';
    if (percent >= 50) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  const isStyleOpen = (sid: string) =>
    openStyles[sid] !== undefined ? openStyles[sid] : allExpanded;

  const isColorOpen = (idx: number) =>
    openColors[idx] !== undefined ? openColors[idx] : allExpanded;

  const isOpOpen = (key: string) =>
    openOps[key] !== undefined ? openOps[key] : allExpanded;

  const toggleStyle = (sid: string) =>
    setOpenStyles(prev => ({ ...prev, [sid]: !isStyleOpen(sid) }));

  const toggleColor = (idx: number) =>
    setOpenColors(prev => ({ ...prev, [idx]: !isColorOpen(idx) }));

  const toggleOp = (key: string) =>
    setOpenOps(prev => ({ ...prev, [key]: !isOpOpen(key) }));

  const handleExpandCollapseAll = (expanded: boolean) => {
    setAllExpanded(expanded);
    const sState: Record<string, boolean> = {};
    styleGroups.forEach(sg => { sState[sg.styleId] = expanded; });
    setOpenStyles(sState);
    const cState: Record<number, boolean> = {};
    rollsData.forEach((_, idx) => { cState[idx] = expanded; });
    setOpenColors(cState);
    setOpenOps({});
  };

  // --- Date diff helper ---
  const renderDateDiff = (planned: string | undefined, actual: string | null | undefined, isDelivered: boolean) => {
    if (!planned) return null;
    const plannedDate = parseISO(planned);

    if (isDelivered && actual) {
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

  if (rollsData.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No production data available for this batch.</p>
          <p className="text-sm text-muted-foreground mt-1">Add fabric types to start tracking production.</p>
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

      {/* Delivery Status Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Truck className="h-4 w-4 text-blue-600" />
            Delivery Status Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-3 gap-3">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
              <div className="h-3 w-3 rounded-full border-2 border-yellow-500 shrink-0" />
              <div>
                <div className="text-xs text-muted-foreground">In Progress</div>
                <div className="text-xl font-bold">{statusCounts['in_progress'] || 0}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
              <div>
                <div className="text-xs text-muted-foreground">Completed</div>
                <div className="text-xl font-bold text-green-600">{statusCounts['completed'] || 0}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 border border-blue-200">
              <Truck className="h-4 w-4 text-blue-600 shrink-0" />
              <div>
                <div className="text-xs text-muted-foreground">Delivered</div>
                <div className="text-xl font-bold text-blue-600">{statusCounts['delivered'] || 0}</div>
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
          <div className="relative h-4 w-full overflow-hidden rounded-full bg-gray-100">
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

      {/* Style-wise Cards */}
      {styleGroups.map((sg, sgIdx) => {
        const styleProgress = getStyleProgress(sg);
        const styleCut = getStyleCutPieces(sg);
        const styleStatus = getStyleStatus(sg);
        const styleActualDeliveryDate = getStyleActualDeliveryDate(sg);
        const styleDeliveryNotes = getStyleDeliveryNotes(sg);
        const styleStatusDef = DELIVERY_STATUSES.find(s => s.value === styleStatus);
        const isOpen = isStyleOpen(sg.styleId);
        const allCompanies = Array.from(
          new Set(sg.typeIndices.flatMap(idx => jobWorkByType[idx] || []))
        );
        const isJobWork = allCompanies.length > 0;
        const firstType = rollsData[sg.typeIndices[0]];
        const plannedStart = firstType?.planned_start_date;
        const estimatedDelivery = firstType?.estimated_delivery_date;

        return (
          <Card key={sg.styleId} className={cn('overflow-hidden', isJobWork ? 'border-blue-300 shadow-md' : 'shadow-sm')}>
            <Collapsible open={isOpen} onOpenChange={() => toggleStyle(sg.styleId)}>
              <CollapsibleTrigger className="w-full">
                <CardHeader className={cn(
                  'cursor-pointer hover:bg-muted/30 transition-colors pb-3',
                  isJobWork && 'bg-blue-50/50'
                )}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {isOpen ? <ChevronDown className="h-5 w-5 shrink-0" /> : <ChevronRight className="h-5 w-5 shrink-0" />}
                      <div className="text-left min-w-0">
                        <CardTitle className="text-base truncate">{sg.styleName}</CardTitle>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-xs text-muted-foreground">{sg.typeIndices.length} color{sg.typeIndices.length !== 1 ? 's' : ''}</span>
                          {isJobWork && (
                            <Badge variant="secondary" className="gap-1 bg-blue-100 text-blue-700 border-blue-300 text-xs">
                              <Briefcase className="h-3 w-3" />
                              {allCompanies.join(', ')}
                            </Badge>
                          )}
                        </div>
                        <div className="mt-1.5 space-y-1">
                          {renderDateDiff(estimatedDelivery, styleActualDeliveryDate, styleStatus === 'delivered')}
                          {styleStatus === 'delivered' && styleDeliveryNotes && (
                            <div className="flex items-start gap-1 text-xs text-muted-foreground">
                              <StickyNote className="h-3 w-3 mt-0.5 shrink-0" />
                              <span className="italic">{styleDeliveryNotes}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <Badge variant="outline" className="text-xs">{styleCut} pcs</Badge>
                      <div onClick={e => e.stopPropagation()} className="flex items-center gap-1">
                        <Select
                          value={styleStatus}
                          onValueChange={(val) => handleSetStyleStatus(sg, val as DeliveryStatus)}
                        >
                          <SelectTrigger className="w-36 h-7 text-xs bg-background border-border">
                            <div className="flex items-center gap-1.5">
                              {styleStatus === 'delivered' && <Truck className="h-3 w-3 text-blue-600" />}
                              {styleStatus === 'completed' && <CheckCircle className="h-3 w-3 text-green-600" />}
                              {styleStatus === 'in_progress' && <div className="h-3 w-3 rounded-full border-2 border-yellow-500" />}
                              <span>{styleStatusDef?.label}</span>
                            </div>
                          </SelectTrigger>
                          <SelectContent className="z-50 bg-background border shadow-lg">
                            {DELIVERY_STATUSES.map(s => (
                              <SelectItem key={s.value} value={s.value}>
                                <span className="flex items-center gap-2">
                                  {s.value === 'delivered' && <Truck className="h-3.5 w-3.5 text-blue-600" />}
                                  {s.value === 'completed' && <CheckCircle className="h-3.5 w-3.5 text-green-600" />}
                                  {s.value === 'in_progress' && <div className="h-3.5 w-3.5 rounded-full border-2 border-yellow-500" />}
                                  {s.label}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {styleStatus === 'delivered' && (
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7 shrink-0 border-blue-400 text-blue-600"
                            title="Edit delivery details"
                            onClick={(e) => { e.stopPropagation(); openDeliveryDialog(sg); }}
                          >
                            <CalendarIcon className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                      <span className={`text-sm font-bold ${getStatusColor(styleProgress)}`}>{styleProgress}%</span>
                      <div className="w-24 h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div className={`h-full rounded-full ${getProgressColor(styleProgress)}`} style={{ width: `${styleProgress}%` }} />
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <CardContent className="pt-0 pb-4 space-y-4">
                  {plannedStart && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground px-1 pb-1 border-b">
                      <CalendarClock className="h-3.5 w-3.5" />
                      <span>Planned Start: <span className="font-medium text-foreground">{format(parseISO(plannedStart), 'dd MMM yyyy')}</span></span>
                    </div>
                  )}

                  {/* Color/Variant Cards */}
                  <div className="grid gap-4">
                    {sg.typeIndices.map((typeIndex, colorIdx) => {
                      const type = rollsData[typeIndex];
                      const typeCutPieces = cuttingSummary[typeIndex] || 0;
                      const typeOps = getTypeOperations(typeIndex);
                      const typeProgress = getTypeOverallProgress(typeIndex, typeCutPieces);
                      const colorLabel = type?.color || `Variant ${typeIndex + 1}`;
                      const colorOpen = isColorOpen(typeIndex);
                      const assignedCompanies = jobWorkByType[typeIndex];
                      const isJobWorkColor = assignedCompanies && assignedCompanies.length > 0;
                      const palette = COLOR_PALETTES[(sgIdx * 3 + colorIdx) % COLOR_PALETTES.length];
                      const sizes = getTypeSizes(typeIndex);
                      const hasSizes = sizes.length > 0;

                      return (
                        <Card
                          key={typeIndex}
                          className={cn(
                            'overflow-hidden border-l-4',
                            palette.border,
                            `border-l-${palette.bar.replace('bg-', '')}`,
                            isJobWorkColor && 'ring-1 ring-blue-200'
                          )}
                          style={{ borderLeftColor: palette.bar.includes('blue') ? '#3b82f6' : palette.bar.includes('emerald') ? '#10b981' : palette.bar.includes('violet') ? '#8b5cf6' : palette.bar.includes('amber') ? '#f59e0b' : palette.bar.includes('rose') ? '#f43f5e' : palette.bar.includes('cyan') ? '#06b6d4' : palette.bar.includes('orange') ? '#f97316' : '#14b8a6' }}
                        >
                          <Collapsible open={colorOpen} onOpenChange={() => toggleColor(typeIndex)}>
                            <CollapsibleTrigger className="w-full">
                              <div className={cn('flex items-center justify-between p-4 hover:bg-muted/20 transition-colors cursor-pointer', palette.bg)}>
                                <div className="flex items-center gap-3">
                                  {colorOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                  <div className="text-left">
                                    <div className="flex items-center gap-2">
                                      <span className={cn('font-semibold text-sm', palette.accent)}>{colorLabel}</span>
                                      {type?.fabric_type && (
                                        <span className="text-xs text-muted-foreground">· {type.fabric_type}{type.gsm ? ` / ${type.gsm} GSM` : ''}</span>
                                      )}
                                    </div>
                                    {isJobWorkColor && (
                                      <div className="mt-1">
                                        <Badge variant="secondary" className="text-xs gap-1 bg-blue-100 text-blue-700 border-blue-300 py-0 h-5">
                                          <Briefcase className="h-2.5 w-2.5" />
                                          {assignedCompanies.join(', ')}
                                        </Badge>
                                      </div>
                                    )}
                                    {hasSizes && (
                                      <div className="flex gap-1 mt-1.5 flex-wrap">
                                        {sizes.map(size => {
                                          const cutForSize = cuttingSizeSummary[typeIndex]?.[size] || 0;
                                          return (
                                            <span key={size} className={cn('text-xs px-1.5 py-0.5 rounded font-medium', palette.pill)}>
                                              {size}: {cutForSize}
                                            </span>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <Badge className={cn('text-xs', palette.pill, 'border-0')}>{typeCutPieces} pcs</Badge>
                                  <span className={`text-xs font-bold ${getStatusColor(typeProgress)}`}>{typeProgress}%</span>
                                  <div className="w-20 h-2 rounded-full bg-gray-100 overflow-hidden">
                                    <div className={`h-full rounded-full ${palette.bar}`} style={{ width: `${typeProgress}%` }} />
                                  </div>
                                </div>
                              </div>
                            </CollapsibleTrigger>

                            <CollapsibleContent>
                              <div className="px-4 pb-4 space-y-3">
                                {typeCutPieces === 0 ? (
                                  <p className="text-sm text-muted-foreground py-3 text-center">No pieces cut yet. Add cutting entries first.</p>
                                ) : (
                                  typeOps.map(op => {
                                    const opKey = `${typeIndex}-${op}`;
                                    const totalCompleted = getOpTotalCompleted(typeIndex, op);
                                    const totalMistakes = getOpTotalMistakes(typeIndex, op);
                                    const percent = getOpProgress(typeIndex, op, typeCutPieces);
                                    const opOpen = isOpOpen(opKey);

                                    return (
                                      <Collapsible key={opKey} open={opOpen} onOpenChange={() => toggleOp(opKey)}>
                                        <div className="border rounded-lg overflow-hidden bg-background">
                                          {/* Operation header */}
                                          <CollapsibleTrigger className="w-full">
                                            <div className="flex items-center justify-between p-3 hover:bg-muted/20 cursor-pointer">
                                              <div className="flex items-center gap-2">
                                                {opOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                                                {percent >= 100 ? (
                                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                                ) : (
                                                  <div className={`h-4 w-4 rounded-full border-2 ${percent > 0 ? 'border-yellow-500' : 'border-gray-300'}`} />
                                                )}
                                                <span className="text-sm font-medium">{op}</span>
                                              </div>
                                              <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-2 text-xs">
                                                  <span className="text-green-600 font-medium">✓ {totalCompleted}</span>
                                                  {totalMistakes > 0 && (
                                                    <span className="text-orange-500 font-medium flex items-center gap-0.5">
                                                      <AlertTriangle className="h-3 w-3" />{totalMistakes}
                                                    </span>
                                                  )}
                                                  <span className="text-muted-foreground">/ {typeCutPieces}</span>
                                                </div>
                                                <Badge variant={percent >= 100 ? 'default' : 'outline'} className="text-xs">
                                                  {percent}%
                                                </Badge>
                                                <div className="w-16 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                                                  <div className={`h-full rounded-full ${getProgressColor(percent)}`} style={{ width: `${percent}%` }} />
                                                </div>
                                              </div>
                                            </div>
                                          </CollapsibleTrigger>

                                          <CollapsibleContent>
                                            <div className="border-t px-3 pb-3 pt-2">
                                              {hasSizes ? (
                                                /* Size-wise breakdown */
                                                <div className="space-y-2">
                                                  <div className="text-xs font-medium text-muted-foreground mb-2">Size-wise Progress</div>
                                                  <div className="grid gap-2">
                                                    {sizes.map(size => {
                                                      const cutForSize = cuttingSizeSummary[typeIndex]?.[size] || 0;
                                                      const sizeCompleted = getSizeCompleted(typeIndex, op, size);
                                                      const sizeMistakes = getSizeMistakes(typeIndex, op, size);
                                                      const sizePercent = cutForSize > 0 ? Math.min(Math.round((sizeCompleted / cutForSize) * 100), 100) : 0;
                                                      const sizeEditKey = `${typeIndex}-${op}-${size}`;
                                                      const isEditingThis = editingKey === sizeEditKey;
                                                      const missing = Math.max(0, cutForSize - sizeCompleted - sizeMistakes);

                                                      return (
                                                        <div key={size} className="p-2.5 rounded-lg bg-muted/30 border">
                                                          <div className="flex items-center justify-between mb-1.5">
                                                            <div className="flex items-center gap-2">
                                                              <span className={cn('text-xs font-bold px-2 py-0.5 rounded', palette.pill)}>{size}</span>
                                                              <span className="text-xs text-muted-foreground">Cut: {cutForSize}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                              <span className={`text-xs font-bold ${getStatusColor(sizePercent)}`}>{sizePercent}%</span>
                                                              <div className="w-12 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                                                                <div className={`h-full rounded-full ${getProgressColor(sizePercent)}`} style={{ width: `${sizePercent}%` }} />
                                                              </div>
                                                            </div>
                                                          </div>
                                                          
                                                          {/* Progress details */}
                                                          <div className="flex items-center gap-3 text-xs mb-1.5">
                                                            <span className="text-green-600 font-medium">✓ {sizeCompleted} done</span>
                                                            {sizeMistakes > 0 && (
                                                              <span className="text-orange-500 font-medium flex items-center gap-0.5">
                                                                <AlertTriangle className="h-3 w-3" />{sizeMistakes} mistake{sizeMistakes !== 1 ? 's' : ''}
                                                              </span>
                                                            )}
                                                            {missing > 0 && sizeCompleted > 0 && (
                                                              <span className="text-red-500 font-medium">{missing} missing</span>
                                                            )}
                                                            {missing === 0 && (sizeCompleted + sizeMistakes) >= cutForSize && sizeCompleted > 0 && (
                                                              <span className="text-muted-foreground">All accounted</span>
                                                            )}
                                                          </div>

                                                          {isEditingThis ? (
                                                            <div className="space-y-2 pt-1">
                                                              <div className="flex items-center gap-2">
                                                                <div className="flex-1">
                                                                  <Label className="text-xs text-muted-foreground mb-1 block">Completed</Label>
                                                                  <Input
                                                                    type="number"
                                                                    min={0}
                                                                    max={cutForSize}
                                                                    value={editValues[sizeEditKey]?.completed || ''}
                                                                    onChange={(e) => setEditValues(prev => ({
                                                                      ...prev,
                                                                      [sizeEditKey]: { ...prev[sizeEditKey], completed: e.target.value }
                                                                    }))}
                                                                    placeholder={`Max: ${cutForSize}`}
                                                                    className="h-7 text-sm"
                                                                    autoFocus
                                                                    onKeyDown={(e) => {
                                                                      if (e.key === 'Enter') handleSaveSize(typeIndex, op, size, cutForSize);
                                                                      if (e.key === 'Escape') setEditingKey(null);
                                                                    }}
                                                                  />
                                                                </div>
                                                                <div className="flex-1">
                                                                  <Label className="text-xs text-muted-foreground mb-1 block">Mistakes</Label>
                                                                  <Input
                                                                    type="number"
                                                                    min={0}
                                                                    value={editValues[sizeEditKey]?.mistakes || ''}
                                                                    onChange={(e) => setEditValues(prev => ({
                                                                      ...prev,
                                                                      [sizeEditKey]: { ...prev[sizeEditKey], mistakes: e.target.value }
                                                                    }))}
                                                                    placeholder="0"
                                                                    className="h-7 text-sm"
                                                                    onKeyDown={(e) => {
                                                                      if (e.key === 'Enter') handleSaveSize(typeIndex, op, size, cutForSize);
                                                                      if (e.key === 'Escape') setEditingKey(null);
                                                                    }}
                                                                  />
                                                                </div>
                                                              </div>
                                                              <div className="flex items-center gap-2">
                                                                <Button size="sm" variant="default" className="h-6 text-xs" onClick={() => handleSaveSize(typeIndex, op, size, cutForSize)} disabled={upsertMutation.isPending}>
                                                                  Save
                                                                </Button>
                                                                <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={() => setEditingKey(null)}>
                                                                  Cancel
                                                                </Button>
                                                              </div>
                                                            </div>
                                                          ) : (
                                                            <Button
                                                              size="sm"
                                                              variant="outline"
                                                              className="h-6 text-xs mt-1"
                                                              onClick={() => {
                                                                setEditingKey(sizeEditKey);
                                                                setEditValues(prev => ({
                                                                  ...prev,
                                                                  [sizeEditKey]: {
                                                                    completed: sizeCompleted.toString(),
                                                                    mistakes: sizeMistakes.toString(),
                                                                  }
                                                                }));
                                                              }}
                                                            >
                                                              Update
                                                            </Button>
                                                          )}
                                                        </div>
                                                      );
                                                    })}
                                                  </div>
                                                </div>
                                              ) : (
                                                /* No size data — fallback to aggregate */
                                                <div className="space-y-2">
                                                  <div className="flex items-center gap-3 text-xs">
                                                    <span className="text-green-600 font-medium">✓ {totalCompleted} done</span>
                                                    {totalMistakes > 0 && (
                                                      <span className="text-orange-500 font-medium flex items-center gap-1">
                                                        <AlertTriangle className="h-3 w-3" />
                                                        {totalMistakes} mistake{totalMistakes !== 1 ? 's' : ''}
                                                      </span>
                                                    )}
                                                    {(() => {
                                                      const miss = Math.max(0, typeCutPieces - totalCompleted - totalMistakes);
                                                      if (miss > 0 && totalCompleted > 0) return <span className="text-red-500 font-medium">{miss} missing</span>;
                                                      if (miss === 0 && totalCompleted > 0) return <span className="text-muted-foreground">All accounted</span>;
                                                      return null;
                                                    })()}
                                                  </div>
                                                  {(() => {
                                                    const aggKey = `${typeIndex}-${op}-`;
                                                    const isEditingAgg = editingKey === aggKey;
                                                    if (isEditingAgg) {
                                                      return (
                                                        <div className="space-y-2 pt-1">
                                                          <div className="flex items-center gap-2">
                                                            <div className="flex-1">
                                                              <Label className="text-xs text-muted-foreground mb-1 block">Completed Pieces</Label>
                                                              <Input
                                                                type="number"
                                                                min={0}
                                                                max={typeCutPieces}
                                                                value={editValues[aggKey]?.completed || ''}
                                                                onChange={(e) => setEditValues(prev => ({
                                                                  ...prev,
                                                                  [aggKey]: { ...prev[aggKey], completed: e.target.value }
                                                                }))}
                                                                placeholder={`Max: ${typeCutPieces}`}
                                                                className="h-7 text-sm"
                                                                autoFocus
                                                                onKeyDown={(e) => {
                                                                  if (e.key === 'Enter') handleSaveSize(typeIndex, op, '', typeCutPieces);
                                                                  if (e.key === 'Escape') setEditingKey(null);
                                                                }}
                                                              />
                                                            </div>
                                                            <div className="flex-1">
                                                              <Label className="text-xs text-muted-foreground mb-1 block">Mistake Pieces</Label>
                                                              <Input
                                                                type="number"
                                                                min={0}
                                                                value={editValues[aggKey]?.mistakes || ''}
                                                                onChange={(e) => setEditValues(prev => ({
                                                                  ...prev,
                                                                  [aggKey]: { ...prev[aggKey], mistakes: e.target.value }
                                                                }))}
                                                                placeholder="0"
                                                                className="h-7 text-sm"
                                                                onKeyDown={(e) => {
                                                                  if (e.key === 'Enter') handleSaveSize(typeIndex, op, '', typeCutPieces);
                                                                  if (e.key === 'Escape') setEditingKey(null);
                                                                }}
                                                              />
                                                            </div>
                                                          </div>
                                                          <div className="flex items-center gap-2">
                                                            <Button size="sm" variant="default" className="h-7 text-xs" onClick={() => handleSaveSize(typeIndex, op, '', typeCutPieces)} disabled={upsertMutation.isPending}>
                                                              Save
                                                            </Button>
                                                            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setEditingKey(null)}>
                                                              Cancel
                                                            </Button>
                                                          </div>
                                                        </div>
                                                      );
                                                    }
                                                    return (
                                                      <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-6 text-xs"
                                                        onClick={() => {
                                                          setEditingKey(aggKey);
                                                          setEditValues(prev => ({
                                                            ...prev,
                                                            [aggKey]: {
                                                              completed: totalCompleted.toString(),
                                                              mistakes: totalMistakes.toString(),
                                                            }
                                                          }));
                                                        }}
                                                      >
                                                        Update
                                                      </Button>
                                                    );
                                                  })()}
                                                </div>
                                              )}
                                            </div>
                                          </CollapsibleContent>
                                        </div>
                                      </Collapsible>
                                    );
                                  })
                                )}
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        </Card>
                      );
                    })}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        );
      })}

      {/* Delivery Details Dialog */}
      <Dialog open={!!deliveryDialogStyle} onOpenChange={(open) => { if (!open) closeDeliveryDialog(); }}>
        <DialogContent className="sm:max-w-md" onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-blue-600" />
              Delivery Details
            </DialogTitle>
            {deliveryDialogStyle && (
              <p className="text-sm text-muted-foreground">{deliveryDialogStyle.styleName}</p>
            )}
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Delivery Date</Label>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn('w-full justify-start text-left font-normal', !deliveryDialogDate && 'text-muted-foreground')}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {deliveryDialogDate ? format(deliveryDialogDate, 'dd MMM yyyy') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-0 z-[300]"
                  align="start"
                  onInteractOutside={(e) => e.preventDefault()}
                >
                  <Calendar
                    mode="single"
                    selected={deliveryDialogDate}
                    onSelect={(date) => {
                      setDeliveryDialogDate(date);
                      setCalendarOpen(false);
                    }}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-1.5">
                <StickyNote className="h-3.5 w-3.5" />
                Delivery Notes
              </Label>
              <Textarea
                placeholder="Add any delivery notes, remarks or observations..."
                value={deliveryDialogNotes}
                onChange={(e) => setDeliveryDialogNotes(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={closeDeliveryDialog}>Cancel</Button>
            <Button onClick={handleConfirmDelivery} className="gap-2">
              <Truck className="h-4 w-4" />
              Confirm Delivery
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
