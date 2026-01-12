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

// Import men's sportswear images
import menHero from "@/assets/men-hero.jpg";
import menHeroModel from "@/assets/men-hero-model.jpg";
import menJoggers from "@/assets/men-joggers.jpg";
import menGymTees from "@/assets/men-gym-tees.jpg";
import menTankTops from "@/assets/men-tank-tops.jpg";
import menTrainingShorts from "@/assets/men-training-shorts.jpg";
import menPoloCollection from "@/assets/men-polo-collection.jpg";
import menVneckCollection from "@/assets/men-vneck-collection.jpg";
import menStripedCollection from "@/assets/men-striped-collection.jpg";
import menPrintedCollection from "@/assets/men-printed-collection.jpg";
import menFullSleeveCollection from "@/assets/men-full-sleeve-collection.jpg";
import menCategoryTraining from "@/assets/men-category-training.jpg";

const productImages = [
  { src: menHeroModel, alt: "Men's sportswear hero collection" },
  { src: menGymTees, alt: "Men's gym t-shirts and performance tees" },
  { src: menJoggers, alt: "Men's joggers and track pants" },
  { src: menTankTops, alt: "Men's tank tops and sleeveless shirts" },
  { src: menTrainingShorts, alt: "Men's training and gym shorts" },
  { src: menPoloCollection, alt: "Men's polo t-shirt collection" },
  { src: menVneckCollection, alt: "Men's v-neck t-shirt collection" },
  { src: menStripedCollection, alt: "Men's striped pattern t-shirts" },
  { src: menPrintedCollection, alt: "Men's printed design t-shirts" },
  { src: menFullSleeveCollection, alt: "Men's full sleeve shirts and jackets" },
  { src: menCategoryTraining, alt: "Men's training and workout apparel" },
  { src: menHero, alt: "Men's sportswear product range" },
];

const productCategories = [
  {
    name: "Gym T-Shirts",
    description: "Lightweight 160-180 GSM quick-dry polyester with mesh ventilation",
  },
  {
    name: "Training Shorts",
    description: "Flexible shorts with moisture-wicking fabric and secure pockets",
  },
  {
    name: "Joggers & Track Pants",
    description: "Tapered fit in 240-280 GSM cotton-poly with ribbed cuffs",
  },
  {
    name: "Tank Tops",
    description: "Breathable sleeveless options for intense workouts",
  },
  {
    name: "Polo T-Shirts",
    description: "Premium cotton-poly blend for sport-casual style",
  },
  {
    name: "Full Sleeve Performance",
    description: "Training jackets and long-sleeve compression wear",
  },
];

const specifications = [
  { icon: Package, label: "Fabric", value: "Polyester, Cotton-Poly Blend, Drifit, Nylon" },
  { icon: Shirt, label: "Products", value: "T-Shirts, Shorts, Joggers, Tank Tops, Jackets" },
  { icon: Ruler, label: "GSM Range", value: "160-280 GSM based on product type" },
  { icon: Palette, label: "Colors", value: "Solid, Heather, Printed - Export approved" },
  { icon: Box, label: "MOQ", value: "200+ pieces per style/color" },
  { icon: Tag, label: "Labeling", value: "OEM & Private Label available" },
];

const features = [
  "Moisture-wicking technology",
  "Quick-dry performance fabric",
  "4-way stretch for mobility",
  "Anti-odor treatment options",
  "UV protection fabric variants",
  "Flatlock seams for comfort",
  "Mesh panel ventilation",
  "Reflective print options",
];

const suitableFor = [
  "Gym & fitness brands",
  "Sports equipment retailers",
  "Athleisure D2C companies",
  "International sportswear distributors",
  "Team sports & uniform suppliers",
  "Corporate wellness programs",
];

const faqs = [
  {
    question: "What types of men's sportswear do you manufacture?",
    answer: "We manufacture a complete range including gym t-shirts, training shorts, joggers, track pants, tank tops, polo t-shirts, compression wear, and performance jackets. All products are made with premium fabrics suited for athletic performance.",
  },
  {
    question: "What fabric options are available?",
    answer: "We offer Polyester (100%), Cotton-Polyester blends (60/40, 65/35), Drifit performance fabric, and Nylon-Spandex blends. Each fabric is selected for specific performance characteristics like moisture-wicking, quick-dry, and stretch.",
  },
  {
    question: "Can you manufacture team sports uniforms?",
    answer: "Yes, we specialize in bulk production for team uniforms with custom printing, numbering, and branding. We support sublimation printing for full-color designs and can accommodate team size requirements.",
  },
  {
    question: "What is the production timeline?",
    answer: "Standard production is 3-4 weeks for white label orders and 6-8 weeks for custom private label development including sampling and approvals.",
  },
];

const MensSportswear = () => {
  return (
    <>
      <Helmet>
        <title>Men's Sportswear Manufacturer India | Gym & Athletic Wear Export | Feather Fashions</title>
        <meta
          name="description"
          content="Premium men's sportswear manufacturer in India. Gym t-shirts, joggers, shorts & athletic wear for bulk export. Private label & OEM supported from Tiruppur."
        />
        <meta
          name="keywords"
          content="men's sportswear manufacturer India, gym wear manufacturer, athletic wear exporter, men's joggers wholesale, sports t-shirts bulk, training shorts manufacturer Tiruppur"
        />
        <link rel="canonical" href="/products/mens-sportswear" />
      </Helmet>

      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center py-20">
        <div className="absolute inset-0 z-0">
          <img
            src={menHero}
            alt="Men's sportswear collection for export"
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
                Performance Fabric
              </span>
              <span className="inline-flex items-center px-3 py-1 bg-muted text-muted-foreground text-xs font-medium rounded-full">
                Bulk & Private Label
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-light text-foreground mb-6 leading-tight">
              Men's Sportswear Manufacturer for Global Markets
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
              High-performance gym wear, training apparel, and athleisure for men. Engineered with premium fabrics for athletes and fitness enthusiasts worldwide.
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
              Men's Sportswear Collection
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Complete range of athletic and gym wear for export markets
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {productImages.map((image, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
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

      {/* Product Categories */}
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
              What We Manufacture
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {productCategories.map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-6 bg-muted/30 rounded-xl border border-border hover:border-accent/50 transition-colors"
              >
                <h3 className="text-lg font-semibold text-foreground mb-2">{category.name}</h3>
                <p className="text-muted-foreground text-sm">{category.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features & Specifications */}
      <section className="py-20 bg-muted/30">
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

              <div className="grid sm:grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 bg-background rounded-lg"
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
                    className="flex items-start gap-4 p-4 bg-background rounded-lg"
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
                className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg"
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
              Source Men's Sportswear from India's Textile Hub
            </h2>
            <p className="text-background/70 text-lg mb-8">
              Connect with our export team for samples, pricing, and bulk production timelines.
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

export default MensSportswear;
