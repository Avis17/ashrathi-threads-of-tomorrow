import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Edit, Package, IndianRupee } from 'lucide-react';
import { JobStyle } from '@/hooks/useJobStyles';

interface StyleDetailsProps {
  style: JobStyle | null;
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
}

const StyleDetails = ({ style, open, onClose, onEdit }: StyleDetailsProps) => {
  if (!style) return null;

  // Check if we have detailed rate breakdown
  const hasDetailedRates = style.process_rate_details && Array.isArray(style.process_rate_details) && (style.process_rate_details as any[]).length > 0;
  
  const processRates = [
    { name: 'Cutting', value: style.rate_cutting, icon: '✂️', key: 'Cutting' },
    { name: 'Stitching (Singer)', value: style.rate_stitching_singer, icon: '🧵', key: 'Stitching(Singer)' },
    { name: 'Stitching (Power)', value: style.rate_stitching_power_table, icon: '⚡', key: 'Stitching(Powertable)' },
    { name: 'Ironing', value: style.rate_ironing, icon: '👔', key: 'Ironing' },
    { name: 'Checking', value: style.rate_checking, icon: '✓', key: 'Checking' },
    { name: 'Packing', value: style.rate_packing, icon: '📦', key: 'Packing' },
  ];

  const totalRate = processRates.reduce((sum, rate) => sum + (rate.value || 0), 0);
  const maxRate = Math.max(...processRates.map(r => r.value || 0));

  // Build a map of operation to details
  const operationDetails: Record<string, any> = {};
  if (hasDetailedRates) {
    (style.process_rate_details as any[]).forEach((op: any) => {
      operationDetails[op.operation] = op;
    });
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl">{style.style_name}</DialogTitle>
              <p className="text-muted-foreground mt-1">
                {style.style_code} • Pattern: {style.pattern_number}
              </p>
            </div>
            <Button onClick={onEdit} size="sm" className="gap-2">
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Image */}
          {style.style_image_url && (
            <div className="aspect-video w-full rounded-lg overflow-hidden bg-muted">
              <img
                src={style.style_image_url}
                alt={style.style_name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Garment Type</h4>
              <p className="mt-1">{style.garment_type || 'N/A'}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Category</h4>
              <p className="mt-1">{style.category || 'N/A'}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Season</h4>
              <p className="mt-1">{style.season || 'N/A'}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Fit</h4>
              <p className="mt-1">{style.fit || 'N/A'}</p>
            </div>
          </div>

          <Separator />

          {/* Process Rates */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <IndianRupee className="h-5 w-5" />
              Process Rates
            </h3>
            <div className="space-y-3">
              {processRates.map((rate) => {
                const hasDetails = hasDetailedRates && operationDetails[rate.key];
                return (
                  <div key={rate.name} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <span>{rate.icon}</span>
                        <span>{rate.name}</span>
                      </span>
                      <span className="font-medium">
                        ₹{(rate.value || 0).toFixed(2)}
                      </span>
                    </div>
                    
                    {/* Show detailed category breakdown if available */}
                    {hasDetails && operationDetails[rate.key].categories && operationDetails[rate.key].categories.length > 0 && (
                      <div className="ml-8 space-y-1 text-xs text-muted-foreground">
                        {operationDetails[rate.key].categories.map((cat: any, idx: number) => (
                          <div key={idx} className="flex justify-between">
                            <span>• {cat.name}</span>
                            <span>₹{(cat.rate || 0).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${((rate.value || 0) / maxRate) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              <Separator className="my-2" />
              <div className="flex items-center justify-between font-semibold">
                <span>Total per Piece</span>
                <span className="text-primary">₹{totalRate.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Additional Details */}
          {style.remarks && (
            <>
              <Separator />
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Remarks</h4>
                <p className="text-sm">{style.remarks}</p>
              </div>
            </>
          )}

          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <Badge variant={style.is_active ? 'default' : 'secondary'}>
              {style.is_active ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StyleDetails;
