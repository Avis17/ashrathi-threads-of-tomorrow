import { ArrowRight, Check, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import heatFusedLabel from "@/assets/leggings-features/heat-fused-label.jpg";
import upfProtection from "@/assets/leggings-features/upf-protection.jpg";
import highWaistedFit from "@/assets/leggings-features/high-waisted-fit.jpg";
import fourWayStretch from "@/assets/leggings-features/4-way-stretch.jpg";
import elasticWaistband from "@/assets/leggings-features/elastic-waistband.jpg";
import doubleLayeredWaist from "@/assets/leggings-features/double-layered-waist.jpg";
import triangleGusset from "@/assets/leggings-features/triangle-gusset.jpg";
import sidePocket from "@/assets/leggings-features/side-pocket.jpg";

const features = [
  {
    title: "Heat-Fused Care Label",
    subtitle: "Smooth & Irritation-Free",
    description: "Experience ultimate comfort with our heat-fused labels that eliminate scratchy tags. No more irritation, just pure softness against your skin.",
    image: heatFusedLabel,
    icon: "✨",
    gradient: "from-pink-500 to-rose-500"
  },
  {
    title: "UPF 50+ Protection",
    subtitle: "Advanced Sun Protection",
    description: "Stay protected during outdoor activities with built-in UPF 50+ sun protection. Block 98% of harmful UV rays while staying active under the sun.",
    image: upfProtection,
    icon: "☀️",
    gradient: "from-amber-500 to-orange-500"
  },
  {
    title: "High-Waisted Fit",
    subtitle: "Flattering & Supportive",
    description: "Our high-rise design provides exceptional core support and a flattering silhouette. Stays in place during any activity, no constant adjusting needed.",
    image: highWaistedFit,
    icon: "👗",
    gradient: "from-purple-500 to-pink-500"
  },
  {
    title: "4-Way Stretch Fabric",
    subtitle: "Ultimate Freedom of Movement",
    description: "Move without limits with our premium 4-way stretch technology. The fabric moves with you in every direction, perfect for yoga, running, or everyday wear.",
    image: fourWayStretch,
    icon: "🤸",
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    title: "Comfortable Elastic Waistband",
    subtitle: "No-Dig Comfort",
    description: "Soft, flexible elastic that stays comfortable all day long. Won't dig in or roll down, providing consistent support without restriction.",
    image: elasticWaistband,
    icon: "🎯",
    gradient: "from-green-500 to-emerald-500"
  },
  {
    title: "Double-Layered Waistband",
    subtitle: "Extra Support & Coverage",
    description: "Two layers of premium fabric for enhanced support and smoothing. Provides a secure fit while creating a sleek, streamlined appearance.",
    image: doubleLayeredWaist,
    icon: "💪",
    gradient: "from-indigo-500 to-purple-500"
  },
  {
    title: "Triangle-Shaped Gusset",
    subtitle: "Engineered for Comfort",
    description: "Anatomically designed gusset construction prevents chafing and ensures optimal comfort during high-intensity workouts or all-day wear.",
    image: triangleGusset,
    icon: "🔺",
    gradient: "from-red-500 to-pink-500"
  },
  {
    title: "Functional Side Pocket",
    subtitle: "Secure Storage",
    description: "Deep, secure pockets that keep your essentials safe during any activity. Perfect for your phone, keys, or cards without adding bulk.",
    image: sidePocket,
    icon: "📱",
    gradient: "from-teal-500 to-cyan-500"
  }
];

export default function LeggingsFeatures() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-purple-600 via-pink-500 to-rose-500 text-white py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-white/20 border-white/40 text-white backdrop-blur-sm px-4 py-2 text-base animate-fade-in">
              <Sparkles className="h-4 w-4 mr-2 inline" />
              Premium Leggings Technology
            </Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 animate-fade-in leading-tight">
              Experience the
              <span className="block bg-gradient-to-r from-yellow-200 to-pink-200 bg-clip-text text-transparent">
                Perfect Fit
              </span>
            </h1>
            <p className="text-lg md:text-xl mb-8 text-white/90 max-w-2xl mx-auto animate-fade-in leading-relaxed">
              Discover why thousands of women trust Feather Fashions for their everyday comfort. 
              Every detail engineered for your ultimate comfort and confidence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
              <Link to="/products">
                <Button size="lg" className="bg-white text-purple-600 hover:bg-white/90 shadow-2xl shadow-purple-900/50 px-8 py-6 text-lg group">
                  Shop Now
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/size-chart/womens-leggings">
                <Button size="lg" variant="outline" className="border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 px-8 py-6 text-lg">
                  📏 Find Your Size
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Floating elements for visual interest */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse delay-1000" />
      </section>

      {/* Features Grid */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              8 Premium Features
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Every feature carefully crafted to deliver exceptional comfort, performance, and style
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 md:gap-12 max-w-7xl mx-auto">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="group overflow-hidden hover:shadow-2xl transition-all duration-500 border-2 hover:border-primary/50 bg-card/50 backdrop-blur-sm animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-0">
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                    <div className={`absolute top-4 left-4 bg-gradient-to-r ${feature.gradient} text-white px-4 py-2 rounded-full text-3xl shadow-lg`}>
                      {feature.icon}
                    </div>
                  </div>
                  
                  <div className="p-6 md:p-8 space-y-4">
                    <div>
                      <Badge className={`mb-3 bg-gradient-to-r ${feature.gradient} text-white border-0`}>
                        {feature.subtitle}
                      </Badge>
                      <h3 className="text-2xl md:text-3xl font-bold mb-3 group-hover:text-primary transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2 text-primary font-semibold">
                      <Check className="h-5 w-5" />
                      <span>Premium Quality Guaranteed</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-purple-600 via-pink-500 to-rose-500 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Ready to Experience Premium Comfort?
            </h2>
            <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
              Join thousands of satisfied customers who've made the switch to Feather Fashions leggings
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/products">
                <Button size="lg" className="bg-white text-purple-600 hover:bg-white/90 shadow-2xl px-8 py-6 text-lg group">
                  Shop Collection
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 px-8 py-6 text-lg">
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { icon: "✓", text: "Premium Quality" },
              { icon: "🚚", text: "Fast Shipping" },
              { icon: "💯", text: "100% Satisfaction" },
              { icon: "🔒", text: "Secure Checkout" }
            ].map((badge, i) => (
              <div key={i} className="text-center p-4 animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="text-4xl mb-2">{badge.icon}</div>
                <p className="font-semibold text-sm">{badge.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
