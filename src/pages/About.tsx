import { Card, CardContent } from "@/components/ui/card";
import { Target, Eye, Heart, Award } from "lucide-react";
import aboutImage from "@/assets/about-team.jpg";
import fabricImage from "@/assets/quality-fabric.jpg";

const About = () => {
  const values = [
    { icon: Heart, title: "Integrity", description: "Honesty and transparency in every interaction" },
    { icon: Award, title: "Innovation", description: "Embracing new ideas and technologies" },
    { icon: Target, title: "Sustainability", description: "Responsible manufacturing practices" },
    { icon: Eye, title: "Customer Satisfaction", description: "Exceeding expectations every time" },
  ];

  const timeline = [
    { year: "2023", event: "Founded", description: "Ashrathi Apparels established with a vision" },
    { year: "2024", event: "Expansion", description: "Expanded product range and production capacity" },
    { year: "2025", event: "Digital Launch", description: "Launch of online presence and catalog" },
  ];

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="divider-accent mb-6" />
          <h1 className="text-5xl md:text-6xl font-bold mb-4">About Ashrathi Apparels</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Where tradition meets innovation in every thread we weave.
          </p>
        </div>

        {/* Our Story */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h2 className="text-4xl font-bold mb-6">Our Story</h2>
            <div className="prose prose-lg text-muted-foreground">
              <p className="mb-4 leading-relaxed">
                Ashrathi Apparels began as a dream to merge tradition with innovation. Founded by{" "}
                <span className="text-foreground font-semibold">Siva</span> and{" "}
                <span className="text-foreground font-semibold">Athilakshmi</span>, inspired by their son{" "}
                <span className="text-foreground font-semibold">Ashrav</span>, our brand embodies dedication, precision, and creativity.
              </p>
              <p className="mb-4 leading-relaxed">
                From a small idea to a thriving apparel manufacturing unit, we continue to stitch our passion into every garment. 
                Our journey is defined by a commitment to quality, a love for craftsmanship, and a vision to deliver excellence.
              </p>
              <p className="leading-relaxed">
                With a legacy of precision, comfort, and quality, every thread we weave reflects our dedication to creating 
                apparel that doesn't just look good but feels exceptional.
              </p>
            </div>
          </div>
          <div className="relative">
            <img
              src={aboutImage}
              alt="Ashrathi Team"
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
                To deliver top-quality apparel with creative craftsmanship and timely service. We aim to be the trusted 
                manufacturing partner for brands seeking excellence in every stitch.
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
                To become a globally trusted apparel manufacturer blending Indian heritage with innovation. We envision 
                expanding our reach while maintaining our core values of quality and craftsmanship.
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
                Every garment that leaves our facility carries our commitment to excellence. From fabric selection to final 
                stitching, we ensure the highest standards. Your trust is our greatest asset, and quality is our promise.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default About;
