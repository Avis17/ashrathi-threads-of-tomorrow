import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Import product images
import heroImage from "@/assets/products/innerwear-basics-hero.jpg";
import foldedBasics from "@/assets/products/innerwear-folded-basics.jpg";
import colorSet from "@/assets/products/innerwear-color-set.jpg";
import frontView from "@/assets/products/innerwear-front-view.jpg";
import backView from "@/assets/products/innerwear-back-view.jpg";
import fabricKnit from "@/assets/products/innerwear-fabric-knit.jpg";
import seamDetail from "@/assets/products/innerwear-seam-detail.jpg";
import womensPanties from "@/assets/products/innerwear-womens-panties.jpg";
import mensStylish from "@/assets/products/innerwear-mens-stylish.jpg";
import womensBralettes from "@/assets/products/innerwear-womens-bralettes.jpg";

const productImages = [
  { src: womensPanties, alt: "Stylish women's panties in vibrant colors" },
  { src: mensStylish, alt: "Men's boxer briefs in bold colors" },
  { src: womensBralettes, alt: "Women's bralettes with lace details" },
  { src: foldedBasics, alt: "Folded cotton basics - vests and undershirts" },
  { src: colorSet, alt: "Innerwear in mixed neutral colors" },
  { src: frontView, alt: "Front view of cotton vest" },
  { src: backView, alt: "Back view of cotton vest" },
  { src: fabricKnit, alt: "Premium cotton knit fabric texture" },
  { src: seamDetail, alt: "Elastic band and seam stitching detail" },
];

const specifications = [
  { label: "Fabric", value: "100% Cotton / Cotton Blends" },
  { label: "Products", value: "Vests, Camisoles, Undershirts, Basic Tops, Leggings" },
  { label: "Fits", value: "Regular & Comfort Fit" },
  { label: "Sizes", value: "Custom size grading supported" },
  { label: "Colors", value: "Solid dyed & export-approved shades" },
  { label: "MOQ", value: "Bulk quantities as per export norms" },
  { label: "Labeling", value: "OEM & Private Label available" },
  { label: "Packaging", value: "Export-standard folding & packing" },
];

const idealFor = [
  "Wholesalers & distributors",
  "Retail chains",
  "Private label brands",
  "Promotional & institutional supply",
  "Export buyers across Middle East, Africa & global markets",
];

const faqs = [
  {
    question: "Do you manufacture innerwear for export?",
    answer: "Yes, all innerwear and basics are produced for export markets.",
  },
  {
    question: "Is private labeling supported?",
    answer: "Yes, OEM and private label options are available.",
  },
  {
    question: "Can sizes and colors be customized?",
    answer: "Customization is supported based on order quantity.",
  },
  {
    question: "Which markets do you supply?",
    answer: "We supply to buyers across the Middle East, Africa, and other global regions.",
  },
];

const InnerwearBasics = () => {
  return (
    <>
      <Helmet>
        <title>Innerwear & Basics Manufacturer in India | Export Supplier</title>
        <meta
          name="description"
          content="Export-quality innerwear and basic garments manufacturer from India specializing in bulk, OEM, and private label supply for global markets."
        />
        <meta
          name="keywords"
          content="innerwear manufacturer india, basics garments exporter, cotton innerwear wholesale supplier, private label basics manufacturer"
        />
        <link rel="canonical" href="/products/innerwear-basics" />
      </Helmet>

      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center py-20">
        <div className="absolute inset-0 z-0">
          <img
            src={heroImage}
            alt="Innerwear and basic garments collection for export"
            className="w-full h-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/40" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="inline-flex items-center px-3 py-1 bg-accent/10 text-accent text-xs font-medium rounded-full">
                Export-Ready
              </span>
              <span className="inline-flex items-center px-3 py-1 bg-muted text-muted-foreground text-xs font-medium rounded-full">
                Consistent Bulk Quality
              </span>
              <span className="inline-flex items-center px-3 py-1 bg-muted text-muted-foreground text-xs font-medium rounded-full">
                OEM & Private Label Supported
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-light text-foreground mb-6 leading-tight">
              Innerwear & Basic Garments Manufacturer for Export Markets
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
              Essential cotton innerwear and basics engineered for comfort, durability, and consistent bulk production for global buyers.
            </p>

            <Button asChild size="lg" className="group">
              <Link to="/contact">
                Request Export Quote
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Product Visual Grid */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-serif font-light text-foreground mb-4">
              Product Range
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore our range of export-quality innerwear and basic garments
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {productImages.map((image, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="aspect-square rounded-xl overflow-hidden bg-background shadow-sm"
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Export Specifications */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl md:text-4xl font-serif font-light text-foreground mb-6">
                Export Specifications
              </h2>
              <p className="text-muted-foreground mb-8">
                All products manufactured to international export standards with full customization support.
              </p>

              <div className="space-y-4">
                {specifications.map((spec, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg"
                  >
                    <CheckCircle className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium text-foreground">{spec.label}:</span>{" "}
                      <span className="text-muted-foreground">{spec.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:sticky lg:top-32"
            >
              <div className="bg-muted/50 rounded-2xl p-8">
                <h3 className="text-2xl font-serif font-light text-foreground mb-4">
                  Fabric & Quality Standards
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Our innerwear and basic garments are produced using soft, breathable cotton fabrics selected for skin comfort and long-term durability. Each batch is checked for fabric consistency, stitching strength, elastic recovery, color fastness, and wash performance to meet international export requirements.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Applications & Market Use */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-serif font-light text-foreground mb-4">
              Ideal For
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {idealFor.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex items-center gap-3 p-4 bg-background rounded-lg shadow-sm"
              >
                <CheckCircle className="h-5 w-5 text-accent flex-shrink-0" />
                <span className="text-foreground">{item}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Export CTA Section */}
      <section className="py-20 bg-foreground text-background">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-3xl md:text-4xl font-serif font-light mb-6">
              Looking for a Reliable Innerwear & Basics Manufacturer?
            </h2>
            <p className="text-background/70 text-lg mb-8">
              Share your product types, sizes, colors, and order quantity. Our export team will assist with samples and bulk production details.
            </p>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="bg-transparent border-background text-background hover:bg-background hover:text-foreground group"
            >
              <Link to="/contact">
                Request Quote
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-serif font-light text-foreground mb-4">
              Export FAQ
            </h2>
          </motion.div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="bg-muted/30 rounded-lg px-6 border-none"
                >
                  <AccordionTrigger className="text-left hover:no-underline py-5">
                    <span className="font-medium text-foreground">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5">
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

export default InnerwearBasics;
