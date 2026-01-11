import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "./hooks/useAuth";
import { ScrollToTop } from "./components/ScrollToTop";
import NavbarB2B from "./components/NavbarB2B";
import FooterB2B from "./components/FooterB2B";

// Eagerly loaded public pages (small, frequently accessed)
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import TermsAndConditions from "./pages/TermsAndConditions";
import PrivacyPolicy from "./pages/PrivacyPolicy";

// Lazy loaded pages (reduces initial bundle)
const Auth = lazy(() => import("./pages/Auth"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Manufacturing = lazy(() => import("./pages/Manufacturing"));
const Compliance = lazy(() => import("./pages/Compliance"));
const ExportBrochure = lazy(() => import("./pages/ExportBrochure"));
const ProductShowcase = lazy(() => import("./pages/ProductShowcase"));
const WomensNightwear = lazy(() => import("./pages/products/WomensNightwear"));
const KidswearColorfulSets = lazy(() => import("./pages/products/KidswearColorfulSets"));
const CottonTshirts = lazy(() => import("./pages/products/CottonTshirts"));
const PyjamasCasualWear = lazy(() => import("./pages/products/PyjamasCasualWear"));
const InnerwearBasics = lazy(() => import("./pages/products/InnerwearBasics"));
const ExportToUAE = lazy(() => import("./pages/export/ExportToUAE"));
const ExportToSaudiArabia = lazy(() => import("./pages/export/ExportToSaudiArabia"));
const ExportToSouthAfrica = lazy(() => import("./pages/export/ExportToSouthAfrica"));
const Disclaimer = lazy(() => import("./pages/Disclaimer"));
const ShippingExportPolicy = lazy(() => import("./pages/ShippingExportPolicy"));
const RefundCancellationPolicy = lazy(() => import("./pages/RefundCancellationPolicy"));
const SizeGuide = lazy(() => import("./pages/SizeGuide"));

// Heavy admin module - lazy loaded (contains jsPDF, fabric, recharts)
const Admin = lazy(() => import("./pages/Admin"));

// Market Intel App - lazy loaded
const MarketIntelApp = lazy(() => import("./pages/market-intel/MarketIntelApp"));

const queryClient = new QueryClient();

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      <p className="text-muted-foreground text-sm">Loading...</p>
    </div>
  </div>
);

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            {/* Admin Routes - No Navbar/Footer, Lazy Loaded */}
            <Route path="/admin/*" element={
              <Suspense fallback={<PageLoader />}>
                <Admin />
              </Suspense>
            } />
            
            {/* Market Intel App - Standalone Mobile-First App, Lazy Loaded */}
            <Route path="/market-intel/*" element={
              <Suspense fallback={<PageLoader />}>
                <MarketIntelApp />
              </Suspense>
            } />
            
            {/* Public Routes - With B2B Navbar/Footer */}
            <Route
              path="*"
              element={
                <div className="flex flex-col min-h-screen">
                  <NavbarB2B />
                  <main className="flex-1 pt-[76px]">
                    <Suspense fallback={<PageLoader />}>
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/products" element={<ProductShowcase />} />
                        <Route path="/products/womens-nightwear" element={<WomensNightwear />} />
                        <Route path="/products/kidswear-colorful-sets" element={<KidswearColorfulSets />} />
                        <Route path="/products/cotton-tshirts" element={<CottonTshirts />} />
                        <Route path="/products/pyjamas-casual-wear" element={<PyjamasCasualWear />} />
                        <Route path="/products/innerwear-basics" element={<InnerwearBasics />} />
                        <Route path="/manufacturing" element={<Manufacturing />} />
                        <Route path="/compliance" element={<Compliance />} />
                        <Route path="/export-brochure" element={<ExportBrochure />} />
                        <Route path="/export-garments-to-uae" element={<ExportToUAE />} />
                        <Route path="/export-garments-to-saudi-arabia" element={<ExportToSaudiArabia />} />
                        <Route path="/export-garments-to-south-africa" element={<ExportToSouthAfrica />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/auth" element={<Auth />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password" element={<ResetPassword />} />
                        <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
                        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                        <Route path="/disclaimer" element={<Disclaimer />} />
                        <Route path="/shipping-export-policy" element={<ShippingExportPolicy />} />
                        <Route path="/refund-cancellation-policy" element={<RefundCancellationPolicy />} />
                        <Route path="/size-guide" element={<SizeGuide />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Suspense>
                  </main>
                  <FooterB2B />
                </div>
              }
            />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
