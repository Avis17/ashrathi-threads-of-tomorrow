import { Helmet } from "react-helmet";
import { 
  Shield, 
  Eye, 
  Share2, 
  Lock, 
  Trash2, 
  UserCheck, 
  Globe, 
  Cookie, 
  Link, 
  Baby, 
  FileText, 
  Mail, 
  Phone, 
  MapPin,
  CheckCircle2
} from "lucide-react";

const PrivacyPolicy = () => {
  const sections = [
    {
      id: "information-collected",
      icon: Eye,
      title: "1. Information We Collect",
      subsections: [
        {
          subtitle: "1.1 Personal & Business Information",
          content: "We may collect personal and business information that you voluntarily provide, including but not limited to:",
          list: [
            "Name",
            "Company name",
            "Email address",
            "Phone number",
            "Business address",
            "Country",
            "Product inquiry details",
            "Wholesale or export requirements"
          ],
          footer: "This information is collected when you submit inquiry or contact forms, request wholesale or export access, download brochures or catalogs, or communicate with us via email or phone."
        },
        {
          subtitle: "1.2 Technical & Usage Information",
          content: "When you visit our Website, we may automatically collect:",
          list: [
            "IP address",
            "Browser type",
            "Device information",
            "Operating system",
            "Pages visited",
            "Date and time of visits"
          ],
          footer: "This data is collected to analyze website performance and improve user experience."
        },
        {
          subtitle: "1.3 Cookies & Tracking Technologies",
          content: "We use cookies and similar technologies to improve website functionality, analyze traffic and usage patterns, and remember user preferences. You may disable cookies through your browser settings. However, doing so may affect certain features of the Website."
        }
      ]
    },
    {
      id: "information-usage",
      icon: Shield,
      title: "2. How We Use Your Information",
      content: [
        "To respond to inquiries and provide requested information",
        "To process wholesale or export-related requests",
        "To improve our products, services, and website performance",
        "To communicate important updates, offers, or business information",
        "To maintain internal records and analytics",
        "To comply with legal and regulatory requirements"
      ],
      footer: "We do not sell, rent, trade, or lease your personal or business information to third parties."
    },
    {
      id: "disclosure",
      icon: Share2,
      title: "3. Disclosure of Information",
      content: [
        "To comply with applicable laws, regulations, or legal processes",
        "To protect our legal rights, property, or safety",
        "To prevent fraud or unauthorized activities",
        "To trusted service providers who assist us in operating the Website (under strict confidentiality obligations)"
      ],
      footer: "We never disclose personally identifiable information for marketing by third parties."
    },
    {
      id: "international",
      icon: Globe,
      title: "4. International Users & Export Compliance",
      paragraphs: [
        "Feather Fashions operates from India and serves domestic and international wholesale and export buyers.",
        "By using this Website, you consent to the processing and storage of your information in India in accordance with applicable Indian laws and regulations.",
        "We do not conduct business with countries or individuals restricted under applicable international trade or sanctions laws."
      ]
    },
    {
      id: "security",
      icon: Lock,
      title: "5. Data Security",
      content: [
        "Unauthorized access",
        "Disclosure",
        "Alteration",
        "Destruction"
      ],
      paragraphs: [
        "We implement reasonable administrative, technical, and physical safeguards to protect your information from the above threats.",
        "However, no method of transmission over the internet or electronic storage is completely secure. While we strive to protect your data, we cannot guarantee absolute security."
      ]
    },
    {
      id: "third-party",
      icon: Link,
      title: "6. Third-Party Links",
      paragraphs: [
        "Our Website may contain links to third-party websites. We are not responsible for the privacy practices, content, or security of those external sites.",
        "We encourage you to review their privacy policies before providing any information."
      ]
    },
    {
      id: "children",
      icon: Baby,
      title: "7. Children's Privacy",
      paragraphs: [
        "Our Website is intended for business and wholesale purposes only. We do not knowingly collect personal information from individuals under the age of 18.",
        "If you believe that a minor has provided personal information to us, please contact us immediately so we can take appropriate action."
      ]
    },
    {
      id: "rights",
      icon: UserCheck,
      title: "8. Your Rights & Choices",
      content: [
        "Request access to your personal information",
        "Request correction or deletion of your information",
        "Withdraw consent for future communications"
      ],
      footer: "To exercise these rights, please contact us using the details provided below."
    },
    {
      id: "changes",
      icon: FileText,
      title: "9. Changes to This Privacy Policy",
      paragraphs: [
        "We reserve the right to update or modify this Privacy Policy at any time to reflect changes in legal requirements or business practices.",
        "Any changes will be posted on this page with an updated revision date. Continued use of the Website constitutes acceptance of the revised policy."
      ]
    }
  ];

  const verdictPoints = [
    "Export-safe for international buyers",
    "Suitable for wholesale & B2B partners",
    "Professional for banks & auditors",
    "Compliant with trade regulations",
    "Premium B2B positioning"
  ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Privacy Policy | Feather Fashions - Export Garment Manufacturer</title>
        <meta name="description" content="Privacy Policy for Feather Fashions - Learn how we protect the privacy of our international wholesale and export buyers. Committed to data security and compliance." />
        <meta name="keywords" content="privacy policy, data protection, export manufacturer privacy, B2B privacy, garment manufacturer india" />
      </Helmet>
      
      {/* Hero Section */}
      <section className="relative bg-foreground text-white py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
        <div className="absolute top-20 right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 text-center">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 mb-8">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-sm text-white/80 tracking-wider uppercase">Legal & Compliance</span>
          </div>
          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-light mb-6 tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-white/60 text-lg md:text-xl max-w-3xl mx-auto font-light leading-relaxed">
            Feather Fashions is committed to protecting the privacy and confidentiality of visitors, customers, and business partners who access our website.
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
                <Globe className="w-5 h-5 text-primary" />
              </div>
              <h2 className="font-serif text-xl text-foreground">About This Policy</h2>
            </div>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our Website <span className="text-foreground font-medium">www.featherfashions.in</span> or interact with us for wholesale and export-related purposes.
              </p>
              <p>
                By accessing or using this Website, you agree to the terms of this Privacy Policy.
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
                  
                  {/* Subsections (for section 1) */}
                  {'subsections' in section && section.subsections && (
                    <div className="space-y-8">
                      {section.subsections.map((sub, subIndex) => (
                        <div key={subIndex} className="bg-muted/30 rounded-xl p-6 border border-border/50">
                          <h3 className="font-medium text-foreground mb-3">{sub.subtitle}</h3>
                          <p className="text-muted-foreground mb-4">{sub.content}</p>
                          {'list' in sub && sub.list && (
                            <ul className="grid grid-cols-2 gap-2 mb-4">
                              {sub.list.map((item, itemIndex) => (
                                <li key={itemIndex} className="flex items-center gap-2 text-muted-foreground">
                                  <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          )}
                          {'footer' in sub && sub.footer && (
                            <p className="text-sm text-muted-foreground/80 mt-4 pt-4 border-t border-border/50">
                              {sub.footer}
                            </p>
                          )}
                        </div>
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

                  {/* Paragraphs */}
                  {'paragraphs' in section && section.paragraphs && (
                    <div className="space-y-4">
                      {section.paragraphs.map((para, paraIndex) => (
                        <p key={paraIndex} className="text-muted-foreground leading-relaxed">
                          {para}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Footer note */}
                  {'footer' in section && section.footer && (
                    <p className="text-sm font-medium text-foreground mt-6 pt-4 border-t border-border/50 bg-primary/5 rounded-lg p-4">
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
            <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-4">10. Contact Information</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              If you have any questions or concerns regarding this Privacy Policy or how we handle your information, please contact us.
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
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-sm text-white/80 tracking-wider uppercase">Export Compliance</span>
            </div>
            <h2 className="font-serif text-3xl md:text-4xl mb-4">Export-Ready Privacy Standards</h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              Our privacy policy meets international standards required by export buyers, banks, and regulatory authorities.
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

export default PrivacyPolicy;
