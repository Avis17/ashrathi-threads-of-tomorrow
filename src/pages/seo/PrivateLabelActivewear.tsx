import SEOHead from "@/components/seo/SEOHead";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Factory, Users, Package, Truck, Award, Shield } from "lucide-react";

// Collection images for client types
import collegeCollection from "@/assets/college-collection.jpg";
import corporateCollection from "@/assets/corporate-collection.jpg";
import eventCollection from "@/assets/event-collection.jpg";
import uniformCollection from "@/assets/uniform-collection.jpg";
import sportsCollection from "@/assets/sports-collection.jpg";
import trackPantsCollection from "@/assets/track-pants-collection.jpg";

const PrivateLabelActivewear = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Feather Fashions",
    "url": "https://featherfashions.in",
    "logo": "https://featherfashions.in/logo.png",
    "description": "Private label activewear manufacturer in India offering custom leggings, sports bras, joggers & gym wear with bulk and startup-friendly MOQs.",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Tirupur",
      "addressRegion": "Tamil Nadu",
      "addressCountry": "IN"
    },
    "areaServed": ["India", "Middle East", "Europe", "North America", "Australia"],
    "serviceType": ["Private Label Manufacturing", "White Label Activewear", "Custom Sportswear Production"]
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is private label activewear?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Private label activewear refers to custom-manufactured sportswear and fitness apparel produced by a manufacturer like Feather Fashions, sold under your own brand name. You control the design, branding, packaging, and pricing while we handle the complete manufacturing process from fabric sourcing to final production."
        }
      },
      {
        "@type": "Question",
        "name": "Do you support startups with low MOQ?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, Feather Fashions offers flexible minimum order quantities starting from 200-300 pieces per style for startups and new brands. As your business grows, we scale production capacity accordingly with improved pricing for larger volumes."
        }
      },
      {
        "@type": "Question",
        "name": "Can I customize fabric, fit, and branding?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Absolutely. We provide complete customization including fabric selection (polyester-spandex, nylon-spandex, cotton blends), custom fits and size grading, logo printing (DTF, heat transfer, embroidery), custom labels, hang tags, and packaging. Our design team works with your specifications or helps develop new styles."
        }
      },
      {
        "@type": "Question",
        "name": "Do you manufacture in India for export?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, our Tirupur-based facility produces export-quality activewear that meets international standards. We currently export to the Middle East, Europe, North America, and Australia. Our products comply with global quality and safety standards including OEKO-TEX certification."
        }
      }
    ]
  };

  const products = [
    { name: "Women's Leggings", desc: "High waist, 7/8 length, pocket options. 260-280 GSM with 4-way stretch and squat-proof opacity." },
    { name: "Sports Bras", desc: "Medium and high impact support. Moisture-wicking fabric with anti-chafe flatlock seams." },
    { name: "Men's Joggers & Track Pants", desc: "Tapered fit, elasticated cuffs. 240-280 GSM cotton-poly or performance blends." },
    { name: "Men's Sports T-Shirts & Shorts", desc: "Lightweight 160-180 GSM quick-dry polyester with mesh ventilation panels." },
    { name: "Kids Activewear Sets", desc: "Comfortable cotton-spandex blends. Durable stitching for active play and school sports." },
    { name: "Innerwear & Athleisure", desc: "Premium 180-220 GSM combed cotton. Soft, breathable, everyday comfort essentials." }
  ];

  const fabrics = [
    { name: "Polyester Spandex", desc: "Most popular for activewear. 88% polyester, 12% spandex. Excellent stretch recovery, quick-dry, and color retention." },
    { name: "Nylon Spandex", desc: "Silky smooth finish, superior durability. Ideal for premium leggings and compression wear. 78% nylon, 22% spandex." },
    { name: "Cotton Spandex", desc: "Breathable and soft. 95% cotton, 5% spandex. Perfect for casual athleisure and yoga wear." },
    { name: "Performance Blends", desc: "Custom tri-blends with moisture-wicking, anti-bacterial, and UV protection properties for specialized applications." }
  ];

  const services = [
    "Custom design & tech pack support",
    "Fabric sourcing & sampling",
    "Logo printing (DTF, heat transfer, embroidery)",
    "Custom labels & hang tags",
    "Size charts & grading",
    "Bulk production",
    "Quality checking & inspection",
    "Packaging & shipping support"
  ];

  const whyChooseUs = [
    { icon: Factory, text: "Manufacturing hub: Tirupur, India's textile capital" },
    { icon: Users, text: "Low MOQ for startups (200-300 pieces)" },
    { icon: Package, text: "Scalable bulk production capacity" },
    { icon: Award, text: "Export-quality stitching & finishing" },
    { icon: Shield, text: "Strict quality control at every stage" },
    { icon: Truck, text: "On-time delivery commitment" }
  ];

  const clientTypes = [
    "Startup fitness & activewear brands",
    "Gym & fitness center chains",
    "Online D2C brands & e-commerce sellers",
    "Export buyers & international distributors",
    "Wholesalers & regional distributors",
    "Corporate wellness programs"
  ];

  return (
    <>
      <SEOHead
        title="Private Label Activewear Manufacturer in India | Feather Fashions"
        description="Private label activewear manufacturer in India offering custom leggings, sports bras, joggers & gym wear. Bulk & startup-friendly MOQs."
        canonicalUrl="/private-label-activewear-india"
        keywords="private label activewear India, private label sportswear manufacturer India, custom activewear manufacturer India, white label activewear India, gym wear private label India"
        structuredData={structuredData}
      />

      {/* FAQ Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <header className="relative py-20 md:py-28 bg-gradient-to-br from-background via-muted/30 to-background overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(0,144,255,0.15),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(0,144,255,0.1),transparent_40%)]" />
          
          <div className="container mx-auto px-4 relative z-10">
            <Breadcrumbs items={[{ label: "Private Label Activewear" }]} />
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground mb-6 leading-tight max-w-4xl">
              Private Label <span className="text-neon">Activewear</span> Manufacturer in India
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mb-8">
              Launch your own activewear brand with India's trusted private label manufacturer. From concept to delivery—we handle it all.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="bg-neon hover:bg-neon/90 text-black font-bold px-8">
                <Link to="/bulk-order">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/contact">Request Samples</Link>
              </Button>
            </div>
          </div>
        </header>

        {/* Section 1: Introduction */}
        <section className="py-16 md:py-20 bg-muted/20">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
              Your Trusted Private Label Partner in India
            </h2>
            <div className="prose prose-lg prose-invert max-w-none">
              <p className="text-muted-foreground leading-relaxed mb-6">
                Feather Fashions is a leading private label and white label activewear manufacturer based in Tirupur, Tamil Nadu—India's premier textile manufacturing hub. We partner with entrepreneurs, fitness brands, D2C companies, gym chains, and international exporters to bring their activewear vision to life with precision manufacturing and competitive pricing.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Our state-of-the-art facility combines decades of textile expertise with modern production technology to deliver export-quality sportswear that meets international standards. Whether you're a startup launching your first collection or an established brand scaling production, we offer flexible solutions tailored to your business needs—from low minimum order quantities to high-volume bulk manufacturing.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                With complete end-to-end services including design support, fabric sourcing, custom branding, and quality assurance, we eliminate the complexity of garment manufacturing so you can focus on building your brand and growing your business.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: What We Manufacture */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-center">
              What We Manufacture
            </h2>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              Complete range of activewear and athleisure products for men, women, and kids
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

        {/* Section 3: Fabrics & Materials */}
        <section className="py-16 md:py-20 bg-muted/20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-center">
              Fabrics & Materials
            </h2>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              Premium performance fabrics ranging from 160-280 GSM with superior breathability, stretch recovery, and color fastness
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {fabrics.map((fabric, index) => (
                <article key={index} className="p-6 bg-background border border-border rounded-xl">
                  <h3 className="text-lg font-bold text-neon mb-2">{fabric.name}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{fabric.desc}</p>
                </article>
              ))}
            </div>
            
            <div className="mt-8 text-center">
              <Link to="/fabrics-we-use" className="text-neon hover:underline font-medium">
                Learn more about our fabric technology →
              </Link>
            </div>
          </div>
        </section>

        {/* Section 4: Private Label Services */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-center">
              Private Label Services
            </h2>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              End-to-end manufacturing support from concept to delivery
            </p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
              {services.map((service, index) => (
                <div key={index} className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-neon flex-shrink-0 mt-0.5" />
                  <span className="text-foreground text-sm font-medium">{service}</span>
                </div>
              ))}
            </div>
            
            <div className="mt-8 text-center">
              <Link to="/manufacturing-process" className="text-neon hover:underline font-medium">
                View our manufacturing process →
              </Link>
            </div>
          </div>
        </section>

        {/* Section 5: Why Choose Us */}
        <section className="py-16 md:py-20 bg-muted/20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12 text-center">
              Why Choose Feather Fashions
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {whyChooseUs.map((item, index) => (
                <div key={index} className="flex items-center gap-4 p-5 bg-background border border-border rounded-xl">
                  <div className="w-12 h-12 bg-neon/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-6 h-6 text-neon" />
                  </div>
                  <span className="text-foreground font-medium">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Who We Work With - Enhanced with Images */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12 text-center">
              Who We Work With
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
              {[
                { image: collegeCollection, label: "Educational Institutions", desc: "School & college sports uniforms" },
                { image: corporateCollection, label: "Corporate Clients", desc: "Branded wellness programs" },
                { image: eventCollection, label: "Event Organizers", desc: "Marathon & sports events" },
                { image: uniformCollection, label: "Uniform Suppliers", desc: "Team sports & fitness centers" },
                { image: sportsCollection, label: "Sports Brands", desc: "D2C & e-commerce sellers" },
                { image: trackPantsCollection, label: "Athleisure Brands", desc: "Casual & lifestyle collections" },
              ].map((item, index) => (
                <div key={index} className="group relative aspect-[4/3] rounded-xl overflow-hidden">
                  <img 
                    src={item.image} 
                    alt={item.label}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-white font-bold mb-1">{item.label}</h3>
                    <p className="text-white/70 text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
              {clientTypes.map((client, index) => (
                <span key={index} className="px-6 py-3 bg-muted/50 border border-border rounded-full text-foreground font-medium">
                  {client}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 md:py-20 bg-muted/20">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12 text-center">
              Frequently Asked Questions
            </h2>
            
            <div className="space-y-6">
              <article className="p-6 bg-background border border-border rounded-xl">
                <h3 className="text-lg font-bold text-foreground mb-3">What is private label activewear?</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Private label activewear refers to custom-manufactured sportswear and fitness apparel produced by a manufacturer like Feather Fashions, sold under your own brand name. You control the design, branding, packaging, and pricing while we handle the complete manufacturing process from fabric sourcing to final production.
                </p>
              </article>
              
              <article className="p-6 bg-background border border-border rounded-xl">
                <h3 className="text-lg font-bold text-foreground mb-3">Do you support startups with low MOQ?</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Yes, Feather Fashions offers flexible minimum order quantities starting from 200-300 pieces per style for startups and new brands. As your business grows, we scale production capacity accordingly with improved pricing for larger volumes.
                </p>
              </article>
              
              <article className="p-6 bg-background border border-border rounded-xl">
                <h3 className="text-lg font-bold text-foreground mb-3">Can I customize fabric, fit, and branding?</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Absolutely. We provide complete customization including fabric selection (polyester-spandex, nylon-spandex, cotton blends), custom fits and size grading, logo printing (DTF, heat transfer, embroidery), custom labels, hang tags, and packaging. Our design team works with your specifications or helps develop new styles.
                </p>
              </article>
              
              <article className="p-6 bg-background border border-border rounded-xl">
                <h3 className="text-lg font-bold text-foreground mb-3">Do you manufacture in India for export?</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Yes, our Tirupur-based facility produces export-quality activewear that meets international standards. We currently export to the Middle East, Europe, North America, and Australia. Our products comply with global quality and safety standards including OEKO-TEX certification.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-28 bg-gradient-to-br from-neon/10 via-background to-neon/5">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Start Your Private Label Activewear Brand Today
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              From concept to delivery, we're your complete manufacturing partner. Get started with a free consultation and sample request.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" className="bg-neon hover:bg-neon/90 text-black font-bold px-10 py-6 text-lg">
                <Link to="/bulk-order">
                  Request a Quote
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="px-10 py-6 text-lg">
                <Link to="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Internal Links Footer */}
        <nav className="py-12 bg-muted/30 border-t border-border" aria-label="Related pages">
          <div className="container mx-auto px-4">
            <h3 className="text-lg font-bold text-foreground mb-6 text-center">Explore Our Products & Services</h3>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/womens-leggings" className="text-muted-foreground hover:text-neon transition-colors">Women's Leggings</Link>
              <span className="text-muted-foreground">•</span>
              <Link to="/mens-sportswear" className="text-muted-foreground hover:text-neon transition-colors">Men's Sportswear</Link>
              <span className="text-muted-foreground">•</span>
              <Link to="/manufacturing-process" className="text-muted-foreground hover:text-neon transition-colors">Manufacturing Process</Link>
              <span className="text-muted-foreground">•</span>
              <Link to="/fabrics-we-use" className="text-muted-foreground hover:text-neon transition-colors">Fabrics We Use</Link>
              <span className="text-muted-foreground">•</span>
              <Link to="/contact" className="text-muted-foreground hover:text-neon transition-colors">Contact Us</Link>
            </div>
          </div>
        </nav>
      </div>
    </>
  );
};

export default PrivateLabelActivewear;
