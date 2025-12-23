import SEOHead from "@/components/seo/SEOHead";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Zap, DollarSign, Shield, TrendingUp, Users } from "lucide-react";

const WhiteLabelActivewear = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Feather Fashions",
    "url": "https://featherfashions.in",
    "logo": "https://featherfashions.in/logo.png",
    "description": "White label activewear manufacturer in India offering ready styles for leggings, joggers & gym wear with your branding. Fast & scalable production.",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Tirupur",
      "addressRegion": "Tamil Nadu",
      "addressCountry": "IN"
    },
    "serviceType": ["White Label Manufacturing", "Ready-to-Brand Activewear", "Fast Launch Sportswear Production"]
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is white label activewear?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "White label activewear refers to ready-designed sportswear products manufactured by Feather Fashions that you can sell under your own brand name. Unlike private label where you develop custom designs, white label uses our existing proven styles—you simply add your logo, labels, and packaging."
        }
      },
      {
        "@type": "Question",
        "name": "What is the difference between white label and private label?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "White label uses our existing, ready-to-manufacture designs with your branding applied. Private label involves custom design development from scratch. White label is faster and lower cost, while private label offers complete design control. Both options are available at Feather Fashions."
        }
      },
      {
        "@type": "Question",
        "name": "How quickly can I launch with white label?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "White label orders can be delivered in 3-4 weeks after order confirmation, compared to 6-8 weeks for custom private label development. This makes white label ideal for brands that need to launch quickly or test market response before investing in custom designs."
        }
      },
      {
        "@type": "Question",
        "name": "What branding options are available for white label products?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "White label products can be customized with your logo printing (DTF, heat transfer, or embroidery), custom woven labels, printed care labels, branded hang tags, custom packaging, and branded waistband elastics. This ensures your products look and feel like your own brand."
        }
      }
    ]
  };

  const products = [
    { name: "Women's Leggings", desc: "High-waisted, 7/8 length, and pocket styles in 260-280 GSM polyester-spandex. Squat-proof, 4-way stretch, moisture-wicking." },
    { name: "Sports Bras", desc: "Medium and high-impact support options. Removable padding, breathable mesh panels, comfortable band construction." },
    { name: "Men's Joggers & Track Pants", desc: "Tapered and regular fits in 240-280 GSM. Drawstring waist, deep pockets, ribbed cuffs for secure fit." },
    { name: "Gym T-Shirts & Shorts", desc: "Lightweight 160-180 GSM quick-dry fabric. Raglan and regular sleeves, mesh ventilation, athletic cuts." },
    { name: "Kids Activewear Sets", desc: "Durable cotton-spandex blends. Coordinated tops and bottoms, comfortable elastics, vibrant color options." }
  ];

  const processSteps = [
    { step: "1", title: "Choose Styles", desc: "Browse our catalog of proven activewear designs and select styles that match your brand vision." },
    { step: "2", title: "Select Fabric & Color", desc: "Pick from our range of performance fabrics and choose colors from our extensive shade card." },
    { step: "3", title: "Apply Your Branding", desc: "Add your logo, custom labels, hang tags, and packaging to make products uniquely yours." },
    { step: "4", title: "Finalize Sizing", desc: "Confirm size quantities based on your market needs. We offer XS to 4XL across all styles." },
    { step: "5", title: "Bulk Production", desc: "We manufacture your order with consistent quality and strict timelines." },
    { step: "6", title: "Packaging & Dispatch", desc: "Products are packed as per your specifications and dispatched for delivery." }
  ];

  const benefits = [
    { icon: Zap, title: "Faster Time to Market", desc: "Launch in 3-4 weeks instead of months with custom development." },
    { icon: DollarSign, title: "Lower Development Cost", desc: "No design fees or sampling charges—use our ready patterns." },
    { icon: Shield, title: "Consistent Quality", desc: "Proven designs that are already optimized for fit and durability." },
    { icon: TrendingUp, title: "Scalable Production", desc: "Start small, scale fast as your brand grows." },
    { icon: Users, title: "Startup-Friendly MOQ", desc: "Minimum orders from 200-300 pieces per style." }
  ];

  const idealFor = [
    "Gym owners launching branded merchandise",
    "Fitness trainers building personal brands",
    "Online D2C brands entering activewear",
    "Retailers adding private label lines",
    "Export buyers seeking quick turnaround",
    "E-commerce sellers testing new categories"
  ];

  return (
    <>
      <SEOHead
        title="White Label Activewear Manufacturer in India | Feather Fashions"
        description="White label activewear manufacturer in India offering ready styles for leggings, joggers & gym wear with your branding. Fast & scalable."
        canonicalUrl="/white-label-activewear-india"
        keywords="white label activewear India, white label sportswear manufacturer India, ready activewear private branding India, gym wear white label India"
        structuredData={structuredData}
      />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <header className="relative py-20 md:py-28 bg-gradient-to-br from-background via-muted/30 to-background overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(0,144,255,0.15),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(0,144,255,0.1),transparent_40%)]" />
          
          <div className="container mx-auto px-4 relative z-10">
            <Breadcrumbs items={[{ label: "White Label Activewear" }]} />
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground mb-6 leading-tight max-w-4xl">
              White Label <span className="text-neon">Activewear</span> Manufacturer in India
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mb-8">
              Ready-to-brand activewear for faster launches. Add your logo to our proven designs and start selling in weeks, not months.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="bg-neon hover:bg-neon/90 text-black font-bold px-8">
                <Link to="/bulk-order">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/contact">View Catalog</Link>
              </Button>
            </div>
          </div>
        </header>

        {/* Introduction Section */}
        <section className="py-16 md:py-20 bg-muted/20">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
              What is White Label Activewear?
            </h2>
            <div className="prose prose-lg prose-invert max-w-none">
              <p className="text-muted-foreground leading-relaxed mb-6">
                White label activewear is ready-to-manufacture sportswear that comes with your brand identity—your logo, labels, tags, and packaging—without the time and cost of developing custom designs from scratch. At Feather Fashions, we offer a curated catalog of proven activewear styles that you can quickly brand as your own and bring to market.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6">
                This approach is ideal for entrepreneurs and businesses looking to launch an activewear line with minimal risk and faster turnaround. Instead of investing months in design development, sampling, and iteration, you leverage our existing patterns that have already been perfected for fit, comfort, and durability.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Manufactured at our Tirupur facility with export-quality standards, white label products undergo the same rigorous quality control as our custom private label orders. You get the benefit of our manufacturing expertise and established supply chain while building your own brand identity in the competitive activewear market.
              </p>
            </div>
          </div>
        </section>

        {/* Product Range Section */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-center">
              White Label Product Range
            </h2>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              Proven activewear designs ready for your branding
            </p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {products.map((product, index) => (
                <article key={index} className="p-6 bg-muted/30 border border-border rounded-xl hover:border-neon/50 transition-colors">
                  <h3 className="text-xl font-bold text-foreground mb-3">{product.name}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{product.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 md:py-20 bg-muted/20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-center">
              How White Label Works
            </h2>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              Simple 6-step process from selection to delivery
            </p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {processSteps.map((step, index) => (
                <div key={index} className="p-6 bg-background border border-border rounded-xl relative">
                  <div className="absolute -top-3 -left-3 w-10 h-10 bg-neon text-black font-bold rounded-full flex items-center justify-center text-lg">
                    {step.step}
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2 mt-2">{step.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why White Label Section */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12 text-center">
              Why White Label with Feather Fashions
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {benefits.map((item, index) => (
                <div key={index} className="p-6 bg-muted/30 border border-border rounded-xl">
                  <div className="w-12 h-12 bg-neon/10 rounded-lg flex items-center justify-center mb-4">
                    <item.icon className="w-6 h-6 text-neon" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Ideal For Section */}
        <section className="py-16 md:py-20 bg-muted/20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12 text-center">
              Ideal For
            </h2>
            
            <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
              {idealFor.map((client, index) => (
                <div key={index} className="flex items-center gap-2 px-5 py-3 bg-background border border-border rounded-full">
                  <CheckCircle className="w-4 h-4 text-neon flex-shrink-0" />
                  <span className="text-foreground font-medium text-sm">{client}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12 text-center">
              Frequently Asked Questions
            </h2>
            
            <div className="space-y-6">
              <article className="p-6 bg-muted/30 border border-border rounded-xl">
                <h3 className="text-lg font-bold text-foreground mb-3">What is white label activewear?</h3>
                <p className="text-muted-foreground leading-relaxed">
                  White label activewear refers to ready-designed sportswear products manufactured by Feather Fashions that you can sell under your own brand name. Unlike private label where you develop custom designs, white label uses our existing proven styles—you simply add your logo, labels, and packaging.
                </p>
              </article>
              
              <article className="p-6 bg-muted/30 border border-border rounded-xl">
                <h3 className="text-lg font-bold text-foreground mb-3">What is the difference between white label and private label?</h3>
                <p className="text-muted-foreground leading-relaxed">
                  White label uses our existing, ready-to-manufacture designs with your branding applied. Private label involves custom design development from scratch. White label is faster and lower cost, while private label offers complete design control. Both options are available at Feather Fashions.
                </p>
              </article>
              
              <article className="p-6 bg-muted/30 border border-border rounded-xl">
                <h3 className="text-lg font-bold text-foreground mb-3">How quickly can I launch with white label?</h3>
                <p className="text-muted-foreground leading-relaxed">
                  White label orders can be delivered in 3-4 weeks after order confirmation, compared to 6-8 weeks for custom private label development. This makes white label ideal for brands that need to launch quickly or test market response before investing in custom designs.
                </p>
              </article>
              
              <article className="p-6 bg-muted/30 border border-border rounded-xl">
                <h3 className="text-lg font-bold text-foreground mb-3">What branding options are available for white label products?</h3>
                <p className="text-muted-foreground leading-relaxed">
                  White label products can be customized with your logo printing (DTF, heat transfer, or embroidery), custom woven labels, printed care labels, branded hang tags, custom packaging, and branded waistband elastics. This ensures your products look and feel like your own brand.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-28 bg-gradient-to-br from-neon/10 via-background to-neon/5">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Launch Your White Label Activewear Brand Faster
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Skip the design phase and go straight to market. Our ready-to-brand activewear gets you selling in weeks.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" className="bg-neon hover:bg-neon/90 text-black font-bold px-10 py-6 text-lg">
                <Link to="/bulk-order">
                  Start Your Order
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="px-10 py-6 text-lg">
                <Link to="/contact">Request Catalog</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Internal Links Footer */}
        <nav className="py-12 bg-muted/30 border-t border-border" aria-label="Related pages">
          <div className="container mx-auto px-4">
            <h3 className="text-lg font-bold text-foreground mb-6 text-center">Explore More Manufacturing Options</h3>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/private-label-activewear-india" className="text-muted-foreground hover:text-neon transition-colors">Private Label Manufacturing</Link>
              <span className="text-muted-foreground">•</span>
              <Link to="/custom-sportswear-manufacturer-india" className="text-muted-foreground hover:text-neon transition-colors">Custom Sportswear</Link>
              <span className="text-muted-foreground">•</span>
              <Link to="/low-moq-garment-manufacturer-india" className="text-muted-foreground hover:text-neon transition-colors">Low MOQ Manufacturing</Link>
              <span className="text-muted-foreground">•</span>
              <Link to="/contact" className="text-muted-foreground hover:text-neon transition-colors">Contact Us</Link>
            </div>
          </div>
        </nav>
      </div>
    </>
  );
};

export default WhiteLabelActivewear;
