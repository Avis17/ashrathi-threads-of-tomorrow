import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Droplets, Shield, Zap, Wind, Play, Star } from "lucide-react";

// Hero and main images
import homeHeroMain from "@/assets/home-hero-main.jpg";
import heroLuxury2 from "@/assets/hero-luxury-2.jpg";
import heroModel1 from "@/assets/hero-model-woman-1.jpg";

// Activity images
import activityRunning from "@/assets/activity-running.jpg";
import activityYoga from "@/assets/activity-yoga.jpg";
import activityGym from "@/assets/activity-gym.jpg";
import activityCycling from "@/assets/activity-cycling.jpg";
import activityPilates from "@/assets/activity-pilates.jpg";

// Category images
import categoryLeggings from "@/assets/category-leggings.jpg";
import categoryTshirts from "@/assets/category-tshirts.jpg";
import categorySportsbra from "@/assets/category-sportsbra.jpg";
import categoryJoggers from "@/assets/category-joggers.jpg";

// Color images
import colorBlack from "@/assets/color-black.jpg";
import colorSage from "@/assets/color-sage.jpg";
import colorRose from "@/assets/color-rose.jpg";
import colorNavy from "@/assets/color-navy.jpg";

// New arrivals
import newArrival1 from "@/assets/new-arrival-1.jpg";
import newArrival2 from "@/assets/new-arrival-2.jpg";

// Highlights
import highlightCampaign from "@/assets/highlight-campaign.jpg";
import highlightDetail from "@/assets/highlight-detail.jpg";

const Home = () => {
  const features = [
    { icon: Zap, title: "4-Way Stretch", desc: "Move freely" },
    { icon: Droplets, title: "Moisture-Wicking", desc: "Stay dry" },
    { icon: Shield, title: "Squat-Proof", desc: "Full coverage" },
    { icon: Wind, title: "Ultra-Soft", desc: "Buttery feel" },
  ];

  const activities = [
    { name: "Running", image: activityRunning, link: "/shop" },
    { name: "Yoga", image: activityYoga, link: "/shop" },
    { name: "Gym", image: activityGym, link: "/shop" },
    { name: "Cycling", image: activityCycling, link: "/shop" },
    { name: "Pilates", image: activityPilates, link: "/shop" },
  ];

  const categories = [
    { name: "Leggings", count: "50+ Styles", image: categoryLeggings, link: "/women" },
    { name: "T-Shirts", count: "40+ Styles", image: categoryTshirts, link: "/men" },
    { name: "Sports Bras", count: "30+ Styles", image: categorySportsbra, link: "/women" },
    { name: "Joggers", count: "25+ Styles", image: categoryJoggers, link: "/men" },
  ];

  const colors = [
    { name: "Midnight Black", hex: "#0A0A0A", image: colorBlack },
    { name: "Sage Green", hex: "#9CAF88", image: colorSage },
    { name: "Dusty Rose", hex: "#D4A5A5", image: colorRose },
    { name: "Navy Blue", hex: "#1E3A5F", image: colorNavy },
  ];

  const newArrivals = [
    { name: "Ribbed Seamless Set", price: "₹2,499", image: newArrival1, tag: "NEW" },
    { name: "Compression Training Set", price: "₹1,999", image: newArrival2, tag: "NEW" },
  ];

  const whyFeather = [
    { title: "Breathable Fabric", desc: "Advanced ventilation technology" },
    { title: "Diamond Gusset", desc: "Ergonomic design for movement" },
    { title: "High-Waist Sculpt", desc: "Flattering fit that moves with you" },
    { title: "Anti-Odor Tech", desc: "Stay fresh all day" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${homeHeroMain})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/20 to-background" />
        
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <p className="text-xs tracking-[0.4em] text-accent mb-6 animate-fade-in font-medium">
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
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-delay">
            <Button asChild size="lg" className="px-10 py-6 text-sm tracking-[0.15em] bg-primary hover:bg-primary/90 glow-gold">
              <Link to="/women">SHOP WOMEN</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="px-10 py-6 text-sm tracking-[0.15em] border-foreground/20 hover:bg-foreground/5">
              <Link to="/men">SHOP MEN</Link>
            </Button>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-5 h-8 border border-foreground/30 rounded-full flex justify-center pt-2">
            <div className="w-1 h-2 bg-foreground/30 rounded-full" />
          </div>
        </div>
      </section>

      {/* Feature Strip */}
      <section className="py-6 bg-primary text-primary-foreground">
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

      {/* Shop by Activity */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-xs tracking-[0.3em] text-accent mb-3">MADE FOR MOVEMENT</p>
            <h2 className="text-3xl md:text-4xl font-light tracking-tight">Shop Popular Activities</h2>
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
            {activities.map((activity, index) => (
              <Link
                key={index}
                to={activity.link}
                className="group flex-shrink-0 w-[280px] snap-start"
              >
                <div className="relative h-[380px] overflow-hidden rounded-2xl">
                  <img 
                    src={activity.image} 
                    alt={activity.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <h3 className="text-2xl font-light text-white mb-2">{activity.name}</h3>
                    <span className="inline-flex items-center text-sm text-white/80 group-hover:text-accent transition-colors">
                      Shop Now <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Categories Grid */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-xs tracking-[0.3em] text-accent mb-3">DISCOVER</p>
            <h2 className="text-3xl md:text-4xl font-light tracking-tight">Shop Popular Categories</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category, index) => (
              <Link
                key={index}
                to={category.link}
                className="group relative h-[400px] md:h-[500px] overflow-hidden rounded-xl"
              >
                <img 
                  src={category.image} 
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <p className="text-xs text-accent mb-1">{category.count}</p>
                  <h3 className="text-xl md:text-2xl font-light text-white">{category.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* What's New Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-xs tracking-[0.3em] text-accent mb-3">FRESH DROPS</p>
            <h2 className="text-3xl md:text-4xl font-light tracking-tight">
              What's new? <span className="font-serif italic">So glad you asked.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {newArrivals.map((item, index) => (
              <Link key={index} to="/shop" className="group">
                <div className="relative h-[500px] md:h-[600px] overflow-hidden rounded-2xl">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-6 left-6">
                    <span className="bg-accent text-primary-foreground px-4 py-2 text-xs tracking-wider font-medium rounded-full">
                      {item.tag}
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-primary/90 to-transparent">
                    <h3 className="text-2xl font-light text-white mb-2">{item.name}</h3>
                    <p className="text-accent text-lg">{item.price}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Shop by Color */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-xs tracking-[0.3em] text-accent mb-3">EXPRESS YOURSELF</p>
            <h2 className="text-3xl md:text-4xl font-light tracking-tight">Shop by Colour</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {colors.map((color, index) => (
              <Link
                key={index}
                to="/shop"
                className="group relative h-[300px] md:h-[400px] overflow-hidden rounded-xl"
              >
                <img 
                  src={color.image} 
                  alt={color.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-primary/20 group-hover:bg-primary/40 transition-colors" />
                <div className="absolute bottom-6 left-6 right-6 flex items-center gap-3">
                  <div 
                    className="w-6 h-6 rounded-full border-2 border-white shadow-lg"
                    style={{ backgroundColor: color.hex }}
                  />
                  <span className="text-white font-medium text-sm">{color.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Catch the Highlights */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs tracking-[0.3em] text-accent mb-4">BEHIND THE SEAMS</p>
              <h2 className="text-4xl md:text-5xl font-light tracking-tight mb-6">
                Catch the
                <br />
                <span className="font-serif italic">highlights</span>
              </h2>
              <p className="text-primary-foreground/70 text-lg mb-8 max-w-md">
                See what makes Feather Fashions different. Premium fabrics, precision craftsmanship, and designs that move with you.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild variant="outline" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
                  <Link to="/about">
                    Our Story <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild className="bg-accent hover:bg-accent/90 text-primary">
                  <Link to="/shop">
                    Shop Collection
                  </Link>
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="relative h-[300px] rounded-xl overflow-hidden">
                <img 
                  src={highlightCampaign}
                  alt="Campaign"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <p className="text-white text-sm">Community</p>
                </div>
              </div>
              <div className="relative h-[300px] rounded-xl overflow-hidden mt-8">
                <img 
                  src={highlightDetail}
                  alt="Detail"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <p className="text-white text-sm">Quality Details</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Feather Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative h-[500px] rounded-2xl overflow-hidden">
              <img 
                src={heroModel1}
                alt="Premium activewear"
                className="w-full h-full object-cover"
              />
              <div className="absolute -bottom-6 -right-6 w-32 h-32 border border-accent/30 rounded-xl" />
            </div>
            
            <div>
              <p className="text-xs tracking-[0.3em] text-accent mb-4">WHY FEATHER</p>
              <h2 className="text-4xl md:text-5xl font-light tracking-tight mb-8">
                Engineered for
                <br />
                <span className="font-serif italic">Excellence</span>
              </h2>
              <div className="grid sm:grid-cols-2 gap-6">
                {whyFeather.map((item, index) => (
                  <div key={index} className="group">
                    <div className="w-8 h-px bg-accent mb-4 group-hover:w-12 transition-all duration-300" />
                    <h3 className="text-lg font-medium mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Editorial Banner */}
      <section className="relative h-[60vh] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-fixed"
          style={{ backgroundImage: `url(${heroLuxury2})` }}
        />
        <div className="absolute inset-0 bg-primary/70" />
        <div className="relative z-10 h-full flex items-center justify-center text-center px-6">
          <div className="max-w-3xl">
            <p className="text-xs tracking-[0.3em] text-accent mb-6">THE FEATHER DIFFERENCE</p>
            <h2 className="text-3xl md:text-5xl font-light text-white mb-6 leading-tight">
              "Comfort should never
              <br />
              compromise style."
            </h2>
            <Button asChild variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 px-10 py-6 text-sm tracking-[0.15em]">
              <Link to="/about">
                OUR STORY <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-6 text-center">
          <p className="text-xs tracking-[0.3em] text-accent mb-4">GET IN TOUCH</p>
          <h2 className="text-3xl md:text-4xl font-light tracking-tight mb-6">
            Ready to elevate your
            <br />
            <span className="font-serif italic">activewear game?</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-10">
            Whether you're looking for wholesale partnerships or custom designs, we'd love to hear from you.
          </p>
          <Button asChild size="lg" className="px-10 py-6 text-sm tracking-[0.15em] bg-primary hover:bg-primary/90">
            <Link to="/contact">
              CONTACT US <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Home;
