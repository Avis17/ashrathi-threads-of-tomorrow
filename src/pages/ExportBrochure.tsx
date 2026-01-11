import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Download, 
  FileText, 
  CheckCircle, 
  Globe, 
  Factory, 
  Package, 
  Shield,
  Phone,
  Mail,
  MapPin,
  ArrowRight
} from "lucide-react";
import SEO from "@/components/seo/SEO";
import BrochureDownloadModal from "@/components/brochure/BrochureDownloadModal";
import { generateExportBrochure } from "@/utils/generateBrochurePDF";

// Images
import womenNightwearImg from "@/assets/brochure/women-nightwear-brochure.jpg";
import kidsClothingImg from "@/assets/brochure/kids-clothing-brochure.jpg";
import fabricDetailImg from "@/assets/brochure/fabric-quality-detail.jpg";

const ExportBrochure = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDownloadSuccess = async () => {
    try {
      await generateExportBrochure();
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  const womenFeatures = [
    "Night Pants • Night Tops • Lounge Sets",
    "Soft breathable cotton & cotton blends",
    "Color-fast dyeing (export standard)",
    "Comfortable fits with consistent sizing",
    "High repeat-order potential",
    "Ideal for bulk export programs"
  ];

  const kidsFeatures = [
    "Kids Sets • Kids Pyjamas • Casual Wear",
    "Skin-friendly fabrics",
    "Bright, vibrant, export-approved colors",
    "Solid & printed options",
    "Durable stitching for overseas markets",
    "Popular across Middle East, Africa & Asia"
  ];

  const whyChooseUs = [
    { icon: Shield, text: "Manufacturer-direct pricing" },
    { icon: Factory, text: "Consistent bulk production" },
    { icon: Package, text: "MOQ flexibility for exporters" },
    { icon: CheckCircle, text: "Quality control at every stage" },
    { icon: Globe, text: "Reliable delivery timelines" },
    { icon: FileText, text: "Private wholesale & export handling" },
  ];

  return (
    <div className="min-h-screen bg-secondary">
      <SEO 
        title="Export Brochure | Feather Fashions - Nightwear & Kidswear Manufacturer"
        description="Download our export brochure. Premium nightwear and kidswear manufactured in Tiruppur for global markets. Wholesale pricing for exporters and buying houses."
        canonicalUrl="/export-brochure"
      />

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-purple-500/5" />
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold/10 border border-gold/20 rounded-full text-gold text-sm font-semibold tracking-wide uppercase mb-8">
              <FileText className="h-4 w-4" />
              Export Brochure
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Export-Quality{" "}
              <span className="text-gradient-gold">Nightwear & Kidswear</span>
              <br />
              Manufactured for Global Markets
            </h1>

            {/* Description */}
            <p className="text-lg text-white/70 mb-10 max-w-2xl mx-auto">
              Feather Fashions is a Tiruppur-based garment manufacturer supplying high-volume, 
              consistent-quality apparel for exporters, buying houses, distributors, and retail chains.
            </p>

            {/* Download CTA */}
            <Button 
              onClick={() => setIsModalOpen(true)}
              size="lg"
              className="bg-gradient-to-r from-gold to-amber-500 text-black hover:from-gold/90 hover:to-amber-500/90 font-bold px-10 py-7 text-lg shadow-lg shadow-gold/25"
            >
              <Download className="mr-3 h-6 w-6" />
              Download Export Brochure
            </Button>

            <p className="text-sm text-white/40 mt-4">
              PDF format • Complete catalog with pricing info
            </p>
          </div>
        </div>
      </section>

      {/* Product Sections */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Women's Nightwear */}
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              <div className="aspect-video overflow-hidden">
                <img 
                  src={womenNightwearImg} 
                  alt="Women's Nightwear Collection"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <span className="inline-block px-3 py-1 bg-pink-500/20 text-pink-400 text-xs font-semibold rounded-full mb-4">
                  WOMEN'S COLLECTION
                </span>
                <h2 className="text-2xl font-bold text-white mb-4">Women's Nightwear</h2>
                <ul className="space-y-2">
                  {womenFeatures.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-white/70 text-sm">
                      <CheckCircle className="h-4 w-4 text-pink-400 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Kids Clothing */}
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              <div className="aspect-video overflow-hidden">
                <img 
                  src={kidsClothingImg} 
                  alt="Kids Colorful Clothing"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <span className="inline-block px-3 py-1 bg-teal-500/20 text-teal-400 text-xs font-semibold rounded-full mb-4">
                  KIDS COLLECTION
                </span>
                <h2 className="text-2xl font-bold text-white mb-4">Kids Colorful Clothing</h2>
                <ul className="space-y-2">
                  {kidsFeatures.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-white/70 text-sm">
                      <CheckCircle className="h-4 w-4 text-teal-400 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-black/20">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-white text-center mb-4">
            Why Exporters Choose{" "}
            <span className="text-gradient-gold">Feather Fashions</span>
          </h2>
          <p className="text-white/60 text-center mb-12 max-w-xl mx-auto">
            We focus on long-term export partnerships, not one-time orders.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {whyChooseUs.map((item, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-4">
                <item.icon className="h-5 w-5 text-gold flex-shrink-0" />
                <span className="text-white/80 text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Manufacturing & Quality */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">
                Manufacturing &{" "}
                <span className="text-gradient-gold">Quality</span>
              </h2>
              <ul className="space-y-3">
                {[
                  "In-house production & sourcing",
                  "Fabric inspection & process control",
                  "Size, shade & finish consistency",
                  "Export-ready packing support",
                  "Scalable capacity for repeat programs"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-white/70">
                    <CheckCircle className="h-5 w-5 text-gold" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <img 
                src={fabricDetailImg} 
                alt="Fabric Quality Detail"
                className="rounded-2xl w-full"
              />
              <div className="absolute -bottom-4 -right-4 bg-gold text-black px-6 py-3 rounded-xl font-bold">
                Export-Grade Quality
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-gradient-to-br from-gold/10 to-transparent">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Looking for a reliable garment manufacturer for export?
            </h2>
            <p className="text-white/60 mb-8">
              Contact us to receive catalogs, pricing & production details.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button 
                onClick={() => setIsModalOpen(true)}
                size="lg"
                className="bg-gradient-to-r from-gold to-amber-500 text-black hover:from-gold/90 hover:to-amber-500/90 font-bold px-8"
              >
                <Download className="mr-2 h-5 w-5" />
                Download Brochure
              </Button>
              <Button 
                asChild
                size="lg"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <Link to="/contact">
                  Contact Us
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>

            <div className="flex flex-wrap justify-center gap-6 text-sm text-white/60">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                info@featherfashions.shop
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                +91 99883 22555
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Tiruppur, Tamil Nadu, India
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modal */}
      <BrochureDownloadModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleDownloadSuccess}
      />
    </div>
  );
};

export default ExportBrochure;
