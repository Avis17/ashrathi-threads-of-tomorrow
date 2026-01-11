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
  Phone,
  Mail,
  MapPin,
  Truck,
  Leaf,
  Target
} from "lucide-react";
import { useTranslation } from "react-i18next";
import SEO from "@/components/seo/SEO";

// New B2B Sections
import ExportHeroSection from "@/components/home/ExportHeroSection";
import WomensNightwearSection from "@/components/home/WomensNightwearSection";
import KidswearSection from "@/components/home/KidswearSection";
import ExportCoreCategories from "@/components/home/ExportCoreCategories";
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
  const { t } = useTranslation();

  const keyHighlights = [
    {
      icon: Factory,
      titleKey: "highlights.exportReady.title",
      descriptionKey: "highlights.exportReady.description"
    },
    {
      icon: Target,
      titleKey: "highlights.bulkCustom.title",
      descriptionKey: "highlights.bulkCustom.description"
    },
    {
      icon: Shield,
      titleKey: "highlights.qualityControlled.title",
      descriptionKey: "highlights.qualityControlled.description"
    },
    {
      icon: Leaf,
      titleKey: "highlights.ethicalManufacturing.title",
      descriptionKey: "highlights.ethicalManufacturing.description"
    }
  ];

  const productCategories = [
    {
      nameKey: "productCategories.womensActivewear",
      image: womenActivewear,
      items: ["Sports Bras", "Leggings", "Tank Tops", "Shorts"],
      link: "/products"
    },
    {
      nameKey: "productCategories.mensSportswear",
      image: menSportswear,
      items: ["T-Shirts", "Track Pants", "Shorts", "Jackets"],
      link: "/products"
    },
    {
      nameKey: "productCategories.customKnitwear",
      image: productionLine,
      items: ["Private Label", "White Label", "Custom Designs", "OEM/ODM"],
      link: "/products"
    }
  ];

  const capabilities = [
    { icon: Factory, labelKey: "manufacturing.capabilities.inHouse.title", valueKey: "manufacturing.capabilities.inHouse.value" },
    { icon: Users, labelKey: "manufacturing.capabilities.skilled.title", valueKey: "manufacturing.capabilities.skilled.value" },
    { icon: Award, labelKey: "manufacturing.capabilities.quality.title", valueKey: "manufacturing.capabilities.quality.value" },
    { icon: Truck, labelKey: "manufacturing.capabilities.exportReady.title", valueKey: "manufacturing.capabilities.exportReady.value" },
    { icon: Globe, labelKey: "manufacturing.capabilities.international.title", valueKey: "manufacturing.capabilities.international.value" },
    { icon: CheckCircle, labelKey: "manufacturing.capabilities.certifications.title", valueKey: "manufacturing.capabilities.certifications.value" }
  ];

  const complianceItems = [
    { labelKey: "compliance.gst.label", value: "33FWTPS1281P1ZJ" },
    { labelKey: "compliance.iec.label", value: "FWTPS1281P" },
    { labelKey: "compliance.udyam.label", value: "UDYAM-TN-28-0191326" }
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
                  <h3 className="font-semibold text-foreground mb-1">{t(highlight.titleKey)}</h3>
                  <p className="text-sm text-muted-foreground">{t(highlight.descriptionKey)}</p>
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

      {/* NEW: Export Core Categories Section (T-Shirts, Pyjamas, Innerwear) */}
      <ExportCoreCategories />

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
              {t('productCategories.badge')}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t('productCategories.title')}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t('productCategories.description')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8" role="list">
            {productCategories.map((category, index) => (
              <article key={index} className="group relative overflow-hidden rounded-2xl bg-card border border-border hover:border-accent/50 transition-all duration-500" role="listitem">
                <div className="aspect-[4/3] overflow-hidden">
                  <img 
                    src={category.image} 
                    alt={`${t(category.nameKey)} - Wholesale garment manufacturing in Tiruppur`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    width={400}
                    height={300}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-foreground mb-3">{t(category.nameKey)}</h3>
                  <ul className="space-y-2 mb-6" aria-label={`${t(category.nameKey)} product types`}>
                    {category.items.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-accent" aria-hidden="true" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Button asChild variant="outline" className="w-full group-hover:bg-accent group-hover:text-accent-foreground group-hover:border-accent transition-all">
                    <Link to={category.link} aria-label={`${t('cta.enquireExportBulk')} ${t(category.nameKey)}`}>
                      {t('cta.enquireExportBulk')}
                      <ArrowRight className="ml-2 rtl:ml-0 rtl:mr-2 h-4 w-4 rtl:rotate-180" aria-hidden="true" />
                    </Link>
                  </Button>
                </div>
              </article>
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
                {t('manufacturing.badge')}
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                {t('manufacturing.title')}
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                {t('manufacturing.description')}
              </p>

              <div className="grid grid-cols-2 gap-6">
                {capabilities.map((cap, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                      <cap.icon className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground text-sm">{t(cap.labelKey)}</h4>
                      <p className="text-xs text-muted-foreground">{t(cap.valueKey)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10">
                <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
                  <Link to="/manufacturing">
                    {t('cta.exploreCapabilities')}
                    <ArrowRight className="ml-2 rtl:ml-0 rtl:mr-2 h-4 w-4 rtl:rotate-180" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <img 
                src={productionLine} 
                alt="Garment production line in Tiruppur manufacturing unit for export quality apparel"
                className="rounded-2xl object-cover w-full h-64"
                width={400}
                height={256}
                loading="lazy"
                decoding="async"
              />
              <img 
                src={qualityControl} 
                alt="Quality control inspection at Feather Fashions garment factory in India"
                className="rounded-2xl object-cover w-full h-64 mt-8"
                width={400}
                height={256}
                loading="lazy"
                decoding="async"
              />
              <img 
                src={exportLogistics} 
                alt="Export logistics and shipping for wholesale garments from Tiruppur to global markets"
                className="rounded-2xl object-cover w-full h-64 col-span-2"
                width={800}
                height={256}
                loading="lazy"
                decoding="async"
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
              {t('compliance.badge')}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t('compliance.title')}
            </h2>
            <p className="text-background/70 max-w-2xl mx-auto">
              {t('compliance.description')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-background/10 backdrop-blur-sm border border-background/20 rounded-xl p-6 text-center hover:bg-background/20 transition-all">
              <Shield className="h-10 w-10 text-accent mx-auto mb-4" />
              <h3 className="font-semibold mb-2">{t('compliance.gst.title')}</h3>
              <p className="text-accent font-mono text-sm">33FWTPS1281P1ZJ</p>
            </div>
            <div className="bg-background/10 backdrop-blur-sm border border-background/20 rounded-xl p-6 text-center hover:bg-background/20 transition-all">
              <Globe className="h-10 w-10 text-accent mx-auto mb-4" />
              <h3 className="font-semibold mb-2">{t('compliance.iec.title')}</h3>
              <p className="text-accent font-mono text-sm">FWTPS1281P</p>
            </div>
            <div className="bg-background/10 backdrop-blur-sm border border-background/20 rounded-xl p-6 text-center hover:bg-background/20 transition-all">
              <Award className="h-10 w-10 text-accent mx-auto mb-4" />
              <h3 className="font-semibold mb-2">{t('compliance.udyam.title')}</h3>
              <p className="text-accent font-mono text-sm">UDYAM-TN-28-0191326</p>
            </div>
          </div>

          <div className="text-center mt-10">
            <Button asChild variant="outline" className="border-background/30 text-background hover:bg-background hover:text-foreground">
              <Link to="/compliance">
                {t('cta.viewCertifications')}
                <ArrowRight className="ml-2 rtl:ml-0 rtl:mr-2 h-4 w-4 rtl:rotate-180" />
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
              {t('ctaSection.title')}
            </h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
              {t('ctaSection.description')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 px-8">
                <Link to="/contact">
                  <Mail className="mr-2 rtl:mr-0 rtl:ml-2 h-5 w-5" />
                  {t('cta.sendEnquiry')}
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => window.open("https://wa.me/919988322555?text=Hello, I'm interested in bulk orders from Feather Fashions.", "_blank")}
                className="px-8"
              >
                <Phone className="mr-2 rtl:mr-0 rtl:ml-2 h-5 w-5" />
                {t('common.whatsapp')}: +91 9988322555
              </Button>
            </div>

            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">{t('ctaSection.location')}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
