import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Leaf, Heart, Sparkles, Shield } from "lucide-react";
import heroImage from "@/assets/hero-feather-fashions.jpg";
import product1 from "@/assets/products/cloud-whisper-lounge-set.jpg";
import product2 from "@/assets/products/free-spirit-tshirt.jpg";
import product3 from "@/assets/products/feathersoft-lounge-tee.jpg";
import product4 from "@/assets/products/featherflow-coord-set.jpg";

const Home = () => {
  const features = [
    {
      icon: Leaf,
      title: "Sustainable Fabrics",
      description: "Eco-friendly materials including bamboo, organic cotton, and modal.",
    },
    {
      icon: Heart,
      title: "Ultimate Comfort",
      description: "Ultra-soft fabrics that feel like a gentle hug on your skin.",
    },
    {
      icon: Sparkles,
      title: "Modern Design",
      description: "Contemporary styles that blend elegance with everyday wearability.",
    },
    {
      icon: Shield,
      title: "Quality Promise",
      description: "Premium craftsmanship ensuring durability and long-lasting comfort.",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(rgba(180, 140, 180, 0.3), rgba(255, 240, 240, 0.4)), url(${heroImage})`,
          }}
        />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
              Feather-Light Comfort.
              <br />
              <span className="text-gradient">Limitless Style.</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-foreground/80 animate-fade-in">
              Premium loungewear and sustainable fashion crafted with ultra-soft fabrics for the modern lifestyle.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in">
              <Button asChild size="lg" className="bg-secondary hover:bg-secondary/90 text-lg">
                <Link to="/products">Shop Collection</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-2 text-lg">
                <Link to="/about">Our Story</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* About Preview */}
      <section className="py-20 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="divider-accent mb-6" />
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Comfort You Can Feel</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              At Feather Fashions, we believe comfort should never compromise style. Our premium fabrics—from bamboo cotton to organic modal—create pieces that move with you, breathe with you, and make every moment feel effortless.
            </p>
            <Button asChild variant="outline" size="lg">
              <Link to="/about">Discover Our Values</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="divider-accent mb-6" />
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Signature Collection</h2>
            <p className="text-lg text-muted-foreground">Discover pieces designed for comfort and crafted for style</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { name: "Cloud Whisper Lounge Set", tag: "Bestseller", image: product1, category: "Women" },
              { name: "Free Spirit T-Shirt", tag: "New", image: product2, category: "Women" },
              { name: "FeatherSoft Lounge Tee", tag: "Premium", image: product3, category: "Unisex" },
              { name: "FeatherFlow Co-ord Set", tag: "Trending", image: product4, category: "Women" },
            ].map((product, idx) => (
              <Card key={idx} className="overflow-hidden group card-hover">
                <div className="h-80 bg-muted relative overflow-hidden">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-4 left-4 bg-secondary text-secondary-foreground px-3 py-1.5 rounded-full text-xs font-accent font-semibold shadow-lg">
                    {product.tag}
                  </span>
                  <span className="absolute top-4 right-4 bg-background/90 text-foreground px-3 py-1 rounded-full text-xs font-medium">
                    {product.category}
                  </span>
                </div>
                <CardContent className="p-5">
                  <h3 className="font-semibold text-lg mb-3">{product.name}</h3>
                  <Button asChild variant="outline" className="w-full hover:bg-secondary hover:text-secondary-foreground border-2">
                    <Link to="/contact">Inquire Now</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
              <Link to="/products">Explore All Products</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="divider-accent mb-6" />
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Why Feather Fashions</h2>
            <p className="text-lg text-muted-foreground">Where sustainability meets luxury</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
              <Card key={idx} className="text-center p-6 card-hover border-2 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-0">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-secondary via-accent to-gold flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-accent font-semibold text-xl mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-secondary/90 to-accent/80 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Experience Feather-Light Luxury
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Discover our complete collection of sustainable, comfortable fashion. From loungewear to everyday essentials—all crafted with care.
          </p>
          <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 text-lg shadow-xl">
            <Link to="/contact">Get in Touch</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Home;
