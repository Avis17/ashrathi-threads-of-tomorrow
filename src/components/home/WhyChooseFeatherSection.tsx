import { Shield, Factory, Package, LayoutDashboard, Globe, DollarSign } from "lucide-react";

const WhyChooseFeatherSection = () => {
  const features = [
    {
      icon: Shield,
      title: "Export-Ready Quality Control",
      description: "Multi-stage quality checks meeting international standards",
      gradient: "from-pink-500/20 to-purple-500/20",
      iconColor: "text-pink-400",
      glowColor: "group-hover:shadow-pink-500/20"
    },
    {
      icon: Factory,
      title: "Consistent Bulk Production",
      description: "Reliable capacity for large-scale orders with uniform quality",
      gradient: "from-purple-500/20 to-indigo-500/20",
      iconColor: "text-purple-400",
      glowColor: "group-hover:shadow-purple-500/20"
    },
    {
      icon: Package,
      title: "MOQ Flexibility",
      description: "Flexible minimum order quantities for new partnerships",
      gradient: "from-teal-500/20 to-cyan-500/20",
      iconColor: "text-teal-400",
      glowColor: "group-hover:shadow-teal-500/20"
    },
    {
      icon: LayoutDashboard,
      title: "Private Wholesale Dashboard",
      description: "Exclusive access to catalogs, pricing, and order tracking",
      gradient: "from-sky-500/20 to-blue-500/20",
      iconColor: "text-sky-400",
      glowColor: "group-hover:shadow-sky-500/20"
    },
    {
      icon: Globe,
      title: "Pan-India & Export Support",
      description: "Seamless logistics for domestic and international shipping",
      gradient: "from-orange-500/20 to-amber-500/20",
      iconColor: "text-orange-400",
      glowColor: "group-hover:shadow-orange-500/20"
    },
    {
      icon: DollarSign,
      title: "Transparent Pricing Model",
      description: "Clear wholesale pricing with no hidden costs",
      gradient: "from-gold/20 to-yellow-500/20",
      iconColor: "text-gold",
      glowColor: "group-hover:shadow-gold/20"
    },
  ];

  return (
    <section className="py-24 bg-secondary relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-gold/5 via-transparent to-purple-500/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 bg-gold/10 border border-gold/20 rounded-full text-gold text-sm font-semibold tracking-wide uppercase mb-6">
            Why Choose Us
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Why Exporters & Wholesale Buyers{" "}
            <span className="text-gradient-gold">Choose Feather</span>
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Built for scale, designed for trust. We understand what wholesale and export partners need.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div 
              key={index}
              className={`group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all duration-500 hover:shadow-2xl ${feature.glowColor}`}
            >
              {/* Glow Effect */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              <div className="relative z-10">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4`}>
                  <feature.icon className={`h-7 w-7 ${feature.iconColor}`} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-white/60">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseFeatherSection;
