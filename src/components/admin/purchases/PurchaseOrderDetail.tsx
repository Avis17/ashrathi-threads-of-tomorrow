import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Download, Printer, FileText, File, Eye, Lock, Calendar, Building2, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePurchaseOrders, PurchaseOrder, POLineItem, POFile } from "@/hooks/usePurchaseOrders";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  purchaseOrder: PurchaseOrder;
  onClose: () => void;
}

const PurchaseOrderDetail = ({ purchaseOrder, onClose }: Props) => {
  const { getLineItems, getFiles } = usePurchaseOrders();
  const [lineItems, setLineItems] = useState<POLineItem[]>([]);
  const [files, setFiles] = useState<POFile[]>([]);
  const [fileUrls, setFileUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    getLineItems(purchaseOrder.id).then(setLineItems);
    getFiles(purchaseOrder.id).then(async (files) => {
      setFiles(files);
      // Get signed URLs for files
      const urls: Record<string, string> = {};
      for (const file of files) {
        const { data } = await supabase.storage
          .from("purchase-bills")
          .createSignedUrl(file.file_path, 3600);
        if (data) {
          urls[file.id] = data.signedUrl;
        }
      }
      setFileUrls(urls);
    });
  }, [purchaseOrder.id]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const gstAmount = Number(purchaseOrder.cgst_amount) + Number(purchaseOrder.sgst_amount) + Number(purchaseOrder.igst_amount);

  const handlePrint = () => {
    window.print();
  };

  const downloadAuditPack = async () => {
    // For simplicity, download all files as individual downloads
    for (const file of files) {
      const url = fileUrls[file.id];
      if (url) {
        const a = document.createElement("a");
        a.href = url;
        a.download = file.file_name;
        a.click();
      }
    }
  };

  return (
    <div className="space-y-6 print:space-y-4">
      {/* Header with Actions */}
      <div className="flex justify-between items-start print:hidden">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{purchaseOrder.po_number}</h2>
          <div className="flex items-center gap-2 mt-1">
            <Badge 
              variant={purchaseOrder.status === 'locked' ? 'default' : 'secondary'}
              className={purchaseOrder.status === 'locked' ? 'bg-gray-800' : 'bg-amber-100 text-amber-800'}
            >
              {purchaseOrder.status === 'locked' ? (
                <><Lock className="h-3 w-3 mr-1" />Locked</>
              ) : (
                'Draft'
              )}
            </Badge>
            <Badge variant="outline" className="capitalize">{purchaseOrder.category}</Badge>
            <Badge variant="outline">{purchaseOrder.gst_type === 'gst' ? 'GST' : 'Non-GST'}</Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-1" />
            Print
          </Button>
          <Button variant="outline" size="sm" onClick={downloadAuditPack} disabled={files.length === 0}>
            <Download className="h-4 w-4 mr-1" />
            Download Bills
          </Button>
        </div>
      </div>

      {/* Basic Info Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-gray-200">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
              <Calendar className="h-4 w-4" />
              Purchase Date
            </div>
            <p className="font-medium">{format(new Date(purchaseOrder.purchase_date), "dd MMM yyyy")}</p>
          </CardContent>
        </Card>
        
        <Card className="border-gray-200">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
              <Building2 className="h-4 w-4" />
              Supplier
            </div>
            <p className="font-medium">{purchaseOrder.po_suppliers?.supplier_name || "N/A"}</p>
          </CardContent>
        </Card>
        
        <Card className="border-gray-200">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
              <FileText className="h-4 w-4" />
              Invoice No
            </div>
            <p className="font-medium">{purchaseOrder.invoice_number || "N/A"}</p>
          </CardContent>
        </Card>
        
        <Card className="border-gray-200">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
              <IndianRupee className="h-4 w-4" />
              Payment Type
            </div>
            <p className="font-medium capitalize">{purchaseOrder.payment_type}</p>
          </CardContent>
        </Card>
      </div>

      {/* Line Items Table */}
      <Card className="border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Line Items</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold">#</TableHead>
                <TableHead className="font-semibold">Item Name</TableHead>
                <TableHead className="font-semibold text-right">Quantity</TableHead>
                <TableHead className="font-semibold">Unit</TableHead>
                <TableHead className="font-semibold text-right">Rate</TableHead>
                <TableHead className="font-semibold text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lineItems.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-medium">{item.item_name}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell>{item.unit}</TableCell>
                  <TableCell className="text-right">{formatCurrency(Number(item.rate))}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(Number(item.amount))}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* GST Split & Totals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* GST Breakdown */}
        {purchaseOrder.gst_type === 'gst' && (
          <Card className="border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-green-700">GST Breakdown (Input Credit)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {Number(purchaseOrder.igst_amount) > 0 ? (
                <div className="flex justify-between">
                  <span>IGST ({purchaseOrder.igst_rate}%)</span>
                  <span className="font-medium">{formatCurrency(Number(purchaseOrder.igst_amount))}</span>
                </div>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span>CGST ({purchaseOrder.cgst_rate}%)</span>
                    <span className="font-medium">{formatCurrency(Number(purchaseOrder.cgst_amount))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>SGST ({purchaseOrder.sgst_rate}%)</span>
                    <span className="font-medium">{formatCurrency(Number(purchaseOrder.sgst_amount))}</span>
                  </div>
                </>
              )}
              <Separator />
              <div className="flex justify-between font-semibold text-green-700">
                <span>Total GST</span>
                <span>{formatCurrency(gstAmount)}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Amount Summary */}
        <Card className="border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Amount Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-medium">{formatCurrency(Number(purchaseOrder.subtotal))}</span>
            </div>
            {Number(purchaseOrder.discount) > 0 && (
              <div className="flex justify-between text-red-600">
                <span>Discount</span>
                <span>-{formatCurrency(Number(purchaseOrder.discount))}</span>
              </div>
            )}
            {gstAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>GST</span>
                <span>+{formatCurrency(gstAmount)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between text-lg font-semibold">
              <span>Grand Total</span>
              <span>{formatCurrency(Number(purchaseOrder.grand_total))}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bill Previews */}
      {files.length > 0 && (
        <Card className="border-gray-200 print:hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Bill & Invoice Uploads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {files.map((file) => (
                <div key={file.id} className="border rounded-lg p-3 text-center">
                  {file.file_type?.startsWith('image/') ? (
                    <a href={fileUrls[file.id]} target="_blank" rel="noopener noreferrer">
                      <img
                        src={fileUrls[file.id]}
                        alt={file.file_name}
                        className="w-full h-24 object-cover rounded mb-2"
                      />
                    </a>
                  ) : (
                    <a 
                      href={fileUrls[file.id]} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <div className="w-full h-24 bg-gray-100 rounded mb-2 flex items-center justify-center">
                        <File className="h-10 w-10 text-gray-400" />
                      </div>
                    </a>
                  )}
                  <p className="text-xs text-gray-600 truncate">{file.file_name}</p>
                  <a
                    href={fileUrls[file.id]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline flex items-center justify-center gap-1 mt-1"
                  >
                    <Eye className="h-3 w-3" /> View
                  </a>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      {purchaseOrder.notes && (
        <Card className="border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-wrap">{purchaseOrder.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Audit Info */}
      <Card className="border-gray-200 bg-gray-50">
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-6 text-sm text-gray-600">
            <div>
              <span className="text-gray-500">Created:</span>{" "}
              {format(new Date(purchaseOrder.created_at), "dd MMM yyyy, hh:mm a")}
            </div>
            <div>
              <span className="text-gray-500">Updated:</span>{" "}
              {format(new Date(purchaseOrder.updated_at), "dd MMM yyyy, hh:mm a")}
            </div>
            {purchaseOrder.locked_at && (
              <div>
                <span className="text-gray-500">Locked:</span>{" "}
                {format(new Date(purchaseOrder.locked_at), "dd MMM yyyy, hh:mm a")}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Close Button */}
      <div className="flex justify-end print:hidden">
        <Button variant="outline" onClick={onClose}>Close</Button>
      </div>
    </div>
  );
};

export default PurchaseOrderDetail;
