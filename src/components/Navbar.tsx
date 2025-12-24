import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, User, LogOut, Shield, Search, ShoppingBag } from "lucide-react";
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
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, signOut } = useAuth();

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Shop", path: "/shop" },
    { name: "Women", path: "/women" },
    { name: "Men", path: "/men" },
    { name: "Collections", path: "/collections" },
    { name: "About", path: "/about" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav 
      className="fixed top-0 left-0 right-0 z-50 bg-[#F7F7F6] backdrop-blur-md border-b border-black/[0.06] shadow-[0_2px_10px_rgba(0,0,0,0.08)]"
    >
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-[76px]">
          {/* Left - Logo */}
          <Link to="/" className="flex-shrink-0">
            <h1 className="text-2xl font-athletic font-bold tracking-[0.25em] text-[#111111]">
              FEATHER
            </h1>
          </Link>

          {/* Center - Navigation */}
          <div className="hidden lg:flex items-center justify-center flex-1 space-x-10">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium tracking-wide transition-all duration-300 relative ${
                  isActive(link.path) 
                    ? "text-[#1EC9FF]" 
                    : "text-[#111111]/80 hover:text-[#1EC9FF]"
                }`}
              >
                {link.name.toUpperCase()}
                {isActive(link.path) && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#1EC9FF]" />
                )}
              </Link>
            ))}
          </div>

          {/* Right - Actions */}
          <div className="hidden lg:flex items-center space-x-6 flex-shrink-0">
            <button className="text-[#111111]/80 transition-colors duration-300 hover:text-[#1EC9FF]">
              <Search className="h-5 w-5" />
            </button>
            
            {user ? (
              <>
                <CartButton />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="text-[#111111]/80 transition-colors duration-300 hover:text-[#1EC9FF]">
                      <User className="h-5 w-5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-[#1A1A1A] border border-white/10 shadow-2xl">
                    <DropdownMenuItem 
                      onClick={() => navigate('/my-orders')}
                      className="text-white/90 hover:bg-[#1EC9FF]/20 hover:text-[#1EC9FF] focus:bg-[#1EC9FF]/20 focus:text-[#1EC9FF] cursor-pointer transition-all duration-200"
                    >
                      <ShoppingBag className="h-4 w-4 mr-3 text-[#1EC9FF]" />
                      My Orders
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => navigate('/profile')}
                      className="text-white/90 hover:bg-[#1EC9FF]/20 hover:text-[#1EC9FF] focus:bg-[#1EC9FF]/20 focus:text-[#1EC9FF] cursor-pointer transition-all duration-200"
                    >
                      <User className="h-4 w-4 mr-3 text-[#1EC9FF]" />
                      My Profile
                    </DropdownMenuItem>
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator className="bg-white/10" />
                        <DropdownMenuItem 
                          onClick={() => navigate('/admin')}
                          className="text-white/90 hover:bg-[#1EC9FF]/20 hover:text-[#1EC9FF] focus:bg-[#1EC9FF]/20 focus:text-[#1EC9FF] cursor-pointer transition-all duration-200"
                        >
                          <Shield className="h-4 w-4 mr-3 text-amber-500" />
                          Admin Dashboard
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator className="bg-white/10" />
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
                className="text-sm font-medium tracking-wide text-[#111111]/80 transition-colors duration-300 hover:text-[#1EC9FF]"
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
              className="p-2 text-[#111111]"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden fixed inset-x-0 top-[76px] bottom-0 z-[9999] animate-fade-in overflow-y-auto bg-[#F7F7F6] backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.1)]">
            <div className="flex flex-col p-8 space-y-8 min-h-full">
              {/* Premium navigation links */}
              <div className="space-y-6">
                {navLinks.map((link, index) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={`block text-xl font-athletic tracking-[0.15em] transition-all duration-300 ${
                      isActive(link.path) 
                        ? "text-[#1EC9FF]" 
                        : "text-[#111111] hover:text-[#1EC9FF] hover:translate-x-2"
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {link.name.toUpperCase()}
                    {isActive(link.path) && (
                      <span className="inline-block ml-3 w-8 h-0.5 bg-[#1EC9FF] align-middle" />
                    )}
                  </Link>
                ))}
              </div>
              
              {/* Divider with branding */}
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-black/10 to-transparent" />
              </div>

              {/* User actions */}
              <div className="space-y-5">
                {user ? (
                  <>
                    <Link
                      to="/my-orders"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 text-base font-medium text-[#111111]/80 hover:text-[#1EC9FF] transition-all duration-300 hover:translate-x-2"
                    >
                      <ShoppingBag className="h-5 w-5" />
                      My Orders
                    </Link>
                    <Link
                      to="/profile"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 text-base font-medium text-[#111111]/80 hover:text-[#1EC9FF] transition-all duration-300 hover:translate-x-2"
                    >
                      <User className="h-5 w-5" />
                      My Profile
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 text-base font-medium text-[#111111]/80 hover:text-[#1EC9FF] transition-all duration-300 hover:translate-x-2"
                      >
                        <Shield className="h-5 w-5 text-amber-500" />
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={() => { signOut(); setIsOpen(false); }}
                      className="flex items-center gap-3 text-base font-medium text-[#111111]/80 hover:text-red-500 transition-all duration-300 hover:translate-x-2"
                    >
                      <LogOut className="h-5 w-5" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <Link
                    to="/auth"
                    onClick={() => setIsOpen(false)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#111111] text-white font-athletic tracking-[0.1em] text-sm hover:bg-[#1EC9FF] transition-all duration-300"
                  >
                    <User className="h-4 w-4" />
                    SIGN IN
                  </Link>
                )}
              </div>

              {/* Brand footer */}
              <div className="mt-auto pt-8">
                <p className="text-xs font-athletic tracking-[0.2em] text-[#111111]/40">
                  FEATHER FASHIONS
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
