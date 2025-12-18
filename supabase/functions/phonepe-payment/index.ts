import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PHONEPE_CLIENT_ID = Deno.env.get('PHONEPE_CLIENT_ID');
const PHONEPE_CLIENT_SECRET = Deno.env.get('PHONEPE_CLIENT_SECRET');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

// PhonePe Production API endpoint
const PHONEPE_BASE_URL = 'https://api.phonepe.com/apis/hermes';

interface PaymentRequest {
  orderId: string;
  amount: number;
  redirectUrl: string;
  userId: string;
  customerPhone?: string;
  customerEmail?: string;
}

interface StatusCheckRequest {
  merchantOrderId: string;
}

// Token cache to avoid repeated token requests
let cachedToken: { token: string; expiresAt: number } | null = null;

// Generate OAuth token for PhonePe API with caching
async function getAccessToken(): Promise<string> {
  // Check if we have a valid cached token
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    console.log('Using cached access token');
    return cachedToken.token;
  }
  
  console.log('Getting new PhonePe access token...');
  
  const tokenUrl = `${PHONEPE_BASE_URL}/v1/oauth/token`;
  
  const formData = new URLSearchParams();
  formData.append('client_id', PHONEPE_CLIENT_ID!);
  formData.append('client_secret', PHONEPE_CLIENT_SECRET!);
  formData.append('client_version', '1');
  formData.append('grant_type', 'client_credentials');
  
  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData.toString(),
  });
  
  const responseText = await response.text();
  
  if (!response.ok) {
    console.error('Token error:', responseText);
    throw new Error(`Failed to get access token: ${response.status} - ${responseText}`);
  }
  
  const data = JSON.parse(responseText);
  
  // Cache the token (expires in ~15 minutes, we'll use 14 to be safe)
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (14 * 60 * 1000),
  };
  
  console.log('Access token obtained and cached successfully');
  return data.access_token;
}

// Create payment order
async function createPayment(payload: PaymentRequest, accessToken: string) {
  console.log('Creating PhonePe payment for order:', payload.orderId);
  
  const paymentUrl = `${PHONEPE_BASE_URL}/pg/v1/pay`;
  
  const requestBody = {
    merchantId: PHONEPE_CLIENT_ID,
    merchantOrderId: payload.orderId,
    amount: Math.round(payload.amount * 100), // Convert to paise
    expireAfter: 1800, // 30 minutes
    metaInfo: {
      udf1: payload.userId,
      udf2: payload.orderId,
      udf3: payload.customerPhone || '',
      udf4: payload.customerEmail || '',
    },
    paymentFlow: {
      type: "PG_CHECKOUT",
      message: `Payment for Order #${payload.orderId}`,
      merchantUrls: {
        redirectUrl: payload.redirectUrl,
        callbackUrl: `${SUPABASE_URL}/functions/v1/phonepe-payment?action=webhook`,
      },
    },
  };
  
  console.log('Payment request to PhonePe...');
  
  const response = await fetch(paymentUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `O-Bearer ${accessToken}`,
    },
    body: JSON.stringify(requestBody),
  });
  
  const responseText = await response.text();
  console.log('PhonePe create payment response status:', response.status);
  
  if (!response.ok) {
    console.error('Payment creation failed:', responseText);
    throw new Error(`Payment creation failed: ${response.status} - ${responseText}`);
  }
  
  const result = JSON.parse(responseText);
  console.log('Payment created successfully, orderId:', result.orderId);
  return result;
}

// Check payment status
async function checkPaymentStatus(merchantOrderId: string, accessToken: string) {
  console.log('Checking payment status for:', merchantOrderId);
  
  const statusUrl = `${PHONEPE_BASE_URL}/pg/v1/status/${PHONEPE_CLIENT_ID}/${merchantOrderId}`;
  
  const response = await fetch(statusUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `O-Bearer ${accessToken}`,
    },
  });
  
  const responseText = await response.text();
  console.log('PhonePe status response status:', response.status);
  
  if (!response.ok) {
    console.error('Status check failed:', responseText);
    throw new Error(`Status check failed: ${response.status} - ${responseText}`);
  }
  
  return JSON.parse(responseText);
}

// Handle webhook callback from PhonePe
async function handleWebhook(req: Request) {
  console.log('Processing PhonePe webhook...');
  
  const body = await req.text();
  console.log('Webhook payload received');
  
  try {
    const webhookData = JSON.parse(body);
    
    const merchantOrderId = webhookData.merchantOrderId || webhookData.data?.merchantOrderId;
    const transactionId = webhookData.transactionId || webhookData.data?.transactionId;
    const state = webhookData.state || webhookData.data?.state;
    const code = webhookData.code || webhookData.data?.code;
    
    console.log('Webhook data - OrderId:', merchantOrderId, 'State:', state, 'Code:', code);
    
    if (!merchantOrderId) {
      console.error('No merchantOrderId in webhook');
      return new Response(JSON.stringify({ success: false, message: 'Missing merchantOrderId' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Determine payment status
    let paymentStatus = 'pending';
    if (state === 'COMPLETED' || code === 'PAYMENT_SUCCESS') {
      paymentStatus = 'paid';
    } else if (state === 'FAILED' || code === 'PAYMENT_ERROR' || code === 'PAYMENT_DECLINED') {
      paymentStatus = 'failed';
    } else if (state === 'CANCELLED' || code === 'PAYMENT_CANCELLED') {
      paymentStatus = 'cancelled';
    }
    
    console.log('Updating order with payment status:', paymentStatus);
    
    // Update order in database using service role for webhook
    const adminSupabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    
    const { error: updateError } = await adminSupabase
      .from('orders')
      .update({
        payment_status: paymentStatus,
        phonepe_transaction_id: transactionId || null,
        updated_at: new Date().toISOString(),
      })
      .eq('order_number', merchantOrderId);
    
    if (updateError) {
      console.error('Failed to update order from webhook:', updateError);
      return new Response(JSON.stringify({ success: false, message: 'Database update failed' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    console.log('Order updated successfully from webhook');
    
    return new Response(JSON.stringify({ success: true, message: 'Webhook processed' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Webhook processing error:', error);
    return new Response(JSON.stringify({ success: false, message: 'Webhook processing failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action');
    
    if (!PHONEPE_CLIENT_ID || !PHONEPE_CLIENT_SECRET) {
      throw new Error('PhonePe credentials not configured');
    }
    
    const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);
    
    // Handle webhook separately (no auth needed, comes from PhonePe)
    if (action === 'webhook') {
      return await handleWebhook(req);
    }
    
    // Get access token for other actions
    const accessToken = await getAccessToken();
    
    if (action === 'create') {
      // Create payment
      const body: PaymentRequest = await req.json();
      
      if (!body.orderId || !body.amount || !body.redirectUrl) {
        throw new Error('Missing required fields: orderId, amount, redirectUrl');
      }
      
      const paymentResponse = await createPayment(body, accessToken);
      
      // Store PhonePe order ID in our database
      if (paymentResponse.orderId) {
        const { error: updateError } = await supabase
          .from('orders')
          .update({
            phonepe_order_id: paymentResponse.orderId,
            payment_method: 'phonepe',
            payment_status: 'pending',
          })
          .eq('order_number', body.orderId);
        
        if (updateError) {
          console.error('Failed to update order with PhonePe ID:', updateError);
        }
      }
      
      return new Response(JSON.stringify({
        success: true,
        redirectUrl: paymentResponse.redirectUrl,
        orderId: paymentResponse.orderId,
        checkoutUrl: paymentResponse.instrumentResponse?.redirectInfo?.url,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
      
    } else if (action === 'status') {
      // Check payment status
      const body: StatusCheckRequest = await req.json();
      
      if (!body.merchantOrderId) {
        throw new Error('Missing merchantOrderId');
      }
      
      const statusResponse = await checkPaymentStatus(body.merchantOrderId, accessToken);
      
      // Update order payment status in database
      let paymentStatus = 'pending';
      if (statusResponse.state === 'COMPLETED' || statusResponse.code === 'PAYMENT_SUCCESS') {
        paymentStatus = 'paid';
      } else if (statusResponse.state === 'FAILED' || statusResponse.code === 'PAYMENT_ERROR') {
        paymentStatus = 'failed';
      }
      
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          payment_status: paymentStatus,
          phonepe_transaction_id: statusResponse.transactionId || null,
        })
        .eq('order_number', body.merchantOrderId);
      
      if (updateError) {
        console.error('Failed to update payment status:', updateError);
      }
      
      return new Response(JSON.stringify({
        success: true,
        state: statusResponse.state,
        code: statusResponse.code,
        paymentStatus,
        transactionId: statusResponse.transactionId,
        amount: statusResponse.amount,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
      
    } else {
      throw new Error('Invalid action. Use ?action=create, ?action=status, or ?action=webhook');
    }
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('PhonePe payment error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: errorMessage,
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
