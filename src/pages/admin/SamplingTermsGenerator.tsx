import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Download, FileText, Eye, Save, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface SampleType {
  name: string;
  enabled: boolean;
}

interface PolicySection {
  title: string;
  content: string;
  enabled: boolean;
}

interface TermsData {
  companyName: string;
  companyTagline: string;
  companyLocation: string;
  companyWebsite: string;
  buyerName: string;
  productCategory: string;
  sampleTypes: SampleType[];
  sampleChargesNote: string;
  brandingPolicyNote: string;
  leadTimeMin: number;
  leadTimeMax: number;
  moqPerStyle: string;
  advancePaymentPercent: number;
  courierOptions: string;
  additionalSections: PolicySection[];
}

const defaultSampleTypes: SampleType[] = [
  { name: 'Fit / Development Sample', enabled: true },
  { name: 'Pre-Production (PP) Sample', enabled: true },
  { name: 'Fabric / Color Reference Sample', enabled: true },
  { name: 'Size Set Sample', enabled: false },
  { name: 'Photo Sample', enabled: false },
];

const defaultAdditionalSections: PolicySection[] = [
  {
    title: 'Image & Design Usage',
    content: 'All designs, patterns, and developments created by the manufacturer remain intellectual property. Images shared are for evaluation purposes only. Reuse, resale, or sharing with third parties is not permitted.',
    enabled: true,
  },
  {
    title: 'Bulk Order Terms (Post-Sampling)',
    content: 'MOQ applies per style/color. Bulk price is finalized after sample approval. Production starts only after PO confirmation and advance payment.',
    enabled: true,
  },
  {
    title: 'Acceptance of Policy',
    content: 'Proceeding with sampling confirms that the buyer accepts all terms mentioned above.',
    enabled: true,
  },
];

export default function SamplingTermsGenerator() {
  const [termsData, setTermsData] = useState<TermsData>({
    companyName: 'Feather Fashions',
    companyTagline: "Manufacturer of Women's Activewear & Sportswear",
    companyLocation: 'Tirupur, India',
    companyWebsite: 'https://featherfashions.in',
    buyerName: '',
    productCategory: "Women's Activewear",
    sampleTypes: defaultSampleTypes,
    sampleChargesNote: 'Sample charges depend on style complexity, fabric, and trims. Charges are payable in advance. Sample cost is adjustable against bulk order (subject to MOQ & confirmation).',
    brandingPolicyNote: 'Brand-labeled samples or edited images are provided only after sample payment confirmation OR bulk order confirmation. Until then, only neutral or reference images will be shared. This policy is strictly followed to prevent brand misuse.',
    leadTimeMin: 7,
    leadTimeMax: 15,
    moqPerStyle: '200 pcs',
    advancePaymentPercent: 50,
    courierOptions: 'DHL / FedEx / DTDC / Buyer-nominated courier',
    additionalSections: defaultAdditionalSections,
  });

  const [showPreview, setShowPreview] = useState(false);

  const updateSampleType = (index: number, enabled: boolean) => {
    const updated = [...termsData.sampleTypes];
    updated[index].enabled = enabled;
    setTermsData({ ...termsData, sampleTypes: updated });
  };

  const addSampleType = () => {
    setTermsData({
      ...termsData,
      sampleTypes: [...termsData.sampleTypes, { name: '', enabled: true }],
    });
  };

  const removeSampleType = (index: number) => {
    const updated = termsData.sampleTypes.filter((_, i) => i !== index);
    setTermsData({ ...termsData, sampleTypes: updated });
  };

  const updateSampleTypeName = (index: number, name: string) => {
    const updated = [...termsData.sampleTypes];
    updated[index].name = name;
    setTermsData({ ...termsData, sampleTypes: updated });
  };

  const updateAdditionalSection = (index: number, field: keyof PolicySection, value: string | boolean) => {
    const updated = [...termsData.additionalSections];
    (updated[index] as any)[field] = value;
    setTermsData({ ...termsData, additionalSections: updated });
  };

  const addAdditionalSection = () => {
    setTermsData({
      ...termsData,
      additionalSections: [...termsData.additionalSections, { title: '', content: '', enabled: true }],
    });
  };

  const removeAdditionalSection = (index: number) => {
    const updated = termsData.additionalSections.filter((_, i) => i !== index);
    setTermsData({ ...termsData, additionalSections: updated });
  };

  const generatePDF = async () => {
    try {
      const jsPDF = (await import('jspdf')).default;
      const doc = new jsPDF('p', 'mm', 'a4');
      
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const contentWidth = pageWidth - 2 * margin;
      let yPos = 20;

      // Helper function to add text with word wrap
      const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number, fontStyle: string = 'normal') => {
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', fontStyle);
        const lines = doc.splitTextToSize(text, maxWidth);
        doc.text(lines, x, y);
        return y + (lines.length * fontSize * 0.4);
      };

      // Header
      doc.setFillColor(30, 41, 59); // slate-800
      doc.rect(0, 0, pageWidth, 35, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text(`${termsData.companyName} – Sampling & Development Policy`, margin, 15);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`${termsData.companyTagline} | ${termsData.companyLocation}`, margin, 25);

      if (termsData.buyerName) {
        doc.setFontSize(9);
        doc.text(`Prepared for: ${termsData.buyerName}`, margin, 32);
      }

      yPos = 45;
      doc.setTextColor(30, 41, 59);

      // Section 1: Purpose
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('1. Purpose of Sampling', margin, yPos);
      yPos += 7;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      yPos = addWrappedText(
        'Sampling is done strictly to evaluate fit, fabric, workmanship, and construction quality before bulk production. It is not a free design or branding service.',
        margin, yPos, contentWidth, 10
      );
      yPos += 8;

      // Section 2: Sample Types
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('2. Sample Types We Offer', margin, yPos);
      yPos += 7;

      const enabledSampleTypes = termsData.sampleTypes.filter(st => st.enabled && st.name);
      enabledSampleTypes.forEach(type => {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`• ${type.name}`, margin + 5, yPos);
        yPos += 5;
      });
      yPos += 5;

      // Section 3: Sample Charges
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('3. Sample Charges', margin, yPos);
      yPos += 7;
      
      yPos = addWrappedText(termsData.sampleChargesNote, margin, yPos, contentWidth, 10);
      yPos += 3;
      
      doc.setFont('helvetica', 'bold');
      doc.text(`Standard Advance: ${termsData.advancePaymentPercent}% payment required before sampling begins.`, margin, yPos);
      yPos += 5;
      
      doc.setFont('helvetica', 'italic');
      yPos = addWrappedText('Note: Sampling without payment is not supported.', margin, yPos, contentWidth, 9);
      yPos += 8;

      // Section 4: Branding Policy
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('4. Branding & Logo Policy', margin, yPos);
      yPos += 7;
      
      yPos = addWrappedText(termsData.brandingPolicyNote, margin, yPos, contentWidth, 10);
      yPos += 8;

      // Section 5: Lead Time
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('5. Lead Time', margin, yPos);
      yPos += 7;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Sampling lead time: ${termsData.leadTimeMin}–${termsData.leadTimeMax} working days (after payment & full tech pack)`, margin, yPos);
      yPos += 6;
      doc.text('Delays may occur if:', margin, yPos);
      yPos += 5;
      doc.text('• Incomplete specifications', margin + 5, yPos);
      yPos += 5;
      doc.text('• Fabric/trims approval pending', margin + 5, yPos);
      yPos += 10;

      // Section 6: Shipping
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('6. Shipping of Samples', margin, yPos);
      yPos += 7;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('• Courier charges are borne by the buyer', margin, yPos);
      yPos += 5;
      doc.text(`• Samples shipped via ${termsData.courierOptions}`, margin, yPos);
      yPos += 10;

      // Additional Sections
      let sectionNum = 7;
      termsData.additionalSections.filter(s => s.enabled && s.title && s.content).forEach(section => {
        // Check if we need a new page
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`${sectionNum}. ${section.title}`, margin, yPos);
        yPos += 7;
        
        yPos = addWrappedText(section.content, margin, yPos, contentWidth, 10);
        yPos += 8;
        sectionNum++;
      });

      // Footer
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      yPos += 10;
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 10;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(termsData.companyName, margin, yPos);
      yPos += 5;
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`${termsData.companyTagline} – ${termsData.companyLocation}`, margin, yPos);
      yPos += 5;
      doc.setTextColor(59, 130, 246);
      doc.text(termsData.companyWebsite, margin, yPos);

      // Date stamp
      doc.setTextColor(128, 128, 128);
      doc.setFontSize(8);
      doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`, pageWidth - margin - 40, yPos);

      // Save PDF
      const fileName = termsData.buyerName 
        ? `Sampling-Terms-${termsData.buyerName.replace(/\s+/g, '-')}.pdf`
        : 'Sampling-Development-Policy.pdf';
      doc.save(fileName);
      
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            Sampling Terms Generator
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Generate professional sampling & development policy documents
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowPreview(!showPreview)}>
            <Eye className="h-4 w-4 mr-2" />
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </Button>
          <Button onClick={generatePDF} className="bg-primary hover:bg-primary/90">
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>

      <div className={`grid gap-6 ${showPreview ? 'lg:grid-cols-2' : 'grid-cols-1'}`}>
        {/* Form Section */}
        <div className="space-y-6">
          {/* Company Details */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Company Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={termsData.companyName}
                    onChange={(e) => setTermsData({ ...termsData, companyName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyLocation">Location</Label>
                  <Input
                    id="companyLocation"
                    value={termsData.companyLocation}
                    onChange={(e) => setTermsData({ ...termsData, companyLocation: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyTagline">Tagline / Description</Label>
                <Input
                  id="companyTagline"
                  value={termsData.companyTagline}
                  onChange={(e) => setTermsData({ ...termsData, companyTagline: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyWebsite">Website</Label>
                <Input
                  id="companyWebsite"
                  value={termsData.companyWebsite}
                  onChange={(e) => setTermsData({ ...termsData, companyWebsite: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Buyer Details */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Buyer Details (Optional)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="buyerName">Buyer / Company Name</Label>
                  <Input
                    id="buyerName"
                    placeholder="Leave empty for generic document"
                    value={termsData.buyerName}
                    onChange={(e) => setTermsData({ ...termsData, buyerName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="productCategory">Product Category</Label>
                  <Select
                    value={termsData.productCategory}
                    onValueChange={(value) => setTermsData({ ...termsData, productCategory: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Women's Activewear">Women's Activewear</SelectItem>
                      <SelectItem value="Men's Sportswear">Men's Sportswear</SelectItem>
                      <SelectItem value="Kids Clothing">Kids Clothing</SelectItem>
                      <SelectItem value="Nightwear">Nightwear</SelectItem>
                      <SelectItem value="Innerwear">Innerwear</SelectItem>
                      <SelectItem value="General Apparel">General Apparel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sample Types */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Sample Types Offered</CardTitle>
                <Button variant="outline" size="sm" onClick={addSampleType}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Type
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {termsData.sampleTypes.map((type, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Checkbox
                    checked={type.enabled}
                    onCheckedChange={(checked) => updateSampleType(index, checked as boolean)}
                  />
                  <Input
                    value={type.name}
                    onChange={(e) => updateSampleTypeName(index, e.target.value)}
                    placeholder="Sample type name"
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeSampleType(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Sample Charges */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Sample Charges Policy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Standard Sampling Advance (%)</Label>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={termsData.advancePaymentPercent}
                    onChange={(e) => setTermsData({ ...termsData, advancePaymentPercent: parseInt(e.target.value) || 0 })}
                    className="w-32"
                  />
                  <span className="text-sm text-muted-foreground">% advance payment required for sampling</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Sample Charges Note</Label>
                <Textarea
                  value={termsData.sampleChargesNote}
                  onChange={(e) => setTermsData({ ...termsData, sampleChargesNote: e.target.value })}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Branding Policy */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Branding & Logo Policy</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={termsData.brandingPolicyNote}
                onChange={(e) => setTermsData({ ...termsData, brandingPolicyNote: e.target.value })}
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Lead Time & Shipping */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Lead Time & Shipping</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Lead Time (Min Days)</Label>
                  <Input
                    type="number"
                    value={termsData.leadTimeMin}
                    onChange={(e) => setTermsData({ ...termsData, leadTimeMin: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Lead Time (Max Days)</Label>
                  <Input
                    type="number"
                    value={termsData.leadTimeMax}
                    onChange={(e) => setTermsData({ ...termsData, leadTimeMax: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Courier Options</Label>
                <Input
                  value={termsData.courierOptions}
                  onChange={(e) => setTermsData({ ...termsData, courierOptions: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Additional Sections */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Additional Policy Sections</CardTitle>
                <Button variant="outline" size="sm" onClick={addAdditionalSection}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Section
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {termsData.additionalSections.map((section, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={section.enabled}
                      onCheckedChange={(checked) => updateAdditionalSection(index, 'enabled', checked as boolean)}
                    />
                    <Input
                      value={section.title}
                      onChange={(e) => updateAdditionalSection(index, 'title', e.target.value)}
                      placeholder="Section title"
                      className="flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeAdditionalSection(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <Textarea
                    value={section.content}
                    onChange={(e) => updateAdditionalSection(index, 'content', e.target.value)}
                    placeholder="Section content..."
                    rows={3}
                    disabled={!section.enabled}
                    className={!section.enabled ? 'opacity-50' : ''}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Preview Section */}
        {showPreview && (
          <div className="lg:sticky lg:top-6 h-fit">
            <Card className="overflow-hidden">
              <CardHeader className="bg-slate-800 text-white pb-4">
                <CardTitle className="text-lg">
                  {termsData.companyName} – Sampling & Development Policy
                </CardTitle>
                <p className="text-slate-300 text-sm">
                  {termsData.companyTagline} | {termsData.companyLocation}
                </p>
                {termsData.buyerName && (
                  <p className="text-slate-400 text-xs mt-1">
                    Prepared for: {termsData.buyerName}
                  </p>
                )}
              </CardHeader>
              <CardContent className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                {/* Purpose */}
                <div>
                  <h3 className="font-semibold text-foreground mb-2">1. Purpose of Sampling</h3>
                  <p className="text-sm text-muted-foreground">
                    Sampling is done strictly to evaluate fit, fabric, workmanship, and construction quality before bulk production. It is not a free design or branding service.
                  </p>
                </div>

                {/* Sample Types */}
                <div>
                  <h3 className="font-semibold text-foreground mb-2">2. Sample Types We Offer</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {termsData.sampleTypes.filter(st => st.enabled && st.name).map((type, i) => (
                      <li key={i}>• {type.name}</li>
                    ))}
                  </ul>
                </div>

                {/* Sample Charges */}
                <div>
                  <h3 className="font-semibold text-foreground mb-2">3. Sample Charges</h3>
                  <p className="text-sm text-muted-foreground">{termsData.sampleChargesNote}</p>
                  <p className="text-sm font-medium text-foreground mt-2">
                    Standard Advance: {termsData.advancePaymentPercent}% payment required before sampling begins.
                  </p>
                  <p className="text-sm text-muted-foreground italic mt-1">Note: Sampling without payment is not supported.</p>
                </div>

                {/* Branding Policy */}
                <div>
                  <h3 className="font-semibold text-foreground mb-2">4. Branding & Logo Policy</h3>
                  <p className="text-sm text-muted-foreground">{termsData.brandingPolicyNote}</p>
                </div>

                {/* Lead Time */}
                <div>
                  <h3 className="font-semibold text-foreground mb-2">5. Lead Time</h3>
                  <p className="text-sm text-muted-foreground">
                    Sampling lead time: {termsData.leadTimeMin}–{termsData.leadTimeMax} working days (after payment & full tech pack)
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Delays may occur if:</p>
                  <ul className="text-sm text-muted-foreground">
                    <li>• Incomplete specifications</li>
                    <li>• Fabric/trims approval pending</li>
                  </ul>
                </div>

                {/* Shipping */}
                <div>
                  <h3 className="font-semibold text-foreground mb-2">6. Shipping of Samples</h3>
                  <ul className="text-sm text-muted-foreground">
                    <li>• Courier charges are borne by the buyer</li>
                    <li>• Samples shipped via {termsData.courierOptions}</li>
                  </ul>
                </div>

                {/* Additional Sections */}
                {termsData.additionalSections.filter(s => s.enabled && s.title && s.content).map((section, index) => (
                  <div key={index}>
                    <h3 className="font-semibold text-foreground mb-2">{7 + index}. {section.title}</h3>
                    <p className="text-sm text-muted-foreground">{section.content}</p>
                  </div>
                ))}

                <Separator />

                {/* Footer */}
                <div className="pt-2">
                  <p className="font-semibold text-foreground">{termsData.companyName}</p>
                  <p className="text-sm text-muted-foreground">
                    {termsData.companyTagline} – {termsData.companyLocation}
                  </p>
                  <p className="text-sm text-primary">{termsData.companyWebsite}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
