import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContactNotificationRequest {
  type: "contact" | "bulk_order";
  data: {
    name: string;
    email: string;
    phone?: string;
    message?: string;
    company_name?: string;
    product_interest?: string;
    quantity?: number;
    requirements?: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, data }: ContactNotificationRequest = await req.json();

    let subject = "";
    let htmlContent = "";

    if (type === "contact") {
      subject = `New Contact Form Submission from ${data.name}`;
      htmlContent = `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Phone:</strong> ${data.phone || 'Not provided'}</p>
        <p><strong>Message:</strong></p>
        <p>${data.message}</p>
      `;
    } else if (type === "bulk_order") {
      subject = `New Bulk Order Request from ${data.name}`;
      htmlContent = `
        <h2>New Bulk Order Request</h2>
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Phone:</strong> ${data.phone || 'Not provided'}</p>
        <p><strong>Company:</strong> ${data.company_name || 'Not provided'}</p>
        <p><strong>Product Interest:</strong> ${data.product_interest}</p>
        <p><strong>Quantity:</strong> ${data.quantity}</p>
        <p><strong>Requirements:</strong></p>
        <p>${data.requirements || 'None specified'}</p>
      `;
    }

    const emailResponse = await resend.emails.send({
      from: "Feather Fashions <hello@featherfashions.in>",
      to: ["hello@featherfashions.in"],
      subject: subject,
      html: htmlContent,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-contact-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
