import { Helmet } from "react-helmet";
import { 
  Ship, 
  Building2, 
  ClipboardCheck, 
  Truck, 
  Globe, 
  FileText, 
  Shield, 
  Package, 
  Clock, 
  ArrowRightLeft, 
  Ban, 
  RefreshCw, 
  Mail, 
  Phone, 
  MapPin,
  CheckCircle2,
  Plane
} from "lucide-react";

const ShippingExportPolicy = () => {
  const sections = [
    {
      id: "business-scope",
      icon: Building2,
      title: "1. Business Scope",
      paragraphs: [
        "Feather Fashions is a garment manufacturer and supplier based in Tiruppur, Tamil Nadu, India, engaged in wholesale and export supply of garments.",
        "All shipments are processed strictly on a business-to-business (B2B) basis."
      ]
    },
    {
      id: "order-processing",
      icon: ClipboardCheck,
      title: "2. Order Processing",
      intro: "All orders are processed only after order confirmation, which includes agreement on:",
      content: [
        "Product specifications",
        "Quantities",
        "Pricing",
        "Delivery terms",
        "Payment terms"
      ],
      paragraphs: [
        "Production timelines vary depending on order volume, fabric availability, and customization requirements.",
        "Estimated timelines shared are indicative and not guaranteed unless explicitly stated in writing."
      ]
    },
    {
      id: "domestic-shipping",
      icon: Truck,
      title: "3. Domestic Shipping (India)",
      content: [
        "Domestic shipments are arranged through reputed logistics or transport providers.",
        "Delivery timelines may vary depending on destination, logistics partner, and external conditions.",
        "Risk of loss or damage during transit is governed by the terms agreed with the logistics provider unless otherwise specified."
      ]
    },
    {
      id: "export-shipping",
      icon: Globe,
      title: "4. Export Shipping (International Orders)",
      subsections: [
        {
          subtitle: "4.1 Shipping Terms",
          content: [
            "Export shipments are generally offered on FOB (Free on Board), CIF (Cost, Insurance & Freight), or other mutually agreed Incoterms.",
            "Shipping terms will be clearly mentioned in the proforma invoice or order confirmation."
          ]
        },
        {
          subtitle: "4.2 Logistics & Dispatch",
          intro: "Export shipments may be arranged by:",
          list: [
            "Buyer-nominated freight forwarders",
            "Logistics partners suggested by Feather Fashions (subject to agreement)"
          ],
          footer: "Dispatch dates are subject to production completion, payment clearance, and documentation readiness."
        }
      ]
    },
    {
      id: "documentation",
      icon: FileText,
      title: "5. Export Documentation",
      intro: "Feather Fashions provides standard export documentation as required, which may include:",
      content: [
        "Commercial Invoice",
        "Packing List",
        "Shipping Bill",
        "Certificate of Origin (if applicable)",
        "Other documents as mutually agreed"
      ],
      footer: "Buyers are responsible for ensuring that the products meet the import regulations and requirements of their destination country unless otherwise agreed."
    },
    {
      id: "customs",
      icon: Shield,
      title: "6. Customs & Import Compliance",
      intro: "Buyers are solely responsible for:",
      content: [
        "Import duties",
        "Taxes",
        "Customs clearance at destination",
        "Compliance with local import laws and regulations"
      ],
      footer: "Feather Fashions shall not be responsible for delays or losses caused due to customs inspections, regulatory changes, or non-compliance at the destination port."
    },
    {
      id: "packaging",
      icon: Package,
      title: "7. Packaging",
      paragraphs: [
        "Standard export-grade packing is provided unless specific packing instructions are agreed in advance.",
        "Special packaging, labeling, or private-label requirements may attract additional costs and must be confirmed prior to production."
      ]
    },
    {
      id: "timelines",
      icon: Clock,
      title: "8. Delivery Timelines",
      intro: "Delivery timelines shared are estimated and may be affected by:",
      content: [
        "Production schedules",
        "Logistics constraints",
        "Port congestion",
        "Weather conditions",
        "Force majeure events"
      ],
      footer: "Feather Fashions shall not be liable for delays caused by factors beyond reasonable control."
    },
    {
      id: "risk-transfer",
      icon: ArrowRightLeft,
      title: "9. Risk Transfer",
      paragraphs: [
        "Risk and responsibility for goods transfer as per the agreed shipping terms (Incoterms).",
        "Once goods are handed over to the carrier or loaded for export, Feather Fashions shall not be responsible for transit-related risks unless otherwise agreed."
      ]
    },
    {
      id: "restricted",
      icon: Ban,
      title: "10. Restricted & Sanctioned Destinations",
      paragraphs: [
        "Feather Fashions does not ship to countries or entities restricted under applicable Indian or international trade and sanctions regulations."
      ]
    },
    {
      id: "changes",
      icon: RefreshCw,
      title: "11. Changes to Policy",
      paragraphs: [
        "This policy may be updated or modified from time to time to reflect changes in business practices or regulatory requirements.",
        "Updates will be effective upon posting on the Website."
      ]
    }
  ];

  const verdictPoints = [
    "Export-standard",
    "Buyer-friendly",
    "Legally safe",
    "Bank compliant",
    "Trade-ready"
  ];

  const incoterms = [
    { code: "FOB", name: "Free on Board", desc: "Risk transfers when goods loaded on vessel" },
    { code: "CIF", name: "Cost, Insurance & Freight", desc: "Seller covers freight & insurance to destination" },
    { code: "EXW", name: "Ex Works", desc: "Buyer takes all risk from seller's premises" },
    { code: "DDP", name: "Delivered Duty Paid", desc: "Seller covers all costs to destination" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Shipping & Export Policy | Feather Fashions - Export Garment Manufacturer</title>
        <meta name="description" content="Shipping and Export Policy for Feather Fashions - Terms for international shipments, Incoterms, documentation, and delivery timelines for wholesale buyers." />
        <meta name="keywords" content="shipping policy, export policy, FOB, CIF, Incoterms, garment export, Tiruppur manufacturer, international shipping" />
      </Helmet>
      
      {/* Hero Section */}
      <section className="relative bg-foreground text-white py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
        <div className="absolute top-40 left-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-40 w-64 h-64 bg-accent/5 rounded-full blur-3xl" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 text-center">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 mb-8">
            <Ship className="w-4 h-4 text-primary" />
            <span className="text-sm text-white/80 tracking-wider uppercase">Export & Logistics</span>
          </div>
          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-light mb-6 tracking-tight">
            Shipping & Export Policy
          </h1>
          <p className="text-white/60 text-lg md:text-xl max-w-3xl mx-auto font-light leading-relaxed">
            Terms and conditions for shipment, delivery, and export of garments for wholesale and international buyers.
          </p>
        </div>
      </section>

      {/* Incoterms Quick Reference */}
      <section className="py-12 px-6 md:px-12 bg-muted/30 border-b border-border">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Plane className="w-5 h-5 text-primary" />
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Supported Incoterms</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {incoterms.map((term) => (
              <div key={term.code} className="bg-background border border-border rounded-xl p-4 hover:border-primary/30 transition-colors">
                <div className="text-xl font-bold text-foreground mb-1">{term.code}</div>
                <div className="text-sm font-medium text-primary mb-2">{term.name}</div>
                <div className="text-xs text-muted-foreground">{term.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Table of Contents - Quick Navigation */}
      <section className="py-12 px-6 md:px-12 bg-background border-b border-border">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-6">Quick Navigation</h2>
          <div className="flex flex-wrap gap-3">
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-muted/50 border border-border rounded-full text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all duration-300"
              >
                <section.icon className="w-3.5 h-3.5" />
                <span>{section.title.split('. ')[1]}</span>
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
                <Ship className="w-5 h-5 text-primary" />
              </div>
              <h2 className="font-serif text-xl text-foreground">Policy Overview</h2>
            </div>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                This Shipping & Export Policy outlines the terms and conditions related to the shipment, delivery, and export of garments supplied by Feather Fashions.
              </p>
              <p>
                This policy applies to all domestic wholesale and international export orders unless otherwise agreed in writing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Policy Sections */}
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

                  {/* Subsections */}
                  {'subsections' in section && section.subsections && (
                    <div className="space-y-6">
                      {section.subsections.map((sub, subIndex) => (
                        <div key={subIndex} className="bg-muted/30 rounded-xl p-6 border border-border/50">
                          <h3 className="font-medium text-foreground mb-3">{sub.subtitle}</h3>
                          {'intro' in sub && sub.intro && (
                            <p className="text-muted-foreground mb-3">{sub.intro}</p>
                          )}
                          {'content' in sub && sub.content && (
                            <ul className="space-y-2 mb-3">
                              {sub.content.map((item, itemIndex) => (
                                <li key={itemIndex} className="flex items-start gap-3 text-muted-foreground">
                                  <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                          {'list' in sub && sub.list && (
                            <ul className="space-y-2 mb-3">
                              {sub.list.map((item, itemIndex) => (
                                <li key={itemIndex} className="flex items-start gap-3 text-muted-foreground">
                                  <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                          {'footer' in sub && sub.footer && (
                            <p className="text-sm text-muted-foreground/80 mt-3 pt-3 border-t border-border/50">
                              {sub.footer}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
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
                  {'content' in section && Array.isArray(section.content) && !('subsections' in section) && (
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
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mt-4">
                      <p className="text-foreground font-medium text-sm">{section.footer}</p>
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
            <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-4">12. Contact Information</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              For shipping or export-related enquiries, please contact us.
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
              <Ship className="w-4 h-4 text-primary" />
              <span className="text-sm text-white/80 tracking-wider uppercase">Export Compliance</span>
            </div>
            <h2 className="font-serif text-3xl md:text-4xl mb-4">Trade-Ready Shipping Standards</h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              Our shipping policy meets international trade standards required by buyers, freight forwarders, and banking institutions.
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

export default ShippingExportPolicy;
