import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Layers, Tag, Users2, Truck, ShieldCheck, Sparkles } from "lucide-react";

const Services = () => {
  const services = [
    {
      icon: Layers,
      title: "Custom Garment Manufacturing",
      description: "End-to-end production from pattern design to final packaging. We handle every detail with precision and care.",
      features: ["Pattern Development", "Fabric Sourcing", "Production Management", "Quality Packaging"],
    },
    {
      icon: Tag,
      title: "Private Labeling",
      description: "Build your brand with our private labeling services. Custom designs, branding, and labeling tailored to your vision.",
      features: ["Brand Design Support", "Custom Tags & Labels", "Packaging Solutions", "Market-Ready Products"],
    },
    {
      icon: Users2,
      title: "Bulk Uniform Orders",
      description: "Specialized in large-scale uniform production for schools, corporates, sports teams, and organizations.",
      features: ["School Uniforms", "Corporate Wear", "Sports Apparel", "Institutional Orders"],
    },
    {
      icon: Truck,
      title: "Export & Logistics Support",
      description: "International-ready packaging and shipping solutions. We ensure your products reach anywhere in the world.",
      features: ["Export Documentation", "Secure Packaging", "Global Shipping", "Customs Clearance Support"],
    },
    {
      icon: ShieldCheck,
      title: "Quality Control & Inspection",
      description: "Rigorous quality checks at every stage of production. We maintain the highest standards for every garment.",
      features: ["Fabric Inspection", "Stitching Quality Check", "Color Consistency", "Final Product Audit"],
    },
    {
      icon: Sparkles,
      title: "Design & Consultation",
      description: "Expert guidance on trends, fabrics, and designs. We help bring your apparel vision to life.",
      features: ["Trend Analysis", "Fabric Selection", "Design Prototyping", "Sample Development"],
    },
  ];

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="divider-gold mb-6" />
          <h1 className="text-5xl md:text-6xl font-bold mb-4">What We Do Best</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comprehensive apparel manufacturing solutions tailored to your business needs.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {services.map((service, idx) => (
            <Card key={idx} className="card-hover border-2">
              <CardContent className="p-6">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center mb-4">
                  <service.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="font-accent font-semibold text-2xl mb-3">{service.title}</h3>
                <p className="text-muted-foreground mb-4 leading-relaxed">{service.description}</p>
                <ul className="space-y-2">
                  {service.features.map((feature, fidx) => (
                    <li key={fidx} className="flex items-center text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Process Section */}
        <div className="bg-muted/30 rounded-2xl p-8 md:p-12 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Our Manufacturing Process</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: "01", title: "Consultation", desc: "Discuss your requirements and vision" },
              { step: "02", title: "Design & Sampling", desc: "Create prototypes and samples" },
              { step: "03", title: "Production", desc: "Manufacture with quality control" },
              { step: "04", title: "Delivery", desc: "Package and deliver on time" },
            ].map((process, idx) => (
              <div key={idx} className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary text-white font-bold text-xl flex items-center justify-center mx-auto mb-4">
                  {process.step}
                </div>
                <h3 className="font-accent font-semibold text-lg mb-2">{process.title}</h3>
                <p className="text-sm text-muted-foreground">{process.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-secondary via-accent to-primary text-white p-8 md:p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Looking for a Reliable Apparel Partner?
          </h2>
          <p className="text-lg mb-6 text-white/90 max-w-2xl mx-auto">
            Let's connect and discuss how we can help bring your apparel vision to reality with our expertise and quality manufacturing.
          </p>
          <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90">
            <Link to="/contact">Start Your Project</Link>
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default Services;
