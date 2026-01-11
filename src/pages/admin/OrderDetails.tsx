import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OrderStatusBadge } from '@/components/admin/OrderStatusBadge';
import { OrderTimeline } from '@/components/admin/OrderTimeline';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ArrowLeft, Package, MapPin, Phone, User, Save, Printer, CreditCard, Banknote } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
// Dynamic import for jsPDF - reduces bundle size
const loadPdfLibs = async () => {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable')
  ]);
  return { jsPDF, autoTable };
};
import { calculateComboPrice } from '@/lib/calculateComboPrice';
import logo from '@/assets/logo.png';
import { numberToWords, formatCurrencyAscii, sanitizePdfText } from '@/lib/invoiceUtils';

export default function AdminOrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [adminNotes, setAdminNotes] = useState('');

  const { data: order, isLoading } = useQuery({
    queryKey: ['admin-order', orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (
              name,
              image_url,
              price,
              discount_percentage,
              combo_offers
            )
          )
        `)
        .eq('id', orderId!)
        .single();

      if (error) throw error;

      // Fetch user profile separately
      const { data: profile } = await supabase
        .from('profiles')
        .select('email, full_name, phone, date_of_birth, gender, marital_status')
        .eq('id', data.user_id)
        .maybeSingle();

      setAdminNotes(data.admin_notes || '');
      return { ...data, profile };
    },
    enabled: !!orderId,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      const updateData: any = { status: newStatus };
      
      if (newStatus === 'confirmed') updateData.confirmed_at = new Date().toISOString();
      if (newStatus === 'shipped') updateData.shipped_at = new Date().toISOString();
      if (newStatus === 'delivered') updateData.delivered_at = new Date().toISOString();
      if (newStatus === 'cancelled') updateData.cancelled_at = new Date().toISOString();

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId!);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast.success('Order status updated successfully');
    },
    onError: () => {
      toast.error('Failed to update order status');
    },
  });

  const updateNotesMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('orders')
        .update({ admin_notes: adminNotes })
        .eq('id', orderId!);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-order', orderId] });
      toast.success('Admin notes saved successfully');
    },
    onError: () => {
      toast.error('Failed to save admin notes');
    },
  });

  const handlePrintInvoice = async () => {
    if (!order) return;

    const { jsPDF, autoTable } = await loadPdfLibs();
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    // Add logo (left side)
    doc.addImage(logo, 'PNG', 14, 8, 40, 30);

    // Company details (right side)
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Feather Fashions', pageWidth - 14, 15, { align: 'right' });
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Vadivel Nagar, 251/1, Thottipalayam', pageWidth - 14, 21, { align: 'right' });
    doc.text('Pooluvapatti, Tiruppur, TN - 641602', pageWidth - 14, 26, { align: 'right' });
    doc.text('Ph: +91 97892 25510 | hello@featherfashions.in', pageWidth - 14, 31, { align: 'right' });
    doc.text('www.featherfashions.in', pageWidth - 14, 36, { align: 'right' });

    // Invoice title with decorative line
    doc.setDrawColor(0, 144, 255); // Neon blue accent
    doc.setLineWidth(0.5);
    doc.line(14, 45, pageWidth - 14, 45);
    
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(45, 64, 87);
    doc.text('ORDER INVOICE', pageWidth / 2, 55, { align: 'center' });
    doc.setTextColor(0, 0, 0);
    
    doc.setDrawColor(0, 144, 255);
    doc.line(14, 60, pageWidth - 14, 60);

    // Order details box
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Order No: ${order.order_number}`, 14, 70);
    doc.text(`Date: ${format(new Date(order.created_at), 'dd-MM-yyyy')}`, pageWidth - 14, 70, { align: 'right' });
    
    // Payment method badge
    const isOnlinePayment = order.payment_method === 'phonepe' || order.payment_method === 'online';
    doc.setFillColor(isOnlinePayment ? 0 : 245, isOnlinePayment ? 144 : 158, isOnlinePayment ? 255 : 11);
    doc.roundedRect(14, 74, 50, 8, 2, 2, 'F');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text(isOnlinePayment ? 'PAID - PHONEPE/ONLINE' : 'CASH ON DELIVERY', 39, 79.5, { align: 'center' });
    doc.setTextColor(0, 0, 0);

    // Bill To section
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Ship To:', 14, 92);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(sanitizePdfText(order.delivery_name), 14, 98);
    doc.text(order.delivery_phone, 14, 104);
    
    const addressLines = [
      order.delivery_address_line_1,
      order.delivery_address_line_2,
      `${order.delivery_city}, ${order.delivery_state} - ${order.delivery_pincode}`
    ].filter(Boolean);
    
    let yPos = 110;
    addressLines.forEach((line: string) => {
      doc.text(sanitizePdfText(line), 14, yPos);
      yPos += 5;
    });

    // Items Table
    const tableData = order.order_items?.map((item: any, idx: number) => {
      const variants = [
        item.selected_size ? `Size: ${item.selected_size}` : null,
        item.selected_color ? item.selected_color : null
      ].filter(Boolean).join(', ');

      return [
        (idx + 1).toString(),
        item.product_code || '-',
        `${sanitizePdfText(item.product_name)}${variants ? `\n(${variants})` : ''}`,
        item.quantity.toString(),
        formatCurrencyAscii(Number(item.unit_price)),
        formatCurrencyAscii(Number(item.total_price))
      ];
    }) || [];
    
    autoTable(doc, {
      startY: yPos + 8,
      head: [['#', 'Code', 'Description', 'Qty', 'Rate', 'Amount']],
      body: tableData,
      theme: 'grid',
      headStyles: { 
        fillColor: [45, 64, 87], 
        textColor: [255, 255, 255], 
        fontStyle: 'bold',
        fontSize: 9
      },
      styles: { fontSize: 9, cellPadding: 4 },
      columnStyles: {
        0: { cellWidth: 12, halign: 'center' },
        1: { cellWidth: 25 },
        2: { cellWidth: 70 },
        3: { cellWidth: 15, halign: 'center' },
        4: { cellWidth: 30, halign: 'right' },
        5: { cellWidth: 35, halign: 'right' }
      }
    });
    
    // Summary section
    let finalY = (doc as any).lastAutoTable.finalY + 8;
    
    // Summary box
    doc.setFillColor(249, 250, 251);
    doc.roundedRect(pageWidth - 90, finalY - 2, 76, 40, 2, 2, 'F');
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Subtotal:', pageWidth - 50, finalY + 5, { align: 'right' });
    doc.text(formatCurrencyAscii(Number(order.subtotal)), pageWidth - 16, finalY + 5, { align: 'right' });
    
    doc.text('Shipping:', pageWidth - 50, finalY + 12, { align: 'right' });
    doc.text(formatCurrencyAscii(Number(order.shipping_charges || 0)), pageWidth - 16, finalY + 12, { align: 'right' });
    
    doc.setDrawColor(200, 200, 200);
    doc.line(pageWidth - 88, finalY + 17, pageWidth - 16, finalY + 17);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Total:', pageWidth - 50, finalY + 26, { align: 'right' });
    doc.setTextColor(0, 144, 255);
    doc.text(formatCurrencyAscii(Number(order.total_amount)), pageWidth - 16, finalY + 26, { align: 'right' });
    doc.setTextColor(0, 0, 0);

    // Amount in words
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    const amountInWords = numberToWords(Math.round(Number(order.total_amount)));
    doc.text(`Amount in words: ${amountInWords} Rupees Only`, 14, finalY + 10);

    // Payment info
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Payment Information:', 14, finalY + 50);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Method: ${isOnlinePayment ? 'PhonePe / Online Payment' : 'Cash on Delivery'}`, 14, finalY + 56);
    doc.text(`Status: ${order.payment_status === 'completed' ? 'Paid' : 'Pending'}`, 14, finalY + 62);

    // Terms & Notes section
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Terms & Conditions:', 14, finalY + 75);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const terms = [
      '1. Goods once sold will not be taken back or exchanged.',
      '2. Please check the product immediately upon delivery.',
      '3. Report any damage within 24 hours of delivery.',
      '4. For queries, contact: hello@featherfashions.in'
    ];
    terms.forEach((term, idx) => {
      doc.text(term, 14, finalY + 81 + (idx * 5));
    });

    // Footer with decorative line
    const footerY = pageHeight - 25;
    doc.setDrawColor(0, 144, 255);
    doc.setLineWidth(0.3);
    doc.line(14, footerY - 5, pageWidth - 14, footerY - 5);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(45, 64, 87);
    doc.text('Thank you for shopping with Feather Fashions!', pageWidth / 2, footerY, { align: 'center' });
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Feather-Light Comfort. Limitless Style.', pageWidth / 2, footerY + 5, { align: 'center' });
    doc.text('www.featherfashions.in', pageWidth / 2, footerY + 10, { align: 'center' });
    
    // Open print dialog
    doc.autoPrint();
    window.open(doc.output('bloburl'), '_blank');
    
    toast.success('Invoice generated successfully');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading order details...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Order not found</div>
      </div>
    );
  }

  // Group items by product_id and calculate combo pricing
  const groupedByProduct = order.order_items?.reduce((acc: any, item: any) => {
    const productId = item.product_id;
    if (!acc[productId]) {
      acc[productId] = {
        items: [],
        totalQuantity: 0,
        basePrice: item.products?.price || 0,
        discount: item.products?.discount_percentage || 0,
        comboOffers: item.products?.combo_offers || [],
        productName: item.products?.name || item.product_name,
      };
    }
    acc[productId].items.push(item);
    acc[productId].totalQuantity += item.quantity;
    return acc;
  }, {} as Record<string, any>) || {};

  const productCalculations = Object.entries(groupedByProduct).map(([productId, group]: [string, any]) => ({
    productId,
    calculation: calculateComboPrice(
      group.totalQuantity,
      group.basePrice,
      group.comboOffers,
      group.discount
    ),
    ...group,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/admin/orders')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </Button>
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handlePrintInvoice}>
            <Printer className="mr-2 h-4 w-4" />
            Print Invoice
          </Button>
          <Select
            value={order.status}
            onValueChange={(value) => updateStatusMutation.mutate(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Left Side - Order Details */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Order {order.order_number}</CardTitle>
                <OrderStatusBadge status={order.status} />
              </div>
              <p className="text-sm text-muted-foreground">
                Placed on {format(new Date(order.created_at), 'PPP')}
              </p>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Full Name</p>
                <p className="font-medium">{order.delivery_name || order.profile?.full_name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium break-all">{order.profile?.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{order.delivery_phone || order.profile?.phone || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Payment Method</p>
                <p className="font-medium capitalize">
                  {order.payment_method === 'phonepe' || order.payment_method === 'online' 
                    ? 'PhonePe / Online' 
                    : 'Cash on Delivery'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Payment Status</p>
                <Badge variant={order.payment_status === 'completed' ? 'default' : 'secondary'} className="capitalize">
                  {order.payment_status || 'Pending'}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">User ID</p>
                <p className="font-medium text-xs font-mono text-muted-foreground">{order.user_id}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Items
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {productCalculations.map(({ productId, calculation, items, productName, totalQuantity }) => {
                const hasCombo = calculation.breakdown.some((b: any) => b.type === 'combo');
                
                return (
                  <div key={productId} className="border-b pb-4 last:border-b-0">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-lg">{productName}</h4>
                        <p className="text-sm text-muted-foreground">
                          Total Quantity: {totalQuantity} pieces
                        </p>
                      </div>
                      {hasCombo && (
                        <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                          🎁 Combo Applied
                        </Badge>
                      )}
                    </div>

                    {/* Show all variations */}
                    <div className="space-y-2 mb-3 bg-muted/30 p-3 rounded-lg">
                      {items.map((item: any) => (
                        <div key={item.id} className="flex gap-3 text-sm items-center">
                          <img
                            src={item.product_image_url}
                            alt={item.product_name}
                            className="w-12 h-12 object-cover rounded"
                          />
                          <div className="flex-1 flex items-center justify-between">
                            <div>
                              {item.product_code && (
                                <p className="text-xs text-muted-foreground font-mono">
                                  {item.product_code}
                                </p>
                              )}
                              <div className="flex gap-2 mt-1">
                                {item.selected_size && (
                                  <Badge variant="outline" className="text-xs">
                                    Size: {item.selected_size}
                                  </Badge>
                                )}
                                {item.selected_color && (
                                  <Badge variant="outline" className="text-xs">
                                    {item.selected_color}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <span className="font-medium">Qty: {item.quantity}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Pricing Breakdown */}
                    {calculation.breakdown.length > 1 && (
                      <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-3 mb-3 border border-amber-200 dark:border-amber-900">
                        <p className="text-xs font-semibold mb-2 text-amber-900 dark:text-amber-200">
                          📊 Pricing Breakdown:
                        </p>
                        <div className="space-y-1.5">
                          {calculation.breakdown.map((b: any, idx: number) => (
                            <div key={idx} className="flex justify-between text-xs items-center">
                              <span className="text-muted-foreground">
                                {b.type === 'combo' 
                                  ? `🎁 ${b.quantity} pcs @ ₹${(b.price / b.quantity).toFixed(2)}/pc`
                                  : `${b.quantity} pcs @ ₹${(b.price / b.quantity).toFixed(2)}/pc`
                                }
                              </span>
                              <span className="font-semibold">₹{b.price.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Summary for this product */}
                    <div className="flex justify-between items-center pt-2 border-t">
                      <div>
                        {calculation.savings > 0 && (
                          <div className="flex flex-col gap-1">
                            <p className="text-xs text-muted-foreground">
                              Original: <span className="line-through">₹{calculation.originalPrice.toFixed(2)}</span>
                            </p>
                            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 w-fit">
                              Customer Saved ₹{calculation.savings.toFixed(2)}
                            </Badge>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">
                          ₹{calculation.finalPrice.toFixed(2)}
                        </p>
                        {calculation.savings > 0 && (
                          <p className="text-xs text-green-600 dark:text-green-400">
                            ({((calculation.savings / calculation.originalPrice) * 100).toFixed(0)}% discount)
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Delivery Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{order.delivery_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{order.delivery_phone}</span>
                </div>
                <p className="text-sm text-muted-foreground pl-6">
                  {order.delivery_address_line_1}
                  {order.delivery_address_line_2 && `, ${order.delivery_address_line_2}`}
                </p>
                <p className="text-sm text-muted-foreground pl-6">
                  {order.delivery_city}, {order.delivery_state} - {order.delivery_pincode}
                </p>
              </div>
            </CardContent>
          </Card>

          {order.customer_notes && (
            <Card>
              <CardHeader>
                <CardTitle>Customer Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{order.customer_notes}</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Admin Notes
                <Button
                  size="sm"
                  onClick={() => updateNotesMutation.mutate()}
                  disabled={updateNotesMutation.isPending}
                >
                  <Save className="h-4 w-4 mr-1" />
                  Save
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add internal notes about this order..."
                rows={4}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Side - Summary & Timeline */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(() => {
                const totalSavings = productCalculations.reduce(
                  (sum, p) => sum + p.calculation.savings, 
                  0
                );
                const originalTotal = productCalculations.reduce(
                  (sum, p) => sum + p.calculation.originalPrice, 
                  0
                );

                return (
                  <>
                    {totalSavings > 0 && (
                      <>
                        <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg border border-green-200 dark:border-green-900">
                          <p className="text-xs font-medium text-green-800 dark:text-green-200 mb-1">
                            💰 Customer Savings
                          </p>
                          <p className="text-xl font-bold text-green-600 dark:text-green-400">
                            ₹{totalSavings.toFixed(2)}
                          </p>
                          <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                            {((totalSavings / originalTotal) * 100).toFixed(1)}% off applied
                          </p>
                        </div>
                        <Separator />
                      </>
                    )}

                    <div className="space-y-2 text-sm">
                      {totalSavings > 0 && (
                        <div className="flex justify-between text-muted-foreground">
                          <span>Original Total</span>
                          <span className="line-through">₹{originalTotal.toFixed(2)}</span>
                        </div>
                      )}
                      {totalSavings > 0 && (
                        <div className="flex justify-between text-green-600 dark:text-green-400 font-medium">
                          <span>Combo Discount</span>
                          <span>-₹{totalSavings.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>₹{typeof order.subtotal === 'string' ? parseFloat(order.subtotal).toFixed(2) : order.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping</span>
                        <span>₹{typeof order.shipping_charges === 'string' ? parseFloat(order.shipping_charges).toFixed(2) : order.shipping_charges.toFixed(2)}</span>
                      </div>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total Amount</span>
                      <span>₹{typeof order.total_amount === 'string' ? parseFloat(order.total_amount).toFixed(2) : order.total_amount.toFixed(2)}</span>
                    </div>
                    <div className="bg-muted p-3 rounded-md text-sm">
                      <p className="font-medium mb-1">Payment Method</p>
                      <p className="text-muted-foreground capitalize">
                        {order.payment_method.replace('_', ' ')}
                      </p>
                    </div>
                  </>
                );
              })()}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderTimeline order={order} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}