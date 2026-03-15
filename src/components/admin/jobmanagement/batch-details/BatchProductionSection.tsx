import { useState, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  CheckCircle, AlertCircle, ChevronDown, ChevronRight,
  Briefcase, AlertTriangle, Truck, CalendarClock, CalendarCheck, TrendingDown, TrendingUp, CalendarIcon, StickyNote, Settings, Layers, GripVertical,
} from 'lucide-react';
import { useBatchOperationProgress, useUpsertOperationProgress } from '@/hooks/useBatchOperationProgress';
import { useBatchJobWorks } from '@/hooks/useJobWorks';
import { useUpdateJobBatch } from '@/hooks/useJobBatches';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useBatchTypeConfirmed, useUpsertDeliveryStatus, DELIVERY_STATUSES, DeliveryStatus } from '@/hooks/useBatchTypeConfirmed';
import { useBatchDeliveryInfo, BatchDeliveryInfo } from '@/hooks/useBatchDeliveryInfo';
import { DeliveryDetailsDialog } from './DeliveryDetailsDialog';
import { differenceInDays, format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

// Sortable operation item for drag-and-drop reordering
function SortableOperationItem({ id, onRemove }: { id: string; onRemove: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-1.5 bg-background border rounded-md px-2 py-1 text-sm group"
    >
      <span className="cursor-grab text-muted-foreground" {...attributes} {...listeners}>
        <GripVertical className="h-3.5 w-3.5" />
      </span>
      <span className="flex-1">{id}</span>
      <button
        className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold"
        onClick={() => onRemove(id)}
      >
        ×
      </button>
    </div>
  );
}

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

const STANDARD_OPERATIONS = ['Cutting', 'Stitching', 'Checking', 'Ironing', 'Packing', 'Delivered'];

const normalizeOperation = (op: string): string => {
  const lower = op.toLowerCase();
  if (lower.includes('stitching') || lower.includes('singer') || lower.includes('power table') || lower.includes('powertable')) return 'Stitching';
  if (lower.includes('cutting')) return 'Cutting';
  if (lower.includes('checking')) return 'Checking';
  if (lower.includes('ironing')) return 'Ironing';
  if (lower.includes('packing')) return 'Packing';
  if (lower.includes('delivered')) return 'Delivered';
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
  const { data: deliveryInfoList = [] } = useBatchDeliveryInfo(batchId);
  const confirmedMap = typeData?.confirmedMap ?? {};
  const statusMap = typeData?.statusMap ?? {};
  const actualDeliveryDateMap = typeData?.actualDeliveryDateMap ?? {};
  const deliveryNotesMap = typeData?.deliveryNotesMap ?? {};
  const upsertMutation = useUpsertOperationProgress();
  const upsertStatusMutation = useUpsertDeliveryStatus();
  const updateBatchMutation = useUpdateJobBatch();

  // Build delivery info lookup by style_id
  const deliveryInfoMap: Record<string, BatchDeliveryInfo> = {};
  deliveryInfoList.forEach(info => { deliveryInfoMap[info.style_id] = info; });

  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, { completed: string; mistakes: string }>>({});
  const [allExpanded, setAllExpanded] = useState(true);
  const [openStyles, setOpenStyles] = useState<Record<string, boolean>>({});
  const [openColors, setOpenColors] = useState<Record<number, boolean>>({});
  const [openOps, setOpenOps] = useState<Record<string, boolean>>({});

  // Operations editing state (per style)
  const [opsEditingStyleId, setOpsEditingStyleId] = useState<string | null>(null);
  const [opsEditingValues, setOpsEditingValues] = useState<string[]>([]);
  const [customOpInput, setCustomOpInput] = useState('');
  const opsDndSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Delivery dialog state
  const [deliveryDialogStyle, setDeliveryDialogStyle] = useState<StyleGroup | null>(null);

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
  // Key: `${type_index}-${operation}-${size}` => { completed, mistakes, notes }
  const sizeProgressMap: Record<string, { completed: number; mistakes: number; notes: string[] }> = {};
  // Also build aggregate (no size) for backward compat
  const aggProgressMap: Record<string, { completed: number; mistakes: number; notes: string[] }> = {};
  
  progressData.forEach(p => {
    const normalizedOp = normalizeOperation(p.operation);
    const sizeKey = `${p.type_index}-${normalizedOp}-${p.size || ''}`;
    if (!sizeProgressMap[sizeKey]) {
      sizeProgressMap[sizeKey] = { completed: 0, mistakes: 0, notes: [] };
    }
    sizeProgressMap[sizeKey].completed += p.completed_pieces;
    sizeProgressMap[sizeKey].mistakes += (p.mistake_pieces || 0);
    if (p.notes) sizeProgressMap[sizeKey].notes.push(p.notes);
    // Aggregate
    const aggKey = `${p.type_index}-${normalizedOp}`;
    if (!aggProgressMap[aggKey]) aggProgressMap[aggKey] = { completed: 0, mistakes: 0, notes: [] };
    aggProgressMap[aggKey].completed += p.completed_pieces;
    aggProgressMap[aggKey].mistakes += (p.mistake_pieces || 0);
    if (p.notes) aggProgressMap[aggKey].notes.push(p.notes);
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
    const type = rollsData[typeIndex];
    if (type?.operations && Array.isArray(type.operations) && type.operations.length > 0) {
      // Normalize standard operations, keep custom ones as-is
      const seen = new Set<string>();
      return type.operations.map((op: string) => {
        const normalized = normalizeOperation(op);
        // If it normalizes to a standard op, use normalized; otherwise keep original
        return STANDARD_OPERATIONS.includes(normalized) ? normalized : op;
      }).filter((op: string) => {
        if (seen.has(op)) return false;
        seen.add(op);
        return true;
      });
    }
    return STANDARD_OPERATIONS;
  };

  const handleSaveStyleOperations = async (sg: StyleGroup, newOps: string[]) => {
    const updatedRollsData = [...rollsData];
    sg.typeIndices.forEach(idx => {
      updatedRollsData[idx] = { ...updatedRollsData[idx], operations: newOps };
    });
    await updateBatchMutation.mutateAsync({
      id: batchId,
      data: { rolls_data: updatedRollsData as any },
    });
    setOpsEditingStyleId(null);
    setOpsEditingValues([]);
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
    if (op === 'Cutting') {
      // Strip Top-/Bottom- prefix for cutting since cutting data uses raw sizes
      const rawSize = size.replace(/^(Top|Bottom)-/, '');
      return cuttingSizeSummary[typeIndex]?.[rawSize] || 0;
    }
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
    setDeliveryDialogStyle(sg);
  };

  const closeDeliveryDialog = () => {
    setDeliveryDialogStyle(null);
  };

  const handleConfirmDeliveryFromDialog = (dateStr: string | null, notes: string | null) => {
    if (!deliveryDialogStyle) return;
    deliveryDialogStyle.typeIndices.forEach(idx => {
      upsertStatusMutation.mutate({
        batchId,
        typeIndex: idx,
        deliveryStatus: 'delivered',
        actualDeliveryDate: dateStr,
        deliveryNotes: notes,
      });
    });
    closeDeliveryDialog();
  };

  const getStyleAvailableSizes = (sg: StyleGroup): string[] => {
    const allSizes = new Set<string>();
    sg.typeIndices.forEach(idx => {
      getTypeSizes(idx).forEach(s => allSizes.add(s));
    });
    return SIZE_ORDER.filter(s => allSizes.has(s));
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

                  {/* Operations config and Set Item toggle at style level */}
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs text-muted-foreground font-medium">
                      {getTypeOperations(sg.typeIndices[0]).length} operation{getTypeOperations(sg.typeIndices[0]).length !== 1 ? 's' : ''} tracked
                    </span>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <Switch
                          checked={rollsData[sg.typeIndices[0]]?.is_set_item || false}
                          onCheckedChange={async (checked) => {
                            const updatedRollsData = [...rollsData];
                            sg.typeIndices.forEach(idx => {
                              updatedRollsData[idx] = { ...updatedRollsData[idx], is_set_item: checked };
                            });
                            await updateBatchMutation.mutateAsync({
                              id: batchId,
                              data: { rolls_data: updatedRollsData as any },
                            });
                          }}
                        />
                        <span className="text-xs font-medium flex items-center gap-1">
                          <Layers className="h-3.5 w-3.5" />
                          Set Item
                        </span>
                      </label>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs gap-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpsEditingStyleId(sg.styleId);
                          setOpsEditingValues([...getTypeOperations(sg.typeIndices[0])]);
                        }}
                      >
                        <Settings className="h-3.5 w-3.5" />
                        Edit Operations
                      </Button>
                    </div>
                  </div>

                  {opsEditingStyleId === sg.styleId && (
                    <div className="border rounded-lg p-3 bg-muted/30 space-y-3 mx-1">
                      <div className="text-sm font-medium">Configure Operations for {sg.styleName}</div>
                      {/* Add operations: standard checkboxes */}
                      <div className="space-y-1.5">
                        <span className="text-xs text-muted-foreground font-medium">Add Operations</span>
                        <div className="grid grid-cols-3 gap-2">
                          {STANDARD_OPERATIONS.map(op => (
                            <label key={op} className="flex items-center gap-2 cursor-pointer">
                              <Checkbox
                                checked={opsEditingValues.includes(op)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setOpsEditingValues(prev => [...prev, op]);
                                  } else {
                                    setOpsEditingValues(prev => prev.filter(o => o !== op));
                                  }
                                }}
                              />
                              <span className="text-sm">{op}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      {/* Add custom operation input */}
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="Add custom operation (e.g., Embroidery, Printing)"
                          value={customOpInput}
                          onChange={(e) => setCustomOpInput(e.target.value)}
                          className="h-8 text-sm flex-1"
                          maxLength={50}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const trimmed = customOpInput.trim();
                              if (trimmed && !opsEditingValues.some(o => o.toLowerCase() === trimmed.toLowerCase())) {
                                setOpsEditingValues(prev => [...prev, trimmed]);
                                setCustomOpInput('');
                              }
                            }
                          }}
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs"
                          disabled={!customOpInput.trim() || opsEditingValues.some(o => o.toLowerCase() === customOpInput.trim().toLowerCase())}
                          onClick={() => {
                            const trimmed = customOpInput.trim();
                            if (trimmed && !opsEditingValues.some(o => o.toLowerCase() === trimmed.toLowerCase())) {
                              setOpsEditingValues(prev => [...prev, trimmed]);
                              setCustomOpInput('');
                            }
                          }}
                        >
                          + Add
                        </Button>
                      </div>
                      {/* Sortable selected operations list */}
                      {opsEditingValues.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-xs text-muted-foreground font-medium">Operation Order (drag to reorder)</span>
                          <DndContext
                            sensors={opsDndSensors}
                            collisionDetection={closestCenter}
                            onDragEnd={(event: DragEndEvent) => {
                              const { active, over } = event;
                              if (over && active.id !== over.id) {
                                const oldIdx = opsEditingValues.indexOf(String(active.id));
                                const newIdx = opsEditingValues.indexOf(String(over.id));
                                setOpsEditingValues(arrayMove(opsEditingValues, oldIdx, newIdx));
                              }
                            }}
                          >
                            <SortableContext items={opsEditingValues} strategy={verticalListSortingStrategy}>
                              <div className="space-y-1">
                                {opsEditingValues.map((op) => (
                                  <SortableOperationItem
                                    key={op}
                                    id={op}
                                    onRemove={(id) => setOpsEditingValues(prev => prev.filter(o => o !== id))}
                                  />
                                ))}
                              </div>
                            </SortableContext>
                          </DndContext>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          className="h-7 text-xs"
                          disabled={opsEditingValues.length === 0 || updateBatchMutation.isPending}
                          onClick={() => handleSaveStyleOperations(sg, opsEditingValues)}
                        >
                          {updateBatchMutation.isPending ? 'Saving...' : 'Save'}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs"
                          onClick={() => { setOpsEditingStyleId(null); setOpsEditingValues([]); setCustomOpInput(''); }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Delivery Info Card */}
                   {(() => {
                    const dInfo = deliveryInfoMap[sg.styleId];
                    if (!dInfo || (dInfo.pieces_given === 0 && dInfo.sample_pieces_given === 0 && dInfo.weight_entries.length === 0)) return null;
                    const totalPcs = dInfo.pieces_given + dInfo.sample_pieces_given;
                    const totalProductWtGrams = dInfo.total_product_weight_grams;
                    // Calculate fabric weight live from rollsData instead of stored value
                    const fabricWtGrams = sg.typeIndices.reduce((sum, idx) => {
                      const type = rollsData[idx];
                      if (!type) return sum;
                      const weightPerRoll = parseFloat(type.weight) || 0;
                      const rolls = parseInt(type.number_of_rolls) || 0;
                      return sum + weightPerRoll * rolls * 1000;
                    }, 0);
                    const wastageWt = fabricWtGrams - totalProductWtGrams;
                    return (
                      <div className="border rounded-lg p-4 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 space-y-3">
                        <div className="flex items-center gap-2">
                          <Truck className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-semibold">Delivery & Wastage Summary</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div className="bg-background rounded-lg p-3 text-center border">
                            <div className="text-xs text-muted-foreground">Pieces Given</div>
                            <div className="text-lg font-bold">{dInfo.pieces_given}</div>
                          </div>
                          <div className="bg-background rounded-lg p-3 text-center border">
                            <div className="text-xs text-muted-foreground">Sample Pieces</div>
                            <div className="text-lg font-bold">{dInfo.sample_pieces_given}</div>
                          </div>
                          <div className="bg-background rounded-lg p-3 text-center border">
                            <div className="text-xs text-muted-foreground">Total Pieces</div>
                            <div className="text-lg font-bold text-primary">{totalPcs}</div>
                          </div>
                          <div className="bg-background rounded-lg p-3 text-center border">
                            <div className="text-xs text-muted-foreground">Wt / Piece</div>
                            <div className="text-lg font-bold">{dInfo.total_product_weight_grams.toFixed(1)}g</div>
                          </div>
                        </div>
                        {dInfo.weight_entries.length > 0 && (
                          <div className="space-y-2">
                            <div className="text-xs font-medium text-muted-foreground">Size-wise Weight Breakdown</div>
                            <div className="flex flex-wrap gap-2">
                              {dInfo.weight_entries.map((w, i) => (
                                <Badge key={i} variant="secondary" className="text-xs gap-1">
                                  {w.size}{w.part !== 'single' ? ` (${w.part})` : ''}: {w.weight_grams}g
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t">
                          <div className="bg-background rounded-lg p-3 text-center border">
                            <div className="text-xs text-muted-foreground">Fabric Issued</div>
                            <div className="text-sm font-bold">{(fabricWtGrams / 1000).toFixed(2)} kg</div>
                          </div>
                          <div className="bg-background rounded-lg p-3 text-center border">
                            <div className="text-xs text-muted-foreground">Product Weight</div>
                            <div className="text-sm font-bold">{totalProductWtGrams.toFixed(1)} g</div>
                          </div>
                          <div className="bg-background rounded-lg p-3 text-center border">
                            <div className="text-xs text-muted-foreground">Wastage</div>
                            <div className="text-sm font-bold">{(wastageWt / 1000).toFixed(2)} kg</div>
                          </div>
                          {(() => {
                            const wastagePercent = fabricWtGrams > 0 ? Math.max(0, (wastageWt / fabricWtGrams) * 100) : 0;
                            return (
                              <div className={cn(
                                "bg-background rounded-lg p-3 text-center border",
                                wastagePercent > 20 ? 'border-destructive/50' : wastagePercent > 10 ? 'border-amber-400' : 'border-green-400'
                              )}>
                                <div className="text-xs text-muted-foreground">Wastage %</div>
                                <div className={cn(
                                  "text-lg font-bold",
                                  wastagePercent > 20 ? 'text-destructive' : wastagePercent > 10 ? 'text-amber-600' : 'text-green-600'
                                )}>
                                  {wastagePercent.toFixed(2)}%
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    );
                  })()}

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
                      const isSetItem = type?.is_set_item || false;

                      const renderOperationContent = (op: string, partPrefix: string = '') => {
                        const opKey = partPrefix ? `${typeIndex}-${partPrefix}-${op}` : `${typeIndex}-${op}`;
                        
                        // For set items with prefix, filter sizes and progress by prefix
                        const displaySizes = partPrefix && hasSizes ? sizes : (hasSizes ? sizes : []);
                        const getPartSizeCompleted = (size: string) => {
                          const sizeKey = partPrefix ? `${partPrefix}-${size}` : size;
                          return getSizeCompleted(typeIndex, op, sizeKey);
                        };
                        const getPartSizeMistakes = (size: string) => {
                          const sizeKey = partPrefix ? `${partPrefix}-${size}` : size;
                          return getSizeMistakes(typeIndex, op, sizeKey);
                        };
                        const partTotalCompleted = partPrefix && hasSizes
                          ? displaySizes.reduce((sum, s) => sum + getPartSizeCompleted(s), 0)
                          : getOpTotalCompleted(typeIndex, op);
                        const partTotalMistakes = partPrefix && hasSizes
                          ? displaySizes.reduce((sum, s) => sum + getPartSizeMistakes(s), 0)
                          : getOpTotalMistakes(typeIndex, op);
                        const partCutPieces = typeCutPieces; // same cut count for both parts
                        const percent = partCutPieces > 0 ? Math.min(Math.round((partTotalCompleted / partCutPieces) * 100), 100) : 0;
                        const opOpen = isOpOpen(opKey);

                        return (
                          <Collapsible key={opKey} open={opOpen} onOpenChange={() => toggleOp(opKey)}>
                            <div className="border rounded-lg overflow-hidden bg-background">
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
                                      <span className="text-green-600 font-medium">✓ {partTotalCompleted}</span>
                                      {partTotalMistakes > 0 && (
                                        <span className="text-orange-500 font-medium flex items-center gap-0.5">
                                          <AlertTriangle className="h-3 w-3" />{partTotalMistakes}
                                        </span>
                                      )}
                                      <span className="text-muted-foreground">/ {partCutPieces}</span>
                                      {!partPrefix && (aggProgressMap[`${typeIndex}-${op}`]?.notes?.length || 0) > 0 && (
                                        <StickyNote className="h-3 w-3 text-amber-500" />
                                      )}
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
                                  {displaySizes.length > 0 ? (
                                    <div className="space-y-2">
                                      <div className="text-xs font-medium text-muted-foreground mb-2">Size-wise Progress</div>
                                      <div className="grid gap-2">
                                        {displaySizes.map(size => {
                                          const cutForSize = cuttingSizeSummary[typeIndex]?.[size] || 0;
                                          const sizeCompleted = getPartSizeCompleted(size);
                                          const sizeMistakes = getPartSizeMistakes(size);
                                          const sizePercent = cutForSize > 0 ? Math.min(Math.round((sizeCompleted / cutForSize) * 100), 100) : 0;
                                          const actualSizeKey = partPrefix ? `${partPrefix}-${size}` : size;
                                          const sizeEditKey = `${typeIndex}-${op}-${actualSizeKey}`;
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

                                              {/* Notes */}
                                              {(() => {
                                                const sizeNotes = sizeProgressMap[sizeEditKey]?.notes || [];
                                                if (sizeNotes.length === 0) return null;
                                                return (
                                                  <div className="flex items-start gap-1.5 text-xs text-muted-foreground mb-1.5">
                                                    <StickyNote className="h-3 w-3 mt-0.5 shrink-0 text-amber-500" />
                                                    <span className="italic">{sizeNotes.join(' | ')}</span>
                                                  </div>
                                                );
                                              })()}

                                              {op !== 'Cutting' && (isEditingThis ? (
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
                                                          if (e.key === 'Enter') handleSaveSize(typeIndex, op, actualSizeKey, cutForSize);
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
                                                          if (e.key === 'Enter') handleSaveSize(typeIndex, op, actualSizeKey, cutForSize);
                                                          if (e.key === 'Escape') setEditingKey(null);
                                                        }}
                                                      />
                                                    </div>
                                                  </div>
                                                  <div className="flex items-center gap-2">
                                                    <Button size="sm" variant="default" className="h-6 text-xs" onClick={() => handleSaveSize(typeIndex, op, actualSizeKey, cutForSize)} disabled={upsertMutation.isPending}>
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
                                              ))}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="space-y-2">
                                      <div className="flex items-center gap-3 text-xs">
                                        <span className="text-green-600 font-medium">✓ {partTotalCompleted} done</span>
                                        {partTotalMistakes > 0 && (
                                          <span className="text-orange-500 font-medium flex items-center gap-1">
                                            <AlertTriangle className="h-3 w-3" />
                                            {partTotalMistakes} mistake{partTotalMistakes !== 1 ? 's' : ''}
                                          </span>
                                        )}
                                        {(() => {
                                          const miss = Math.max(0, partCutPieces - partTotalCompleted - partTotalMistakes);
                                          if (miss > 0 && partTotalCompleted > 0) return <span className="text-red-500 font-medium">{miss} missing</span>;
                                          if (miss === 0 && partTotalCompleted > 0) return <span className="text-muted-foreground">All accounted</span>;
                                          return null;
                                        })()}
                                      </div>
                                      {!partPrefix && (() => {
                                        const opNotes = aggProgressMap[`${typeIndex}-${op}`]?.notes || [];
                                        if (opNotes.length === 0) return null;
                                        return (
                                          <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
                                            <StickyNote className="h-3 w-3 mt-0.5 shrink-0 text-amber-500" />
                                            <span className="italic">{opNotes.join(' | ')}</span>
                                          </div>
                                        );
                                      })()}
                                      {op !== 'Cutting' && (() => {
                                        const aggSizeKey = partPrefix ? `${typeIndex}-${op}-${partPrefix}-` : `${typeIndex}-${op}-`;
                                        const isEditingAgg = editingKey === aggSizeKey;
                                        if (isEditingAgg) {
                                          return (
                                            <div className="space-y-2 pt-1">
                                              <div className="flex items-center gap-2">
                                                <div className="flex-1">
                                                  <Label className="text-xs text-muted-foreground mb-1 block">Completed Pieces</Label>
                                                  <Input
                                                    type="number"
                                                    min={0}
                                                    max={partCutPieces}
                                                    value={editValues[aggSizeKey]?.completed || ''}
                                                    onChange={(e) => setEditValues(prev => ({
                                                      ...prev,
                                                      [aggSizeKey]: { ...prev[aggSizeKey], completed: e.target.value }
                                                    }))}
                                                    placeholder={`Max: ${partCutPieces}`}
                                                    className="h-7 text-sm"
                                                    autoFocus
                                                    onKeyDown={(e) => {
                                                      if (e.key === 'Enter') handleSaveSize(typeIndex, op, partPrefix ? `${partPrefix}-` : '', partCutPieces);
                                                      if (e.key === 'Escape') setEditingKey(null);
                                                    }}
                                                  />
                                                </div>
                                                <div className="flex-1">
                                                  <Label className="text-xs text-muted-foreground mb-1 block">Mistake Pieces</Label>
                                                  <Input
                                                    type="number"
                                                    min={0}
                                                    value={editValues[aggSizeKey]?.mistakes || ''}
                                                    onChange={(e) => setEditValues(prev => ({
                                                      ...prev,
                                                      [aggSizeKey]: { ...prev[aggSizeKey], mistakes: e.target.value }
                                                    }))}
                                                    placeholder="0"
                                                    className="h-7 text-sm"
                                                    onKeyDown={(e) => {
                                                      if (e.key === 'Enter') handleSaveSize(typeIndex, op, partPrefix ? `${partPrefix}-` : '', partCutPieces);
                                                      if (e.key === 'Escape') setEditingKey(null);
                                                    }}
                                                  />
                                                </div>
                                              </div>
                                              <div className="flex items-center gap-2">
                                                <Button size="sm" variant="default" className="h-7 text-xs" onClick={() => handleSaveSize(typeIndex, op, partPrefix ? `${partPrefix}-` : '', partCutPieces)} disabled={upsertMutation.isPending}>
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
                                              setEditingKey(aggSizeKey);
                                              setEditValues(prev => ({
                                                ...prev,
                                                [aggSizeKey]: {
                                                  completed: partTotalCompleted.toString(),
                                                  mistakes: partTotalMistakes.toString(),
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
                      };

                      // Compute production summary per part (or overall for non-set items)
                      const getPartSummary = (partPrefix: string) => {
                        const nonCuttingOps = typeOps.filter(op => op !== 'Cutting');
                        if (nonCuttingOps.length === 0 || typeCutPieces === 0) return null;

                        let lastOpWithProgress = '';
                        let lastOpCompleted = 0;
                        let lastOpMistakes = 0;
                        let minCompleted = typeCutPieces;
                        let totalMistakes = 0;
                        let hasAnyProgress = false;

                        for (const op of nonCuttingOps) {
                          let completed = 0;
                          let mistakes = 0;

                          if (partPrefix && hasSizes) {
                            // For set items, sum across sizes with the part prefix
                            for (const size of sizes) {
                              const prefixedSize = `${partPrefix}-${size}`;
                              completed += getSizeCompleted(typeIndex, op, prefixedSize);
                              mistakes += getSizeMistakes(typeIndex, op, prefixedSize);
                            }
                          } else if (hasSizes) {
                            for (const size of sizes) {
                              completed += getSizeCompleted(typeIndex, op, size);
                              mistakes += getSizeMistakes(typeIndex, op, size);
                            }
                          } else {
                            completed = getOpTotalCompleted(typeIndex, op);
                            mistakes = getOpTotalMistakes(typeIndex, op);
                          }

                          totalMistakes += mistakes;
                          if (completed > 0 || mistakes > 0) {
                            hasAnyProgress = true;
                            lastOpWithProgress = op;
                            lastOpCompleted = completed;
                            lastOpMistakes = mistakes;
                            minCompleted = Math.min(minCompleted, completed);
                          }
                        }

                        if (!hasAnyProgress) return null;

                        const ready = minCompleted;
                        const missing = Math.max(0, typeCutPieces - lastOpCompleted - lastOpMistakes);

                        return { ready, mistakes: totalMistakes, missing, lastOp: lastOpWithProgress };
                      };

                      const confirmedPieces = confirmedMap[typeIndex] || 0;

                      const renderPartSummary = (label: string, summary: ReturnType<typeof getPartSummary>, colorClass: string) => {
                        if (!summary) return null;
                        const required = confirmedPieces > 0 ? Math.max(0, confirmedPieces - summary.ready) : 0;
                        return (
                          <div className="flex items-center gap-2 flex-wrap">
                            {label && (
                              <span className={cn('text-xs font-semibold', colorClass)}>{label}:</span>
                            )}
                            <span className="text-xs font-medium text-green-600 flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" />
                              {summary.ready} ready
                            </span>
                            {summary.mistakes > 0 && (
                              <span className="text-xs font-medium text-orange-500 flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                {summary.mistakes} mistakes
                              </span>
                            )}
                            {summary.missing > 0 && (
                              <span className="text-xs font-medium text-red-500 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                {summary.missing} missing
                              </span>
                            )}
                            {required > 0 && (
                              <span className="text-xs font-semibold text-purple-600 flex items-center gap-1">
                                ⚡ {required} required
                              </span>
                            )}
                            <span className="text-[10px] text-muted-foreground italic">(at {summary.lastOp})</span>
                          </div>
                        );
                      };

                      const prodSummaryTop = isSetItem ? getPartSummary('Top') : null;
                      const prodSummaryBottom = isSetItem ? getPartSummary('Bottom') : null;
                      const prodSummary = !isSetItem ? getPartSummary('') : null;

                      const renderColorHeader = () => (
                        <div className={cn('flex items-center justify-between p-4 hover:bg-muted/20 transition-colors cursor-pointer', palette.bg)}>
                          <div className="flex items-center gap-3">
                            {colorOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            <div className="text-left">
                              <div className="flex items-center gap-2">
                                <span className={cn('font-semibold text-sm', palette.accent)}>{colorLabel}</span>
                                {type?.fabric_type && (
                                  <span className="text-xs text-muted-foreground">· {type.fabric_type}{type.gsm ? ` / ${type.gsm} GSM` : ''}</span>
                                )}
                                {isSetItem && (
                                  <Badge variant="secondary" className="text-xs gap-1">
                                    <Layers className="h-2.5 w-2.5" /> Set
                                  </Badge>
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
                              {/* Production Status Summary */}
                              {isSetItem ? (
                                (prodSummaryTop || prodSummaryBottom) && (
                                  <div className="mt-1.5 space-y-0.5">
                                    {renderPartSummary('Top', prodSummaryTop, 'text-sky-700')}
                                    {renderPartSummary('Bottom', prodSummaryBottom, 'text-indigo-700')}
                                  </div>
                                )
                              ) : (
                                prodSummary && (
                                  <div className="mt-1.5">
                                    {renderPartSummary('', prodSummary, '')}
                                  </div>
                                )
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
                      );

                      return (
                        <Card
                          key={typeIndex}
                          className={cn(
                            'overflow-hidden border-l-4',
                            palette.border,
                            isJobWorkColor && 'ring-1 ring-blue-200'
                          )}
                          style={{ borderLeftColor: palette.bar.includes('blue') ? '#3b82f6' : palette.bar.includes('emerald') ? '#10b981' : palette.bar.includes('violet') ? '#8b5cf6' : palette.bar.includes('amber') ? '#f59e0b' : palette.bar.includes('rose') ? '#f43f5e' : palette.bar.includes('cyan') ? '#06b6d4' : palette.bar.includes('orange') ? '#f97316' : '#14b8a6' }}
                        >
                          <Collapsible open={colorOpen} onOpenChange={() => toggleColor(typeIndex)}>
                            <CollapsibleTrigger className="w-full">
                              {renderColorHeader()}
                            </CollapsibleTrigger>

                            <CollapsibleContent>
                              <div className="px-4 pb-4 space-y-3">
                                {typeCutPieces === 0 ? (
                                  <p className="text-sm text-muted-foreground py-3 text-center">No pieces cut yet. Add cutting entries first.</p>
                                ) : isSetItem ? (
                                  /* Set Item: 2-column layout for Top and Bottom */
                                  <div className="grid grid-cols-2 gap-4">
                                    {['Top', 'Bottom'].map(part => (
                                      <div key={part} className={cn(
                                        'rounded-lg border p-3 space-y-3',
                                        part === 'Top' ? 'bg-sky-50/50 border-sky-200 dark:bg-sky-950/20' : 'bg-indigo-50/50 border-indigo-200 dark:bg-indigo-950/20'
                                      )}>
                                        <div className="flex items-center gap-2 pb-2 border-b">
                                          <Badge variant="outline" className={cn(
                                            'text-xs font-semibold',
                                            part === 'Top' ? 'border-sky-400 text-sky-700 dark:text-sky-300' : 'border-indigo-400 text-indigo-700 dark:text-indigo-300'
                                          )}>
                                            {part}
                                          </Badge>
                                          {hasSizes && (
                                            <div className="flex gap-1 flex-wrap">
                                              {sizes.map(size => (
                                                <span key={size} className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">
                                                  {size}
                                                </span>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                        {typeOps.map(op => renderOperationContent(op, part))}
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  /* Normal: single column operations */
                                  typeOps.map(op => renderOperationContent(op))
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
      <DeliveryDetailsDialog
        open={!!deliveryDialogStyle}
        onOpenChange={(open) => { if (!open) closeDeliveryDialog(); }}
        styleGroup={deliveryDialogStyle}
        batchId={batchId}
        existingDate={deliveryDialogStyle ? getStyleActualDeliveryDate(deliveryDialogStyle) : null}
        existingNotes={deliveryDialogStyle ? getStyleDeliveryNotes(deliveryDialogStyle) : null}
        existingDeliveryInfo={deliveryDialogStyle ? (deliveryInfoMap[deliveryDialogStyle.styleId] || null) : null}
        rollsData={rollsData}
        totalFabricWeightKg={0}
        isSetItem={deliveryDialogStyle ? (rollsData[deliveryDialogStyle.typeIndices[0]]?.is_set_item || false) : false}
        availableSizes={deliveryDialogStyle ? getStyleAvailableSizes(deliveryDialogStyle) : []}
        onConfirmDelivery={handleConfirmDeliveryFromDialog}
      />
    </div>
  );
};
