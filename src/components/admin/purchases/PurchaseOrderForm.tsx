import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { Plus, Trash2, Upload, X, FileImage, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { usePurchaseOrders, PurchaseOrder, POLineItem, POSupplier } from "@/hooks/usePurchaseOrders";
import { toast } from "@/hooks/use-toast";

const CATEGORIES = [
  { value: "fabric", label: "Fabric" },
  { value: "elastic", label: "Elastic" },
  { value: "thread", label: "Thread" },
  { value: "packaging", label: "Packaging" },
  { value: "machine", label: "Machine" },
  { value: "transport", label: "Transport" },
  { value: "other", label: "Other" },
];

const PAYMENT_TYPES = [
  { value: "cash", label: "Cash" },
  { value: "bank", label: "Bank Transfer" },
  { value: "upi", label: "UPI" },
  { value: "credit", label: "Credit" },
];

const UNITS = ["KG", "Meter", "Piece", "Roll", "Box", "Nos", "Liter"];

interface Props {
  purchaseOrder: PurchaseOrder | null;
  suppliers: POSupplier[];
  onClose: () => void;
}

const PurchaseOrderForm = ({ purchaseOrder, suppliers, onClose }: Props) => {
  const { createPurchaseOrder, updatePurchaseOrder, createSupplier, getLineItems, uploadFile, getFiles } = usePurchaseOrders();
  
  const [lineItems, setLineItems] = useState<POLineItem[]>([
    { item_name: "", quantity: 1, unit: "Piece", rate: 0, amount: 0 }
  ]);
  const [files, setFiles] = useState<File[]>([]);
  const [existingFiles, setExistingFiles] = useState<any[]>([]);
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
  const [newSupplier, setNewSupplier] = useState({ supplier_name: "", phone: "", gst_number: "", address: "" });

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      purchase_date: purchaseOrder?.purchase_date || format(new Date(), "yyyy-MM-dd"),
      supplier_id: purchaseOrder?.supplier_id || "",
      category: purchaseOrder?.category || "fabric",
      payment_type: purchaseOrder?.payment_type || "cash",
      gst_type: purchaseOrder?.gst_type || "non_gst",
      invoice_number: purchaseOrder?.invoice_number || "",
      invoice_date: purchaseOrder?.invoice_date || "",
      discount: purchaseOrder?.discount || 0,
      cgst_rate: purchaseOrder?.cgst_rate || 9,
      sgst_rate: purchaseOrder?.sgst_rate || 9,
      igst_rate: purchaseOrder?.igst_rate || 0,
      notes: purchaseOrder?.notes || "",
    }
  });

  const gstType = watch("gst_type");
  const discount = watch("discount") || 0;
  const cgstRate = watch("cgst_rate") || 0;
  const sgstRate = watch("sgst_rate") || 0;
  const igstRate = watch("igst_rate") || 0;

  // Load existing line items and files
  useEffect(() => {
    if (purchaseOrder?.id) {
      getLineItems(purchaseOrder.id).then(items => {
        if (items.length > 0) {
          setLineItems(items);
        }
      });
      getFiles(purchaseOrder.id).then(setExistingFiles);
    }
  }, [purchaseOrder?.id]);

  // Calculate totals
  const subtotal = lineItems.reduce((sum, item) => sum + (item.amount || 0), 0);
  const discountedSubtotal = subtotal - Number(discount);
  
  let cgstAmount = 0, sgstAmount = 0, igstAmount = 0;
  if (gstType === "gst") {
    if (igstRate > 0) {
      igstAmount = (discountedSubtotal * Number(igstRate)) / 100;
    } else {
      cgstAmount = (discountedSubtotal * Number(cgstRate)) / 100;
      sgstAmount = (discountedSubtotal * Number(sgstRate)) / 100;
    }
  }
  const grandTotal = discountedSubtotal + cgstAmount + sgstAmount + igstAmount;

  const updateLineItem = (index: number, field: keyof POLineItem, value: any) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: value };
    
    if (field === "quantity" || field === "rate") {
      updated[index].amount = Number(updated[index].quantity) * Number(updated[index].rate);
    }
    
    setLineItems(updated);
  };

  const addLineItem = () => {
    setLineItems([...lineItems, { item_name: "", quantity: 1, unit: "Piece", rate: 0, amount: 0 }]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const validFiles = newFiles.filter(f => f.size <= 10 * 1024 * 1024); // 10MB limit
      if (validFiles.length < newFiles.length) {
        toast({ title: "Some files exceed 10MB limit", variant: "destructive" });
      }
      setFiles(prev => [...prev, ...validFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleAddSupplier = async () => {
    if (!newSupplier.supplier_name) {
      toast({ title: "Supplier name is required", variant: "destructive" });
      return;
    }
    
    const result = await createSupplier.mutateAsync({
      supplier_name: newSupplier.supplier_name,
      phone: newSupplier.phone || null,
      gst_number: newSupplier.gst_number || null,
      address: newSupplier.address || null,
      contact_person: null,
      email: null,
      is_active: true,
    });
    
    setValue("supplier_id", result.id);
    setNewSupplier({ supplier_name: "", phone: "", gst_number: "", address: "" });
    setIsAddSupplierOpen(false);
  };

  const onSubmit = async (data: any, isDraft: boolean) => {
    // Validation
    if (gstType === "gst" && (!data.invoice_number || !data.invoice_date)) {
      toast({ title: "Invoice number and date are required for GST entries", variant: "destructive" });
      return;
    }

    if (lineItems.some(item => !item.item_name)) {
      toast({ title: "Please fill all line item names", variant: "destructive" });
      return;
    }

    const purchaseData = {
      purchase_date: data.purchase_date,
      supplier_id: data.supplier_id || null,
      category: data.category,
      payment_type: data.payment_type,
      gst_type: data.gst_type,
      invoice_number: data.invoice_number || null,
      invoice_date: data.invoice_date || null,
      subtotal,
      discount: Number(discount),
      cgst_rate: Number(cgstRate),
      cgst_amount: cgstAmount,
      sgst_rate: Number(sgstRate),
      sgst_amount: sgstAmount,
      igst_rate: Number(igstRate),
      igst_amount: igstAmount,
      grand_total: grandTotal,
      status: isDraft ? "draft" : "locked",
      notes: data.notes || null,
      locked_at: isDraft ? null : new Date().toISOString(),
    };

    try {
      let poId: string;
      
      if (purchaseOrder?.id) {
        await updatePurchaseOrder.mutateAsync({
          id: purchaseOrder.id,
          purchase: purchaseData,
          lineItems,
        });
        poId = purchaseOrder.id;
      } else {
        const result = await createPurchaseOrder.mutateAsync({
          purchase: purchaseData as any,
          lineItems,
        });
        poId = result.id;
      }

      // Upload files
      for (const file of files) {
        await uploadFile(poId, file);
      }

      onClose();
    } catch (error) {
      console.error("Error saving purchase order:", error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Section 1: Basic Details */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Basic Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <Label>PO Number</Label>
              <Input value={purchaseOrder?.po_number || "Auto-generated"} disabled className="bg-gray-50" />
            </div>
            
            <div>
              <Label>Purchase Date *</Label>
              <Input type="date" {...register("purchase_date", { required: true })} />
            </div>
            
            <div>
              <Label>Supplier</Label>
              <div className="flex gap-2">
                <Select 
                  value={watch("supplier_id")} 
                  onValueChange={(v) => setValue("supplier_id", v)}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.supplier_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Dialog open={isAddSupplierOpen} onOpenChange={setIsAddSupplierOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Supplier</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Supplier Name *</Label>
                        <Input 
                          value={newSupplier.supplier_name}
                          onChange={(e) => setNewSupplier({ ...newSupplier, supplier_name: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Phone</Label>
                        <Input 
                          value={newSupplier.phone}
                          onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>GST Number</Label>
                        <Input 
                          value={newSupplier.gst_number}
                          onChange={(e) => setNewSupplier({ ...newSupplier, gst_number: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Address</Label>
                        <Textarea 
                          value={newSupplier.address}
                          onChange={(e) => setNewSupplier({ ...newSupplier, address: e.target.value })}
                        />
                      </div>
                      <Button onClick={handleAddSupplier} className="w-full">Add Supplier</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            
            <div>
              <Label>Category *</Label>
              <Select value={watch("category")} onValueChange={(v) => setValue("category", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Payment Type *</Label>
              <Select value={watch("payment_type")} onValueChange={(v) => setValue("payment_type", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_TYPES.map(p => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>GST Type *</Label>
              <Select value={watch("gst_type")} onValueChange={(v) => setValue("gst_type", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="non_gst">Non-GST</SelectItem>
                  <SelectItem value="gst">GST</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {gstType === "gst" && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t">
              <div>
                <Label>Invoice Number *</Label>
                <Input {...register("invoice_number")} placeholder="INV-001" />
              </div>
              <div>
                <Label>Invoice Date *</Label>
                <Input type="date" {...register("invoice_date")} />
              </div>
              <div>
                <Label>CGST Rate (%)</Label>
                <Input type="number" {...register("cgst_rate")} />
              </div>
              <div>
                <Label>SGST Rate (%)</Label>
                <Input type="number" {...register("sgst_rate")} />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 2: Line Items */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex justify-between items-center">
            Line Items
            <Button variant="outline" size="sm" onClick={addLineItem}>
              <Plus className="h-4 w-4 mr-1" /> Add Item
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {lineItems.map((item, index) => (
              <div key={index} className="flex gap-2 items-end">
                <div className="flex-1">
                  <Label className={index === 0 ? "" : "sr-only"}>Item Name</Label>
                  <Input
                    value={item.item_name}
                    onChange={(e) => updateLineItem(index, "item_name", e.target.value)}
                    placeholder="Item name"
                  />
                </div>
                <div className="w-24">
                  <Label className={index === 0 ? "" : "sr-only"}>Qty</Label>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateLineItem(index, "quantity", e.target.value)}
                  />
                </div>
                <div className="w-28">
                  <Label className={index === 0 ? "" : "sr-only"}>Unit</Label>
                  <Select value={item.unit} onValueChange={(v) => updateLineItem(index, "unit", v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {UNITS.map(u => (
                        <SelectItem key={u} value={u}>{u}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-28">
                  <Label className={index === 0 ? "" : "sr-only"}>Rate</Label>
                  <Input
                    type="number"
                    value={item.rate}
                    onChange={(e) => updateLineItem(index, "rate", e.target.value)}
                  />
                </div>
                <div className="w-32">
                  <Label className={index === 0 ? "" : "sr-only"}>Amount</Label>
                  <Input value={formatCurrency(item.amount)} disabled className="bg-gray-50" />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeLineItem(index)}
                  disabled={lineItems.length === 1}
                  className="text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <Separator className="my-4" />

          {/* Totals */}
          <div className="space-y-2 text-sm max-w-xs ml-auto">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-medium">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Discount:</span>
              <Input
                type="number"
                {...register("discount")}
                className="w-24 h-8 text-right"
              />
            </div>
            {gstType === "gst" && (
              <>
                {igstRate > 0 ? (
                  <div className="flex justify-between text-green-600">
                    <span>IGST ({igstRate}%):</span>
                    <span>{formatCurrency(igstAmount)}</span>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between text-green-600">
                      <span>CGST ({cgstRate}%):</span>
                      <span>{formatCurrency(cgstAmount)}</span>
                    </div>
                    <div className="flex justify-between text-green-600">
                      <span>SGST ({sgstRate}%):</span>
                      <span>{formatCurrency(sgstAmount)}</span>
                    </div>
                  </>
                )}
              </>
            )}
            <Separator />
            <div className="flex justify-between text-lg font-semibold">
              <span>Grand Total:</span>
              <span>{formatCurrency(grandTotal)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Bill Upload */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Bill & Proof Upload</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
            <input
              type="file"
              id="file-upload"
              className="hidden"
              multiple
              accept="image/*,.pdf"
              onChange={handleFileChange}
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="h-10 w-10 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">Click to upload invoice images or PDFs</p>
              <p className="text-xs text-gray-400 mt-1">Max 10MB per file</p>
            </label>
          </div>

          {/* Existing files */}
          {existingFiles.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">Existing Files</p>
              <div className="flex flex-wrap gap-2">
                {existingFiles.map((file, index) => (
                  <div key={index} className="flex items-center gap-2 bg-gray-100 rounded px-3 py-1 text-sm">
                    <File className="h-4 w-4" />
                    <span>{file.file_name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New files to upload */}
          {files.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">Files to Upload</p>
              <div className="flex flex-wrap gap-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center gap-2 bg-blue-50 rounded px-3 py-1 text-sm">
                    {file.type.startsWith('image/') ? (
                      <FileImage className="h-4 w-4 text-blue-600" />
                    ) : (
                      <File className="h-4 w-4 text-blue-600" />
                    )}
                    <span>{file.name}</span>
                    <button onClick={() => removeFile(index)} className="text-red-500 hover:text-red-700">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 4: Notes */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            {...register("notes")}
            placeholder="Any additional notes or remarks..."
            rows={3}
          />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button 
          variant="secondary" 
          onClick={handleSubmit((data) => onSubmit(data, true))}
          disabled={createPurchaseOrder.isPending || updatePurchaseOrder.isPending}
        >
          Save as Draft
        </Button>
        <Button 
          onClick={handleSubmit((data) => onSubmit(data, false))}
          disabled={createPurchaseOrder.isPending || updatePurchaseOrder.isPending}
        >
          Save & Lock
        </Button>
      </div>
    </div>
  );
};

export default PurchaseOrderForm;
