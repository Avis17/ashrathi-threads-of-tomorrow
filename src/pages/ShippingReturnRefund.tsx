import { Helmet } from "react-helmet";
import { Truck, RotateCcw, CreditCard, Phone, Mail, Clock, ArrowRight } from "lucide-react";

const ShippingReturnRefund = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Shipping, Return & Refund Policy | Feather Fashions</title>
        <meta name="description" content="Learn about Feather Fashions shipping, return and refund policies." />
      </Helmet>
      
      {/* Hero Section */}
      <section className="relative bg-[#0A0A0A] text-white py-24 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/80" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 text-center">
          <p className="text-[#D4AF37] uppercase tracking-[0.3em] text-sm font-medium mb-6 animate-fade-in">
            Customer Care
          </p>
          <h1 className="font-playfair text-4xl md:text-6xl lg:text-7xl font-light mb-6 tracking-tight">
            Shipping, Returns & Refunds
          </h1>
          <p className="text-white/70 text-lg md:text-xl max-w-2xl mx-auto font-light">
            We're committed to making your shopping experience seamless from start to finish.
          </p>
        </div>
      </section>

      {/* Policy Cards */}
      <section className="py-20 md:py-28 px-6 md:px-12 bg-[#FAFAF8]">
        <div className="max-w-7xl mx-auto">
          <div className="grid gap-8 md:grid-cols-3">
            {/* Shipping Card */}
            <div className="group bg-white rounded-2xl p-10 shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100">
              <div className="w-16 h-16 bg-[#0A0A0A] rounded-full flex items-center justify-center mb-8 group-hover:bg-[#D4AF37] transition-colors duration-500">
                <Truck className="w-7 h-7 text-white" />
              </div>
              <h2 className="font-playfair text-2xl text-[#0A0A0A] mb-4">Shipping Policy</h2>
              <div className="flex items-center gap-2 text-[#D4AF37] mb-6">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium uppercase tracking-wider">3-4 Working Days</span>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Your order will be carefully packaged and delivered within 3-4 working days from the date of order confirmation. We partner with trusted logistics providers to ensure safe delivery.
              </p>
              <div className="mt-8 pt-6 border-t border-gray-100">
                <ul className="space-y-3 text-sm text-gray-500">
                  <li className="flex items-center gap-2">
                    <ArrowRight className="w-3 h-3 text-[#D4AF37]" />
                    Free shipping on orders above ₹999
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight className="w-3 h-3 text-[#D4AF37]" />
                    Real-time tracking available
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight className="w-3 h-3 text-[#D4AF37]" />
                    Pan-India delivery
                  </li>
                </ul>
              </div>
            </div>

            {/* Return Card */}
            <div className="group bg-white rounded-2xl p-10 shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100">
              <div className="w-16 h-16 bg-[#0A0A0A] rounded-full flex items-center justify-center mb-8 group-hover:bg-[#D4AF37] transition-colors duration-500">
                <RotateCcw className="w-7 h-7 text-white" />
              </div>
              <h2 className="font-playfair text-2xl text-[#0A0A0A] mb-4">Return Policy</h2>
              <div className="flex items-center gap-2 text-[#D4AF37] mb-6">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium uppercase tracking-wider">3-4 Working Days</span>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Returns can be initiated within 3-4 working days after receiving your order. Items must be unworn, unwashed, and in original packaging with all tags attached.
              </p>
              <div className="mt-8 pt-6 border-t border-gray-100">
                <ul className="space-y-3 text-sm text-gray-500">
                  <li className="flex items-center gap-2">
                    <ArrowRight className="w-3 h-3 text-[#D4AF37]" />
                    Easy return request process
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight className="w-3 h-3 text-[#D4AF37]" />
                    Free pickup from your location
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight className="w-3 h-3 text-[#D4AF37]" />
                    Quality check within 24 hours
                  </li>
                </ul>
              </div>
            </div>

            {/* Refund Card */}
            <div className="group bg-white rounded-2xl p-10 shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100">
              <div className="w-16 h-16 bg-[#0A0A0A] rounded-full flex items-center justify-center mb-8 group-hover:bg-[#D4AF37] transition-colors duration-500">
                <CreditCard className="w-7 h-7 text-white" />
              </div>
              <h2 className="font-playfair text-2xl text-[#0A0A0A] mb-4">Refund Policy</h2>
              <div className="flex items-center gap-2 text-[#D4AF37] mb-6">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium uppercase tracking-wider">3-4 Working Days</span>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Once your return is received and inspected, your refund will be processed within 3-4 working days and credited to your original payment method.
              </p>
              <div className="mt-8 pt-6 border-t border-gray-100">
                <ul className="space-y-3 text-sm text-gray-500">
                  <li className="flex items-center gap-2">
                    <ArrowRight className="w-3 h-3 text-[#D4AF37]" />
                    Full refund to original payment method
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight className="w-3 h-3 text-[#D4AF37]" />
                    Email confirmation on processing
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight className="w-3 h-3 text-[#D4AF37]" />
                    Bank processing may take 5-7 days
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 md:py-28 px-6 md:px-12 bg-[#0A0A0A]">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[#D4AF37] uppercase tracking-[0.3em] text-sm font-medium mb-6">
            We're Here to Help
          </p>
          <h2 className="font-playfair text-3xl md:text-5xl text-white mb-6">
            Need Assistance?
          </h2>
          <p className="text-white/60 text-lg mb-12 max-w-2xl mx-auto">
            Our customer care team is available to help you with any questions regarding shipping, returns, or refunds.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <a 
              href="tel:8754879824" 
              className="group flex items-center gap-4 bg-white/5 backdrop-blur-sm px-8 py-5 rounded-full border border-white/10 hover:border-[#D4AF37]/50 hover:bg-white/10 transition-all duration-300 w-full sm:w-auto justify-center"
            >
              <div className="w-12 h-12 bg-[#D4AF37] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Phone className="w-5 h-5 text-[#0A0A0A]" />
              </div>
              <div className="text-left">
                <p className="text-white/50 text-xs uppercase tracking-wider mb-1">Call Us</p>
                <span className="font-medium text-white text-lg">8754879824</span>
              </div>
            </a>
            
            <a 
              href="mailto:info.featherfashions@gmail.com" 
              className="group flex items-center gap-4 bg-white/5 backdrop-blur-sm px-8 py-5 rounded-full border border-white/10 hover:border-[#D4AF37]/50 hover:bg-white/10 transition-all duration-300 w-full sm:w-auto justify-center"
            >
              <div className="w-12 h-12 bg-[#D4AF37] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Mail className="w-5 h-5 text-[#0A0A0A]" />
              </div>
              <div className="text-left">
                <p className="text-white/50 text-xs uppercase tracking-wider mb-1">Email Us</p>
                <span className="font-medium text-white text-lg">info.featherfashions@gmail.com</span>
              </div>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ShippingReturnRefund;
