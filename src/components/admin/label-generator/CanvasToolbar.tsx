import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { 
  AlignLeft, AlignCenter, AlignRight, 
  Bold, Italic, Trash2, 
  MoveHorizontal, MoveVertical 
} from 'lucide-react';

interface CanvasToolbarProps {
  selectedElement: any;
  canvasRef: React.RefObject<any>;
}

const fontFamilies = [
  'Arial',
  'Helvetica',
  'Times New Roman',
  'Georgia',
  'Verdana',
  'Courier New',
  'Impact',
];

const fontSizes = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48];

export const CanvasToolbar = ({ selectedElement, canvasRef }: CanvasToolbarProps) => {
  if (!selectedElement) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p className="text-sm">Select an element to edit its properties</p>
      </div>
    );
  }

  const isText = selectedElement.type === 'i-text' || selectedElement.type === 'text';
  const isShape = selectedElement.type === 'rect' || selectedElement.type === 'circle' || selectedElement.type === 'line';

  const handleUpdate = (property: string, value: any) => {
    if (canvasRef.current?.updateElement) {
      canvasRef.current.updateElement(property, value);
    }
  };

  const handleDelete = () => {
    if (canvasRef.current?.deleteSelected) {
      canvasRef.current.deleteSelected();
    }
  };

  return (
    <div className="space-y-4">
      {/* Element Type Badge */}
      <div className="flex items-center justify-between">
        <span className="text-xs px-2 py-1 bg-violet-100 text-violet-700 rounded-full font-medium">
          {selectedElement.name || selectedElement.type}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={handleDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <Separator />

      {/* Position */}
      <div className="space-y-3">
        <Label className="text-xs font-medium text-muted-foreground">POSITION</Label>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs flex items-center gap-1">
              <MoveHorizontal className="h-3 w-3" /> X
            </Label>
            <Input
              type="number"
              value={Math.round(selectedElement.left || 0)}
              onChange={(e) => handleUpdate('left', parseInt(e.target.value))}
              className="h-8"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs flex items-center gap-1">
              <MoveVertical className="h-3 w-3" /> Y
            </Label>
            <Input
              type="number"
              value={Math.round(selectedElement.top || 0)}
              onChange={(e) => handleUpdate('top', parseInt(e.target.value))}
              className="h-8"
            />
          </div>
        </div>
      </div>

      {/* Text Properties */}
      {isText && (
        <>
          <Separator />
          <div className="space-y-3">
            <Label className="text-xs font-medium text-muted-foreground">TYPOGRAPHY</Label>
            
            {/* Font Family */}
            <div className="space-y-1">
              <Label className="text-xs">Font Family</Label>
              <Select
                value={selectedElement.fontFamily || 'Arial'}
                onValueChange={(value) => handleUpdate('fontFamily', value)}
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fontFamilies.map((font) => (
                    <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                      {font}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Font Size */}
            <div className="space-y-1">
              <Label className="text-xs">Font Size</Label>
              <Select
                value={String(selectedElement.fontSize || 12)}
                onValueChange={(value) => handleUpdate('fontSize', parseInt(value))}
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fontSizes.map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size}px
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Font Style */}
            <div className="flex gap-1">
              <Button
                variant={selectedElement.fontWeight === 'bold' ? 'default' : 'outline'}
                size="icon"
                className="h-8 w-8"
                onClick={() => handleUpdate('fontWeight', selectedElement.fontWeight === 'bold' ? 'normal' : 'bold')}
              >
                <Bold className="h-3 w-3" />
              </Button>
              <Button
                variant={selectedElement.fontStyle === 'italic' ? 'default' : 'outline'}
                size="icon"
                className="h-8 w-8"
                onClick={() => handleUpdate('fontStyle', selectedElement.fontStyle === 'italic' ? 'normal' : 'italic')}
              >
                <Italic className="h-3 w-3" />
              </Button>
              <div className="w-px bg-border mx-1" />
              <Button
                variant={selectedElement.textAlign === 'left' ? 'default' : 'outline'}
                size="icon"
                className="h-8 w-8"
                onClick={() => handleUpdate('textAlign', 'left')}
              >
                <AlignLeft className="h-3 w-3" />
              </Button>
              <Button
                variant={selectedElement.textAlign === 'center' ? 'default' : 'outline'}
                size="icon"
                className="h-8 w-8"
                onClick={() => handleUpdate('textAlign', 'center')}
              >
                <AlignCenter className="h-3 w-3" />
              </Button>
              <Button
                variant={selectedElement.textAlign === 'right' ? 'default' : 'outline'}
                size="icon"
                className="h-8 w-8"
                onClick={() => handleUpdate('textAlign', 'right')}
              >
                <AlignRight className="h-3 w-3" />
              </Button>
            </div>

            {/* Text Color */}
            <div className="space-y-1">
              <Label className="text-xs">Text Color</Label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={selectedElement.fill || '#000000'}
                  onChange={(e) => handleUpdate('fill', e.target.value)}
                  className="h-8 w-12 rounded border cursor-pointer"
                />
                <Input
                  value={selectedElement.fill || '#000000'}
                  onChange={(e) => handleUpdate('fill', e.target.value)}
                  className="h-8 flex-1"
                />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Shape Properties */}
      {isShape && (
        <>
          <Separator />
          <div className="space-y-3">
            <Label className="text-xs font-medium text-muted-foreground">SHAPE STYLE</Label>
            
            {/* Fill Color */}
            <div className="space-y-1">
              <Label className="text-xs">Fill Color</Label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={selectedElement.fill === 'transparent' ? '#ffffff' : (selectedElement.fill || '#ffffff')}
                  onChange={(e) => handleUpdate('fill', e.target.value)}
                  className="h-8 w-12 rounded border cursor-pointer"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={() => handleUpdate('fill', 'transparent')}
                >
                  None
                </Button>
              </div>
            </div>

            {/* Stroke Color */}
            <div className="space-y-1">
              <Label className="text-xs">Stroke Color</Label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={selectedElement.stroke || '#000000'}
                  onChange={(e) => handleUpdate('stroke', e.target.value)}
                  className="h-8 w-12 rounded border cursor-pointer"
                />
                <Input
                  value={selectedElement.stroke || '#000000'}
                  onChange={(e) => handleUpdate('stroke', e.target.value)}
                  className="h-8 flex-1"
                />
              </div>
            </div>

            {/* Stroke Width */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-xs">Stroke Width</Label>
                <span className="text-xs text-muted-foreground">{selectedElement.strokeWidth || 1}px</span>
              </div>
              <Slider
                value={[selectedElement.strokeWidth || 1]}
                min={0}
                max={10}
                step={1}
                onValueChange={([value]) => handleUpdate('strokeWidth', value)}
              />
            </div>
          </div>
        </>
      )}

      {/* Opacity */}
      <Separator />
      <div className="space-y-2">
        <div className="flex justify-between">
          <Label className="text-xs">Opacity</Label>
          <span className="text-xs text-muted-foreground">{Math.round((selectedElement.opacity || 1) * 100)}%</span>
        </div>
        <Slider
          value={[(selectedElement.opacity || 1) * 100]}
          min={0}
          max={100}
          step={5}
          onValueChange={([value]) => handleUpdate('opacity', value / 100)}
        />
      </div>
    </div>
  );
};
