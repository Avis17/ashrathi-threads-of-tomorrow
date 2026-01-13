import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Download, Plus, Trash2, Building2, FileText, Package, Clock, CreditCard, Eye, Phone, Mail, Globe } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import logoImage from '@/assets/logo.png';
import { sanitizePdfText } from '@/lib/invoiceUtils';

// Dynamic import for jsPDF - reduces bundle size
const loadPdfLibs = async () => {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable')
  ]);
  return { jsPDF, autoTable };
};

interface PricingVariant {
  id: string;
  variant: string;
  rate: number;
}

interface QuotationData {
  // Buyer Details
  buyerName: string;
  buyerCompany: string;
  buyerEmail: string;
  buyerPhone: string;
  buyerCountry: string;
  
  // Product Details
  productName: string;
  productDescription: string;
  fabric: string;
  gsm: number;
  sizeRange: string;
  quantity: number;
  quantityUnit: string;
  
  // Pricing Variants
  variants: PricingVariant[];
  
  // Inclusions & Exclusions
  inclusions: string[];
  exclusions: string[];
  
  // Company Capacity
  stitchingMachines: number;
  monthlyCapacityMin: number;
  monthlyCapacityMax: number;
  
  // Timeline
  samplingDaysMin: number;
  samplingDaysMax: number;
  productionDaysMin: number;
  productionDaysMax: number;
  
  // Payment Terms
  advancePercent: number;
  balanceTerms: string;
  repeatBuyerTerms: string;
  
  // Additional
  quotationNumber: string;
  quotationDate: string;
  validUntil: string;
  currency: string;
  deliveryTerms: string;
  notes: string;
  
  // Company Contact
  companyPhone: string;
  companyEmail: string;
  companyWebsite: string;
  
  // Bank Details (optional)
  showBankDetails: boolean;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  accountHolder: string;
}

const defaultInclusions = [
  'Fabric + Cutting + Stitching + Thread + Basic finishing',
  'Standard QC before dispatch',
  'Size label + Wash care label',
  'Individual polybag packing + master carton packing'
];

const defaultExclusions = [
  'Drawstring, special trims, branding print/embroidery',
  'Special packing (hanger/brand box/barcode stickers)',
  'Lab testing (OEKO-TEX / GOTS / etc.) if buyer requires',
  'Freight, customs, and shipping charges (FOB/CIF can be quoted separately)'
];

const fabricOptions = [
  '100% Cotton',
  '100% Polyester',
  'Cotton-Polyester Blend',
  'Cotton-Lycra Blend',
  'Modal',
  'Bamboo',
  'Viscose',
  'Nylon-Spandex',
  'Terry Cotton',
  'French Terry',
  'Fleece',
  'Jersey Knit'
];

// ASCII-safe currency display for PDF
const getCurrencyText = (currency: string): string => {
  const currencyTexts: Record<string, string> = {
    'INR': 'Rs.',
    'USD': 'USD',
    'EUR': 'EUR',
    'GBP': 'GBP',
    'AED': 'AED'
  };
  return currencyTexts[currency] || currency;
};

// For UI display (can use unicode)
const currencySymbols: Record<string, string> = {
  'INR': '₹',
  'USD': '$',
  'EUR': '€',
  'GBP': '£',
  'AED': 'AED'
};

export default function QuotationGenerator() {
  const { toast } = useToast();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const [quotationData, setQuotationData] = useState<QuotationData>({
    buyerName: '',
    buyerCompany: '',
    buyerEmail: '',
    buyerPhone: '',
    buyerCountry: '',
    
    productName: '',
    productDescription: '',
    fabric: '100% Cotton',
    gsm: 180,
    sizeRange: 'S - XXL',
    quantity: 10000,
    quantityUnit: 'pcs',
    
    variants: [
      { id: '1', variant: 'Plain', rate: 0 }
    ],
    
    inclusions: [...defaultInclusions],
    exclusions: [...defaultExclusions],
    
    stitchingMachines: 80,
    monthlyCapacityMin: 20000,
    monthlyCapacityMax: 30000,
    
    samplingDaysMin: 7,
    samplingDaysMax: 10,
    productionDaysMin: 35,
    productionDaysMax: 45,
    
    advancePercent: 50,
    balanceTerms: 'Before dispatch',
    repeatBuyerTerms: '30% advance + 70% against final inspection',
    
    quotationNumber: `FF-Q-${Date.now().toString().slice(-6)}`,
    quotationDate: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    currency: 'INR',
    deliveryTerms: 'EX-Factory',
    notes: '',
    
    // Company Contact defaults
    companyPhone: '+91 86100 36556',
    companyEmail: 'featherfashions.in@gmail.com',
    companyWebsite: 'https://featherfashions.in',
    
    // Bank Details
    showBankDetails: false,
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    accountHolder: 'FEATHER FASHIONS'
  });

  const [newInclusion, setNewInclusion] = useState('');
  const [newExclusion, setNewExclusion] = useState('');

  const updateData = (field: keyof QuotationData, value: any) => {
    setQuotationData(prev => ({ ...prev, [field]: value }));
  };

  const addVariant = () => {
    const newVariant: PricingVariant = {
      id: Date.now().toString(),
      variant: '',
      rate: 0
    };
    updateData('variants', [...quotationData.variants, newVariant]);
  };

  const updateVariant = (id: string, field: keyof PricingVariant, value: any) => {
    const updated = quotationData.variants.map(v => 
      v.id === id ? { ...v, [field]: value } : v
    );
    updateData('variants', updated);
  };

  const removeVariant = (id: string) => {
    updateData('variants', quotationData.variants.filter(v => v.id !== id));
  };

  const addInclusion = () => {
    if (newInclusion.trim()) {
      updateData('inclusions', [...quotationData.inclusions, newInclusion.trim()]);
      setNewInclusion('');
    }
  };

  const removeInclusion = (index: number) => {
    updateData('inclusions', quotationData.inclusions.filter((_, i) => i !== index));
  };

  const addExclusion = () => {
    if (newExclusion.trim()) {
      updateData('exclusions', [...quotationData.exclusions, newExclusion.trim()]);
      setNewExclusion('');
    }
  };

  const removeExclusion = (index: number) => {
    updateData('exclusions', quotationData.exclusions.filter((_, i) => i !== index));
  };

  // Format number with Indian grouping
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  // Format rate for PDF (ASCII-safe)
  const formatRate = (rate: number, currency: string, unit: string): string => {
    const currencyText = getCurrencyText(currency);
    const unitSingular = unit.replace(/s$/, '');
    return sanitizePdfText(`${currencyText} ${formatNumber(rate)}/${unitSingular}`);
  };

  const generatePDF = async (download: boolean = true) => {
    setGenerating(true);
    try {
      const { jsPDF, autoTable } = await loadPdfLibs();
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      let yPos = margin;

      const currencyText = getCurrencyText(quotationData.currency);

      // Colors
      const primaryColor: [number, number, number] = [30, 41, 59]; // slate-800
      const accentColor: [number, number, number] = [14, 165, 233]; // sky-500
      const mutedColor: [number, number, number] = [100, 116, 139]; // slate-500
      const lightBg: [number, number, number] = [248, 250, 252]; // slate-50
      const successColor: [number, number, number] = [22, 163, 74]; // green-600
      const dangerColor: [number, number, number] = [220, 38, 38]; // red-600

      // Header Background with gradient effect
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, pageWidth, 55, 'F');
      
      // Accent stripe
      doc.setFillColor(...accentColor);
      doc.rect(0, 53, pageWidth, 2, 'F');

      // Logo - left side
      try {
        const img = new Image();
        img.src = logoImage;
        doc.addImage(img, 'PNG', margin, 10, 35, 35);
      } catch (e) {
        // Fallback if logo fails
        doc.setFillColor(255, 255, 255);
        doc.circle(margin + 17.5, 27.5, 17.5, 'F');
        doc.setTextColor(15, 23, 42);
        doc.setFontSize(8);
        doc.text('LOGO', margin + 17.5, 29, { align: 'center' });
      }

      // Company Name - Header
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('FEATHER FASHIONS', margin + 45, 22);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184); // slate-400
      doc.text("Women's Activewear & Sportswear Manufacturer", margin + 45, 30);
      doc.text('Tirupur, Tamil Nadu, India', margin + 45, 36);

      // Quotation Badge - Right side
      doc.setFillColor(...accentColor);
      doc.roundedRect(pageWidth - margin - 50, 12, 50, 20, 3, 3, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('QUOTATION', pageWidth - margin - 25, 24, { align: 'center' });

      // Quotation Number below badge
      doc.setTextColor(148, 163, 184);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(sanitizePdfText(`#${quotationData.quotationNumber}`), pageWidth - margin - 25, 40, { align: 'center' });

      yPos = 65;

      // Registration Details Bar
      doc.setFillColor(...lightBg);
      doc.rect(0, yPos - 5, pageWidth, 18, 'F');
      
      doc.setTextColor(...mutedColor);
      doc.setFontSize(7);
      const regDetails = [
        'GSTIN: 33FWTPS1281P1ZJ',
        'IEC: FWTPS1281P',
        'UDYAM: UDYAM-TN-28-0191326'
      ];
      const regWidth = (pageWidth - 2 * margin) / 3;
      regDetails.forEach((detail, i) => {
        doc.text(sanitizePdfText(detail), margin + (i * regWidth) + regWidth/2, yPos + 4, { align: 'center' });
      });

      yPos += 20;

      // Quotation Meta Info
      doc.setTextColor(...primaryColor);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      
      // Left side - Quotation details
      const dateFormatted = new Date(quotationData.quotationDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      const validUntilFormatted = new Date(quotationData.validUntil).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      doc.text(sanitizePdfText(`Date: ${dateFormatted}`), margin, yPos);
      doc.text(sanitizePdfText(`Valid Until: ${validUntilFormatted}`), margin, yPos + 5);
      
      // Right side - Buyer details (if provided)
      if (quotationData.buyerCompany || quotationData.buyerName) {
        doc.setFont('helvetica', 'bold');
        doc.text('Prepared For:', pageWidth - margin - 60, yPos);
        doc.setFont('helvetica', 'normal');
        let buyerY = yPos + 5;
        if (quotationData.buyerCompany) {
          doc.text(sanitizePdfText(quotationData.buyerCompany), pageWidth - margin - 60, buyerY);
          buyerY += 5;
        }
        if (quotationData.buyerName) {
          doc.text(sanitizePdfText(quotationData.buyerName), pageWidth - margin - 60, buyerY);
          buyerY += 5;
        }
        if (quotationData.buyerCountry) {
          doc.text(sanitizePdfText(quotationData.buyerCountry), pageWidth - margin - 60, buyerY);
        }
      }

      yPos += 25;

      // Product Title Section
      doc.setFillColor(...accentColor);
      doc.rect(margin, yPos, pageWidth - 2*margin, 12, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      const productTitle = sanitizePdfText(`${quotationData.productName} | ${quotationData.gsm} GSM ${quotationData.fabric}`);
      doc.text(productTitle, pageWidth/2, yPos + 8, { align: 'center' });
      
      yPos += 18;
      
      // Order Summary
      doc.setTextColor(...mutedColor);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      const orderSummary = sanitizePdfText(`Order Quantity: ${formatNumber(quotationData.quantity)} ${quotationData.quantityUnit} | Size Range: ${quotationData.sizeRange} | Delivery: ${quotationData.deliveryTerms}`);
      doc.text(orderSummary, pageWidth/2, yPos, { align: 'center' });

      yPos += 10;

      // Pricing Table
      const tableData = quotationData.variants.map(v => [
        sanitizePdfText(quotationData.productName),
        sanitizePdfText(quotationData.fabric),
        quotationData.gsm.toString(),
        sanitizePdfText(v.variant),
        sanitizePdfText(`${formatNumber(quotationData.quantity)} ${quotationData.quantityUnit}`),
        formatRate(v.rate, quotationData.currency, quotationData.quantityUnit)
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [[
          'Item', 
          'Fabric', 
          'GSM', 
          'Variant', 
          'Quantity', 
          sanitizePdfText(`Rate (${quotationData.deliveryTerms})`)
        ]],
        body: tableData,
        theme: 'plain',
        headStyles: {
          fillColor: [30, 41, 59],
          textColor: [255, 255, 255],
          fontSize: 9,
          fontStyle: 'bold',
          cellPadding: 4
        },
        bodyStyles: {
          fontSize: 9,
          cellPadding: 4,
          textColor: [30, 41, 59]
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252]
        },
        margin: { left: margin, right: margin },
        tableWidth: 'auto'
      });

      yPos = (doc as any).lastAutoTable.finalY + 12;

      // Section helper function - NO EMOJIS, clean text headers
      const addSection = (title: string, items: string[], type: 'default' | 'success' | 'info' = 'default') => {
        // Check if we need a new page
        if (yPos > pageHeight - 60) {
          doc.addPage();
          yPos = margin;
        }

        // Section header background
        doc.setFillColor(...lightBg);
        doc.rect(margin, yPos, pageWidth - 2*margin, 8, 'F');
        
        // Add colored left border for visual distinction
        if (type === 'success') {
          doc.setFillColor(...successColor);
        } else if (type === 'info') {
          doc.setFillColor(...accentColor);
        } else {
          doc.setFillColor(...primaryColor);
        }
        doc.rect(margin, yPos, 2, 8, 'F');
        
        doc.setTextColor(...primaryColor);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(sanitizePdfText(title), margin + 5, yPos + 5.5);
        yPos += 12;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(...mutedColor);
        items.forEach((item) => {
          if (yPos > pageHeight - 20) {
            doc.addPage();
            yPos = margin;
          }
          // Use bullet point instead of emoji
          doc.text(sanitizePdfText(`  •  ${item}`), margin + 3, yPos);
          yPos += 5;
        });
        yPos += 5;
      };

      // Inclusions
      addSection('INCLUSIONS (Included in above rate)', quotationData.inclusions, 'success');

      // Exclusions  
      addSection('EXCLUSIONS (Additional cost if required)', quotationData.exclusions, 'default');

      // Company Capacity
      if (yPos > pageHeight - 50) {
        doc.addPage();
        yPos = margin;
      }
      addSection('COMPANY CAPACITY & PRODUCTION SETUP', [
        `In-house stitching unit: ${quotationData.stitchingMachines} sewing machines (${quotationData.stitchingMachines}F seats)`,
        'Additional regular sub-units for bulk orders',
        `Monthly capacity: ${formatNumber(quotationData.monthlyCapacityMin)} - ${formatNumber(quotationData.monthlyCapacityMax)} ${quotationData.quantityUnit} (depending on style complexity)`,
        'GS1 Barcode allocation available (1000 numbers ready)'
      ], 'info');

      // Timeline
      addSection('TIMELINE', [
        `Sampling: ${quotationData.samplingDaysMin}-${quotationData.samplingDaysMax} days after receiving tech pack / size chart / artwork`,
        `Bulk production: ${quotationData.productionDaysMin}-${quotationData.productionDaysMax} days after PP sample approval + advance payment`,
        'Dispatch plan: Single lot or multiple lots as per buyer requirement'
      ], 'info');

      // Payment Terms - FIXED: Changed T0% to proper percentage
      const balancePercent = 100 - quotationData.advancePercent;
      addSection('PAYMENT TERMS', [
        `${quotationData.advancePercent}% advance + ${balancePercent}% ${quotationData.balanceTerms.toLowerCase()} (preferred)`,
        sanitizePdfText(quotationData.repeatBuyerTerms) + ' (for repeat buyers)',
        'Bank transfer / LC / PayPal accepted'
      ], 'info');

      // Details Required
      addSection('DETAILS REQUIRED TO CONFIRM FINAL PRICE', [
        'Tech pack / measurement spec / size chart',
        'Style reference photo or sample details',
        'Fabric type confirmation (knit/woven) and size range',
        'Printing type and artwork (for printed variant)',
        'Packing requirements and delivery terms'
      ], 'default');

      // Bank Details (optional)
      if (quotationData.showBankDetails && quotationData.bankName) {
        addSection('BANK DETAILS FOR PAYMENT', [
          `Bank Name: ${quotationData.bankName}`,
          `Account Holder: ${quotationData.accountHolder}`,
          `Account Number: ${quotationData.accountNumber}`,
          `IFSC Code: ${quotationData.ifscCode}`
        ], 'info');
      }

      // Notes
      if (quotationData.notes) {
        if (yPos > pageHeight - 40) {
          doc.addPage();
          yPos = margin;
        }
        doc.setFillColor(254, 249, 195); // amber-100
        doc.rect(margin, yPos, pageWidth - 2*margin, 18, 'F');
        doc.setFillColor(146, 64, 14); // amber-800 for left border
        doc.rect(margin, yPos, 2, 18, 'F');
        
        doc.setTextColor(146, 64, 14); // amber-800
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text('NOTE:', margin + 5, yPos + 6);
        doc.setFont('helvetica', 'normal');
        const noteLines = doc.splitTextToSize(sanitizePdfText(quotationData.notes), pageWidth - 2*margin - 25);
        doc.text(noteLines, margin + 18, yPos + 6);
        yPos += 22;
      }

      // Thank you message
      if (yPos > pageHeight - 50) {
        doc.addPage();
        yPos = margin;
      }
      yPos += 5;
      doc.setFillColor(...lightBg);
      doc.rect(margin, yPos, pageWidth - 2*margin, 15, 'F');
      doc.setTextColor(...primaryColor);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.text('Thank you for considering Feather Fashions as your manufacturing partner.', pageWidth/2, yPos + 6, { align: 'center' });
      doc.text('We look forward to working with you!', pageWidth/2, yPos + 11, { align: 'center' });
      
      // Footer
      const footerY = pageHeight - 30;
      
      // Footer separator line
      doc.setDrawColor(...accentColor);
      doc.setLineWidth(0.5);
      doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

      // Contact section - Left side
      doc.setTextColor(...primaryColor);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('FEATHER FASHIONS', margin, footerY + 2);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...mutedColor);
      doc.text('Tirupur, Tamil Nadu, India', margin, footerY + 7);
      
      // Contact details - Right side (NO EMOJIS)
      const contactX = pageWidth - margin - 55;
      doc.text(sanitizePdfText(`Email: ${quotationData.companyEmail}`), contactX, footerY + 2);
      doc.text(sanitizePdfText(`Web: ${quotationData.companyWebsite}`), contactX, footerY + 7);
      doc.text(sanitizePdfText(`Phone: ${quotationData.companyPhone}`), contactX, footerY + 12);

      // Signature line
      doc.setTextColor(...mutedColor);
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7);
      doc.text('This quotation is computer generated and valid without signature.', pageWidth/2, footerY + 22, { align: 'center' });

      if (download) {
        const fileName = sanitizePdfText(`Feather_Fashions_Quotation_${quotationData.productName.replace(/\s+/g, '_')}_${formatNumber(quotationData.quantity)}.pdf`);
        doc.save(fileName);
        toast({
          title: 'Quotation Generated',
          description: `${fileName} has been downloaded successfully.`
        });
      } else {
        const pdfBlob = doc.output('blob');
        const url = URL.createObjectURL(pdfBlob);
        setPreviewUrl(url);
        setPreviewOpen(true);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate quotation PDF.',
        variant: 'destructive'
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quotation Generator</h1>
          <p className="text-muted-foreground">Create professional export quotations for buyers</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => generatePDF(false)} disabled={generating}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button onClick={() => generatePDF(true)} disabled={generating}>
            <Download className="h-4 w-4 mr-2" />
            {generating ? 'Generating...' : 'Download PDF'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Quotation Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Quotation Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Quotation Number</Label>
                  <Input
                    value={quotationData.quotationNumber}
                    onChange={(e) => updateData('quotationNumber', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select value={quotationData.currency} onValueChange={(v) => updateData('currency', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INR">INR (₹)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="AED">AED</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Quotation Date</Label>
                  <Input
                    type="date"
                    value={quotationData.quotationDate}
                    onChange={(e) => updateData('quotationDate', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Valid Until</Label>
                  <Input
                    type="date"
                    value={quotationData.validUntil}
                    onChange={(e) => updateData('validUntil', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Delivery Terms</Label>
                <Select value={quotationData.deliveryTerms} onValueChange={(v) => updateData('deliveryTerms', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EX-Factory">EX-Factory</SelectItem>
                    <SelectItem value="FOB">FOB (Free on Board)</SelectItem>
                    <SelectItem value="CIF">CIF (Cost, Insurance & Freight)</SelectItem>
                    <SelectItem value="DDP">DDP (Delivered Duty Paid)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Company Contact Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Company Contact Details
              </CardTitle>
              <CardDescription>Your contact information for the quotation footer</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input
                    placeholder="+91 98765 43210"
                    value={quotationData.companyPhone}
                    onChange={(e) => updateData('companyPhone', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    placeholder="contact@company.com"
                    value={quotationData.companyEmail}
                    onChange={(e) => updateData('companyEmail', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Website</Label>
                <Input
                  placeholder="https://yourwebsite.com"
                  value={quotationData.companyWebsite}
                  onChange={(e) => updateData('companyWebsite', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Buyer Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Buyer Details (Optional)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Company Name</Label>
                  <Input
                    placeholder="Buyer's company"
                    value={quotationData.buyerCompany}
                    onChange={(e) => updateData('buyerCompany', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contact Person</Label>
                  <Input
                    placeholder="Contact name"
                    value={quotationData.buyerName}
                    onChange={(e) => updateData('buyerName', e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    placeholder="buyer@example.com"
                    value={quotationData.buyerEmail}
                    onChange={(e) => updateData('buyerEmail', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Country</Label>
                  <Input
                    placeholder="Country"
                    value={quotationData.buyerCountry}
                    onChange={(e) => updateData('buyerCountry', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Product Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Product Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Product Name *</Label>
                <Input
                  placeholder="e.g., Women's Pyjama Set (Top + Pant)"
                  value={quotationData.productName}
                  onChange={(e) => updateData('productName', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Product Description</Label>
                <Textarea
                  placeholder="Additional product details..."
                  value={quotationData.productDescription}
                  onChange={(e) => updateData('productDescription', e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Fabric</Label>
                  <Select value={quotationData.fabric} onValueChange={(v) => updateData('fabric', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fabricOptions.map(f => (
                        <SelectItem key={f} value={f}>{f}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>GSM</Label>
                  <Input
                    type="number"
                    value={quotationData.gsm}
                    onChange={(e) => updateData('gsm', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Order Quantity</Label>
                  <Input
                    type="number"
                    value={quotationData.quantity}
                    onChange={(e) => updateData('quantity', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Unit</Label>
                  <Select value={quotationData.quantityUnit} onValueChange={(v) => updateData('quantityUnit', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pcs">Pieces</SelectItem>
                      <SelectItem value="sets">Sets</SelectItem>
                      <SelectItem value="dozens">Dozens</SelectItem>
                      <SelectItem value="kgs">Kilograms</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Size Range</Label>
                  <Input
                    value={quotationData.sizeRange}
                    onChange={(e) => updateData('sizeRange', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Pricing Variants */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Pricing Variants</CardTitle>
              <Button variant="outline" size="sm" onClick={addVariant}>
                <Plus className="h-4 w-4 mr-1" /> Add Variant
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {quotationData.variants.map((variant, index) => (
                <div key={variant.id} className="flex gap-3 items-end">
                  <div className="flex-1 space-y-2">
                    <Label>Variant Name</Label>
                    <Input
                      placeholder="e.g., Plain, Printed, Embroidered"
                      value={variant.variant}
                      onChange={(e) => updateVariant(variant.id, 'variant', e.target.value)}
                    />
                  </div>
                  <div className="w-32 space-y-2">
                    <Label>Rate</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={variant.rate || ''}
                      onChange={(e) => updateVariant(variant.id, 'rate', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  {quotationData.variants.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => removeVariant(variant.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Inclusions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-green-700">✓ Inclusions</CardTitle>
              <CardDescription>What's included in the quoted rate</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {quotationData.inclusions.map((item, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {item}
                    <button onClick={() => removeInclusion(index)} className="ml-1 hover:text-destructive">
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add new inclusion..."
                  value={newInclusion}
                  onChange={(e) => setNewInclusion(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addInclusion()}
                />
                <Button variant="outline" size="sm" onClick={addInclusion}>Add</Button>
              </div>
            </CardContent>
          </Card>

          {/* Exclusions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-red-700">✗ Exclusions</CardTitle>
              <CardDescription>Additional costs if required</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {quotationData.exclusions.map((item, index) => (
                  <Badge key={index} variant="outline" className="flex items-center gap-1">
                    {item}
                    <button onClick={() => removeExclusion(index)} className="ml-1 hover:text-destructive">
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add new exclusion..."
                  value={newExclusion}
                  onChange={(e) => setNewExclusion(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addExclusion()}
                />
                <Button variant="outline" size="sm" onClick={addExclusion}>Add</Button>
              </div>
            </CardContent>
          </Card>

          {/* Timeline & Payment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Timeline & Capacity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Sampling Days (Min-Max)</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={quotationData.samplingDaysMin}
                      onChange={(e) => updateData('samplingDaysMin', parseInt(e.target.value) || 0)}
                    />
                    <span className="self-center">-</span>
                    <Input
                      type="number"
                      value={quotationData.samplingDaysMax}
                      onChange={(e) => updateData('samplingDaysMax', parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Production Days (Min-Max)</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={quotationData.productionDaysMin}
                      onChange={(e) => updateData('productionDaysMin', parseInt(e.target.value) || 0)}
                    />
                    <span className="self-center">-</span>
                    <Input
                      type="number"
                      value={quotationData.productionDaysMax}
                      onChange={(e) => updateData('productionDaysMax', parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Stitching Machines</Label>
                  <Input
                    type="number"
                    value={quotationData.stitchingMachines}
                    onChange={(e) => updateData('stitchingMachines', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Monthly Capacity (Min)</Label>
                  <Input
                    type="number"
                    value={quotationData.monthlyCapacityMin}
                    onChange={(e) => updateData('monthlyCapacityMin', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Monthly Capacity (Max)</Label>
                  <Input
                    type="number"
                    value={quotationData.monthlyCapacityMax}
                    onChange={(e) => updateData('monthlyCapacityMax', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Terms */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Advance Percentage</Label>
                  <Input
                    type="number"
                    value={quotationData.advancePercent}
                    onChange={(e) => updateData('advancePercent', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Balance Terms</Label>
                  <Input
                    value={quotationData.balanceTerms}
                    onChange={(e) => updateData('balanceTerms', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Repeat Buyer Terms</Label>
                <Input
                  value={quotationData.repeatBuyerTerms}
                  onChange={(e) => updateData('repeatBuyerTerms', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Bank Details */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Bank Details (Optional)
                </CardTitle>
                <Switch
                  checked={quotationData.showBankDetails}
                  onCheckedChange={(v) => updateData('showBankDetails', v)}
                />
              </div>
              <CardDescription>Include bank details for payment in the quotation</CardDescription>
            </CardHeader>
            {quotationData.showBankDetails && (
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Bank Name</Label>
                    <Input
                      placeholder="e.g., HDFC Bank"
                      value={quotationData.bankName}
                      onChange={(e) => updateData('bankName', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Account Holder</Label>
                    <Input
                      value={quotationData.accountHolder}
                      onChange={(e) => updateData('accountHolder', e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Account Number</Label>
                    <Input
                      placeholder="Account number"
                      value={quotationData.accountNumber}
                      onChange={(e) => updateData('accountNumber', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>IFSC Code</Label>
                    <Input
                      placeholder="e.g., HDFC0001234"
                      value={quotationData.ifscCode}
                      onChange={(e) => updateData('ifscCode', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Any additional notes or special conditions..."
                value={quotationData.notes}
                onChange={(e) => updateData('notes', e.target.value)}
                rows={3}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl h-[90vh]">
          <DialogHeader>
            <DialogTitle>Quotation Preview</DialogTitle>
          </DialogHeader>
          {previewUrl && (
            <iframe
              src={previewUrl}
              className="w-full h-full rounded-md"
              title="Quotation Preview"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
