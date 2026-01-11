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
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import TermsAndConditions from "./pages/TermsAndConditions";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import MarketIntelApp from "./pages/market-intel/MarketIntelApp";
import Manufacturing from "./pages/Manufacturing";
import Compliance from "./pages/Compliance";
import ExportBrochure from "./pages/ExportBrochure";
import ProductShowcase from "./pages/ProductShowcase";
import ExportToUAE from "./pages/export/ExportToUAE";
import ExportToSaudiArabia from "./pages/export/ExportToSaudiArabia";
import ExportToSouthAfrica from "./pages/export/ExportToSouthAfrica";

const queryClient = new QueryClient();

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
            {/* Admin Routes - No Navbar/Footer */}
            <Route path="/admin/*" element={<Admin />} />
            
            {/* Market Intel App - Standalone Mobile-First App */}
            <Route path="/market-intel/*" element={<MarketIntelApp />} />
            
            {/* Public Routes - With B2B Navbar/Footer */}
            <Route
              path="*"
              element={
                <div className="flex flex-col min-h-screen">
                  <NavbarB2B />
                  <main className="flex-1 pt-[76px]">
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/products" element={<ProductShowcase />} />
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
                      <Route path="*" element={<NotFound />} />
                    </Routes>
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
