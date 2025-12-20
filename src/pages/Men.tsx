import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Dumbbell, Wind, Shield } from "lucide-react";

// Import images
import menHeroModel from "@/assets/men-hero-model.jpg";
import menGymTees from "@/assets/men-gym-tees.jpg";
import menJoggers from "@/assets/men-joggers.jpg";
import menTrainingShorts from "@/assets/men-training-shorts.jpg";
import menTankTops from "@/assets/men-tank-tops.jpg";

const Men = () => {
  const categories = [
    {
      title: "Gym Tees",
      subtitle: "Performance First",
      image: menGymTees,
      link: "/products?category=gym-tees"
    },
    {
      title: "Joggers",
      subtitle: "Street to Studio",
      image: menJoggers,
      link: "/products?category=joggers"
    },
    {
      title: "Training Shorts",
      subtitle: "Maximum Mobility",
      image: menTrainingShorts,
      link: "/products?category=shorts"
    },
    {
      title: "Tank Tops",
      subtitle: "Built for Heat",
      image: menTankTops,
      link: "/products?category=tanks"
    }
  ];

  const features = [
    {
      icon: Dumbbell,
      title: "Built for Training",
      description: "Engineered for peak performance"
    },
    {
      icon: Wind,
      title: "Breathable Fabric",
      description: "Stay cool under pressure"
    },
    {
      icon: Shield,
      title: "Anti-Odor Tech",
      description: "Fresh through every rep"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section data-navbar-dark="true" className="relative h-[90vh] overflow-hidden -mt-[76px] pt-[76px]">
        <div className="absolute inset-0">
          <img
            src={menHeroModel}
            alt="Men's Collection"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
        </div>
        
        <div className="relative z-10 h-full flex items-center">
          <div className="container mx-auto px-6 lg:px-12">
            <div className="max-w-2xl">
              <p className="text-accent font-medium tracking-wide-premium uppercase text-sm mb-4 animate-fade-in">
                Men's Collection
              </p>
              <h1 className="text-5xl md:text-7xl font-serif text-white mb-6 leading-[1.1] animate-fade-in-up">
                Performance
                <span className="block text-accent">Redefined</span>
              </h1>
              <p className="text-lg md:text-xl text-white/80 mb-8 max-w-lg animate-fade-in-up">
                Sportswear engineered for men who push limits. 
                From gym to street, dominate every moment.
              </p>
              <div className="flex flex-wrap gap-4 animate-fade-in-up">
                <Button asChild size="xl" variant="gold">
                  <Link to="/shop">
                    Shop Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild size="xl" variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                  <Link to="/contact">
                    Custom Orders
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

      {/* Category Grid */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif text-foreground mb-4">
              Shop by Category
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Premium sportswear designed for athletes and everyday warriors
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
            <div className="grid grid-cols-2 gap-4">
              <img
                src={menGymTees}
                alt="Training Performance"
                className="w-full h-[300px] object-cover rounded-lg"
              />
              <img
                src={menJoggers}
                alt="Street Style"
                className="w-full h-[300px] object-cover mt-8 rounded-lg"
              />
            </div>
            <div>
              <p className="text-accent font-medium tracking-wide-premium uppercase text-sm mb-4">
                Built for Champions
              </p>
              <h2 className="text-4xl md:text-5xl font-serif text-white mb-6 leading-tight">
                Train Harder. Look Better.
              </h2>
              <p className="text-white/70 text-lg mb-8 leading-relaxed">
                Our men's sportswear combines cutting-edge performance technology 
                with modern street aesthetics. Every piece is designed to help you 
                perform at your best while looking effortlessly sharp.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  "Lightweight, breathable construction",
                  "4-way stretch for unrestricted movement",
                  "Quick-dry technology",
                  "Reinforced stitching for durability"
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3 text-white">
                    <span className="w-1.5 h-1.5 bg-accent rounded-full" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button asChild variant="gold" size="lg">
                <Link to="/shop">
                  Explore All Products
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-primary text-white">
        <div className="container mx-auto px-6 lg:px-12 text-center">
          <h2 className="text-4xl md:text-5xl font-serif mb-6">
            Gear Up for Greatness
          </h2>
          <p className="text-white/80 text-lg max-w-2xl mx-auto mb-8">
            Discover our complete men's collection built for performance.
          </p>
          <Button asChild size="xl" variant="gold">
            <Link to="/shop">
              Shop Men's Collection
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Men;