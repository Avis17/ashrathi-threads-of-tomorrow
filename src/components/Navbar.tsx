import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, User, LogOut, Shield, Search, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { CartButton } from "@/components/cart/CartButton";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Shop", path: "/shop" },
    { name: "Women", path: "/women" },
    { name: "Men", path: "/men" },
    { name: "Collections", path: "/collections" },
    { name: "About", path: "/about" },
  ];

  const isActive = (path: string) => location.pathname === path;
  
  // Pages with dark hero backgrounds where text should be white when not scrolled
  const darkHeroPages = ["/", "/home", "/women", "/men", "/collections", "/about", "/shop", "/size-guide", "/size-chart/womens-leggings", "/size-chart/mens-track-pants", "/size-chart/mens-tshirts", "/size-chart/womens-sports-bra", "/size-chart/kids", "/shipping-return-refund", "/privacy-policy", "/terms-and-conditions"];
  const hasDarkHero = darkHeroPages.includes(location.pathname);
  
  // Determine text color based on scroll state and page type
  const getTextColorClass = (isActiveLink: boolean = false) => {
    if (isActiveLink) return "text-accent";
    // When scrolled and navbar has background, use foreground
    // if (isScrolled) return "text-white";
    // When over dark background, use white text
    // if (isOverDarkBg) return "text-white";
    return "text-white";
  };

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-background/98 backdrop-blur-md border-b border-border shadow-sm"
          : hasDarkHero 
            ? "bg-transparent"
            : "bg-background/98 backdrop-blur-md border-b border-border"
      }`}
    >
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Left - Logo */}
          <Link to="/" className="flex-shrink-0">
            <h1 className={`text-2xl font-serif font-bold tracking-[0.2em] transition-colors duration-300 ${
              getTextColorClass()
            }`}>
              FEATHER
            </h1>
          </Link>

          {/* Center - Navigation */}
          <div className="hidden lg:flex items-center justify-center flex-1 space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium tracking-wide transition-all duration-300 hover:text-accent ${
                  getTextColorClass(isActive(link.path))
                }`}
              >
                {link.name.toUpperCase()}
              </Link>
            ))}
          </div>

          {/* Right - Actions */}
          <div className="hidden lg:flex items-center space-x-6 flex-shrink-0">
            <button className={`transition-colors duration-300 hover:text-accent ${
              getTextColorClass()
            }`}>
              <Search className="h-5 w-5" />
            </button>
            
            {user ? (
              <>
                <CartButton />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className={`transition-colors duration-300 hover:text-accent ${
                      getTextColorClass()
                    }`}>
                      <User className="h-5 w-5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 shadow-2xl backdrop-blur-xl">
                    <DropdownMenuItem 
                      onClick={() => navigate('/my-orders')}
                      className="text-slate-200 hover:bg-accent/20 hover:text-accent focus:bg-accent/20 focus:text-accent cursor-pointer transition-all duration-200"
                    >
                      <ShoppingBag className="h-4 w-4 mr-3 text-accent" />
                      My Orders
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => navigate('/profile')}
                      className="text-slate-200 hover:bg-accent/20 hover:text-accent focus:bg-accent/20 focus:text-accent cursor-pointer transition-all duration-200"
                    >
                      <User className="h-4 w-4 mr-3 text-accent" />
                      My Profile
                    </DropdownMenuItem>
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator className="bg-slate-700/50" />
                        <DropdownMenuItem 
                          onClick={() => navigate('/admin')}
                          className="text-slate-200 hover:bg-accent/20 hover:text-accent focus:bg-accent/20 focus:text-accent cursor-pointer transition-all duration-200"
                        >
                          <Shield className="h-4 w-4 mr-3 text-amber-500" />
                          Admin Dashboard
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator className="bg-slate-700/50" />
                    <DropdownMenuItem 
                      onClick={signOut}
                      className="text-red-400 hover:bg-red-500/20 hover:text-red-300 focus:bg-red-500/20 focus:text-red-300 cursor-pointer transition-all duration-200"
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Link 
                to="/auth"
                className={`text-sm font-medium tracking-wide transition-colors duration-300 hover:text-accent ${
                  getTextColorClass()
                }`}
              >
                SIGN IN
              </Link>
            )}
          </div>

          {/* Mobile - Right side */}
          <div className="lg:hidden flex items-center gap-4">
            {user && <CartButton />}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`p-2 transition-colors ${
                getTextColorClass()
              }`}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden fixed inset-0 top-20 bg-background z-50 animate-fade-in">
            <div className="flex flex-col p-8 space-y-6">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`text-2xl font-light tracking-wide transition-colors ${
                    isActive(link.path) ? "text-accent" : "text-foreground hover:text-accent"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              
              <div className="pt-6 border-t border-border space-y-4">
                {user ? (
                  <>
                    <Link
                      to="/my-orders"
                      onClick={() => setIsOpen(false)}
                      className="block text-lg text-muted-foreground hover:text-foreground transition-colors"
                    >
                      My Orders
                    </Link>
                    <Link
                      to="/profile"
                      onClick={() => setIsOpen(false)}
                      className="block text-lg text-muted-foreground hover:text-foreground transition-colors"
                    >
                      My Profile
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setIsOpen(false)}
                        className="block text-lg text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={() => { signOut(); setIsOpen(false); }}
                      className="block text-lg text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <Link
                    to="/auth"
                    onClick={() => setIsOpen(false)}
                    className="block text-lg font-medium text-foreground"
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
