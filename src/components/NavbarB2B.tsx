import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, User, LogOut, Shield, MessageCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const NavbarB2B = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, signOut } = useAuth();

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Products", path: "/products" },
    { name: "Manufacturing", path: "/manufacturing" },
    { name: "Compliance", path: "/compliance" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleWhatsApp = () => {
    window.open("https://wa.me/919789225510?text=Hello, I'm interested in bulk orders from Feather Fashions.", "_blank");
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-black/[0.06] shadow-sm">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-[76px]">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0">
              <h1 className="text-xl md:text-2xl font-athletic font-bold tracking-[0.2em] text-foreground">
                FEATHER FASHIONS
              </h1>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center justify-center flex-1 space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-medium tracking-wide transition-all duration-300 relative ${
                    isActive(link.path) 
                      ? "text-accent" 
                      : "text-foreground/70 hover:text-accent"
                  }`}
                >
                  {link.name.toUpperCase()}
                  {isActive(link.path) && (
                    <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-accent" />
                  )}
                </Link>
              ))}
            </div>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center space-x-4 flex-shrink-0">
              <button 
                onClick={handleWhatsApp}
                className="text-foreground/70 hover:text-green-600 transition-colors"
                title="Chat on WhatsApp"
              >
                <MessageCircle className="h-5 w-5" />
              </button>
              
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="text-foreground/70 hover:text-accent transition-colors">
                      <User className="h-5 w-5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-white border shadow-lg">
                    {isAdmin && (
                      <>
                        <DropdownMenuItem 
                          onClick={() => navigate('/admin')}
                          className="cursor-pointer"
                        >
                          <Shield className="h-4 w-4 mr-2 text-amber-500" />
                          Admin Dashboard
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuItem 
                      onClick={signOut}
                      className="cursor-pointer text-red-600"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link 
                  to="/auth"
                  className="text-sm font-medium text-foreground/70 hover:text-accent transition-colors"
                >
                  ADMIN
                </Link>
              )}

              <Button asChild size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90 ml-2">
                <Link to="/contact">
                  Request Quote
                </Link>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center gap-3">
              <button 
                onClick={handleWhatsApp}
                className="text-foreground/70 hover:text-green-600 transition-colors p-2"
              >
                <MessageCircle className="h-5 w-5" />
              </button>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 text-foreground"
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="lg:hidden fixed left-0 right-0 top-[76px] bottom-0 z-[9999] bg-white shadow-lg overflow-y-auto">
          <div className="flex flex-col p-6 space-y-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`text-lg font-medium tracking-wide ${
                  isActive(link.path) 
                    ? "text-accent" 
                    : "text-foreground hover:text-accent"
                }`}
              >
                {link.name.toUpperCase()}
              </Link>
            ))}
            
            <div className="pt-4 border-t">
              {user ? (
                <>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-2 text-foreground hover:text-accent py-2"
                    >
                      <Shield className="h-5 w-5 text-amber-500" />
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => { signOut(); setIsOpen(false); }}
                    className="flex items-center gap-2 text-red-600 py-2"
                  >
                    <LogOut className="h-5 w-5" />
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setIsOpen(false)}
                  className="text-foreground hover:text-accent"
                >
                  ADMIN LOGIN
                </Link>
              )}
            </div>

            <Button asChild className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
              <Link to="/contact" onClick={() => setIsOpen(false)}>
                Request Quote
              </Link>
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default NavbarB2B;
