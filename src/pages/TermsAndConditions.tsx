import { Helmet } from "react-helmet";
import { 
  FileText, 
  Scale, 
  Building2, 
  Globe, 
  ShoppingBag, 
  CreditCard, 
  Truck, 
  Shield, 
  RotateCcw, 
  Copyright, 
  Link, 
  AlertTriangle, 
  Gavel, 
  RefreshCw, 
  Mail, 
  Phone, 
  MapPin,
  CheckCircle2,
  Package,
  FileCheck
} from "lucide-react";

const TermsAndConditions = () => {
  const sections = [
    {
      id: "business-nature",
      icon: Building2,
      title: "1. Business Nature",
      paragraphs: [
        "Feather Fashions is a garment manufacturer and wholesale/export supplier based in Tiruppur, Tamil Nadu, India.",
        "All products and services offered are intended strictly for business-to-business (B2B) purposes, including wholesale, distribution, and export."
      ],
      highlight: "We do not sell products directly to individual consumers through this Website."
    },
    {
      id: "website-usage",
      icon: Globe,
      title: "2. Website Usage",
      content: [
        "The Website is provided for informational and business inquiry purposes only.",
        "You agree not to misuse the Website, interfere with its operation, or attempt unauthorized access.",
        "Any content, images, text, or materials on this Website may not be copied, reproduced, or used for commercial purposes without written permission from Feather Fashions."
      ]
    },
    {
      id: "product-info",
      icon: Package,
      title: "3. Product Information & Availability",
      content: [
        "Product images, descriptions, specifications, and pricing shown on the Website are indicative only.",
        "Actual product availability, colors, fabrics, and specifications may vary based on production schedules and order quantities.",
        "All orders are subject to confirmation and acceptance by Feather Fashions.",
        "We reserve the right to modify or discontinue any product without prior notice."
      ]
    },
    {
      id: "enquiries",
      icon: ShoppingBag,
      title: "4. Wholesale & Export Enquiries",
      paragraphs: [
        "Submission of an enquiry, request for brochure, or access request does not constitute a binding contract.",
        "All wholesale and export transactions are finalized only after mutual agreement on pricing, quantities, specifications, delivery timelines, and payment terms."
      ]
    },
    {
      id: "pricing",
      icon: CreditCard,
      title: "5. Pricing & Payment Terms",
      content: [
        "Prices are quoted based on wholesale or export terms and may vary depending on quantity, fabric, customization, and destination.",
        "Export pricing may be offered on FOB, CIF, or other agreed Incoterms.",
        "Payment terms (advance, TT, LC, etc.) will be agreed upon separately for each order.",
        "Feather Fashions reserves the right to revise pricing prior to order confirmation."
      ]
    },
    {
      id: "shipping",
      icon: Truck,
      title: "6. Shipping & Delivery",
      content: [
        "Delivery timelines provided are estimated and may vary due to production capacity, logistics, customs clearance, or force majeure events.",
        "For export orders, buyers are responsible for compliance with import regulations of their destination country unless otherwise agreed.",
        "Risk of loss or damage transfers as per agreed shipping terms."
      ]
    },
    {
      id: "quality",
      icon: Shield,
      title: "7. Quality & Claims",
      paragraphs: [
        "Feather Fashions maintains reasonable quality control standards for all manufactured garments.",
        "Any quality-related claims must be reported in writing within a reasonable period after receipt of goods.",
        "Claims will be reviewed based on mutually agreed specifications and terms."
      ]
    },
    {
      id: "returns",
      icon: RotateCcw,
      title: "8. Returns, Cancellations & Refunds",
      content: [
        "Returns, replacements, or refunds are subject to prior agreement and order-specific terms.",
        "Custom or bulk production orders may not be eligible for cancellation once production has commenced.",
        "Any adjustments will be handled on a case-by-case basis."
      ]
    },
    {
      id: "ip",
      icon: Copyright,
      title: "9. Intellectual Property",
      paragraphs: [
        "All content on this Website, including logos, designs, images, text, and branding, is the intellectual property of Feather Fashions unless otherwise stated.",
        "Unauthorized use, reproduction, or distribution is strictly prohibited."
      ]
    },
    {
      id: "third-party",
      icon: Link,
      title: "10. Third-Party Links",
      paragraphs: [
        "The Website may contain links to third-party websites for informational purposes. Feather Fashions is not responsible for the content, accuracy, or practices of such external websites."
      ]
    },
    {
      id: "liability",
      icon: AlertTriangle,
      title: "11. Limitation of Liability",
      content: [
        "Any indirect, incidental, or consequential damages",
        "Loss of business, profits, or data",
        "Delays caused by factors beyond our reasonable control"
      ],
      footer: "Our total liability, if any, shall not exceed the value of the relevant transaction."
    },
    {
      id: "compliance",
      icon: FileCheck,
      title: "12. Compliance with Laws",
      paragraphs: [
        "All business transactions are subject to applicable laws and regulations of India.",
        "Export transactions must comply with applicable international trade laws and sanctions regulations."
      ]
    },
    {
      id: "jurisdiction",
      icon: Gavel,
      title: "13. Governing Law & Jurisdiction",
      paragraphs: [
        "These Terms shall be governed by and construed in accordance with the laws of India.",
        "Any disputes shall be subject to the exclusive jurisdiction of courts located in Tiruppur, Tamil Nadu."
      ]
    },
    {
      id: "changes",
      icon: RefreshCw,
      title: "14. Changes to Terms",
      paragraphs: [
        "Feather Fashions reserves the right to modify or update these Terms at any time.",
        "Changes will be effective immediately upon posting on the Website. Continued use of the Website constitutes acceptance of the revised Terms."
      ]
    }
  ];

  const verdictPoints = [
    "Professional",
    "Export-friendly",
    "Bank & buyer safe",
    "No risky promises",
    "Wholesale + export ready"
  ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Terms & Conditions | Feather Fashions - Export Garment Manufacturer</title>
        <meta name="description" content="Terms and Conditions for Feather Fashions - Wholesale and export garment manufacturer from Tiruppur, India. B2B terms for international buyers." />
        <meta name="keywords" content="terms and conditions, export terms, wholesale terms, B2B garment manufacturer, Tiruppur manufacturer" />
      </Helmet>
      
      {/* Hero Section */}
      <section className="relative bg-foreground text-white py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
        <div className="absolute top-20 left-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 text-center">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 mb-8">
            <Scale className="w-4 h-4 text-primary" />
            <span className="text-sm text-white/80 tracking-wider uppercase">Legal & Compliance</span>
          </div>
          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-light mb-6 tracking-tight">
            Terms & Conditions
          </h1>
          <p className="text-white/60 text-lg md:text-xl max-w-3xl mx-auto font-light leading-relaxed">
            These Terms govern the use of our website and all business interactions with Feather Fashions for wholesale and export purposes.
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
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <h2 className="font-serif text-xl text-foreground">Agreement to Terms</h2>
            </div>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                By accessing the website <span className="text-foreground font-medium">www.featherfashions.in</span> or engaging with us for wholesale or export business, you agree to be bound by these Terms.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Terms Sections */}
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

                  {/* Highlight box */}
                  {'highlight' in section && section.highlight && (
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mt-4">
                      <p className="text-foreground font-medium">{section.highlight}</p>
                    </div>
                  )}

                  {/* Footer note */}
                  {'footer' in section && section.footer && (
                    <p className="text-sm font-medium text-foreground mt-6 pt-4 border-t border-border/50 bg-muted/30 rounded-lg p-4">
                      {section.footer}
                    </p>
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
            <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-4">15. Contact Information</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              For any questions regarding these Terms & Conditions, please contact us.
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
              <span className="text-sm text-white/80 tracking-wider uppercase">Legal Foundation</span>
            </div>
            <h2 className="font-serif text-3xl md:text-4xl mb-4">Export-Ready Legal Terms</h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              Our terms and conditions meet international standards required for wholesale and export business operations.
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

export default TermsAndConditions;
