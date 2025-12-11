import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Instagram } from "lucide-react";
import NewsletterSignup from "./NewsletterSignup";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      {/* Newsletter Section */}
      <div className="border-b border-primary-foreground/10">
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-xl mx-auto text-center">
            <h3 className="text-2xl font-light tracking-wide mb-2">JOIN THE MOVEMENT</h3>
            <p className="text-primary-foreground/60 text-sm mb-6">
              Be the first to know about new arrivals, exclusive offers, and insider-only discounts.
            </p>
            <NewsletterSignup />
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <h2 className="text-xl font-semibold tracking-[0.3em] mb-6">FEATHER</h2>
            <p className="text-sm text-primary-foreground/60 leading-relaxed mb-6">
              Premium activewear crafted for those who demand both performance and elegance.
            </p>
            <div className="flex gap-4">
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 border border-primary-foreground/20 flex items-center justify-center hover:border-accent hover:text-accent transition-colors"
              >
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-xs font-semibold tracking-[0.2em] text-primary-foreground/40 mb-6">SHOP</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/women" className="text-sm text-primary-foreground/80 hover:text-accent transition-colors">
                  Women's Collection
                </Link>
              </li>
              <li>
                <Link to="/men" className="text-sm text-primary-foreground/80 hover:text-accent transition-colors">
                  Men's Collection
                </Link>
              </li>
              <li>
                <Link to="/collections" className="text-sm text-primary-foreground/80 hover:text-accent transition-colors">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link to="/collections" className="text-sm text-primary-foreground/80 hover:text-accent transition-colors">
                  Best Sellers
                </Link>
              </li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="text-xs font-semibold tracking-[0.2em] text-primary-foreground/40 mb-6">HELP</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/contact" className="text-sm text-primary-foreground/80 hover:text-accent transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/shipping-return-refund" className="text-sm text-primary-foreground/80 hover:text-accent transition-colors">
                  Shipping & Returns
                </Link>
              </li>
              <li>
                <Link to="/size-chart/womens-leggings" className="text-sm text-primary-foreground/80 hover:text-accent transition-colors">
                  Size Guide
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm text-primary-foreground/80 hover:text-accent transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-semibold tracking-[0.2em] text-primary-foreground/40 mb-6">CONTACT</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-primary-foreground/80">
                <Mail className="h-4 w-4 mt-0.5 text-accent" />
                <a href="mailto:hello@featherfashions.in" className="hover:text-accent transition-colors">
                  hello@featherfashions.in
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm text-primary-foreground/80">
                <Phone className="h-4 w-4 mt-0.5 text-accent" />
                <span>+91 9789225510</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-primary-foreground/80">
                <MapPin className="h-4 w-4 mt-0.5 text-accent" />
                <span>Tirupur, Tamil Nadu, India</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-primary-foreground/10">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-primary-foreground/40">
              © {new Date().getFullYear()} Feather Fashions. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link to="/terms-and-conditions" className="text-xs text-primary-foreground/40 hover:text-accent transition-colors">
                Terms
              </Link>
              <span className="text-primary-foreground/20">|</span>
              <Link to="/privacy-policy" className="text-xs text-primary-foreground/40 hover:text-accent transition-colors">
                Privacy
              </Link>
              <span className="text-primary-foreground/20">|</span>
              <Link to="/shipping-return-refund" className="text-xs text-primary-foreground/40 hover:text-accent transition-colors">
                Shipping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;