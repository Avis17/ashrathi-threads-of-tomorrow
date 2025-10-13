import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Facebook, Instagram, Linkedin } from "lucide-react";
import logo from "@/assets/logo.png";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <img src={logo} alt="Ashrathi Apparels" className="h-32 mb-4 brightness-0 invert" />
            <p className="text-sm text-primary-foreground/80 leading-relaxed">
              Threads of Quality. Designs of Tomorrow. Your trusted partner in premium garment manufacturing.
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
            <h3 className="font-accent font-semibold text-lg mb-4">Our Products</h3>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li>T-Shirts & Tops</li>
              <li>Track Pants & Shorts</li>
              <li>Leggings & Tights</li>
              <li>Cotton Pants</li>
              <li>Custom Orders</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-accent font-semibold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-primary-foreground/80">
                <Mail className="h-4 w-4 mt-0.5 text-secondary" />
                <span>ashrathiapparels@gmail.com</span>
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

        {/* Bottom Bar */}
        <div className="border-t border-primary-foreground/20 mt-8 pt-6 text-center">
          <p className="text-sm text-primary-foreground/60">
            © {new Date().getFullYear()} Ashrathi Apparels. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
