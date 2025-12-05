import { useEffect, useRef, forwardRef, useImperativeHandle, useState } from 'react';
import { Canvas, Rect, Circle, Line, IText, FabricImage, FabricObject } from 'fabric';
import JsBarcode from 'jsbarcode';
import { LabelConfig, ProductData } from '@/pages/admin/LabelGenerator';

interface LabelCanvasProps {
  width: number;
  height: number;
  labelConfig: LabelConfig;
  productData: ProductData;
  initialData?: any;
  onSelectionChange: (element: any) => void;
  onCanvasChange: (data: any) => void;
}

export const LabelCanvas = forwardRef<any, LabelCanvasProps>(({
  width,
  height,
  labelConfig,
  productData,
  initialData,
  onSelectionChange,
  onCanvasChange,
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

    // Add safe margin indicator
    const margin = 10;
    const marginRect = new Rect({
      left: margin,
      top: margin,
      width: width - margin * 2,
      height: height - margin * 2,
      fill: 'transparent',
      stroke: '#e2e8f0',
      strokeWidth: 1,
      strokeDashArray: [5, 5],
      selectable: false,
      evented: false,
    });
    marginRect.set('name', 'safeMargin');
    canvas.add(marginRect);
    canvas.sendObjectToBack(marginRect);

    // Event listeners
    canvas.on('selection:created', (e) => {
      onSelectionChange(e.selected?.[0] || null);
    });

    canvas.on('selection:updated', (e) => {
      onSelectionChange(e.selected?.[0] || null);
    });

    canvas.on('selection:cleared', () => {
      onSelectionChange(null);
    });

    canvas.on('object:modified', () => {
      saveCanvasState();
    });

    canvas.on('object:added', () => {
      if (isInitialized) {
        saveCanvasState();
      }
    });

    setIsInitialized(true);

    // Load initial data if exists
    if (initialData) {
      loadFromJSON(initialData);
    }

    return () => {
      canvas.dispose();
      fabricRef.current = null;
    };
  }, []);

  // Update canvas size when dimensions change
  useEffect(() => {
    if (fabricRef.current) {
      fabricRef.current.setDimensions({ width, height });
      fabricRef.current.renderAll();
    }
  }, [width, height]);

  const saveCanvasState = () => {
    if (fabricRef.current) {
      // Include 'name' property in JSON serialization
      // Use type assertion for Fabric.js custom properties
      const json = (fabricRef.current as any).toJSON(['name']);
      onCanvasChange(json);
    }
  };

  const loadFromJSON = async (json: any) => {
    if (fabricRef.current && json) {
      try {
        await fabricRef.current.loadFromJSON(json);
        fabricRef.current.renderAll();
      } catch (error) {
        console.error('Error loading canvas:', error);
      }
    }
  };

  const generateBarcodeImage = (value: string): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      try {
        JsBarcode(canvas, value, {
          format: 'EAN13',
          width: 2,
          height: 50,
          displayValue: true,
          fontSize: 12,
          margin: 5,
        });
        resolve(canvas.toDataURL());
      } catch (error) {
        console.error('Barcode generation error:', error);
        resolve('');
      }
    });
  };

  const addElement = async (type: string, data: ProductData, config: LabelConfig) => {
    if (!fabricRef.current) return;

    const canvas = fabricRef.current;
    const centerX = width / 2;
    const centerY = height / 2;

    let element: FabricObject | null = null;

    switch (type) {
      case 'logo':
        if (config.logoUrl) {
          try {
            const img = await FabricImage.fromURL(config.logoUrl);
            img.scaleToWidth(80);
            img.set({
              left: centerX - 40,
              top: 20,
              name: 'logo',
            });
            element = img;
          } catch (error) {
            console.error('Error loading logo:', error);
          }
        }
        break;

      case 'productName':
        element = new IText(data.productName || 'Product Name', {
          left: centerX,
          top: 30,
          fontSize: 14,
          fontWeight: 'bold',
          fontFamily: 'Arial',
          fill: '#1a1a1a',
          originX: 'center',
          name: 'productName',
        });
        break;

      case 'size':
        element = new IText(`Size: ${data.size || 'M'}`, {
          left: centerX,
          top: 60,
          fontSize: 12,
          fontFamily: 'Arial',
          fill: '#333333',
          originX: 'center',
          name: 'size',
        });
        break;

      case 'color':
        element = new IText(`Color: ${data.color || 'Black'}`, {
          left: centerX,
          top: 80,
          fontSize: 12,
          fontFamily: 'Arial',
          fill: '#333333',
          originX: 'center',
          name: 'color',
        });
        break;

      case 'material':
        element = new IText(data.material || '100% Cotton', {
          left: centerX,
          top: 100,
          fontSize: 10,
          fontFamily: 'Arial',
          fill: '#666666',
          originX: 'center',
          name: 'material',
        });
        break;

      case 'mrp':
        element = new IText(`MRP: ₹${data.mrp || '599'}`, {
          left: centerX,
          top: 120,
          fontSize: 14,
          fontWeight: 'bold',
          fontFamily: 'Arial',
          fill: '#1a1a1a',
          originX: 'center',
          name: 'mrp',
        });
        break;

      case 'barcode':
        if (data.barcodeValue) {
          const barcodeUrl = await generateBarcodeImage(data.barcodeValue);
          if (barcodeUrl) {
            try {
              const imgEl = new window.Image();
              imgEl.src = barcodeUrl;
              await new Promise(resolve => imgEl.onload = resolve);
              const img = new FabricImage(imgEl);
              img.scaleToWidth(120);
              img.set({
                left: centerX - 60,
                top: height - 80,
                name: 'barcode',
              });
              element = img;
            } catch (error) {
              console.error('Error adding barcode:', error);
            }
          }
        }
        break;

      case 'text':
        element = new IText('Custom Text', {
          left: centerX,
          top: centerY,
          fontSize: 12,
          fontFamily: 'Arial',
          fill: '#333333',
          originX: 'center',
          name: 'customText',
        });
        break;

      case 'line':
        element = new Line([20, 0, width - 20, 0], {
          left: 20,
          top: centerY,
          stroke: '#cccccc',
          strokeWidth: 1,
          name: 'line',
        });
        break;

      case 'rect':
        element = new Rect({
          left: centerX - 30,
          top: centerY - 20,
          width: 60,
          height: 40,
          fill: 'transparent',
          stroke: '#333333',
          strokeWidth: 1,
          name: 'rect',
        });
        break;

      case 'circle':
        element = new Circle({
          left: centerX - 20,
          top: centerY - 20,
          radius: 20,
          fill: 'transparent',
          stroke: '#333333',
          strokeWidth: 1,
          name: 'circle',
        });
        break;
    }

    if (element) {
      canvas.add(element);
      canvas.setActiveObject(element);
      canvas.renderAll();
      saveCanvasState();
    }
  };

  const updateElement = (property: string, value: any) => {
    if (!fabricRef.current) return;
    
    const activeObject = fabricRef.current.getActiveObject();
    if (activeObject) {
      activeObject.set(property as keyof FabricObject, value);
      fabricRef.current.renderAll();
      saveCanvasState();
    }
  };

  const deleteSelected = () => {
    if (!fabricRef.current) return;
    
    const activeObject = fabricRef.current.getActiveObject();
    if (activeObject && activeObject.get('name') !== 'safeMargin') {
      fabricRef.current.remove(activeObject);
      fabricRef.current.renderAll();
      saveCanvasState();
    }
  };

  const getCanvasData = () => {
    if (fabricRef.current) {
      return fabricRef.current.toJSON();
    }
    return null;
  };

  const exportToPNG = (): string => {
    if (fabricRef.current) {
      return fabricRef.current.toDataURL({
        format: 'png',
        quality: 1,
        multiplier: 3, // For higher resolution
      });
    }
    return '';
  };

  const exportToJPG = (): string => {
    if (fabricRef.current) {
      return fabricRef.current.toDataURL({
        format: 'jpeg',
        quality: 0.9,
        multiplier: 3,
      });
    }
    return '';
  };

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    addElement,
    updateElement,
    deleteSelected,
    loadFromJSON,
    getCanvasData,
    exportToPNG,
    exportToJPG,
    getCanvas: () => fabricRef.current,
  }));

  return (
    <div className="relative bg-white shadow-lg rounded border border-slate-200">
      <canvas ref={canvasRef} />
      {/* Ruler indicators */}
      <div className="absolute -top-5 left-0 right-0 flex justify-between text-[10px] text-muted-foreground px-1">
        <span>0</span>
        <span>{Math.round(width / 2 / 3.78)}mm</span>
        <span>{Math.round(width / 3.78)}mm</span>
      </div>
      <div className="absolute -left-6 top-0 bottom-0 flex flex-col justify-between text-[10px] text-muted-foreground py-1">
        <span>0</span>
        <span className="transform -rotate-90">{Math.round(height / 2 / 3.78)}mm</span>
        <span>{Math.round(height / 3.78)}mm</span>
      </div>
    </div>
  );
});

LabelCanvas.displayName = 'LabelCanvas';
