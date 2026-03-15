import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Pencil, Package, Layers, Check, X } from 'lucide-react';
import { useUpdateJobBatch } from '@/hooks/useJobBatches';
import { toast } from 'sonner';

interface FabricType {
  style_id?: string;
  fabric_type: string;
  gsm: string;
  sizes?: string;
  color: string;
  fabric_width: string;
  weight: number;
  number_of_rolls: number;
  planned_start_date?: string;
  estimated_delivery_date?: string;
  notes?: string;
  operations?: string[];
  [key: string]: any;
}

interface BatchInfoTabProps {
  batch: any;
}

export const BatchInfoTab = ({ batch }: BatchInfoTabProps) => {
  const rollsData: FabricType[] = (batch.rolls_data || []) as FabricType[];
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<FabricType | null>(null);
  const [editingBatchInfo, setEditingBatchInfo] = useState(false);
  const [batchInfoForm, setBatchInfoForm] = useState({
    supplier_name: batch.supplier_name || '',
    lot_number: batch.lot_number || '',
    remarks: batch.remarks || '',
    company_name: batch.company_name || '',
  });

  const updateBatchMutation = useUpdateJobBatch();

  const handleEditFabric = (index: number) => {
    setEditingIndex(index);
    setEditForm({ ...rollsData[index] });
  };

  const handleSaveFabric = () => {
    if (editingIndex === null || !editForm) return;
    const updatedRolls = [...rollsData];
    updatedRolls[editingIndex] = editForm;

    // Recalculate totals
    const totalWeight = updatedRolls.reduce((sum, r) => sum + (Number(r.number_of_rolls) || 0) * (Number(r.weight) || 0), 0);
    const totalRolls = updatedRolls.reduce((sum, r) => sum + (Number(r.number_of_rolls) || 0), 0);

    updateBatchMutation.mutate({
      id: batch.id,
      data: {
        rolls_data: updatedRolls as any,
        total_fabric_received_kg: totalWeight,
        number_of_rolls: totalRolls,
        fabric_type: updatedRolls[0]?.fabric_type || batch.fabric_type,
        gsm: updatedRolls[0]?.gsm || batch.gsm,
        color: updatedRolls[0]?.color || batch.color,
      },
    });
    setEditingIndex(null);
    setEditForm(null);
  };

  const handleSaveBatchInfo = () => {
    updateBatchMutation.mutate({
      id: batch.id,
      data: {
        supplier_name: batchInfoForm.supplier_name || null,
        lot_number: batchInfoForm.lot_number || null,
        remarks: batchInfoForm.remarks || null,
        company_name: batchInfoForm.company_name || null,
      },
    });
    setEditingBatchInfo(false);
  };

  const totalWeight = rollsData.reduce((sum, r) => sum + (Number(r.number_of_rolls) || 0) * (Number(r.weight) || 0), 0);
  const totalRolls = rollsData.reduce((sum, r) => sum + (Number(r.number_of_rolls) || 0), 0);

  return (
    <div className="space-y-4">
      {/* General Batch Info */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" />
            Batch Information
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => {
            setBatchInfoForm({
              supplier_name: batch.supplier_name || '',
              lot_number: batch.lot_number || '',
              remarks: batch.remarks || '',
              company_name: batch.company_name || '',
            });
            setEditingBatchInfo(true);
          }}>
            <Pencil className="h-4 w-4 mr-1" />
            Edit
          </Button>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Supplier:</span>
            <span className="font-medium">{batch.supplier_name || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Company:</span>
            <span className="font-medium">{batch.company_name || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Lot Number:</span>
            <span className="font-medium">{batch.lot_number || 'N/A'}</span>
          </div>
          {batch.remarks && (
            <div className="pt-2 border-t">
              <div className="text-muted-foreground mb-1">Remarks:</div>
              <div className="text-foreground">{batch.remarks}</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fabric List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            Fabric Types ({rollsData.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {rollsData.map((fabric, index) => {
              const fabricWeight = (Number(fabric.number_of_rolls) || 0) * (Number(fabric.weight) || 0);
              return (
                <div
                  key={index}
                  className="p-4 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">{index + 1}</Badge>
                      <h4 className="font-semibold">{fabric.color}</h4>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEditFabric(index)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Fabric:</span>
                      <span className="font-medium">{fabric.fabric_type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">GSM:</span>
                      <span className="font-medium">{fabric.gsm}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Width:</span>
                      <span className="font-medium">{fabric.fabric_width || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Rolls:</span>
                      <span className="font-medium">{fabric.number_of_rolls}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Weight/Roll:</span>
                      <span className="font-medium">{fabric.weight} kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Weight:</span>
                      <span className="font-semibold">{fabricWeight.toFixed(2)} kg</span>
                    </div>
                    {fabric.sizes && (
                      <div className="col-span-2 flex justify-between">
                        <span className="text-muted-foreground">Sizes:</span>
                        <span className="font-medium">{fabric.sizes}</span>
                      </div>
                    )}
                    {fabric.notes && (
                      <div className="col-span-2 flex justify-between">
                        <span className="text-muted-foreground">Notes:</span>
                        <span className="font-medium truncate max-w-[200px]">{fabric.notes}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Totals */}
          <div className="mt-4 p-3 bg-primary/10 rounded-lg flex items-center justify-between">
            <span className="font-semibold">Total</span>
            <div className="flex items-center gap-3">
              <Badge variant="outline">{totalRolls} rolls</Badge>
              <Badge className="bg-primary">{totalWeight.toFixed(2)} kg</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Fabric Dialog */}
      <Dialog open={editingIndex !== null} onOpenChange={(open) => { if (!open) { setEditingIndex(null); setEditForm(null); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Fabric - Type {(editingIndex ?? 0) + 1}</DialogTitle>
          </DialogHeader>
          {editForm && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Color</Label>
                  <Input value={editForm.color} onChange={(e) => setEditForm({ ...editForm, color: e.target.value })} />
                </div>
                <div>
                  <Label className="text-xs">Fabric Type</Label>
                  <Input value={editForm.fabric_type} onChange={(e) => setEditForm({ ...editForm, fabric_type: e.target.value })} />
                </div>
                <div>
                  <Label className="text-xs">GSM</Label>
                  <Input value={editForm.gsm} onChange={(e) => setEditForm({ ...editForm, gsm: e.target.value })} />
                </div>
                <div>
                  <Label className="text-xs">Fabric Width</Label>
                  <Input value={editForm.fabric_width} onChange={(e) => setEditForm({ ...editForm, fabric_width: e.target.value })} />
                </div>
                <div>
                  <Label className="text-xs">Number of Rolls</Label>
                  <Input type="number" min="1" value={editForm.number_of_rolls} onChange={(e) => setEditForm({ ...editForm, number_of_rolls: parseInt(e.target.value) || 0 })} />
                </div>
                <div>
                  <Label className="text-xs">Weight per Roll (kg)</Label>
                  <Input type="number" min="0" step="0.1" value={editForm.weight} onChange={(e) => setEditForm({ ...editForm, weight: parseFloat(e.target.value) || 0 })} />
                </div>
              </div>
              <div>
                <Label className="text-xs">Sizes</Label>
                <Input value={editForm.sizes || ''} onChange={(e) => setEditForm({ ...editForm, sizes: e.target.value })} placeholder="e.g. S, M, L, XL" />
              </div>
              <div className="p-3 rounded-lg bg-muted/50 flex items-center justify-between text-sm">
                <span className="font-medium">Total Weight</span>
                <Badge>{((editForm.number_of_rolls || 0) * (editForm.weight || 0)).toFixed(2)} kg</Badge>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditingIndex(null); setEditForm(null); }}>Cancel</Button>
            <Button onClick={handleSaveFabric} disabled={updateBatchMutation.isPending}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Batch Info Dialog */}
      <Dialog open={editingBatchInfo} onOpenChange={(open) => { if (!open) setEditingBatchInfo(false); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Batch Information</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Supplier Name</Label>
              <Input value={batchInfoForm.supplier_name} onChange={(e) => setBatchInfoForm({ ...batchInfoForm, supplier_name: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">Company Name</Label>
              <Input value={batchInfoForm.company_name} onChange={(e) => setBatchInfoForm({ ...batchInfoForm, company_name: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">Lot Number</Label>
              <Input value={batchInfoForm.lot_number} onChange={(e) => setBatchInfoForm({ ...batchInfoForm, lot_number: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">Remarks</Label>
              <Input value={batchInfoForm.remarks} onChange={(e) => setBatchInfoForm({ ...batchInfoForm, remarks: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingBatchInfo(false)}>Cancel</Button>
            <Button onClick={handleSaveBatchInfo} disabled={updateBatchMutation.isPending}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
