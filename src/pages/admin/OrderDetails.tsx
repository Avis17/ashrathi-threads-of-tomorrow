import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OrderStatusBadge } from '@/components/customer/OrderStatusBadge';
import { OrderTimeline } from '@/components/customer/OrderTimeline';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ArrowLeft, Package, MapPin, Phone, User, Save, Printer } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { calculateComboPrice } from '@/lib/calculateComboPrice';

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

  const handlePrintInvoice = () => {
    if (!order) return;

    const doc = new jsPDF();
    
    // Company Info
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('FEATHER FASHIONS', 105, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('No.1, Nallappa Gounder Street, Gandhi Nagar,', 105, 28, { align: 'center' });
    doc.text('Tirupur - 641 601, Tamil Nadu, India', 105, 33, { align: 'center' });
    doc.text('Phone: +91 99999 99999', 105, 38, { align: 'center' });
    
    // Invoice Title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', 105, 50, { align: 'center' });
    
    // Invoice Details
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Invoice No: ${order.order_number}`, 14, 60);
    doc.text(`Date: ${format(new Date(order.created_at), 'dd/MM/yyyy')}`, 14, 66);
    
    // Bill To
    doc.setFont('helvetica', 'bold');
    doc.text('Bill To:', 14, 76);
    doc.setFont('helvetica', 'normal');
    doc.text(order.delivery_name, 14, 82);
    doc.text(order.delivery_phone, 14, 88);
    
    const addressLines = [
      order.delivery_address_line_1,
      order.delivery_address_line_2,
      `${order.delivery_city}, ${order.delivery_state} - ${order.delivery_pincode}`
    ].filter(Boolean);
    
    let yPos = 94;
    addressLines.forEach(line => {
      doc.text(line, 14, yPos);
      yPos += 6;
    });
    
    // Items Table
    const tableData = order.order_items?.map((item: any) => {
      const variants = [
        item.selected_size ? `Size: ${item.selected_size}` : null,
        item.selected_color ? item.selected_color : null
      ].filter(Boolean).join(', ');

      return [
        item.product_code || '-',
        `${item.product_name}${variants ? `\n(${variants})` : ''}`,
        '-', // HSN (not available for orders)
        item.quantity.toString(),
        `₹${Number(item.unit_price).toFixed(2)}`,
        `₹${Number(item.total_price).toFixed(2)}`
      ];
    }) || [];
    
    autoTable(doc, {
      startY: yPos + 10,
      head: [['Code', 'Description', 'HSN', 'Qty', 'Rate', 'Amount']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [66, 66, 66], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 70 },
        2: { cellWidth: 20 },
        3: { cellWidth: 15 },
        4: { cellWidth: 25 },
        5: { cellWidth: 30 }
      }
    });
    
    // Summary
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    const rightAlign = 196;
    
    doc.text('Subtotal:', rightAlign - 50, finalY, { align: 'right' });
    doc.text(`₹${Number(order.subtotal).toFixed(2)}`, rightAlign, finalY, { align: 'right' });
    
    doc.text('Shipping:', rightAlign - 50, finalY + 6, { align: 'right' });
    doc.text(`₹${Number(order.shipping_charges || 0).toFixed(2)}`, rightAlign, finalY + 6, { align: 'right' });
    
    doc.setFont('helvetica', 'bold');
    doc.text('Total Amount:', rightAlign - 50, finalY + 14, { align: 'right' });
    doc.text(`₹${Number(order.total_amount).toFixed(2)}`, rightAlign, finalY + 14, { align: 'right' });
    
    // Payment Method
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Payment Method: ${order.payment_method.toUpperCase().replace('_', ' ')}`, 14, finalY + 20);
    
    // Footer
    doc.setFontSize(8);
    doc.text('Thank you for your business!', 105, 280, { align: 'center' });
    
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
                <p className="font-medium">{order.profile?.full_name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium break-all">{order.profile?.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{order.profile?.phone || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date of Birth</p>
                <p className="font-medium">
                  {order.profile?.date_of_birth 
                    ? format(new Date(order.profile.date_of_birth), 'PPP')
                    : 'N/A'
                  }
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Gender</p>
                <p className="font-medium capitalize">{order.profile?.gender || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Marital Status</p>
                <p className="font-medium capitalize">
                  {order.profile?.marital_status?.replace('_', ' ') || 'N/A'}
                </p>
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