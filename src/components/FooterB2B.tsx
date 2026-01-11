import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, MessageCircle, Download } from "lucide-react";

const FooterB2B = () => {
  const handleWhatsApp = () => {
    window.open("https://wa.me/919789225510?text=Hello, I'm interested in bulk orders from Feather Fashions.", "_blank");
  };

  return (
    <footer className="bg-primary text-primary-foreground">
      {/* Main Footer */}
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand & Description */}
          <div className="lg:col-span-1">
            <h2 className="text-xl font-athletic font-bold tracking-[0.2em] mb-4">FEATHER FASHIONS</h2>
            <p className="text-sm text-primary-foreground/70 leading-relaxed mb-6">
              Export-oriented apparel manufacturer from Tiruppur, India. 
              Premium activewear and sportswear for global brands.
            </p>
            <button
              onClick={handleWhatsApp}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp Us
            </button>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold tracking-[0.2em] text-primary-foreground/50 mb-6 uppercase">
              Quick Links
            </h4>
            <ul className="space-y-3">
              <li>
                <Link to="/products" className="text-sm text-primary-foreground/80 hover:text-accent transition-colors">
                  Product Categories
                </Link>
              </li>
              <li>
                <Link to="/manufacturing" className="text-sm text-primary-foreground/80 hover:text-accent transition-colors">
                  Manufacturing
                </Link>
              </li>
              <li>
                <Link to="/compliance" className="text-sm text-primary-foreground/80 hover:text-accent transition-colors">
                  Compliance & Certifications
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm text-primary-foreground/80 hover:text-accent transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-primary-foreground/80 hover:text-accent transition-colors">
                  Contact / Enquiry
                </Link>
              </li>
              <li>
                <Link to="/export-brochure" className="text-sm text-primary-foreground/80 hover:text-accent transition-colors flex items-center gap-2">
                  <Download className="h-3 w-3" />
                  Export Brochure
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-xs font-semibold tracking-[0.2em] text-primary-foreground/50 mb-6 uppercase">
              Contact
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-primary-foreground/80">
                <Mail className="h-4 w-4 mt-1 text-accent flex-shrink-0" />
                <a href="mailto:hello@featherfashions.in" className="hover:text-accent transition-colors">
                  hello@featherfashions.in
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm text-primary-foreground/80">
                <Phone className="h-4 w-4 mt-1 text-accent flex-shrink-0" />
                <span>+91 9789225510</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-primary-foreground/80">
                <MapPin className="h-4 w-4 mt-1 text-accent flex-shrink-0" />
                <span>
                  251/1, Vadivel Nagar,<br />
                  Thottipalayam, Pooluvapatti,<br />
                  Tiruppur, Tamil Nadu 641602<br />
                  India
                </span>
              </li>
            </ul>
          </div>

          {/* Export Markets */}
          <div>
            <h4 className="text-xs font-semibold tracking-[0.2em] text-primary-foreground/50 mb-6 uppercase">
              Export Markets
            </h4>
            <ul className="space-y-3">
              <li>
                <Link to="/export-garments-to-uae" className="text-sm text-primary-foreground/80 hover:text-accent transition-colors">
                  Export to UAE
                </Link>
              </li>
              <li>
                <Link to="/export-garments-to-saudi-arabia" className="text-sm text-primary-foreground/80 hover:text-accent transition-colors">
                  Export to Saudi Arabia
                </Link>
              </li>
              <li>
                <Link to="/export-garments-to-south-africa" className="text-sm text-primary-foreground/80 hover:text-accent transition-colors">
                  Export to South Africa
                </Link>
              </li>
            </ul>
            
            <h4 className="text-xs font-semibold tracking-[0.2em] text-primary-foreground/50 mt-6 mb-4 uppercase">
              Registrations
            </h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li>
                <span className="text-primary-foreground/50">GSTIN:</span>{" "}
                <span className="font-mono text-xs">33FWTPS1281P1ZJ</span>
              </li>
              <li>
                <span className="text-primary-foreground/50">IEC:</span>{" "}
                <span className="font-mono text-xs">FWTPS1281P</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-primary-foreground/10">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-primary-foreground/50 text-center md:text-left">
              © {new Date().getFullYear()} Feather Fashions. All rights reserved. | Export-oriented apparel manufacturer from India
            </p>
            <div className="flex items-center gap-6">
              <Link to="/terms-and-conditions" className="text-xs text-primary-foreground/50 hover:text-accent transition-colors">
                Terms
              </Link>
              <span className="text-primary-foreground/20">|</span>
              <Link to="/privacy-policy" className="text-xs text-primary-foreground/50 hover:text-accent transition-colors">
                Privacy
              </Link>
              <span className="text-primary-foreground/20">|</span>
              <Link to="/disclaimer" className="text-xs text-primary-foreground/50 hover:text-accent transition-colors">
                Disclaimer
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterB2B;
