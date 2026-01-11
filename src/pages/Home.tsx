import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Factory,
  Shield,
  Award,
  Globe,
  Users,
  CheckCircle,
  FileText,
  Phone,
  Mail,
  MapPin,
  Truck,
  Leaf,
  Target
} from "lucide-react";
import SEO from "@/components/seo/SEO";

// New B2B Sections
import ExportHeroSection from "@/components/home/ExportHeroSection";
import WomensNightwearSection from "@/components/home/WomensNightwearSection";
import KidswearSection from "@/components/home/KidswearSection";
import WhyChooseFeatherSection from "@/components/home/WhyChooseFeatherSection";
import ConfidenceModelSection from "@/components/home/ConfidenceModelSection";
import ProductGridSection from "@/components/home/ProductGridSection";
import TrustScaleSection from "@/components/home/TrustScaleSection";

// B2B Hero Image
import heroManufacturing from "@/assets/b2b/hero-manufacturing.jpg";
import productionLine from "@/assets/b2b/production-line.jpg";
import qualityControl from "@/assets/b2b/quality-control.jpg";
import exportLogistics from "@/assets/b2b/export-logistics.jpg";
import womenActivewear from "@/assets/b2b/products-women-activewear.jpg";
import menSportswear from "@/assets/b2b/products-men-sportswear.jpg";

const Home = () => {
  const keyHighlights = [
    {
      icon: Factory,
      title: "Export-Ready Manufacturer",
      description: "State-of-the-art production facility in Tiruppur, India"
    },
    {
      icon: Target,
      title: "Bulk & Custom Orders",
      description: "Flexible MOQ with complete customization options"
    },
    {
      icon: Shield,
      title: "Quality-Controlled Production",
      description: "Multi-stage quality checks at every production phase"
    },
    {
      icon: Leaf,
      title: "Ethical Manufacturing",
      description: "Sustainable practices with fair labor standards"
    }
  ];

  const productCategories = [
    {
      name: "Women's Activewear",
      image: womenActivewear,
      items: ["Sports Bras", "Leggings", "Tank Tops", "Shorts"],
      link: "/products"
    },
    {
      name: "Men's Sportswear",
      image: menSportswear,
      items: ["T-Shirts", "Track Pants", "Shorts", "Jackets"],
      link: "/products"
    },
    {
      name: "Custom Knitwear",
      image: productionLine,
      items: ["Private Label", "White Label", "Custom Designs", "OEM/ODM"],
      link: "/products"
    }
  ];

  const capabilities = [
    { icon: Factory, label: "In-House Production", value: "Complete vertical integration" },
    { icon: Users, label: "Skilled Workforce", value: "Trained artisans & technicians" },
    { icon: Award, label: "Quality Assurance", value: "ISO-standard processes" },
    { icon: Truck, label: "Export Ready", value: "Global shipping capability" },
    { icon: Globe, label: "International Compliance", value: "IEC registered exporter" },
    { icon: CheckCircle, label: "Certifications", value: "GST & Udyam registered" }
  ];

  const complianceItems = [
    { label: "GSTIN", value: "33FWTPS1281P1ZJ" },
    { label: "IEC", value: "FWTPS1281P" },
    { label: "Udyam", value: "UDYAM-TN-28-0191326" }
  ];

  return (
    <div className="min-h-screen bg-background font-sans">
      <SEO 
        title="Feather Fashions | Premium Apparel Manufacturer for Global Brands | Tiruppur, India"
        description="Export-ready knitwear and activewear manufacturer from Tiruppur, India. Premium quality, bulk orders, custom manufacturing for international buyers, importers, and wholesale distributors."
        canonicalUrl="/"
        ogType="website"
      />
      
      {/* NEW: Export-Focused Hero Section */}
      <ExportHeroSection />

      {/* Key Highlights Strip */}
      <section className="py-16 bg-muted/50 border-y border-border">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {keyHighlights.map((highlight, index) => (
              <div key={index} className="flex items-start gap-4 group">
                <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center group-hover:bg-accent group-hover:border-accent transition-all duration-300">
                  <highlight.icon className="h-6 w-6 text-accent group-hover:text-accent-foreground transition-colors" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{highlight.title}</h3>
                  <p className="text-sm text-muted-foreground">{highlight.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEW: Women's Nightwear Section */}
      <WomensNightwearSection />

      {/* NEW: Kidswear Section */}
      <KidswearSection />

      {/* NEW: Why Choose Feather Section */}
      <WhyChooseFeatherSection />

      {/* NEW: Confidence Model Section */}
      <ConfidenceModelSection />

      {/* NEW: Product Grid Section */}
      <ProductGridSection />

      {/* Product Categories Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-accent text-sm font-semibold tracking-[0.2em] uppercase mb-4 block">
              Our Capabilities
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Product Categories
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Premium knitwear and activewear manufactured to international standards. 
              Customization available for all categories.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {productCategories.map((category, index) => (
              <div key={index} className="group relative overflow-hidden rounded-2xl bg-card border border-border hover:border-accent/50 transition-all duration-500">
                <div className="aspect-[4/3] overflow-hidden">
                  <img 
                    src={category.image} 
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-foreground mb-3">{category.name}</h3>
                  <ul className="space-y-2 mb-6">
                    {category.items.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-accent" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Button asChild variant="outline" className="w-full group-hover:bg-accent group-hover:text-accent-foreground group-hover:border-accent transition-all">
                    <Link to={category.link}>
                      Enquire for Export / Bulk Orders
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Manufacturing Excellence Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-accent text-sm font-semibold tracking-[0.2em] uppercase mb-4 block">
                Why Choose Us
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Manufacturing Excellence from Tiruppur
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Located in Tiruppur, Tamil Nadu — India's knitwear capital — we bring decades of 
                manufacturing expertise to every order. Our vertically integrated facility ensures 
                complete quality control from fabric to finished garment.
              </p>

              <div className="grid grid-cols-2 gap-6">
                {capabilities.map((cap, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                      <cap.icon className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground text-sm">{cap.label}</h4>
                      <p className="text-xs text-muted-foreground">{cap.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10">
                <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
                  <Link to="/manufacturing">
                    Explore Our Capabilities
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <img 
                src={productionLine} 
                alt="Production Line" 
                className="rounded-2xl object-cover w-full h-64"
              />
              <img 
                src={qualityControl} 
                alt="Quality Control" 
                className="rounded-2xl object-cover w-full h-64 mt-8"
              />
              <img 
                src={exportLogistics} 
                alt="Export Logistics" 
                className="rounded-2xl object-cover w-full h-64 col-span-2"
              />
            </div>
          </div>
        </div>
      </section>

      {/* NEW: Trust & Scale Section */}
      <TrustScaleSection />

      {/* Trust & Compliance Section */}
      <section className="py-20 bg-foreground text-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-accent text-sm font-semibold tracking-[0.2em] uppercase mb-4 block">
              Verified Manufacturer
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Legally Registered & Export Compliant
            </h2>
            <p className="text-background/70 max-w-2xl mx-auto">
              We are a government-registered export manufacturer with all necessary certifications 
              for international trade.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-background/10 backdrop-blur-sm border border-background/20 rounded-xl p-6 text-center hover:bg-background/20 transition-all">
              <Shield className="h-10 w-10 text-accent mx-auto mb-4" />
              <h3 className="font-semibold mb-2">GST Registration</h3>
              <p className="text-accent font-mono text-sm">33FWTPS1281P1ZJ</p>
            </div>
            <div className="bg-background/10 backdrop-blur-sm border border-background/20 rounded-xl p-6 text-center hover:bg-background/20 transition-all">
              <Globe className="h-10 w-10 text-accent mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Import Export Code</h3>
              <p className="text-accent font-mono text-sm">FWTPS1281P</p>
            </div>
            <div className="bg-background/10 backdrop-blur-sm border border-background/20 rounded-xl p-6 text-center hover:bg-background/20 transition-all">
              <Award className="h-10 w-10 text-accent mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Udyam Registration</h3>
              <p className="text-accent font-mono text-sm">UDYAM-TN-28-0191326</p>
            </div>
          </div>

          <div className="text-center mt-10">
            <Button asChild variant="outline" className="border-background/30 text-background hover:bg-background hover:text-foreground">
              <Link to="/compliance">
                View All Certifications
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-accent/5 border-t border-border">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Partner With Us for Your Next Order
            </h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
              Whether you're a buying house, importer, or brand looking for reliable manufacturing, 
              we're ready to discuss your requirements.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 px-8">
                <Link to="/contact">
                  <Mail className="mr-2 h-5 w-5" />
                  Send Enquiry
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => window.open("https://wa.me/919789225510?text=Hello, I'm interested in bulk orders from Feather Fashions.", "_blank")}
                className="px-8"
              >
                <Phone className="mr-2 h-5 w-5" />
                WhatsApp: +91 97892 25510
              </Button>
            </div>

            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">Tiruppur, Tamil Nadu, India — The Knitwear Capital</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
