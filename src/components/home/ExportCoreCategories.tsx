import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";

// Import images
import cottonTshirtsImg from "@/assets/export-cotton-tshirts.jpg";
import pyjamasCasualImg from "@/assets/export-pyjamas-casualwear.jpg";
import innerwearBasicsImg from "@/assets/export-innerwear-basics.jpg";

const categories = [
  {
    title: "Cotton T-Shirts",
    image: cottonTshirtsImg,
    alt: "Premium cotton T-shirts manufactured in India for wholesale export",
    description: "High-demand cotton T-shirts designed for bulk export and wholesale supply. Manufactured with consistent sizing, smooth finishes, and long-lasting fabric quality suitable for international retail markets.",
    highlights: [
      "100% cotton & cotton blends",
      "Consistent GSM & sizing",
      "Ideal for bulk export programs",
      "Suitable for private label supply"
    ],
    cta: "View Wholesale Range",
    link: "/products"
  },
  {
    title: "Pyjamas & Casual Wear",
    image: pyjamasCasualImg,
    alt: "Cotton pyjamas and casual wear exported from Tiruppur India",
    description: "Comfortable, climate-friendly pyjamas and casual wear collections developed for strong repeat demand in domestic and international markets.",
    highlights: [
      "Breathable cotton fabrics",
      "Comfort-focused fits",
      "Year-round demand products",
      "High repeat-order potential"
    ],
    cta: "Explore Export Collection",
    link: "/products"
  },
  {
    title: "Innerwear & Basics",
    image: innerwearBasicsImg,
    alt: "Innerwear and basic garments wholesale supplier from India",
    description: "Essential innerwear and basic garments manufactured with quality consistency, durability, and comfort, suitable for bulk wholesale and export markets.",
    highlights: [
      "Soft, skin-friendly fabrics",
      "Consistent bulk production",
      "Ideal for distributor supply",
      "Low return, high turnover category"
    ],
    cta: "Request Wholesale Access",
    link: "/contact"
  }
];

const ExportCoreCategories = () => {
  return (
    <section className="py-20 bg-foreground text-background relative overflow-hidden">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-accent/10 pointer-events-none" />
      
      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 bg-accent/20 text-accent text-xs font-semibold tracking-[0.2em] uppercase rounded-full mb-4">
            Core Export Categories
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Export-Ready Core Garment Categories
          </h2>
          <p className="text-background/70 max-w-2xl mx-auto text-lg">
            High-volume, consistent-quality apparel manufactured in India for global markets.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((category, index) => (
            <article 
              key={index} 
              className="group bg-background/5 backdrop-blur-sm border border-background/10 rounded-2xl overflow-hidden hover:border-accent/50 transition-all duration-500"
            >
              {/* Image Container */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={category.image}
                  alt={category.alt}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  width={400}
                  height={300}
                  loading="lazy"
                  decoding="async"
                />
                {/* Gold accent line */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-accent/0 via-accent to-accent/0 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-background mb-3 group-hover:text-accent transition-colors">
                  {category.title}
                </h3>
                <p className="text-background/60 text-sm mb-4 leading-relaxed">
                  {category.description}
                </p>

                {/* Highlights */}
                <ul className="space-y-2 mb-6">
                  {category.highlights.map((highlight, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-background/80">
                      <CheckCircle className="h-4 w-4 text-accent flex-shrink-0" />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Button 
                  asChild 
                  variant="outline" 
                  className="w-full border-accent/30 text-accent hover:bg-accent hover:text-accent-foreground hover:border-accent transition-all group/btn"
                >
                  <Link to={category.link}>
                    {category.cta}
                    <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </article>
          ))}
        </div>

        {/* Bottom Trust Badge */}
        <div className="mt-12 text-center">
          <p className="text-background/50 text-sm">
            All categories manufactured in our Tiruppur facility with consistent quality control for international export standards.
          </p>
        </div>
      </div>
    </section>
  );
};

export default ExportCoreCategories;
