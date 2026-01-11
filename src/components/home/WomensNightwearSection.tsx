import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Droplets, Palette, Shield, Package, Factory } from "lucide-react";
import nightwearImage from "@/assets/b2b/women-nightwear-collection.jpg";

const WomensNightwearSection = () => {
  const highlights = [
    { icon: Droplets, text: "Breathable cotton & cotton blends" },
    { icon: Shield, text: "Elastic waist, relaxed comfort fits" },
    { icon: Palette, text: "Colorfast dyeing (export standards)" },
    { icon: Package, text: "Ideal for retail chains & export buyers" },
    { icon: Factory, text: "Bulk production with consistency" },
  ];

  return (
    <section className="py-24 bg-secondary relative overflow-hidden">
      {/* Gradient Accent */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-pink-500/5 via-purple-500/5 to-transparent" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Image Side */}
          <div className="relative group">
            <div className="absolute -inset-4 bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-teal-500/20 rounded-3xl blur-2xl opacity-50 group-hover:opacity-75 transition-opacity duration-500" />
            <img 
              src={nightwearImage} 
              alt="Women's Nightwear Collection - Export Quality" 
              className="relative rounded-2xl w-full h-auto shadow-2xl"
            />
            
            {/* Floating Badge */}
            <div className="absolute -bottom-6 -right-6 bg-gradient-to-br from-pink-500 to-purple-600 text-white px-6 py-4 rounded-xl shadow-lg">
              <div className="text-sm font-medium opacity-80">Fast-Moving</div>
              <div className="text-lg font-bold">Export Styles</div>
            </div>
          </div>

          {/* Content Side */}
          <div className="lg:pl-8">
            <span className="inline-block px-4 py-2 bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20 rounded-full text-pink-400 text-sm font-semibold tracking-wide uppercase mb-6">
              Women's Collection
            </span>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              Women's Nightwear —{" "}
              <span className="text-gradient-gold">Fast-Moving Export Styles</span>
            </h2>

            <p className="text-lg text-white/70 mb-8 leading-relaxed">
              Designed for comfort, repeat sales, and global appeal.
              Our women's night pants and tops are crafted using export-grade cotton with consistent sizing, 
              rich color retention, and high demand across domestic and international markets.
            </p>

            {/* Highlights */}
            <div className="space-y-4 mb-8">
              {highlights.map((item, index) => (
                <div key={index} className="flex items-center gap-3 group/item">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center group-hover/item:from-pink-500/30 group-hover/item:to-purple-500/30 transition-all">
                    <item.icon className="h-5 w-5 text-pink-400" />
                  </div>
                  <span className="text-white/80">{item.text}</span>
                </div>
              ))}
            </div>

            {/* Price Hint */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-8">
              <p className="text-gold text-sm font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Wholesale pricing available after verification
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                asChild 
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-6"
              >
                <Link to="/products">
                  View Wholesale Catalog
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button 
                asChild 
                variant="outline" 
                className="border-white/20 text-white hover:bg-white/10"
              >
                <Link to="/contact">
                  Request Export Pricing
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
