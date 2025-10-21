import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Facebook, Instagram, Linkedin } from "lucide-react";
import logo from "@/assets/logo.png";
import NewsletterSignup from "./NewsletterSignup";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <img src={logo} alt="Feather Fashions" className="h-32 mb-4 brightness-0 invert" />
            <p className="text-sm text-primary-foreground/80 leading-relaxed">
              Premium sustainable fashion crafted with ultra-soft fabrics. Where comfort meets style and innovation.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-accent font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {["Home", "Products", "Services", "About Us", "Contact"].map((item) => (
                <li key={item}>
                  <Link
                    to={item === "Home" ? "/" : `/${item.toLowerCase().replace(" ", "")}`}
                    className="text-sm text-primary-foreground/80 hover:text-secondary transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Products */}
          <div>
            <h3 className="font-accent font-semibold text-lg mb-4">Our Collections</h3>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li>Lounge Sets</li>
              <li>Sleepwear</li>
              <li>Everyday T-Shirts</li>
              <li>Kids Wear</li>
              <li>Co-ord Sets</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-accent font-semibold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-primary-foreground/80">
                <Mail className="h-4 w-4 mt-0.5 text-secondary" />
                <span>                      info@featherfashions.shop
                </span>
              </li>
              <li className="flex items-start gap-2 text-sm text-primary-foreground/80">
                <Phone className="h-4 w-4 mt-0.5 text-secondary" />
                <span>+91 9789225510</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-primary-foreground/80">
                <MapPin className="h-4 w-4 mt-0.5 text-secondary" />
                <span>Annur, Tamil Nadu, India</span>
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
        <div className="border-t border-primary-foreground/20 mt-8 pt-6 text-center">
          <p className="text-sm text-primary-foreground/60">
            © {new Date().getFullYear()} Feather Fashions. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
