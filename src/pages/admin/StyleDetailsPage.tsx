import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Package, IndianRupee, FileText, ExternalLink, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useJobStyle, useUpdateJobStyle } from '@/hooks/useJobStyles';
import { useCMTQuotations } from '@/hooks/useCMTQuotations';
import { toast } from 'sonner';

const StyleDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: style, isLoading } = useJobStyle(id || '');
  const { data: quotations } = useCMTQuotations();
  const updateStyle = useUpdateJobStyle();

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

  // Parse process_rate_details
  const processRateDetails = style.process_rate_details as any;
  const operations = processRateDetails?.operations || [];
  const accessories = processRateDetails?.accessories || { amount: 0, description: '' };
  const transportation = processRateDetails?.transportation || { amount: 0, notes: '' };
  const companyProfit = processRateDetails?.company_profit || 0;
  const isSetItem = processRateDetails?.is_set_item || false;

  // Calculate totals
  const operationsTotal = operations.reduce((sum: number, op: any) => sum + (op.rate || 0), 0);
  const finalRate = operationsTotal + (accessories.amount || 0) + (transportation.amount || 0) + companyProfit;

  // Legacy rates fallback
  const legacyRates = [
    { name: 'Cutting', value: style.rate_cutting, icon: '✂️' },
    { name: 'Stitching (Singer)', value: style.rate_stitching_singer, icon: '🧵' },
    { name: 'Stitching (Power)', value: style.rate_stitching_power_table, icon: '⚡' },
    { name: 'Ironing', value: style.rate_ironing, icon: '👔' },
    { name: 'Checking', value: style.rate_checking, icon: '✓' },
    { name: 'Packing', value: style.rate_packing, icon: '📦' },
  ];
  const legacyTotal = legacyRates.reduce((sum, rate) => sum + (rate.value || 0), 0);

  const hasNewOperations = operations.length > 0;

  const linkedQuotation = quotations?.find(q => q.id === style.linked_cmt_quotation_id);

  const handleLinkQuotation = (quotationId: string) => {
    updateStyle.mutate({
      id: style.id,
      data: { linked_cmt_quotation_id: quotationId === 'none' ? null : quotationId }
    }, {
      onSuccess: () => {
        toast.success('Quotation linked successfully');
      }
    });
  };

  return (
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
        <Button onClick={() => navigate(`/admin/job-management?tab=styles&edit=${style.id}`)}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Style
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image */}
          {style.style_image_url && (
            <Card>
              <CardContent className="p-0">
                <div className="aspect-video w-full rounded-lg overflow-hidden bg-muted">
                  <img
                    src={style.style_image_url}
                    alt={style.style_name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </CardContent>
            </Card>
          )}

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

          {/* Process Rates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IndianRupee className="h-5 w-5" />
                Process Rates
              </CardTitle>
            </CardHeader>
            <CardContent>
              {hasNewOperations ? (
                <div className="space-y-4">
                  {/* Operations Table */}
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-left p-3 font-medium">Operation</th>
                          <th className="text-left p-3 font-medium">Description</th>
                          <th className="text-right p-3 font-medium">Rate (₹)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {operations.map((op: any, idx: number) => (
                          <tr key={idx} className="border-t">
                            <td className="p-3">{op.operation}</td>
                            <td className="p-3 text-muted-foreground">{op.description || '-'}</td>
                            <td className="p-3 text-right font-medium">₹{(op.rate || 0).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Additional Costs */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-muted/30 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground">Accessories</p>
                      <p className="text-lg font-semibold">₹{(accessories.amount || 0).toFixed(2)}</p>
                      {accessories.description && (
                        <p className="text-xs text-muted-foreground mt-1">{accessories.description}</p>
                      )}
                    </div>
                    <div className="bg-muted/30 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground">Transportation</p>
                      <p className="text-lg font-semibold">₹{(transportation.amount || 0).toFixed(2)}</p>
                      {transportation.notes && (
                        <p className="text-xs text-muted-foreground mt-1">{transportation.notes}</p>
                      )}
                    </div>
                    <div className="bg-muted/30 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground">Company Profit</p>
                      <p className="text-lg font-semibold">₹{companyProfit.toFixed(2)}</p>
                    </div>
                  </div>

                  <Separator />

                  {/* Final Rate */}
                  <div className="flex items-center justify-between bg-primary/10 rounded-lg p-4">
                    <span className="font-semibold">Final Job Work Rate per Piece</span>
                    <span className="text-2xl font-bold text-primary">₹{finalRate.toFixed(2)}</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {legacyRates.map((rate) => (
                    <div key={rate.name} className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <span>{rate.icon}</span>
                        <span>{rate.name}</span>
                      </span>
                      <span className="font-medium">₹{(rate.value || 0).toFixed(2)}</span>
                    </div>
                  ))}
                  <Separator />
                  <div className="flex items-center justify-between font-semibold">
                    <span>Total per Piece</span>
                    <span className="text-primary">₹{legacyTotal.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Remarks */}
          {style.remarks && (
            <Card>
              <CardHeader>
                <CardTitle>Remarks</CardTitle>
              </CardHeader>
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
                <Select
                  value={style.linked_cmt_quotation_id || 'none'}
                  onValueChange={handleLinkQuotation}
                >
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
                <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{linkedQuotation.quotation_no}</span>
                    <Badge variant="outline">{linkedQuotation.status}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>Buyer: {linkedQuotation.buyer_name}</p>
                    <p>Final CMT: ₹{Number(linkedQuotation.final_cmt_per_piece).toFixed(2)}</p>
                  </div>
                  <Button variant="outline" size="sm" className="w-full" asChild>
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
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Created</span>
                <span className="text-sm">
                  {style.created_at ? new Date(style.created_at).toLocaleDateString('en-IN') : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Last Updated</span>
                <span className="text-sm">
                  {style.updated_at ? new Date(style.updated_at).toLocaleDateString('en-IN') : 'N/A'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StyleDetailsPage;
