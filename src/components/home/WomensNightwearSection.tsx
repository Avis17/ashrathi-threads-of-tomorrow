import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Droplets, Palette, Shield, Package, Factory } from "lucide-react";
import { useTranslation } from "react-i18next";
import nightwearImage from "@/assets/b2b/women-nightwear-collection.jpg";

const WomensNightwearSection = () => {
  const { t } = useTranslation();

  const highlights = [
    { icon: Droplets, textKey: "womensSection.highlights.breathable" },
    { icon: Shield, textKey: "womensSection.highlights.elastic" },
    { icon: Palette, textKey: "womensSection.highlights.colorfast" },
    { icon: Package, textKey: "womensSection.highlights.ideal" },
    { icon: Factory, textKey: "womensSection.highlights.bulk" },
  ];

  return (
    <section className="py-24 bg-secondary relative overflow-hidden" aria-labelledby="womens-nightwear-heading">
      {/* Gradient Accent */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l rtl:bg-gradient-to-r from-pink-500/5 via-purple-500/5 to-transparent" aria-hidden="true" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Image Side */}
          <div className="relative group">
            <div className="absolute -inset-4 bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-teal-500/20 rounded-3xl blur-2xl opacity-50 group-hover:opacity-75 transition-opacity duration-500" aria-hidden="true" />
            <img 
              src={nightwearImage} 
              alt="Women cotton night pants and night tops manufactured in Tiruppur for wholesale and export"
              className="relative rounded-2xl w-full h-auto shadow-2xl"
              width={600}
              height={450}
              loading="lazy"
              decoding="async"
            />
            
            {/* Floating Badge */}
            <div className="absolute -bottom-6 -right-6 rtl:-right-auto rtl:-left-6 bg-gradient-to-br from-pink-500 to-purple-600 text-white px-6 py-4 rounded-xl shadow-lg">
              <div className="text-sm font-medium opacity-80">{t('womensSection.floatingBadge.label')}</div>
              <div className="text-lg font-bold">{t('womensSection.floatingBadge.value')}</div>
            </div>
          </div>

          {/* Content Side */}
          <div className="lg:pl-8 rtl:lg:pl-0 rtl:lg:pr-8">
            <span className="inline-block px-4 py-2 bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20 rounded-full text-pink-400 text-sm font-semibold tracking-wide uppercase mb-6">
              {t('womensSection.badge')}
            </span>

            <h2 id="womens-nightwear-heading" className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              {t('womensSection.title')}{" "}
              <span className="text-gradient-gold">{t('womensSection.titleHighlight')}</span>
            </h2>

            <p className="text-lg text-white/70 mb-8 leading-relaxed">
              {t('womensSection.description')}
            </p>

            {/* Highlights */}
            <ul className="space-y-4 mb-8" aria-label="Product features">
              {highlights.map((item, index) => (
                <li key={index} className="flex items-center gap-3 group/item">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center group-hover/item:from-pink-500/30 group-hover/item:to-purple-500/30 transition-all" aria-hidden="true">
                    <item.icon className="h-5 w-5 text-pink-400" aria-hidden="true" />
                  </div>
                  <span className="text-white/80">{t(item.textKey)}</span>
                </li>
              ))}
            </ul>

            {/* Price Hint */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-8">
              <p className="text-gold text-sm font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4" aria-hidden="true" />
                {t('womensSection.priceHint')}
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                asChild 
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-6"
              >
                <Link to="/products" aria-label="View women's nightwear wholesale catalog">
                  {t('cta.viewWholesaleCatalog')}
                  <ArrowRight className="ml-2 rtl:ml-0 rtl:mr-2 h-4 w-4 rtl:rotate-180" aria-hidden="true" />
                </Link>
              </Button>
              <Button 
                asChild 
                variant="outline" 
                className="border-white/20 text-white hover:bg-white/10"
              >
                <Link to="/contact" aria-label="Request export pricing for women's nightwear">
                  {t('cta.requestExportPricing')}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WomensNightwearSection;
