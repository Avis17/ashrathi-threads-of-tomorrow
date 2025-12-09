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

// PhonePe API endpoints (UAT/Sandbox)
const PHONEPE_BASE_URL = 'https://api-preprod.phonepe.com/apis/pg-sandbox';

interface PaymentRequest {
  orderId: string;
  amount: number;
  redirectUrl: string;
  userId: string;
}

interface StatusCheckRequest {
  merchantOrderId: string;
}

// Generate OAuth token for PhonePe API
async function getAccessToken(): Promise<string> {
  console.log('Getting PhonePe access token...');
  
  const tokenUrl = `${PHONEPE_BASE_URL}/v1/oauth/token`;
  
  // PhonePe requires client_id, client_secret, client_version in form body
  const formData = new URLSearchParams();
  formData.append('client_id', PHONEPE_CLIENT_ID!);
  formData.append('client_secret', PHONEPE_CLIENT_SECRET!);
  formData.append('client_version', '1');
  formData.append('grant_type', 'client_credentials');
  
  console.log('Token request URL:', tokenUrl);
  
  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData.toString(),
  });
  
  const responseText = await response.text();
  console.log('Token response:', responseText);
  
  if (!response.ok) {
    console.error('Token error:', responseText);
    throw new Error(`Failed to get access token: ${response.status} - ${responseText}`);
  }
  
  const data = JSON.parse(responseText);
  console.log('Access token obtained successfully');
  return data.access_token;
}

// Create payment order
async function createPayment(payload: PaymentRequest, accessToken: string) {
  console.log('Creating PhonePe payment for order:', payload.orderId);
  
  const paymentUrl = `${PHONEPE_BASE_URL}/checkout/v2/pay`;
  
  const requestBody = {
    merchantOrderId: payload.orderId,
    amount: Math.round(payload.amount * 100), // Convert to paise
    expireAfter: 1200, // 20 minutes
    paymentFlow: {
      type: "PG_CHECKOUT",
      message: `Payment for Order ${payload.orderId}`,
      merchantUrls: {
        redirectUrl: payload.redirectUrl,
      },
    },
    metaInfo: {
      udf1: payload.userId,
      udf2: payload.orderId,
    },
  };
  
  console.log('Payment request body:', JSON.stringify(requestBody));
  
  const response = await fetch(paymentUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `O-Bearer ${accessToken}`,
    },
    body: JSON.stringify(requestBody),
  });
  
  const responseText = await response.text();
  console.log('PhonePe create payment response:', responseText);
  
  if (!response.ok) {
    throw new Error(`Payment creation failed: ${response.status} - ${responseText}`);
  }
  
  return JSON.parse(responseText);
}

// Check payment status
async function checkPaymentStatus(merchantOrderId: string, accessToken: string) {
  console.log('Checking payment status for:', merchantOrderId);
  
  const statusUrl = `${PHONEPE_BASE_URL}/checkout/v2/order/${merchantOrderId}/status`;
  
  const response = await fetch(statusUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `O-Bearer ${accessToken}`,
    },
  });
  
  const responseText = await response.text();
  console.log('PhonePe status response:', responseText);
  
  if (!response.ok) {
    throw new Error(`Status check failed: ${response.status} - ${responseText}`);
  }
  
  return JSON.parse(responseText);
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
    
    // Get access token
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
      if (statusResponse.state === 'COMPLETED') {
        paymentStatus = 'paid';
      } else if (statusResponse.state === 'FAILED') {
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
        paymentStatus,
        transactionId: statusResponse.transactionId,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
      
    } else {
      throw new Error('Invalid action. Use ?action=create or ?action=status');
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
