import { Card, CardContent } from "@/components/ui/card";
import { Target, Eye, Heart, Award } from "lucide-react";
import aboutImage from "@/assets/about-team.jpg";
import fabricImage from "@/assets/quality-fabric.jpg";

const About = () => {
  const values = [
    { icon: Heart, title: "Sustainability First", description: "Eco-friendly fabrics and ethical production practices" },
    { icon: Award, title: "Premium Quality", description: "Luxurious comfort in every stitch" },
    { icon: Target, title: "Mindful Design", description: "Timeless styles that transcend trends" },
    { icon: Eye, title: "Customer Delight", description: "Creating experiences, not just products" },
  ];

  const timeline = [
    { year: "2023", event: "The Beginning", description: "Feather Fashions founded in Annur with a sustainable vision" },
    { year: "2024", event: "Eco-Innovation", description: "Expanded to organic and bamboo-blend collections" },
    { year: "2025", event: "Global Presence", description: "Digital launch and international outreach" },
  ];

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="divider-accent mb-6" />
          <h1 className="text-5xl md:text-6xl font-bold mb-4">About Feather Fashions</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Where sustainable comfort meets modern elegance in every stitch.
          </p>
        </div>

        {/* Our Story */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h2 className="text-4xl font-bold mb-6">Our Story</h2>
            <div className="prose prose-lg text-muted-foreground">
              <p className="mb-4 leading-relaxed">
                Feather Fashions was born from a vision to redefine comfort with conscience. Founded by{" "}
                <span className="text-foreground font-semibold">Siva</span> and{" "}
                <span className="text-foreground font-semibold">Athilakshmi</span>, and inspired by their son{" "}
                <span className="text-foreground font-semibold">Ashrav</span>, our brand represents the perfect harmony of sustainable practices, innovative design, and uncompromising quality.
              </p>
              <p className="mb-4 leading-relaxed">
                From our roots in Annur, Tamil Nadu — India's knitwear capital — we've grown into a thoughtful apparel manufacturer dedicated to creating garments that are as gentle on the planet as they are on your skin. Every piece is crafted with eco-friendly fabrics like organic cotton, bamboo, modal, and Tencel, ensuring breathability, softness, and sustainability.
              </p>
              <p className="leading-relaxed">
                At Feather Fashions, we believe fashion should feel effortless. Our collections blend modern aesthetics with timeless comfort, perfect for lounging, sleeping, or everyday wear. We're not just making clothes — we're weaving a legacy of mindful living, one feather-soft garment at a time.
              </p>
            </div>
          </div>
          <div className="relative">
            <img
              src={aboutImage}
              alt="Feather Fashions Team"
              className="rounded-2xl shadow-2xl w-full object-cover h-96"
            />
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-br from-secondary to-accent rounded-2xl -z-10" />
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-2 border-secondary/20">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <Target className="h-10 w-10 text-secondary" />
                <h3 className="text-3xl font-bold">Our Mission</h3>
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed">
                To craft sustainable, premium-quality apparel that prioritizes comfort, style, and environmental responsibility. We aim to be the go-to partner for brands and individuals who value conscious fashion without compromising on elegance or functionality.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-2 border-accent/20">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <Eye className="h-10 w-10 text-accent" />
                <h3 className="text-3xl font-bold">Our Vision</h3>
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed">
                To become a globally recognized leader in sustainable fashion, blending Indian craftsmanship with eco-innovation. We envision a world where every garment tells a story of quality, care, and commitment to the planet.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Our Values */}
        <div className="mb-20">
          <h2 className="text-4xl font-bold text-center mb-12">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, idx) => (
              <Card key={idx} className="text-center card-hover">
                <CardContent className="p-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-4">
                    <value.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-accent font-semibold text-xl mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="mb-20">
          <h2 className="text-4xl font-bold text-center mb-12">Our Journey</h2>
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-secondary via-accent to-primary hidden md:block" />
            <div className="space-y-12">
              {timeline.map((item, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-8 ${idx % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}
                >
                  <div className={`flex-1 ${idx % 2 === 0 ? "md:text-right" : "md:text-left"}`}>
                    <h3 className="text-3xl font-bold text-secondary mb-2">{item.year}</h3>
                    <h4 className="text-2xl font-semibold mb-2">{item.event}</h4>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center font-bold text-white text-xl shadow-lg z-10">
                    {idx + 1}
                  </div>
                  <div className="flex-1 hidden md:block" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quality Promise */}
        <Card className="bg-gradient-to-r from-primary via-secondary to-accent text-white overflow-hidden">
          <CardContent className="p-8 md:p-12 relative">
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
                Our Promise to You
              </h2>
              <p className="text-lg text-center text-white/90 max-w-3xl mx-auto leading-relaxed">
                Every garment we create is a promise — of sustainable sourcing, ethical manufacturing, and unmatched comfort. From selecting the finest eco-friendly fabrics to the final stitch, we uphold the highest standards. Your comfort and our planet's well-being are at the heart of everything we do.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default About;
