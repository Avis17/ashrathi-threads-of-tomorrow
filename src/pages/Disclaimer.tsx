import { Helmet } from "react-helmet";
import { 
  AlertTriangle, 
  FileX, 
  Image, 
  Info, 
  Globe, 
  ShieldX, 
  Link, 
  RefreshCw, 
  Mail, 
  Phone, 
  MapPin,
  CheckCircle2,
  Scale
} from "lucide-react";

const Disclaimer = () => {
  const sections = [
    {
      id: "no-offer",
      icon: FileX,
      title: "No Offer or Contract",
      paragraphs: [
        "The information provided on this Website does not constitute an offer, solicitation, or binding agreement of any kind.",
        "All wholesale and export transactions are subject to separate discussions, confirmations, and written agreements regarding pricing, quantities, specifications, delivery terms, and payment conditions."
      ]
    },
    {
      id: "product-representation",
      icon: Image,
      title: "Product Representation",
      paragraphs: [
        "Product images, descriptions, colors, and specifications shown on this Website are for illustrative purposes only. Actual products may vary due to fabric availability, production processes, dye lots, and customization requirements.",
        "Feather Fashions does not guarantee that the displayed products will be exactly identical to the final delivered goods unless otherwise agreed in writing."
      ]
    },
    {
      id: "accuracy",
      icon: Info,
      title: "Accuracy of Information",
      paragraphs: [
        "While we make reasonable efforts to ensure that the information on this Website is accurate and up to date, Feather Fashions makes no warranties or representations, express or implied, regarding the completeness, accuracy, reliability, or suitability of the information provided.",
        "We reserve the right to modify, update, or remove content at any time without prior notice."
      ]
    },
    {
      id: "export-compliance",
      icon: Globe,
      title: "Export & Regulatory Compliance",
      paragraphs: [
        "Information related to export, shipping, documentation, or compliance is provided for general guidance only. Buyers are responsible for ensuring compliance with import regulations, customs laws, and requirements of their respective countries unless otherwise agreed.",
        "Feather Fashions shall not be held responsible for delays, losses, or issues arising from regulatory changes, customs clearance, or force majeure events."
      ]
    },
    {
      id: "liability",
      icon: ShieldX,
      title: "Limitation of Liability",
      intro: "Under no circumstances shall Feather Fashions be liable for any direct, indirect, incidental, consequential, or special damages arising from:",
      content: [
        "Use or inability to use this Website",
        "Reliance on information provided on this Website",
        "Delays or interruptions in Website access"
      ],
      footer: "Use of this Website is at your own risk."
    },
    {
      id: "third-party",
      icon: Link,
      title: "Third-Party Links",
      paragraphs: [
        "This Website may contain links to third-party websites for convenience or informational purposes. Feather Fashions does not endorse, control, or take responsibility for the content, privacy practices, or accuracy of any third-party websites."
      ]
    },
    {
      id: "changes",
      icon: RefreshCw,
      title: "Changes to Disclaimer",
      paragraphs: [
        "Feather Fashions reserves the right to update or modify this Disclaimer at any time without prior notice.",
        "Continued use of the Website constitutes acceptance of the updated Disclaimer."
      ]
    }
  ];

  const verdictPoints = [
    "Export-standard",
    "Professionally worded",
    "Safe for international buyers",
    "No legal over-commitment",
    "Premium B2B positioning"
  ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Disclaimer | Feather Fashions - Export Garment Manufacturer</title>
        <meta name="description" content="Disclaimer for Feather Fashions website - Important legal information for wholesale and export buyers regarding product representation and liability." />
        <meta name="keywords" content="disclaimer, export disclaimer, garment manufacturer disclaimer, B2B legal notice, Tiruppur manufacturer" />
      </Helmet>
      
      {/* Hero Section */}
      <section className="relative bg-foreground text-white py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 text-center">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 mb-8">
            <AlertTriangle className="w-4 h-4 text-primary" />
            <span className="text-sm text-white/80 tracking-wider uppercase">Legal Notice</span>
          </div>
          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-light mb-6 tracking-tight">
            Disclaimer
          </h1>
          <p className="text-white/60 text-lg md:text-xl max-w-3xl mx-auto font-light leading-relaxed">
            Important legal information regarding the use of this website and business interactions with Feather Fashions.
          </p>
        </div>
      </section>

      {/* Table of Contents - Quick Navigation */}
      <section className="py-12 px-6 md:px-12 bg-muted/30 border-b border-border">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-6">Quick Navigation</h2>
          <div className="flex flex-wrap gap-3">
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-full text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all duration-300"
              >
                <section.icon className="w-3.5 h-3.5" />
                <span>{section.title}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-16 md:py-20 px-6 md:px-12 bg-background">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-muted/50 to-muted/20 rounded-2xl p-8 md:p-12 border border-border">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Info className="w-5 h-5 text-primary" />
              </div>
              <h2 className="font-serif text-xl text-foreground">General Information</h2>
            </div>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                The information contained on this website <span className="text-foreground font-medium">www.featherfashions.in</span> is provided by Feather Fashions for general informational and business purposes only.
              </p>
              <p>
                All content, including but not limited to text, images, graphics, product descriptions, designs, logos, and other materials displayed on this Website, are the intellectual property of Feather Fashions, unless otherwise stated. Unauthorized use, reproduction, or distribution of any content without prior written consent is strictly prohibited.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimer Sections */}
      <section className="py-8 md:py-12 px-6 md:px-12 bg-background">
        <div className="max-w-4xl mx-auto space-y-16">
          {sections.map((section) => (
            <div 
              key={section.id} 
              id={section.id}
              className="scroll-mt-24 group"
            >
              <div className="flex items-start gap-6">
                <div className="w-14 h-14 bg-foreground rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-primary transition-colors duration-500 shadow-lg">
                  <section.icon className="w-6 h-6 text-background" />
                </div>
                <div className="flex-1">
                  <h2 className="font-serif text-2xl md:text-3xl text-foreground mb-6">{section.title}</h2>
                  
                  {/* Intro text */}
                  {'intro' in section && section.intro && (
                    <p className="text-muted-foreground leading-relaxed mb-4">{section.intro}</p>
                  )}

                  {/* Paragraphs */}
                  {'paragraphs' in section && section.paragraphs && (
                    <div className="space-y-4 mb-4">
                      {section.paragraphs.map((para, paraIndex) => (
                        <p key={paraIndex} className="text-muted-foreground leading-relaxed">
                          {para}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Content list */}
                  {'content' in section && Array.isArray(section.content) && (
                    <ul className="space-y-3 mb-4">
                      {section.content.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start gap-3 text-muted-foreground">
                          <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Footer note */}
                  {'footer' in section && section.footer && (
                    <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4 mt-4">
                      <p className="text-foreground font-medium">{section.footer}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 md:py-20 px-6 md:px-12 bg-muted/30 border-t border-border">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-4">Contact Information</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              For any questions regarding this Disclaimer, please contact us.
            </p>
          </div>
          
          <div className="bg-background rounded-2xl p-8 md:p-10 border border-border shadow-sm">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-foreground rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-background" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground mb-1">Address</h3>
                  <p className="text-muted-foreground text-sm">
                    Feather Fashions<br />
                    Tiruppur, Tamil Nadu<br />
                    India - 641604
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-foreground rounded-xl flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-background" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground mb-1">Email</h3>
                  <a 
                    href="mailto:info@featherfashions.in" 
                    className="text-primary hover:underline text-sm"
                  >
                    info@featherfashions.in
                  </a>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-foreground rounded-xl flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-background" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground mb-1">Phone</h3>
                  <a 
                    href="tel:+919876543210" 
                    className="text-primary hover:underline text-sm"
                  >
                    +91-98765 43210
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Export Compliance Verdict */}
      <section className="py-16 md:py-20 px-6 md:px-12 bg-gradient-to-br from-foreground to-foreground/95 text-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 mb-6">
              <Scale className="w-4 h-4 text-primary" />
              <span className="text-sm text-white/80 tracking-wider uppercase">Legal Standards</span>
            </div>
            <h2 className="font-serif text-3xl md:text-4xl mb-4">Export-Ready Legal Documentation</h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              Our disclaimer meets international standards required for professional B2B and export business operations.
            </p>
          </div>
          
          <div className="grid md:grid-cols-5 gap-4">
            {verdictPoints.map((point, index) => (
              <div 
                key={index}
                className="bg-white/5 border border-white/10 rounded-xl p-5 text-center hover:bg-white/10 transition-colors duration-300"
              >
                <CheckCircle2 className="w-6 h-6 text-primary mx-auto mb-3" />
                <p className="text-white/80 text-sm leading-relaxed">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Last Updated Footer */}
      <section className="py-12 px-6 md:px-12 bg-muted/50 border-t border-border">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-muted-foreground">
            <span className="font-medium text-foreground">Last Updated:</span> January 11, 2026
          </p>
        </div>
      </section>
    </div>
  );
};

export default Disclaimer;
