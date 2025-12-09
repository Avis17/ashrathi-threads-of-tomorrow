import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function PaymentCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed' | 'pending'>('loading');
  const [message, setMessage] = useState('Verifying your payment...');
  const orderId = searchParams.get('orderId');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!orderId) {
        setStatus('failed');
        setMessage('Invalid payment callback. Order ID not found.');
        return;
      }

      try {
        // Get order details
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .select('order_number, payment_status, phonepe_order_id')
          .eq('id', orderId)
          .single();

        if (orderError || !order) {
          throw new Error('Order not found');
        }

        // Check payment status from PhonePe
        const { data: statusData, error: statusError } = await supabase.functions.invoke(
          'phonepe-payment',
          {
            body: { merchantOrderId: order.order_number },
            headers: { 'Content-Type': 'application/json' },
          }
        );

        if (statusError) {
          console.error('Status check error:', statusError);
          setStatus('pending');
          setMessage('Unable to verify payment status. Please check your order status.');
          return;
        }

        if (statusData?.state === 'COMPLETED' || statusData?.paymentStatus === 'paid') {
          setStatus('success');
          setMessage('Payment successful! Your order has been confirmed.');
        } else if (statusData?.state === 'FAILED') {
          setStatus('failed');
          setMessage('Payment failed. Please try again or choose a different payment method.');
        } else {
          setStatus('pending');
          setMessage('Payment is being processed. You will receive a confirmation shortly.');
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        setStatus('pending');
        setMessage('Unable to verify payment. Please check your order status.');
      }
    };

    verifyPayment();
  }, [orderId]);

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="w-16 h-16 text-primary animate-spin" />;
      case 'success':
        return <CheckCircle className="w-16 h-16 text-green-500" />;
      case 'failed':
        return <XCircle className="w-16 h-16 text-red-500" />;
      case 'pending':
        return <AlertCircle className="w-16 h-16 text-amber-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20';
      case 'failed':
        return 'from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20';
      case 'pending':
        return 'from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20';
      default:
        return 'from-primary/5 to-secondary/5';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardContent className={`p-8 text-center bg-gradient-to-br ${getStatusColor()} rounded-lg`}>
          <div className="flex justify-center mb-6">
            {getStatusIcon()}
          </div>
          
          <h1 className="text-2xl font-bold mb-2">
            {status === 'loading' && 'Processing Payment'}
            {status === 'success' && 'Payment Successful!'}
            {status === 'failed' && 'Payment Failed'}
            {status === 'pending' && 'Payment Pending'}
          </h1>
          
          <p className="text-muted-foreground mb-6">{message}</p>
          
          {status !== 'loading' && (
            <div className="space-y-3">
              <Button 
                onClick={() => navigate(`/my-orders/${orderId}`)} 
                className="w-full"
              >
                View Order Details
              </Button>
              
              {status === 'failed' && (
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/checkout')} 
                  className="w-full"
                >
                  Try Again
                </Button>
              )}
              
              <Button 
                variant="ghost" 
                onClick={() => navigate('/')} 
                className="w-full"
              >
                Continue Shopping
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
