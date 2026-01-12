import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Download, Mail, Package, CheckCircle, Factory, ArrowRight } from "lucide-react";
import womenNightwearImg from "@/assets/brochure/women-nightwear-brochure.jpg";
import kidsClothingImg from "@/assets/brochure/kids-clothing-brochure.jpg";
import manufacturingImg from "@/assets/b2b/hero-manufacturing.jpg";

const ExportToSouthAfrica = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Garment Exporter from India to South Africa | Feather Fashions",
    "description": "Wholesale garment exporter from Tiruppur, India to South Africa. Women's nightwear and kidswear manufacturer for Johannesburg, Cape Town, and African markets.",
    "url": "https://featherfashions.in/export-garments-to-south-africa",
    "provider": {
      "@type": "ManufacturingBusiness",
      "name": "Feather Fashions",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Tiruppur",
        "addressRegion": "Tamil Nadu",
        "addressCountry": "IN"
      }
    }
  };

  return (
    <>
      <Helmet>
        <title>Garment Exporter from India to South Africa | Feather Fashions</title>
        <meta name="description" content="Reliable garment exporter from India to South Africa. Wholesale women's nightwear and kidswear manufacturer in Tiruppur for Johannesburg & African retail markets." />
        <meta name="keywords" content="garment exporter india to south africa, kidswear exporter india africa, wholesale garments supplier south africa, women nightwear exporter india" />
        <link rel="canonical" href="https://featherfashions.in/export-garments-to-south-africa" />
        <meta property="og:title" content="Garment Exporter from India to South Africa | Feather Fashions" />
        <meta property="og:description" content="Wholesale garment exporter from Tiruppur, India to South Africa. Women's nightwear and kidswear for African markets." />
        <meta property="og:url" content="https://featherfashions.in/export-garments-to-south-africa" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-secondary/10 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-primary font-medium mb-4 tracking-wide">TRUSTED INDIAN MANUFACTURER</p>
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
              Garment Exporter from India to South Africa
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Wholesale & export supply of women's nightwear and kidswear from Tiruppur, India to Johannesburg, Cape Town, Durban, and across South Africa.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/export-brochure">
                <Button size="lg" className="gap-2">
                  <Download className="w-5 h-5" />
                  Request Export Brochure
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="gap-2">
                  <Mail className="w-5 h-5" />
                  Contact Export Team
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Export Categories */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            Export Garment Categories for South Africa
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-card rounded-xl overflow-hidden shadow-sm border">
              <img 
                src={womenNightwearImg} 
                alt="Women cotton nightwear manufactured in India for South Africa export market"
                className="w-full h-48 object-cover"
                loading="lazy"
                width={600}
                height={192}
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  Women's Nightwear
                </h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Night Pants & Night Tops</li>
                  <li>• Loungewear Coord Sets</li>
                  <li>• Soft cotton & blended fabrics</li>
                  <li>• Comfortable everyday styles</li>
                </ul>
              </div>
            </div>
            <div className="bg-card rounded-xl overflow-hidden shadow-sm border">
              <img 
                src={kidsClothingImg} 
                alt="Colorful kids cotton clothing exported from India to South Africa"
                className="w-full h-48 object-cover"
                loading="lazy"
                width={600}
                height={192}
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  Kids Cotton Clothing
                </h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Kids Sets & Pyjamas</li>
                  <li>• Bright, cheerful colors</li>
                  <li>• Child-safe cotton fabrics</li>
                  <li>• Strong seams for active kids</li>
                </ul>
              </div>
            </div>
          </div>
          <p className="text-center text-muted-foreground mt-8 max-w-2xl mx-auto">
            Our garments are popular across South African retail chains and distributors due to their quality construction, vibrant designs, and value-for-money positioning.
          </p>
        </div>
      </section>

      {/* Why Buyers Choose Us */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            Why South Africa Buyers Work With Feather Fashions
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              "Factory-direct competitive pricing",
              "Large-scale production capability",
              "Consistent color & sizing standards",
              "Flexible minimum order quantities",
              "Professional export packing",
              "On-time shipment reliability"
            ].map((point, index) => (
              <div key={index} className="flex items-start gap-3 bg-card p-4 rounded-lg border">
                <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-foreground">{point}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Manufacturing Capabilities */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-6">
                Export-Ready Manufacturing in Tiruppur, India
              </h2>
              <ul className="space-y-4">
                {[
                  "Integrated sourcing & manufacturing",
                  "Multi-stage quality inspections",
                  "High-volume order fulfillment",
                  "Export paperwork support",
                  "Reliable production schedules"
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <Factory className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <img 
                src={manufacturingImg}
                alt="Garment production facility in Tiruppur manufacturing for South Africa export"
                className="rounded-xl shadow-lg w-full"
                loading="lazy"
                width={600}
                height={400}
              />
            </div>
          </div>
        </div>
      </section>

      {/* How to Start */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            How to Import Garments from India to South Africa
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { step: "1", title: "Get in Touch", desc: "Download brochure or enquire" },
              { step: "2", title: "Specify Needs", desc: "Styles, volumes, specifications" },
              { step: "3", title: "Review Quote", desc: "Pricing & lead time details" },
              { step: "4", title: "Order & Receive", desc: "Production & reliable shipping" }
            ].map((item, index) => (
              <div key={index} className="text-center bg-card p-6 rounded-xl border">
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  {item.step}
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Looking for a Reliable Garment Exporter to South Africa?
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            Partner with Feather Fashions for quality products, competitive rates, and dependable export service from Tiruppur, India.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/export-brochure">
              <Button size="lg" variant="secondary" className="gap-2">
                <Download className="w-5 h-5" />
                Download Export Brochure
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline" className="gap-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                <ArrowRight className="w-5 h-5" />
                Email Export Team
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default ExportToSouthAfrica;
