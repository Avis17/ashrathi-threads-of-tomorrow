import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface LowStockAlert {
  product_id: string;
  product_name: string;
  size: string;
  color: string;
  available_quantity: number;
  threshold: number;
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

    const alert: LowStockAlert = await req.json();

    // Fetch admin settings
    const { data: settings } = await supabase
      .from('admin_settings')
      .select('low_stock_alerts_enabled, notification_emails')
      .single();

    if (!settings?.low_stock_alerts_enabled) {
      console.log('Low stock alerts are disabled');
      return new Response(
        JSON.stringify({ message: 'Alerts disabled' }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const emails = settings.notification_emails || ['info@featherfashions.shop'];

    // Send email alert
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">⚠️ Low Stock Alert</h1>
        </div>
        
        <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
          <p style="color: #374151; font-size: 16px; margin-bottom: 20px;">
            A product has dropped below the stock threshold!
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #ef4444; margin-bottom: 20px;">
            <h2 style="color: #111827; font-size: 18px; margin-top: 0;">${alert.product_name}</h2>
            
            <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Size:</td>
                <td style="padding: 8px 0; color: #111827; font-weight: 600;">${alert.size}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Color:</td>
                <td style="padding: 8px 0; color: #111827; font-weight: 600;">${alert.color}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Current Stock:</td>
                <td style="padding: 8px 0; color: #ef4444; font-weight: 600; font-size: 18px;">${alert.available_quantity} pieces</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Threshold:</td>
                <td style="padding: 8px 0; color: #111827;">${alert.threshold} pieces</td>
              </tr>
            </table>
          </div>
          
          <div style="background: #fef3c7; border: 1px solid #fbbf24; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <p style="margin: 0; color: #92400e; font-size: 14px;">
              <strong>⏰ Action Required:</strong> Please restock this item soon to avoid running out.
            </p>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
            This is an automated alert from Feather Fashions inventory management system.
          </p>
        </div>
      </div>
    `;

    const emailResponse = await resend.emails.send({
      from: "Feather Fashions <hello@featherfashions.in>",
      to: emails,
      subject: `🚨 Low Stock Alert: ${alert.product_name} (${alert.size}/${alert.color})`,
      html: emailHtml,
    });

    console.log("Low stock alert sent:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, emailResponse }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error sending low stock alert:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
