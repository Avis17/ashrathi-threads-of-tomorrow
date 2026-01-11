import { useEffect, useState, useRef } from "react";
import { Users, Package, Globe, Award, TrendingUp, CheckCircle } from "lucide-react";

const TrustScaleSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  const stats = [
    { 
      icon: Users, 
      value: 500, 
      suffix: "+", 
      label: "Wholesale Partners",
      gradient: "from-pink-500 to-rose-500"
    },
    { 
      icon: Package, 
      value: 50, 
      suffix: "K+", 
      label: "Units Monthly Capacity",
      gradient: "from-purple-500 to-indigo-500"
    },
    { 
      icon: Globe, 
      value: 15, 
      suffix: "+", 
      label: "Export Countries",
      gradient: "from-teal-500 to-cyan-500"
    },
    { 
      icon: Award, 
      value: 10, 
      suffix: "+", 
      label: "Years Experience",
      gradient: "from-gold to-amber-500"
    },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const AnimatedCounter = ({ value, suffix }: { value: number; suffix: string }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
      if (!isVisible) return;

      const duration = 2000;
      const steps = 60;
      const increment = value / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= value) {
          setCount(value);
          clearInterval(timer);
        } else {
          setCount(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }, [isVisible, value]);

    return <span>{count}{suffix}</span>;
  };

  return (
    <section ref={sectionRef} className="py-24 bg-gradient-to-br from-secondary via-secondary to-black relative overflow-hidden" aria-labelledby="trust-scale-heading">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full" aria-hidden="true">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-pink-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-teal-500/10 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gold/5 rounded-full blur-[120px]" />
      </div>
      
      <div className="container mx-auto px-6 relative z-10">
        <header className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-gold/10 border border-gold/20 rounded-full text-gold text-sm font-semibold tracking-wide uppercase mb-6">
            <TrendingUp className="h-4 w-4" aria-hidden="true" />
            Scale & Trust
          </span>
          <h2 id="trust-scale-heading" className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Trusted by Retailers &{" "}
            <span className="text-gradient-gold">Bulk Buyers Across India</span>
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Our track record speaks for itself. Join hundreds of successful wholesale partnerships.
          </p>
        </header>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16" role="list" aria-label="Company statistics">
          {stats.map((stat, index) => (
            <article 
              key={index}
              className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center hover:border-white/20 transition-all duration-500"
              role="listitem"
            >
              {/* Icon */}
              <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`} aria-hidden="true">
                <stat.icon className="h-8 w-8 text-white" aria-hidden="true" />
              </div>
              
              {/* Value */}
              <div className={`text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </div>
              
              {/* Label */}
              <p className="text-white/60 font-medium">{stat.label}</p>
            </article>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap justify-center gap-6" role="list" aria-label="Certifications and registrations">
          <div className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-full" role="listitem">
            <CheckCircle className="h-5 w-5 text-green-500" aria-hidden="true" />
            <span className="text-white/80">GST Registered</span>
          </div>
          <div className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-full" role="listitem">
            <CheckCircle className="h-5 w-5 text-green-500" aria-hidden="true" />
            <span className="text-white/80">IEC Certified Exporter</span>
          </div>
          <div className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-full" role="listitem">
            <CheckCircle className="h-5 w-5 text-green-500" aria-hidden="true" />
            <span className="text-white/80">Udyam Registered</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustScaleSection;
