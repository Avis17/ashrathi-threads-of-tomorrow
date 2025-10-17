import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Products from "./pages/Products";
import Services from "./pages/Services";
import Collections from "./pages/Collections";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import BulkOrder from "./pages/BulkOrder";
import Checkout from "./pages/Checkout";
import MyOrders from "./pages/MyOrders";
import OrderDetails from "./pages/OrderDetails";
import CustomerProfile from "./pages/CustomerProfile";
import NotFound from "./pages/NotFound";
import WomenHalfSleeveTShirt from "./pages/women/WomenHalfSleeveTShirt";
import WomenLongSleeveTShirt from "./pages/women/WomenLongSleeveTShirt";
import WomenVNeckTShirt from "./pages/women/WomenVNeckTShirt";
import WomenPoloTShirt from "./pages/women/WomenPoloTShirt";
import WomenLeggings from "./pages/women/WomenLeggings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
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
                      <Route path="/products" element={<Products />} />
                      <Route path="/services" element={<Services />} />
                      <Route path="/collections" element={<Collections />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/bulk-order" element={<BulkOrder />} />
                      <Route path="/checkout" element={<Checkout />} />
                      <Route path="/my-orders" element={<MyOrders />} />
                      <Route path="/my-orders/:orderId" element={<OrderDetails />} />
                      <Route path="/profile" element={<CustomerProfile />} />
                      
                      {/* Women's Category Pages */}
                      <Route path="/women/half-sleeve-tshirt" element={<WomenHalfSleeveTShirt />} />
                      <Route path="/women/long-sleeve-tshirt" element={<WomenLongSleeveTShirt />} />
                      <Route path="/women/vneck-tshirt" element={<WomenVNeckTShirt />} />
                      <Route path="/women/polo-tshirt" element={<WomenPoloTShirt />} />
                      <Route path="/women/leggings" element={<WomenLeggings />} />
                      
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
