import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Mail, Phone, MapPin, Users, Package, CheckCircle2, ArrowRight, Briefcase, TrendingUp, Award, Handshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const b2bSchema = z.object({
  businessName: z.string().min(2, "Business name is required").max(100),
  contactPerson: z.string().min(2, "Contact person name is required").max(100),
  email: z.string().email("Please enter a valid email").max(255),
  phone: z.string().min(10, "Please enter a valid phone number").max(15),
  city: z.string().min(2, "City is required").max(100),
  state: z.string().min(1, "Please select a state"),
  businessType: z.string().min(1, "Please select your business type"),
  monthlyRequirement: z.string().min(1, "Please select your monthly requirement"),
  message: z.string().max(1000).optional(),
});

type B2BFormData = z.infer<typeof b2bSchema>;

const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
  "Uttarakhand", "West Bengal", "Delhi", "Puducherry"
];

const BUSINESS_TYPES = [
  { value: "retailer", label: "Retail Store" },
  { value: "wholesaler", label: "Wholesaler / Distributor" },
  { value: "boutique", label: "Boutique / Fashion Store" },
  { value: "ecommerce", label: "E-Commerce Seller" },
  { value: "gym", label: "Gym / Fitness Studio" },
  { value: "corporate", label: "Corporate / Institution" },
  { value: "other", label: "Other" },
];

const MONTHLY_REQUIREMENTS = [
  { value: "100-500", label: "100 - 500 pieces" },
  { value: "500-1000", label: "500 - 1,000 pieces" },
  { value: "1000-5000", label: "1,000 - 5,000 pieces" },
  { value: "5000+", label: "5,000+ pieces" },
];

const BENEFITS = [
  {
    icon: TrendingUp,
    title: "Competitive Margins",
    description: "Factory-direct pricing ensures healthy profit margins for your business"
  },
  {
    icon: Award,
    title: "Premium Quality",
    description: "4-way stretch, moisture-wicking fabrics that customers love"
  },
  {
    icon: Package,
    title: "Flexible MOQ",
    description: "Low minimum order quantities to suit businesses of all sizes"
  },
  {
    icon: Handshake,
    title: "Dedicated Support",
    description: "Personal account manager for seamless ordering experience"
  },
];

const B2BEnquiry = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<B2BFormData>({
    resolver: zodResolver(b2bSchema),
  });

  const onSubmit = async (data: B2BFormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("bulk_order_requests").insert({
        company_name: data.businessName,
        name: data.contactPerson,
        email: data.email,
        phone: data.phone,
        product_interest: `${data.businessType} - ${data.city}, ${data.state}`,
        quantity: parseInt(data.monthlyRequirement.split("-")[0]) || 100,
        requirements: data.message || `Monthly Requirement: ${data.monthlyRequirement}`,
        status: "pending"
      });

      if (error) throw error;

      setIsSuccess(true);
      reset();
      toast({
        title: "Enquiry Submitted!",
        description: "Our team will contact you within 24 hours.",
      });
    } catch (error) {
      console.error("Error submitting enquiry:", error);
      toast({
        title: "Submission Failed",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background">
        <div className="min-h-[80vh] flex items-center justify-center px-4">
          <div className="max-w-lg text-center">
            <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-accent" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Thank You!</h1>
            <p className="text-muted-foreground mb-8">
              Your partnership enquiry has been received. Our business development team will reach out within 24 hours to discuss how we can grow together.
            </p>
            <Button onClick={() => setIsSuccess(false)} className="rounded-none px-8">
              Submit Another Enquiry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-foreground text-background overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-accent rounded-full blur-[150px] -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-accent rounded-full blur-[120px] translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="container mx-auto px-4 py-20 md:py-28 relative z-10">
          <div className="max-w-3xl">
            <p className="text-accent font-medium tracking-[0.3em] mb-4 text-xs uppercase">Business Partnership</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Grow Your Business with{" "}
              <span className="text-accent">Feather</span>
            </h1>
            <p className="text-background/70 text-lg md:text-xl max-w-2xl leading-relaxed">
              Join our network of successful retailers and distributors. Access premium activewear at factory-direct prices and unlock unmatched profit potential.
            </p>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="hsl(var(--background))"/>
          </svg>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-accent font-medium tracking-[0.3em] mb-3 text-xs uppercase">Why Partner With Us</p>
            <h2 className="text-2xl md:text-3xl font-bold">The Feather Advantage</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {BENEFITS.map((benefit, index) => (
              <div 
                key={index}
                className="group p-6 bg-card border border-border/50 hover:border-accent/30 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                  <benefit.icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <p className="text-accent font-medium tracking-[0.3em] mb-3 text-xs uppercase">Get Started</p>
              <h2 className="text-2xl md:text-3xl font-bold mb-3">Partner Enquiry Form</h2>
              <p className="text-muted-foreground max-w-lg mx-auto">
                Fill in your details and our team will get in touch to discuss partnership opportunities.
              </p>
            </div>

            <div className="bg-card border border-border/50 p-8 md:p-10 shadow-sm">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Business Info */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="businessName" className="text-sm font-medium">
                      Business Name <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="businessName"
                        {...register("businessName")}
                        placeholder="Your business name"
                        className="pl-10 h-12 rounded-none border-border focus:border-accent"
                      />
                    </div>
                    {errors.businessName && (
                      <p className="text-xs text-red-500">{errors.businessName.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactPerson" className="text-sm font-medium">
                      Contact Person <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="contactPerson"
                        {...register("contactPerson")}
                        placeholder="Your full name"
                        className="pl-10 h-12 rounded-none border-border focus:border-accent"
                      />
                    </div>
                    {errors.contactPerson && (
                      <p className="text-xs text-red-500">{errors.contactPerson.message}</p>
                    )}
                  </div>
                </div>

                {/* Contact Info */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        {...register("email")}
                        placeholder="business@example.com"
                        className="pl-10 h-12 rounded-none border-border focus:border-accent"
                      />
                    </div>
                    {errors.email && (
                      <p className="text-xs text-red-500">{errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium">
                      Phone <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        {...register("phone")}
                        placeholder="+91 98765 43210"
                        className="pl-10 h-12 rounded-none border-border focus:border-accent"
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-xs text-red-500">{errors.phone.message}</p>
                    )}
                  </div>
                </div>

                {/* Location */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-sm font-medium">
                      City <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="city"
                        {...register("city")}
                        placeholder="Your city"
                        className="pl-10 h-12 rounded-none border-border focus:border-accent"
                      />
                    </div>
                    {errors.city && (
                      <p className="text-xs text-red-500">{errors.city.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      State <span className="text-red-500">*</span>
                    </Label>
                    <Select onValueChange={(value) => setValue("state", value)}>
                      <SelectTrigger className="h-12 rounded-none border-border focus:border-accent bg-background">
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border max-h-60">
                        {STATES.map((state) => (
                          <SelectItem key={state} value={state}>{state}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.state && (
                      <p className="text-xs text-red-500">{errors.state.message}</p>
                    )}
                  </div>
                </div>

                {/* Business Details */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Business Type <span className="text-red-500">*</span>
                    </Label>
                    <Select onValueChange={(value) => setValue("businessType", value)}>
                      <SelectTrigger className="h-12 rounded-none border-border focus:border-accent bg-background">
                        <SelectValue placeholder="Select business type" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        {BUSINESS_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.businessType && (
                      <p className="text-xs text-red-500">{errors.businessType.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Monthly Requirement <span className="text-red-500">*</span>
                    </Label>
                    <Select onValueChange={(value) => setValue("monthlyRequirement", value)}>
                      <SelectTrigger className="h-12 rounded-none border-border focus:border-accent bg-background">
                        <SelectValue placeholder="Select quantity" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        {MONTHLY_REQUIREMENTS.map((req) => (
                          <SelectItem key={req.value} value={req.value}>{req.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.monthlyRequirement && (
                      <p className="text-xs text-red-500">{errors.monthlyRequirement.message}</p>
                    )}
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <Label htmlFor="message" className="text-sm font-medium">
                    Additional Information
                  </Label>
                  <Textarea
                    id="message"
                    {...register("message")}
                    placeholder="Tell us about your business, specific product interests, or any questions..."
                    rows={4}
                    className="rounded-none border-border focus:border-accent resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 rounded-none bg-foreground hover:bg-foreground/90 text-background font-semibold tracking-wide"
                >
                  {isSubmitting ? (
                    "Submitting..."
                  ) : (
                    <>
                      Submit Partnership Enquiry
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-accent font-medium tracking-[0.3em] mb-3 text-xs uppercase">Prefer to Talk?</p>
            <h2 className="text-2xl md:text-3xl font-bold mb-6">Reach Out Directly</h2>
            <div className="flex flex-wrap justify-center gap-8">
              <a 
                href="mailto:hello@featherfashions.in" 
                className="flex items-center gap-3 text-muted-foreground hover:text-accent transition-colors"
              >
                <div className="w-12 h-12 border border-border flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-xs text-muted-foreground/60">Email</p>
                  <p className="font-medium text-foreground">hello@featherfashions.in</p>
                </div>
              </a>
              <a 
                href="tel:+919789225510" 
                className="flex items-center gap-3 text-muted-foreground hover:text-accent transition-colors"
              >
                <div className="w-12 h-12 border border-border flex items-center justify-center">
                  <Phone className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-xs text-muted-foreground/60">Phone</p>
                  <p className="font-medium text-foreground">+91 97892 25510</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default B2BEnquiry;
