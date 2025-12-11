import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Droplets, Shield, Zap, Wind } from "lucide-react";
import heroModel1 from "@/assets/hero-model-woman-1.jpg";
import heroModel2 from "@/assets/hero-model-man-1.jpg";
import heroLuxury1 from "@/assets/hero-luxury-1.jpg";
import heroLuxury2 from "@/assets/hero-luxury-2.jpg";
import womenLeggingsFeatured from "@/assets/women-leggings-featured.jpg";
import menHeroModel from "@/assets/men-hero-model.jpg";

const Home = () => {
  const features = [
    { icon: Zap, title: "4-Way Stretch", desc: "Move freely in every direction" },
    { icon: Droplets, title: "Moisture-Wicking", desc: "Stay dry during intense workouts" },
    { icon: Shield, title: "Squat-Proof", desc: "Full coverage, zero worry" },
    { icon: Wind, title: "Ultra-Soft", desc: "Buttery-soft fabric against skin" },
  ];

  const categories = [
    {
      title: "Women's Activewear",
      subtitle: "Leggings, Sports Bras, Yoga Sets",
      image: womenLeggingsFeatured,
      link: "/women",
    },
    {
      title: "Men's Sportswear",
      subtitle: "Gym Tees, Joggers, Performance Wear",
      image: menHeroModel,
      link: "/men",
    },
  ];

  const whyFeather = [
    { title: "Breathable Fabric", desc: "Advanced ventilation technology keeps you cool" },
    { title: "Diamond Gusset", desc: "Ergonomic design for unrestricted movement" },
    { title: "High-Waist Sculpt", desc: "Flattering fit that moves with you" },
    { title: "Anti-Odor Tech", desc: "Stay fresh from studio to street" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section - Full Screen */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroLuxury1})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/20 to-background" />
        
        {/* Content */}
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <p className="text-xs tracking-[0.3em] text-accent mb-6 animate-fade-in">
            PREMIUM ACTIVEWEAR
          </p>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-light tracking-tight mb-6 animate-fade-in-up">
            Effortless Comfort.
            <br />
            <span className="font-serif italic">Perfect Form.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in-delay">
            Crafted for those who demand both performance and elegance.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-delay-2">
            <Button 
              asChild 
              size="lg" 
              className="px-10 py-6 text-sm tracking-[0.15em] bg-primary hover:bg-primary/90 glow-gold"
            >
              <Link to="/women">
                SHOP WOMEN
              </Link>
            </Button>
            <Button 
              asChild 
              size="lg" 
              variant="outline"
              className="px-10 py-6 text-sm tracking-[0.15em] border-foreground/20 hover:bg-foreground/5"
            >
              <Link to="/men">
                SHOP MEN
              </Link>
            </Button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-5 h-8 border border-foreground/30 rounded-full flex justify-center pt-2">
            <div className="w-1 h-2 bg-foreground/30 rounded-full" />
          </div>
        </div>
      </section>

      {/* Feature Strip */}
      <section className="py-8 bg-primary text-primary-foreground">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <feature.icon className="h-5 w-5 text-accent" />
                <div>
                  <p className="text-sm font-medium">{feature.title}</p>
                  <p className="text-xs text-primary-foreground/60 hidden md:block">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Category Showcase */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-xs tracking-[0.3em] text-accent mb-4">COLLECTIONS</p>
            <h2 className="text-4xl md:text-5xl font-light tracking-tight">
              Shop by Category
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {categories.map((category, index) => (
              <Link
                key={index}
                to={category.link}
                className="group relative h-[600px] overflow-hidden"
              >
                <img 
                  src={category.image} 
                  alt={category.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <p className="text-xs tracking-[0.2em] text-accent mb-2">{category.subtitle}</p>
                  <h3 className="text-3xl font-light text-white mb-4">{category.title}</h3>
                  <span className="inline-flex items-center text-sm text-white/80 group-hover:text-accent transition-colors">
                    EXPLORE
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Feather Section */}
      <section className="py-24 bg-muted">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-xs tracking-[0.3em] text-accent mb-4">WHY FEATHER</p>
              <h2 className="text-4xl md:text-5xl font-light tracking-tight mb-8">
                Engineered for
                <br />
                <span className="font-serif italic">Excellence</span>
              </h2>
              <div className="grid sm:grid-cols-2 gap-8">
                {whyFeather.map((item, index) => (
                  <div key={index} className="group">
                    <div className="w-10 h-px bg-accent mb-4 group-hover:w-16 transition-all duration-300" />
                    <h3 className="text-lg font-medium mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative h-[600px]">
              <img 
                src={heroModel1}
                alt="Premium activewear"
                className="w-full h-full object-cover"
              />
              <div className="absolute -bottom-8 -left-8 w-48 h-48 border border-accent/30" />
            </div>
          </div>
        </div>
      </section>

      {/* Editorial Banner */}
      <section className="relative h-[70vh] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-fixed"
          style={{ backgroundImage: `url(${heroLuxury2})` }}
        />
        <div className="absolute inset-0 bg-primary/60" />
        <div className="relative z-10 h-full flex items-center justify-center text-center px-6">
          <div className="max-w-3xl">
            <p className="text-xs tracking-[0.3em] text-accent mb-6">THE FEATHER DIFFERENCE</p>
            <h2 className="text-4xl md:text-6xl font-light text-white mb-6 leading-tight">
              "Comfort should never
              <br />
              compromise style."
            </h2>
            <p className="text-white/70 text-lg max-w-xl mx-auto mb-10">
              Every piece is designed to perform at the highest level while looking effortlessly elegant.
            </p>
            <Button 
              asChild 
              variant="outline" 
              size="lg"
              className="border-white/30 text-white hover:bg-white/10 px-10 py-6 text-sm tracking-[0.15em]"
            >
              <Link to="/about">
                OUR STORY
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-6 text-center">
          <p className="text-xs tracking-[0.3em] text-accent mb-4">GET IN TOUCH</p>
          <h2 className="text-4xl md:text-5xl font-light tracking-tight mb-6">
            Ready to elevate your
            <br />
            <span className="font-serif italic">activewear game?</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-10">
            Whether you're looking for wholesale partnerships or custom designs, we'd love to hear from you.
          </p>
          <Button 
            asChild 
            size="lg"
            className="px-10 py-6 text-sm tracking-[0.15em] bg-primary hover:bg-primary/90"
          >
            <Link to="/contact">
              CONTACT US
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Home;