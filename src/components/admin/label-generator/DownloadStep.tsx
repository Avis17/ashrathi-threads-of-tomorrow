import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Image, FileImage, FileText, Package, Eye, Save, Check } from 'lucide-react';
import { LabelConfig, ProductData } from '@/pages/admin/LabelGenerator';
import { LabelCanvas } from './LabelCanvas';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import { toast } from 'sonner';
import { useLabelTemplates } from '@/hooks/useLabelTemplates';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

interface DownloadStepProps {
  labelConfig: LabelConfig;
  productData: ProductData;
  canvasData: any;
  onBack: () => void;
}

export const DownloadStep = ({ labelConfig, productData, canvasData, onBack }: DownloadStepProps) => {
  const canvasRef = useRef<any>(null);
  const [selectedFormat, setSelectedFormat] = useState<'png' | 'jpg' | 'pdf'>('png');
  const [isExporting, setIsExporting] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const { createTemplate } = useLabelTemplates();

  // Calculate canvas dimensions
  const scale = 3.78;
  const canvasWidth = labelConfig.orientation === 'landscape' ? labelConfig.height * scale : labelConfig.width * scale;
  const canvasHeight = labelConfig.orientation === 'landscape' ? labelConfig.width * scale : labelConfig.height * scale;

  const handleExport = async () => {
    if (!canvasRef.current) {
      toast.error('Canvas not ready');
      return;
    }

    setIsExporting(true);

    try {
      const fileName = `label_${productData.productName.replace(/\s+/g, '_')}_${Date.now()}`;

      if (selectedFormat === 'png') {
        const dataUrl = canvasRef.current.exportToPNG();
        const blob = await fetch(dataUrl).then(r => r.blob());
        saveAs(blob, `${fileName}.png`);
        toast.success('PNG exported successfully!');
      } else if (selectedFormat === 'jpg') {
        const dataUrl = canvasRef.current.exportToJPG();
        const blob = await fetch(dataUrl).then(r => r.blob());
        saveAs(blob, `${fileName}.jpg`);
        toast.success('JPG exported successfully!');
      } else if (selectedFormat === 'pdf') {
        const dataUrl = canvasRef.current.exportToPNG();
        
        // Create PDF at 300 DPI for print quality
        const mmWidth = labelConfig.orientation === 'landscape' ? labelConfig.height : labelConfig.width;
        const mmHeight = labelConfig.orientation === 'landscape' ? labelConfig.width : labelConfig.height;
        
        const pdf = new jsPDF({
          orientation: mmWidth > mmHeight ? 'landscape' : 'portrait',
          unit: 'mm',
          format: [mmWidth, mmHeight],
        });

        pdf.addImage(dataUrl, 'PNG', 0, 0, mmWidth, mmHeight);
        pdf.save(`${fileName}.pdf`);
        toast.success('PDF exported successfully (300 DPI)!');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export');
    } finally {
      setIsExporting(false);
    }
  };

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      toast.error('Please enter a template name');
      return;
    }

    try {
      await createTemplate.mutateAsync({
        name: templateName,
        label_width: labelConfig.width,
        label_height: labelConfig.height,
        orientation: labelConfig.orientation,
        include_logo: labelConfig.includeLogo,
        logo_url: labelConfig.logoUrl,
        canvas_data: canvasData,
      });
      toast.success('Template saved successfully!');
      setShowSaveDialog(false);
      setTemplateName('');
    } catch (error) {
      toast.error('Failed to save template');
    }
  };

  const formatOptions = [
    {
      id: 'png' as const,
      label: 'PNG',
      description: 'Best for digital use, transparent background',
      icon: Image,
    },
    {
      id: 'jpg' as const,
      label: 'JPG',
      description: 'Smaller file size, white background',
      icon: FileImage,
    },
    {
      id: 'pdf' as const,
      label: 'PDF',
      description: '300 DPI for professional printing',
      icon: FileText,
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Preview */}
      <Card className="lg:col-span-2 shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-violet-600" />
            Final Preview
          </CardTitle>
          <CardDescription>Review your label before downloading</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center bg-slate-100 rounded-lg p-8 min-h-[400px]">
            <div className="shadow-2xl">
              <LabelCanvas
                ref={canvasRef}
                width={canvasWidth}
                height={canvasHeight}
                labelConfig={labelConfig}
                productData={productData}
                initialData={canvasData}
                onSelectionChange={() => {}}
                onCanvasChange={() => {}}
              />
            </div>
          </div>
          <div className="flex justify-center mt-4">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{labelConfig.width} × {labelConfig.height} mm</span>
              <span>•</span>
              <span>{labelConfig.orientation}</span>
              <span>•</span>
              <span>{Math.round(canvasWidth * 3)} × {Math.round(canvasHeight * 3)} px (export)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-violet-600" />
            Export Options
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Format Selection */}
          <div className="space-y-2">
            {formatOptions.map((format) => (
              <div
                key={format.id}
                onClick={() => setSelectedFormat(format.id)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedFormat === format.id
                    ? 'border-violet-500 bg-violet-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    selectedFormat === format.id
                      ? 'bg-violet-500 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    <format.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{format.label}</p>
                    <p className="text-xs text-muted-foreground">{format.description}</p>
                  </div>
                  {selectedFormat === format.id && (
                    <Check className="h-5 w-5 text-violet-600" />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-4">
            <Button
              onClick={handleExport}
              disabled={isExporting}
              className="w-full gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
              size="lg"
            >
              <Download className="h-4 w-4" />
              {isExporting ? 'Exporting...' : `Download ${selectedFormat.toUpperCase()}`}
            </Button>

            <Button
              variant="outline"
              onClick={() => setShowSaveDialog(true)}
              className="w-full gap-2"
            >
              <Save className="h-4 w-4" />
              Save as Template
            </Button>

            <Button
              variant="ghost"
              onClick={onBack}
              className="w-full gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Designer
            </Button>
          </div>

          {/* Label Info */}
          <div className="pt-4 border-t space-y-2">
            <h4 className="text-sm font-medium">Label Details</h4>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Product</span>
                <span className="font-medium truncate max-w-[150px]">{productData.productName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Size</span>
                <span>{productData.size}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Color</span>
                <span>{productData.color}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Barcode</span>
                <span className="font-mono text-xs">{productData.barcodeValue}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Template Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save as Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Template Name</label>
              <Input
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Enter template name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTemplate} disabled={createTemplate.isPending}>
              {createTemplate.isPending ? 'Saving...' : 'Save Template'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
