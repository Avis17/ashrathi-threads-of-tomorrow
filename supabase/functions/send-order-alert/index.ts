import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderAlert {
  order_id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  items_count: number;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const alert: OrderAlert = await req.json();

    // Fetch admin settings
    const { data: settings } = await supabase
      .from('admin_settings')
      .select('order_alerts_enabled, notification_emails')
      .single();

    if (!settings?.order_alerts_enabled) {
      console.log('Order alerts are disabled');
      return new Response(
        JSON.stringify({ message: 'Alerts disabled' }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const emails = settings.notification_emails || ['info@featherfashions.shop'];

    // Send email alert
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">🎉 New Order Received!</h1>
        </div>
        
        <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
          <p style="color: #374151; font-size: 16px; margin-bottom: 20px;">
            A new order has been placed on Feather Fashions!
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; margin-bottom: 20px;">
            <h2 style="color: #111827; font-size: 20px; margin-top: 0;">Order #${alert.order_number}</h2>
            
            <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Customer:</td>
                <td style="padding: 8px 0; color: #111827; font-weight: 600;">${alert.customer_name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Email:</td>
                <td style="padding: 8px 0; color: #111827;">${alert.customer_email}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Total Items:</td>
                <td style="padding: 8px 0; color: #111827; font-weight: 600;">${alert.items_count} items</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Order Total:</td>
                <td style="padding: 8px 0; color: #10b981; font-weight: 700; font-size: 20px;">₹${alert.total_amount.toFixed(2)}</td>
              </tr>
            </table>
          </div>
          
          <div style="background: #dbeafe; border: 1px solid #3b82f6; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <p style="margin: 0; color: #1e40af; font-size: 14px;">
              <strong>📋 Next Steps:</strong> Review and process this order in your admin dashboard.
            </p>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 20px; text-align: center;">
            This is an automated notification from Feather Fashions.
          </p>
        </div>
      </div>
    `;

    const emailResponse = await resend.emails.send({
      from: "Feather Fashions <hello@featherfashions.in>",
      to: emails,
      subject: `🛍️ New Order #${alert.order_number} - ₹${alert.total_amount.toFixed(2)}`,
      html: emailHtml,
    });

    console.log("Order alert sent:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, emailResponse }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error sending order alert:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
