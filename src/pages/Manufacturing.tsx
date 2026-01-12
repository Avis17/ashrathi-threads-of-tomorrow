import { Link } from "react-router-dom";
import { ArrowRight, Factory, CheckCircle2, Scissors, PackageCheck, Truck, Sparkles, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SEO from "@/components/seo/SEO";
import heroManufacturing from "@/assets/b2b/hero-manufacturing.jpg";
import productionLine from "@/assets/b2b/production-line.jpg";
import qualityControl from "@/assets/b2b/quality-control.jpg";
import exportLogistics from "@/assets/b2b/export-logistics.jpg";

// Process step images
import processFabricSourcing from "@/assets/process-fabric-sourcing.jpg";
import processCadMarking from "@/assets/process-cad-marking.jpg";
import processCutting from "@/assets/process-cutting.jpg";
import processStitching from "@/assets/process-stitching.jpg";
import processInspection from "@/assets/process-inspection.jpg";
import processIroning from "@/assets/process-ironing.jpg";
import processPacking from "@/assets/process-packing.jpg";

// Fabric images
import fabricBamboo from "@/assets/fabric-bamboo.jpg";
import fabricCotton from "@/assets/fabric-cotton.jpg";
import fabricLinen from "@/assets/fabric-linen.jpg";
import fabricModal from "@/assets/fabric-modal.jpg";
import fabricSilk from "@/assets/fabric-silk.jpg";

const Manufacturing = () => {
  const processSteps = [
    {
      step: "01",
      title: "Design & Development",
      description: "Collaborative design process with CAD patterns and tech packs tailored to your brand requirements.",
      icon: Sparkles,
      image: processCadMarking,
    },
    {
      step: "02",
      title: "Sampling",
      description: "Prototype development with rapid iterations. Approval samples before bulk production.",
      icon: Scissors,
      image: processCutting,
    },
    {
      step: "03",
      title: "Fabric Sourcing",
      description: "Premium fabrics from certified mills. Cotton, Lycra, Modal, and performance blends.",
      icon: Factory,
      image: processFabricSourcing,
    },
    {
      step: "04",
      title: "Production",
      description: "State-of-the-art machinery with skilled workforce. Capacity for large-scale orders.",
      icon: CheckCircle2,
      image: processStitching,
    },
    {
      step: "05",
      title: "Quality Control",
      description: "Multi-point inspection at every stage. AQL standards for international buyers.",
      icon: Shield,
      image: processInspection,
    },
    {
      step: "06",
      title: "Export Packing",
      description: "Custom packaging, labeling, and documentation for seamless international shipping.",
      icon: PackageCheck,
      image: processPacking,
    },
  ];

  const capabilities = [
    { label: "Monthly Capacity", value: "50,000+", unit: "Pieces" },
    { label: "Production Lines", value: "15+", unit: "Units" },
    { label: "Skilled Workforce", value: "200+", unit: "Employees" },
    { label: "Export Experience", value: "10+", unit: "Years" },
  ];

  const fabricOptions = [
    { name: "Cotton Jersey", gsm: "160-280 GSM", features: ["Breathable", "Soft Touch", "Durable"], image: fabricCotton },
    { name: "Bamboo Blend", gsm: "180-220 GSM", features: ["Eco-Friendly", "Anti-Bacterial", "Soft"], image: fabricBamboo },
    { name: "Modal / Tencel", gsm: "160-200 GSM", features: ["Eco-Friendly", "Silky Feel", "Breathable"], image: fabricModal },
    { name: "Linen Blend", gsm: "140-180 GSM", features: ["Natural", "Lightweight", "Premium"], image: fabricLinen },
    { name: "Silk Touch", gsm: "120-160 GSM", features: ["Luxurious", "Smooth", "Premium"], image: fabricSilk },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Export-Compliant Garment Manufacturing in Tiruppur, India | Feather Fashions"
        titleAr="تصنيع ملابس متوافق مع التصدير في تيروبور، الهند | فيذر فاشونز"
        description="Our manufacturing facility in Tiruppur follows strict quality control, ethical production practices, and export compliance standards. OEM apparel manufacturing for international brands, wholesalers, and importers."
        descriptionAr="منشأتنا التصنيعية في تيروبور تتبع رقابة جودة صارمة وممارسات إنتاج أخلاقية ومعايير الامتثال للتصدير. تصنيع ملابس OEM للعلامات التجارية الدولية والموزعين والمستوردين."
        keywords="garment manufacturing India, OEM apparel manufacturing, export garment factory Tiruppur, bulk garment manufacturer, private label clothing production, wholesale apparel manufacturing India"
        keywordsAr="تصنيع ملابس الهند, تصنيع ملابس OEM, مصنع ملابس للتصدير تيروبور, مصنع ملابس بالجملة"
        canonicalUrl="/manufacturing"
      />

      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroManufacturing})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent" />
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-2xl">
            <p className="text-accent font-medium tracking-[0.3em] mb-4 text-sm uppercase">
              Manufacturing Excellence
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-athletic font-black text-white mb-6 leading-tight">
              EXPORT-COMPLIANT
              <span className="block text-accent">GARMENT MANUFACTURING</span>
              <span className="block text-white/80 text-2xl md:text-3xl mt-2 font-bold">in Tiruppur, India</span>
            </h1>
            <p className="text-lg text-white/80 mb-8 max-w-xl">
              Our manufacturing facility in Tiruppur follows strict quality control, ethical production practices, and export compliance standards. From fabric sourcing to finishing and packing, we support bulk garment manufacturing for international brands, wholesalers, and importers.
            </p>
            <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Link to="/contact">
                Request Factory Visit
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Capacity Stats */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {capabilities.map((cap, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-athletic font-black text-accent mb-2">
                  {cap.value}
                </div>
                <div className="text-sm text-primary-foreground/60 uppercase tracking-wider">
                  {cap.unit}
                </div>
                <div className="text-sm font-medium mt-1">{cap.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Flow */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-accent font-medium tracking-[0.3em] mb-4 text-sm uppercase">
              Our Process
            </p>
            <h2 className="text-3xl md:text-4xl font-athletic font-bold text-foreground">
              FROM DESIGN TO DELIVERY
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {processSteps.map((step, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden">
                <div className="aspect-video overflow-hidden">
                  <img 
                    src={step.image} 
                    alt={step.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <span className="text-4xl font-athletic font-black text-muted-foreground/20 group-hover:text-accent/30 transition-colors">
                      {step.step}
                    </span>
                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <step.icon className="w-5 h-5 text-accent" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-foreground">{step.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Production Facility */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-accent font-medium tracking-[0.3em] mb-4 text-sm uppercase">
                State-of-the-Art Facility
              </p>
              <h2 className="text-3xl md:text-4xl font-athletic font-bold text-foreground mb-6">
                MODERN PRODUCTION LINES
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Our manufacturing unit in Tiruppur is equipped with advanced machinery including computerized sewing machines, overlock machines, flatlock for seamless finishes, and automated cutting systems.
                </p>
                <p>
                  We specialize in activewear, leggings, sports bras, t-shirts, track pants, and custom knitwear with capabilities for printing, embroidery, and specialty finishes.
                </p>
              </div>
              <ul className="mt-8 space-y-3">
                {["Computerized Sewing Machines", "Automated Cutting Tables", "Flatlock & Overlock Finishing", "Screen & Digital Printing", "Embroidery Capabilities"].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-foreground">
                    <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <img 
                src={productionLine} 
                alt="Production Line" 
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-accent/20 rounded-2xl -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* Quality Control */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <img 
                src={qualityControl} 
                alt="Quality Control" 
                className="rounded-2xl shadow-2xl"
              />
            </div>
            <div className="order-1 lg:order-2">
              <p className="text-accent font-medium tracking-[0.3em] mb-4 text-sm uppercase">
                Quality Assurance
              </p>
              <h2 className="text-3xl md:text-4xl font-athletic font-bold mb-6">
                STRINGENT QUALITY CONTROL
              </h2>
              <div className="space-y-4 text-primary-foreground/80">
                <p>
                  Every garment undergoes multi-point inspection to meet international quality standards. Our QC team follows AQL 2.5 protocols for export shipments.
                </p>
              </div>
              <ul className="mt-8 space-y-3">
                {[
                  "Incoming fabric inspection",
                  "In-line production checks",
                  "Pre-final & final inspection",
                  "Measurement accuracy verification",
                  "Wash testing for colorfastness",
                  "Packing & labeling audit"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Fabric Options */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-accent font-medium tracking-[0.3em] mb-4 text-sm uppercase">
              Material Options
            </p>
            <h2 className="text-3xl md:text-4xl font-athletic font-bold text-foreground">
              PREMIUM FABRIC CHOICES
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
            {fabricOptions.map((fabric, index) => (
              <Card key={index} className="border-2 hover:border-accent/50 transition-colors overflow-hidden group">
                <div className="aspect-square overflow-hidden">
                  <img 
                    src={fabric.image} 
                    alt={fabric.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="text-base font-bold mb-1">{fabric.name}</h3>
                  <p className="text-accent font-medium text-xs mb-3">{fabric.gsm}</p>
                  <ul className="space-y-1">
                    {fabric.features.map((feature, idx) => (
                      <li key={idx} className="text-xs text-muted-foreground flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-accent" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Export Ready */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-accent font-medium tracking-[0.3em] mb-4 text-sm uppercase">
                Global Shipping
              </p>
              <h2 className="text-3xl md:text-4xl font-athletic font-bold text-foreground mb-6">
                EXPORT-READY PACKAGING
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  We handle complete export documentation and packaging requirements. From individual poly bags to master cartons, every shipment is prepared to international standards.
                </p>
              </div>
              <ul className="mt-8 space-y-3">
                {[
                  "Custom hang tags & labels",
                  "Individual poly bagging",
                  "Carton marking & barcoding",
                  "Export documentation",
                  "Freight forwarding coordination"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-foreground">
                    <Truck className="w-5 h-5 text-accent flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <img 
                src={exportLogistics} 
                alt="Export Logistics" 
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-primary via-primary/95 to-primary">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-athletic font-bold text-white mb-6">
            Ready to Start Production?
          </h2>
          <p className="text-white/80 max-w-2xl mx-auto mb-8">
            Connect with our team to discuss your requirements. We welcome factory visits and sample development requests.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Link to="/contact">
                Contact for Bulk Orders
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              <Link to="/products">
                View Product Categories
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Manufacturing;
