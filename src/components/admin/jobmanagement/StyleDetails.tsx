import { useState, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Edit, IndianRupee, FileText, ZoomIn, ZoomOut, RotateCcw, X, ChevronLeft, ChevronRight, Maximize2, Images, Download } from 'lucide-react';
import { JobStyle } from '@/hooks/useJobStyles';

interface StyleDetailsProps {
  style: JobStyle | null;
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
}

const StyleDetails = ({ style, open, onClose, onEdit }: StyleDetailsProps) => {
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [lightboxAlt, setLightboxAlt] = useState<string>('');
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [downloading, setDownloading] = useState(false);

  if (!style) return null;

  const measurementSheetUrl = (style as any).measurement_sheet_url as string | null;
  const extraImages: string[] = (style as any).style_images || [];

  const downloadImage = async (url: string, filename: string) => {
    try {
      const response = await fetch(url, { mode: 'cors' });
      const blob = await response.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href);
    } catch {
      window.open(url, '_blank');
    }
  };

  const downloadAll = async () => {
    setDownloading(true);
    const allImages: { url: string; name: string }[] = [];
    if (style.style_image_url) allImages.push({ url: style.style_image_url, name: `${style.style_code}-style.jpg` });
    if (measurementSheetUrl) allImages.push({ url: measurementSheetUrl, name: `${style.style_code}-measurement-sheet.jpg` });
    extraImages.forEach((url, i) => allImages.push({ url, name: `${style.style_code}-image-${i + 1}.jpg` }));
    for (const img of allImages) {
      await downloadImage(img.url, img.name);
      await new Promise(r => setTimeout(r, 400));
    }
    setDownloading(false);
  };

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

  const openLightbox = (src: string, alt: string, images?: string[]) => {
    const imgs = images || [src];
    const idx = imgs.indexOf(src);
    setLightboxImages(imgs);
    setLightboxIndex(idx >= 0 ? idx : 0);
    setLightboxSrc(src);
    setLightboxAlt(alt);
  };

  const goLightboxPrev = () => {
    const newIdx = (lightboxIndex - 1 + lightboxImages.length) % lightboxImages.length;
    setLightboxIndex(newIdx);
    setLightboxSrc(lightboxImages[newIdx]);
  };

  const goLightboxNext = () => {
    const newIdx = (lightboxIndex + 1) % lightboxImages.length;
    setLightboxIndex(newIdx);
    setLightboxSrc(lightboxImages[newIdx]);
  };

  const totalImageCount = (style.style_image_url ? 1 : 0) + (measurementSheetUrl ? 1 : 0) + extraImages.length;

  return (
    <>
      {lightboxSrc && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col" onMouseUp={() => {}}>
          <div className="flex items-center justify-between px-4 py-3 bg-black/60 border-b border-white/10 flex-shrink-0">
            <span className="text-white text-sm font-medium">
              {lightboxAlt}{lightboxImages.length > 1 ? ` (${lightboxIndex + 1}/${lightboxImages.length})` : ''}
            </span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:text-white hover:bg-white/10 gap-1.5"
                onClick={() => downloadImage(lightboxSrc, `${style.style_code}-${lightboxIndex + 1}.jpg`)}
              >
                <Download className="h-4 w-4" />
                <span className="text-xs">Download</span>
              </Button>
              <div className="w-px h-5 bg-white/20" />
              <Button size="sm" variant="ghost" className="text-white hover:text-white hover:bg-white/10" onClick={() => setLightboxSrc(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center relative overflow-hidden">
            {lightboxImages.length > 1 && (
              <Button size="sm" variant="ghost" className="absolute left-3 z-10 text-white hover:bg-white/20 rounded-full" onClick={goLightboxPrev}>
                <ChevronLeft className="h-6 w-6" />
              </Button>
            )}
            <img
              src={lightboxSrc}
              alt={lightboxAlt}
              draggable={false}
              style={{ maxWidth: '90vw', maxHeight: '80vh', objectFit: 'contain' }}
            />
            {lightboxImages.length > 1 && (
              <Button size="sm" variant="ghost" className="absolute right-3 z-10 text-white hover:bg-white/20 rounded-full" onClick={goLightboxNext}>
                <ChevronRight className="h-6 w-6" />
              </Button>
            )}
          </div>
          {lightboxImages.length > 1 && (
            <div className="flex gap-2 justify-center pb-4 flex-shrink-0">
              {lightboxImages.map((img, i) => (
                <button key={i} onClick={() => { setLightboxIndex(i); setLightboxSrc(img); }}
                  className={`w-12 h-12 rounded overflow-hidden border-2 transition-all ${i === lightboxIndex ? 'border-white' : 'border-white/30 opacity-60'}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
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
              <div className="flex items-center gap-2">
                {totalImageCount > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={downloadAll}
                    disabled={downloading}
                  >
                    <Download className="h-4 w-4" />
                    {downloading ? 'Downloading...' : `Download All (${totalImageCount})`}
                  </Button>
                )}
                <Button onClick={onEdit} size="sm" className="gap-2">
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            {/* Images row */}
            <div className={`grid gap-4 ${measurementSheetUrl ? 'grid-cols-2' : 'grid-cols-1'}`}>
              {/* Style Image */}
              {style.style_image_url && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Style Image</p>
                    <button
                      onClick={(e) => { e.stopPropagation(); downloadImage(style.style_image_url!, `${style.style_code}-style.jpg`); }}
                      className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded"
                      title="Download"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </button>
                  </div>
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
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                      <FileText className="h-3.5 w-3.5" />
                      Measurement Sheet
                    </p>
                    <button
                      onClick={(e) => { e.stopPropagation(); downloadImage(measurementSheetUrl, `${style.style_code}-measurement-sheet.jpg`); }}
                      className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded"
                      title="Download"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </button>
                  </div>
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

            {/* Extra Images Gallery */}
            {extraImages.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                  <Images className="h-3.5 w-3.5" />
                  Additional Images ({extraImages.length})
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {extraImages.map((src, idx) => (
                    <div
                      key={idx}
                      className="aspect-square rounded-lg overflow-hidden bg-muted cursor-pointer relative group border"
                      onClick={() => openLightbox(src, `${style.style_name} – Image ${idx + 1}`, extraImages)}
                    >
                      <img src={src} alt={`Style image ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-end justify-end p-1.5">
                        <button
                          onClick={(e) => { e.stopPropagation(); downloadImage(src, `${style.style_code}-image-${idx + 1}.jpg`); }}
                          className="bg-black/60 text-white rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                          title="Download"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <Maximize2 className="h-5 w-5 text-white opacity-0 group-hover:opacity-60 transition-opacity" />
                      </div>
                    </div>
                  ))}
                </div>
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
