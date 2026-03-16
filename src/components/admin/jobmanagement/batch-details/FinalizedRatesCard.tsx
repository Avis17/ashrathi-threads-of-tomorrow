import { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, ImageIcon, Upload, Loader2, Eye, Pencil, X } from 'lucide-react';
import {
  useBatchFinalizedRates,
  useUpsertFinalizedRate,
  uploadRateProofImage,
  FinalizedRate,
} from '@/hooks/useBatchFinalizedRates';
import { toast } from 'sonner';

const OPERATIONS = [
  'Cutting',
  'Stitching(Singer)',
  'Stitching(Powertable)',
  'Checking',
  'Ironing',
  'Packing',
];

interface Props {
  batchId: string;
}

export const FinalizedRatesCard = ({ batchId }: Props) => {
  const { data: rates = [], isLoading } = useBatchFinalizedRates(batchId);
  const upsertMutation = useUpsertFinalizedRate();

  const [editingOp, setEditingOp] = useState<string | null>(null);
  const [editRate, setEditRate] = useState(0);
  const [editNotes, setEditNotes] = useState('');
  const [editImageUrl, setEditImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const getRateForOp = (op: string): FinalizedRate | undefined =>
    rates.find((r) => r.operation === op);

  const openEdit = (op: string) => {
    const existing = getRateForOp(op);
    setEditingOp(op);
    setEditRate(existing?.rate || 0);
    setEditNotes(existing?.notes || '');
    setEditImageUrl(existing?.image_url || null);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingOp) return;
    setUploading(true);
    try {
      const url = await uploadRateProofImage(batchId, editingOp, file);
      setEditImageUrl(url);
      toast.success('Image uploaded');
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = () => {
    if (!editingOp) return;
    upsertMutation.mutate(
      {
        batch_id: batchId,
        operation: editingOp,
        rate: editRate,
        image_url: editImageUrl,
        notes: editNotes,
      },
      { onSuccess: () => setEditingOp(null) }
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent className="p-4">
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-500" />
            Finalized Rates per Operation
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {OPERATIONS.map((op) => {
              const rate = getRateForOp(op);
              const hasRate = rate && rate.rate > 0;
              return (
                <div
                  key={op}
                  className={`relative rounded-lg border p-3 text-center transition-colors ${
                    hasRate
                      ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950'
                      : 'border-dashed border-muted-foreground/30'
                  }`}
                >
                  <div className="text-xs font-medium text-muted-foreground mb-1 truncate">{op}</div>
                  {hasRate ? (
                    <>
                      <div className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
                        ₹{rate.rate.toFixed(2)}
                      </div>
                      <div className="flex items-center justify-center gap-1 mt-1">
                        {rate.image_url && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={() => setPreviewImage(rate.image_url)}
                          >
                            <Eye className="h-3.5 w-3.5 text-blue-500" />
                          </Button>
                        )}
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          onClick={() => openEdit(op)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      {rate.image_url && (
                        <Badge variant="secondary" className="text-[9px] mt-1">
                          <ImageIcon className="h-2.5 w-2.5 mr-0.5" />
                          Proof
                        </Badge>
                      )}
                    </>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs mt-1"
                      onClick={() => openEdit(op)}
                    >
                      Set Rate
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingOp} onOpenChange={(open) => !open && setEditingOp(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Finalized Rate — {editingOp}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Rate per Piece (₹) *</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={editRate || ''}
                onChange={(e) => setEditRate(parseFloat(e.target.value) || 0)}
              />
            </div>

            <div>
              <Label>Proof Image</Label>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
              {editImageUrl ? (
                <div className="mt-2 relative">
                  <img
                    src={editImageUrl}
                    alt="Rate proof"
                    className="rounded-md border max-h-48 w-full object-contain cursor-pointer"
                    onClick={() => setPreviewImage(editImageUrl)}
                  />
                  <div className="flex gap-1 mt-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs flex-1"
                      disabled={uploading}
                      onClick={() => fileRef.current?.click()}
                    >
                      {uploading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Upload className="h-3 w-3 mr-1" />}
                      Replace
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs text-destructive"
                      onClick={() => setEditImageUrl(null)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="w-full mt-1"
                  disabled={uploading}
                  onClick={() => fileRef.current?.click()}
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  Upload Image
                </Button>
              )}
            </div>

            <div>
              <Label>Notes</Label>
              <Textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Any notes about this rate..."
                rows={2}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingOp(null)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={upsertMutation.isPending || editRate <= 0}>
                {upsertMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                Save Rate
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Preview Dialog */}
      <Dialog open={!!previewImage} onOpenChange={(open) => !open && setPreviewImage(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Rate Proof Image</DialogTitle>
          </DialogHeader>
          {previewImage && (
            <img src={previewImage} alt="Rate proof" className="w-full rounded-md" />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
