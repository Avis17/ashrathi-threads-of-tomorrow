import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Heart, Sun, Palette, Ruler, Package } from "lucide-react";
import { useTranslation } from "react-i18next";
import kidsImage from "@/assets/b2b/kids-colorful-sets.jpg";

const KidswearSection = () => {
  const { t } = useTranslation();

  const highlights = [
    { icon: Heart, textKey: "kidsSection.highlights.skinFriendly" },
    { icon: Sun, textKey: "kidsSection.highlights.colorVibrancy" },
    { icon: Palette, textKey: "kidsSection.highlights.printSolid" },
    { icon: Ruler, textKey: "kidsSection.highlights.sizeRanges" },
    { icon: Package, textKey: "kidsSection.highlights.bulkSupply" },
  ];

  return (
    <section className="py-24 bg-background relative overflow-hidden" aria-labelledby="kidswear-heading">
      {/* Gradient Accent */}
      <div className="absolute top-0 left-0 rtl:left-auto rtl:right-0 w-1/2 h-full bg-gradient-to-r rtl:bg-gradient-to-l from-teal-500/5 via-sky-500/5 to-transparent" aria-hidden="true" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content Side */}
          <div className="lg:pr-8 rtl:lg:pr-0 rtl:lg:pl-8 order-2 lg:order-1">
            <span className="inline-block px-4 py-2 bg-gradient-to-r from-teal-500/10 to-sky-500/10 border border-teal-500/20 rounded-full text-teal-600 dark:text-teal-400 text-sm font-semibold tracking-wide uppercase mb-6">
              {t('kidsSection.badge')}
            </span>

            <h2 id="kidswear-heading" className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
              {t('kidsSection.title')}{" "}
              <span className="text-gradient-gold">{t('kidsSection.titleHighlight')}</span>
            </h2>

            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              {t('kidsSection.description')}
            </p>

            {/* Highlights Grid */}
            <ul className="grid grid-cols-2 gap-4 mb-8" aria-label="Kidswear product features">
              {highlights.map((item, index) => (
                <li key={index} className="flex items-center gap-3 group/item">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500/20 to-sky-500/20 flex items-center justify-center group-hover/item:from-teal-500/30 group-hover/item:to-sky-500/30 transition-all" aria-hidden="true">
                    <item.icon className="h-5 w-5 text-teal-500" aria-hidden="true" />
                  </div>
                  <span className="text-foreground/80 text-sm">{t(item.textKey)}</span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <Button 
              asChild 
              className="bg-gradient-to-r from-teal-500 to-sky-500 hover:from-teal-600 hover:to-sky-600 text-white px-8"
            >
              <Link to="/products" aria-label="Explore kids clothing wholesale range for export">
                {t('cta.exploreKidsRange')}
                <ArrowRight className="ml-2 rtl:ml-0 rtl:mr-2 h-4 w-4 rtl:rotate-180" aria-hidden="true" />
              </Link>
            </Button>
          </div>

          {/* Image Side */}
          <div className="relative group order-1 lg:order-2">
            <div className="absolute -inset-4 bg-gradient-to-br from-teal-500/20 via-sky-500/20 to-pink-500/20 rounded-3xl blur-2xl opacity-50 group-hover:opacity-75 transition-opacity duration-500" aria-hidden="true" />
            <img 
              src={kidsImage} 
              alt="Colorful kids cotton clothing sets manufactured in India for export markets"
              className="relative rounded-2xl w-full h-auto shadow-2xl"
              width={600}
              height={450}
              loading="lazy"
              decoding="async"
            />
            
            {/* Floating Badge */}
            <div className="absolute -bottom-6 -left-6 rtl:-left-auto rtl:-right-6 bg-gradient-to-br from-teal-500 to-sky-500 text-white px-6 py-4 rounded-xl shadow-lg">
              <div className="text-sm font-medium opacity-80">{t('kidsSection.floatingBadge.label')}</div>
              <div className="text-lg font-bold">{t('kidsSection.floatingBadge.value')}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default KidswearSection;
