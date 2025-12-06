import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Type, 
  Minus, 
  Trash2, 
  Copy, 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight,
  MoveVertical,
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Layers,
  ChevronUp,
  ChevronDown,
  ZoomIn,
  ZoomOut,
  RotateCcw
} from "lucide-react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FabricObject, IText } from "fabric";

interface InvoiceEditorToolbarProps {
  selectedElement: FabricObject | null;
  zoom: number;
  onAddText: () => void;
  onAddLine: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMove: (direction: 'up' | 'down' | 'left' | 'right', amount: number) => void;
  onBringForward: () => void;
  onSendBackward: () => void;
  onUpdateProperty: (property: string, value: any) => void;
  onZoomChange: (zoom: number) => void;
  onResetLayout: () => void;
}

export const InvoiceEditorToolbar = ({
  selectedElement,
  zoom,
  onAddText,
  onAddLine,
  onDelete,
  onDuplicate,
  onMove,
  onBringForward,
  onSendBackward,
  onUpdateProperty,
  onZoomChange,
  onResetLayout,
}: InvoiceEditorToolbarProps) => {
  const isTextSelected = selectedElement?.type === 'i-text';
  const textElement = isTextSelected ? (selectedElement as IText) : null;

  return (
    <TooltipProvider>
      <div className="bg-card border rounded-lg p-3 space-y-3">
        {/* Add Elements */}
        <div>
          <Label className="text-xs text-muted-foreground mb-2 block">Add Elements</Label>
          <div className="flex gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={onAddText}>
                  <Type className="h-4 w-4 mr-1" />
                  Text
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add text element</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={onAddLine}>
                  <Minus className="h-4 w-4 mr-1" />
                  Line
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add horizontal line</TooltipContent>
            </Tooltip>
          </div>
        </div>

        <Separator />

        {/* Selected Element Actions */}
        {selectedElement && (
          <>
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Selected Element</Label>
              <div className="flex gap-1 flex-wrap">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={onDuplicate}>
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Duplicate</TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={onBringForward}>
                      <ChevronUp className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Bring Forward</TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={onSendBackward}>
                      <ChevronDown className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Send Backward</TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="destructive" size="icon" className="h-8 w-8" onClick={onDelete}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Delete</TooltipContent>
                </Tooltip>
              </div>
            </div>

            {/* Move Controls */}
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Move (Arrow keys or buttons)</Label>
              <div className="grid grid-cols-3 gap-1 w-fit">
                <div />
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onMove('up', 5)}>
                  <ArrowUp className="h-3.5 w-3.5" />
                </Button>
                <div />
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onMove('left', 5)}>
                  <ArrowLeft className="h-3.5 w-3.5" />
                </Button>
                <div className="h-8 w-8 flex items-center justify-center">
                  <MoveVertical className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onMove('right', 5)}>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
                <div />
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onMove('down', 5)}>
                  <ArrowDown className="h-3.5 w-3.5" />
                </Button>
                <div />
              </div>
            </div>

            {/* Text Formatting */}
            {isTextSelected && textElement && (
              <>
                <Separator />
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">Text Formatting</Label>
                  <div className="flex gap-1 flex-wrap mb-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant={textElement.fontWeight === 'bold' ? 'default' : 'outline'} 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => onUpdateProperty('fontWeight', textElement.fontWeight === 'bold' ? 'normal' : 'bold')}
                        >
                          <Bold className="h-3.5 w-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Bold</TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant={textElement.fontStyle === 'italic' ? 'default' : 'outline'} 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => onUpdateProperty('fontStyle', textElement.fontStyle === 'italic' ? 'normal' : 'italic')}
                        >
                          <Italic className="h-3.5 w-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Italic</TooltipContent>
                    </Tooltip>

                    <Separator orientation="vertical" className="h-8" />
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant={textElement.textAlign === 'left' ? 'default' : 'outline'} 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => onUpdateProperty('textAlign', 'left')}
                        >
                          <AlignLeft className="h-3.5 w-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Align Left</TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant={textElement.textAlign === 'center' ? 'default' : 'outline'} 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => onUpdateProperty('textAlign', 'center')}
                        >
                          <AlignCenter className="h-3.5 w-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Align Center</TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant={textElement.textAlign === 'right' ? 'default' : 'outline'} 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => onUpdateProperty('textAlign', 'right')}
                        >
                          <AlignRight className="h-3.5 w-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Align Right</TooltipContent>
                    </Tooltip>
                  </div>

                  {/* Font Size */}
                  <div className="flex items-center gap-2">
                    <Label className="text-xs w-16">Font Size</Label>
                    <Input
                      type="number"
                      className="h-8 w-16"
                      value={textElement.fontSize || 12}
                      onChange={(e) => onUpdateProperty('fontSize', parseInt(e.target.value) || 12)}
                      min={6}
                      max={72}
                    />
                  </div>
                </div>
              </>
            )}
          </>
        )}

        <Separator />

        {/* Zoom Controls */}
        <div>
          <Label className="text-xs text-muted-foreground mb-2 block">Zoom: {Math.round(zoom * 100)}%</Label>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => onZoomChange(Math.max(0.5, zoom - 0.1))}
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </Button>
            <Slider
              value={[zoom]}
              onValueChange={([value]) => onZoomChange(value)}
              min={0.5}
              max={2}
              step={0.1}
              className="flex-1"
            />
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => onZoomChange(Math.min(2, zoom + 0.1))}
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <Separator />

        {/* Reset */}
        <Button variant="outline" size="sm" className="w-full" onClick={onResetLayout}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset Layout
        </Button>
      </div>
    </TooltipProvider>
  );
};
