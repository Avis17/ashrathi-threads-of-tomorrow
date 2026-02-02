import { useState } from 'react';
import { Download, Eye, Save, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { CMTOperationsTable } from '@/components/admin/cmt-quotation/CMTOperationsTable';
import { CMTTrimsTable } from '@/components/admin/cmt-quotation/CMTTrimsTable';
import { CMTCostSummary } from '@/components/admin/cmt-quotation/CMTCostSummary';
import { CMTQuotationPreview } from '@/components/admin/cmt-quotation/CMTQuotationPreview';
import { CMTQuotationData, CMTOperation, CMTTrim, defaultTermsAndConditions } from '@/types/cmt-quotation';
import { generateCMTPdf } from '@/lib/cmtPdfGenerator';

const generateQuotationNo = () => {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `CMT-${year}-${random}`;
};

const initialData: CMTQuotationData = {
  quotationNo: generateQuotationNo(),
  date: new Date().toISOString().split('T')[0],
  validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  buyerName: '',
  buyerAddress: '',
  styleName: '',
  styleCode: '',
  fabricType: '',
  gsm: '',
  fitType: '',
  sizeRange: '',
  orderQuantity: 0,
  operations: [],
  trims: [],
  totalStitchingCost: 0,
  finishingPackingCost: 0,
  overheadsCost: 0,
  finalCMTPerPiece: 0,
  totalOrderValue: 0,
  termsAndConditions: defaultTermsAndConditions,
  signatoryName: 'For Feather Fashions',
};

export default function CMTQuotation() {
  const [data, setData] = useState<CMTQuotationData>(initialData);
  const [isGenerating, setIsGenerating] = useState(false);
  const updateField = <K extends keyof CMTQuotationData>(field: K, value: CMTQuotationData[K]) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handleOperationsChange = (operations: CMTOperation[]) => {
    const totalStitchingCost = operations.reduce((sum, op) => sum + op.ratePerPiece, 0);
    setData(prev => ({ ...prev, operations, totalStitchingCost }));
  };

  const handleTrimsChange = (trims: CMTTrim[]) => {
    setData(prev => ({ ...prev, trims }));
  };

  const totalStitchingCost = data.operations.reduce((sum, op) => sum + op.ratePerPiece, 0);

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    toast.info('Generating PDF...');

    try {
      await generateCMTPdf(data);
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveDraft = () => {
    localStorage.setItem('cmt-quotation-draft', JSON.stringify(data));
    toast.success('Draft saved successfully!');
  };

  const handleLoadDraft = () => {
    const draft = localStorage.getItem('cmt-quotation-draft');
    if (draft) {
      setData(JSON.parse(draft));
      toast.success('Draft loaded!');
    } else {
      toast.info('No draft found');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Action Bar */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold">CMT Quotation Generator</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleLoadDraft}>
              Load Draft
            </Button>
            <Button variant="outline" size="sm" onClick={handleSaveDraft}>
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
            <Button 
              onClick={handleDownloadPDF} 
              disabled={isGenerating}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              {isGenerating ? 'Generating...' : 'Download PDF'}
            </Button>
          </div>
        </div>
      </div>

      {/* Two-Panel Layout */}
      <div className="flex gap-6 p-6">
        {/* Left Panel - Form */}
        <div className="flex-1 space-y-6 max-w-2xl">
          {/* Header Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quotation Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quotationNo">Quotation No</Label>
                <Input
                  id="quotationNo"
                  value={data.quotationNo}
                  onChange={(e) => updateField('quotationNo', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={data.date}
                  onChange={(e) => updateField('date', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="validUntil">Valid Until</Label>
                <Input
                  id="validUntil"
                  type="date"
                  value={data.validUntil}
                  onChange={(e) => updateField('validUntil', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Buyer Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Buyer Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="buyerName">Buyer Name</Label>
                <Input
                  id="buyerName"
                  value={data.buyerName}
                  onChange={(e) => updateField('buyerName', e.target.value)}
                  placeholder="Enter buyer/company name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="buyerAddress">Buyer Address</Label>
                <Textarea
                  id="buyerAddress"
                  value={data.buyerAddress}
                  onChange={(e) => updateField('buyerAddress', e.target.value)}
                  placeholder="Full address..."
                  className="min-h-[80px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Style Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Style Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="styleName">Style Name</Label>
                <Input
                  id="styleName"
                  value={data.styleName}
                  onChange={(e) => updateField('styleName', e.target.value)}
                  placeholder="e.g., Men's Basic Crew Neck T-Shirt"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="styleCode">Style Code</Label>
                <Input
                  id="styleCode"
                  value={data.styleCode}
                  onChange={(e) => updateField('styleCode', e.target.value)}
                  placeholder="e.g., FF-MTS-001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fabricType">Fabric Type</Label>
                <Input
                  id="fabricType"
                  value={data.fabricType}
                  onChange={(e) => updateField('fabricType', e.target.value)}
                  placeholder="e.g., 100% Cotton Single Jersey"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gsm">GSM</Label>
                <Input
                  id="gsm"
                  value={data.gsm}
                  onChange={(e) => updateField('gsm', e.target.value)}
                  placeholder="e.g., 180"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fitType">Fit Type</Label>
                <Input
                  id="fitType"
                  value={data.fitType}
                  onChange={(e) => updateField('fitType', e.target.value)}
                  placeholder="e.g., Regular Fit"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sizeRange">Size Range</Label>
                <Input
                  id="sizeRange"
                  value={data.sizeRange}
                  onChange={(e) => updateField('sizeRange', e.target.value)}
                  placeholder="e.g., S - 3XL"
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="orderQuantity">Order Quantity (pcs)</Label>
                <Input
                  id="orderQuantity"
                  type="number"
                  value={data.orderQuantity || ''}
                  onChange={(e) => updateField('orderQuantity', parseInt(e.target.value) || 0)}
                  placeholder="e.g., 5000"
                />
              </div>
            </CardContent>
          </Card>

          {/* Operations Table */}
          <Card>
            <CardContent className="pt-6">
              <CMTOperationsTable
                operations={data.operations}
                onOperationsChange={handleOperationsChange}
              />
            </CardContent>
          </Card>

          {/* Trims Table */}
          <Card>
            <CardContent className="pt-6">
              <CMTTrimsTable
                trims={data.trims}
                onTrimsChange={handleTrimsChange}
              />
            </CardContent>
          </Card>

          {/* Cost Summary */}
          <Card>
            <CardContent className="pt-6">
              <CMTCostSummary
                totalStitchingCost={totalStitchingCost}
                finishingPackingCost={data.finishingPackingCost}
                overheadsCost={data.overheadsCost}
                orderQuantity={data.orderQuantity}
                onFinishingPackingChange={(value) => updateField('finishingPackingCost', value)}
                onOverheadsChange={(value) => updateField('overheadsCost', value)}
              />
            </CardContent>
          </Card>

          {/* Terms & Conditions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Terms & Conditions</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={data.termsAndConditions}
                onChange={(e) => updateField('termsAndConditions', e.target.value)}
                className="min-h-[200px] font-mono text-sm"
              />
            </CardContent>
          </Card>

          {/* Signatory */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Signatory</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="signatoryName">Authorized Signatory Name</Label>
                <Input
                  id="signatoryName"
                  value={data.signatoryName}
                  onChange={(e) => updateField('signatoryName', e.target.value)}
                  placeholder="For Feather Fashions"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Preview */}
        <div className="sticky top-20 h-fit w-[420px] flex-shrink-0">
          <div className="flex items-center gap-2 mb-4">
            <Eye className="h-5 w-5 text-muted-foreground" />
            <h2 className="font-semibold text-lg">Live Preview</h2>
            <span className="text-xs text-muted-foreground">(Scaled view)</span>
          </div>
          <div className="border rounded-lg overflow-hidden shadow-lg bg-white" style={{ maxHeight: 'calc(100vh - 140px)', overflowY: 'auto' }}>
            <div className="origin-top-left scale-[0.5]" style={{ width: '794px', marginBottom: '-50%' }}>
              <CMTQuotationPreview data={data} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
