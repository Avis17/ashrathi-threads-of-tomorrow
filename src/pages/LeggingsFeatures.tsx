import { ArrowRight, Sparkles, Shield, Wind, Zap, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import heatFusedLabel from "@/assets/leggings-features/heat-fused-label.jpg";
import upfProtection from "@/assets/leggings-features/upf-protection.jpg";
import highWaistedFit from "@/assets/leggings-features/high-waisted-fit.jpg";
import fourWayStretch from "@/assets/leggings-features/4-way-stretch.jpg";
import elasticWaistband from "@/assets/leggings-features/elastic-waistband.jpg";
import doubleLayeredWaist from "@/assets/leggings-features/double-layered-waist.jpg";
import triangleGusset from "@/assets/leggings-features/triangle-gusset.jpg";
import sidePocket from "@/assets/leggings-features/side-pocket.jpg";

export default function LeggingsFeatures() {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Hero Section - Full Width */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/20 to-background">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-20 left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" />
          </div>
        </div>
        
        <div className="relative z-10 text-center max-w-5xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-background/40 backdrop-blur-xl border border-border/50 mb-8 animate-fade-in">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Premium Activewear Technology</span>
          </div>
          
          <h1 className="text-7xl md:text-8xl lg:text-9xl font-bold mb-6 animate-fade-in">
            <span className="block text-foreground">Engineered</span>
            <span className="block bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Perfection
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 animate-fade-in leading-relaxed font-light">
            Every detail meticulously crafted for ultimate comfort, performance, and style.
            Experience the future of activewear.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
            <Link to="/products">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-10 py-7 text-lg rounded-full group shadow-2xl shadow-primary/20">
                Explore Collection
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-border/50 flex items-start justify-center p-2">
            <div className="w-1 h-3 bg-primary rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* Feature 1: Heat-Fused Label */}
      <section className="relative py-32 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative order-2 lg:order-1">
              <div className="absolute -inset-4 bg-gradient-to-br from-primary/20 to-accent/20 rounded-[3rem] blur-3xl" />
              <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-700">
                <img src={heatFusedLabel} alt="Heat-Fused Care Label" className="w-full h-[600px] object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
              </div>
            </div>
            
            <div className="order-1 lg:order-2 space-y-8">
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-primary/10 backdrop-blur-xl border border-primary/20">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="text-sm font-semibold text-primary uppercase tracking-wider">Innovation</span>
              </div>
              
              <h2 className="text-5xl md:text-6xl font-bold text-foreground leading-tight">
                Heat-Fused<br />Care Label
              </h2>
              
              <p className="text-xl text-muted-foreground leading-relaxed font-light">
                Experience next-level comfort with our revolutionary heat-fused technology. 
                Say goodbye to irritating tags and scratchy labels forever.
              </p>
              
              <div className="flex gap-4 pt-4">
                <div className="flex-1 p-6 rounded-2xl bg-muted/50 backdrop-blur-sm border border-border/50">
                  <div className="text-3xl font-bold text-foreground mb-2">100%</div>
                  <div className="text-sm text-muted-foreground">Irritation-Free</div>
                </div>
                <div className="flex-1 p-6 rounded-2xl bg-muted/50 backdrop-blur-sm border border-border/50">
                  <div className="text-3xl font-bold text-foreground mb-2">0</div>
                  <div className="text-sm text-muted-foreground">Scratchy Tags</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature 2: UPF Protection */}
      <section className="relative py-32 bg-gradient-to-br from-muted/30 to-background overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-accent/10 backdrop-blur-xl border border-accent/20">
                <Shield className="h-5 w-5 text-accent" />
                <span className="text-sm font-semibold text-accent uppercase tracking-wider">Protection</span>
              </div>
              
              <h2 className="text-5xl md:text-6xl font-bold text-foreground leading-tight">
                UPF 50+<br />Sun Protection
              </h2>
              
              <p className="text-xl text-muted-foreground leading-relaxed font-light">
                Advanced UV protection technology blocks 98% of harmful rays. Train outdoors 
                with confidence.
              </p>
              
              <div className="space-y-4 pt-4">
                <div className="flex items-start gap-4 p-4 rounded-xl bg-background/50 backdrop-blur-sm">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Shield className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground mb-1">98% UV Block</div>
                    <div className="text-sm text-muted-foreground">Maximum protection outdoors</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-accent/20 to-primary/20 rounded-[3rem] blur-3xl" />
              <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-700">
                <img src={upfProtection} alt="UPF 50+ Protection" className="w-full h-[600px] object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
                
                <div className="absolute top-8 right-8 px-6 py-4 rounded-2xl bg-background/80 backdrop-blur-xl border border-border/50 shadow-xl">
                  <div className="text-2xl font-bold text-foreground">UPF 50+</div>
                  <div className="text-sm text-muted-foreground">Superior Protection</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature 3: High-Waisted Fit */}
      <section className="relative py-32 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-5 gap-8 items-center max-w-7xl mx-auto">
            <div className="lg:col-span-3 relative">
              <div className="absolute -inset-8 bg-gradient-to-br from-primary/10 to-accent/10 rounded-[4rem] blur-3xl" />
              <div className="relative aspect-[4/3] rounded-[3rem] overflow-hidden shadow-2xl">
                <img src={highWaistedFit} alt="High-Waisted Fit" className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-br from-background/30 via-transparent to-transparent" />
              </div>
            </div>
            
            <div className="lg:col-span-2 space-y-6">
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-primary/10 backdrop-blur-xl border border-primary/20">
                <Lock className="h-5 w-5 text-primary" />
                <span className="text-sm font-semibold text-primary uppercase tracking-wider">Support</span>
              </div>
              
              <h2 className="text-5xl font-bold text-foreground leading-tight font-serif">
                High-Waisted<br />Sculpting Fit
              </h2>
              
              <p className="text-lg text-muted-foreground leading-relaxed">
                Engineered high-rise design provides exceptional core support and a 
                flattering silhouette.
              </p>
              
              <div className="space-y-3 pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-foreground">No constant adjusting</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-foreground">Core compression</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-foreground">Flattering silhouette</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature 4: 4-Way Stretch */}
      <section className="relative py-32 bg-gradient-to-bl from-accent/5 via-background to-background overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-accent/10 backdrop-blur-xl border border-accent/20 mb-8">
                <Wind className="h-5 w-5 text-accent" />
                <span className="text-sm font-semibold text-accent uppercase tracking-wider">Mobility</span>
              </div>
              
              <h2 className="text-6xl md:text-7xl font-bold text-foreground mb-6">4-Way Stretch Fabric</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto font-light">
                Ultimate freedom of movement in every direction
              </p>
            </div>
            
            <div className="relative">
              <div className="absolute -inset-8 bg-gradient-to-br from-accent/20 to-primary/20 rounded-[4rem] blur-3xl" />
              <div className="relative aspect-[21/9] rounded-[3rem] overflow-hidden shadow-2xl">
                <img src={fourWayStretch} alt="4-Way Stretch Fabric" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                
                <div className="absolute bottom-8 left-8 right-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-6 rounded-2xl bg-background/90 backdrop-blur-xl border border-border/50 text-center">
                    <div className="text-3xl font-bold text-foreground mb-2">360°</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">Movement</div>
                  </div>
                  <div className="p-6 rounded-2xl bg-background/90 backdrop-blur-xl border border-border/50 text-center">
                    <div className="text-3xl font-bold text-foreground mb-2">∞</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">Flexibility</div>
                  </div>
                  <div className="p-6 rounded-2xl bg-background/90 backdrop-blur-xl border border-border/50 text-center">
                    <div className="text-3xl font-bold text-foreground mb-2">4X</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">Stretch</div>
                  </div>
                  <div className="p-6 rounded-2xl bg-background/90 backdrop-blur-xl border border-border/50 text-center">
                    <div className="text-3xl font-bold text-foreground mb-2">100%</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">Recovery</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature 5: Elastic Waistband */}
      <section className="relative py-32 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-primary/10 backdrop-blur-xl border border-primary/20">
                <Zap className="h-5 w-5 text-primary" />
                <span className="text-sm font-semibold text-primary uppercase tracking-wider">Comfort</span>
              </div>
              
              <h2 className="text-5xl md:text-6xl font-bold text-foreground leading-tight">
                Comfortable<br />Elastic Waistband
              </h2>
              
              <p className="text-xl text-muted-foreground leading-relaxed font-light">
                Soft, flexible elastic engineered for all-day comfort. No digging, no rolling.
              </p>
              
              <div className="p-8 rounded-3xl bg-muted/30 backdrop-blur-xl border border-border/50 shadow-xl">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-1 rounded-full bg-gradient-to-r from-primary to-accent" />
                    <span className="text-sm font-semibold text-foreground">Soft Touch Technology</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-1 rounded-full bg-gradient-to-r from-primary to-accent" />
                    <span className="text-sm font-semibold text-foreground">Anti-Roll Design</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-1 rounded-full bg-gradient-to-r from-primary to-accent" />
                    <span className="text-sm font-semibold text-foreground">Long-Lasting Elasticity</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute -inset-8 bg-gradient-to-br from-primary/20 to-accent/20 rounded-[3rem] blur-3xl" />
              <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-700">
                <img src={elasticWaistband} alt="Elastic Waistband" className="w-full h-[600px] object-cover" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/40" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature 6: Double-Layered Waistband */}
      <section className="relative py-32 bg-muted/20 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-6xl md:text-7xl font-bold text-foreground mb-6 font-serif">
                Double-Layered<br />Premium Support
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-light">
                Two layers of premium fabric for enhanced support
              </p>
            </div>
            
            <div className="relative">
              <div className="absolute -inset-12 bg-gradient-to-br from-primary/10 via-accent/10 to-primary/10 rounded-[4rem] blur-3xl" />
              
              <div className="relative aspect-[16/9] rounded-[3rem] overflow-hidden shadow-2xl">
                <img src={doubleLayeredWaist} alt="Double-Layered Waistband" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="grid grid-cols-2 gap-8 p-8">
                    <div className="p-8 rounded-2xl bg-background/90 backdrop-blur-xl border border-border/50 text-center transform hover:scale-105 transition-transform">
                      <div className="text-5xl font-bold text-foreground mb-3">2X</div>
                      <div className="text-sm text-muted-foreground uppercase tracking-wider">Layer Support</div>
                    </div>
                    
                    <div className="p-8 rounded-2xl bg-background/90 backdrop-blur-xl border border-border/50 text-center transform hover:scale-105 transition-transform">
                      <div className="text-5xl font-bold text-foreground mb-3">1</div>
                      <div className="text-sm text-muted-foreground uppercase tracking-wider">Smooth Finish</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature 7: Triangle Gusset */}
      <section className="relative py-32 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-accent/10 backdrop-blur-xl border border-accent/20 mb-8">
                <Sparkles className="h-5 w-5 text-accent" />
                <span className="text-sm font-semibold text-accent uppercase tracking-wider">Engineering</span>
              </div>
              
              <h2 className="text-6xl md:text-7xl font-bold text-foreground mb-6">
                Triangle-Shaped<br />Gusset Design
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto font-light">
                Anatomically engineered for optimal comfort
              </p>
            </div>
            
            <div className="relative">
              <div className="absolute -inset-8 bg-gradient-to-br from-accent/30 to-primary/30 rounded-[3rem] blur-3xl animate-pulse" />
              <div className="relative aspect-[16/10] rounded-[3rem] overflow-hidden shadow-2xl">
                <img src={triangleGusset} alt="Triangle Gusset" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/60" />
                
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="relative">
                    <div className="w-64 h-64 rounded-full border-2 border-primary/50 animate-ping" />
                    <div className="absolute inset-0 w-64 h-64 rounded-full border-4 border-primary flex items-center justify-center">
                      <div className="text-center p-6 rounded-2xl bg-background/90 backdrop-blur-xl">
                        <div className="text-sm font-semibold text-primary uppercase tracking-wider">Anti-Chafe</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature 8: Side Pocket */}
      <section className="relative py-32 bg-gradient-to-br from-background via-muted/20 to-background overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto">
            <div className="relative order-2 lg:order-1">
              <div className="absolute -inset-8 bg-gradient-to-br from-primary/20 to-accent/20 rounded-[3rem] blur-3xl" />
              <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl">
                <img src={sidePocket} alt="Side Pocket" className="w-full h-[600px] object-cover transform hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                
                <div className="absolute top-8 right-8 space-y-4">
                  <div className="px-6 py-3 rounded-full bg-background/90 backdrop-blur-xl border border-border/50 shadow-xl">
                    <span className="text-sm font-semibold text-foreground">Phone Secure</span>
                  </div>
                  <div className="px-6 py-3 rounded-full bg-background/90 backdrop-blur-xl border border-border/50 shadow-xl">
                    <span className="text-sm font-semibold text-foreground">Keys Safe</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="order-1 lg:order-2 space-y-8">
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-primary/10 backdrop-blur-xl border border-primary/20">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="text-sm font-semibold text-primary uppercase tracking-wider">Practical</span>
              </div>
              
              <h2 className="text-5xl md:text-6xl font-bold text-foreground leading-tight">
                Functional<br />Deep Side Pocket
              </h2>
              
              <p className="text-xl text-muted-foreground leading-relaxed font-light">
                Deep, secure pockets designed to keep your essentials safe during any activity.
              </p>
              
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="p-6 rounded-2xl bg-muted/50 backdrop-blur-sm border border-border/50 text-center">
                  <div className="text-4xl mb-3">📱</div>
                  <div className="text-sm font-semibold text-foreground mb-1">Phone Fit</div>
                  <div className="text-xs text-muted-foreground">Up to 6.7"</div>
                </div>
                
                <div className="p-6 rounded-2xl bg-muted/50 backdrop-blur-sm border border-border/50 text-center">
                  <div className="text-4xl mb-3">🔒</div>
                  <div className="text-sm font-semibold text-foreground mb-1">Secure Design</div>
                  <div className="text-xs text-muted-foreground">Zero Drop</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/10 to-primary/10" />
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-6xl md:text-7xl font-bold text-foreground mb-8">
              Ready to Experience<br />
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                The Difference?
              </span>
            </h2>
            
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto font-light">
              Join thousands who've discovered the perfect blend of comfort and performance
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link to="/products">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-12 py-7 text-lg rounded-full shadow-2xl shadow-primary/20 group">
                  Shop Collection
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              
              <Link to="/size-chart/womens-leggings">
                <Button size="lg" variant="outline" className="border-2 px-12 py-7 text-lg rounded-full bg-background/50 backdrop-blur-sm hover:bg-background/80">
                  Find Your Size
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
