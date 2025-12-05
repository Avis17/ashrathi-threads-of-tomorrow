import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Image, FileImage, FileText, Eye, Save, Check, Printer, RefreshCw } from 'lucide-react';
import { LabelConfig, ProductData } from '@/pages/admin/LabelGenerator';
import { LabelCanvas } from './LabelCanvas';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import { toast } from 'sonner';
import { useLabelTemplates } from '@/hooks/useLabelTemplates';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface DownloadStepProps {
  labelConfig: LabelConfig;
  productData: ProductData;
  canvasData: any;
  onBack: () => void;
  currentTemplateId?: string | null;
  onTemplateSaved?: (id: string) => void;
  availableSizes?: string[];
  availableColors?: string[];
}

// Common garment sizes
const defaultSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '28', '30', '32', '34', '36', '38', '40'];
const defaultColors = ['Black', 'White', 'Navy', 'Grey', 'Red', 'Blue', 'Green', 'Maroon', 'Beige', 'Pink', 'Yellow', 'Orange', 'Purple', 'Brown', 'Teal'];

export const DownloadStep = ({ 
  labelConfig, 
  productData, 
  canvasData, 
  onBack,
  currentTemplateId,
  onTemplateSaved,
  availableSizes = defaultSizes,
  availableColors = defaultColors,
}: DownloadStepProps) => {
  const canvasRef = useRef<any>(null);
  const [selectedFormat, setSelectedFormat] = useState<'png' | 'jpg' | 'pdf' | 'zpl'>('png');
  const [isExporting, setIsExporting] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [saveAsNew, setSaveAsNew] = useState(false);
  const { createTemplate, updateTemplate } = useLabelTemplates();

  // Quick change state for size/color
  const [quickSize, setQuickSize] = useState(productData.size);
  const [quickColor, setQuickColor] = useState(productData.color);
  const [currentProductData, setCurrentProductData] = useState(productData);
  const [canvasReady, setCanvasReady] = useState(false);

  // Calculate canvas dimensions
  const scale = 3.78;
  const canvasWidth = labelConfig.orientation === 'landscape' ? labelConfig.height * scale : labelConfig.width * scale;
  const canvasHeight = labelConfig.orientation === 'landscape' ? labelConfig.width * scale : labelConfig.height * scale;

  // Wait for canvas to be ready after mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setCanvasReady(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Update canvas when size/color changes
  const updateCanvasValues = (newSize: string, newColor: string) => {
    if (!canvasRef.current?.getCanvas) {
      console.log('Canvas ref not ready');
      return false;
    }
    
    const canvas = canvasRef.current.getCanvas();
    if (!canvas) {
      console.log('Canvas not available');
      return false;
    }

    const objects = canvas.getObjects();
    let updated = false;
    
    objects.forEach((obj: any) => {
      // Check both 'name' property and custom data
      const name = obj.name || obj.get?.('name');
      
      if (name === 'size') {
        if (obj.set) {
          obj.set('text', `Size: ${newSize}`);
          updated = true;
        }
      } else if (name === 'color') {
        if (obj.set) {
          obj.set('text', `Color: ${newColor}`);
          updated = true;
        }
      }
      
      // Also check if it's an IText with the text containing "Size:" or "Color:"
      const currentText = obj.text || obj.get?.('text') || '';
      if (typeof currentText === 'string') {
        if (currentText.startsWith('Size:')) {
          obj.set('text', `Size: ${newSize}`);
          updated = true;
        } else if (currentText.startsWith('Color:')) {
          obj.set('text', `Color: ${newColor}`);
          updated = true;
        }
      }
    });
    
    if (updated) {
      canvas.renderAll();
      setCurrentProductData({ ...currentProductData, size: newSize, color: newColor });
      toast.success('Label updated!');
    } else {
      toast.info('No size/color fields found on label to update');
    }
    
    return updated;
  };

  const handleSizeChange = (newSize: string) => {
    setQuickSize(newSize);
    // Small delay to ensure state is updated
    setTimeout(() => {
      updateCanvasValues(newSize, quickColor);
    }, 100);
  };

  const handleColorChange = (newColor: string) => {
    setQuickColor(newColor);
    // Small delay to ensure state is updated
    setTimeout(() => {
      updateCanvasValues(quickSize, newColor);
    }, 100);
  };

  const handleExport = async () => {
    if (!canvasRef.current) {
      toast.error('Canvas not ready');
      return;
    }

    setIsExporting(true);

    try {
      const fileName = `label_${productData.productName.replace(/\s+/g, '_')}_${quickSize}_${quickColor}_${Date.now()}`;

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
      } else if (selectedFormat === 'zpl') {
        // Generate ZPL code for Zebra printers
        const zplCode = generateZPL();
        const blob = new Blob([zplCode], { type: 'text/plain;charset=utf-8' });
        saveAs(blob, `${fileName}.zpl`);
        toast.success('ZPL file exported for Zebra printer!');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export');
    } finally {
      setIsExporting(false);
    }
  };

  // Generate ZPL code for Zebra printers
  const generateZPL = (): string => {
    const mmWidth = labelConfig.orientation === 'landscape' ? labelConfig.height : labelConfig.width;
    const mmHeight = labelConfig.orientation === 'landscape' ? labelConfig.width : labelConfig.height;
    
    // Convert mm to dots (assuming 203 DPI - 8 dots per mm)
    const dotsPerMm = 8;
    const labelWidthDots = Math.round(mmWidth * dotsPerMm);
    const labelHeightDots = Math.round(mmHeight * dotsPerMm);
    
    let zpl = `^XA\n`; // Start format
    zpl += `^PW${labelWidthDots}\n`; // Print width
    zpl += `^LL${labelHeightDots}\n`; // Label length
    zpl += `^LH0,0\n`; // Label home position
    
    // Product Name
    if (productData.productName) {
      zpl += `^FO50,30^A0N,40,40^FD${productData.productName}^FS\n`;
    }
    
    // Size
    if (quickSize) {
      zpl += `^FO50,80^A0N,30,30^FDSize: ${quickSize}^FS\n`;
    }
    
    // Color
    if (quickColor) {
      zpl += `^FO50,120^A0N,30,30^FDColor: ${quickColor}^FS\n`;
    }
    
    // Material
    if (productData.material) {
      zpl += `^FO50,160^A0N,25,25^FD${productData.material}^FS\n`;
    }
    
    // MRP
    if (productData.mrp) {
      zpl += `^FO50,200^A0N,35,35^FDMRP: Rs.${productData.mrp}^FS\n`;
    }
    
    // Barcode (EAN-13)
    if (productData.barcodeValue && productData.barcodeValue.length === 13) {
      zpl += `^FO50,250^BY2\n`;
      zpl += `^BEN,80,Y,N^FD${productData.barcodeValue}^FS\n`;
    }
    
    zpl += `^XZ\n`; // End format
    
    return zpl;
  };

  const handlePrint = () => {
    if (!canvasRef.current) {
      toast.error('Canvas not ready');
      return;
    }

    try {
      const dataUrl = canvasRef.current.exportToPNG();
      
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        const mmWidth = labelConfig.orientation === 'landscape' ? labelConfig.height : labelConfig.width;
        const mmHeight = labelConfig.orientation === 'landscape' ? labelConfig.width : labelConfig.height;
        
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Print Label - ${productData.productName}</title>
              <style>
                @page {
                  size: ${mmWidth}mm ${mmHeight}mm;
                  margin: 0;
                }
                body {
                  margin: 0;
                  padding: 0;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                }
                img {
                  width: ${mmWidth}mm;
                  height: ${mmHeight}mm;
                  object-fit: contain;
                }
              </style>
            </head>
            <body>
              <img src="${dataUrl}" />
              <script>
                window.onload = function() {
                  window.print();
                  window.onafterprint = function() {
                    window.close();
                  };
                };
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    } catch (error) {
      console.error('Print error:', error);
      toast.error('Failed to print');
    }
  };

  const handleSaveTemplate = async () => {
    const currentCanvasData = canvasRef.current?.getCanvasData?.() || canvasData;
    
    // If we have a template ID and not saving as new, update existing
    if (currentTemplateId && !saveAsNew) {
      try {
        await updateTemplate.mutateAsync({
          id: currentTemplateId,
          canvas_data: currentCanvasData,
        });
        toast.success('Template saved!');
        setShowSaveDialog(false);
      } catch (error) {
        toast.error('Failed to save template');
      }
      return;
    }

    // Otherwise, create new template
    if (!templateName.trim()) {
      toast.error('Please enter a template name');
      return;
    }

    try {
      const result = await createTemplate.mutateAsync({
        name: templateName,
        label_width: labelConfig.width,
        label_height: labelConfig.height,
        orientation: labelConfig.orientation,
        include_logo: labelConfig.includeLogo,
        logo_url: labelConfig.logoUrl,
        canvas_data: currentCanvasData,
      });
      toast.success('Template saved successfully!');
      setShowSaveDialog(false);
      setTemplateName('');
      setSaveAsNew(false);
      if (onTemplateSaved && result?.id) {
        onTemplateSaved(result.id);
      }
    } catch (error) {
      toast.error('Failed to save template');
    }
  };

  const handleSaveClick = () => {
    if (currentTemplateId) {
      // Directly save to existing template
      handleSaveTemplate();
    } else {
      // Open dialog for new template
      setShowSaveDialog(true);
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
    {
      id: 'zpl' as const,
      label: 'ZPL',
      description: 'Zebra printer format (.zpl)',
      icon: Printer,
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
          {/* Quick Size/Color Selector */}
          <div className="mb-4 p-4 bg-gradient-to-r from-violet-50 to-indigo-50 rounded-lg border border-violet-100">
            <div className="flex items-center gap-2 mb-3">
              <RefreshCw className="h-4 w-4 text-violet-600" />
              <span className="text-sm font-medium text-violet-700">Quick Update</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Size</Label>
                <Select value={quickSize} onValueChange={handleSizeChange}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSizes.map((size) => (
                      <SelectItem key={size} value={size}>{size}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Color</Label>
                <Select value={quickColor} onValueChange={handleColorChange}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select color" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableColors.map((color) => (
                      <SelectItem key={color} value={color}>{color}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex justify-center items-center bg-slate-100 rounded-lg p-8 min-h-[400px]">
            <div className="shadow-2xl">
              <LabelCanvas
                ref={canvasRef}
                width={canvasWidth}
                height={canvasHeight}
                labelConfig={labelConfig}
                productData={currentProductData}
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
              onClick={handlePrint}
              variant="outline"
              className="w-full gap-2 border-violet-200 text-violet-700 hover:bg-violet-50"
              size="lg"
            >
              <Printer className="h-4 w-4" />
              Print Directly
            </Button>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleSaveClick}
                className="flex-1 gap-2"
                disabled={updateTemplate.isPending || createTemplate.isPending}
              >
                <Save className="h-4 w-4" />
                {currentTemplateId ? 'Save' : 'Save Template'}
              </Button>
              {currentTemplateId && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSaveAsNew(true);
                    setShowSaveDialog(true);
                  }}
                  className="gap-2"
                >
                  Save As New
                </Button>
              )}
            </div>

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
                <span className="font-medium text-violet-600">{quickSize}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Color</span>
                <span className="font-medium text-violet-600">{quickColor}</span>
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
            <DialogTitle>{saveAsNew ? 'Save as New Template' : 'Save Template'}</DialogTitle>
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
            <Button variant="outline" onClick={() => {
              setShowSaveDialog(false);
              setSaveAsNew(false);
            }}>
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
