import { Card, CardContent } from "@/components/ui/card";
import { Target, Eye, Heart, Award, Leaf, Sparkles } from "lucide-react";
import aboutImage from "@/assets/about-team.jpg";
import aboutHeroBanner from "@/assets/about-hero-banner.jpg";

const About = () => {
  const values = [
    { icon: Leaf, title: "Sustainability First", description: "Eco-friendly fabrics and ethical production practices" },
    { icon: Award, title: "Premium Quality", description: "Luxurious comfort in every stitch" },
    { icon: Target, title: "Mindful Design", description: "Timeless styles that transcend trends" },
    { icon: Sparkles, title: "Customer Delight", description: "Creating experiences, not just products" },
  ];

  const timeline = [
    { year: "2023", event: "The Beginning", description: "Feather Fashions founded in Tirupur with a sustainable vision" },
    { year: "2024", event: "Eco-Innovation", description: "Expanded to organic and bamboo-blend collections" },
    { year: "2025", event: "Global Presence", description: "Digital launch and international outreach" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Premium Banner */}
      <section className="relative h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center scale-105"
          style={{
            backgroundImage: `url(${aboutHeroBanner})`,
          }}
        />
        {/* Premium gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/30" />
        
        {/* Gold accent particles effect */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-accent rounded-full animate-pulse" />
          <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-accent rounded-full animate-pulse delay-300" />
          <div className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-accent rounded-full animate-pulse delay-500" />
        </div>
        
        {/* Content */}
        <div className="relative z-10 text-left px-4 md:px-16 max-w-7xl mx-auto w-full">
          <div className="max-w-2xl">
            <p className="text-accent font-medium tracking-[0.4em] mb-6 text-xs md:text-sm uppercase">
              Crafted With Purpose
            </p>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-white mb-8 tracking-tight leading-[0.9]">
              FEATHER
              <br />
              <span className="text-accent">FASHIONS</span>
            </h1>
            <div className="w-24 h-0.5 bg-accent mb-8" />
            <p className="text-lg md:text-xl text-white/90 max-w-xl font-light leading-relaxed">
              Where Comfort Meets Conscious Craftsmanship.
            </p>
            <p className="text-base md:text-lg text-white/70 mt-4 font-light italic">
              Designed for Movement. Inspired by You.
            </p>
          </div>
        </div>
        
        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Story Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-accent font-medium tracking-[0.2em] mb-4 text-sm">SINCE 2023</p>
              <h2 className="text-4xl md:text-5xl font-serif font-bold mb-8 text-foreground">
                Crafted with Purpose
              </h2>
              <div className="space-y-6 text-muted-foreground text-lg leading-relaxed">
                <p>
                  Feather Fashions was born from a vision to redefine comfort with conscience. Founded by{" "}
                  <span className="text-foreground font-semibold">Siva</span> and{" "}
                  <span className="text-foreground font-semibold">Athilakshmi</span>, inspired by their son{" "}
                  <span className="text-foreground font-semibold">Ashrav</span>, our brand represents sustainable practices, innovative design, and uncompromising quality.
                </p>
                <p>
                  From our roots in Tirupur, Tamil Nadu — India's knitwear capital — we craft garments as gentle on the planet as they are on your skin. Every piece uses eco-friendly fabrics like organic cotton, bamboo, modal, and Tencel.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src={aboutImage}
                  alt="Feather Fashions"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-accent/20 rounded-2xl -z-10" />
              <div className="absolute -top-8 -right-8 w-32 h-32 border-2 border-accent/30 rounded-2xl -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* Pillar Section */}
      <section className="py-24 bg-primary/5">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <Award className="w-16 h-16 text-accent mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4 text-foreground">The Pillar of Our Success</h2>
          <div className="w-20 h-0.5 bg-accent mx-auto mb-8" />
          <p className="text-lg text-muted-foreground leading-relaxed mb-6">
            At the heart of Feather Fashions stands <span className="font-bold text-accent">Mr. Vadivel Palanisamy</span>, 
            the backbone and guiding force of our organization. His unwavering dedication, business acumen, and 
            commitment to excellence have been instrumental in shaping our company's growth.
          </p>
          <p className="text-lg text-muted-foreground leading-relaxed">
            With years of experience in the garment industry, his leadership and vision continue to inspire our 
            team to maintain the highest standards of quality and customer satisfaction.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-0 shadow-lg">
              <CardContent className="p-10">
                <Target className="h-12 w-12 text-primary mb-6" />
                <h3 className="text-2xl font-serif font-bold mb-4 text-foreground">Our Mission</h3>
                <p className="text-muted-foreground leading-relaxed">
                  To craft sustainable, premium-quality apparel that prioritizes comfort, style, and environmental responsibility. We aim to be the go-to partner for brands and individuals who value conscious fashion without compromising on elegance.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-0 shadow-lg">
              <CardContent className="p-10">
                <Eye className="h-12 w-12 text-accent mb-6" />
                <h3 className="text-2xl font-serif font-bold mb-4 text-foreground">Our Vision</h3>
                <p className="text-muted-foreground leading-relaxed">
                  To become a globally recognized leader in sustainable fashion, blending Indian craftsmanship with eco-innovation. We envision a world where every garment tells a story of quality, care, and commitment.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-muted/30 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <p className="text-accent font-medium tracking-[0.2em] mb-4 text-sm">WHAT WE BELIEVE</p>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground">Our Values</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, idx) => (
              <div key={idx} className="text-center group">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <value.icon className="h-10 w-10 text-white" />
                </div>
                <h3 className="font-semibold text-xl mb-3 text-foreground">{value.title}</h3>
                <p className="text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <p className="text-accent font-medium tracking-[0.2em] mb-4 text-sm">MILESTONES</p>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground">Our Journey</h2>
          </div>
          <div className="space-y-12">
            {timeline.map((item, idx) => (
              <div key={idx} className="flex gap-8 items-start">
                <div className="flex-shrink-0 w-24">
                  <span className="text-3xl font-bold text-accent">{item.year}</span>
                </div>
                <div className="flex-shrink-0 w-4 h-4 rounded-full bg-accent mt-2 relative">
                  {idx !== timeline.length - 1 && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 w-0.5 h-24 bg-accent/30" />
                  )}
                </div>
                <div className="flex-1 pb-8">
                  <h3 className="text-xl font-bold mb-2 text-foreground">{item.event}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Promise */}
      <section className="py-24 bg-gradient-to-r from-primary via-primary/90 to-primary">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <Heart className="w-12 h-12 text-white/80 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6 text-white">
            Our Promise to You
          </h2>
          <p className="text-lg text-white/90 leading-relaxed max-w-3xl mx-auto">
            Every garment we create is a promise — of sustainable sourcing, ethical manufacturing, and unmatched comfort. From selecting the finest eco-friendly fabrics to the final stitch, we uphold the highest standards. Your comfort and our planet's well-being are at the heart of everything we do.
          </p>
        </div>
      </section>
    </div>
  );
};

export default About;
