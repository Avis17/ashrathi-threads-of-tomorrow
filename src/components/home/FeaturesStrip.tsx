import { Truck, Shield, RefreshCw, Headphones } from "lucide-react";

const features = [
  {
    icon: Truck,
    title: "Free Shipping",
    description: "On orders above ₹999",
  },
  {
    icon: Shield,
    title: "Premium Quality",
    description: "100% Original Products",
  },
  {
    icon: RefreshCw,
    title: "Easy Returns",
    description: "7 Days Return Policy",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "Dedicated Customer Care",
  },
];

const FeaturesStrip = () => {
  return (
    <section className="bg-foreground py-8">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="flex items-center gap-4 justify-center md:justify-start"
            >
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                <feature.icon className="w-5 h-5 text-accent" />
              </div>
              <div className="hidden sm:block">
                <h4 className="font-medium text-background text-sm">{feature.title}</h4>
                <p className="text-background/60 text-xs">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesStrip;
