-- Create buyer followup messages table
CREATE TABLE public.buyer_followup_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.buyer_followup_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access (authenticated users can manage)
CREATE POLICY "Authenticated users can view followup messages" 
ON public.buyer_followup_messages 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create followup messages" 
ON public.buyer_followup_messages 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update followup messages" 
ON public.buyer_followup_messages 
FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete followup messages" 
ON public.buyer_followup_messages 
FOR DELETE 
TO authenticated
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_buyer_followup_messages_updated_at
BEFORE UPDATE ON public.buyer_followup_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default messages
INSERT INTO public.buyer_followup_messages (title, message, category) VALUES
('Introduction Message', 'Hello,
We are Feather Fashions, an export-oriented garment manufacturer from Tiruppur, India, specializing in women''s nightwear, kidswear, and cotton apparel.

We support bulk & private label manufacturing for export markets.

If you are sourcing garments, I''d be happy to understand your requirements and share relevant details.

Website: https://featherfashions.in/', 'introduction'),

('Follow-up After Quote', 'Hello,

I hope you''ve had a chance to review our quotation. We are eager to support your requirements and can adjust pricing for larger quantities.

Would you like to discuss further or need any modifications?

Best regards,
Feather Fashions', 'follow_up'),

('MOQ Inquiry Response', 'Hello,

Thank you for your inquiry!

Our MOQ is typically 500 pieces per style/color. However, for repeat orders and long-term partnerships, we can discuss flexible arrangements.

Please let us know your requirements.

Best regards,
Feather Fashions', 'inquiry'),

('Sample Request Follow-up', 'Hello,

Thank you for showing interest in our products.

We''re happy to send samples at nominal charges (refundable on bulk order). Please share your shipping address and preferred styles.

Looking forward to hearing from you!

Feather Fashions', 'samples'),

('Price Negotiation', 'Hello,

Thank you for your interest in our quotation.

We understand pricing is important. We can offer better rates for:
- Higher quantities
- Long-term commitments
- Multiple style orders

Let''s discuss how we can work together.

Best regards,
Feather Fashions', 'negotiation'),

('Product Catalog Sharing', 'Hello,

Please find our latest product catalog attached. We specialize in:

✅ Women''s Nightwear & Loungewear
✅ Kidswear & Baby Sets
✅ Cotton T-Shirts & Casual Wear
✅ Custom/Private Label Manufacturing

Let us know which categories interest you.

Website: https://featherfashions.in/products

Best regards,
Feather Fashions', 'catalog'),

('Order Confirmation', 'Hello,

Thank you for placing your order with Feather Fashions!

We''ve received your order and our team will begin production shortly. We''ll keep you updated on the progress.

Expected delivery: [X weeks]

For any queries, feel free to reach out.

Best regards,
Feather Fashions', 'order'),

('Production Update', 'Hello,

Quick update on your order:

📦 Production Status: [In Progress / Cutting / Stitching / Finishing]
📅 Expected Completion: [Date]

We''ll share photos before packing for your approval.

Best regards,
Feather Fashions', 'production'),

('Shipping Notification', 'Hello,

Great news! Your order has been shipped.

📦 Shipment Details:
- Tracking Number: [Number]
- Courier/Carrier: [Name]
- Expected Delivery: [Date]

You can track your shipment at: [Tracking Link]

Best regards,
Feather Fashions', 'shipping'),

('Payment Reminder', 'Hello,

This is a gentle reminder regarding the pending payment for Order #[Order Number].

Outstanding Amount: [Amount]
Due Date: [Date]

Please let us know once the payment is processed, or if you need any clarification.

Best regards,
Feather Fashions', 'payment'),

('New Collection Announcement', 'Hello,

We''re excited to share our NEW COLLECTION for the upcoming season!

🌟 Fresh designs in Women''s Nightwear
🌟 Colorful Kidswear Sets
🌟 Premium Cotton T-Shirts

Early orders get priority production slots.

Check it out: https://featherfashions.in/products

Best regards,
Feather Fashions', 'marketing'),

('Thank You Message', 'Hello,

Thank you for choosing Feather Fashions!

We truly appreciate your business and trust in our products. Your feedback helps us improve.

Looking forward to serving you again soon!

Warm regards,
Feather Fashions', 'thanks'),

('Inactive Buyer Re-engagement', 'Hello,

It''s been a while since we connected!

We''ve added new styles and improved our offerings. Would you be interested in our latest catalog?

We''d love to work with you again.

Best regards,
Feather Fashions', 'reengagement'),

('Quality Assurance Message', 'Hello,

At Feather Fashions, quality is our priority:

✅ 100% Cotton & Premium Fabrics
✅ Export-Standard Quality Control
✅ Pre-shipment Inspection Available
✅ Compliance Certifications

Let us know if you need any documentation.

Best regards,
Feather Fashions', 'quality'),

('Custom Order Discussion', 'Hello,

We''re happy to discuss your custom/private label requirements!

Please share:
- Design/Sketch (if any)
- Preferred fabric & GSM
- Size specifications
- Quantity required
- Target price (if any)

We''ll provide a detailed quotation.

Best regards,
Feather Fashions', 'custom'),

('Festival/Holiday Greeting', 'Hello,

Warm greetings from Feather Fashions!

Wishing you and your team a wonderful [Festival/Holiday]!

May this season bring prosperity to your business.

Best regards,
Feather Fashions Team', 'greetings');