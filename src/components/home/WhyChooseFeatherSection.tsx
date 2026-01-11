import { Shield, Factory, Package, LayoutDashboard, Globe, DollarSign } from "lucide-react";
import { useTranslation } from "react-i18next";

const WhyChooseFeatherSection = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: Shield,
      titleKey: "whyChoose.features.qualityControl.title",
      descKey: "whyChoose.features.qualityControl.description",
      gradient: "from-pink-500/20 to-purple-500/20",
      iconColor: "text-pink-400",
      glowColor: "group-hover:shadow-pink-500/20"
    },
    {
      icon: Factory,
      titleKey: "whyChoose.features.bulkProduction.title",
      descKey: "whyChoose.features.bulkProduction.description",
      gradient: "from-purple-500/20 to-indigo-500/20",
      iconColor: "text-purple-400",
      glowColor: "group-hover:shadow-purple-500/20"
    },
    {
      icon: Package,
      titleKey: "whyChoose.features.moqFlexibility.title",
      descKey: "whyChoose.features.moqFlexibility.description",
      gradient: "from-teal-500/20 to-cyan-500/20",
      iconColor: "text-teal-400",
      glowColor: "group-hover:shadow-teal-500/20"
    },
    {
      icon: LayoutDashboard,
      titleKey: "whyChoose.features.dashboard.title",
      descKey: "whyChoose.features.dashboard.description",
      gradient: "from-sky-500/20 to-blue-500/20",
      iconColor: "text-sky-400",
      glowColor: "group-hover:shadow-sky-500/20"
    },
    {
      icon: Globe,
      titleKey: "whyChoose.features.exportSupport.title",
      descKey: "whyChoose.features.exportSupport.description",
      gradient: "from-orange-500/20 to-amber-500/20",
      iconColor: "text-orange-400",
      glowColor: "group-hover:shadow-orange-500/20"
    },
    {
      icon: DollarSign,
      titleKey: "whyChoose.features.pricing.title",
      descKey: "whyChoose.features.pricing.description",
      gradient: "from-gold/20 to-yellow-500/20",
      iconColor: "text-gold",
      glowColor: "group-hover:shadow-gold/20"
    },
  ];

  return (
    <section className="py-24 bg-secondary relative overflow-hidden" aria-labelledby="why-choose-heading">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-gold/5 via-transparent to-purple-500/5 rounded-full blur-3xl" aria-hidden="true" />
      
      <div className="container mx-auto px-6 relative z-10">
        <header className="text-center mb-16">
          <span className="inline-block px-4 py-2 bg-gold/10 border border-gold/20 rounded-full text-gold text-sm font-semibold tracking-wide uppercase mb-6">
            {t('whyChoose.badge')}
          </span>
          <h2 id="why-choose-heading" className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            {t('whyChoose.title')}{" "}
            <span className="text-gradient-gold">{t('whyChoose.titleHighlight')}</span>
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            {t('whyChoose.description')}
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" role="list">
          {features.map((feature, index) => (
            <article 
              key={index}
              className={`group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all duration-500 hover:shadow-2xl ${feature.glowColor}`}
              role="listitem"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} aria-hidden="true" />
              
              <div className="relative z-10">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4`} aria-hidden="true">
                  <feature.icon className={`h-7 w-7 ${feature.iconColor}`} aria-hidden="true" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{t(feature.titleKey)}</h3>
                <p className="text-white/60">{t(feature.descKey)}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseFeatherSection;
