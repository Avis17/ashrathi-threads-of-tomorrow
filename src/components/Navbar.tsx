import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartButton } from "./cart/CartButton";
import { useAuth } from "@/hooks/useAuth";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Shop", path: "/shop" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
    { name: "Bulk Orders", path: "/bulk-orders" },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleSignInClick = () => {
    if (user) {
      navigate("/account");
    } else {
      navigate("/auth");
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0F1113]/95 backdrop-blur-md shadow-[0_2px_12px_rgba(0,0,0,0.4)] border-b border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[76px]">
          {/* Logo & Tagline */}
          <Link to="/" className="flex flex-col items-start">
            <span className="text-2xl font-bold text-white tracking-[0.15em]" style={{ fontFamily: 'Inter, Poppins, Montserrat, sans-serif' }}>
              FEATHER
            </span>
            <span className="text-[9px] font-medium text-[#1EC9FF] tracking-[0.25em] uppercase mt-[-2px]">
              Wear The Comfort
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-10">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`relative text-sm font-medium tracking-[0.08em] transition-colors duration-300 py-1 ${
                  isActive(item.path)
                    ? "text-[#1EC9FF]"
                    : "text-[#EAEAEA] hover:text-[#1EC9FF]"
                }`}
                style={{ fontFamily: 'Inter, Poppins, Montserrat, sans-serif' }}
              >
                {item.name}
                {isActive(item.path) && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#1EC9FF] rounded-full" />
                )}
              </Link>
            ))}
          </div>

          {/* Right Icons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-[#EAEAEA] hover:text-[#1EC9FF] hover:bg-transparent transition-colors duration-300"
            >
              <Search className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignInClick}
              className="text-[#EAEAEA] hover:text-[#1EC9FF] hover:bg-transparent transition-colors duration-300"
            >
              <User className="h-5 w-5" />
            </Button>
            <CartButton />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <CartButton />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="text-white hover:text-[#1EC9FF] hover:bg-transparent"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden bg-[#0F1113] border-t border-white/[0.06]">
            <div className="px-4 pt-4 pb-6 space-y-3">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`block py-2.5 text-sm font-medium tracking-[0.08em] transition-colors duration-300 ${
                    isActive(item.path)
                      ? "text-[#1EC9FF]"
                      : "text-[#EAEAEA] hover:text-[#1EC9FF]"
                  }`}
                  style={{ fontFamily: 'Inter, Poppins, Montserrat, sans-serif' }}
                >
                  {item.name}
                </Link>
              ))}
              <div className="flex items-center space-x-4 pt-3 border-t border-white/[0.06]">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-[#EAEAEA] hover:text-[#1EC9FF] hover:bg-transparent"
                >
                  <Search className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSignInClick}
                  className="text-[#EAEAEA] hover:text-[#1EC9FF] hover:bg-transparent"
                >
                  <User className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
