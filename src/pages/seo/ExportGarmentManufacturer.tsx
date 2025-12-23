import SEOHead from "@/components/seo/SEOHead";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import OrganizationSchema from "@/components/seo/OrganizationSchema";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Globe, Package, Shield, Handshake, CheckCircle, ArrowRight } from "lucide-react";

const ExportGarmentManufacturer = () => {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Which countries does Feather Fashions export garments to?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Feather Fashions exports garments to the United States, European Union countries, Middle East, Australia, and other international markets. We manufacture activewear, sportswear, and private label garments meeting international quality standards."
        }
      },
      {
        "@type": "Question",
        "name": "What export quality standards do you follow?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We follow strict export quality standards including fabric quality control, measurement consistency, color fastness testing, proper packing standards, and buyer compliance readiness for international markets."
        }
      },
      {
        "@type": "Question",
        "name": "Do you provide documentation support for exports?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, we provide complete documentation support for export orders including buyer-ready documents, compliance certificates, and all necessary paperwork for smooth international shipping and customs clearance."
        }
      },
      {
        "@type": "Question",
        "name": "What is the minimum order quantity for export orders?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Export MOQ varies by product type and complexity. We work with international buyers on bulk orders while maintaining flexibility for growing brands. Contact us to discuss your specific requirements."
        }
      }
    ]
  };

  return (
    <>
      <SEOHead
        title="Export Garment Manufacturer in India | Feather Fashions"
        description="Export garment manufacturer in India producing activewear, sportswear & private label garments with export-quality standards."
        canonicalUrl="/export-garment-manufacturer-india"
        keywords="export garment manufacturer India, garment exporter India, activewear export manufacturer India, sportswear exporter India, export quality garments India"
        structuredData={faqSchema}
      />
      <OrganizationSchema />
      
      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative py-20 lg:py-28 bg-gradient-to-br from-primary/10 via-background to-accent/10">
          <div className="container mx-auto px-4">
            <Breadcrumbs 
              items={[
                { label: "Export Garment Manufacturer India" }
              ]} 
            />
            
            <div className="max-w-4xl mt-8">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                Export Garment Manufacturer in India
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Manufacturing quality garments for global markets from Tirupur, India's textile capital.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg" className="gap-2">
                  <Link to="/contact">
                    Get Export Quote <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/products">View Products</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Introduction Section */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Your Trusted Export Partner from India
              </h2>
              <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
                <p>
                  Feather Fashions is a professional export garment manufacturer based in Tirupur, India, 
                  serving international buyers across the United States, European Union, Middle East, 
                  Australia, and other global markets. With years of manufacturing expertise and a 
                  commitment to quality, we have established ourselves as a reliable partner for 
                  brands seeking consistent, high-quality garment production.
                </p>
                <p>
                  Our export manufacturing capabilities span across activewear, sportswear, athleisure, 
                  innerwear, and kids wear categories. We understand the stringent quality requirements 
                  of international markets and have built our processes around meeting and exceeding 
                  global standards. Every garment we produce undergoes rigorous quality checks to 
                  ensure it meets buyer specifications and international compliance requirements.
                </p>
                <p>
                  As an export-focused manufacturer, we offer complete support from design development 
                  to final delivery, including private labeling, custom packaging, and documentation 
                  assistance. Our goal is to be more than just a supplier – we aim to be a long-term 
                  manufacturing partner for brands looking to source quality garments from India.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Export Products Section */}
        <section className="py-16 lg:py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-10 text-center">
              Export Garments We Manufacture
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {[
                {
                  title: "Activewear & Sportswear",
                  description: "Performance-focused gym wear, training apparel, and athletic clothing for international fitness brands.",
                  icon: Package
                },
                {
                  title: "Leggings & Athleisure",
                  description: "High-waist leggings, yoga pants, and lifestyle athleisure wear with premium stretch fabrics.",
                  icon: Package
                },
                {
                  title: "Innerwear",
                  description: "Men's and women's innerwear including briefs, boxers, and comfort wear for daily use.",
                  icon: Package
                },
                {
                  title: "Kids Wear",
                  description: "Children's activewear, sportswear sets, and comfortable everyday clothing.",
                  icon: Package
                },
                {
                  title: "Custom & Private Label",
                  description: "Fully customized garments with your branding, labels, and packaging for your market.",
                  icon: Package
                },
                {
                  title: "Bulk Orders",
                  description: "Large volume production with consistent quality for retail chains and distributors.",
                  icon: Package
                }
              ].map((product, index) => (
                <div key={index} className="bg-card p-6 rounded-xl border border-border hover:border-primary/50 transition-colors">
                  <product.icon className="w-10 h-10 text-primary mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">{product.title}</h3>
                  <p className="text-muted-foreground">{product.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Quality Standards Section */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-10 text-center">
                Export Quality Standards
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  {
                    title: "Fabric Quality Control",
                    description: "Every fabric batch is tested for GSM, shrinkage, pilling resistance, and durability before production.",
                    icon: Shield
                  },
                  {
                    title: "Measurement Consistency",
                    description: "Strict adherence to size specifications with tolerance checks on every production batch.",
                    icon: CheckCircle
                  },
                  {
                    title: "Color Fastness",
                    description: "Color fastness testing for wash, light, and rubbing to ensure lasting vibrancy.",
                    icon: CheckCircle
                  },
                  {
                    title: "Packing Standards",
                    description: "Export-grade packaging with proper folding, poly bags, cartons, and labeling as per buyer requirements.",
                    icon: Package
                  },
                  {
                    title: "Buyer Compliance",
                    description: "Documentation and process alignment with international buyer compliance requirements.",
                    icon: Globe
                  },
                  {
                    title: "Pre-Shipment Inspection",
                    description: "Thorough quality checks before dispatch to ensure order accuracy and product quality.",
                    icon: Shield
                  }
                ].map((standard, index) => (
                  <div key={index} className="flex gap-4 p-4 bg-card rounded-lg border border-border">
                    <standard.icon className="w-8 h-8 text-primary flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">{standard.title}</h3>
                      <p className="text-muted-foreground text-sm">{standard.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Export Support Section */}
        <section className="py-16 lg:py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-10 text-center">
                Export Support Services
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <Handshake className="w-8 h-8 text-primary flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Bulk Production Capability</h3>
                      <p className="text-muted-foreground">
                        Scalable manufacturing capacity to handle large export orders with consistent quality and timely delivery.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Package className="w-8 h-8 text-primary flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Private Labeling</h3>
                      <p className="text-muted-foreground">
                        Complete branding solutions including custom labels, tags, packaging, and care instructions for your brand.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <Globe className="w-8 h-8 text-primary flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Documentation Support</h3>
                      <p className="text-muted-foreground">
                        Buyer-ready documentation including commercial invoices, packing lists, and compliance certificates.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Handshake className="w-8 h-8 text-primary flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Long-Term Partnerships</h3>
                      <p className="text-muted-foreground">
                        We focus on building lasting manufacturing relationships with dedicated support and priority production slots.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 lg:py-28 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Partner with a Reliable Export Garment Manufacturer in India
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Connect with us to discuss your export requirements and discover how we can support your brand's growth.
            </p>
            <Button asChild size="lg" variant="secondary" className="gap-2">
              <Link to="/contact">
                Start Your Export Order <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </section>

        {/* Internal Links Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
              Explore More Manufacturing Services
            </h2>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild variant="outline">
                <Link to="/activewear-manufacturer-tirupur">Tirupur Manufacturing</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/private-label-activewear-india">Private Label Services</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/custom-sportswear-manufacturer-india">Custom Sportswear</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default ExportGarmentManufacturer;
