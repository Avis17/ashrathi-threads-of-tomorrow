import { Zap, Palette, Scale } from "lucide-react";

const ConfidenceModelSection = () => {
  const pillars = [
    {
      icon: Zap,
      title: "FAST MOVERS ONLY",
      description: "We focus on proven, high-demand styles that sell quickly across markets",
      gradient: "from-pink-500 to-rose-500",
      bgGradient: "from-pink-500/10 to-rose-500/10"
    },
    {
      icon: Palette,
      title: "SIZE & COLOR FLEXIBILITY",
      description: "Customize size ratios and color assortments to match your market needs",
      gradient: "from-teal-500 to-cyan-500",
      bgGradient: "from-teal-500/10 to-cyan-500/10"
    },
    {
      icon: Scale,
      title: "FAIR ADJUSTMENT POLICY",
      description: "Transparent policies for quality issues and order adjustments",
      gradient: "from-gold to-amber-500",
      bgGradient: "from-gold/10 to-amber-500/10"
    },
  ];

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 via-gold to-teal-500" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 bg-gradient-to-r from-gold/10 to-gold/5 border border-gold/20 rounded-full text-gold text-sm font-semibold tracking-wide uppercase mb-6">
            Our Promise
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Feather{" "}
            <span className="text-gradient-gold">Safe Trade Model</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Designed to reduce dead stock risk for wholesale & export partners
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {pillars.map((pillar, index) => (
            <div 
              key={index}
              className="group relative"
            >
              {/* Card */}
              <div className={`relative bg-gradient-to-br ${pillar.bgGradient} border border-border/50 rounded-2xl p-8 text-center hover:border-border transition-all duration-500 h-full`}>
                {/* Icon */}
                <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${pillar.gradient} flex items-center justify-center shadow-lg`}>
                  <pillar.icon className="h-10 w-10 text-white" />
                </div>
                
                <h3 className="text-xl font-bold text-foreground mb-3">{pillar.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{pillar.description}</p>
              </div>

              {/* Connector Line (except last) */}
              {index < pillars.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-px bg-gradient-to-r from-border to-transparent" />
              )}
            </div>
          ))}
        </div>

        {/* Terms Note */}
        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground/60 italic">
            * Terms & conditions apply. Contact us for detailed partnership terms.
          </p>
        </div>
      </div>
    </section>
  );
};

export default ConfidenceModelSection;
