import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Heart, Zap } from "lucide-react";

// Import images
import heroModelWoman1 from "@/assets/hero-model-woman-1.jpg";
import womenLeggingsFeatured from "@/assets/women-leggings-featured.jpg";
import womenSportsBra from "@/assets/women-sports-bra.jpg";
import womenTracksJoggers from "@/assets/women-tracks-joggers.jpg";
import leggingsYogaPose from "@/assets/leggings-carousel/yoga-pose.jpg";
import leggingsAthletic from "@/assets/leggings-carousel/athletic-pose.jpg";
import leggingsProfessional from "@/assets/leggings-carousel/professional-look.jpg";

const Women = () => {
  const categories = [
    {
      title: "Leggings",
      subtitle: "Sculpt & Support",
      image: womenLeggingsFeatured,
      link: "/products?category=leggings"
    },
    {
      title: "Sports Bras",
      subtitle: "Maximum Comfort",
      image: womenSportsBra,
      link: "/products?category=sports-bras"
    },
    {
      title: "Yoga Sets",
      subtitle: "Flow & Flex",
      image: leggingsYogaPose,
      link: "/products?category=yoga"
    },
    {
      title: "Tracks & Joggers",
      subtitle: "Urban Athletic",
      image: womenTracksJoggers,
      link: "/products?category=tracks"
    }
  ];

  const features = [
    {
      icon: Sparkles,
      title: "4-Way Stretch",
      description: "Moves with you through every pose"
    },
    {
      icon: Heart,
      title: "Squat-Proof",
      description: "Full coverage, maximum confidence"
    },
    {
      icon: Zap,
      title: "Moisture-Wicking",
      description: "Stay dry during intense workouts"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section data-navbar-dark="true" className="relative h-[90vh] overflow-hidden -mt-[76px] pt-[76px]">
        <div className="absolute inset-0">
          <img
            src={heroModelWoman1}
            alt="Women's Collection"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        </div>
        
        <div className="relative z-10 h-full flex items-center">
          <div className="container mx-auto px-6 lg:px-12">
            <div className="max-w-2xl">
              <p className="text-accent font-medium tracking-wide-premium uppercase text-sm mb-4 animate-fade-in">
                Women's Collection
              </p>
              <h1 className="text-5xl md:text-7xl font-serif text-white mb-6 leading-[1.1] animate-fade-in-up">
                Empower Your
                <span className="block text-accent">Movement</span>
              </h1>
              <p className="text-lg md:text-xl text-white/80 mb-8 max-w-lg animate-fade-in-up">
                Activewear designed for women who move with purpose. 
                From studio to street, feel confident in every moment.
              </p>
              <div className="flex flex-wrap gap-4 animate-fade-in-up">
                <Button asChild size="xl" variant="gold">
                  <Link to="/shop">
                    Shop Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild size="xl" variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                  <Link to="/size-guide">
                    Size Guide
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Strip */}
      <section className="bg-secondary py-8 border-y border-border">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <feature.icon className="h-6 w-6 text-accent" />
                <div>
                  <p className="font-semibold text-white">{feature.title}</p>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leggings Features Showcase */}
      <section className="py-16 lg:py-24 bg-gradient-to-b from-background to-secondary/30">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="relative overflow-hidden rounded-2xl bg-[#1A1A1A] border border-accent/20">
            <div className="absolute inset-0 bg-gradient-to-r from-accent/10 via-transparent to-accent/5" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
            
            <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 p-8 lg:p-12 items-center">
              {/* Content */}
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/20 rounded-full">
                  <Sparkles className="h-4 w-4 text-accent" />
                  <span className="text-accent text-sm font-medium tracking-wide uppercase">Premium Technology</span>
                </div>
                
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-white leading-tight">
                  Discover What Makes Our
                  <span className="block text-accent mt-2">Leggings Special</span>
                </h2>
                
                <p className="text-white/70 text-lg leading-relaxed max-w-lg">
                  From heat-fused care labels to 4-way stretch technology — explore the innovative features that set our leggings apart.
                </p>
                
                <div className="flex flex-wrap gap-3 text-sm">
                  {["UPF 50+ Protection", "High-Waisted Fit", "Side Pockets", "Triangle Gusset"].map((feature, idx) => (
                    <span key={idx} className="px-3 py-1.5 bg-white/10 rounded-full text-white/80 border border-white/10">
                      {feature}
                    </span>
                  ))}
                </div>
                
                <Button asChild size="xl" variant="gold" className="group">
                  <Link to="/leggings-features">
                    <span>Explore All Features</span>
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>
              
              {/* Image Grid */}
              <div className="relative grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <img
                    src={leggingsYogaPose}
                    alt="Yoga flexibility"
                    className="w-full h-48 object-cover rounded-xl"
                  />
                  <img
                    src={leggingsAthletic}
                    alt="Athletic performance"
                    className="w-full h-32 object-cover rounded-xl"
                  />
                </div>
                <div className="space-y-4 pt-8">
                  <img
                    src={leggingsProfessional}
                    alt="Professional style"
                    className="w-full h-32 object-cover rounded-xl"
                  />
                  <img
                    src={womenLeggingsFeatured}
                    alt="Featured leggings"
                    className="w-full h-48 object-cover rounded-xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Grid */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif text-foreground mb-4">
              Shop by Category
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Curated collections designed for every moment of your active lifestyle
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {categories.map((category, index) => (
              <Link
                key={index}
                to={category.link}
                className="group relative h-[400px] md:h-[500px] overflow-hidden rounded-xl"
              >
                <img
                  src={category.image}
                  alt={category.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <p className="text-accent text-sm font-medium tracking-wide-premium uppercase mb-2">
                    {category.subtitle}
                  </p>
                  <h3 className="text-3xl md:text-4xl font-serif text-white mb-4">
                    {category.title}
                  </h3>
                  <span className="inline-flex items-center text-white font-medium group-hover:text-accent transition-colors">
                    Explore Collection
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Editorial Section */}
      <section className="py-20 lg:py-32 bg-[#1A1A1A]">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <p className="text-accent font-medium tracking-wide-premium uppercase text-sm mb-4">
                Engineered for Performance
              </p>
              <h2 className="text-4xl md:text-5xl font-serif text-white mb-6 leading-tight">
                Feel the Difference in Every Thread
              </h2>
              <p className="text-white/70 text-lg mb-8 leading-relaxed">
                Our women's activewear is crafted with premium fabrics that offer 
                4-way stretch, moisture-wicking technology, and a buttery-soft feel. 
                From high-intensity workouts to relaxing yoga sessions, experience 
                unmatched comfort and support.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  "High-rise waistband for sculpted support",
                  "Diamond gusset for maximum mobility",
                  "Hidden pocket for essentials",
                  "Anti-odor technology"
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3 text-white">
                    <span className="w-1.5 h-1.5 bg-accent rounded-full" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button asChild variant="gold" size="lg">
                <Link to="/leggings-features">
                  Discover Our Technology
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="order-1 lg:order-2 grid grid-cols-2 gap-4">
              <img
                src={leggingsAthletic}
                alt="Athletic Performance"
                className="w-full h-[300px] object-cover rounded-lg"
              />
              <img
                src={leggingsProfessional}
                alt="Professional Style"
                className="w-full h-[300px] object-cover mt-8 rounded-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-primary text-white">
        <div className="container mx-auto px-6 lg:px-12 text-center">
          <h2 className="text-4xl md:text-5xl font-serif mb-6">
            Ready to Elevate Your Wardrobe?
          </h2>
          <p className="text-white/80 text-lg max-w-2xl mx-auto mb-8">
            Discover our complete women's collection and find your perfect fit.
          </p>
          <Button asChild size="xl" variant="gold">
            <Link to="/shop">
              Shop Women's Collection
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Women;