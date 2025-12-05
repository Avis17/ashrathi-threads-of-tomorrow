import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Upload, ArrowRight, Smartphone, Monitor, Image } from 'lucide-react';
import { LabelConfig } from '@/pages/admin/LabelGenerator';

interface LabelSizeStepProps {
  config: LabelConfig;
  onConfigChange: (config: LabelConfig) => void;
  onNext: () => void;
}

const standardSizes = [
  { label: '50 × 75 mm (Standard)', width: 50, height: 75 },
  { label: '35 × 50 mm (Small)', width: 35, height: 50 },
  { label: '60 × 80 mm (Medium)', width: 60, height: 80 },
  { label: '100 × 150 mm (Large)', width: 100, height: 150 },
  { label: 'Custom', width: 0, height: 0 },
];

export const LabelSizeStep = ({ config, onConfigChange, onNext }: LabelSizeStepProps) => {
  const [selectedSize, setSelectedSize] = useState('50 × 75 mm (Standard)');
  const [isCustom, setIsCustom] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(config.logoUrl);

  const handleSizeChange = (value: string) => {
    setSelectedSize(value);
    const size = standardSizes.find(s => s.label === value);
    if (size) {
      if (size.label === 'Custom') {
        setIsCustom(true);
      } else {
        setIsCustom(false);
        onConfigChange({ ...config, width: size.width, height: size.height });
      }
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setLogoPreview(result);
        onConfigChange({ ...config, logoUrl: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const getPreviewDimensions = () => {
    const maxWidth = 200;
    const maxHeight = 280;
    const { width, height, orientation } = config;
    
    const w = orientation === 'landscape' ? height : width;
    const h = orientation === 'landscape' ? width : height;
    
    const scale = Math.min(maxWidth / w, maxHeight / h);
    return {
      width: w * scale,
      height: h * scale,
    };
  };

  const previewDims = getPreviewDimensions();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Configuration */}
      <Card className="lg:col-span-2 shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 flex items-center justify-center">
              <Monitor className="h-4 w-4 text-white" />
            </div>
            Label Size & Properties
          </CardTitle>
          <CardDescription>Configure the dimensions and properties of your label</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Standard Sizes */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Standard Sizes</Label>
            <Select value={selectedSize} onValueChange={handleSizeChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a size" />
              </SelectTrigger>
              <SelectContent>
                {standardSizes.map((size) => (
                  <SelectItem key={size.label} value={size.label}>
                    {size.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Custom Dimensions */}
          {isCustom && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
              <div className="space-y-2">
                <Label className="text-sm">Width (mm)</Label>
                <Input
                  type="number"
                  value={config.width}
                  onChange={(e) => onConfigChange({ ...config, width: Number(e.target.value) })}
                  min={20}
                  max={300}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Height (mm)</Label>
                <Input
                  type="number"
                  value={config.height}
                  onChange={(e) => onConfigChange({ ...config, height: Number(e.target.value) })}
                  min={20}
                  max={300}
                />
              </div>
            </div>
          )}

          {/* Orientation */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Orientation</Label>
            <RadioGroup
              value={config.orientation}
              onValueChange={(value: 'portrait' | 'landscape') => 
                onConfigChange({ ...config, orientation: value })
              }
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="portrait" id="portrait" />
                <Label htmlFor="portrait" className="flex items-center gap-2 cursor-pointer">
                  <Smartphone className="h-4 w-4" />
                  Portrait
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="landscape" id="landscape" />
                <Label htmlFor="landscape" className="flex items-center gap-2 cursor-pointer">
                  <Smartphone className="h-4 w-4 rotate-90" />
                  Landscape
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Logo Toggle */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Image className="h-5 w-5 text-violet-600" />
                <div>
                  <Label className="text-sm font-medium">Include Logo</Label>
                  <p className="text-xs text-muted-foreground">Add your brand logo to the label</p>
                </div>
              </div>
              <Switch
                checked={config.includeLogo}
                onCheckedChange={(checked) => onConfigChange({ ...config, includeLogo: checked })}
              />
            </div>

            {config.includeLogo && (
              <div className="p-4 border-2 border-dashed border-slate-200 rounded-lg hover:border-violet-400 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  id="logo-upload"
                />
                <label
                  htmlFor="logo-upload"
                  className="flex flex-col items-center justify-center cursor-pointer py-6"
                >
                  {logoPreview ? (
                    <div className="space-y-3 text-center">
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="h-20 w-auto mx-auto object-contain"
                      />
                      <p className="text-sm text-muted-foreground">Click to change logo</p>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-10 w-10 text-slate-400 mb-3" />
                      <p className="text-sm font-medium">Upload Logo</p>
                      <p className="text-xs text-muted-foreground">PNG, JPG up to 2MB</p>
                    </>
                  )}
                </label>
              </div>
            )}
          </div>

          <Button
            onClick={onNext}
            className="w-full gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
            size="lg"
          >
            Continue to Product Data
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      {/* Preview Card */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="text-lg">Live Preview</CardTitle>
          <CardDescription>
            {config.width} × {config.height} mm • {config.orientation}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <div
            className="bg-white border-2 border-slate-200 rounded-lg shadow-inner flex items-center justify-center relative"
            style={{
              width: previewDims.width,
              height: previewDims.height,
            }}
          >
            {/* Safe margin indicator */}
            <div
              className="absolute border border-dashed border-slate-300 rounded"
              style={{
                inset: '8px',
              }}
            />
            <span className="text-xs text-slate-400">Label Area</span>
          </div>
          <div className="mt-4 text-center">
            <p className="text-xs text-muted-foreground">
              Scale: 1mm = {(previewDims.width / config.width).toFixed(2)}px
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
