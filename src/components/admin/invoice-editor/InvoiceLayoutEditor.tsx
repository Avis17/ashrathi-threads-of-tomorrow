import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { InvoiceEditorCanvas } from './InvoiceEditorCanvas';
import { InvoiceEditorToolbar } from './InvoiceEditorToolbar';
import { 
  FileText, 
  ChevronLeft, 
  ChevronRight,
  Download,
  X
} from "lucide-react";
import { FabricObject, IText, FabricImage, Canvas } from 'fabric';
import { toast } from 'sonner';
import type jsPDF from 'jspdf';

// Dynamic import for jsPDF - reduces bundle size
const loadJsPDF = async () => {
  const { default: jsPDF } = await import('jspdf');
  return jsPDF;
};

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

interface InvoiceLayoutEditorProps {
  open: boolean;
  onClose: () => void;
  onConfirmDownload: (pdfDoc: jsPDF) => void;
  initialPdfUrl?: string;
  jobOrderId: string;
  invoiceData: {
    styleName: string;
    pieces: number;
    ratePerPiece: number;
    total: number;
    companyName: string;
    companyAddress: string;
    companyContact: string;
    companyGst?: string;
    invoiceNumber: string;
    invoiceType: 'with_gst' | 'without_gst';
    gstRate: string;
    accountType: 'company' | 'personal';
    bankDetails: {
      bankName: string;
      accountNumber: string;
      ifscCode: string;
      branch: string;
    };
    personalDetails: {
      phoneNumber: string;
      upiId: string;
    };
    accessoriesCost: number;
    deliveryCharge: number;
  };
}

// A4 dimensions at 72 DPI
const A4_WIDTH = 595;
const A4_HEIGHT = 842;

export const InvoiceLayoutEditor = ({
  open,
  onClose,
  onConfirmDownload,
  jobOrderId,
  invoiceData,
}: InvoiceLayoutEditorProps) => {
  const canvasRef = useRef<any>(null);
  const [selectedElement, setSelectedElement] = useState<FabricObject | null>(null);
  const [elements, setElements] = useState<InvoiceElement[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [zoom, setZoom] = useState(0.85);
  const [pageCanvasData, setPageCanvasData] = useState<Record<number, any>>({});
  const [isInitialized, setIsInitialized] = useState(false);

  // Generate initial invoice layout
  const generateInitialLayout = useCallback(() => {
    const initialElements: InvoiceElement[] = [];
    let y = 15;
    const leftMargin = 14;
    const rightAlign = A4_WIDTH - 14;
    const centerX = A4_WIDTH / 2;

    // Company Header - Left
    initialElements.push({ id: 'company_name', type: 'text', content: 'Feather Fashions', x: leftMargin, y, fontSize: 16, fontWeight: 'bold', page: 1 });
    y += 6;
    initialElements.push({ id: 'company_addr1', type: 'text', content: 'Vadivel Nagar, 251/1, Thottipalayam', x: leftMargin, y, fontSize: 9, page: 1 });
    y += 4;
    initialElements.push({ id: 'company_addr2', type: 'text', content: 'Pooluvapatti, Tiruppur, TN - 641602', x: leftMargin, y, fontSize: 9, page: 1 });
    y += 4;
    initialElements.push({ id: 'company_gst', type: 'text', content: 'GST: 33FWTPS1281P1ZJ', x: leftMargin, y, fontSize: 9, page: 1 });
    y += 4;
    initialElements.push({ id: 'company_phone', type: 'text', content: 'Ph: +91 9988322555', x: leftMargin, y, fontSize: 9, page: 1 });

    // Invoice Title
    y = 45;
    const invoiceTitle = invoiceData.invoiceType === 'with_gst' ? 'TAX INVOICE' : 'INVOICE';
    initialElements.push({ id: 'invoice_title', type: 'text', content: invoiceTitle, x: centerX, y, fontSize: 18, fontWeight: 'bold', align: 'center', page: 1 });

    // Invoice Number and Date
    y = 55;
    initialElements.push({ id: 'invoice_no', type: 'text', content: `Invoice No: ${invoiceData.invoiceNumber}`, x: leftMargin, y, fontSize: 10, page: 1 });
    initialElements.push({ id: 'invoice_date', type: 'text', content: `Date: ${new Date().toLocaleDateString('en-GB')}`, x: rightAlign - 50, y, fontSize: 10, page: 1 });

    // Bill To
    y = 70;
    initialElements.push({ id: 'bill_to_label', type: 'text', content: 'Bill To:', x: leftMargin, y, fontSize: 10, fontWeight: 'bold', page: 1 });
    y += 5;
    initialElements.push({ id: 'bill_to_name', type: 'text', content: invoiceData.companyName, x: leftMargin, y, fontSize: 10, page: 1 });
    y += 5;
    initialElements.push({ id: 'bill_to_address', type: 'text', content: invoiceData.companyAddress, x: leftMargin, y, fontSize: 10, page: 1 });
    y += 5;
    initialElements.push({ id: 'bill_to_contact', type: 'text', content: `Contact: ${invoiceData.companyContact}`, x: leftMargin, y, fontSize: 10, page: 1 });
    if (invoiceData.companyGst) {
      y += 5;
      initialElements.push({ id: 'bill_to_gst', type: 'text', content: `GST: ${invoiceData.companyGst}`, x: leftMargin, y, fontSize: 10, page: 1 });
    }

    // Table header line
    y = 110;
    initialElements.push({ id: 'table_line_top', type: 'line', content: '', x: leftMargin, y, width: A4_WIDTH - 28, page: 1 });

    // Table Header
    y += 5;
    initialElements.push({ id: 'th_sno', type: 'text', content: 'S.No', x: leftMargin + 5, y, fontSize: 10, fontWeight: 'bold', page: 1 });
    initialElements.push({ id: 'th_desc', type: 'text', content: 'Description', x: leftMargin + 40, y, fontSize: 10, fontWeight: 'bold', page: 1 });
    initialElements.push({ id: 'th_qty', type: 'text', content: 'Qty', x: leftMargin + 140, y, fontSize: 10, fontWeight: 'bold', page: 1 });
    initialElements.push({ id: 'th_rate', type: 'text', content: 'Rate/Pc', x: leftMargin + 180, y, fontSize: 10, fontWeight: 'bold', page: 1 });
    initialElements.push({ id: 'th_amount', type: 'text', content: 'Amount', x: rightAlign - 30, y, fontSize: 10, fontWeight: 'bold', page: 1 });

    // Table header bottom line
    y += 6;
    initialElements.push({ id: 'table_line_header', type: 'line', content: '', x: leftMargin, y, width: A4_WIDTH - 28, page: 1 });

    // Table Row
    y += 8;
    const subtotal = invoiceData.ratePerPiece * invoiceData.pieces;
    initialElements.push({ id: 'td_sno', type: 'text', content: '1', x: leftMargin + 8, y, fontSize: 10, page: 1 });
    initialElements.push({ id: 'td_desc', type: 'text', content: invoiceData.styleName, x: leftMargin + 40, y, fontSize: 10, page: 1 });
    initialElements.push({ id: 'td_qty', type: 'text', content: invoiceData.pieces.toString(), x: leftMargin + 145, y, fontSize: 10, page: 1 });
    initialElements.push({ id: 'td_rate', type: 'text', content: `Rs.${invoiceData.ratePerPiece.toFixed(2)}`, x: leftMargin + 175, y, fontSize: 10, page: 1 });
    initialElements.push({ id: 'td_amount', type: 'text', content: `Rs.${subtotal.toFixed(2)}`, x: rightAlign - 45, y, fontSize: 10, page: 1 });

    // Accessories if any
    if (invoiceData.accessoriesCost > 0) {
      y += 8;
      initialElements.push({ id: 'td_acc_desc', type: 'text', content: 'Accessories Cost', x: leftMargin + 40, y, fontSize: 10, page: 1 });
      initialElements.push({ id: 'td_acc_amount', type: 'text', content: `Rs.${invoiceData.accessoriesCost.toFixed(2)}`, x: rightAlign - 45, y, fontSize: 10, page: 1 });
    }

    // Delivery if any
    if (invoiceData.deliveryCharge > 0) {
      y += 8;
      initialElements.push({ id: 'td_del_desc', type: 'text', content: 'Delivery Charge', x: leftMargin + 40, y, fontSize: 10, page: 1 });
      initialElements.push({ id: 'td_del_amount', type: 'text', content: `Rs.${invoiceData.deliveryCharge.toFixed(2)}`, x: rightAlign - 45, y, fontSize: 10, page: 1 });
    }

    // Table bottom line
    y += 10;
    initialElements.push({ id: 'table_line_bottom', type: 'line', content: '', x: leftMargin, y, width: A4_WIDTH - 28, page: 1 });

    // Summary
    y += 8;
    let total = subtotal + invoiceData.accessoriesCost + invoiceData.deliveryCharge;
    
    if (invoiceData.invoiceType === 'with_gst') {
      const gstRate = parseFloat(invoiceData.gstRate) / 2;
      const cgst = (subtotal * gstRate) / 100;
      const sgst = (subtotal * gstRate) / 100;
      total += cgst + sgst;

      initialElements.push({ id: 'subtotal', type: 'text', content: `Subtotal: Rs.${subtotal.toFixed(2)}`, x: rightAlign - 80, y, fontSize: 10, page: 1 });
      y += 6;
      initialElements.push({ id: 'cgst', type: 'text', content: `CGST @ ${gstRate}%: Rs.${cgst.toFixed(2)}`, x: rightAlign - 80, y, fontSize: 10, page: 1 });
      y += 6;
      initialElements.push({ id: 'sgst', type: 'text', content: `SGST @ ${gstRate}%: Rs.${sgst.toFixed(2)}`, x: rightAlign - 80, y, fontSize: 10, page: 1 });
      y += 8;
    }

    initialElements.push({ id: 'total', type: 'text', content: `Total: Rs.${total.toFixed(2)}`, x: rightAlign - 80, y, fontSize: 12, fontWeight: 'bold', page: 1 });

    // Amount in words
    y += 15;
    initialElements.push({ id: 'amount_words', type: 'text', content: `Amount in words: ${numberToWordsSimple(Math.round(total))} Rupees Only`, x: leftMargin, y, fontSize: 9, fontStyle: 'italic', page: 1 });

    // Payment Details
    y += 15;
    initialElements.push({ id: 'payment_label', type: 'text', content: 'Payment Details:', x: leftMargin, y, fontSize: 10, fontWeight: 'bold', page: 1 });
    y += 6;

    if (invoiceData.accountType === 'company') {
      initialElements.push({ id: 'bank_name', type: 'text', content: `Bank: ${invoiceData.bankDetails.bankName}`, x: leftMargin, y, fontSize: 9, page: 1 });
      y += 5;
      initialElements.push({ id: 'acc_no', type: 'text', content: `A/c: ${invoiceData.bankDetails.accountNumber}`, x: leftMargin, y, fontSize: 9, page: 1 });
      y += 5;
      initialElements.push({ id: 'ifsc', type: 'text', content: `IFSC: ${invoiceData.bankDetails.ifscCode}`, x: leftMargin, y, fontSize: 9, page: 1 });
      y += 5;
      initialElements.push({ id: 'branch', type: 'text', content: `Branch: ${invoiceData.bankDetails.branch}`, x: leftMargin, y, fontSize: 9, page: 1 });
    } else {
      initialElements.push({ id: 'phone', type: 'text', content: `Phone/GPay/PhonePe: ${invoiceData.personalDetails.phoneNumber}`, x: leftMargin, y, fontSize: 9, page: 1 });
      y += 5;
      initialElements.push({ id: 'upi', type: 'text', content: `UPI ID: ${invoiceData.personalDetails.upiId}`, x: leftMargin, y, fontSize: 9, page: 1 });
    }

    // Signature area
    y += 25;
    initialElements.push({ id: 'signature_label', type: 'text', content: 'Authorized Signatory', x: rightAlign - 70, y, fontSize: 10, fontWeight: 'bold', page: 1 });

    // Footer
    const footerY = A4_HEIGHT - 25;
    initialElements.push({ id: 'footer1', type: 'text', content: 'Thank you for your business!', x: centerX, y: footerY, fontSize: 8, fontStyle: 'italic', align: 'center', page: 1 });
    initialElements.push({ id: 'footer2', type: 'text', content: 'Feather Fashions - Crafted with precision, designed for comfort', x: centerX, y: footerY + 5, fontSize: 8, fontStyle: 'italic', align: 'center', page: 1 });

    return initialElements;
  }, [invoiceData]);

  // Initialize layout
  useEffect(() => {
    if (open && !isInitialized) {
      const initial = generateInitialLayout();
      setElements(initial);
      setIsInitialized(true);
      
      // Load to canvas after a short delay
      setTimeout(() => {
        if (canvasRef.current) {
          loadElementsToCanvas(initial, 1);
        }
      }, 100);
    }
  }, [open, isInitialized, generateInitialLayout]);

  // Reset when dialog closes
  useEffect(() => {
    if (!open) {
      setIsInitialized(false);
      setElements([]);
      setCurrentPage(1);
      setPageCanvasData({});
    }
  }, [open]);

  // Load elements to canvas
  const loadElementsToCanvas = (elementsToLoad: InvoiceElement[], page: number) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current.getCanvas() as Canvas;
    if (!canvas) return;

    // Clear existing objects except guides
    const objectsToRemove = canvas.getObjects().filter((obj) => {
      const name = (obj as any).get('name');
      return name !== 'pageBorder' && name !== 'marginGuides';
    });
    objectsToRemove.forEach((obj) => canvas.remove(obj));

    // Add elements for current page
    const pageElements = elementsToLoad.filter((el) => el.page === page);
    
    pageElements.forEach((el) => {
      if (el.type === 'text') {
        const textObj = new IText(el.content, {
          left: el.x * (A4_WIDTH / 210), // Convert mm to pixels roughly
          top: el.y * (A4_HEIGHT / 297),
          fontSize: el.fontSize || 12,
          fontWeight: el.fontWeight === 'bold' ? 'bold' : 'normal',
          fontStyle: el.fontStyle === 'italic' ? 'italic' : 'normal',
          fontFamily: 'Helvetica',
          fill: '#1a1a1a',
          originX: el.align === 'center' ? 'center' : el.align === 'right' ? 'right' : 'left',
        });
        (textObj as any).set('elementId', el.id);
        (textObj as any).set('name', el.id);
        canvas.add(textObj);
      }
    });

    canvas.renderAll();
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open || !selectedElement) return;

      const moveAmount = e.shiftKey ? 10 : 1;

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          canvasRef.current?.moveSelected('up', moveAmount);
          break;
        case 'ArrowDown':
          e.preventDefault();
          canvasRef.current?.moveSelected('down', moveAmount);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          canvasRef.current?.moveSelected('left', moveAmount);
          break;
        case 'ArrowRight':
          e.preventDefault();
          canvasRef.current?.moveSelected('right', moveAmount);
          break;
        case 'Delete':
        case 'Backspace':
          if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
            e.preventDefault();
            canvasRef.current?.deleteSelected();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, selectedElement]);

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    
    // Save current page data
    if (canvasRef.current) {
      const canvasData = canvasRef.current.getCanvasJSON();
      setPageCanvasData(prev => ({ ...prev, [currentPage]: canvasData }));
    }

    setCurrentPage(page);

    // Load new page data
    setTimeout(() => {
      if (canvasRef.current && pageCanvasData[page]) {
        canvasRef.current.loadFromJSON(pageCanvasData[page]);
      }
    }, 50);
  };

  // Add new page
  const addPage = () => {
    setTotalPages(prev => prev + 1);
    handlePageChange(totalPages + 1);
  };

  // Generate PDF from canvas
  const generatePDF = async () => {
    if (!canvasRef.current) return null;

    const JsPDF = await loadJsPDF();
    const doc = new JsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4',
    });

    const canvas = canvasRef.current.getCanvas() as Canvas;
    if (!canvas) return null;

    // Get all objects from canvas and render to PDF
    const objects = canvas.getObjects();
    
    objects.forEach((obj) => {
      const name = (obj as any).get('name');
      if (name === 'pageBorder' || name === 'marginGuides') return;

      if (obj.type === 'i-text') {
        const textObj = obj as IText;
        const x = textObj.left || 0;
        const y = textObj.top || 0;
        
        doc.setFontSize(textObj.fontSize || 12);
        if (textObj.fontWeight === 'bold') {
          doc.setFont('helvetica', 'bold');
        } else if (textObj.fontStyle === 'italic') {
          doc.setFont('helvetica', 'italic');
        } else {
          doc.setFont('helvetica', 'normal');
        }

        const align = textObj.originX === 'center' ? 'center' : textObj.originX === 'right' ? 'right' : 'left';
        doc.text(textObj.text || '', x, y + (textObj.fontSize || 12), { align: align as any });
      }
    });

    return doc;
  };

  // Handle confirm and download
  const handleConfirmDownload = async () => {
    const pdf = await generatePDF();
    if (pdf) {
      onConfirmDownload(pdf);
      onClose();
      toast.success('Invoice generated and downloaded');
    }
  };

  // Reset layout
  const handleResetLayout = () => {
    const initial = generateInitialLayout();
    setElements(initial);
    loadElementsToCanvas(initial, currentPage);
    toast.info('Layout reset to original');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] h-[95vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Invoice Layout Editor
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 flex overflow-hidden">
          {/* Toolbar */}
          <div className="w-64 border-r p-4 overflow-y-auto bg-muted/30">
            <InvoiceEditorToolbar
              selectedElement={selectedElement}
              zoom={zoom}
              onAddText={() => canvasRef.current?.addText('New Text')}
              onAddLine={() => canvasRef.current?.addLine()}
              onDelete={() => canvasRef.current?.deleteSelected()}
              onDuplicate={() => canvasRef.current?.duplicateSelected()}
              onMove={(dir, amt) => canvasRef.current?.moveSelected(dir, amt)}
              onBringForward={() => canvasRef.current?.bringForward()}
              onSendBackward={() => canvasRef.current?.sendBackward()}
              onUpdateProperty={(prop, val) => canvasRef.current?.updateSelectedProperty(prop, val)}
              onZoomChange={setZoom}
              onResetLayout={handleResetLayout}
            />
          </div>

          {/* Canvas Area */}
          <div className="flex-1 flex flex-col overflow-hidden bg-slate-100">
            {/* Page Navigation */}
            <div className="flex items-center justify-center gap-4 py-3 border-b bg-background">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={addPage}>
                + Add Page
              </Button>
            </div>

            {/* Canvas */}
            <ScrollArea className="flex-1">
              <div 
                className="flex justify-center items-start p-8"
                style={{ minHeight: '100%' }}
              >
                <div 
                  style={{ 
                    transform: `scale(${zoom})`,
                    transformOrigin: 'top center',
                  }}
                >
                  <InvoiceEditorCanvas
                    ref={canvasRef}
                    width={A4_WIDTH}
                    height={A4_HEIGHT}
                    elements={elements.filter(e => e.page === currentPage)}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onElementSelect={setSelectedElement}
                    onElementsChange={setElements}
                    onPageChange={handlePageChange}
                  />
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t">
          <div className="flex items-center justify-between w-full">
            <p className="text-sm text-muted-foreground">
              Tip: Click on any element to select, then drag to move or use arrow keys for precise positioning.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleConfirmDownload} className="gap-2">
                <Download className="h-4 w-4" />
                Download PDF
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Simple number to words conversion
function numberToWordsSimple(num: number): string {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  if (num === 0) return 'Zero';
  if (num < 0) return 'Minus ' + numberToWordsSimple(-num);
  
  let words = '';
  
  if (Math.floor(num / 10000000) > 0) {
    words += numberToWordsSimple(Math.floor(num / 10000000)) + ' Crore ';
    num %= 10000000;
  }
  if (Math.floor(num / 100000) > 0) {
    words += numberToWordsSimple(Math.floor(num / 100000)) + ' Lakh ';
    num %= 100000;
  }
  if (Math.floor(num / 1000) > 0) {
    words += numberToWordsSimple(Math.floor(num / 1000)) + ' Thousand ';
    num %= 1000;
  }
  if (Math.floor(num / 100) > 0) {
    words += numberToWordsSimple(Math.floor(num / 100)) + ' Hundred ';
    num %= 100;
  }
  if (num > 0) {
    if (num < 20) {
      words += ones[num];
    } else {
      words += tens[Math.floor(num / 10)];
      if (num % 10 > 0) {
        words += ' ' + ones[num % 10];
      }
    }
  }
  
  return words.trim();
}
