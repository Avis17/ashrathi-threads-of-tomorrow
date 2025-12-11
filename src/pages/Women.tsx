import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Heart, Zap } from "lucide-react";

// Import images
import heroModelWoman1 from "@/assets/hero-model-woman-1.jpg";
import heroModelWoman2 from "@/assets/hero-model-woman-2.jpg";
import heroModelWoman3 from "@/assets/hero-model-woman-3.jpg";
import womenLeggingsFeatured from "@/assets/women-leggings-featured.jpg";
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
      image: heroModelWoman2,
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
      image: heroModelWoman3,
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
      <section className="relative h-[90vh] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroModelWoman1}
            alt="Women's Collection"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/40 to-transparent" />
        </div>
        
        <div className="relative z-10 h-full flex items-center">
          <div className="container mx-auto px-6 lg:px-12">
            <div className="max-w-2xl">
              <p className="text-accent font-medium tracking-wide-premium uppercase text-sm mb-4 animate-fade-in">
                Women's Collection
              </p>
              <h1 className="text-5xl md:text-7xl font-serif text-primary-foreground mb-6 leading-[1.1] animate-fade-in-up">
                Empower Your
                <span className="block text-accent">Movement</span>
              </h1>
              <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 max-w-lg animate-fade-in-up">
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
                <Button asChild size="xl" variant="outline" className="bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20">
                  <Link to="/size-chart/womens-leggings">
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
                  <p className="font-semibold text-foreground">{feature.title}</p>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
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
                className="group relative h-[400px] md:h-[500px] overflow-hidden"
              >
                <img
                  src={category.image}
                  alt={category.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <p className="text-accent text-sm font-medium tracking-wide-premium uppercase mb-2">
                    {category.subtitle}
                  </p>
                  <h3 className="text-3xl md:text-4xl font-serif text-primary-foreground mb-4">
                    {category.title}
                  </h3>
                  <span className="inline-flex items-center text-primary-foreground font-medium group-hover:text-accent transition-colors">
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
      <section className="py-20 lg:py-32 bg-secondary">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <p className="text-accent font-medium tracking-wide-premium uppercase text-sm mb-4">
                Engineered for Performance
              </p>
              <h2 className="text-4xl md:text-5xl font-serif text-foreground mb-6 leading-tight">
                Feel the Difference in Every Thread
              </h2>
              <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
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
                  <li key={index} className="flex items-center gap-3 text-foreground">
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
                className="w-full h-[300px] object-cover"
              />
              <img
                src={leggingsProfessional}
                alt="Professional Style"
                className="w-full h-[300px] object-cover mt-8"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-primary text-primary-foreground">
        <div className="container mx-auto px-6 lg:px-12 text-center">
          <h2 className="text-4xl md:text-5xl font-serif mb-6">
            Ready to Elevate Your Wardrobe?
          </h2>
          <p className="text-primary-foreground/80 text-lg max-w-2xl mx-auto mb-8">
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
