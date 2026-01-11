import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

// Import images
import cottonTshirtsImg from "@/assets/export-cotton-tshirts.jpg";
import pyjamasCasualImg from "@/assets/export-pyjamas-casualwear.jpg";
import innerwearBasicsImg from "@/assets/export-innerwear-basics.jpg";

const ExportCoreCategories = () => {
  const { t } = useTranslation();

  const categories = [
    {
      titleKey: "exportCategories.cottonTshirts.title",
      image: cottonTshirtsImg,
      alt: "Premium cotton T-shirts manufactured in India for wholesale export",
      descriptionKey: "exportCategories.cottonTshirts.description",
      highlightKeys: [
        "exportCategories.cottonTshirts.highlights.0",
        "exportCategories.cottonTshirts.highlights.1",
        "exportCategories.cottonTshirts.highlights.2",
        "exportCategories.cottonTshirts.highlights.3"
      ],
      ctaKey: "exportCategories.cottonTshirts.cta",
      link: "/products"
    },
    {
      titleKey: "exportCategories.pyjamasCasual.title",
      image: pyjamasCasualImg,
      alt: "Cotton pyjamas and casual wear exported from Tiruppur India",
      descriptionKey: "exportCategories.pyjamasCasual.description",
      highlightKeys: [
        "exportCategories.pyjamasCasual.highlights.0",
        "exportCategories.pyjamasCasual.highlights.1",
        "exportCategories.pyjamasCasual.highlights.2",
        "exportCategories.pyjamasCasual.highlights.3"
      ],
      ctaKey: "exportCategories.pyjamasCasual.cta",
      link: "/products"
    },
    {
      titleKey: "exportCategories.innerwearBasics.title",
      image: innerwearBasicsImg,
      alt: "Innerwear and basic garments wholesale supplier from India",
      descriptionKey: "exportCategories.innerwearBasics.description",
      highlightKeys: [
        "exportCategories.innerwearBasics.highlights.0",
        "exportCategories.innerwearBasics.highlights.1",
        "exportCategories.innerwearBasics.highlights.2",
        "exportCategories.innerwearBasics.highlights.3"
      ],
      ctaKey: "exportCategories.innerwearBasics.cta",
      link: "/contact"
    }
  ];

  return (
    <section className="py-20 bg-foreground text-background relative overflow-hidden">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-accent/10 pointer-events-none" />
      
      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 bg-accent/20 text-accent text-xs font-semibold tracking-[0.2em] uppercase rounded-full mb-4">
            {t('exportCategories.badge')}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t('exportCategories.title')}
          </h2>
          <p className="text-background/70 max-w-2xl mx-auto text-lg">
            {t('exportCategories.description')}
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
                  {t(category.titleKey)}
                </h3>
                <p className="text-background/60 text-sm mb-4 leading-relaxed">
                  {t(category.descriptionKey)}
                </p>

                {/* Highlights */}
                <ul className="space-y-2 mb-6">
                  {category.highlightKeys.map((highlightKey, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-background/80">
                      <CheckCircle className="h-4 w-4 text-accent flex-shrink-0" />
                      <span>{t(highlightKey)}</span>
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
                    {t(category.ctaKey)}
                    <ArrowRight className="ml-2 rtl:ml-0 rtl:mr-2 h-4 w-4 group-hover/btn:translate-x-1 rtl:group-hover/btn:-translate-x-1 transition-transform rtl:rotate-180" />
                  </Link>
                </Button>
              </div>
            </article>
          ))}
        </div>

        {/* Bottom Trust Badge */}
        <div className="mt-12 text-center">
          <p className="text-background/50 text-sm">
            {t('exportCategories.trustNote')}
          </p>
        </div>
      </div>
    </section>
  );
};

export default ExportCoreCategories;
