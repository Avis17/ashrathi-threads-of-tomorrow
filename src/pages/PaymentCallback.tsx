import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle, AlertCircle, ShoppingBag, Home, RefreshCw } from 'lucide-react';

export default function PaymentCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed' | 'pending'>('loading');
  const [message, setMessage] = useState('Verifying your payment...');
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const orderId = searchParams.get('orderId');

  useEffect(() => {
    const verifyAndFinalizePayment = async () => {
      if (!orderId) {
        setStatus('failed');
        setMessage('Invalid payment callback. Order ID not found.');
        return;
      }

      try {
        // Get order details including items for inventory management
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .select(`
            id,
            order_number, 
            payment_status, 
            phonepe_order_id,
            user_id,
            order_items (
              product_id,
              quantity,
              selected_size,
              selected_color
            )
          `)
          .eq('id', orderId)
          .single();

        if (orderError || !order) {
          throw new Error('Order not found');
        }

        setOrderNumber(order.order_number);

        // If already finalized (paid), show success
        if (order.payment_status === 'paid') {
          setStatus('success');
          setMessage('Payment successful! Your order has been confirmed.');
          return;
        }

        // If already marked as failed or cancelled
        if (order.payment_status === 'failed' || order.payment_status === 'cancelled') {
          setStatus('failed');
          setMessage('Payment failed. Your cart items have been preserved. Please try again.');
          return;
        }

        // Check payment status from PhonePe
        const { data: statusData, error: statusError } = await supabase.functions.invoke(
          'phonepe-payment?action=status',
          {
            body: { merchantOrderId: order.order_number },
          }
        );

        if (statusError) {
          console.error('Status check error:', statusError);
          setStatus('pending');
          setMessage('Unable to verify payment status. Please check your order status or refresh.');
          return;
        }

        const paymentState = statusData?.state;
        const isSuccess = paymentState === 'COMPLETED' || statusData?.code === 'PAYMENT_SUCCESS' || statusData?.paymentStatus === 'paid';
        const isFailed = paymentState === 'FAILED' || statusData?.code === 'PAYMENT_ERROR' || statusData?.code === 'PAYMENT_DECLINED';

        if (isSuccess) {
          // PAYMENT SUCCESS - Finalize the order
          await finalizeOrder(order);
          setStatus('success');
          setMessage('Payment successful! Your order has been confirmed.');
        } else if (isFailed) {
          // PAYMENT FAILED - Cancel the order and release inventory
          await cancelPaymentPendingOrder(order);
          setStatus('failed');
          setMessage('Payment failed. Your cart items have been preserved. Please try again.');
        } else if (paymentState === 'PENDING' || statusData?.code === 'PAYMENT_PENDING') {
          setStatus('pending');
          setMessage('Payment is being processed. You will receive a confirmation shortly.');
        } else {
          setStatus('pending');
          setMessage('Payment status is being verified. Please wait or check your order status.');
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        setStatus('pending');
        setMessage('Unable to verify payment. Please check your order status.');
      }
    };

    verifyAndFinalizePayment();
  }, [orderId, retryCount]);

  // Finalize order after successful payment
  const finalizeOrder = async (order: any) => {
    try {
      // 1. Update order status to confirmed
      await supabase
        .from('orders')
        .update({
          status: 'confirmed',
          payment_status: 'paid',
          updated_at: new Date().toISOString(),
        })
        .eq('id', order.id);

      // 2. Convert reserved inventory to ordered for each item
      for (const item of order.order_items || []) {
        if (item.selected_size && item.selected_color) {
          await supabase.rpc('convert_reserved_to_ordered', {
            p_product_id: item.product_id,
            p_size: item.selected_size,
            p_color: item.selected_color,
            p_quantity: item.quantity,
          });
        }
      }

      // 3. Clear the cart items that were in this order
      await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', order.user_id)
        .eq('selected_for_checkout', true);

      console.log('Order finalized successfully:', order.order_number);
    } catch (error) {
      console.error('Error finalizing order:', error);
      // Don't throw - order is still valid, just log the error
    }
  };

  // Cancel payment-pending order after failed payment
  const cancelPaymentPendingOrder = async (order: any) => {
    try {
      // 1. Update order status to cancelled
      await supabase
        .from('orders')
        .update({
          status: 'cancelled',
          payment_status: 'failed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', order.id);

      // 2. Release reserved inventory back (since it was never converted to ordered)
      for (const item of order.order_items || []) {
        if (item.selected_size && item.selected_color) {
          await supabase.rpc('release_inventory', {
            p_product_id: item.product_id,
            p_size: item.selected_size,
            p_color: item.selected_color,
            p_quantity: item.quantity,
          });
        }
      }

      // 3. Keep cart items intact - user can try again

      console.log('Payment-pending order cancelled:', order.order_number);
    } catch (error) {
      console.error('Error cancelling order:', error);
    }
  };

  const handleRetry = () => {
    setStatus('loading');
    setMessage('Verifying your payment...');
    setRetryCount(prev => prev + 1);
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
            <Loader2 className="w-20 h-20 text-primary animate-spin relative" />
          </div>
        );
      case 'success':
        return (
          <div className="relative">
            <div className="absolute inset-0 bg-green-500/20 rounded-full animate-pulse" />
            <CheckCircle className="w-20 h-20 text-green-500 relative" />
          </div>
        );
      case 'failed':
        return (
          <div className="relative">
            <div className="absolute inset-0 bg-red-500/20 rounded-full" />
            <XCircle className="w-20 h-20 text-red-500 relative" />
          </div>
        );
      case 'pending':
        return (
          <div className="relative">
            <div className="absolute inset-0 bg-amber-500/20 rounded-full animate-pulse" />
            <AlertCircle className="w-20 h-20 text-amber-500 relative" />
          </div>
        );
    }
  };

  const getStatusStyles = () => {
    switch (status) {
      case 'success':
        return {
          bg: 'from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30',
          border: 'border-green-200 dark:border-green-800',
          title: 'text-green-700 dark:text-green-400',
        };
      case 'failed':
        return {
          bg: 'from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30',
          border: 'border-red-200 dark:border-red-800',
          title: 'text-red-700 dark:text-red-400',
        };
      case 'pending':
        return {
          bg: 'from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30',
          border: 'border-amber-200 dark:border-amber-800',
          title: 'text-amber-700 dark:text-amber-400',
        };
      default:
        return {
          bg: 'from-primary/5 to-secondary/5',
          border: 'border-primary/20',
          title: 'text-foreground',
        };
    }
  };

  const styles = getStatusStyles();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 p-4">
      <Card className={`w-full max-w-lg shadow-2xl border-2 ${styles.border} overflow-hidden`}>
        <CardContent className={`p-0`}>
          {/* Premium header strip */}
          <div className={`h-2 bg-gradient-to-r ${status === 'success' ? 'from-green-400 to-emerald-500' : status === 'failed' ? 'from-red-400 to-rose-500' : status === 'pending' ? 'from-amber-400 to-yellow-500' : 'from-primary to-primary/70'}`} />
          
          <div className={`p-8 md:p-10 text-center bg-gradient-to-br ${styles.bg}`}>
            {/* Icon with animation */}
            <div className="flex justify-center mb-8">
              {getStatusIcon()}
            </div>
            
            {/* Status title */}
            <h1 className={`text-3xl font-bold mb-3 ${styles.title}`}>
              {status === 'loading' && 'Processing Payment'}
              {status === 'success' && 'Payment Successful!'}
              {status === 'failed' && 'Payment Failed'}
              {status === 'pending' && 'Payment Pending'}
            </h1>
            
            {/* Order number badge */}
            {orderNumber && (
              <div className="mb-4">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background/80 border text-sm font-medium">
                  <ShoppingBag className="w-4 h-4" />
                  Order #{orderNumber}
                </span>
              </div>
            )}
            
            {/* Message */}
            <p className="text-muted-foreground text-lg mb-8">{message}</p>
            
            {/* Action buttons */}
            {status !== 'loading' && (
              <div className="space-y-3">
                {status === 'success' && (
                  <Button 
                    onClick={() => navigate(`/my-orders/${orderId}`)} 
                    className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
                    size="lg"
                  >
                    <ShoppingBag className="mr-2 h-5 w-5" />
                    View Order Details
                  </Button>
                )}
                
                {status === 'pending' && (
                  <>
                    <Button 
                      onClick={() => navigate(`/my-orders/${orderId}`)} 
                      className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
                      size="lg"
                    >
                      <ShoppingBag className="mr-2 h-5 w-5" />
                      View Order Details
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handleRetry} 
                      className="w-full h-11"
                      size="lg"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Refresh Status
                    </Button>
                  </>
                )}
                
                {status === 'failed' && (
                  <>
                    <Button 
                      onClick={() => navigate('/cart')} 
                      className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
                      size="lg"
                    >
                      <ShoppingBag className="mr-2 h-5 w-5" />
                      Return to Cart
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => navigate('/checkout')} 
                      className="w-full h-11"
                      size="lg"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Try Again
                    </Button>
                  </>
                )}
                
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/')} 
                  className="w-full h-11"
                  size="lg"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Continue Shopping
                </Button>
              </div>
            )}
            
            {/* Security note */}
            {status === 'loading' && (
              <p className="text-xs text-muted-foreground mt-6">
                Please do not close this page while we verify your payment...
              </p>
            )}
          </div>
          
          {/* Footer with branding */}
          <div className="px-6 py-4 bg-muted/30 border-t text-center">
            <p className="text-xs text-muted-foreground">
              Secured by PhonePe • Feather Fashions
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
