import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { z } from 'zod';
import { Package, Truck, BadgePercent, ShieldCheck, Users, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const bulkOrderSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email address').max(255, 'Email too long'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').max(15, 'Phone too long'),
  productInterest: z.string().min(1, 'Product interest is required').max(500, 'Too long'),
  quantity: z.number().min(50, 'Minimum order quantity is 50 pieces'),
});

const benefits = [
  {
    icon: BadgePercent,
    title: "Wholesale Pricing",
    description: "Unlock exclusive bulk discounts starting from 50+ pieces"
  },
  {
    icon: Package,
    title: "Custom Packaging",
    description: "Personalized packaging solutions for your brand"
  },
  {
    icon: Truck,
    title: "Priority Shipping",
    description: "Fast, reliable delivery across India with tracking"
  },
  {
    icon: ShieldCheck,
    title: "Quality Assurance",
    description: "Every piece inspected to meet premium standards"
  },
  {
    icon: Users,
    title: "Dedicated Support",
    description: "Personal account manager for your orders"
  },
  {
    icon: Clock,
    title: "Quick Turnaround",
    description: "Fast production with on-time delivery guarantee"
  }
];

const orderSteps = [
  { step: "01", title: "Submit Request", description: "Fill out the form with your requirements" },
  { step: "02", title: "Get Quote", description: "Receive customized pricing within 24 hours" },
  { step: "03", title: "Confirm Order", description: "Review samples and finalize your order" },
  { step: "04", title: "Receive Delivery", description: "Get your order delivered on schedule" },
];

const BulkOrder = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    companyName: '',
    productInterest: '',
    quantity: '',
    requirements: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      bulkOrderSchema.parse({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        productInterest: formData.productInterest,
        quantity: parseInt(formData.quantity),
      });

      const { error } = await supabase.from('bulk_order_requests').insert([
        {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          company_name: formData.companyName || null,
          product_interest: formData.productInterest,
          quantity: parseInt(formData.quantity),
          requirements: formData.requirements || null,
        },
      ]);

      if (error) throw error;

      // Send email notification
      const { error: emailError } = await supabase.functions.invoke('send-contact-notification', {
        body: {
          type: 'bulk_order',
          data: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            company_name: formData.companyName,
            product_interest: formData.productInterest,
            quantity: parseInt(formData.quantity),
            requirements: formData.requirements,
          }
        }
      });

      if (emailError) {
        console.error('Email notification error:', emailError);
      }

      toast.success('Bulk order request submitted successfully! We\'ll get back to you within 24 hours.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        companyName: '',
        productInterest: '',
        quantity: '',
        requirements: '',
      });
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative bg-primary text-primary-foreground py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--primary-foreground)/0.03)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary-foreground)/0.03)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-block text-accent text-sm font-medium tracking-[0.2em] uppercase mb-4">
              Bulk Orders
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight mb-6">
              Wholesale <span className="text-accent">Pricing</span> for
              <br />Premium Activewear
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/70 font-light leading-relaxed">
              Partner with Feather for bulk orders. Enjoy factory-direct pricing, 
              custom packaging, and dedicated support for orders of 50+ pieces.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 md:py-24 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-accent text-sm font-medium tracking-[0.2em] uppercase">Why Choose Us</span>
            <h2 className="text-3xl md:text-4xl font-light mt-4 tracking-tight">Bulk Order Benefits</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div 
                key={index} 
                className="group bg-background p-8 border border-border/50 hover:border-accent/30 transition-all duration-300"
              >
                <div className="w-12 h-12 border border-accent/30 flex items-center justify-center mb-6 group-hover:bg-accent/10 transition-colors">
                  <benefit.icon className="h-5 w-5 text-accent" />
                </div>
                <h3 className="text-lg font-medium mb-3 tracking-wide">{benefit.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 md:py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-accent text-sm font-medium tracking-[0.2em] uppercase">Process</span>
            <h2 className="text-3xl md:text-4xl font-light mt-4 tracking-tight">How It Works</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {orderSteps.map((step, index) => (
              <div key={index} className="text-center relative">
                <div className="text-5xl font-light text-accent/20 mb-4">{step.step}</div>
                <h3 className="text-lg font-medium mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.description}</p>
                {index < orderSteps.length - 1 && (
                  <ArrowRight className="hidden lg:block absolute top-8 -right-4 h-5 w-5 text-accent/30" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-20 md:py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Left - Info */}
            <div>
              <span className="text-accent text-sm font-medium tracking-[0.2em] uppercase">Get Started</span>
              <h2 className="text-3xl md:text-4xl font-light mt-4 mb-6 tracking-tight">
                Request Your Bulk Order Quote
              </h2>
              <p className="text-primary-foreground/70 text-lg leading-relaxed mb-8">
                Fill out the form and our wholesale team will provide you with a customized quote 
                based on your requirements within 24 hours.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-accent" />
                  <span className="text-primary-foreground/80">Minimum order: 50 pieces</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-accent" />
                  <span className="text-primary-foreground/80">Custom branding available</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-accent" />
                  <span className="text-primary-foreground/80">Sample orders available</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-accent" />
                  <span className="text-primary-foreground/80">Flexible payment terms</span>
                </div>
              </div>

              <div className="p-6 bg-primary-foreground/5 border border-primary-foreground/10">
                <p className="text-sm text-primary-foreground/60 mb-2">Need immediate assistance?</p>
                <a href="tel:+919789225510" className="text-accent hover:underline text-lg font-medium">
                  +91 9789225510
                </a>
              </div>
            </div>

            {/* Right - Form */}
            <div className="bg-background text-foreground p-8 md:p-10">
              <h3 className="text-xl font-medium mb-6">Bulk Order Enquiry</h3>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">Full Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="h-11 border-border/50 focus:border-accent"
                      placeholder="Your name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">Email Address *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="h-11 border-border/50 focus:border-accent"
                      placeholder="you@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium">Phone Number *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="h-11 border-border/50 focus:border-accent"
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyName" className="text-sm font-medium">Company / Store Name</Label>
                    <Input
                      id="companyName"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      className="h-11 border-border/50 focus:border-accent"
                      placeholder="Your business name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="productInterest" className="text-sm font-medium">Product Interest *</Label>
                    <Input
                      id="productInterest"
                      name="productInterest"
                      placeholder="e.g., Leggings, Track Pants"
                      value={formData.productInterest}
                      onChange={handleChange}
                      required
                      className="h-11 border-border/50 focus:border-accent"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantity" className="text-sm font-medium">Quantity (Min. 50) *</Label>
                    <Input
                      id="quantity"
                      name="quantity"
                      type="number"
                      min="50"
                      value={formData.quantity}
                      onChange={handleChange}
                      required
                      className="h-11 border-border/50 focus:border-accent"
                      placeholder="Enter quantity"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="requirements" className="text-sm font-medium">Additional Requirements</Label>
                  <Textarea
                    id="requirements"
                    name="requirements"
                    rows={4}
                    placeholder="Tell us about sizes, colors, custom branding needs, delivery timeline..."
                    value={formData.requirements}
                    onChange={handleChange}
                    className="border-border/50 focus:border-accent resize-none"
                  />
                </div>
                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full h-12 bg-accent hover:bg-accent/90 text-accent-foreground font-medium tracking-wide" 
                  disabled={loading}
                >
                  {loading ? 'Submitting...' : 'Submit Bulk Order Request'}
                  {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  By submitting, you agree to our terms. We'll respond within 24 hours.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default BulkOrder;