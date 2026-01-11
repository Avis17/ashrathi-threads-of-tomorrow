import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Check, Package, Shirt, Palette, Ruler, Tag, Box, Gauge } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Import images
import heroImage from "@/assets/products/cotton-tshirts-hero.jpg";
import whiteImage from "@/assets/products/cotton-tshirt-white.jpg";
import colorsImage from "@/assets/products/cotton-tshirt-colors.jpg";
import frontImage from "@/assets/products/cotton-tshirt-front.jpg";
import backImage from "@/assets/products/cotton-tshirt-back.jpg";
import fabricImage from "@/assets/products/cotton-tshirt-fabric.jpg";
import necklineImage from "@/assets/products/cotton-tshirt-neckline.jpg";
import poloImage from "@/assets/products/cotton-polo-tshirts.jpg";
import womensRoundneckImage from "@/assets/products/cotton-womens-roundneck.jpg";
import sweatersImage from "@/assets/products/cotton-fullsleeve-sweaters.jpg";

const CottonTshirts = () => {
  const productImages = [
    { src: poloImage, alt: "Premium polo t-shirts in vibrant colors" },
    { src: womensRoundneckImage, alt: "Women's round neck cotton t-shirts" },
    { src: sweatersImage, alt: "Full sleeve cotton sweaters and sweatshirts" },
    { src: whiteImage, alt: "White cotton T-shirt folded" },
    { src: colorsImage, alt: "T-shirt color variations" },
    { src: frontImage, alt: "Navy T-shirt front view" },
    { src: backImage, alt: "Grey T-shirt back view" },
    { src: fabricImage, alt: "Cotton fabric knit texture" },
    { src: necklineImage, alt: "Neckline stitching detail" },
  ];

  const specifications = [
    { icon: Package, label: "Fabric", value: "100% Cotton / Cotton Blends" },
    { icon: Gauge, label: "GSM Range", value: "Customizable as per requirement" },
    { icon: Shirt, label: "Fit Options", value: "Regular, Slim, Oversized" },
    { icon: Shirt, label: "Neck Styles", value: "Crew Neck, Round Neck, V-Neck" },
    { icon: Ruler, label: "Sizes", value: "Custom size grading supported" },
    { icon: Palette, label: "Colors", value: "Solid dyed & export-approved shades" },
    { icon: Box, label: "MOQ", value: "Bulk quantities as per export norms" },
    { icon: Tag, label: "Labeling", value: "OEM & Private Label available" },
  ];

  const suitableFor = [
    "Apparel wholesalers & distributors",
    "Retail chains",
    "Promotional & corporate supply",
    "Private label brands",
    "Online marketplaces",
    "Export buyers in Middle East, Africa & Europe",
  ];

  const faqs = [
    {
      question: "Do you manufacture T-shirts for export markets?",
      answer: "Yes, all cotton T-shirts are produced to meet export quality requirements.",
    },
    {
      question: "Can we add our own brand label?",
      answer: "Yes, OEM and private labeling are supported.",
    },
    {
      question: "Are GSM and colors customizable?",
      answer: "Yes, customization is available based on order quantity.",
    },
    {
      question: "Which markets do you supply?",
      answer: "We supply to buyers across the Middle East, Africa, Europe, and other global markets.",
    },
  ];

  return (
    <>
      <Helmet>
        <title>Cotton T-Shirt Manufacturer in India | Bulk & Export Supplier</title>
        <meta
          name="description"
          content="Export-quality cotton T-shirt manufacturer from India specializing in bulk, OEM, and private label production for global markets."
        />
        <link rel="canonical" href="https://featherfashions.in/products/cotton-tshirts" />
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
                100% Cotton
              </span>
              <span className="px-3 py-1 bg-white/10 backdrop-blur-sm text-white/90 text-xs font-medium tracking-wide rounded-full border border-white/20">
                Bulk Manufacturing
              </span>
              <span className="px-3 py-1 bg-white/10 backdrop-blur-sm text-white/90 text-xs font-medium tracking-wide rounded-full border border-white/20">
                OEM & Private Label Supported
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-white leading-tight mb-6">
              Cotton T-Shirt Manufacturer in India for Global Export Markets
            </h1>
            <p className="text-lg md:text-xl text-white/80 leading-relaxed mb-8 max-w-xl">
              Premium cotton T-shirts engineered for bulk production, private labels, and export supply across international markets.
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
              Premium cotton T-shirts manufactured to international export standards
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
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
              {specifications.map((spec, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 rounded-lg bg-muted/30 border border-border/50"
                >
                  <spec.icon className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">{spec.label}</p>
                    <p className="text-xs text-muted-foreground">{spec.value}</p>
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

      {/* Fabric & Quality Control */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-light text-foreground mb-6">
              Fabric & Quality Standards
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Our cotton T-shirts are manufactured using high-quality knitted fabrics selected for breathability, durability, and consistent performance. Each production batch undergoes quality checks for fabric GSM consistency, color fastness, shrinkage control, and stitching strength to meet international export standards.
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
              Looking for a Reliable Cotton T-Shirt Manufacturer?
            </h2>
            <p className="text-white/70 mb-8 leading-relaxed">
              Share your fabric GSM, color requirements, and order quantity. Our export team will assist you with samples and bulk production details.
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

export default CottonTshirts;
