import SEOHead from "@/components/seo/SEOHead";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Users, Truck, DollarSign, Globe, Factory, Award } from "lucide-react";

const ActivewearManufacturerTirupur = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Feather Fashions",
    "url": "https://featherfashions.in",
    "logo": "https://featherfashions.in/logo.png",
    "description": "Activewear manufacturer in Tirupur offering leggings, sports bras & gym wear with export-quality fabrics and scalable production.",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Tirupur Textile Hub",
      "addressLocality": "Tirupur",
      "addressRegion": "Tamil Nadu",
      "postalCode": "641604",
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "11.1085",
      "longitude": "77.3411"
    },
    "areaServed": ["India", "Middle East", "Europe", "North America", "Australia"],
    "serviceType": ["Activewear Manufacturing", "Sportswear Production", "Gym Wear Manufacturing"]
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Why is Tirupur known for garment manufacturing?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Tirupur is India's largest knitwear export hub, contributing over 90% of India's cotton knitwear exports. The city has decades of specialized expertise in textile manufacturing, a skilled workforce of over 600,000 workers, established supply chains, and infrastructure optimized for garment production."
        }
      },
      {
        "@type": "Question",
        "name": "What types of activewear does Feather Fashions manufacture in Tirupur?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We manufacture a complete range of activewear including women's leggings (high-waisted, 7/8, pocket styles), sports bras, men's joggers and track pants, gym t-shirts and shorts, and kids activewear. All products are made with performance fabrics and export-quality finishing."
        }
      },
      {
        "@type": "Question",
        "name": "Can you export activewear from Tirupur?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, Feather Fashions has extensive export experience. We currently supply to clients in the Middle East, Europe, North America, and Australia. Our products meet international quality standards and comply with global testing certifications including OEKO-TEX."
        }
      },
      {
        "@type": "Question",
        "name": "What is the typical production timeline from Tirupur?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Standard production timelines are 3-4 weeks for white label orders and 6-8 weeks for custom private label development including sampling. Timelines may vary based on order complexity and quantity. We maintain clear communication throughout production."
        }
      }
    ]
  };

  const products = [
    { name: "Women's Leggings", desc: "High-waisted, 7/8 length, and pocket styles. 260-280 GSM polyester-spandex with 4-way stretch and squat-proof construction." },
    { name: "Sports Bras", desc: "Medium and high-impact support with moisture-wicking fabric, removable padding, and flatlock seams for comfort." },
    { name: "Men's Joggers & Track Pants", desc: "Tapered and relaxed fits in 240-280 GSM. Cotton-poly blends with ribbed cuffs and secure pockets." },
    { name: "Gym T-Shirts & Shorts", desc: "Lightweight 160-180 GSM quick-dry polyester. Mesh panels, raglan sleeves, and athletic cuts." },
    { name: "Kids Activewear", desc: "Durable cotton-spandex blends sized for ages 2-14. Comfortable elastics and vibrant, long-lasting colors." }
  ];

  const qualityPoints = [
    { title: "Polyester Spandex", desc: "88/12 blend for stretch recovery and durability. Quick-dry and moisture-wicking." },
    { title: "Nylon Spandex", desc: "78/22 blend for silky finish and premium feel. Superior compression properties." },
    { title: "Cotton Blends", desc: "Cotton-spandex and tri-blends for breathability and natural comfort." },
    { title: "GSM Range", desc: "160-280 GSM options for different product requirements and seasons." },
    { title: "Color Fastness", desc: "Grade 4-5 color fastness ensuring colors stay vibrant after repeated washing." },
    { title: "Export-Quality Stitching", desc: "Flatlock and overlock seams meeting international finishing standards." }
  ];

  const tirupurAdvantages = [
    { icon: Users, title: "Skilled Workforce", desc: "Access to over 600,000 trained textile workers with specialized knitwear expertise passed down through generations." },
    { icon: Truck, title: "Reliable Supply Chain", desc: "Integrated ecosystem of fabric mills, dyeing units, accessories suppliers, and logistics providers within a concentrated area." },
    { icon: DollarSign, title: "Cost Efficiency", desc: "Competitive manufacturing costs without compromising quality, thanks to established infrastructure and economies of scale." },
    { icon: Globe, title: "Global Export Experience", desc: "Decades of experience supplying to international markets with compliance to global quality and safety standards." }
  ];

  return (
    <>
      <SEOHead
        title="Activewear Manufacturer in Tirupur | Feather Fashions"
        description="Activewear manufacturer in Tirupur offering leggings, sports bras & gym wear with export-quality fabrics and scalable production."
        canonicalUrl="/activewear-manufacturer-tirupur"
        keywords="activewear manufacturer Tirupur, sportswear manufacturer Tirupur, leggings manufacturer Tirupur, gym wear manufacturer Tirupur"
        structuredData={structuredData}
      />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <header className="relative py-20 md:py-28 bg-gradient-to-br from-background via-muted/30 to-background overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(0,144,255,0.15),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(0,144,255,0.1),transparent_40%)]" />
          
          <div className="container mx-auto px-4 relative z-10">
            <Breadcrumbs items={[{ label: "Tirupur Manufacturing" }]} />
            
            <div className="flex items-center gap-3 mb-6">
              <Factory className="w-8 h-8 text-neon" />
              <span className="text-neon font-bold tracking-wide">MADE IN TIRUPUR</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground mb-6 leading-tight max-w-4xl">
              Activewear Manufacturer in <span className="text-neon">Tirupur</span>, India
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mb-8">
              Premium activewear manufacturing from India's knitwear capital. Export-quality production with decades of textile expertise.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="bg-neon hover:bg-neon/90 text-black font-bold px-8">
                <Link to="/bulk-order">
                  Get Manufacturing Quote
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/contact">Visit Our Facility</Link>
              </Button>
            </div>
          </div>
        </header>

        {/* Introduction Section */}
        <section className="py-16 md:py-20 bg-muted/20">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
              Tirupur: India's Activewear Manufacturing Hub
            </h2>
            <div className="prose prose-lg prose-invert max-w-none">
              <p className="text-muted-foreground leading-relaxed mb-6">
                Tirupur, located in Tamil Nadu, stands as India's undisputed knitwear and activewear manufacturing capital. Contributing over 90% of the country's cotton knitwear exports and generating annual revenues exceeding $4 billion, Tirupur has earned its reputation as a global textile powerhouse. This is where Feather Fashions operates—leveraging decades of regional expertise to deliver world-class activewear to domestic and international markets.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6">
                As a professional activewear manufacturer based in Tirupur, we specialize in producing high-performance sportswear including women's leggings, sports bras, men's joggers and track pants, gym t-shirts, shorts, and kids activewear. Our facility combines traditional craftsmanship with modern production technology, ensuring consistent quality across every order—whether you need 200 pieces or 200,000.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                What sets Tirupur manufacturing apart is the complete integration of the supply chain. From fabric mills and dyeing units to accessories suppliers and export logistics—everything exists within a concentrated ecosystem. This translates to faster turnaround times, competitive pricing, and quality control that meets the stringent demands of global markets. Feather Fashions brings this advantage directly to your brand.
              </p>
            </div>
          </div>
        </section>

        {/* Products Section */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-center">
              Activewear Products We Manufacture
            </h2>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              Complete range of performance activewear with premium fabrics and expert finishing
            </p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {products.map((product, index) => (
                <article key={index} className="p-6 bg-muted/30 border border-border rounded-xl hover:border-neon/50 transition-colors">
                  <h3 className="text-xl font-bold text-foreground mb-3">{product.name}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{product.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Fabrics & Quality Section */}
        <section className="py-16 md:py-20 bg-muted/20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-center">
              Fabrics & Quality Standards
            </h2>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              Performance fabrics with rigorous quality control at every stage
            </p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {qualityPoints.map((item, index) => (
                <div key={index} className="p-6 bg-background border border-border rounded-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <Award className="w-5 h-5 text-neon" />
                    <h3 className="text-lg font-bold text-foreground">{item.title}</h3>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Tirupur Section */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-center">
              Why Tirupur Manufacturing Matters
            </h2>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              Strategic advantages of sourcing from India's textile capital
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {tirupurAdvantages.map((item, index) => (
                <div key={index} className="p-6 bg-muted/30 border border-border rounded-xl flex gap-4">
                  <div className="w-14 h-14 bg-neon/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-7 h-7 text-neon" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-2">{item.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
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
                <h3 className="text-lg font-bold text-foreground mb-3">Why is Tirupur known for garment manufacturing?</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Tirupur is India's largest knitwear export hub, contributing over 90% of India's cotton knitwear exports. The city has decades of specialized expertise in textile manufacturing, a skilled workforce of over 600,000 workers, established supply chains, and infrastructure optimized for garment production.
                </p>
              </article>
              
              <article className="p-6 bg-background border border-border rounded-xl">
                <h3 className="text-lg font-bold text-foreground mb-3">What types of activewear does Feather Fashions manufacture in Tirupur?</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We manufacture a complete range of activewear including women's leggings (high-waisted, 7/8, pocket styles), sports bras, men's joggers and track pants, gym t-shirts and shorts, and kids activewear. All products are made with performance fabrics and export-quality finishing.
                </p>
              </article>
              
              <article className="p-6 bg-background border border-border rounded-xl">
                <h3 className="text-lg font-bold text-foreground mb-3">Can you export activewear from Tirupur?</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Yes, Feather Fashions has extensive export experience. We currently supply to clients in the Middle East, Europe, North America, and Australia. Our products meet international quality standards and comply with global testing certifications including OEKO-TEX.
                </p>
              </article>
              
              <article className="p-6 bg-background border border-border rounded-xl">
                <h3 className="text-lg font-bold text-foreground mb-3">What is the typical production timeline from Tirupur?</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Standard production timelines are 3-4 weeks for white label orders and 6-8 weeks for custom private label development including sampling. Timelines may vary based on order complexity and quantity. We maintain clear communication throughout production.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-28 bg-gradient-to-br from-neon/10 via-background to-neon/5">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Source Activewear Directly from Tirupur
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Partner with India's textile capital for quality activewear manufacturing. Get factory-direct pricing with export-grade quality.
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
            <h3 className="text-lg font-bold text-foreground mb-6 text-center">Explore Our Manufacturing Services</h3>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/private-label-activewear-india" className="text-muted-foreground hover:text-neon transition-colors">Private Label Manufacturing</Link>
              <span className="text-muted-foreground">•</span>
              <Link to="/white-label-activewear-india" className="text-muted-foreground hover:text-neon transition-colors">White Label Activewear</Link>
              <span className="text-muted-foreground">•</span>
              <Link to="/custom-sportswear-manufacturer-india" className="text-muted-foreground hover:text-neon transition-colors">Custom Sportswear</Link>
              <span className="text-muted-foreground">•</span>
              <Link to="/export-garment-manufacturer-india" className="text-muted-foreground hover:text-neon transition-colors">Export Manufacturing</Link>
              <span className="text-muted-foreground">•</span>
              <Link to="/contact" className="text-muted-foreground hover:text-neon transition-colors">Contact Us</Link>
            </div>
          </div>
        </nav>
      </div>
    </>
  );
};

export default ActivewearManufacturerTirupur;
