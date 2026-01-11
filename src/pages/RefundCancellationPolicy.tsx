import { Helmet } from "react-helmet";
import { 
  RotateCcw, 
  ClipboardCheck, 
  XCircle, 
  Wallet, 
  Shield, 
  Ban, 
  RefreshCw, 
  Mail, 
  Phone, 
  MapPin,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

const RefundCancellationPolicy = () => {
  const sections = [
    {
      id: "order-confirmation",
      icon: ClipboardCheck,
      title: "1. Order Confirmation",
      paragraphs: [
        "Orders are confirmed only after mutual agreement on product specifications, quantities, pricing, delivery timelines, and payment terms.",
        "Once an order is confirmed, production may commence based on the agreed terms."
      ]
    },
    {
      id: "cancellations",
      icon: XCircle,
      title: "2. Cancellations",
      content: [
        "Order cancellation requests must be made in writing.",
        "Cancellations may be accepted only before production has commenced, subject to approval by Feather Fashions.",
        "Once production has started, cancellations may not be permitted, especially for bulk or customized orders."
      ]
    },
    {
      id: "refunds",
      icon: Wallet,
      title: "3. Refunds",
      content: [
        "Refunds, if applicable, are processed only after mutual agreement and subject to the terms agreed for the specific order.",
        "Advance payments made against confirmed orders are generally non-refundable once production has begun.",
        "Any approved refunds will be processed using the original payment method or as otherwise agreed."
      ]
    },
    {
      id: "quality",
      icon: Shield,
      title: "4. Quality-Related Concerns",
      content: [
        "Any quality-related concerns must be reported in writing within a reasonable time after receipt of goods.",
        "Claims will be reviewed based on mutually agreed specifications and order terms.",
        "Approved adjustments, if any, may be handled through replacement, credit, or refund, as deemed appropriate."
      ]
    },
    {
      id: "no-consumer",
      icon: Ban,
      title: "5. No Consumer Returns",
      paragraphs: [
        "Feather Fashions does not accept returns or cancellations under consumer protection laws, as all sales are conducted strictly for wholesale and export purposes."
      ],
      isHighlight: true
    },
    {
      id: "updates",
      icon: RefreshCw,
      title: "6. Policy Updates",
      paragraphs: [
        "Feather Fashions reserves the right to modify this Refund & Cancellation Policy at any time.",
        "Updates will be effective upon posting on the Website."
      ]
    }
  ];

  const verdictPoints = [
    "Short & professional",
    "Export-safe wording",
    "No risky promises",
    "Clear B2B positioning",
    "Complete policy set"
  ];

  const keyPoints = [
    { label: "Business Model", value: "B2B Only" },
    { label: "Cancellation Window", value: "Before Production" },
    { label: "Refund Processing", value: "Case by Case" },
    { label: "Quality Claims", value: "Written Notice Required" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Refund & Cancellation Policy | Feather Fashions - Export Garment Manufacturer</title>
        <meta name="description" content="Refund and Cancellation Policy for Feather Fashions - Terms for B2B wholesale and export orders, cancellation procedures, and refund conditions." />
        <meta name="keywords" content="refund policy, cancellation policy, B2B refund, export orders, wholesale terms, Tiruppur manufacturer" />
      </Helmet>
      
      {/* Hero Section */}
      <section className="relative bg-foreground text-white py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
        <div className="absolute top-20 right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 text-center">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 mb-8">
            <RotateCcw className="w-4 h-4 text-primary" />
            <span className="text-sm text-white/80 tracking-wider uppercase">Policy & Terms</span>
          </div>
          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-light mb-6 tracking-tight">
            Refund & Cancellation Policy
          </h1>
          <p className="text-white/60 text-lg md:text-xl max-w-3xl mx-auto font-light leading-relaxed">
            Clear and transparent terms for order cancellations and refunds for wholesale and export buyers.
          </p>
        </div>
      </section>

      {/* Key Points Summary */}
      <section className="py-12 px-6 md:px-12 bg-muted/30 border-b border-border">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <AlertCircle className="w-5 h-5 text-primary" />
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Key Points</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {keyPoints.map((point, index) => (
              <div key={index} className="bg-background border border-border rounded-xl p-4 text-center">
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">{point.label}</div>
                <div className="text-lg font-semibold text-foreground">{point.value}</div>
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
                <RotateCcw className="w-5 h-5 text-primary" />
              </div>
              <h2 className="font-serif text-xl text-foreground">Policy Overview</h2>
            </div>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                This Refund & Cancellation Policy applies to all wholesale and export orders placed with Feather Fashions.
              </p>
              <p className="font-medium text-foreground">
                All transactions are conducted strictly on a business-to-business (B2B) basis.
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
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-500 shadow-lg ${
                  'isHighlight' in section && section.isHighlight 
                    ? 'bg-destructive group-hover:bg-destructive/80' 
                    : 'bg-foreground group-hover:bg-primary'
                }`}>
                  <section.icon className="w-6 h-6 text-background" />
                </div>
                <div className="flex-1">
                  <h2 className="font-serif text-2xl md:text-3xl text-foreground mb-6">{section.title}</h2>
                  
                  {/* Paragraphs */}
                  {'paragraphs' in section && section.paragraphs && (
                    <div className={`space-y-4 ${'isHighlight' in section && section.isHighlight ? 'bg-destructive/5 border border-destructive/20 rounded-lg p-4' : ''}`}>
                      {section.paragraphs.map((para, paraIndex) => (
                        <p key={paraIndex} className={`leading-relaxed ${'isHighlight' in section && section.isHighlight ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                          {para}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Content list */}
                  {'content' in section && Array.isArray(section.content) && (
                    <ul className="space-y-3">
                      {section.content.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start gap-3 text-muted-foreground">
                          <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
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
            <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-4">7. Contact Information</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              For refund or cancellation-related queries, please contact us.
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
              <RotateCcw className="w-4 h-4 text-primary" />
              <span className="text-sm text-white/80 tracking-wider uppercase">Policy Standards</span>
            </div>
            <h2 className="font-serif text-3xl md:text-4xl mb-4">Professional B2B Standards</h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              Our refund and cancellation policy is designed for professional wholesale and export transactions.
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

export default RefundCancellationPolicy;
