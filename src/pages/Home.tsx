import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Leaf, Heart, Sparkles, Shield, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import heroImage from "@/assets/hero-home-fashion.jpg";
import heroLuxury1 from "@/assets/hero-luxury-1.jpg";
import heroLuxury2 from "@/assets/hero-luxury-2.jpg";
import heroLuxury3 from "@/assets/hero-luxury-3.jpg";
import heroLuxury4 from "@/assets/hero-luxury-4.jpg";
import heroKidsCotton1 from "@/assets/hero-kids-cotton-1.jpg";
import heroKidsCotton2 from "@/assets/hero-kids-cotton-2.jpg";
import heroKidsCotton3 from "@/assets/hero-kids-cotton-3.jpg";
import heroLadiesNightwear1 from "@/assets/hero-ladies-nightwear-1.jpg";
import heroLadiesNightwear2 from "@/assets/hero-ladies-nightwear-2.jpg";
import fabricSilk from "@/assets/fabric-silk.jpg";
import fabricCotton from "@/assets/fabric-cotton.jpg";
import fabricBamboo from "@/assets/fabric-bamboo.jpg";
import fabricModal from "@/assets/fabric-modal.jpg";
import fabricLinen from "@/assets/fabric-linen.jpg";
import processFabricSourcing from "@/assets/process-fabric-sourcing.jpg";
import processCadMarking from "@/assets/process-cad-marking.jpg";
import processCutting from "@/assets/process-cutting.jpg";
import processStitching from "@/assets/process-stitching.jpg";
import processIroning from "@/assets/process-ironing.jpg";
import processInspection from "@/assets/process-inspection.jpg";
import processPacking from "@/assets/process-packing.jpg";
import qualityImage from "@/assets/feature-quality.jpg";
import designImage from "@/assets/feature-design.jpg";
import { useSignatureProducts } from "@/hooks/useCollections";
import Autoplay from "embla-carousel-autoplay";
import { useEffect, useState } from "react";

const Home = () => {
  const { data: signatureProducts = [], isLoading } = useSignatureProducts();
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  
  const heroImages = [
    { src: heroLuxury1, alt: "Luxury silk loungewear collection" },
    { src: heroKidsCotton1, alt: "Kids wearing vibrant colorful cotton clothing sets" },
    { src: heroLadiesNightwear1, alt: "Elegant lady in stylish comfortable cotton nightwear" },
    { src: heroLuxury2, alt: "Premium organic cotton menswear" },
    { src: heroKidsCotton2, alt: "Stylish kids in modern cotton loungewear sets" },
    { src: heroLuxury3, alt: "Sustainable bamboo fabric collection" },
    { src: heroLadiesNightwear2, alt: "Sophisticated woman in premium cotton sleepwear set" },
    { src: heroKidsCotton3, alt: "Children in contemporary colorful cotton outfits" },
    { src: heroLuxury4, alt: "Premium modal sleepwear" },
    { src: heroImage, alt: "Feather Fashions luxury collection" },
  ];
  
  useEffect(() => {
    if (!api) return;

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

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
      <section className="relative h-screen overflow-hidden">
        <Carousel
          setApi={setApi}
          className="w-full h-full"
          opts={{
            align: "start",
            loop: true,
          }}
          plugins={[
            Autoplay({
              delay: 5000,
            }),
          ]}
        >
          <CarouselContent className="-ml-0 h-screen">
            {heroImages.map((image, index) => (
              <CarouselItem key={index} className="pl-0 basis-full">
                <div className="relative w-full h-screen">
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${image.src})`,
                    }}
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="absolute left-4 z-20 h-12 w-12 bg-background/20 backdrop-blur-sm border-white/20 text-white hover:bg-background/30" />
          <CarouselNext className="absolute right-4 z-20 h-12 w-12 bg-background/20 backdrop-blur-sm border-white/20 text-white hover:bg-background/30" />
        </Carousel>
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/50 to-transparent pointer-events-none z-10" />
        <div className="absolute inset-0 flex items-center z-10">
          <div className="container mx-auto px-4 relative">
            <div className="max-w-3xl space-y-8">
              <div className="inline-block animate-fade-in">
                <span className="px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-sm font-semibold tracking-wider">
                  NEW COLLECTION 2025
                </span>
              </div>
              <h1 className="text-6xl md:text-8xl font-bold leading-tight animate-fade-in">
                Feather-Light
                <br />
                <span className="text-gradient">Luxury</span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed animate-fade-in max-w-2xl">
                Where sustainable fashion meets unparalleled comfort. Experience premium fabrics that transform everyday moments into pure elegance.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 animate-fade-in">
                <Button asChild size="lg" className="text-lg group">
                  <Link to="/products">
                    Explore Collection
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="text-lg border-2">
                  <Link to="/about">Discover Our Story</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-3 z-20">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => api?.scrollTo(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                current === index 
                  ? "w-8 bg-white" 
                  : "w-2 bg-white/40 hover:bg-white/60"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-foreground/30 rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-1.5 bg-foreground/30 rounded-full" />
          </div>
        </div>
      </section>

      {/* Premium Fabrics Showcase */}
      <section className="py-20 bg-gradient-to-b from-background via-muted/20 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-semibold tracking-wider inline-block mb-6">
              PREMIUM MATERIALS
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Crafted from the Finest <span className="text-gradient">Fabrics</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experience luxury through our carefully curated collection of sustainable, premium textiles
            </p>
          </div>
          
          <Carousel
            className="w-full"
            opts={{
              align: "start",
              loop: true,
            }}
            plugins={[
              Autoplay({
                delay: 3000,
              }),
            ]}
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {[
                { src: fabricSilk, name: "Luxury Silk", desc: "Smooth & Lustrous", color: "bg-red-50 dark:bg-red-950/20" },
                { src: fabricCotton, name: "Organic Cotton", desc: "Soft & Breathable", color: "bg-amber-50 dark:bg-amber-950/20" },
                { src: fabricBamboo, name: "Bamboo Fiber", desc: "Eco-Friendly & Fresh", color: "bg-emerald-50 dark:bg-emerald-950/20" },
                { src: fabricModal, name: "Premium Modal", desc: "Silky & Elegant", color: "bg-purple-50 dark:bg-purple-950/20" },
                { src: fabricLinen, name: "Natural Linen", desc: "Textured & Timeless", color: "bg-orange-50 dark:bg-orange-950/20" },
              ].map((fabric, index) => (
                <CarouselItem key={index} className="pl-2 md:pl-4 basis-full md:basis-1/2 lg:basis-1/3">
                  <Card className="overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 group">
                    <div className="relative h-64 overflow-hidden">
                      <img 
                        src={fabric.src} 
                        alt={fabric.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className={`absolute inset-0 ${fabric.color} opacity-0 group-hover:opacity-30 transition-opacity duration-500`} />
                    </div>
                    <CardContent className="p-6 text-center">
                      <h3 className="font-bold text-xl mb-1">{fabric.name}</h3>
                      <p className="text-muted-foreground">{fabric.desc}</p>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2" />
            <CarouselNext className="right-2" />
          </Carousel>
        </div>
      </section>

      {/* Manufacturing Process Showcase */}
      <section className="py-20 bg-gradient-to-b from-background via-accent/5 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold tracking-wider inline-block mb-6">
              OUR PROCESS
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              From Fabric to <span className="text-gradient">Finished Garment</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Witness our meticulous manufacturing journey - where precision meets perfection at every stage
            </p>
          </div>
          
          <Carousel
            className="w-full"
            opts={{
              align: "start",
              loop: true,
            }}
            plugins={[
              Autoplay({
                delay: 4000,
              }),
            ]}
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {[
                { src: processFabricSourcing, name: "Fabric Sourcing", desc: "Premium quality fabric selection", step: "01" },
                { src: processCadMarking, name: "CAD Marking", desc: "Precision pattern programming", step: "02" },
                { src: processCutting, name: "Cutting", desc: "Automated fabric cutting", step: "03" },
                { src: processStitching, name: "Stitching", desc: "Skilled craftsmanship", step: "04" },
                { src: processIroning, name: "Ironing & Pressing", desc: "Perfect finish & crisp look", step: "05" },
                { src: processInspection, name: "Quality Inspection", desc: "Rigorous quality checks", step: "06" },
                { src: processPacking, name: "Packing", desc: "Secure packaging & dispatch", step: "07" },
              ].map((process, index) => (
                <CarouselItem key={index} className="pl-2 md:pl-4 basis-full md:basis-1/2 lg:basis-1/3">
                  <Card className="overflow-hidden border-2 shadow-xl hover:shadow-2xl transition-all duration-500 group">
                    <div className="relative h-72 overflow-hidden">
                      <img 
                        src={process.src} 
                        alt={process.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                      <div className="absolute top-4 left-4">
                        <span className="text-5xl font-bold text-white/20">{process.step}</span>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <h3 className="font-bold text-2xl mb-1 text-white">{process.name}</h3>
                        <p className="text-white/90 text-sm">{process.desc}</p>
                      </div>
                    </div>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2" />
            <CarouselNext className="right-2" />
          </Carousel>
        </div>
      </section>

      {/* Brand Story */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative h-[600px] rounded-3xl overflow-hidden group">
              <img 
                src={qualityImage} 
                alt="Premium fabric quality" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
            </div>
            <div className="space-y-8">
              <div className="inline-block">
                <span className="px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-semibold tracking-wider">
                  OUR PHILOSOPHY
                </span>
              </div>
              <h2 className="text-5xl md:text-6xl font-bold leading-tight">
                Comfort You Can
                <span className="text-gradient"> Feel</span>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                At Feather Fashions, we believe comfort should never compromise style. Our premium fabrics—from bamboo cotton to organic modal—create pieces that move with you, breathe with you, and make every moment feel effortless.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                    <Leaf className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-xl mb-1">Sustainable Materials</h3>
                    <p className="text-muted-foreground">Eco-conscious fabrics that care for you and the planet</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                    <Heart className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-xl mb-1">Handcrafted Quality</h3>
                    <p className="text-muted-foreground">Every piece crafted with attention to detail and care</p>
                  </div>
                </div>
              </div>
              <Button asChild size="lg" variant="outline">
                <Link to="/about">
                  Discover Our Values
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="px-4 py-2 rounded-full bg-gold/10 border border-gold/20 text-gold text-sm font-semibold tracking-wider inline-block mb-6">
              SIGNATURE PIECES
            </span>
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              Curated for <span className="text-gradient">You</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover pieces designed for comfort and crafted for style
            </p>
          </div>
          
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-80 w-full" />
                  <CardContent className="p-5 space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              {signatureProducts.map((product, idx) => (
                <Card 
                  key={product.id} 
                  className="overflow-hidden group border-0 shadow-lg hover:shadow-2xl transition-all duration-500"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="relative h-96 bg-muted overflow-hidden">
                    <img 
                      src={product.image_url} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <span className="absolute top-4 right-4 bg-gold/90 backdrop-blur-sm text-gold-foreground px-4 py-2 rounded-full text-xs font-semibold tracking-wider shadow-xl">
                      {product.category}
                    </span>
                    <div className="absolute bottom-4 left-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                      <Button asChild className="w-full" size="lg">
                        <Link to="/contact">
                          Inquire Now
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="font-bold text-xl mb-2 group-hover:text-primary transition-colors">{product.name}</h3>
                    <p className="text-muted-foreground text-sm">Premium {product.fabric}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="text-center">
            <Button asChild size="lg" className="text-lg group">
              <Link to="/products">
                View Complete Collection
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 bg-background relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-72 h-72 bg-secondary rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
            <div className="space-y-8">
              <span className="px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold tracking-wider inline-block">
                WHY CHOOSE US
              </span>
              <h2 className="text-5xl md:text-6xl font-bold leading-tight">
                Where Luxury Meets
                <span className="text-gradient"> Sustainability</span>
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Experience the perfect blend of premium quality, eco-conscious materials, and timeless design in every piece we create.
              </p>
            </div>
            <div className="relative h-[500px] rounded-3xl overflow-hidden group">
              <img 
                src={designImage} 
                alt="Design studio" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
              <Card 
                key={idx} 
                className="relative p-8 card-hover border-0 shadow-lg bg-card/80 backdrop-blur-sm group overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardContent className="p-0 relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-secondary via-accent to-gold flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 transition-transform">
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-bold text-xl mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary via-accent to-gold" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAgMi4yMS0xLjc5IDQtNCA0cy00LTEuNzktNC00IDEuNzktNCA0LTQgNCAxLjc5IDQgNHptMCAwIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center text-white space-y-8">
            <div className="inline-block animate-fade-in">
              <span className="px-6 py-3 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm font-semibold tracking-widest">
                JOIN OUR JOURNEY
              </span>
            </div>
            <h2 className="text-5xl md:text-7xl font-bold leading-tight animate-fade-in">
              Experience Feather-Light
              <br />
              Luxury Today
            </h2>
            <p className="text-xl md:text-2xl text-white/90 leading-relaxed max-w-3xl mx-auto animate-fade-in">
              Discover our complete collection of sustainable, comfortable fashion. From loungewear to everyday essentials—all crafted with care and attention to detail.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in pt-4">
              <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 text-lg shadow-2xl group">
                <Link to="/contact">
                  Start Your Journey
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-lg border-2 border-white text-white hover:bg-white/10">
                <Link to="/products">Browse Collection</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
