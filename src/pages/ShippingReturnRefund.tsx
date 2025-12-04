import { Helmet } from "react-helmet";
import { Truck, RotateCcw, CreditCard, Phone, Mail, Clock } from "lucide-react";

const ShippingReturnRefund = () => {
  return (
    <div className="py-12 px-4 md:px-8 lg:px-16 bg-background">
      <Helmet>
        <title>Shipping, Return & Refund Policy | Feather Fashions</title>
        <meta name="description" content="Learn about Feather Fashions shipping, return and refund policies." />
      </Helmet>
      
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8">Shipping, Return & Refund Policy</h1>
        
        <div className="grid gap-8 md:grid-cols-3 mb-12">
          {/* Shipping Policy */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Truck className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-3">Shipping Policy</h2>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4 text-secondary" />
              <span>3-4 Working Days</span>
            </div>
            <p className="text-sm text-muted-foreground mt-3">
              Your order will be delivered within 3-4 working days from the date of order confirmation.
            </p>
          </div>

          {/* Return Policy */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <RotateCcw className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-3">Return Policy</h2>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4 text-secondary" />
              <span>3-4 Working Days</span>
            </div>
            <p className="text-sm text-muted-foreground mt-3">
              Returns can be initiated within 3-4 working days after receiving your order.
            </p>
          </div>

          {/* Refund Policy */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <CreditCard className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-3">Refund Policy</h2>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4 text-secondary" />
              <span>3-4 Working Days</span>
            </div>
            <p className="text-sm text-muted-foreground mt-3">
              Refund amount will be credited within 3-4 working days to your original payment method.
            </p>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-8">
          <h2 className="text-2xl font-semibold text-foreground mb-4 text-center">Need Assistance?</h2>
          <p className="text-muted-foreground text-center mb-6">
            For any queries regarding shipping, returns or refunds, please contact us:
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <a 
              href="tel:8754879824" 
              className="flex items-center gap-3 bg-card px-6 py-3 rounded-lg border border-border hover:border-secondary transition-colors"
            >
              <Phone className="w-5 h-5 text-secondary" />
              <span className="font-medium text-foreground">8754879824</span>
            </a>
            <a 
              href="mailto:info.featherfashions@gmail.com" 
              className="flex items-center gap-3 bg-card px-6 py-3 rounded-lg border border-border hover:border-secondary transition-colors"
            >
              <Mail className="w-5 h-5 text-secondary" />
              <span className="font-medium text-foreground">info.featherfashions@gmail.com</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShippingReturnRefund;
