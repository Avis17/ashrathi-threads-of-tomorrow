import { useState, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Edit, IndianRupee, FileText, ZoomIn, ZoomOut, RotateCcw, X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { JobStyle } from '@/hooks/useJobStyles';

interface StyleDetailsProps {
  style: JobStyle | null;
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
}

interface ImageLightboxProps {
  src: string;
  alt: string;
  onClose: () => void;
}

const ImageLightbox = ({ src, alt, onClose }: ImageLightboxProps) => {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef<{ x: number; y: number; px: number; py: number } | null>(null);

  const handleZoomIn = () => setScale(s => Math.min(s + 0.25, 5));
  const handleZoomOut = () => setScale(s => Math.max(s - 0.25, 0.25));
  const handleReset = () => { setScale(1); setRotation(0); setPosition({ x: 0, y: 0 }); };
  const handleRotate = () => setRotation(r => (r + 90) % 360);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale === 1) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, px: position.x, py: position.y };
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !dragStart.current) return;
    setPosition({
      x: dragStart.current.px + (e.clientX - dragStart.current.x),
      y: dragStart.current.py + (e.clientY - dragStart.current.y),
    });
  };
  const handleMouseUp = () => { setIsDragging(false); dragStart.current = null; };

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setScale(s => Math.min(Math.max(s + delta, 0.25), 5));
  }, []);

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/95 flex flex-col"
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/60 border-b border-white/10 flex-shrink-0">
        <span className="text-white text-sm font-medium">{alt}</span>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" className="text-white hover:text-white hover:bg-white/10" onClick={handleZoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-white text-xs w-12 text-center">{Math.round(scale * 100)}%</span>
          <Button size="sm" variant="ghost" className="text-white hover:text-white hover:bg-white/10" onClick={handleZoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <div className="w-px h-5 bg-white/20 mx-1" />
          <Button size="sm" variant="ghost" className="text-white hover:text-white hover:bg-white/10" onClick={handleRotate}>
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" className="text-white hover:text-white hover:bg-white/10" onClick={handleReset}>
            Reset
          </Button>
          <div className="w-px h-5 bg-white/20 mx-1" />
          <Button size="sm" variant="ghost" className="text-white hover:text-white hover:bg-white/10" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Image area */}
      <div
        className="flex-1 overflow-hidden flex items-center justify-center select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onWheel={handleWheel}
        style={{ cursor: isDragging ? 'grabbing' : scale > 1 ? 'grab' : 'default' }}
      >
        <img
          src={src}
          alt={alt}
          draggable={false}
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
            transition: isDragging ? 'none' : 'transform 0.15s ease',
            maxWidth: '90vw',
            maxHeight: '80vh',
            objectFit: 'contain',
          }}
        />
      </div>

      {/* Hint */}
      <div className="text-center pb-3 text-white/40 text-xs flex-shrink-0">
        Scroll to zoom • Drag to pan • Use buttons to rotate
      </div>
    </div>
  );
};

const StyleDetails = ({ style, open, onClose, onEdit }: StyleDetailsProps) => {
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [lightboxAlt, setLightboxAlt] = useState<string>('');

  if (!style) return null;

  const measurementSheetUrl = (style as any).measurement_sheet_url as string | null;

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

  const operationDetails: Record<string, any> = {};
  if (hasDetailedRates) {
    (style.process_rate_details as any[]).forEach((op: any) => {
      operationDetails[op.operation] = op;
    });
  }

  const openLightbox = (src: string, alt: string) => {
    setLightboxSrc(src);
    setLightboxAlt(alt);
  };

  return (
    <>
      {lightboxSrc && (
        <ImageLightbox
          src={lightboxSrc}
          alt={lightboxAlt}
          onClose={() => setLightboxSrc(null)}
        />
      )}

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
            {/* Images row */}
            <div className={`grid gap-4 ${measurementSheetUrl ? 'grid-cols-2' : 'grid-cols-1'}`}>
              {/* Style Image */}
              {style.style_image_url && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Style Image</p>
                  <div
                    className="aspect-video w-full rounded-lg overflow-hidden bg-muted cursor-pointer relative group"
                    onClick={() => openLightbox(style.style_image_url!, style.style_name)}
                  >
                    <img
                      src={style.style_image_url}
                      alt={style.style_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <Maximize2 className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </div>
              )}

              {/* Measurement Sheet */}
              {measurementSheetUrl && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5" />
                    Measurement Sheet
                  </p>
                  <div
                    className="aspect-video w-full rounded-lg overflow-hidden bg-muted cursor-pointer relative group border"
                    onClick={() => openLightbox(measurementSheetUrl, 'Measurement Sheet – ' + style.style_name)}
                  >
                    <img
                      src={measurementSheetUrl}
                      alt="Measurement Sheet"
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center gap-1 text-white">
                        <Maximize2 className="h-8 w-8" />
                        <span className="text-xs font-medium">View Full Size</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* If only measurement sheet (no style image) show it full width */}
            {!style.style_image_url && !measurementSheetUrl && null}

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
              <Badge className={style.is_active ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'}>
                {style.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default StyleDetails;
