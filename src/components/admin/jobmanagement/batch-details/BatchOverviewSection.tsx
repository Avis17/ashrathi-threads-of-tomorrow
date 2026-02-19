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
  cuttingSummary?: Record<number, number>;
  operationProgress?: any[];
}

export const BatchOverviewSection = ({ 
  batch, 
  rollsData, 
  totalCutPieces, 
  totalCost,
  totalProductionPieces = 0,
  costBreakdown,
  styleLookup = {},
  cuttingSummary = {},
  operationProgress = [],
}: BatchOverviewSectionProps) => {
  const [costOpen, setCostOpen] = useState(false);
  const [fabricOpen, setFabricOpen] = useState(false);
  const [typesOpen, setTypesOpen] = useState(false);
  const [cutOpen, setCutOpen] = useState(false);
  const [prodOpen, setProdOpen] = useState(false);

  const totalFabric = batch.total_fabric_received_kg || 0;
  const numberOfTypes = rollsData.length;

  // Helper: get style name for a style_id
  const getStyleName = (styleId: string) => styleLookup[styleId] || `Style ${styleId?.slice(0, 6) || 'N/A'}`;

  // Build style-wise data: group type indices by style_id
  const styleGroups: Record<string, { styleName: string; typeIndices: number[] }> = {};
  rollsData.forEach((r: any, idx: number) => {
    const key = r.style_id || 'unknown';
    if (!styleGroups[key]) styleGroups[key] = { styleName: getStyleName(key), typeIndices: [] };
    styleGroups[key].typeIndices.push(idx);
  });
  const styleEntries = Object.entries(styleGroups);

  // Style-wise fabric
  const styleWiseFabric = styleEntries.map(([, sg]) => ({
    styleName: sg.styleName,
    rolls: sg.typeIndices.reduce((s, i) => s + (Number(rollsData[i]?.number_of_rolls) || 0), 0),
    weight: sg.typeIndices.reduce((s, i) => {
      const r = rollsData[i];
      return s + (Number(r?.number_of_rolls) || 0) * (Number(r?.weight) || 0);
    }, 0),
    colors: sg.typeIndices.map(i => rollsData[i]?.color).filter(Boolean),
  }));

  // Style-wise cut pieces
  const styleWiseCut = styleEntries.map(([, sg]) => ({
    styleName: sg.styleName,
    pieces: sg.typeIndices.reduce((s, i) => s + (cuttingSummary[i] || 0), 0),
  }));

  // Style-wise production done (bottleneck per type, summed per style)
  const styleWiseProd = styleEntries.map(([, sg]) => {
    let pieces = 0;
    sg.typeIndices.forEach(ti => {
      const nonCutOps = operationProgress.filter(p => p.type_index === ti && p.operation !== 'Cutting');
      if (nonCutOps.length > 0) {
        pieces += Math.min(...nonCutOps.map((o: any) => o.completed_pieces));
      }
    });
    const cutForStyle = sg.typeIndices.reduce((s, i) => s + (cuttingSummary[i] || 0), 0);
    const pct = cutForStyle > 0 ? Math.round(Math.min((pieces / cutForStyle) * 100, 100)) : 0;
    return { styleName: sg.styleName, pieces, cutForStyle, pct };
  });

  const currentProgress = totalCutPieces > 0
    ? Math.round(Math.min((totalProductionPieces / totalCutPieces) * 100, 100))
    : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">

        {/* 1. Total Fabric */}
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
                <div className="mt-3 pt-3 border-t space-y-2 text-xs">
                  {styleWiseFabric.map((s, i) => (
                    <div key={i}>
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-foreground">{s.styleName}</span>
                        <span className="font-semibold">{s.weight.toFixed(2)} kg</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground mt-0.5">
                        <span>{s.colors.join(', ')}</span>
                        <span>{s.rolls} rolls</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>

        {/* 2. Types/Colors */}
        <Card>
          <CardContent className="p-4">
            <Collapsible open={typesOpen} onOpenChange={setTypesOpen}>
              <CollapsibleTrigger className="w-full">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <Package className="h-5 w-5 text-purple-500" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      Types/Colors
                      <ChevronDown className={`h-3 w-3 transition-transform ${typesOpen ? 'rotate-180' : ''}`} />
                    </p>
                    <p className="text-xl font-bold">{numberOfTypes}</p>
                    <p className="text-xs text-muted-foreground">{styleEntries.length} style(s)</p>
                  </div>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-3 pt-3 border-t space-y-2 text-xs">
                  {styleEntries.map(([, sg], i) => (
                    <div key={i}>
                      <span className="font-medium text-foreground">{sg.styleName}</span>
                      <div className="text-muted-foreground mt-0.5 space-y-0.5">
                        {sg.typeIndices.map(ti => (
                          <div key={ti} className="flex justify-between">
                            <span>{rollsData[ti]?.color || `Type ${ti + 1}`}</span>
                            <span>{rollsData[ti]?.fabric_type} {rollsData[ti]?.gsm ? `/ ${rollsData[ti].gsm} GSM` : ''}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>

        {/* 3. Total Cut Pieces */}
        <Card>
          <CardContent className="p-4">
            <Collapsible open={cutOpen} onOpenChange={setCutOpen}>
              <CollapsibleTrigger className="w-full">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <Scissors className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      Total Cut Pieces
                      <ChevronDown className={`h-3 w-3 transition-transform ${cutOpen ? 'rotate-180' : ''}`} />
                    </p>
                    <p className="text-xl font-bold">{totalCutPieces}</p>
                    <p className="text-xs text-muted-foreground">Expected: {batch.expected_pieces || 'TBD'}</p>
                  </div>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-3 pt-3 border-t space-y-2 text-xs">
                  {styleWiseCut.map((s, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <span className="text-muted-foreground truncate">{s.styleName}</span>
                      <span className="font-semibold shrink-0">{s.pieces} pcs</span>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>

        {/* 4. Production Done */}
        <Card>
          <CardContent className="p-4">
            <Collapsible open={prodOpen} onOpenChange={setProdOpen}>
              <CollapsibleTrigger className="w-full">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-500/10">
                    <Users className="h-5 w-5 text-orange-500" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      Production Done
                      <ChevronDown className={`h-3 w-3 transition-transform ${prodOpen ? 'rotate-180' : ''}`} />
                    </p>
                    <p className="text-xl font-bold">{totalProductionPieces}</p>
                    <p className="text-xs text-muted-foreground">
                      {totalCutPieces > 0 ? `${currentProgress}% of cut` : 'No cut pieces yet'}
                    </p>
                  </div>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-3 pt-3 border-t space-y-2 text-xs">
                  {styleWiseProd.map((s, i) => (
                    <div key={i}>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground truncate">{s.styleName}</span>
                        <span className="font-semibold shrink-0">{s.pieces} pcs ({s.pct}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>

        {/* 5. Total Cost */}
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

      {/* Production Progress - style-wise bars */}
      <Collapsible defaultOpen={false}>
        <Card>
          <CardContent className="p-4">
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Production Progress (Overall)</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-primary">{currentProgress}%</span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 [[data-state=open]_&]:rotate-180" />
                </div>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-3 space-y-4">
                <div>
                  <Progress value={currentProgress} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Cut: {totalCutPieces} pcs</span>
                    <span>Produced: {totalProductionPieces} pcs</span>
                    <span>Remaining: {Math.max(0, totalCutPieces - totalProductionPieces)} pcs</span>
                  </div>
                </div>

                {styleWiseProd.length > 1 && (
                  <div className="pt-2 border-t space-y-3">
                    {styleWiseProd.map((s, i) => (
                      <div key={i}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium">{s.styleName}</span>
                          <span className="text-xs text-muted-foreground">{s.pieces}/{s.cutForStyle} pcs · {s.pct}%</span>
                        </div>
                        <Progress value={s.pct} className="h-1.5" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </CardContent>
        </Card>
      </Collapsible>
    </div>
  );
};
