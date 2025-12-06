import { useEffect, useRef, forwardRef, useImperativeHandle, useState } from 'react';
import { Canvas, Rect, Line, IText, FabricImage, FabricObject, Group } from 'fabric';

interface InvoiceElement {
  id: string;
  type: 'text' | 'image' | 'line' | 'rect' | 'table';
  content: string;
  x: number;
  y: number;
  fontSize?: number;
  fontWeight?: string;
  fontStyle?: string;
  align?: string;
  width?: number;
  height?: number;
  page: number;
}

interface InvoiceEditorCanvasProps {
  width: number;
  height: number;
  elements: InvoiceElement[];
  currentPage: number;
  totalPages: number;
  onElementSelect: (element: FabricObject | null) => void;
  onElementsChange: (elements: InvoiceElement[]) => void;
  onPageChange: (page: number) => void;
}

export const InvoiceEditorCanvas = forwardRef<any, InvoiceEditorCanvasProps>(({
  width,
  height,
  elements,
  currentPage,
  totalPages,
  onElementSelect,
  onElementsChange,
  onPageChange,
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<Canvas | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current || fabricRef.current) return;

    const canvas = new Canvas(canvasRef.current, {
      width,
      height,
      backgroundColor: '#ffffff',
      selection: true,
    });

    fabricRef.current = canvas;

    // Add page border
    const pageBorder = new Rect({
      left: 0,
      top: 0,
      width: width - 1,
      height: height - 1,
      fill: 'transparent',
      stroke: '#e2e8f0',
      strokeWidth: 1,
      selectable: false,
      evented: false,
    });
    (pageBorder as any).set('name', 'pageBorder');
    canvas.add(pageBorder);
    canvas.sendObjectToBack(pageBorder);

    // Add margin guides
    const margin = 40; // ~14mm margin in pixels at 72dpi
    const marginGuides = new Rect({
      left: margin,
      top: margin,
      width: width - margin * 2,
      height: height - margin * 2,
      fill: 'transparent',
      stroke: '#f1f5f9',
      strokeWidth: 1,
      strokeDashArray: [4, 4],
      selectable: false,
      evented: false,
    });
    (marginGuides as any).set('name', 'marginGuides');
    canvas.add(marginGuides);
    canvas.sendObjectToBack(marginGuides);

    // Event listeners
    canvas.on('selection:created', (e) => {
      const selected = e.selected?.[0];
      if (selected && (selected as any).get('name') !== 'pageBorder' && (selected as any).get('name') !== 'marginGuides') {
        onElementSelect(selected);
      }
    });

    canvas.on('selection:updated', (e) => {
      const selected = e.selected?.[0];
      if (selected && (selected as any).get('name') !== 'pageBorder' && (selected as any).get('name') !== 'marginGuides') {
        onElementSelect(selected);
      }
    });

    canvas.on('selection:cleared', () => {
      onElementSelect(null);
    });

    canvas.on('object:modified', () => {
      syncElementsFromCanvas();
    });

    canvas.on('text:changed', () => {
      syncElementsFromCanvas();
    });

    setIsInitialized(true);

    return () => {
      canvas.dispose();
      fabricRef.current = null;
    };
  }, []);

  // Sync elements from canvas to state
  const syncElementsFromCanvas = () => {
    if (!fabricRef.current) return;
    
    const canvas = fabricRef.current;
    const canvasObjects = canvas.getObjects();
    const updatedElements: InvoiceElement[] = [];

    canvasObjects.forEach((obj) => {
      const name = (obj as any).get('name');
      if (name === 'pageBorder' || name === 'marginGuides') return;

      const elementId = (obj as any).get('elementId') || name;
      if (!elementId) return;

      const element: InvoiceElement = {
        id: elementId,
        type: obj.type === 'i-text' ? 'text' : (obj.type as any),
        content: obj.type === 'i-text' ? (obj as IText).text || '' : '',
        x: obj.left || 0,
        y: obj.top || 0,
        fontSize: obj.type === 'i-text' ? (obj as IText).fontSize : undefined,
        fontWeight: obj.type === 'i-text' ? (obj as IText).fontWeight as string : undefined,
        fontStyle: obj.type === 'i-text' ? (obj as IText).fontStyle : undefined,
        align: obj.type === 'i-text' ? (obj as IText).textAlign : undefined,
        width: obj.width ? obj.width * (obj.scaleX || 1) : undefined,
        height: obj.height ? obj.height * (obj.scaleY || 1) : undefined,
        page: currentPage,
      };

      updatedElements.push(element);
    });

    onElementsChange(updatedElements);
  };

  // Load elements onto canvas for current page
  const loadElementsToCanvas = (elementsToLoad: InvoiceElement[]) => {
    if (!fabricRef.current) return;

    const canvas = fabricRef.current;
    
    // Remove all objects except guides
    const objectsToRemove = canvas.getObjects().filter((obj) => {
      const name = (obj as any).get('name');
      return name !== 'pageBorder' && name !== 'marginGuides';
    });
    objectsToRemove.forEach((obj) => canvas.remove(obj));

    // Add elements for current page
    const pageElements = elementsToLoad.filter((el) => el.page === currentPage);
    
    pageElements.forEach((el) => {
      let fabricObject: FabricObject | null = null;

      if (el.type === 'text') {
        fabricObject = new IText(el.content, {
          left: el.x,
          top: el.y,
          fontSize: el.fontSize || 12,
          fontWeight: el.fontWeight === 'bold' ? 'bold' : 'normal',
          fontStyle: el.fontStyle === 'italic' ? 'italic' : 'normal',
          fontFamily: 'Helvetica',
          fill: '#1a1a1a',
          textAlign: el.align as any || 'left',
        });
      } else if (el.type === 'line') {
        fabricObject = new Line([0, 0, el.width || 100, 0], {
          left: el.x,
          top: el.y,
          stroke: '#cccccc',
          strokeWidth: 1,
        });
      } else if (el.type === 'rect') {
        fabricObject = new Rect({
          left: el.x,
          top: el.y,
          width: el.width || 100,
          height: el.height || 50,
          fill: 'transparent',
          stroke: '#333333',
          strokeWidth: 1,
        });
      }

      if (fabricObject) {
        (fabricObject as any).set('elementId', el.id);
        (fabricObject as any).set('name', el.id);
        canvas.add(fabricObject);
      }
    });

    canvas.renderAll();
  };

  // Add new text element
  const addText = (text: string, options?: Partial<InvoiceElement>) => {
    if (!fabricRef.current) return;

    const canvas = fabricRef.current;
    const id = `text_${Date.now()}`;
    
    const textObj = new IText(text, {
      left: options?.x || 50,
      top: options?.y || 50,
      fontSize: options?.fontSize || 12,
      fontWeight: options?.fontWeight === 'bold' ? 'bold' : 'normal',
      fontStyle: options?.fontStyle === 'italic' ? 'italic' : 'normal',
      fontFamily: 'Helvetica',
      fill: '#1a1a1a',
    });

    (textObj as any).set('elementId', id);
    (textObj as any).set('name', id);
    
    canvas.add(textObj);
    canvas.setActiveObject(textObj);
    canvas.renderAll();
    
    syncElementsFromCanvas();
  };

  // Add line separator
  const addLine = () => {
    if (!fabricRef.current) return;

    const canvas = fabricRef.current;
    const id = `line_${Date.now()}`;
    
    const line = new Line([0, 0, width - 80, 0], {
      left: 40,
      top: height / 2,
      stroke: '#e2e8f0',
      strokeWidth: 1,
    });

    (line as any).set('elementId', id);
    (line as any).set('name', id);
    
    canvas.add(line);
    canvas.setActiveObject(line);
    canvas.renderAll();
    
    syncElementsFromCanvas();
  };

  // Delete selected element
  const deleteSelected = () => {
    if (!fabricRef.current) return;
    
    const activeObject = fabricRef.current.getActiveObject();
    const name = (activeObject as any)?.get('name');
    
    if (activeObject && name !== 'pageBorder' && name !== 'marginGuides') {
      fabricRef.current.remove(activeObject);
      fabricRef.current.renderAll();
      syncElementsFromCanvas();
      onElementSelect(null);
    }
  };

  // Move selected element
  const moveSelected = (direction: 'up' | 'down' | 'left' | 'right', amount: number = 1) => {
    if (!fabricRef.current) return;
    
    const activeObject = fabricRef.current.getActiveObject();
    if (!activeObject) return;

    const currentLeft = activeObject.left || 0;
    const currentTop = activeObject.top || 0;

    switch (direction) {
      case 'up':
        activeObject.set('top', currentTop - amount);
        break;
      case 'down':
        activeObject.set('top', currentTop + amount);
        break;
      case 'left':
        activeObject.set('left', currentLeft - amount);
        break;
      case 'right':
        activeObject.set('left', currentLeft + amount);
        break;
    }

    fabricRef.current.renderAll();
    syncElementsFromCanvas();
  };

  // Update selected element properties
  const updateSelectedProperty = (property: string, value: any) => {
    if (!fabricRef.current) return;
    
    const activeObject = fabricRef.current.getActiveObject();
    if (activeObject) {
      activeObject.set(property as keyof FabricObject, value);
      fabricRef.current.renderAll();
      syncElementsFromCanvas();
    }
  };

  // Bring forward / send backward
  const bringForward = () => {
    if (!fabricRef.current) return;
    const activeObject = fabricRef.current.getActiveObject();
    if (activeObject) {
      fabricRef.current.bringObjectForward(activeObject);
      fabricRef.current.renderAll();
    }
  };

  const sendBackward = () => {
    if (!fabricRef.current) return;
    const activeObject = fabricRef.current.getActiveObject();
    if (activeObject) {
      fabricRef.current.sendObjectBackwards(activeObject);
      fabricRef.current.renderAll();
    }
  };

  // Duplicate selected
  const duplicateSelected = async () => {
    if (!fabricRef.current) return;
    
    const activeObject = fabricRef.current.getActiveObject();
    if (!activeObject) return;

    const cloned = await activeObject.clone();
    cloned.set({
      left: (activeObject.left || 0) + 20,
      top: (activeObject.top || 0) + 20,
    });
    (cloned as any).set('elementId', `${(activeObject as any).get('elementId')}_copy_${Date.now()}`);
    (cloned as any).set('name', `${(activeObject as any).get('name')}_copy_${Date.now()}`);
    
    fabricRef.current.add(cloned);
    fabricRef.current.setActiveObject(cloned);
    fabricRef.current.renderAll();
    syncElementsFromCanvas();
  };

  // Export canvas to image
  const exportToImage = (format: 'png' | 'jpeg' = 'png'): string => {
    if (!fabricRef.current) return '';
    
    // Hide guides temporarily
    const canvas = fabricRef.current;
    const guides = canvas.getObjects().filter((obj) => {
      const name = (obj as any).get('name');
      return name === 'marginGuides';
    });
    guides.forEach((g) => (g.visible = false));
    canvas.renderAll();

    const dataUrl = canvas.toDataURL({
      format,
      quality: 1,
      multiplier: 2,
    });

    // Show guides again
    guides.forEach((g) => (g.visible = true));
    canvas.renderAll();

    return dataUrl;
  };

  // Get canvas JSON
  const getCanvasJSON = () => {
    if (!fabricRef.current) return null;
    return (fabricRef.current as any).toJSON(['elementId', 'name']);
  };

  // Load from JSON
  const loadFromJSON = async (json: any) => {
    if (!fabricRef.current || !json) return;
    try {
      await fabricRef.current.loadFromJSON(json);
      fabricRef.current.renderAll();
    } catch (error) {
      console.error('Error loading canvas:', error);
    }
  };

  // Expose methods
  useImperativeHandle(ref, () => ({
    addText,
    addLine,
    deleteSelected,
    moveSelected,
    updateSelectedProperty,
    bringForward,
    sendBackward,
    duplicateSelected,
    exportToImage,
    getCanvasJSON,
    loadFromJSON,
    loadElementsToCanvas,
    getCanvas: () => fabricRef.current,
  }));

  return (
    <div className="relative bg-white shadow-xl rounded-lg overflow-hidden">
      <canvas ref={canvasRef} />
      {/* Page indicator */}
      <div className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded text-xs text-muted-foreground">
        Page {currentPage} of {totalPages}
      </div>
    </div>
  );
});

InvoiceEditorCanvas.displayName = 'InvoiceEditorCanvas';
