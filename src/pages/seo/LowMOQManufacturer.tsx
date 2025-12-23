import SEOHead from "@/components/seo/SEOHead";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Rocket, ShieldCheck, TrendingUp, Eye, Layers } from "lucide-react";

const LowMOQManufacturer = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Feather Fashions",
    "url": "https://featherfashions.in",
    "logo": "https://featherfashions.in/logo.png",
    "description": "Low MOQ garment manufacturer in India supporting startups with leggings, sportswear & activewear manufacturing from Tirupur.",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Tirupur",
      "addressRegion": "Tamil Nadu",
      "addressCountry": "IN"
    },
    "serviceType": ["Low MOQ Manufacturing", "Startup Garment Production", "Small Batch Clothing"]
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is the minimum order quantity at Feather Fashions?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Our minimum order quantities start from 200-300 pieces per style for activewear and sportswear. For basic styles with existing patterns, we can sometimes accommodate orders as low as 150 pieces. MOQ varies based on product complexity and customization requirements."
        }
      },
      {
        "@type": "Question",
        "name": "Can I order samples before placing a bulk order?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, we offer sampling services for all our products. Sample orders of 5-10 pieces can be produced for quality and fit verification before committing to bulk production. Sample costs are adjusted against your first bulk order."
        }
      },
      {
        "@type": "Question",
        "name": "Is low MOQ manufacturing more expensive per piece?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Low MOQ orders have slightly higher per-piece costs compared to bulk orders due to setup and production efficiencies. However, we keep our pricing competitive to support startup growth. As your order quantities increase, per-piece costs decrease significantly."
        }
      },
      {
        "@type": "Question",
        "name": "How do I scale up after my first low MOQ order?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Scaling is seamless with Feather Fashions. We retain your specifications, patterns, and preferences from initial orders. Repeat orders can be placed with the same or increased quantities, and you'll benefit from improved pricing at higher volumes."
        }
      }
    ]
  };

  const products = [
    { name: "Women's Leggings", moq: "200 pcs", desc: "High-waisted, 7/8 length, pocket styles. Premium 260-280 GSM fabric." },
    { name: "Sports Bras", moq: "200 pcs", desc: "Medium and high impact support. Multiple cup size options available." },
    { name: "Men's Joggers & T-Shirts", moq: "250 pcs", desc: "Tapered joggers, round neck and polo t-shirts in various fabrics." },
    { name: "Kids Activewear", moq: "300 pcs", desc: "Sets, individual pieces, school sports uniforms. Durable cotton blends." },
    { name: "Innerwear & Athleisure", moq: "300 pcs", desc: "Briefs, boxers, vests, casual athleisure essentials." }
  ];

  const idealFor = [
    { title: "Startup Clothing Brands", desc: "Launch your first collection without massive inventory investment" },
    { title: "New D2C Brands", desc: "Test your market and validate product-market fit affordably" },
    { title: "Instagram Sellers", desc: "Build your catalog with curated, quality pieces" },
    { title: "Gym Owners", desc: "Create branded merchandise for your fitness community" },
    { title: "Trial Collections", desc: "Test new designs before committing to large-scale production" }
  ];

  const benefits = [
    { icon: ShieldCheck, title: "Low Risk Entry", desc: "Test your market without overcommitting capital to large inventory." },
    { icon: Layers, title: "Sampling Support", desc: "Get pre-production samples to verify quality and fit before bulk orders." },
    { icon: CheckCircle, title: "Consistent Quality", desc: "Same export-quality standards whether you order 200 or 20,000 pieces." },
    { icon: TrendingUp, title: "Easy Scale-Up", desc: "Seamless transition to larger orders as your brand grows." },
    { icon: Eye, title: "Manufacturing Transparency", desc: "Clear communication, timeline tracking, and quality updates throughout." }
  ];

  return (
    <>
      <SEOHead
        title="Low MOQ Garment Manufacturer in India | Feather Fashions"
        description="Low MOQ garment manufacturer in India supporting startups with leggings, sportswear & activewear manufacturing from Tirupur."
        canonicalUrl="/low-moq-garment-manufacturer-india"
        keywords="low MOQ garment manufacturer India, startup garment manufacturer India, small batch clothing manufacturer India, low minimum order clothing India"
        structuredData={structuredData}
      />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <header className="relative py-20 md:py-28 bg-gradient-to-br from-background via-muted/30 to-background overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(0,144,255,0.15),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(0,144,255,0.1),transparent_40%)]" />
          
          <div className="container mx-auto px-4 relative z-10">
            <Breadcrumbs items={[{ label: "Low MOQ Manufacturing" }]} />
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground mb-6 leading-tight max-w-4xl">
              Low MOQ <span className="text-neon">Garment</span> Manufacturer in India
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mb-8">
              Start small, dream big. Quality manufacturing for startups and growing brands with flexible minimum order quantities.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="bg-neon hover:bg-neon/90 text-black font-bold px-8">
                <Link to="/bulk-order">
                  Start Your Order
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/contact">Discuss Your Needs</Link>
              </Button>
            </div>
          </div>
        </header>

        {/* Introduction Section */}
        <section className="py-16 md:py-20 bg-muted/20">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
              Manufacturing Support for Growing Brands
            </h2>
            <div className="prose prose-lg prose-invert max-w-none">
              <p className="text-muted-foreground leading-relaxed mb-6">
                Starting a clothing brand shouldn't require betting everything on thousands of pieces. At Feather Fashions, we understand that startups and emerging brands need a manufacturing partner who believes in their vision—even when their order quantities are small. That's why we've designed our operations to support low minimum order quantities without compromising on quality.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Based in Tirupur, India's textile heartland, we bring decades of manufacturing expertise to brands at every stage of growth. Whether you're launching your first collection with 200 pieces or scaling to tens of thousands, we maintain the same rigorous quality standards and attention to detail that export markets demand.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Our low MOQ program is specifically designed to balance flexibility with quality. We work with you to optimize production runs, minimize waste, and deliver products that your customers will love—setting the foundation for sustainable brand growth.
              </p>
            </div>
          </div>
        </section>

        {/* What is Low MOQ Section */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
              What is Low MOQ Manufacturing?
            </h2>
            <div className="prose prose-lg prose-invert max-w-none mb-8">
              <p className="text-muted-foreground leading-relaxed mb-6">
                MOQ stands for Minimum Order Quantity—the smallest number of units a manufacturer will produce in a single order. Traditional garment manufacturers often require MOQs of 1,000-5,000 pieces per style, which can be prohibitive for new brands testing their market.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6">
                At Feather Fashions, our low MOQ program offers minimum orders starting from <strong className="text-foreground">200-300 pieces per style</strong>. This flexibility varies based on product type—simpler designs with existing patterns may accommodate even lower quantities, while highly customized products may require slightly higher minimums.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Low MOQ manufacturing is ideal for testing new designs, validating market demand, launching pilot collections, or building a curated catalog without the financial burden of large inventory commitments.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4 mt-8">
              <div className="p-5 bg-muted/30 border border-border rounded-xl text-center">
                <div className="text-3xl font-black text-neon mb-2">200+</div>
                <div className="text-sm text-muted-foreground">Pieces for Activewear</div>
              </div>
              <div className="p-5 bg-muted/30 border border-border rounded-xl text-center">
                <div className="text-3xl font-black text-neon mb-2">250+</div>
                <div className="text-sm text-muted-foreground">Pieces for T-Shirts</div>
              </div>
              <div className="p-5 bg-muted/30 border border-border rounded-xl text-center">
                <div className="text-3xl font-black text-neon mb-2">300+</div>
                <div className="text-sm text-muted-foreground">Pieces for Kids Wear</div>
              </div>
            </div>
          </div>
        </section>

        {/* Products Available Section */}
        <section className="py-16 md:py-20 bg-muted/20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-center">
              Products Available with Low MOQ
            </h2>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              Full product range accessible to startups and small brands
            </p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {products.map((product, index) => (
                <article key={index} className="p-6 bg-background border border-border rounded-xl hover:border-neon/50 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-bold text-foreground">{product.name}</h3>
                    <span className="px-3 py-1 bg-neon/10 text-neon text-xs font-bold rounded-full">{product.moq}</span>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">{product.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Who This is For Section */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12 text-center">
              Who This is For
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {idealFor.map((item, index) => (
                <div key={index} className="p-6 bg-muted/30 border border-border rounded-xl">
                  <div className="w-10 h-10 bg-neon/10 rounded-lg flex items-center justify-center mb-4">
                    <Rocket className="w-5 h-5 text-neon" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 md:py-20 bg-muted/20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12 text-center">
              Benefits of Working With Us
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {benefits.map((item, index) => (
                <div key={index} className="p-6 bg-background border border-border rounded-xl">
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

        {/* FAQ Section */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12 text-center">
              Frequently Asked Questions
            </h2>
            
            <div className="space-y-6">
              <article className="p-6 bg-muted/30 border border-border rounded-xl">
                <h3 className="text-lg font-bold text-foreground mb-3">What is the minimum order quantity at Feather Fashions?</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Our minimum order quantities start from 200-300 pieces per style for activewear and sportswear. For basic styles with existing patterns, we can sometimes accommodate orders as low as 150 pieces. MOQ varies based on product complexity and customization requirements.
                </p>
              </article>
              
              <article className="p-6 bg-muted/30 border border-border rounded-xl">
                <h3 className="text-lg font-bold text-foreground mb-3">Can I order samples before placing a bulk order?</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Yes, we offer sampling services for all our products. Sample orders of 5-10 pieces can be produced for quality and fit verification before committing to bulk production. Sample costs are adjusted against your first bulk order.
                </p>
              </article>
              
              <article className="p-6 bg-muted/30 border border-border rounded-xl">
                <h3 className="text-lg font-bold text-foreground mb-3">Is low MOQ manufacturing more expensive per piece?</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Low MOQ orders have slightly higher per-piece costs compared to bulk orders due to setup and production efficiencies. However, we keep our pricing competitive to support startup growth. As your order quantities increase, per-piece costs decrease significantly.
                </p>
              </article>
              
              <article className="p-6 bg-muted/30 border border-border rounded-xl">
                <h3 className="text-lg font-bold text-foreground mb-3">How do I scale up after my first low MOQ order?</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Scaling is seamless with Feather Fashions. We retain your specifications, patterns, and preferences from initial orders. Repeat orders can be placed with the same or increased quantities, and you'll benefit from improved pricing at higher volumes.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-28 bg-gradient-to-br from-neon/10 via-background to-neon/5">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Start Small. Scale Confidently.
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Your brand's journey starts with the first order. Let's make it count with quality manufacturing that grows with you.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" className="bg-neon hover:bg-neon/90 text-black font-bold px-10 py-6 text-lg">
                <Link to="/bulk-order">
                  Start Your Order
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="px-10 py-6 text-lg">
                <Link to="/contact">Talk to Us</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Internal Links Footer */}
        <nav className="py-12 bg-muted/30 border-t border-border" aria-label="Related pages">
          <div className="container mx-auto px-4">
            <h3 className="text-lg font-bold text-foreground mb-6 text-center">Explore Our Manufacturing Services</h3>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/private-label-activewear-india" className="text-muted-foreground hover:text-neon transition-colors">Private Label Manufacturing</Link>
              <span className="text-muted-foreground">•</span>
              <Link to="/white-label-activewear-india" className="text-muted-foreground hover:text-neon transition-colors">White Label Activewear</Link>
              <span className="text-muted-foreground">•</span>
              <Link to="/custom-sportswear-manufacturer-india" className="text-muted-foreground hover:text-neon transition-colors">Custom Sportswear</Link>
              <span className="text-muted-foreground">•</span>
              <Link to="/contact" className="text-muted-foreground hover:text-neon transition-colors">Contact Us</Link>
            </div>
          </div>
        </nav>
      </div>
    </>
  );
};

export default LowMOQManufacturer;
