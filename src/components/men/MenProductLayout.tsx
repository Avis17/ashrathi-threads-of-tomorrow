import { ReactNode } from "react";
import { MeasurementChart } from "@/components/women/MeasurementChart";
import { Sparkles, Zap, Shield, Truck } from "lucide-react";

interface MeasurementData {
  size: string;
  chest?: string;
  height?: string;
  waist?: string;
  sleeve?: string;
}

interface SpecificationItem {
  label: string;
  value: string;
}

interface MenProductLayoutProps {
  title: string;
  subtitle: string;
  description: string;
  heroImage: string;
  productImage: string;
  measurements: MeasurementData[];
  specifications: SpecificationItem[];
  heroGradient?: string;
}

export function MenProductLayout({
  title,
  subtitle,
  description,
  heroImage,
  productImage,
  measurements,
  specifications,
  heroGradient = "from-slate-900 via-slate-800 to-slate-900"
}: MenProductLayoutProps) {
  const features = [
    { Icon: Sparkles, label: "Premium Quality", desc: "100% Cotton Fabric" },
    { Icon: Zap, label: "Fast Production", desc: "10-15 Days Delivery" },
    { Icon: Shield, label: "Durable", desc: "Long-lasting Wear" },
    { Icon: Truck, label: "Bulk Orders", desc: "Wholesale Available" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Model */}
      <section className={`relative bg-gradient-to-br ${heroGradient} overflow-hidden`}>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>
        
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div className="text-white space-y-6 animate-fade-in">
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                {title}
              </h1>
              <p className="text-xl md:text-2xl text-gray-300">
                {subtitle}
              </p>
              <p className="text-lg text-gray-400 leading-relaxed">
                {description}
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <a
                  href="/contact"
                  className="inline-block bg-secondary text-secondary-foreground px-8 py-4 rounded-lg font-semibold text-lg hover:bg-secondary/90 transition-all shadow-lg hover:shadow-xl hover:scale-105"
                >
                  Request Quote
                </a>
                <a
                  href="/bulk-order"
                  className="inline-block bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white/20 transition-all"
                >
                  Bulk Orders
                </a>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 to-primary/20 rounded-3xl blur-3xl"></div>
              <img
                src={heroImage}
                alt={title}
                className="relative rounded-3xl shadow-2xl w-full object-cover animate-scale-in"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {features.map(({ Icon, label, desc }, idx) => (
              <div
                key={idx}
                className="group p-6 rounded-2xl bg-background border-2 border-border hover:border-secondary transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                <Icon className="w-10 h-10 text-secondary mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-bold text-lg mb-1">{label}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Showcase */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Our Collection
              </h2>
              <p className="text-xl text-muted-foreground">
                Premium quality garments in various colors and styles
              </p>
            </div>
            <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-border hover:border-secondary transition-colors duration-500">
              <img
                src={productImage}
                alt="Product Collection"
                className="w-full object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Measurement Chart */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <MeasurementChart
            measurements={measurements}
            specifications={specifications}
            productType={title}
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Ready to Order?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Contact us for bulk orders, custom designs, and competitive wholesale pricing
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="/contact"
              className="inline-block bg-secondary text-secondary-foreground px-10 py-5 rounded-lg font-semibold text-lg hover:bg-secondary/90 transition-all shadow-xl hover:scale-105"
            >
              Get Quote Now
            </a>
            <a
              href="tel:+919994325784"
              className="inline-block bg-white text-slate-900 px-10 py-5 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all shadow-xl hover:scale-105"
            >
              Call Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
