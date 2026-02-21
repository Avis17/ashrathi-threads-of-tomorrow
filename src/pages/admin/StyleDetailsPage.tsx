import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Package, IndianRupee, FileText, ExternalLink, Layers, ZoomIn, ZoomOut, RotateCcw, X, Maximize2, Images } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useJobStyle, useUpdateJobStyle } from '@/hooks/useJobStyles';
import { useCMTQuotations } from '@/hooks/useCMTQuotations';
import StyleForm from '@/components/admin/jobmanagement/StyleForm';
import { toast } from 'sonner';
import { useRef, useCallback } from 'react';

// ── Lightbox ──────────────────────────────────────────────────────────────────
interface LightboxProps { src: string; alt: string; onClose: () => void; }

const ImageLightbox = ({ src, alt, onClose }: LightboxProps) => {
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
    setScale(s => Math.min(Math.max(s + (e.deltaY > 0 ? -0.1 : 0.1), 0.25), 5));
  }, []);

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/95 flex flex-col"
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="flex items-center justify-between px-4 py-3 bg-black/60 border-b border-white/10 flex-shrink-0">
        <span className="text-white text-sm font-medium">{alt}</span>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" className="text-white hover:text-white hover:bg-white/10" onClick={handleZoomOut}><ZoomOut className="h-4 w-4" /></Button>
          <span className="text-white text-xs w-12 text-center">{Math.round(scale * 100)}%</span>
          <Button size="sm" variant="ghost" className="text-white hover:text-white hover:bg-white/10" onClick={handleZoomIn}><ZoomIn className="h-4 w-4" /></Button>
          <div className="w-px h-5 bg-white/20 mx-1" />
          <Button size="sm" variant="ghost" className="text-white hover:text-white hover:bg-white/10" onClick={handleRotate}><RotateCcw className="h-4 w-4" /></Button>
          <Button size="sm" variant="ghost" className="text-white hover:text-white hover:bg-white/10" onClick={handleReset}>Reset</Button>
          <div className="w-px h-5 bg-white/20 mx-1" />
          <Button size="sm" variant="ghost" className="text-white hover:text-white hover:bg-white/10" onClick={onClose}><X className="h-4 w-4" /></Button>
        </div>
      </div>
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
      <div className="text-center pb-3 text-white/40 text-xs flex-shrink-0">Scroll to zoom • Drag to pan • Use buttons to rotate</div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const StyleDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: style, isLoading } = useJobStyle(id || '');
  const { data: quotations } = useCMTQuotations();
  const updateStyle = useUpdateJobStyle();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!style) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground mb-4">Style not found</p>
        <Button variant="outline" onClick={() => navigate('/admin/job-management')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Job Management
        </Button>
      </div>
    );
  }

  const measurementSheetUrl = (style as any).measurement_sheet_url as string | null;

  // Parse process_rate_details for set item flag
  const processRateDetails = style.process_rate_details as any;
  const isSetItem = processRateDetails?.is_set_item || false;

  const linkedQuotation = quotations?.find(q => q.id === style.linked_cmt_quotation_id);
  const isQuotationApproved = linkedQuotation?.status === 'approved';
  const approvedRates = linkedQuotation?.approved_rates as any;
  const displayCMTRate = isQuotationApproved && approvedRates?.finalCMTPerPiece
    ? approvedRates.finalCMTPerPiece
    : linkedQuotation?.final_cmt_per_piece;

  const handleLinkQuotation = (quotationId: string) => {
    updateStyle.mutate({
      id: style.id,
      data: { linked_cmt_quotation_id: quotationId === 'none' ? null : quotationId }
    }, {
      onSuccess: () => toast.success('Quotation linked successfully'),
    });
  };

  return (
    <>
      {lightbox && (
        <ImageLightbox src={lightbox.src} alt={lightbox.alt} onClose={() => setLightbox(null)} />
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <StyleForm style={style} onClose={() => setIsEditOpen(false)} />
        </DialogContent>
      </Dialog>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin/job-management')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">{style.style_name}</h1>
                {isSetItem && (
                  <Badge variant="secondary" className="gap-1">
                    <Layers className="h-3 w-3" />
                    Set Item
                  </Badge>
                )}
                <Badge className={style.is_active ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'}>
                  {style.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <p className="text-muted-foreground mt-1">
                {style.style_code} • Pattern: {style.pattern_number}
              </p>
            </div>
          </div>
          <Button onClick={() => setIsEditOpen(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Style
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Images row */}
            {(style.style_image_url || measurementSheetUrl) && (
              <div className={`grid gap-4 ${style.style_image_url && measurementSheetUrl ? 'grid-cols-2' : 'grid-cols-1'}`}>
                {style.style_image_url && (
                  <Card>
                    <CardContent className="p-0">
                      <div
                        className="aspect-video w-full rounded-lg overflow-hidden bg-muted cursor-pointer relative group"
                        onClick={() => setLightbox({ src: style.style_image_url!, alt: style.style_name })}
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
                    </CardContent>
                  </Card>
                )}
                {measurementSheetUrl && (
                  <Card>
                    <CardHeader className="pb-2 pt-3 px-3">
                      <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                        <FileText className="h-3.5 w-3.5" />
                        Measurement Sheet
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 px-0 pb-0">
                      <div
                        className="aspect-video w-full overflow-hidden bg-muted cursor-pointer relative group rounded-b-lg border-t"
                        onClick={() => setLightbox({ src: measurementSheetUrl, alt: `Measurement Sheet – ${style.style_name}` })}
                      >
                        <img
                          src={measurementSheetUrl}
                          alt="Measurement Sheet"
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex flex-col items-center justify-center gap-1">
                          <Maximize2 className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          <span className="text-xs font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity">View Full Size</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Additional Images Gallery */}
            {(() => {
              const extraImages = (style.style_images as any as string[]) || [];
              if (extraImages.length === 0) return null;
              return (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Images className="h-5 w-5" />
                      Style Gallery
                      <Badge variant="secondary" className="ml-auto">{extraImages.length} images</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                      {extraImages.map((url: string, idx: number) => (
                        <div
                          key={idx}
                          className="aspect-square rounded-lg overflow-hidden bg-muted cursor-pointer relative group border"
                          onClick={() => setLightbox({ src: url, alt: `${style.style_name} – Image ${idx + 1}` })}
                        >
                          <img
                            src={url}
                            alt={`Style image ${idx + 1}`}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                            <Maximize2 className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })()}

            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Garment Type</p>
                    <p className="font-medium">{style.garment_type || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Category</p>
                    <p className="font-medium">{style.category || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Season</p>
                    <p className="font-medium">{style.season || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Fit</p>
                    <p className="font-medium">{style.fit || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Fabric Type</p>
                    <p className="font-medium">{style.fabric_type || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">GSM</p>
                    <p className="font-medium">{style.gsm_range || 'N/A'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Process Rates from CMT Quotation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IndianRupee className="h-5 w-5" />
                  Process Rates
                  {linkedQuotation && (
                    <Badge variant="outline" className="ml-auto text-xs font-normal">
                      From CMT: {linkedQuotation.quotation_no}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {linkedQuotation ? (() => {
                  const originalOps = (linkedQuotation.operations as any[]) || [];
                  // For approved quotations, merge approved rates with original operations to get machineType/description
                  let cmtOps: any[];
                  if (isQuotationApproved && approvedRates?.operations) {
                    cmtOps = approvedRates.operations.map((approvedOp: any, idx: number) => {
                      // Match with original operation by index to get machineType and description
                      const origOp = originalOps[idx] || {};
                      return {
                        ...approvedOp,
                        machineType: approvedOp.machineType || origOp.machineType || '-',
                        description: approvedOp.description || origOp.description || '',
                      };
                    });
                  } else {
                    cmtOps = originalOps;
                  }
                  const cmtFinishing = isQuotationApproved && approvedRates
                    ? approvedRates.finishingPackingCost
                    : Number(linkedQuotation.finishing_packing_cost) || 0;
                  const cmtOverheads = isQuotationApproved && approvedRates
                    ? approvedRates.overheadsCost
                    : Number(linkedQuotation.overheads_cost) || 0;
                  const cmtProfitPercent = isQuotationApproved && approvedRates
                    ? approvedRates.companyProfitPercent
                    : Number(linkedQuotation.company_profit_percent) || 0;
                  const cmtFinal = isQuotationApproved && approvedRates?.finalCMTPerPiece
                    ? approvedRates.finalCMTPerPiece
                    : Number(linkedQuotation.final_cmt_per_piece) || 0;
                  const opsTotal = cmtOps.reduce((sum: number, op: any) => sum + (op.rate || op.ratePerPiece || 0), 0);

                  return (
                    <div className="space-y-4">
                      <div className="border rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                          <thead className="bg-muted/50">
                            <tr>
                              <th className="text-left p-3 font-medium">Category</th>
                              <th className="text-left p-3 font-medium">Machine</th>
                              <th className="text-left p-3 font-medium">Description</th>
                              <th className="text-right p-3 font-medium">Rate (₹)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {cmtOps.map((op: any, idx: number) => (
                              <tr key={idx} className="border-t">
                                <td className="p-3 font-medium">{op.category}</td>
                                <td className="p-3 text-muted-foreground">{op.machineType || op.machine_type || '-'}</td>
                                <td className="p-3 text-muted-foreground">{op.description || '-'}</td>
                                <td className="p-3 text-right font-medium">₹{(op.rate || op.ratePerPiece || 0).toFixed(2)}</td>
                              </tr>
                            ))}
                            <tr className="border-t bg-muted/30">
                              <td className="p-3 font-medium" colSpan={3}>Total Operations Cost</td>
                              <td className="p-3 text-right font-medium">₹{opsTotal.toFixed(2)}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-muted/30 rounded-lg p-4">
                          <p className="text-sm text-muted-foreground">Finishing & Packing</p>
                          <p className="text-lg font-semibold">₹{cmtFinishing.toFixed(2)}</p>
                        </div>
                        <div className="bg-muted/30 rounded-lg p-4">
                          <p className="text-sm text-muted-foreground">Overheads</p>
                          <p className="text-lg font-semibold">₹{cmtOverheads.toFixed(2)}</p>
                        </div>
                        <div className="bg-muted/30 rounded-lg p-4">
                          <p className="text-sm text-muted-foreground">Profit %</p>
                          <p className="text-lg font-semibold">{cmtProfitPercent.toFixed(2)}%</p>
                        </div>
                      </div>
                      <Separator />
                      <div className={`flex items-center justify-between rounded-lg p-4 ${isQuotationApproved ? 'bg-green-100 dark:bg-green-950/40' : 'bg-primary/10'}`}>
                        <span className="font-semibold">
                          {isQuotationApproved ? 'Final Approved CMT Rate' : 'Quoted CMT Rate'} per Piece
                        </span>
                        <span className={`text-2xl font-bold ${isQuotationApproved ? 'text-green-600 dark:text-green-400' : 'text-primary'}`}>
                          ₹{cmtFinal.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  );
                })() : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">No CMT quotation linked</p>
                    <p className="text-xs mt-1">Link a CMT quotation from the sidebar to view process rates</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {style.remarks && (
              <Card>
                <CardHeader><CardTitle>Remarks</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{style.remarks}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Linked CMT Quotation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  CMT Quotation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Link Quotation</label>
                  <Select value={style.linked_cmt_quotation_id || 'none'} onValueChange={handleLinkQuotation}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a quotation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No quotation linked</SelectItem>
                      {quotations?.map((q) => (
                        <SelectItem key={q.id} value={q.id}>
                          {q.quotation_no} - {q.buyer_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {linkedQuotation && (
                  <div className={`rounded-lg p-4 space-y-3 border-2 ${isQuotationApproved ? 'bg-green-50 dark:bg-green-950/30 border-green-500' : 'bg-muted/30 border-transparent'}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{linkedQuotation.quotation_no}</span>
                      <Badge variant={isQuotationApproved ? 'default' : 'outline'} className={isQuotationApproved ? 'bg-green-500 hover:bg-green-600' : ''}>
                        {isQuotationApproved ? '✓ Approved' : linkedQuotation.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>Buyer: {linkedQuotation.buyer_name}</p>
                      <p className={isQuotationApproved ? 'text-green-600 dark:text-green-400 font-medium' : ''}>
                        {isQuotationApproved ? 'Approved CMT' : 'Quoted CMT'}: ₹{Number(displayCMTRate || 0).toFixed(2)}
                      </p>
                      {isQuotationApproved && approvedRates?.finalCMTPerPiece && linkedQuotation.final_cmt_per_piece &&
                        approvedRates.finalCMTPerPiece !== linkedQuotation.final_cmt_per_piece && (
                          <p className="text-xs text-muted-foreground line-through">
                            Original: ₹{Number(linkedQuotation.final_cmt_per_piece).toFixed(2)}
                          </p>
                        )}
                      {isQuotationApproved && linkedQuotation.approved_rates && (
                        <div className="mt-2 pt-2 border-t border-green-200 dark:border-green-800">
                          <p className="text-xs font-medium text-green-600 dark:text-green-400">✓ Approved Rates Confirmed</p>
                        </div>
                      )}
                    </div>
                    <Button
                      variant={isQuotationApproved ? 'default' : 'outline'}
                      size="sm"
                      className={`w-full ${isQuotationApproved ? 'bg-green-500 hover:bg-green-600' : ''}`}
                      asChild
                    >
                      <Link to={`/admin/cmt-quotation/view/${linkedQuotation.id}`}>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Quotation
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader><CardTitle>Quick Stats</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Created</span>
                  <span className="text-sm">{style.created_at ? new Date(style.created_at).toLocaleDateString('en-IN') : 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Last Updated</span>
                  <span className="text-sm">{style.updated_at ? new Date(style.updated_at).toLocaleDateString('en-IN') : 'N/A'}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default StyleDetailsPage;
