import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Globe, Sparkles } from "lucide-react";
import heroImage from "@/assets/b2b/hero-nightwear-kidswear.jpg";

const ExportHeroSection = () => {
  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-secondary">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      
      {/* Premium Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/75 to-black/50" />
      
      {/* Vibrant Accent Glow */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-gradient-to-br from-pink-500/20 via-purple-500/15 to-transparent rounded-full blur-[128px]" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-gradient-to-br from-teal-500/15 via-sky-500/10 to-transparent rounded-full blur-[128px]" />
      
      <div className="relative z-10 container mx-auto px-6 py-20">
        <div className="max-w-4xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-3 mb-8 animate-fade-in">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-gold/20 to-gold/10 border border-gold/30">
              <Sparkles className="w-4 h-4 text-gold" />
              <span className="text-gold text-sm font-semibold tracking-wide uppercase">
                Export-Ready Manufacturer
              </span>
            </div>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1.05] mb-6 animate-fade-in-up">
            Premium Wholesale{" "}
            <span className="text-gradient-gold">Nightwear & Kidswear</span>
            <br />
            <span className="text-white/90">Manufactured for Global Markets</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-white/70 max-w-2xl mb-10 leading-relaxed animate-fade-in-delay">
            Export-ready designs. Color-rich collections. Consistent quality at scale.
            <br className="hidden md:block" />
            Trusted by wholesalers & exporters across India and international markets.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-delay-2">
            <Button 
              asChild 
              size="lg" 
              className="bg-gradient-to-r from-gold to-gold/80 text-black hover:from-gold/90 hover:to-gold/70 px-8 py-6 text-base font-bold shadow-lg shadow-gold/25"
            >
              <Link to="/contact">
                <Globe className="mr-2 h-5 w-5" />
                Request Wholesale / Export Access
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center gap-8 mt-14 pt-8 border-t border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center">
                <span className="text-xl font-bold text-pink-400">50+</span>
              </div>
              <span className="text-white/60 text-sm">Active Wholesale<br/>Partners</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500/20 to-sky-500/20 flex items-center justify-center">
                <span className="text-xl font-bold text-teal-400">10+</span>
              </div>
              <span className="text-white/60 text-sm">Export<br/>Countries</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold/20 to-orange-500/20 flex items-center justify-center">
                <span className="text-xl font-bold text-gold">IEC</span>
              </div>
              <span className="text-white/60 text-sm">Export<br/>Certified</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExportHeroSection;
