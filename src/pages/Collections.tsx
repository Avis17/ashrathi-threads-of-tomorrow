import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Sparkles, Crown, Gem } from "lucide-react";

// Import images
import collectionsHero from "@/assets/collections-hero.jpg";
import collectionsWomenActivewear from "@/assets/collections-women-activewear.jpg";
import collectionsMenSportswear from "@/assets/collections-men-sportswear.jpg";
import collectionsWinterAthleisure from "@/assets/collections-winter-athleisure.jpg";
import collectionsSeamlessInnerwear from "@/assets/collections-seamless-innerwear.jpg";
import heroLuxury4 from "@/assets/hero-luxury-4.jpg";

const Collections = () => {
  const featuredCollections = [
    {
      title: "Women's Activewear",
      subtitle: "Sculpt & Support",
      description: "Premium leggings, sports bras, and yoga sets designed for the modern woman",
      image: collectionsWomenActivewear,
      link: "/women",
      badge: "Bestseller"
    },
    {
      title: "Men's Sportswear",
      subtitle: "Performance Driven",
      description: "Gym tees, joggers, and training shorts built for peak performance",
      image: collectionsMenSportswear,
      link: "/men",
      badge: "New Arrivals"
    },
    {
      title: "Winter Athleisure",
      subtitle: "Cozy & Stylish",
      description: "Premium sweaters and hoodies for cold-weather comfort",
      image: collectionsWinterAthleisure,
      link: "/shop?category=winter",
      badge: "Seasonal"
    },
    {
      title: "Seamless Innerwear",
      subtitle: "Invisible Comfort",
      description: "Ultra-soft seamless innerwear for all-day comfort",
      image: collectionsSeamlessInnerwear,
      link: "/shop?category=innerwear",
      badge: "Premium"
    }
  ];

  const highlights = [
    {
      icon: Crown,
      title: "Premium Quality",
      description: "Only the finest fabrics and materials"
    },
    {
      icon: Gem,
      title: "Exclusive Designs",
      description: "Unique styles you won't find elsewhere"
    },
    {
      icon: Star,
      title: "5-Star Reviews",
      description: "Loved by thousands of customers"
    },
    {
      icon: Sparkles,
      title: "Limited Editions",
      description: "Exclusive drops and seasonal releases"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section data-navbar-dark="true" className="relative h-[85vh] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={collectionsHero}
            alt="Collections"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
        </div>
        
        <div className="relative z-10 h-full flex items-center justify-center text-center">
          <div className="container mx-auto px-6 lg:px-12">
            <p className="text-accent font-medium tracking-wide-premium uppercase text-sm mb-4 animate-fade-in">
              Feather Fashions
            </p>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-white mb-6 leading-[1.1] animate-fade-in-up">
              Our Collections
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-8 animate-fade-in-up">
              Discover curated collections designed for every moment of your active lifestyle. 
              From studio to street, we've got you covered.
            </p>
            <div className="flex flex-wrap justify-center gap-4 animate-fade-in-up">
              <Button asChild size="xl" variant="gold">
                <Link to="/shop">
                  Shop All
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights Strip */}
      <section className="bg-secondary py-12 border-y border-border">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {highlights.map((item, index) => (
              <div key={index} className="text-center">
                <item.icon className="h-8 w-8 text-accent mx-auto mb-3" />
                <h3 className="font-semibold text-white mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Collections */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif text-foreground mb-4">
              Featured Collections
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Explore our carefully curated collections, each designed with purpose and style
            </p>
          </div>

          <div className="space-y-16">
            {featuredCollections.map((collection, index) => (
              <Link
                key={index}
                to={collection.link}
                className={`group grid grid-cols-1 lg:grid-cols-2 gap-8 items-center ${
                  index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}
              >
                <div className={`relative overflow-hidden rounded-xl ${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                  <img
                    src={collection.image}
                    alt={collection.title}
                    className="w-full h-[400px] md:h-[500px] object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-6 left-6">
                    <span className="bg-accent text-primary px-4 py-2 text-sm font-medium rounded-full">
                      {collection.badge}
                    </span>
                  </div>
                </div>
                <div className={`space-y-6 ${index % 2 === 1 ? 'lg:order-1 lg:text-right' : ''}`}>
                  <p className="text-accent font-medium tracking-wide-premium uppercase text-sm">
                    {collection.subtitle}
                  </p>
                  <h3 className="text-4xl md:text-5xl font-serif text-foreground">
                    {collection.title}
                  </h3>
                  <p className="text-muted-foreground text-lg max-w-md">
                    {collection.description}
                  </p>
                  <span className={`inline-flex items-center text-foreground font-medium group-hover:text-accent transition-colors ${
                    index % 2 === 1 ? 'flex-row-reverse' : ''
                  }`}>
                    {index % 2 === 1 ? (
                      <>
                        Explore Collection
                        <ArrowRight className="mr-2 h-4 w-4 rotate-180 transition-transform group-hover:-translate-x-1" />
                      </>
                    ) : (
                      <>
                        Explore Collection
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Editorial Banner */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroLuxury4}
            alt="Premium Quality"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/75" />
        </div>
        <div className="relative z-10 container mx-auto px-6 lg:px-12 text-center">
          <p className="text-accent font-medium tracking-wide-premium uppercase text-sm mb-4">
            Our Promise
          </p>
          <h2 className="text-4xl md:text-6xl font-serif text-white max-w-4xl mx-auto leading-tight mb-8">
            "Quality is not an act, it's a habit. Every stitch tells our story."
          </h2>
          <p className="text-white/90 text-lg max-w-2xl mx-auto">
            At Feather Fashions, we're committed to delivering premium activewear 
            that combines style, comfort, and performance.
          </p>
        </div>
      </section>

      {/* Quick Shop Grid */}
      <section className="py-20 lg:py-32 bg-secondary">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif text-foreground mb-4">
              Quick Shop
            </h2>
            <p className="text-muted-foreground text-lg">
              Jump straight to what you're looking for
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { title: "Leggings", link: "/shop?category=leggings" },
              { title: "Sports Bras", link: "/shop?category=sports-bras" },
              { title: "Gym Tees", link: "/shop?category=gym-tees" },
              { title: "Joggers", link: "/shop?category=joggers" },
              { title: "Shorts", link: "/shop?category=shorts" },
              { title: "Tank Tops", link: "/shop?category=tanks" },
              { title: "Sweaters", link: "/shop?category=sweaters" },
              { title: "Innerwear", link: "/shop?category=innerwear" }
            ].map((item, index) => (
              <Link
                key={index}
                to={item.link}
                className="group p-6 bg-background border border-border hover:border-accent rounded-lg transition-colors text-center"
              >
                <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors">
                  {item.title}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-primary text-white">
        <div className="container mx-auto px-6 lg:px-12 text-center">
          <h2 className="text-4xl md:text-5xl font-serif text-white mb-6">
            Find Your Perfect Fit
          </h2>
          <p className="text-white/90 text-lg max-w-2xl mx-auto mb-8">
            Browse our complete catalog and discover activewear designed for your lifestyle.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="xl" variant="gold">
              <Link to="/shop">
                Shop All Products
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="xl" variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
              <Link to="/contact">
                Contact Us
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Collections;