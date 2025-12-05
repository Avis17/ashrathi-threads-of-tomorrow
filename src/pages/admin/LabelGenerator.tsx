import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Check, FileText, Layout, Download, Ruler, Database, BookTemplate } from 'lucide-react';
import { LabelSizeStep } from '@/components/admin/label-generator/LabelSizeStep';
import { ProductDataStep } from '@/components/admin/label-generator/ProductDataStep';
import { LayoutDesignerStep } from '@/components/admin/label-generator/LayoutDesignerStep';
import { DownloadStep } from '@/components/admin/label-generator/DownloadStep';
import { SavedTemplatesDialog } from '@/components/admin/label-generator/SavedTemplatesDialog';

export interface LabelConfig {
  width: number;
  height: number;
  orientation: 'portrait' | 'landscape';
  includeLogo: boolean;
  logoUrl: string | null;
}

export interface ProductData {
  productName: string;
  size: string;
  color: string;
  material: string;
  mrp: string;
  barcodeValue: string;
}

const steps = [
  { id: 1, name: 'Label Size', icon: Ruler },
  { id: 2, name: 'Product Data', icon: Database },
  { id: 3, name: 'Layout Designer', icon: Layout },
  { id: 4, name: 'Download', icon: Download },
];

const LabelGenerator = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [labelConfig, setLabelConfig] = useState<LabelConfig>({
    width: 50,
    height: 75,
    orientation: 'portrait',
    includeLogo: false,
    logoUrl: null,
  });
  const [productData, setProductData] = useState<ProductData>({
    productName: '',
    size: '',
    color: '',
    material: '',
    mrp: '',
    barcodeValue: '',
  });
  const [canvasData, setCanvasData] = useState<any>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [currentTemplateId, setCurrentTemplateId] = useState<string | null>(null);
  const [availableSizes, setAvailableSizes] = useState<string[]>([]);
  const [availableColors, setAvailableColors] = useState<string[]>([]);

  // Autosave every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (canvasData) {
        localStorage.setItem('label_autosave', JSON.stringify({
          labelConfig,
          productData,
          canvasData,
          timestamp: new Date().toISOString()
        }));
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [labelConfig, productData, canvasData]);

  const handleLoadTemplate = (template: any) => {
    setLabelConfig({
      width: template.label_width,
      height: template.label_height,
      orientation: template.orientation,
      includeLogo: template.include_logo,
      logoUrl: template.logo_url,
    });
    setCanvasData(template.canvas_data);
    setCurrentTemplateId(template.id);
    setShowTemplates(false);
    setCurrentStep(3);
  };

  const handleProductDataChange = (data: ProductData, sizes?: string[], colors?: string[]) => {
    setProductData(data);
    if (sizes) setAvailableSizes(sizes);
    if (colors) setAvailableColors(colors);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
            Label Generator
          </h1>
          <p className="text-muted-foreground mt-1">Create professional product labels with GS1 barcodes</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setShowTemplates(true)}
            className="gap-2"
          >
            <BookTemplate className="h-4 w-4" />
            Saved Templates
          </Button>
          <Button
            onClick={() => {
              setCurrentStep(1);
              setLabelConfig({
                width: 50,
                height: 75,
                orientation: 'portrait',
                includeLogo: false,
                logoUrl: null,
              });
              setProductData({
                productName: '',
                size: '',
                color: '',
                material: '',
                mrp: '',
                barcodeValue: '',
              });
              setCanvasData(null);
              setCurrentTemplateId(null);
              setAvailableSizes([]);
              setAvailableColors([]);
            }}
            className="gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
          >
            <FileText className="h-4 w-4" />
            Generate New Label
          </Button>
        </div>
      </div>

      {/* Progress Steps */}
      <Card className="mb-8 shadow-lg border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                      currentStep > step.id
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30'
                        : currentStep === step.id
                        ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/30'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {currentStep > step.id ? (
                      <Check className="h-6 w-6" />
                    ) : (
                      <step.icon className="h-5 w-5" />
                    )}
                  </div>
                  <span
                    className={`mt-2 text-sm font-medium ${
                      currentStep >= step.id ? 'text-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    {step.name}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-4 rounded-full transition-all duration-500 ${
                      currentStep > step.id
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                        : 'bg-slate-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <div className="transition-all duration-300">
        {currentStep === 1 && (
          <LabelSizeStep
            config={labelConfig}
            onConfigChange={setLabelConfig}
            onNext={() => setCurrentStep(2)}
          />
        )}
        {currentStep === 2 && (
          <ProductDataStep
            data={productData}
            onDataChange={handleProductDataChange}
            onNext={() => setCurrentStep(3)}
            onBack={() => setCurrentStep(1)}
          />
        )}
        {currentStep === 3 && (
          <LayoutDesignerStep
            labelConfig={labelConfig}
            productData={productData}
            canvasData={canvasData}
            onCanvasChange={setCanvasData}
            onNext={() => setCurrentStep(4)}
            onBack={() => setCurrentStep(2)}
            currentTemplateId={currentTemplateId}
            onTemplateSaved={setCurrentTemplateId}
          />
        )}
        {currentStep === 4 && (
          <DownloadStep
            labelConfig={labelConfig}
            productData={productData}
            canvasData={canvasData}
            onBack={() => setCurrentStep(3)}
            currentTemplateId={currentTemplateId}
            onTemplateSaved={setCurrentTemplateId}
            availableSizes={availableSizes.length > 0 ? availableSizes : undefined}
            availableColors={availableColors.length > 0 ? availableColors : undefined}
          />
        )}
      </div>

      <SavedTemplatesDialog
        open={showTemplates}
        onOpenChange={setShowTemplates}
        onLoadTemplate={handleLoadTemplate}
      />
    </div>
  );
};

export default LabelGenerator;
