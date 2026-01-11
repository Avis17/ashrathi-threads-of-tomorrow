import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Check, Package, Shirt, Palette, Ruler, Tag, Box, Users } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Import images
import heroImage from "@/assets/products/kidswear-colorful-hero.jpg";
import yellowSetImage from "@/assets/products/kidswear-yellow-set.jpg";
import blueSetImage from "@/assets/products/kidswear-blue-set.jpg";
import colorVarietyImage from "@/assets/products/kidswear-color-variety.jpg";
import fabricTextureImage from "@/assets/products/kidswear-fabric-texture.jpg";
import stitchingDetailImage from "@/assets/products/kidswear-stitching-detail.jpg";
import sizeGradingImage from "@/assets/products/kidswear-size-grading.jpg";
import kidsSweaters from "@/assets/products/kids-sweaters-colorful.jpg";
import kidsMuslin from "@/assets/products/kids-muslin-clothes.jpg";
import kidsBabyClothes from "@/assets/products/kids-baby-clothes.jpg";

const KidswearColorfulSets = () => {
  const productImages = [
    { src: kidsSweaters, alt: "Colorful kids sweaters and cardigans" },
    { src: kidsMuslin, alt: "Soft muslin baby clothes and swaddles" },
    { src: kidsBabyClothes, alt: "Adorable baby bodysuits and rompers" },
    { src: yellowSetImage, alt: "Kids yellow cotton set" },
    { src: blueSetImage, alt: "Kids sky blue cotton set" },
    { src: colorVarietyImage, alt: "Multiple color variations" },
    { src: fabricTextureImage, alt: "Cotton fabric texture" },
    { src: stitchingDetailImage, alt: "Waistband stitching detail" },
    { src: sizeGradingImage, alt: "Size grading comparison" },
  ];

  const specifications = [
    { icon: Package, label: "Fabric", value: "100% Cotton / Cotton Blends" },
    { icon: Shirt, label: "Product Type", value: "Kids Cotton Sets (Top & Bottom)" },
    { icon: Users, label: "Age Groups", value: "Infant, Toddler, Kids (customizable)" },
    { icon: Palette, label: "Colors", value: "Solid & export-approved color palettes" },
    { icon: Ruler, label: "Sizes", value: "Custom size grading supported" },
    { icon: Box, label: "MOQ", value: "Bulk quantities as per export standards" },
    { icon: Tag, label: "Labeling", value: "OEM & Private Label available" },
  ];

  const suitableFor = [
    "Apparel wholesalers & distributors",
    "Kidswear retail chains",
    "Online sellers & marketplaces",
    "Private label brands",
    "Export buyers in Middle East, Africa & global markets",
  ];

  const faqs = [
    {
      question: "Do you manufacture kidswear for export?",
      answer: "Yes, all kidswear products are designed and produced for export markets.",
    },
    {
      question: "Are private labels supported?",
      answer: "Yes, OEM and private labeling options are available.",
    },
    {
      question: "Can colors and sizes be customized?",
      answer: "Yes, customization is supported based on order quantity.",
    },
    {
      question: "What markets do you supply?",
      answer: "We supply kidswear to buyers across the Middle East, Africa, and other global regions.",
    },
  ];

  return (
    <>
      <Helmet>
        <title>Kidswear Manufacturer in India | Colorful Cotton Sets for Export</title>
        <meta
          name="description"
          content="Export-quality kidswear manufacturer from India specializing in colorful cotton sets for bulk and private label orders."
        />
        <link rel="canonical" href="https://featherfashions.in/products/kidswear-colorful-sets" />
      </Helmet>

      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center py-20">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/70 to-foreground/40" />
        </div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-2xl">
            {/* Trust badges */}
            <div className="flex flex-wrap gap-3 mb-6">
              <span className="px-3 py-1 bg-white/10 backdrop-blur-sm text-white/90 text-xs font-medium tracking-wide rounded-full border border-white/20">
                Export-Ready
              </span>
              <span className="px-3 py-1 bg-white/10 backdrop-blur-sm text-white/90 text-xs font-medium tracking-wide rounded-full border border-white/20">
                Bulk Production
              </span>
              <span className="px-3 py-1 bg-white/10 backdrop-blur-sm text-white/90 text-xs font-medium tracking-wide rounded-full border border-white/20">
                OEM & Private Label Supported
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-white leading-tight mb-6">
              Kidswear Manufacturer – Colorful Cotton Sets for Export Markets
            </h1>
            <p className="text-lg md:text-xl text-white/80 leading-relaxed mb-8 max-w-xl">
              Export-quality kids cotton sets designed for comfort, durability, and vibrant appeal across global markets.
            </p>
            <Button
              asChild
              size="lg"
              className="bg-accent hover:bg-accent/90 text-accent-foreground font-medium px-8"
            >
              <Link to="/contact">Request Export Quote</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Product Visual Grid */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-light text-foreground mb-4">
              Product Range
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Colorful cotton sets manufactured to international export standards
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {productImages.map((image, index) => (
              <div
                key={index}
                className="aspect-square rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Export Specifications */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-light text-foreground mb-10 text-center">
              Export Specifications
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {specifications.map((spec, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-5 rounded-lg bg-muted/30 border border-border/50"
                >
                  <spec.icon className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">{spec.label}</p>
                    <p className="text-sm text-muted-foreground">{spec.value}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 p-5 rounded-lg bg-muted/50 border border-border/50 text-center">
              <p className="text-sm text-foreground">
                <span className="font-medium">Packaging:</span> Export-standard packing available
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Fabric & Safety Standards */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-light text-foreground mb-6">
              Fabric Quality & Safety
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Our kidswear sets are manufactured using soft, breathable cotton fabrics suitable for children's daily wear. Materials are selected for comfort, durability, and wash performance. Production follows strict quality control processes to ensure stitching strength, color fastness, and fabric consistency suitable for export markets.
            </p>
          </div>
        </div>
      </section>

      {/* Applications & Market Use */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-light text-foreground mb-10 text-center">
              Ideal For
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {suitableFor.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-4 rounded-lg bg-muted/30"
                >
                  <Check className="h-4 w-4 text-accent flex-shrink-0" />
                  <span className="text-sm text-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Export CTA Section */}
      <section className="py-20 bg-foreground">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-light text-white mb-4">
              Looking for a Trusted Kidswear Manufacturer?
            </h2>
            <p className="text-white/70 mb-8 leading-relaxed">
              Tell us your size range, color preferences, and order quantity. Our export team will assist you with samples and bulk production details.
            </p>
            <Button
              asChild
              size="lg"
              className="bg-accent hover:bg-accent/90 text-accent-foreground font-medium px-8"
            >
              <Link to="/contact">Request Quote</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Export FAQ */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-light text-foreground mb-10 text-center">
              Frequently Asked Questions
            </h2>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left text-foreground hover:text-accent">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>
    </>
  );
};

export default KidswearColorfulSets;
