import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { getHSNCodeByCategory } from '@/lib/hsnCodes';

interface InvoiceItem {
  id?: string;
  product_id: string;
  hsn_code: string;
  product_code: string;
  price: number;
  quantity: number;
  amount: number;
}

export default function InvoiceEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [invoiceDate, setInvoiceDate] = useState('');
  const [invoiceType, setInvoiceType] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [purchaseOrderNo, setPurchaseOrderNo] = useState('');
  const [numberOfPackages, setNumberOfPackages] = useState('1');
  const [taxType, setTaxType] = useState<'intra' | 'inter'>('intra');
  const [cgstRate, setCgstRate] = useState('9');
  const [sgstRate, setSgstRate] = useState('9');
  const [igstRate, setIgstRate] = useState('18');
  const [discount, setDiscount] = useState(0);
  const [termsAndConditions, setTermsAndConditions] = useState<string[]>([]);
  const [items, setItems] = useState<InvoiceItem[]>([]);

  const { data: invoice, isLoading: invoiceLoading } = useQuery({
    queryKey: ['invoice', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select('*, invoice_items(*)')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: customers } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('is_active', true)
        .order('company_name');
      if (error) throw error;
      return data;
    },
  });

  const { data: products } = useQuery({
    queryKey: ['products-with-price'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .not('price', 'is', null);
      if (error) throw error;
      return data;
    },
  });

  // Initialize form with invoice data
  useEffect(() => {
    if (invoice) {
      setInvoiceDate(format(new Date(invoice.invoice_date), 'yyyy-MM-dd'));
      setInvoiceType(invoice.invoice_type);
      setCustomerId(invoice.customer_id);
      setDeliveryAddress(invoice.delivery_address);
      setPurchaseOrderNo(invoice.purchase_order_no || '');
      setNumberOfPackages(String(invoice.number_of_packages));
      setDiscount(invoice.discount || 0);
      setTermsAndConditions(invoice.terms_and_conditions || []);
      
      if (invoice.igst_amount > 0) {
        setTaxType('inter');
        setIgstRate(String(invoice.igst_rate));
      } else {
        setTaxType('intra');
        setCgstRate(String(invoice.cgst_rate));
        setSgstRate(String(invoice.sgst_rate));
      }

      setItems(invoice.invoice_items.map((item: any) => ({
        id: item.id,
        product_id: item.product_id,
        hsn_code: item.hsn_code,
        product_code: item.product_code,
        price: item.price,
        quantity: item.quantity,
        amount: item.amount,
      })));
    }
  }, [invoice]);

  const handleProductChange = (index: number, productId: string) => {
    const product = products?.find(p => p.id === productId);
    if (product) {
      const newItems = [...items];
      const hsnCode = product.hsn_code || getHSNCodeByCategory(product.category);
      newItems[index] = {
        ...newItems[index],
        product_id: productId,
        hsn_code: hsnCode,
        product_code: product.product_code || '',
        price: Number(product.price) || 0,
        amount: Number(product.price) * newItems[index].quantity,
      };
      setItems(newItems);
    }
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    const newItems = [...items];
    newItems[index].quantity = quantity;
    newItems[index].amount = newItems[index].price * quantity;
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, {
      product_id: '',
      hsn_code: '',
      product_code: '',
      price: 0,
      quantity: 1,
      amount: 0,
    }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const cgstAmount = taxType === 'intra' ? (subtotal * Number(cgstRate)) / 100 : 0;
  const sgstAmount = taxType === 'intra' ? (subtotal * Number(sgstRate)) / 100 : 0;
  const igstAmount = taxType === 'inter' ? (subtotal * Number(igstRate)) / 100 : 0;
  const totalBeforeDiscount = subtotal + cgstAmount + sgstAmount + igstAmount;
  const total = totalBeforeDiscount - discount;

  const updateInvoiceMutation = useMutation({
    mutationFn: async () => {
      if (!customerId || items.some(i => !i.product_id)) {
        throw new Error('Please fill all required fields');
      }

      // Update invoice
      const { error: invoiceError } = await supabase
        .from('invoices')
        .update({
          invoice_date: invoiceDate,
          invoice_type: invoiceType,
          customer_id: customerId,
          delivery_address: deliveryAddress,
          purchase_order_no: purchaseOrderNo || null,
          number_of_packages: Number(numberOfPackages),
          subtotal,
          cgst_rate: Number(cgstRate),
          cgst_amount: cgstAmount,
          sgst_rate: Number(sgstRate),
          sgst_amount: sgstAmount,
          igst_rate: Number(igstRate),
          igst_amount: igstAmount,
          total_amount: total,
          discount: discount,
          terms_and_conditions: termsAndConditions,
        })
        .eq('id', id);

      if (invoiceError) throw invoiceError;

      // Delete existing items
      const { error: deleteError } = await supabase
        .from('invoice_items')
        .delete()
        .eq('invoice_id', id);

      if (deleteError) throw deleteError;

      // Insert new items
      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(items.map(item => ({
          invoice_id: id,
          product_id: item.product_id,
          hsn_code: item.hsn_code,
          product_code: item.product_code,
          price: item.price,
          quantity: item.quantity,
          amount: item.amount,
        })));

      if (itemsError) throw itemsError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoice', id] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast({ title: 'Invoice updated successfully' });
      navigate(`/admin/invoices/${id}`);
    },
    onError: (error: Error) => {
      toast({ title: error.message || 'Failed to update invoice', variant: 'destructive' });
    },
  });

  if (invoiceLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <p className="text-lg text-muted-foreground">Invoice not found</p>
        <Button onClick={() => navigate('/admin/invoices')} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/admin/invoices/${id}`)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Edit Invoice
            </h1>
            <p className="text-muted-foreground">Modify invoice details</p>
          </div>
        </div>
        <Button onClick={() => updateInvoiceMutation.mutate()}>
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <Card className="border-2">
        <CardHeader>
          <CardTitle>Invoice Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="invoice-date">Invoice Date *</Label>
              <Input
                id="invoice-date"
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="invoice-type">Invoice Type *</Label>
              <Select value={invoiceType} onValueChange={setInvoiceType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Feather Fashions">Feather Fashions</SelectItem>
                  <SelectItem value="tax">Tax Invoice</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="customer">Customer *</Label>
              <Select value={customerId} onValueChange={setCustomerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers?.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.company_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="packages">Number of Packages *</Label>
              <Input
                id="packages"
                type="number"
                value={numberOfPackages}
                onChange={(e) => setNumberOfPackages(e.target.value)}
                min="1"
              />
            </div>
            <div>
              <Label htmlFor="po-number">Purchase Order No.</Label>
              <Input
                id="po-number"
                value={purchaseOrderNo}
                onChange={(e) => setPurchaseOrderNo(e.target.value)}
                placeholder="Optional"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="delivery-address">Delivery Address *</Label>
            <Textarea
              id="delivery-address"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Invoice Items</CardTitle>
            <Button onClick={addItem} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.map((item, index) => (
            <div key={index} className="grid grid-cols-12 gap-4 items-end p-4 border rounded-lg">
              <div className="col-span-4">
                <Label>Product *</Label>
                <Select
                  value={item.product_id}
                  onValueChange={(value) => handleProductChange(index, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products?.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label>HSN Code</Label>
                <Input value={item.hsn_code} readOnly />
              </div>
              <div className="col-span-2">
                <Label>Quantity *</Label>
                <Input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 1)}
                  min="1"
                />
              </div>
              <div className="col-span-2">
                <Label>Price</Label>
                <Input value={`₹${item.price.toFixed(2)}`} readOnly />
              </div>
              <div className="col-span-2">
                <Label>Amount</Label>
                <Input value={`₹${item.amount.toFixed(2)}`} readOnly />
              </div>
              {items.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeItem(index)}
                  className="col-span-12 md:col-span-1"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-2">
        <CardHeader>
          <CardTitle>Tax Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup value={taxType} onValueChange={(value: any) => setTaxType(value)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="intra" id="intra" />
              <Label htmlFor="intra">Intra-State (CGST + SGST)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="inter" id="inter" />
              <Label htmlFor="inter">Inter-State (IGST)</Label>
            </div>
          </RadioGroup>

          {taxType === 'intra' ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>CGST Rate (%)</Label>
                <Input
                  type="number"
                  value={cgstRate}
                  onChange={(e) => setCgstRate(e.target.value)}
                  step="0.1"
                />
              </div>
              <div>
                <Label>SGST Rate (%)</Label>
                <Input
                  type="number"
                  value={sgstRate}
                  onChange={(e) => setSgstRate(e.target.value)}
                  step="0.1"
                />
              </div>
            </div>
          ) : (
            <div>
              <Label>IGST Rate (%)</Label>
              <Input
                type="number"
                value={igstRate}
                onChange={(e) => setIgstRate(e.target.value)}
                step="0.1"
              />
            </div>
          )}

          <div>
            <Label>Discount</Label>
            <Input
              type="number"
              value={discount}
              onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
              step="0.01"
            />
          </div>

          <div className="p-4 bg-muted rounded-lg space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
            </div>
            {taxType === 'intra' ? (
              <>
                <div className="flex justify-between">
                  <span>CGST ({cgstRate}%):</span>
                  <span>₹{cgstAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>SGST ({sgstRate}%):</span>
                  <span>₹{sgstAmount.toFixed(2)}</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between">
                <span>IGST ({igstRate}%):</span>
                <span>₹{igstAmount.toFixed(2)}</span>
              </div>
            )}
            {discount > 0 && (
              <div className="flex justify-between">
                <span>Discount:</span>
                <span>- ₹{discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold pt-2 border-t">
              <span>Total:</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}