import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FileText, Check, Pencil, Scissors, CheckSquare } from 'lucide-react';
import { useBatchTypeConfirmed, useUpsertBatchTypeConfirmed } from '@/hooks/useBatchTypeConfirmed';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface BatchTypesTableProps {
  rollsData: any[];
  cuttingSummary: Record<number, number>;
  batchId: string;
}

export const BatchTypesTable = ({ rollsData, cuttingSummary, batchId }: BatchTypesTableProps) => {
  const { data: confirmedMap = {} } = useBatchTypeConfirmed(batchId);
  const upsert = useUpsertBatchTypeConfirmed();

  // Fetch all style names
  const { data: allStyles = [] } = useQuery({
    queryKey: ['job-styles-all'],
    queryFn: async () => {
      const { data, error } = await supabase.from('job_styles').select('id, style_name, style_code');
      if (error) throw error;
      return data || [];
    },
  });
  const styleLookup: Record<string, { name: string; code: string }> = {};
  allStyles.forEach((s: any) => { styleLookup[s.id] = { name: s.style_name, code: s.style_code }; });

  // Build per-style stats
  const styleStats: Record<string, { styleName: string; styleCode: string; totalCut: number; totalConfirmed: number; colorCount: number }> = {};
  rollsData.forEach((type, index) => {
    const sid = type.style_id || '__unknown__';
    if (!styleStats[sid]) {
      const s = styleLookup[sid];
      styleStats[sid] = { styleName: s?.name || 'Unknown Style', styleCode: s?.code || '', totalCut: 0, totalConfirmed: 0, colorCount: 0 };
    }
    styleStats[sid].totalCut += cuttingSummary[index] || 0;
    styleStats[sid].totalConfirmed += confirmedMap[index] || 0;
    styleStats[sid].colorCount += 1;
  });

  // editing state: typeIndex -> local value
  const [editing, setEditing] = useState<Record<number, string>>({});
  const [activeEdit, setActiveEdit] = useState<number | null>(null);

  const handleEdit = (index: number) => {
    setActiveEdit(index);
    setEditing(prev => ({ ...prev, [index]: String(confirmedMap[index] ?? 0) }));
  };

  const handleSave = async (index: number) => {
    const val = parseInt(editing[index] ?? '0', 10);
    await upsert.mutateAsync({ batchId, typeIndex: index, confirmedPieces: isNaN(val) ? 0 : val });
    setActiveEdit(null);
  };

  const styleEntries = Object.entries(styleStats);

  return (
    <div className="space-y-4">
      {/* Per-Style Summary Cards */}
      {styleEntries.length > 0 && (
        <div className={`grid gap-4 ${styleEntries.length === 1 ? 'grid-cols-1' : styleEntries.length === 2 ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
          {styleEntries.map(([sid, stats]) => {
            const confirmedPercent = stats.totalCut > 0 ? Math.round((stats.totalConfirmed / stats.totalCut) * 100) : 0;
            return (
              <Card key={sid} className="border-l-4 border-l-primary">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-sm text-foreground leading-tight">{stats.styleName}</p>
                      {stats.styleCode && (
                        <p className="text-xs text-muted-foreground mt-0.5">{stats.styleCode}</p>
                      )}
                    </div>
                    <Badge variant="outline" className="text-xs shrink-0">{stats.colorCount} colors</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-muted/40 rounded-lg p-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Scissors className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Cut Pieces</span>
                      </div>
                      <p className="text-xl font-bold text-foreground">{stats.totalCut.toLocaleString()}</p>
                    </div>
                    <div className="bg-primary/10 rounded-lg p-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <CheckSquare className="h-3.5 w-3.5 text-primary" />
                        <span className="text-xs text-muted-foreground">Confirmed</span>
                      </div>
                      <p className="text-xl font-bold text-primary">{stats.totalConfirmed.toLocaleString()}</p>
                    </div>
                  </div>
                  {stats.totalCut > 0 && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Confirmation rate</span>
                        <span className="font-medium text-foreground">{confirmedPercent}%</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${Math.min(confirmedPercent, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Main Table Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Types & Colors Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">#</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>Fabric Type</TableHead>
                  <TableHead>GSM</TableHead>
                  <TableHead>Width</TableHead>
                  <TableHead>Rolls</TableHead>
                  <TableHead>Weight (kg)</TableHead>
                  <TableHead>Cut Pieces</TableHead>
                  <TableHead>Confirmed</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Delivery Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rollsData.map((type, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Badge variant="outline">{index + 1}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{type.color}</div>
                    </TableCell>
                    <TableCell>{type.fabric_type}</TableCell>
                    <TableCell>{type.gsm}</TableCell>
                    <TableCell>{type.fabric_width}"</TableCell>
                    <TableCell>{type.number_of_rolls}</TableCell>
                    <TableCell>
                      <div>
                        <span className="font-medium">{(type.weight * type.number_of_rolls).toFixed(2)}</span>
                        <span className="text-xs text-muted-foreground ml-1">({type.weight}/roll)</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={cuttingSummary[index] > 0 ? 'default' : 'secondary'}>
                        {cuttingSummary[index] || 0} pcs
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {activeEdit === index ? (
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            min={0}
                            value={editing[index] ?? '0'}
                            onChange={e => setEditing(prev => ({ ...prev, [index]: e.target.value }))}
                            className="h-8 w-24 text-sm"
                            autoFocus
                            onKeyDown={e => { if (e.key === 'Enter') handleSave(index); if (e.key === 'Escape') setActiveEdit(null); }}
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-primary"
                            onClick={() => handleSave(index)}
                            disabled={upsert.isPending}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Badge variant={confirmedMap[index] > 0 ? 'default' : 'secondary'}>
                            {confirmedMap[index] ?? 0} pcs
                          </Badge>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-muted-foreground hover:text-primary"
                            onClick={() => handleEdit(index)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {type.planned_start_date ? new Date(type.planned_start_date).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell className="text-sm">
                      {type.estimated_delivery_date ? new Date(type.estimated_delivery_date).toLocaleDateString() : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {rollsData.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No types/colors defined</p>
          )}

          {/* Notes Section */}
          {rollsData.some(type => type.notes) && (
            <div className="mt-6 space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground">Notes per Type</h4>
              {rollsData.map((type, index) => type.notes && (
                <div key={index} className="p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs">{index + 1}</Badge>
                    <span className="font-medium text-sm">{type.color}</span>
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{type.notes}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
