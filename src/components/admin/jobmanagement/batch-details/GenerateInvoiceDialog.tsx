import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { FileText, IndianRupee, Package } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface StyleGroup {
  styleId: string;
  totalPieces: number;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batchId: string;
  batchNumber: string;
  companyName: string;
  rollsData: any[];
  cuttingSummary: Record<number, number>;
}

interface InvoiceStyleItem {
  styleId: string;
  styleName: string;
  styleCode: string;
  productCode: string;
  cmtRate: number;
  pieces: number;
  selected: boolean;
}

export const GenerateInvoiceDialog = ({ open, onOpenChange, batchId, batchNumber, companyName, rollsData, cuttingSummary }: Props) => {
  const navigate = useNavigate();
  const [gstPercent, setGstPercent] = useState<string>('0');
  const [invoiceItems, setInvoiceItems] = useState<InvoiceStyleItem[]>([]);
  const [initialized, setInitialized] = useState(false);

  // Get unique style IDs from rollsData
  const styleGroups = useMemo(() => {
    const groups: Record<string, { styleId: string; typeIndices: number[] }> = {};
    rollsData.forEach((type, idx) => {
      const sid = type.style_id;
      if (!sid) return;
      if (!groups[sid]) groups[sid] = { styleId: sid, typeIndices: [] };
      groups[sid].typeIndices.push(idx);
    });
    return Object.values(groups);
  }, [rollsData]);

  const styleIds = styleGroups.map(g => g.styleId);

  const { data: styles } = useQuery({
    queryKey: ['styles-for-invoice', styleIds],
    queryFn: async () => {
      if (styleIds.length === 0) return [];
      const { data, error } = await supabase
        .from('job_styles')
        .select('id, style_code, style_name, product_code, linked_cmt_quotation_id')
        .in('id', styleIds);
      if (error) throw error;
      return data;
    },
    enabled: styleIds.length > 0 && open,
  });

  const cmtIds = (styles || []).map(s => s.linked_cmt_quotation_id).filter(Boolean) as string[];
  const { data: cmtQuotations } = useQuery({
    queryKey: ['cmt-for-invoice', cmtIds],
    queryFn: async () => {
      if (cmtIds.length === 0) return [];
      const { data, error } = await supabase
        .from('cmt_quotations')
        .select('id, approved_rates, final_cmt_per_piece')
        .in('id', cmtIds);
      if (error) throw error;
      return data;
    },
    enabled: cmtIds.length > 0 && open,
  });

  // Initialize items when data is ready
  if (open && styles && styles.length > 0 && !initialized) {
    const items: InvoiceStyleItem[] = styleGroups.map(group => {
      const style = styles.find(s => s.id === group.styleId);
      const cmt = cmtQuotations?.find(c => c.id === style?.linked_cmt_quotation_id);
      const totalPieces = group.typeIndices.reduce((sum, idx) => sum + (cuttingSummary[idx] || 0), 0);
      return {
        styleId: group.styleId,
        styleName: style?.style_name || 'Unknown',
        styleCode: style?.style_code || '',
        productCode: (style as any)?.product_code || '',
        cmtRate: cmt?.final_cmt_per_piece || 0,
        pieces: totalPieces,
        selected: true,
      };
    });
    setInvoiceItems(items);
    setInitialized(true);
  }

  // Reset on close
  const handleOpenChange = (val: boolean) => {
    if (!val) {
      setInitialized(false);
      setGstPercent('0');
    }
    onOpenChange(val);
  };

  const updateItem = (idx: number, field: keyof InvoiceStyleItem, value: any) => {
    setInvoiceItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };

  const selectedItems = invoiceItems.filter(i => i.selected);
  const subtotal = selectedItems.reduce((sum, item) => sum + (item.cmtRate * item.pieces), 0);
  const gstAmount = subtotal * (parseFloat(gstPercent) || 0) / 100;
  const grandTotal = subtotal + gstAmount;

  const handleGenerate = () => {
    const invoiceLineItems = selectedItems.map(item => ({
      custom_product_name: `${item.styleCode} - ${item.styleName}`,
      hsn_code: '',
      product_code: item.productCode || item.styleCode,
      price: item.cmtRate,
      quantity: item.pieces,
      amount: item.cmtRate * item.pieces,
      product_id: '',
    }));

    const gstRate = parseFloat(gstPercent) || 0;
    const halfGst = (gstRate / 2).toString();

    navigate('/admin/invoice', {
      state: {
        prefillItems: invoiceLineItems,
        prefillGst: {
          taxType: 'intra' as const,
          cgstRate: halfGst,
          sgstRate: halfGst,
        },
        prefillSource: `Batch ${batchNumber}`,
        prefillCompanyName: companyName,
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Generate Invoice — {batchNumber}
          </DialogTitle>
          <DialogDescription>
            Select styles and confirm details before generating the invoice.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Style Items */}
          {invoiceItems.map((item, idx) => (
            <Card key={item.styleId} className={!item.selected ? 'opacity-50' : ''}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={item.selected}
                    onCheckedChange={(checked) => updateItem(idx, 'selected', !!checked)}
                    className="mt-1"
                  />
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{item.styleCode}</Badge>
                      <span className="font-medium">{item.styleName}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-muted-foreground">CMT Rate (₹/pc)</Label>
                        <Input
                          type="number"
                          value={item.cmtRate}
                          onChange={(e) => updateItem(idx, 'cmtRate', parseFloat(e.target.value) || 0)}
                          className="h-9 mt-1"
                          step="0.5"
                          disabled={!item.selected}
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Pieces</Label>
                        <Input
                          type="number"
                          value={item.pieces}
                          onChange={(e) => updateItem(idx, 'pieces', parseInt(e.target.value) || 0)}
                          className="h-9 mt-1"
                          disabled={!item.selected}
                        />
                      </div>
                    </div>
                    {item.selected && (
                      <div className="text-sm text-right font-medium">
                        Amount: ₹{(item.cmtRate * item.pieces).toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* GST */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-3 gap-4 items-end">
                <div>
                  <Label className="text-xs text-muted-foreground">GST %</Label>
                  <Input
                    type="number"
                    value={gstPercent}
                    onChange={(e) => setGstPercent(e.target.value)}
                    className="h-9 mt-1"
                    step="0.5"
                    min="0"
                  />
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">GST Amount:</span>
                  <span className="font-medium ml-2">₹{gstAmount.toFixed(2)}</span>
                  {parseFloat(gstPercent) > 0 && (
                    <div className="text-xs text-muted-foreground">
                      CGST: {(parseFloat(gstPercent) / 2).toFixed(1)}% + SGST: {(parseFloat(gstPercent) / 2).toFixed(1)}%
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Subtotal: ₹{subtotal.toFixed(2)}</div>
                  <div className="text-lg font-bold text-primary">₹{grandTotal.toFixed(2)}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>Cancel</Button>
          <Button onClick={handleGenerate} disabled={selectedItems.length === 0}>
            <FileText className="h-4 w-4 mr-2" />
            Generate Invoice
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
