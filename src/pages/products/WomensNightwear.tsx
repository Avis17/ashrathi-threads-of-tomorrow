import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Check, Package, Shirt, Palette, Ruler, Tag, Box } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Import images
import heroImage from "@/assets/products/womens-nightwear-hero.jpg";
import pantsImage from "@/assets/products/womens-nightwear-pants.jpg";
import topImage from "@/assets/products/womens-nightwear-top.jpg";
import setImage from "@/assets/products/womens-nightwear-set.jpg";
import colorsImage from "@/assets/products/womens-nightwear-colors.jpg";
import fabricImage from "@/assets/products/womens-nightwear-fabric.jpg";
import stitchingImage from "@/assets/products/womens-nightwear-stitching.jpg";

const WomensNightwear = () => {
  const productImages = [
    { src: pantsImage, alt: "Women's cotton night pants" },
    { src: topImage, alt: "Women's cotton night top" },
    { src: setImage, alt: "Women's nightwear coordinated set" },
    { src: colorsImage, alt: "Nightwear color variations" },
    { src: fabricImage, alt: "Cotton fabric texture detail" },
    { src: stitchingImage, alt: "Stitching and waistband detail" },
  ];

  const specifications = [
    { icon: Package, label: "Fabric", value: "100% Cotton / Cotton Blends" },
    { icon: Shirt, label: "Styles", value: "Night Pants, Night Tops, Coordinated Sets" },
    { icon: Ruler, label: "Sizes", value: "Custom size grading available" },
    { icon: Palette, label: "Colors", value: "Solid dyed & export-approved shades" },
    { icon: Box, label: "MOQ", value: "Bulk quantities as per export norms" },
    { icon: Tag, label: "Labeling", value: "OEM & Private Label supported" },
  ];

  const suitableFor = [
    "Apparel wholesalers & distributors",
    "Retail chains",
    "Online marketplaces",
    "Private label brands",
    "Export buyers in Middle East, Africa & other global markets",
  ];

  const faqs = [
    {
      question: "Do you offer private labeling?",
      answer: "Yes, we support OEM and private label manufacturing.",
    },
    {
      question: "Are these products suitable for export markets?",
      answer: "Yes, all products are manufactured following export-quality standards.",
    },
    {
      question: "Can fabrics, colors, and sizes be customized?",
      answer: "Customization is available based on order quantity and requirements.",
    },
    {
      question: "What markets do you currently supply?",
      answer: "We cater to buyers across the Middle East, Africa, and other international markets.",
    },
  ];

  return (
    <>
      <Helmet>
        <title>Women's Nightwear Manufacturer in India | Feather Fashions</title>
        <meta
          name="description"
          content="Export-quality women's nightwear manufacturer from India specializing in cotton night pants and tops for bulk and private label orders."
        />
        <link rel="canonical" href="https://featherfashions.in/products/womens-nightwear" />
      </Helmet>

      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center -mt-[76px] pt-[76px]">
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
                  OEM & Private Label
                </span>
                <span className="px-3 py-1 bg-white/10 backdrop-blur-sm text-white/90 text-xs font-medium tracking-wide rounded-full border border-white/20">
                  Consistent Bulk Quality
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-white leading-tight mb-6">
                Women's Nightwear Manufacturer for Global Export Markets
              </h1>
              <p className="text-lg md:text-xl text-white/80 leading-relaxed mb-8 max-w-xl">
                Premium cotton night pants and tops designed for comfort, durability, and large-scale export production.
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
                High-quality cotton nightwear manufactured to international export standards
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
                  <span className="font-medium">Packaging:</span> Export-standard folding & packing available
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Fabric & Quality Details */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-light text-foreground mb-6">
                Fabric & Quality Standards
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Our women's nightwear is manufactured using breathable cotton fabrics suitable for extended wear and repeated washing. Each production batch is quality-checked for stitching strength, color fastness, shrinkage control, and fabric consistency to meet international export requirements.
              </p>
            </div>
          </div>
        </section>

        {/* Applications & Market Use */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-light text-foreground mb-10 text-center">
                Suitable For
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
                Looking for a Reliable Women's Nightwear Manufacturer?
              </h2>
              <p className="text-white/70 mb-8 leading-relaxed">
                Share your requirements and our export team will assist you with specifications, samples, and bulk production details.
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

export default WomensNightwear;
