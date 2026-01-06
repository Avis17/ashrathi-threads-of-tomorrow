import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import heroImage from "@/assets/home/hero-women.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-[100vh] flex items-center overflow-hidden bg-secondary">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40" />
      
      {/* Animated Gradient Orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-accent/20 rounded-full blur-[128px] animate-pulse" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent/10 rounded-full blur-[128px] animate-pulse" style={{ animationDelay: '1s' }} />
      
      <div className="container mx-auto px-6 py-20 lg:py-0">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Content */}
          <div className="relative z-10 text-center lg:text-left order-2 lg:order-1">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-8 animate-fade-in">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent tracking-wide">NEW COLLECTION 2025</span>
            </div>
            
            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-athletic font-black text-primary-foreground leading-[0.95] mb-6 animate-fade-in-up">
              ELEVATE YOUR
              <span className="block text-accent">PERFORMANCE</span>
            </h1>
            
            {/* Subheadline */}
            <p className="text-lg md:text-xl text-primary-foreground/70 max-w-md mx-auto lg:mx-0 mb-10 animate-fade-in-delay">
              Premium activewear engineered for champions. Experience the perfect fusion of style, comfort & technology.
            </p>
            
            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in-delay-2">
              <Link 
                to="/shop" 
                className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-accent text-accent-foreground font-athletic font-bold tracking-wider text-sm hover:bg-accent/90 transition-all duration-300 hover:gap-4"
              >
                SHOP NOW
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                to="/collections" 
                className="inline-flex items-center justify-center gap-3 px-8 py-4 border border-primary-foreground/20 text-primary-foreground font-athletic font-bold tracking-wider text-sm hover:bg-primary-foreground/10 transition-all duration-300"
              >
                EXPLORE COLLECTIONS
              </Link>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-16 pt-8 border-t border-primary-foreground/10">
              {[
                { value: "50K+", label: "Happy Customers" },
                { value: "100%", label: "Premium Quality" },
                { value: "24/7", label: "Support" },
              ].map((stat, index) => (
                <div key={index} className="text-center lg:text-left">
                  <div className="text-2xl md:text-3xl font-athletic font-bold text-accent">{stat.value}</div>
                  <div className="text-xs text-primary-foreground/50 tracking-wide mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Hero Image */}
          <div className="relative order-1 lg:order-2">
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent/30 to-transparent rounded-3xl blur-3xl scale-110" />
            
            {/* Main Image */}
            <div className="relative">
              <img 
                src={heroImage} 
                alt="Premium Activewear Collection" 
                className="w-full h-auto rounded-3xl shadow-2xl animate-scale-in"
              />
              
              {/* Floating Badge */}
              <div className="absolute -bottom-6 -left-6 lg:-left-12 bg-background p-6 rounded-2xl shadow-xl border border-border">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center">
                    <span className="text-2xl font-athletic font-black text-accent">%</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Flash Sale</div>
                    <div className="text-xl font-athletic font-bold text-foreground">UP TO 40% OFF</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
        <span className="text-xs text-primary-foreground/40 tracking-widest">SCROLL</span>
        <div className="w-px h-8 bg-gradient-to-b from-primary-foreground/40 to-transparent" />
      </div>
    </section>
  );
};

export default HeroSection;
