import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Award, Clock, Sparkles, Users } from "lucide-react";
import heroImage from "@/assets/hero-manufacturing.jpg";
import productsImage from "@/assets/products-showcase.jpg";
import product1 from "@/assets/products/kids-clothing-1.jpg";
import product2 from "@/assets/products/boys-shorts-1.jpg";
import product3 from "@/assets/products/track-pants-1.jpg";
import product4 from "@/assets/products/girls-leggings-1.jpg";

const Home = () => {
  const features = [
    {
      icon: Award,
      title: "Quality Manufacturing",
      description: "Premium fabrics and precision stitching in every garment we produce.",
    },
    {
      icon: Clock,
      title: "On-Time Delivery",
      description: "Reliable timelines and consistent delivery schedules for your business.",
    },
    {
      icon: Sparkles,
      title: "Modern Design Facility",
      description: "State-of-the-art equipment and innovative production techniques.",
    },
    {
      icon: Users,
      title: "Custom Bulk Orders",
      description: "Flexible solutions for uniforms, corporate wear, and private labels.",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(rgba(45, 64, 87, 0.7), rgba(45, 64, 87, 0.85)), url(${heroImage})`,
          }}
        />
        <div className="container mx-auto px-4 relative z-10 text-center text-white">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
            Threads of Quality.
            <br />
            <span className="text-gradient">Designs of Tomorrow.</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto text-white/90 animate-fade-in">
            From manufacturing to modern fashion — crafted with care, delivered with pride.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
            <Button asChild size="lg" className="bg-secondary hover:bg-secondary/90 text-lg">
              <Link to="/products">Explore Collections</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-white/10 backdrop-blur-sm border-white text-white hover:bg-white hover:text-primary text-lg">
              <Link to="/contact">Get in Touch</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* About Preview */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="divider-gold mb-6" />
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Our Story</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              Founded by Siva and Athilakshmi, Ashrathi Apparels is where craftsmanship meets creativity. 
              With a legacy of precision, comfort, and quality, every thread we weave reflects dedication and style. 
              Inspired by our son Ashrav, we bring together Indian heritage and modern innovation.
            </p>
            <Button asChild variant="outline" size="lg">
              <Link to="/about">Learn More About Us</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="divider-gold mb-6" />
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Featured Products</h2>
            <p className="text-lg text-muted-foreground">Discover our premium range of apparel</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { name: "Boys Super Poly Shorts", tag: "Premium Quality", image: product1 },
              { name: "Girls Printed 3/4th", tag: "Trending Design", image: product2 },
              { name: "Teenage HOS Pant", tag: "Comfortable Fit", image: product3 },
              { name: "SR Boys Poly Track Pant", tag: "Durable Fabric", image: product4 },
            ].map((product, idx) => (
              <Card key={idx} className="overflow-hidden card-hover">
                <div className="h-64 bg-muted relative overflow-hidden">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-4 right-4 bg-accent text-accent-foreground px-3 py-1 rounded-full text-xs font-accent font-semibold shadow-lg">
                    {product.tag}
                  </span>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                  <Button asChild variant="outline" className="w-full hover:bg-secondary hover:text-secondary-foreground">
                    <Link to="/contact">Request Quote</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
              <Link to="/products">View All Products</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="divider-gold mb-6" />
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Why Choose Us</h2>
            <p className="text-lg text-muted-foreground">Excellence in every stitch</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
              <Card key={idx} className="text-center p-6 card-hover border-2">
                <CardContent className="p-0">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center mx-auto mb-4">
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
      <section
        className="py-24 relative"
        style={{
          backgroundImage: `linear-gradient(rgba(42, 167, 142, 0.9), rgba(247, 111, 50, 0.9)), url(${productsImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Partner with Ashrathi Apparels Today
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Let's create something beautiful together. Connect with us for custom orders, bulk manufacturing, or to learn more about our services.
          </p>
          <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 text-lg">
            <Link to="/contact">Contact Us Now</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Home;
