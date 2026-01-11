import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, User, LogOut, Shield, ChevronDown, FileText, Ship, ChevronRight } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/hooks/useLanguage";

interface NavbarB2BProps {
  topOffset?: string;
}

const NavbarB2B = ({ topOffset = "top-0" }: NavbarB2BProps) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [mobileWomensOpen, setMobileWomensOpen] = useState(false);
  const [mobileKidsOpen, setMobileKidsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, signOut } = useAuth();

  // Core Export Products
  const womensWear = [
    { nameKey: "nav.womensWearProducts.nightwear", path: "/products/womens-nightwear" },
    { nameKey: "nav.womensWearProducts.pyjamas", path: "/products/pyjamas-casual-wear" },
    { nameKey: "nav.womensWearProducts.cottonTshirts", path: "/products/cotton-tshirts" },
    { nameKey: "nav.womensWearProducts.innerwear", path: "/products/innerwear-basics" },
  ];

  const kidswear = [
    { nameKey: "nav.kidswearProducts.nightwearSets", path: "/products" },
    { nameKey: "nav.kidswearProducts.pyjamas", path: "/products" },
    { nameKey: "nav.kidswearProducts.cottonSets", path: "/products" },
    { nameKey: "nav.kidswearProducts.colorfulSets", path: "/products/kidswear-colorful-sets" },
  ];

  // By Fabric / Style
  const fabricStyles = [
    { nameKey: "nav.fabricStyles.cotton", path: "/products" },
    { nameKey: "nav.fabricStyles.knitted", path: "/products" },
    { nameKey: "nav.fabricStyles.printedDyed", path: "/products" },
  ];

  // By Market Use
  const marketUse = [
    { nameKey: "nav.marketUse.exportCollections", path: "/products" },
    { nameKey: "nav.marketUse.bulkOem", path: "/contact" },
    { nameKey: "nav.marketUse.privateLabel", path: "/contact" },
  ];

  const resourceLinks = [
    { nameKey: "nav.resourceLinks.shippingPolicy", path: "/shipping-export-policy", icon: Ship },
    { nameKey: "nav.resourceLinks.compliance", path: "/compliance", icon: FileText },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <nav className={`fixed ${topOffset} left-0 right-0 z-50 bg-white border-b border-border/40`}>
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-[76px]">
            
            {/* Premium Logo - Stacked */}
            <Link to="/" className="flex-shrink-0 group">
              <div className="flex flex-col items-start leading-none">
                <span className="text-xl md:text-2xl font-serif font-light tracking-[0.35em] text-foreground group-hover:text-accent transition-colors duration-300">
                  FEATHER
                </span>
                <span className="text-[10px] md:text-xs font-medium tracking-[0.5em] text-muted-foreground uppercase mt-0.5">
                  FASHIONS
                </span>
              </div>
            </Link>

            {/* Desktop Navigation - Center */}
            <div className="hidden lg:flex items-center justify-center flex-1">
              <div className="flex items-center space-x-1 rtl:space-x-reverse">
                
                {/* Products Dropdown */}
                <DropdownMenu open={productsOpen} onOpenChange={setProductsOpen}>
                  <DropdownMenuTrigger asChild>
                    <button 
                      className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium tracking-wide transition-all duration-300 rounded-md ${
                        isActive('/products') 
                          ? "text-accent" 
                          : "text-foreground/70 hover:text-foreground hover:bg-muted/50"
                      }`}
                    >
                      {t('nav.productCategories')}
                      <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${productsOpen ? 'rotate-180' : ''}`} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    align="center" 
                    className="w-[680px] bg-white border border-border/60 shadow-2xl rounded-lg p-5 mt-2"
                    sideOffset={8}
                  >
                    <div className="grid grid-cols-[1.2fr_1fr_0.8fr] gap-6">
                      
                      {/* COLUMN 1 — CORE MANUFACTURING (Dominant) */}
                      <div className="space-y-6 pr-4 border-r rtl:border-r-0 rtl:border-l rtl:pr-0 rtl:pl-4 border-border/30">
                        {/* Women's Wear */}
                        <div>
                          <p className="text-[11px] font-semibold text-foreground uppercase tracking-[0.1em] mb-1">{t('nav.womensWear')}</p>
                          <p className="text-[10px] text-muted-foreground mb-3">{t('nav.womensWearDesc')}</p>
                          <div className="space-y-0.5">
                            {womensWear.map((item) => (
                              <DropdownMenuItem 
                                key={item.nameKey}
                                onClick={() => navigate(item.path)}
                                className="cursor-pointer rounded px-2 py-1.5 focus:bg-muted/60 text-foreground/75 hover:text-foreground hover:bg-muted/40"
                              >
                                <span className="text-[13px]">{t(item.nameKey)}</span>
                              </DropdownMenuItem>
                            ))}
                          </div>
                        </div>

                        {/* Kidswear */}
                        <div>
                          <p className="text-[11px] font-semibold text-foreground uppercase tracking-[0.1em] mb-1">{t('nav.kidswear')}</p>
                          <p className="text-[10px] text-muted-foreground mb-3">{t('nav.kidswearDesc')}</p>
                          <div className="space-y-0.5">
                            {kidswear.map((item) => (
                              <DropdownMenuItem 
                                key={item.nameKey}
                                onClick={() => navigate(item.path)}
                                className="cursor-pointer rounded px-2 py-1.5 focus:bg-muted/60 text-foreground/75 hover:text-foreground hover:bg-muted/40"
                              >
                                <span className="text-[13px]">{t(item.nameKey)}</span>
                              </DropdownMenuItem>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* COLUMN 2 — EXPORT CAPABILITIES (Supporting) */}
                      <div className="space-y-6 pr-4 border-r rtl:border-r-0 rtl:border-l rtl:pr-0 rtl:pl-4 border-border/30">
                        {/* Export & Manufacturing */}
                        <div>
                          <p className="text-[11px] font-semibold text-foreground uppercase tracking-[0.1em] mb-3">{t('nav.exportManufacturing')}</p>
                          <div className="space-y-0.5">
                            {marketUse.map((item) => (
                              <DropdownMenuItem 
                                key={item.nameKey}
                                onClick={() => navigate(item.path)}
                                className="cursor-pointer rounded px-2 py-1.5 focus:bg-muted/60 text-foreground/75 hover:text-foreground hover:bg-muted/40"
                              >
                                <span className="text-[13px]">{t(item.nameKey)}</span>
                              </DropdownMenuItem>
                            ))}
                          </div>
                        </div>

                        {/* Fabric & Construction */}
                        <div>
                          <p className="text-[11px] font-semibold text-foreground uppercase tracking-[0.1em] mb-3">{t('nav.fabricConstruction')}</p>
                          <div className="space-y-0.5">
                            {fabricStyles.map((item) => (
                              <DropdownMenuItem 
                                key={item.nameKey}
                                onClick={() => navigate(item.path)}
                                className="cursor-pointer rounded px-2 py-1.5 focus:bg-muted/60 text-foreground/75 hover:text-foreground hover:bg-muted/40"
                              >
                                <span className="text-[13px]">{t(item.nameKey)}</span>
                              </DropdownMenuItem>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* COLUMN 3 — ACTION & TRUST (Smaller) */}
                      <div className="space-y-5">
                        {/* Quick Actions */}
                        <div>
                          <p className="text-[11px] font-semibold text-foreground uppercase tracking-[0.1em] mb-3">{t('nav.quickActions')}</p>
                          <div className="space-y-0.5">
                            <DropdownMenuItem 
                              onClick={() => navigate('/products')}
                              className="cursor-pointer rounded px-2 py-1.5 focus:bg-muted/60 hover:bg-muted/40"
                            >
                              <span className="text-[13px] text-accent hover:underline">{t('nav.viewAllProducts')}</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => navigate('/contact')}
                              className="cursor-pointer rounded px-2 py-1.5 focus:bg-muted/60 hover:bg-muted/40"
                            >
                              <span className="text-[13px] text-accent hover:underline">{t('nav.requestQuoteLink')}</span>
                            </DropdownMenuItem>
                          </div>
                        </div>

                        {/* Export Assurance */}
                        <div className="pt-4 mt-auto">
                          <p className="text-[10px] text-muted-foreground leading-relaxed">
                            {t('nav.exportAssurance')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Manufacturing */}
                <Link
                  to="/manufacturing"
                  className={`px-4 py-2 text-sm font-medium tracking-wide transition-all duration-300 rounded-md ${
                    isActive('/manufacturing') 
                      ? "text-accent" 
                      : "text-foreground/70 hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  {t('nav.manufacturing')}
                </Link>

                {/* Resources Dropdown */}
                <DropdownMenu open={resourcesOpen} onOpenChange={setResourcesOpen}>
                  <DropdownMenuTrigger asChild>
                    <button 
                      className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium tracking-wide transition-all duration-300 rounded-md ${
                        isActive('/export-brochure') || isActive('/shipping-export-policy')
                          ? "text-accent" 
                          : "text-foreground/70 hover:text-foreground hover:bg-muted/50"
                      }`}
                    >
                      {t('nav.resources')}
                      <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${resourcesOpen ? 'rotate-180' : ''}`} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    align="center" 
                    className="w-52 bg-white border border-border shadow-xl rounded-xl p-2 mt-2"
                    sideOffset={8}
                  >
                    {resourceLinks.map((link) => (
                      <DropdownMenuItem 
                        key={link.nameKey}
                        onClick={() => navigate(link.path)}
                        className="cursor-pointer rounded-lg px-3 py-2.5 focus:bg-muted"
                      >
                        <link.icon className="h-4 w-4 mr-3 rtl:mr-0 rtl:ml-3 text-accent" />
                        <span className="font-medium">{t(link.nameKey)}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Contact */}
                <Link
                  to="/contact"
                  className={`px-4 py-2 text-sm font-medium tracking-wide transition-all duration-300 rounded-md ${
                    isActive('/contact') 
                      ? "text-accent" 
                      : "text-foreground/70 hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  {t('nav.contact')}
                </Link>
              </div>
            </div>

            {/* Desktop Actions - Right */}
            <div className="hidden lg:flex items-center space-x-3 rtl:space-x-reverse flex-shrink-0">
              
              {/* Language Switcher */}
              <LanguageSwitcher />

              {/* User Menu */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-2 text-foreground/50 hover:text-foreground transition-colors rounded-full hover:bg-muted/50">
                      <User className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-white border border-border shadow-xl rounded-xl p-2 mt-2">
                    {isAdmin && (
                      <>
                        <DropdownMenuItem 
                          onClick={() => navigate('/admin')}
                          className="cursor-pointer rounded-lg px-3 py-2.5"
                        >
                          <Shield className="h-4 w-4 mr-3 rtl:mr-0 rtl:ml-3 text-accent" />
                          {t('nav.dashboard')}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="my-2" />
                      </>
                    )}
                    <DropdownMenuItem 
                      onClick={signOut}
                      className="cursor-pointer rounded-lg px-3 py-2.5 text-destructive focus:text-destructive"
                    >
                      <LogOut className="h-4 w-4 mr-3 rtl:mr-0 rtl:ml-3" />
                      {t('nav.signOut')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link 
                  to="/auth"
                  className="p-2 text-foreground/50 hover:text-foreground transition-colors rounded-full hover:bg-muted/50"
                  title={t('nav.login')}
                >
                  <User className="h-4 w-4" />
                </Link>
              )}

              {/* Primary CTA */}
              <Button asChild size="sm" className="bg-foreground text-background hover:bg-foreground/90 font-medium tracking-wide px-5">
                <Link to="/contact">
                  {t('nav.requestQuote')}
                </Link>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center gap-2">
              <Button asChild size="sm" variant="outline" className="text-xs px-3 border-foreground/20">
                <Link to="/contact">
                  {t('nav.quote')}
                </Link>
              </Button>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 text-foreground hover:bg-muted/50 rounded-lg transition-colors"
              >
                {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="lg:hidden fixed left-0 right-0 top-[76px] bottom-0 z-[9999] bg-white overflow-y-auto">
          <div className="flex flex-col p-6">
            
            {/* Products Section - Collapsible */}
            <div className="py-4 border-b border-border/50">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">{t('nav.productCategories')}</p>
              
              {/* Women's Wear - Collapsible */}
              <div className="mb-2">
                <button
                  onClick={() => setMobileWomensOpen(!mobileWomensOpen)}
                  className="flex items-center justify-between w-full py-2.5 text-foreground font-medium"
                >
                  <span>{t('nav.womensWear')}</span>
                  <ChevronRight className={`h-4 w-4 transition-transform ${mobileWomensOpen ? 'rotate-90 rtl:-rotate-90' : ''}`} />
                </button>
                {mobileWomensOpen && (
                  <div className="pl-4 rtl:pl-0 rtl:pr-4 space-y-1 mt-1">
                    {womensWear.map((item) => (
                      <Link
                        key={item.nameKey}
                        to={item.path}
                        onClick={() => setIsOpen(false)}
                        className="block py-2 text-foreground/70 hover:text-accent transition-colors text-sm"
                      >
                        {t(item.nameKey)}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Kidswear - Collapsible */}
              <div className="mb-2">
                <button
                  onClick={() => setMobileKidsOpen(!mobileKidsOpen)}
                  className="flex items-center justify-between w-full py-2.5 text-foreground font-medium"
                >
                  <span>{t('nav.kidswear')}</span>
                  <ChevronRight className={`h-4 w-4 transition-transform ${mobileKidsOpen ? 'rotate-90 rtl:-rotate-90' : ''}`} />
                </button>
                {mobileKidsOpen && (
                  <div className="pl-4 rtl:pl-0 rtl:pr-4 space-y-1 mt-1">
                    {kidswear.map((item) => (
                      <Link
                        key={item.nameKey}
                        to={item.path}
                        onClick={() => setIsOpen(false)}
                        className="block py-2 text-foreground/70 hover:text-accent transition-colors text-sm"
                      >
                        {t(item.nameKey)}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Direct links */}
              <div className="mt-3 pt-3 border-t border-border/30 space-y-1">
                <Link
                  to="/products"
                  onClick={() => setIsOpen(false)}
                  className="block py-2 text-foreground/80 hover:text-accent transition-colors"
                >
                  {t('nav.exportCollections')}
                </Link>
                <Link
                  to="/contact"
                  onClick={() => setIsOpen(false)}
                  className="block py-2 text-foreground/80 hover:text-accent transition-colors"
                >
                  {t('nav.privateLabelOem')}
                </Link>
              </div>
            </div>

            {/* Main Links */}
            <div className="py-4 border-b border-border/50 space-y-1">
              <Link
                to="/manufacturing"
                onClick={() => setIsOpen(false)}
                className={`block py-3 text-lg font-medium tracking-wide ${
                  isActive('/manufacturing') ? "text-accent" : "text-foreground hover:text-accent"
                }`}
              >
                {t('nav.manufacturing')}
              </Link>
              <Link
                to="/compliance"
                onClick={() => setIsOpen(false)}
                className={`block py-3 text-lg font-medium tracking-wide ${
                  isActive('/compliance') ? "text-accent" : "text-foreground hover:text-accent"
                }`}
              >
                {t('nav.compliance')}
              </Link>
              <Link
                to="/contact"
                onClick={() => setIsOpen(false)}
                className={`block py-3 text-lg font-medium tracking-wide ${
                  isActive('/contact') ? "text-accent" : "text-foreground hover:text-accent"
                }`}
              >
                {t('nav.contact')}
              </Link>
            </div>

            {/* Resources Section */}
            <div className="py-4 border-b border-border/50">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">{t('nav.resources')}</p>
              <div className="space-y-1">
                {resourceLinks.map((link) => (
                  <Link
                    key={link.nameKey}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 py-2.5 text-foreground/80 hover:text-accent transition-colors"
                  >
                    <link.icon className="h-4 w-4 text-accent" />
                    {t(link.nameKey)}
                  </Link>
                ))}
              </div>
            </div>
            
            {/* Language Switcher for Mobile */}
            <div className="py-4 border-b border-border/50">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">{t('language.selectLanguage')}</p>
              <LanguageSwitcher />
            </div>
            
            {/* User Section */}
            <div className="py-4 border-b border-border/50">
              {user ? (
                <div className="space-y-1">
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 py-2.5 text-foreground hover:text-accent"
                    >
                      <Shield className="h-4 w-4 text-accent" />
                      {t('nav.dashboard')}
                    </Link>
                  )}
                  <button
                    onClick={() => { signOut(); setIsOpen(false); }}
                    className="flex items-center gap-3 py-2.5 text-destructive"
                  >
                    <LogOut className="h-4 w-4" />
                    {t('nav.signOut')}
                  </button>
                </div>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 py-2.5 text-foreground hover:text-accent"
                >
                  <User className="h-4 w-4" />
                  {t('nav.loginRegister')}
                </Link>
              )}
            </div>

            {/* Mobile CTA */}
            <div className="pt-6">
              <Button asChild className="w-full bg-foreground text-background hover:bg-foreground/90 font-medium">
                <Link to="/contact" onClick={() => setIsOpen(false)}>
                  {t('nav.requestQuote')}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NavbarB2B;
