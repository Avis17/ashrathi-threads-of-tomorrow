import { useState, useEffect, useRef, useCallback } from "react";
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

// Helper function to determine if a color is dark based on luminance
const isDarkColor = (rgb: string): boolean => {
  try {
    const values = rgb
      .replace("rgb(", "")
      .replace("rgba(", "")
      .replace(")", "")
      .split(",")
      .map(v => parseFloat(v.trim()));
    
    const [r, g, b] = values;
    
    if (isNaN(r) || isNaN(g) || isNaN(b)) return false;
    
    // Relative luminance formula
    const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    return luminance < 0.5; // true = dark background
  } catch {
    return false;
  }
};

// Check if an element or its parents indicate a dark background
const isElementDark = (element: Element): boolean => {
  let current: Element | null = element;
  
  while (current && current !== document.documentElement) {
    // Check for data attribute (most reliable method)
    if (current.getAttribute('data-navbar-dark') === 'true') {
      return true;
    }
    
    const classes = current.className?.toString() || '';
    
    // Check for dark-indicating class patterns
    const darkPatterns = [
      /bg-black/,
      /bg-\[#0/,
      /bg-\[#1/,
      /bg-slate-9/,
      /bg-zinc-9/,
      /bg-neutral-9/,
      /bg-gray-9/,
      /from-black/,
      /via-black/,
      /to-black/,
      /bg-\[#0a0a0a\]/i,
      /bg-\[#111\]/,
      /bg-\[#000\]/,
      /bg-background/,
    ];
    
    if (darkPatterns.some(pattern => pattern.test(classes))) {
      return true;
    }
    
    // Check computed background color
    const computed = window.getComputedStyle(current);
    const bgColor = computed.backgroundColor;
    
    if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
      return isDarkColor(bgColor);
    }
    
    // Check for background images (hero sections often have these)
    const bgImage = computed.backgroundImage;
    if (bgImage && bgImage !== 'none') {
      // If there's a background image, check if there's an overlay that's dark
      const overlay = current.querySelector('[class*="bg-gradient"], [class*="bg-black"]');
      if (overlay) {
        return true;
      }
    }
    
    current = current.parentElement;
  }
  
  return false;
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDarkBg, setIsDarkBg] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, signOut } = useAuth();
  const navRef = useRef<HTMLElement>(null);

  // Function to detect background color at navbar position
  const detectBackgroundColor = useCallback(() => {
    if (!navRef.current) return;
    
    const navRect = navRef.current.getBoundingClientRect();
    
    // Sample multiple points across the navbar for better accuracy
    const samplePoints = [
      { x: navRect.left + 100, y: navRect.top + navRect.height + 20 },
      { x: navRect.left + navRect.width / 2, y: navRect.top + navRect.height + 20 },
      { x: navRect.right - 100, y: navRect.top + navRect.height + 20 }
    ];
    
    // Temporarily hide navbar to sample what's behind it
    navRef.current.style.visibility = 'hidden';
    
    let darkCount = 0;
    
    for (const point of samplePoints) {
      const element = document.elementFromPoint(point.x, point.y);
      if (element && isElementDark(element)) {
        darkCount++;
      }
    }
    
    // Restore navbar visibility
    navRef.current.style.visibility = '';
    
    // If majority of sample points indicate dark background
    setIsDarkBg(darkCount >= 2);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 20;
      setIsScrolled(scrolled);
      
      // Only detect background when not scrolled (when navbar is transparent)
      if (!scrolled) {
        detectBackgroundColor();
      }
    };
    
    // Initial detection
    detectBackgroundColor();
    
    window.addEventListener("scroll", handleScroll);
    
    // Also detect on resize and after images load
    window.addEventListener("resize", detectBackgroundColor);
    window.addEventListener("load", detectBackgroundColor);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", detectBackgroundColor);
      window.removeEventListener("load", detectBackgroundColor);
    };
  }, [detectBackgroundColor]);

  // Re-detect when route changes
  useEffect(() => {
    // Small delay to allow page content to render
    const timeout = setTimeout(() => {
      detectBackgroundColor();
    }, 100);
    
    return () => clearTimeout(timeout);
  }, [location.pathname, detectBackgroundColor]);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Shop", path: "/shop" },
    { name: "Women", path: "/women" },
    { name: "Men", path: "/men" },
    { name: "Collections", path: "/collections" },
    { name: "About", path: "/about" },
  ];

  const isActive = (path: string) => location.pathname === path;
  
  // Determine text color based on scroll state and detected background
  const getTextColorClass = (isActiveLink: boolean = false) => {
    if (isActiveLink) return "text-[#0090FF]"; // Accent color for active links
    
    // When scrolled, navbar has light background - always use dark text
    if (isScrolled) return "text-[#111111]";
    
    // When background is dark - use light text
    if (isDarkBg) return "text-[#F5F5F5]";
    
    // Default - dark text
    return "text-[#111111]";
  };

  // Determine if navbar should have transparent background
  const shouldBeTransparent = !isScrolled && isDarkBg;

  return (
    <nav 
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-white/98 backdrop-blur-md border-b border-[#e5e5e5] shadow-sm"
          : shouldBeTransparent
            ? "bg-transparent"
            : "bg-white/98 backdrop-blur-md border-b border-[#e5e5e5]"
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
