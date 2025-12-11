import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { ScrollToTop } from "./components/ScrollToTop";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Products from "./pages/Products";
import Services from "./pages/Services";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Admin from "./pages/Admin";
import BulkOrder from "./pages/BulkOrder";
import Checkout from "./pages/Checkout";
import MyOrders from "./pages/MyOrders";
import OrderDetails from "./pages/OrderDetails";
import ProductDetail from "./pages/ProductDetail";
import CustomerProfile from "./pages/CustomerProfile";
import Women from "./pages/Women";
import Men from "./pages/Men";
import Collections from "./pages/Collections";
import NotFound from "./pages/NotFound";
import WomenHalfSleeveTShirt from "./pages/women/WomenHalfSleeveTShirt";
import WomenLongSleeveTShirt from "./pages/women/WomenLongSleeveTShirt";
import WomenVNeckTShirt from "./pages/women/WomenVNeckTShirt";
import WomenPoloTShirt from "./pages/women/WomenPoloTShirt";
import WomenLeggings from "./pages/women/WomenLeggings";
import LeggingsSizeChart from "./pages/LeggingsSizeChart";
import LeggingsFeatures from "./pages/LeggingsFeatures";
import MenFullSleeveTShirt from "./pages/men/MenFullSleeveTShirt";
import MenPoloTShirt from "./pages/men/MenPoloTShirt";
import MenPrintedTShirt from "./pages/men/MenPrintedTShirt";
import MenStripedTShirt from "./pages/men/MenStripedTShirt";
import MenVNeckTShirt from "./pages/men/MenVNeckTShirt";
import CollegeApparel from "./pages/categories/CollegeApparel";
import UniformApparel from "./pages/categories/UniformApparel";
import EventApparel from "./pages/categories/EventApparel";
import SportsApparel from "./pages/categories/SportsApparel";
import KidsApparel from "./pages/categories/KidsApparel";
import CorporateApparel from "./pages/categories/CorporateApparel";
import Innerwear from "./pages/categories/Innerwear";
import Boxer from "./pages/categories/Boxer";
import TrackPants from "./pages/categories/TrackPants";
import ExportSurplus from "./pages/categories/ExportSurplus";
import TermsAndConditions from "./pages/TermsAndConditions";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import ShippingReturnRefund from "./pages/ShippingReturnRefund";
import PaymentCallback from "./pages/PaymentCallback";

const queryClient = new QueryClient();

const App = () => (
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
            
            {/* Public Routes - With Navbar/Footer */}
            <Route
              path="*"
              element={
                <div className="flex flex-col min-h-screen">
                  <Navbar />
                  <main className="flex-1">
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/shop" element={<Products />} />
                      <Route path="/products" element={<Products />} />
                      <Route path="/women" element={<Women />} />
                      <Route path="/men" element={<Men />} />
                      <Route path="/collections" element={<Collections />} />
          <Route path="/product/:id" element={<ProductDetail />} />
                      <Route path="/services" element={<Services />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/forgot-password" element={<ForgotPassword />} />
                      <Route path="/reset-password" element={<ResetPassword />} />
                      <Route path="/bulk-order" element={<BulkOrder />} />
                      <Route path="/checkout" element={<Checkout />} />
                      <Route path="/payment-callback" element={<PaymentCallback />} />
                      <Route path="/my-orders" element={<MyOrders />} />
                      <Route path="/my-orders/:orderId" element={<OrderDetails />} />
                      <Route path="/profile" element={<CustomerProfile />} />
                      
                      {/* Women's Category Pages */}
                      <Route path="/women/half-sleeve-tshirt" element={<WomenHalfSleeveTShirt />} />
                      <Route path="/women/long-sleeve-tshirt" element={<WomenLongSleeveTShirt />} />
                      <Route path="/women/vneck-tshirt" element={<WomenVNeckTShirt />} />
                      <Route path="/women/polo-tshirt" element={<WomenPoloTShirt />} />
                      <Route path="/women/leggings" element={<WomenLeggings />} />
                      <Route path="/size-chart/womens-leggings" element={<LeggingsSizeChart />} />
                      <Route path="/leggings-features" element={<LeggingsFeatures />} />
                      
                      {/* Men's Category Pages */}
                      <Route path="/men/full-sleeve-tshirt" element={<MenFullSleeveTShirt />} />
                      <Route path="/men/polo-tshirt" element={<MenPoloTShirt />} />
                      <Route path="/men/printed-tshirt" element={<MenPrintedTShirt />} />
                      <Route path="/men/striped-tshirt" element={<MenStripedTShirt />} />
                      <Route path="/men/vneck-tshirt" element={<MenVNeckTShirt />} />
                      
                      {/* Category Pages */}
                      <Route path="/categories/college" element={<CollegeApparel />} />
                      <Route path="/categories/uniform" element={<UniformApparel />} />
                      <Route path="/categories/event" element={<EventApparel />} />
                      <Route path="/categories/sports" element={<SportsApparel />} />
          <Route path="/categories/kids" element={<KidsApparel />} />
          <Route path="/categories/corporate" element={<CorporateApparel />} />
          <Route path="/categories/innerwear" element={<Innerwear />} />
          <Route path="/categories/boxer" element={<Boxer />} />
          <Route path="/categories/track-pants" element={<TrackPants />} />
          <Route path="/categories/export-surplus" element={<ExportSurplus />} />
                      <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
                      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                      <Route path="/shipping-return-refund" element={<ShippingReturnRefund />} />
                      
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </main>
                  <Footer />
                </div>
              }
            />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
