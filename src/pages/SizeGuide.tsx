import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Ruler, Clock, Sparkles, Heart } from "lucide-react";

// Import images
import womenLeggingsFeatured from "@/assets/women-leggings-featured.jpg";
import menJoggers from "@/assets/men-joggers.jpg";
import menGymTees from "@/assets/men-gym-tees.jpg";
import womenSportsBra from "@/assets/women-sports-bra.jpg";
import kidsCollection from "@/assets/kids-collection.jpg";

interface SizeCategory {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  link: string;
  available: boolean;
  icon: typeof Ruler;
}

const sizeCategories: SizeCategory[] = [
  {
    id: "womens-leggings",
    title: "Women's Leggings",
    subtitle: "High-Rise, Ankle, Cotton & More",
    image: womenLeggingsFeatured,
    link: "/size-chart/womens-leggings",
    available: true,
    icon: Sparkles,
  },
  {
    id: "mens-track",
    title: "Men's Track Pants",
    subtitle: "Joggers, Tracks & Lounge",
    image: menJoggers,
    link: "/size-chart/mens-track-pants",
    available: true,
    icon: Ruler,
  },
  {
    id: "mens-tshirts",
    title: "Men's T-Shirts",
    subtitle: "Polo, V-Neck & Round Neck",
    image: menGymTees,
    link: "/size-chart/mens-tshirts",
    available: true,
    icon: Ruler,
  },
  {
    id: "womens-sports-bra",
    title: "Women's Sports Bras",
    subtitle: "Low, Medium & High Impact",
    image: womenSportsBra,
    link: "/size-chart/womens-sports-bra",
    available: true,
    icon: Heart,
  },
  {
    id: "kids-apparel",
    title: "Kids Collection",
    subtitle: "Boys & Girls All Ages",
    image: kidsCollection,
    link: "/size-chart/kids",
    available: true,
    icon: Sparkles,
  },
];

const SizeGuide = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-24 lg:py-32 bg-gradient-to-b from-[#1A1A1A] to-background overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(212,175,55,0.08),transparent_50%)]" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2" />
        
        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/20 rounded-full mb-6">
              <Ruler className="h-4 w-4 text-accent" />
              <span className="text-accent text-sm font-medium tracking-wide uppercase">Size Guide</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif text-white mb-6 leading-tight">
              Find Your
              <span className="block text-accent">Perfect Fit</span>
            </h1>
            
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
              Select your product category below to view detailed size charts, 
              measurement guides, and our interactive size calculator.
            </p>
          </div>
        </div>
      </section>

      {/* Category Selection */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif text-foreground mb-4">
              Select Category
            </h2>
            <p className="text-muted-foreground text-lg">
              Choose a category to view its size chart
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {sizeCategories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </div>
      </section>

      {/* Help Section */}
      <section className="py-16 lg:py-24 bg-secondary/30">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-serif text-foreground mb-4">
              Need Help Finding Your Size?
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Our size experts are here to help. Contact us for personalized sizing recommendations.
            </p>
            <Button asChild size="xl" variant="gold">
              <Link to="/contact">
                Contact Our Experts
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

// Category Card Component
const CategoryCard = ({ category }: { category: SizeCategory }) => {
  const CardContent = () => (
    <>
      {/* Image */}
      <div className="relative h-56 overflow-hidden">
        <img
          src={category.image}
          alt={category.title}
          className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${
            !category.available ? "grayscale opacity-70" : ""
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        
        {/* Status Badge */}
        {category.available ? (
          <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-accent text-black text-xs font-semibold rounded-full">
            <Sparkles className="h-3 w-3" />
            Available
          </div>
        ) : (
          <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold rounded-full">
            <Clock className="h-3 w-3" />
            Coming Soon
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-center gap-2 mb-2">
          <category.icon className="h-4 w-4 text-accent" />
          <span className="text-accent text-xs font-medium tracking-wide uppercase">
            {category.available ? "Size Chart" : "Preparing"}
          </span>
        </div>
        
        <h3 className="text-xl font-serif text-foreground mb-1 group-hover:text-accent transition-colors">
          {category.title}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          {category.subtitle}
        </p>

        {category.available ? (
          <span className="inline-flex items-center text-sm font-medium text-accent group-hover:gap-3 transition-all">
            View Size Chart
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        ) : (
          <span className="inline-flex items-center text-sm font-medium text-muted-foreground">
            Notify Me When Ready
          </span>
        )}
      </div>
    </>
  );

  if (category.available) {
    return (
      <Link
        to={category.link}
        className="group relative bg-card rounded-xl overflow-hidden border border-border hover:border-accent/50 transition-all duration-300 hover:shadow-xl hover:shadow-accent/5"
      >
        <CardContent />
      </Link>
    );
  }

  return (
    <div className="group relative bg-card rounded-xl overflow-hidden border border-border/50 cursor-not-allowed">
      <CardContent />
      
      {/* Coming Soon Overlay */}
      <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="text-center p-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/20 flex items-center justify-center">
            <Clock className="h-8 w-8 text-accent" />
          </div>
          <h4 className="text-lg font-semibold text-foreground mb-2">Coming Soon</h4>
          <p className="text-sm text-muted-foreground max-w-xs">
            We're working on this size guide. Check back soon!
          </p>
        </div>
      </div>
    </div>
  );
};

export default SizeGuide;
