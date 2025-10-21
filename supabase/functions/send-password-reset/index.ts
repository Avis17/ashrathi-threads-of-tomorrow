import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PasswordResetRequest {
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: PasswordResetRequest = await req.json();

    console.log("Processing password reset request for:", email);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Generate password reset link
    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: email,
    });

    if (error) {
      console.error("Error generating reset link:", error);
      throw error;
    }

    console.log("Reset link generated successfully");

    // Send email with custom domain
    const emailResponse = await resend.emails.send({
      from: "Feather Fashions <info@featherfashions.shop>",
      to: [email],
      subject: "Reset Your Password - Feather Fashions",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; background-color: #f9fafb; margin: 0; padding: 0;">
            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
              <div style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); padding: 40px;">
                <div style="text-align: center; margin-bottom: 30px;">
                  <h1 style="color: #1f2937; margin: 0; font-size: 28px; font-weight: bold;">Password Reset</h1>
                </div>
                
                <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                  Hello,
                </p>
                
                <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                  We received a request to reset your password for your Feather Fashions account. Click the button below to create a new password:
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${data.properties.action_link}" 
                     style="background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: 600; font-size: 16px; display: inline-block;">
                    Reset Password
                  </a>
                </div>
                
                <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin-top: 30px; margin-bottom: 10px;">
                  This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
                </p>
                
                <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin-bottom: 30px;">
                  If the button doesn't work, copy and paste this link into your browser:
                </p>
                
                <p style="background-color: #f3f4f6; padding: 12px; border-radius: 4px; word-break: break-all; font-size: 12px; color: #4b5563; margin-bottom: 30px;">
                  ${data.properties.action_link}
                </p>
                
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                
                <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
                  © ${new Date().getFullYear()} Feather Fashions. All rights reserved.
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Password reset email sent successfully" 
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-password-reset function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
