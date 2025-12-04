import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Facebook, Instagram, Linkedin } from "lucide-react";
import NewsletterSignup from "./NewsletterSignup";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Brand */}
          <div>
            <img src="/logo.png" alt="Feather Fashions" className="h-36 mb-4" />
            <p className="text-sm text-primary-foreground/80 leading-relaxed">
              Premium sustainable fashion crafted with ultra-soft fabrics. Where comfort meets style and innovation.
            </p>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-accent font-semibold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm">
                <Mail className="h-4 w-4 mt-0.5 text-secondary" />
                <a 
                  href="mailto:hello@featherfashions.in"
                  className="font-medium hover:text-accent transition-colors duration-200 underline decoration-secondary/30 hover:decoration-accent"
                >
                  hello@featherfashions.in
                </a>
              </li>
              <li className="flex items-start gap-2 text-sm text-primary-foreground/80">
                <Phone className="h-4 w-4 mt-0.5 text-secondary" />
                <span>+91 9789225510</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-primary-foreground/80">
                <MapPin className="h-4 w-4 mt-0.5 text-secondary" />
                <span>Tirupur, Tamil Nadu, India</span>
              </li>
            </ul>

            {/* Social Links */}
            <div className="flex gap-3 mt-4">
              <a href="#" className="p-2 rounded-full bg-secondary/20 hover:bg-secondary transition-colors">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 rounded-full bg-secondary/20 hover:bg-secondary transition-colors">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 rounded-full bg-secondary/20 hover:bg-secondary transition-colors">
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Newsletter */}
        <div className="border-t border-primary-foreground/20 mt-8 pt-8">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="font-accent font-semibold text-xl mb-2">Stay Updated</h3>
            <p className="text-sm text-primary-foreground/80 mb-4">
              Subscribe to our newsletter for exclusive offers and sustainable fashion tips
            </p>
            <NewsletterSignup />
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-primary-foreground/20 mt-8 pt-6 text-center space-y-2">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/terms-and-conditions"
              className="text-sm text-primary-foreground/80 hover:text-secondary transition-colors"
            >
              Terms and Conditions
            </Link>
            <span className="text-primary-foreground/40">|</span>
            <Link
              to="/privacy-policy"
              className="text-sm text-primary-foreground/80 hover:text-secondary transition-colors"
            >
              Privacy Policy
            </Link>
            <span className="text-primary-foreground/40">|</span>
            <Link
              to="/shipping-return-refund"
              className="text-sm text-primary-foreground/80 hover:text-secondary transition-colors"
            >
              Shipping, Return & Refund
            </Link>
          </div>
          <p className="text-sm text-primary-foreground/60">
            © {new Date().getFullYear()} Feather Fashions. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
