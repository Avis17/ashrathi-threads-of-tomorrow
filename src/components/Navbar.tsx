import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Menu, X, User, LogOut, Shield, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useAuth } from "@/hooks/useAuth";
import { CartButton } from "@/components/cart/CartButton";
import logo from "@/assets/logo.png";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, signOut } = useAuth();

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Products", path: "/products" },
    { name: "Services", path: "/services" },
    { name: "New Collections", path: "/collections" },
    { name: "About Us", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  const moreMenuLinks = [
    { name: "College", path: "/categories/college" },
    { name: "Uniform", path: "/categories/uniform" },
    { name: "Event", path: "/categories/event" },
    { name: "Sports", path: "/categories/sports" },
    { name: "Kids", path: "/categories/kids" },
    { name: "Corporate", path: "/categories/corporate" },
    { name: "Innerwear", path: "/categories/innerwear" },
    { name: "Boxer", path: "/categories/boxer" },
    { name: "Track Pants", path: "/categories/track-pants" },
    { name: "Export Surplus", path: "/categories/export-surplus" },
  ];

  const womenCategories = [
    { name: "Half Sleeve T-Shirt", path: "/women/half-sleeve-tshirt" },
    { name: "Long Sleeve T-Shirt", path: "/women/long-sleeve-tshirt" },
    { name: "V-Neck T-Shirt", path: "/women/vneck-tshirt" },
    { name: "Polo T-Shirt", path: "/women/polo-tshirt" },
    { name: "Leggings", path: "/women/leggings" },
  ];

  const menCategories = [
    { name: "Full Sleeve T-Shirt", path: "/men/full-sleeve-tshirt" },
    { name: "Polo T-Shirt", path: "/men/polo-tshirt" },
    { name: "Printed T-Shirt", path: "/men/printed-tshirt" },
    { name: "Striped T-Shirt", path: "/men/striped-tshirt" },
    { name: "V-Neck T-Shirt", path: "/men/vneck-tshirt" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 transition-transform hover:scale-105">
            <img src={logo} alt="Feather Fashions Logo" className="h-32 w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            <Link
              to="/"
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                isActive("/") ? "text-secondary" : "text-foreground hover:text-secondary"
              }`}
            >
              Home
            </Link>
            
            <NavigationMenu>
              <NavigationMenuList className="flex-wrap">
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent hover:bg-transparent data-[state=open]:bg-transparent hover:text-secondary data-[state=open]:text-secondary">
                    Women
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4">
                      {womenCategories.map((category) => (
                        <li key={category.path}>
                          <NavigationMenuLink asChild>
                            <Link
                              to={category.path}
                              className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                            >
                              <div className="text-sm font-medium leading-none">{category.name}</div>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent hover:bg-transparent data-[state=open]:bg-transparent hover:text-secondary data-[state=open]:text-secondary">
                    Men
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4">
                      {menCategories.map((category) => (
                        <li key={category.path}>
                          <NavigationMenuLink asChild>
                            <Link
                              to={category.path}
                              className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                            >
                              <div className="text-sm font-medium leading-none">{category.name}</div>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            {navLinks.slice(1).map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  isActive(link.path)
                    ? "text-secondary"
                    : "text-foreground hover:text-secondary"
                }`}
              >
                {link.name}
              </Link>
            ))}

            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent hover:bg-transparent data-[state=open]:bg-transparent hover:text-secondary data-[state=open]:text-secondary">
                    More
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4">
                      {moreMenuLinks.map((link) => (
                        <li key={link.path}>
                          <NavigationMenuLink asChild>
                            <Link
                              to={link.path}
                              className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                            >
                              <div className="text-sm font-medium leading-none">{link.name}</div>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Auth & CTA Buttons */}
          <div className="hidden lg:flex items-center gap-2">
            {user ? (
              <>
                <CartButton />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => navigate('/my-orders')}>
                      My Orders
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      My Profile
                    </DropdownMenuItem>
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => navigate('/admin')}>
                          <Shield className="h-4 w-4 mr-2" />
                          Admin Dashboard
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button asChild variant="outline" size="sm">
                <Link to="/auth">
                  <User className="h-4 w-4 mr-2" />
                  Sign In
                </Link>
              </Button>
            )}
            <Button asChild variant="default" className="bg-secondary hover:bg-secondary/90">
              <Link to="/contact">Get in Touch</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-md hover:bg-muted transition-colors"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden border-t border-border animate-fade-in max-h-[calc(100vh-5rem)] overflow-y-auto">
            <div className="flex flex-col space-y-2 py-4">
              {user && (
                <div className="mx-4 mb-2 flex items-center gap-2">
                  <CartButton />
                  <Button asChild variant="ghost" size="sm" className="flex-1">
                    <Link to="/my-orders" onClick={() => setIsOpen(false)}>
                      My Orders
                    </Link>
                  </Button>
                  <Button asChild variant="ghost" size="sm" className="flex-1">
                    <Link to="/profile" onClick={() => setIsOpen(false)}>
                      My Profile
                    </Link>
                  </Button>
                </div>
              )}
              <Link
                to="/"
                onClick={() => setIsOpen(false)}
                className={`px-4 py-3 rounded-md font-medium transition-colors ${
                  isActive("/")
                    ? "bg-secondary/10 text-secondary"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                Home
              </Link>
              
              <Accordion type="single" collapsible className="w-full">
                {/* Women Submenu */}
                <AccordionItem value="women" className="border-0">
                  <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted rounded-md font-medium">
                    Women
                  </AccordionTrigger>
                  <AccordionContent className="pb-2">
                    {womenCategories.map((category) => (
                      <Link
                        key={category.path}
                        to={category.path}
                        onClick={() => setIsOpen(false)}
                        className={`px-6 py-2.5 rounded-md text-sm transition-colors block ${
                          isActive(category.path)
                            ? "bg-secondary/10 text-secondary"
                            : "text-foreground hover:bg-muted"
                        }`}
                      >
                        {category.name}
                      </Link>
                    ))}
                  </AccordionContent>
                </AccordionItem>

                {/* Men Submenu */}
                <AccordionItem value="men" className="border-0">
                  <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted rounded-md font-medium">
                    Men
                  </AccordionTrigger>
                  <AccordionContent className="pb-2">
                    {menCategories.map((category) => (
                      <Link
                        key={category.path}
                        to={category.path}
                        onClick={() => setIsOpen(false)}
                        className={`px-6 py-2.5 rounded-md text-sm transition-colors block ${
                          isActive(category.path)
                            ? "bg-secondary/10 text-secondary"
                            : "text-foreground hover:bg-muted"
                        }`}
                      >
                        {category.name}
                      </Link>
                    ))}
                  </AccordionContent>
                </AccordionItem>

                {/* More Menu Links */}
                <AccordionItem value="more" className="border-0">
                  <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted rounded-md font-medium">
                    More
                  </AccordionTrigger>
                  <AccordionContent className="pb-2">
                    {moreMenuLinks.map((link) => (
                      <Link
                        key={link.path}
                        to={link.path}
                        onClick={() => setIsOpen(false)}
                        className={`px-6 py-2.5 rounded-md text-sm transition-colors block ${
                          isActive(link.path)
                            ? "bg-secondary/10 text-secondary"
                            : "text-foreground hover:bg-muted"
                        }`}
                      >
                        {link.name}
                      </Link>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {navLinks.slice(1).map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`px-4 py-3 rounded-md font-medium transition-colors ${
                    isActive(link.path)
                      ? "bg-secondary/10 text-secondary"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              {user ? (
                <>
                  {isAdmin && (
                    <Button asChild variant="outline" className="mx-4">
                      <Link to="/admin" onClick={() => setIsOpen(false)}>
                        <Shield className="h-4 w-4 mr-2" />
                        Admin Dashboard
                      </Link>
                    </Button>
                  )}
                  <Button onClick={() => { signOut(); setIsOpen(false); }} variant="outline" className="mx-4">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <Button asChild variant="outline" className="mx-4">
                  <Link to="/auth" onClick={() => setIsOpen(false)}>
                    <User className="h-4 w-4 mr-2" />
                    Sign In
                  </Link>
                </Button>
              )}
              <Button asChild variant="default" className="bg-secondary hover:bg-secondary/90 mx-4 mt-2">
                <Link to="/contact" onClick={() => setIsOpen(false)}>Get in Touch</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
