import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, Package, Ruler, Palette, Box, Tag, Shirt } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Import leggings images
import leggingsActive78 from "@/assets/leggings-active-78.jpg";
import leggingsAnkleLength from "@/assets/leggings-ankle-length.jpg";
import leggingsBurgundy from "@/assets/leggings-burgundy.jpg";
import leggingsCharcoal from "@/assets/leggings-charcoal.jpg";
import leggingsCottonLycra from "@/assets/leggings-cotton-lycra.jpg";
import leggingsGreen from "@/assets/leggings-green.jpg";
import leggingsMaternity from "@/assets/leggings-maternity.jpg";
import leggingsStraightFit from "@/assets/leggings-straight-fit.jpg";
import womenLeggingsFeatured from "@/assets/women-leggings-featured.jpg";
import categoryLeggings from "@/assets/category-leggings.jpg";

const productImages = [
  { src: womenLeggingsFeatured, alt: "Women's premium leggings collection" },
  { src: leggingsActive78, alt: "Active 7/8 length workout leggings" },
  { src: leggingsAnkleLength, alt: "Full ankle length leggings" },
  { src: leggingsBurgundy, alt: "Burgundy colored leggings" },
  { src: leggingsCharcoal, alt: "Charcoal grey leggings" },
  { src: leggingsCottonLycra, alt: "Cotton lycra blend leggings" },
  { src: leggingsGreen, alt: "Green colored leggings" },
  { src: leggingsMaternity, alt: "Comfortable maternity leggings" },
  { src: leggingsStraightFit, alt: "Straight fit casual leggings" },
];

const specifications = [
  { icon: Package, label: "Fabric", value: "Cotton Lycra / Polyester Spandex / Nylon Spandex" },
  { icon: Shirt, label: "Styles", value: "High-waisted, 7/8 Length, Ankle Length, Maternity, Straight Fit" },
  { icon: Ruler, label: "GSM Range", value: "220-280 GSM" },
  { icon: Palette, label: "Colors", value: "Solid, Heather, Melange - Export approved shades" },
  { icon: Box, label: "MOQ", value: "200+ pieces per style/color" },
  { icon: Tag, label: "Labeling", value: "OEM & Private Label available" },
];

const features = [
  "4-way stretch for maximum mobility",
  "Squat-proof opacity",
  "Moisture-wicking technology",
  "Flatlock seams for anti-chafe comfort",
  "Wide waistband for tummy control",
  "Hidden pocket options available",
  "UV protection fabric options",
  "Quick-dry performance fabric",
];

const suitableFor = [
  "Fitness & gym brands",
  "Yoga & wellness studios",
  "Athleisure D2C brands",
  "International activewear distributors",
  "Private label startups",
  "Retail chains & e-commerce sellers",
];

const faqs = [
  {
    question: "What fabric options do you offer for leggings?",
    answer: "We offer Cotton Lycra (95/5), Polyester Spandex (88/12), and Nylon Spandex (78/22) blends. Each fabric has unique properties suited for different use cases - from everyday wear to high-performance training.",
  },
  {
    question: "Can you manufacture custom designs and fits?",
    answer: "Yes, we support complete customization including custom size grading, unique design elements, pockets, waistband styles, and length variations based on your specifications.",
  },
  {
    question: "What is the minimum order quantity?",
    answer: "Our standard MOQ is 200 pieces per style per color. For startups, we offer flexible arrangements and can discuss smaller initial orders.",
  },
  {
    question: "Do you export leggings internationally?",
    answer: "Yes, we are an export-focused manufacturer supplying to clients in the Middle East, Europe, North America, and Australia with full export documentation support.",
  },
];

const Leggings = () => {
  return (
    <>
      <Helmet>
        <title>Women's Leggings Manufacturer India | Export Quality Activewear | Feather Fashions</title>
        <meta
          name="description"
          content="Premium women's leggings manufacturer in India. Cotton lycra, polyester spandex leggings for fitness, yoga & athleisure. Bulk export & private label supported."
        />
        <meta
          name="keywords"
          content="leggings manufacturer India, women's leggings exporter, yoga leggings wholesale, activewear leggings bulk, cotton lycra leggings manufacturer Tiruppur"
        />
        <link rel="canonical" href="/products/leggings" />
      </Helmet>

      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center py-20">
        <div className="absolute inset-0 z-0">
          <img
            src={categoryLeggings}
            alt="Women's leggings collection for export"
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
                Performance Fabrics
              </span>
              <span className="inline-flex items-center px-3 py-1 bg-muted text-muted-foreground text-xs font-medium rounded-full">
                Private Label Supported
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-light text-foreground mb-6 leading-tight">
              Women's Leggings Manufacturer for Global Markets
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
              Premium quality leggings in cotton lycra, polyester spandex, and nylon blends. From yoga studios to gym floors - engineered for performance and comfort.
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
              Leggings Collection
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore our range of export-quality leggings for fitness, yoga, and everyday athleisure
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

      {/* Features Grid */}
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
                Performance Features
              </h2>
              <p className="text-muted-foreground mb-8">
                Every pair of leggings is engineered with premium features for superior comfort and durability.
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg"
                  >
                    <CheckCircle className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                    <span className="text-foreground text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h2 className="text-3xl md:text-4xl font-serif font-light text-foreground mb-6">
                Export Specifications
              </h2>

              <div className="space-y-4">
                {specifications.map((spec, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg"
                  >
                    <spec.icon className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium text-foreground">{spec.label}:</span>{" "}
                      <span className="text-muted-foreground">{spec.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Ideal For Section */}
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
            {suitableFor.map((item, index) => (
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

      {/* CTA Section */}
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
              Partner with India's Trusted Leggings Manufacturer
            </h2>
            <p className="text-background/70 text-lg mb-8">
              Share your fabric preferences, size range, and order quantity. Our export team will assist with samples and bulk production details.
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
              Frequently Asked Questions
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

export default Leggings;
