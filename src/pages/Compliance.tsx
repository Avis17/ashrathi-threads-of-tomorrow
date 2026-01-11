import { Link } from "react-router-dom";
import { ArrowRight, Shield, FileCheck, Building2, Globe, Award, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SEO from "@/components/seo/SEO";

const Compliance = () => {
  const certifications = [
    {
      title: "GST Registration",
      number: "33FWTPS1281P1ZJ",
      icon: FileCheck,
      description: "Goods and Services Tax Registration with Government of India",
      category: "Tax Compliance",
    },
    {
      title: "Udyam Registration",
      number: "UDYAM-TN-28-0191326",
      icon: Building2,
      description: "Ministry of MSME, Government of India certified enterprise",
      category: "Business Registration",
    },
    {
      title: "Import Export Code",
      number: "FWTPS1281P",
      icon: Globe,
      description: "Directorate General of Foreign Trade (DGFT) registered exporter",
      category: "Export License",
    },
  ];

  const businessDetails = [
    { label: "Business Type", value: "Proprietorship" },
    { label: "Industry", value: "Textile & Apparel Manufacturing" },
    { label: "Country of Origin", value: "India" },
    { label: "Location", value: "Tiruppur, Tamil Nadu" },
    { label: "Export Capabilities", value: "Worldwide" },
    { label: "Year Established", value: "2023" },
  ];

  const complianceStandards = [
    {
      title: "Quality Standards",
      items: ["AQL 2.5 for export shipments", "Multi-point inspection", "Fabric testing & wash tests", "Measurement accuracy checks"],
    },
    {
      title: "Ethical Manufacturing",
      items: ["Fair wages to workers", "Safe working conditions", "No child labor", "Regular working hours"],
    },
    {
      title: "Environmental Practices",
      items: ["Eco-friendly fabric options", "Waste reduction initiatives", "Sustainable packaging", "Energy-efficient operations"],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Compliance & Certifications | Feather Fashions - Export Manufacturer India"
        description="Verified export-compliant apparel manufacturer from India. GST registered, IEC holder, Udyam certified. Legal and transparent business practices for international buyers."
        canonicalUrl="/compliance"
      />

      {/* Hero Section */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-8">
              <Shield className="w-10 h-10 text-accent" />
            </div>
            <p className="text-accent font-medium tracking-[0.3em] mb-4 text-sm uppercase">
              Trust & Transparency
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-athletic font-black mb-6 leading-tight">
              COMPLIANCE &
              <span className="block text-accent">CERTIFICATIONS</span>
            </h1>
            <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">
              Feather Fashions is a legally registered, export-compliant apparel manufacturer. 
              All our registrations are verifiable with respective government authorities.
            </p>
          </div>
        </div>
      </section>

      {/* Main Certifications */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-accent font-medium tracking-[0.3em] mb-4 text-sm uppercase">
              Official Registrations
            </p>
            <h2 className="text-3xl md:text-4xl font-athletic font-bold text-foreground">
              VERIFIED CREDENTIALS
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {certifications.map((cert, index) => (
              <Card key={index} className="border-2 hover:border-accent transition-colors group">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6 group-hover:bg-accent/20 transition-colors">
                    <cert.icon className="w-8 h-8 text-accent" />
                  </div>
                  <span className="text-xs font-medium text-accent tracking-wider uppercase">
                    {cert.category}
                  </span>
                  <h3 className="text-xl font-bold mt-2 mb-4">{cert.title}</h3>
                  <div className="bg-muted px-4 py-3 rounded-lg mb-4">
                    <code className="text-lg font-mono font-bold text-foreground">
                      {cert.number}
                    </code>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {cert.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Trust Badge */}
          <div className="mt-16 max-w-3xl mx-auto">
            <Card className="bg-gradient-to-r from-accent/10 to-accent/5 border-accent/20">
              <CardContent className="p-8 text-center">
                <Award className="w-12 h-12 text-accent mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Export-Ready & Compliant</h3>
                <p className="text-muted-foreground">
                  All registrations are active and verifiable. We maintain complete transparency 
                  in our business operations and welcome due diligence from international buyers.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Business Details */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-accent font-medium tracking-[0.3em] mb-4 text-sm uppercase">
                Company Information
              </p>
              <h2 className="text-3xl md:text-4xl font-athletic font-bold text-foreground">
                BUSINESS DETAILS
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {businessDetails.map((detail, index) => (
                <Card key={index} className="border-0 shadow-md">
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground mb-1">{detail.label}</p>
                    <p className="text-lg font-semibold text-foreground">{detail.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Full Address */}
            <Card className="mt-8 border-2">
              <CardContent className="p-8">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-accent" />
                  Registered Address
                </h3>
                <address className="not-italic text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">Feather Fashions</strong><br />
                  251/1, Vadivel Nagar, Thottipalayam,<br />
                  Pooluvapatti, Tiruppur,<br />
                  Tamil Nadu - 641602, India
                </address>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Compliance Standards */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-accent font-medium tracking-[0.3em] mb-4 text-sm uppercase">
              Our Standards
            </p>
            <h2 className="text-3xl md:text-4xl font-athletic font-bold text-foreground">
              MANUFACTURING COMPLIANCE
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {complianceStandards.map((standard, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold mb-6 text-foreground">{standard.title}</h3>
                  <ul className="space-y-3">
                    {standard.items.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-muted-foreground">
                        <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-athletic font-bold mb-6">
            Ready to Partner With Us?
          </h2>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto mb-8">
            We welcome inquiries from international buyers, buying houses, and sourcing managers. 
            Our team is ready to assist with sample development and bulk order requirements.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Link to="/contact">
                Contact for Export Orders
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              <Link to="/manufacturing">
                View Manufacturing
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Compliance;
