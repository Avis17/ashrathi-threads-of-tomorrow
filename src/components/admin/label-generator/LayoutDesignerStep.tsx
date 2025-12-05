import { useEffect, useRef, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, Save, Undo, Redo, Type, Image, Minus, Square, Circle, Barcode, Tag, Palette, Shirt, Ruler } from 'lucide-react';
import { LabelConfig, ProductData } from '@/pages/admin/LabelGenerator';
import { LabelCanvas } from './LabelCanvas';
import { CanvasToolbar } from './CanvasToolbar';
import { useLabelTemplates } from '@/hooks/useLabelTemplates';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface LayoutDesignerStepProps {
  labelConfig: LabelConfig;
  productData: ProductData;
  canvasData: any;
  onCanvasChange: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
  currentTemplateId?: string | null;
  onTemplateSaved?: (id: string) => void;
}

const elementTypes = [
  { id: 'logo', label: 'Brand Logo', icon: Image },
  { id: 'productName', label: 'Product Name', icon: Tag },
  { id: 'size', label: 'Size', icon: Ruler },
  { id: 'color', label: 'Color', icon: Palette },
  { id: 'material', label: 'Material', icon: Shirt },
  { id: 'mrp', label: 'MRP', icon: Tag },
  { id: 'barcode', label: 'Barcode', icon: Barcode },
  { id: 'text', label: 'Custom Text', icon: Type },
  { id: 'line', label: 'Divider Line', icon: Minus },
  { id: 'rect', label: 'Rectangle', icon: Square },
  { id: 'circle', label: 'Circle', icon: Circle },
];

export const LayoutDesignerStep = ({
  labelConfig,
  productData,
  canvasData,
  onCanvasChange,
  onNext,
  onBack,
  currentTemplateId,
  onTemplateSaved,
}: LayoutDesignerStepProps) => {
  const canvasRef = useRef<any>(null);
  const [selectedElement, setSelectedElement] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [saveAsNew, setSaveAsNew] = useState(false);
  const { createTemplate, updateTemplate } = useLabelTemplates();

  const handleAddElement = useCallback((type: string) => {
    if (canvasRef.current?.addElement) {
      canvasRef.current.addElement(type, productData, labelConfig);
    }
  }, [productData, labelConfig]);

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      if (canvasRef.current?.loadFromJSON) {
        canvasRef.current.loadFromJSON(history[historyIndex - 1]);
      }
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      if (canvasRef.current?.loadFromJSON) {
        canvasRef.current.loadFromJSON(history[historyIndex + 1]);
      }
    }
  };

  const handleSaveHistory = (data: any) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(data);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    onCanvasChange(data);
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

  // Calculate canvas dimensions (mm to px, ~3.78 px per mm at 96 DPI)
  const scale = 3.78;
  const canvasWidth = labelConfig.orientation === 'landscape' ? labelConfig.height * scale : labelConfig.width * scale;
  const canvasHeight = labelConfig.orientation === 'landscape' ? labelConfig.width * scale : labelConfig.height * scale;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Left Toolbar - Elements */}
      <Card className="shadow-lg border-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Add Elements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {elementTypes.map((element) => (
            <Button
              key={element.id}
              variant="outline"
              className="w-full justify-start gap-3 h-11"
              onClick={() => handleAddElement(element.id)}
              disabled={element.id === 'logo' && !labelConfig.includeLogo}
            >
              <element.icon className="h-4 w-4 text-violet-600" />
              {element.label}
            </Button>
          ))}

          <div className="pt-4 border-t mt-4 space-y-2">
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={handleUndo}
              disabled={historyIndex <= 0}
            >
              <Undo className="h-4 w-4" />
              Undo
            </Button>
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
            >
              <Redo className="h-4 w-4" />
              Redo
            </Button>
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={handleSaveClick}
              disabled={updateTemplate.isPending || createTemplate.isPending}
            >
              <Save className="h-4 w-4" />
              {currentTemplateId ? 'Save' : 'Save Template'}
            </Button>
            {currentTemplateId && (
              <Button
                variant="outline"
                className="w-full gap-2 text-xs"
                onClick={() => {
                  setSaveAsNew(true);
                  setShowSaveDialog(true);
                }}
              >
                Save As New
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Center - Canvas */}
      <Card className="lg:col-span-2 shadow-lg border-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Label Canvas</span>
            <span className="text-sm font-normal text-muted-foreground">
              {labelConfig.width} × {labelConfig.height} mm
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center bg-slate-100 rounded-lg p-6 min-h-[400px]">
            <LabelCanvas
              ref={canvasRef}
              width={canvasWidth}
              height={canvasHeight}
              labelConfig={labelConfig}
              productData={productData}
              initialData={canvasData}
              onSelectionChange={setSelectedElement}
              onCanvasChange={handleSaveHistory}
            />
          </div>
          <div className="flex justify-center mt-3">
            <p className="text-xs text-muted-foreground">
              Click and drag elements to position • Double-click to edit text • Use corners to resize
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Right Toolbar - Properties */}
      <Card className="shadow-lg border-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Properties</CardTitle>
        </CardHeader>
        <CardContent>
          <CanvasToolbar
            selectedElement={selectedElement}
            canvasRef={canvasRef}
          />
        </CardContent>
      </Card>

      {/* Bottom Navigation */}
      <div className="lg:col-span-4 flex gap-3">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex-1 gap-2"
          size="lg"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Product Data
        </Button>
        <Button
          onClick={onNext}
          className="flex-1 gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
          size="lg"
        >
          Continue to Download
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Save Template Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={(open) => {
        setShowSaveDialog(open);
        if (!open) setSaveAsNew(false);
      }}>
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
