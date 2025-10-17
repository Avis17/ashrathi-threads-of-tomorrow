import { MeasurementChart } from "@/components/women/MeasurementChart";
import { Sparkles, Heart, Award, TrendingUp } from "lucide-react";

interface VibrantLayoutProps {
  title: string;
  subtitle: string;
  description: string;
  heroImage: string;
  measurements: Array<{
    size: string;
    chest?: string;
    height?: string;
    waist?: string;
    hips?: string;
  }>;
  specifications: Array<{
    label: string;
    value: string;
  }>;
  gradientFrom: string;
  gradientVia: string;
  gradientTo: string;
  accentColor: string;
}

export function VibrantCategoryLayout({
  title,
  subtitle,
  description,
  heroImage,
  measurements,
  specifications,
  gradientFrom,
  gradientVia,
  gradientTo,
  accentColor
}: VibrantLayoutProps) {
  const features = [
    { Icon: Sparkles, label: "Premium Quality", color: "text-yellow-500" },
    { Icon: Heart, label: "Customer Favorite", color: "text-pink-500" },
    { Icon: Award, label: "Award Winning", color: "text-purple-500" },
    { Icon: TrendingUp, label: "Best Selling", color: "text-green-500" }
  ];

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Vibrant Hero Section */}
      <section className={`relative bg-gradient-to-br ${gradientFrom} ${gradientVia} ${gradientTo} py-24 overflow-hidden`}>
        {/* Animated background shapes */}
        <div className="absolute inset-0 opacity-20">
          <div className={`absolute top-20 left-10 w-72 h-72 ${accentColor} rounded-full blur-3xl animate-pulse`}></div>
          <div className={`absolute bottom-20 right-10 w-96 h-96 ${accentColor} rounded-full blur-3xl animate-pulse delay-1000`}></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto space-y-6 mb-12 animate-fade-in">
            <h1 className="text-6xl md:text-7xl font-black text-white drop-shadow-2xl leading-tight">
              {title}
            </h1>
            <p className="text-2xl md:text-3xl text-white/90 font-semibold">
              {subtitle}
            </p>
            <p className="text-lg md:text-xl text-white/80 leading-relaxed max-w-2xl mx-auto">
              {description}
            </p>
            <div className="flex flex-wrap gap-4 justify-center pt-6">
              <a
                href="/contact"
                className={`inline-block bg-white text-gray-900 px-10 py-5 rounded-full font-bold text-lg shadow-2xl hover:scale-110 transition-all duration-300 hover:shadow-[0_20px_60px_rgba(255,255,255,0.4)]`}
              >
                Get Started
              </a>
              <a
                href="/bulk-order"
                className="inline-block bg-white/20 backdrop-blur-md text-white border-3 border-white/40 px-10 py-5 rounded-full font-bold text-lg hover:bg-white/30 transition-all duration-300 hover:scale-110"
              >
                Bulk Orders
              </a>
            </div>
          </div>

          {/* Hero Image with floating animation */}
          <div className="max-w-5xl mx-auto">
            <div className="relative group">
              <div className={`absolute -inset-4 ${accentColor} opacity-50 blur-2xl group-hover:opacity-75 transition-opacity duration-500`}></div>
              <img
                src={heroImage}
                alt={title}
                className="relative rounded-3xl shadow-2xl w-full transform group-hover:scale-[1.02] transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section with colorful cards */}
      <section className="py-20 bg-gradient-to-b from-background to-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {features.map(({ Icon, label, color }, idx) => (
              <div
                key={idx}
                className="group p-8 rounded-3xl bg-gradient-to-br from-white to-gray-50 border-2 border-transparent hover:border-current transition-all duration-300 hover:scale-110 hover:shadow-2xl cursor-pointer"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <Icon className={`w-12 h-12 ${color} mb-4 group-hover:scale-125 transition-transform duration-300`} />
                <h3 className="font-bold text-lg text-gray-900">{label}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className={`py-20 bg-gradient-to-r ${gradientFrom} ${gradientVia} ${gradientTo} text-white`}>
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h2 className="text-4xl md:text-5xl font-black mb-6">
              Why Choose Us?
            </h2>
            <div className="grid md:grid-cols-3 gap-8 text-left">
              <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl hover:bg-white/20 transition-all hover:scale-105">
                <h3 className="text-2xl font-bold mb-3">💯 Quality First</h3>
                <p className="text-white/90">Premium fabrics and expert craftsmanship in every piece</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl hover:bg-white/20 transition-all hover:scale-105">
                <h3 className="text-2xl font-bold mb-3">🚀 Fast Delivery</h3>
                <p className="text-white/90">Quick turnaround time for all bulk orders</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl hover:bg-white/20 transition-all hover:scale-105">
                <h3 className="text-2xl font-bold mb-3">🎨 Custom Designs</h3>
                <p className="text-white/90">Personalize with your colors, logos, and styles</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Measurement Chart Section */}
      <section className="py-20 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4">
          <MeasurementChart
            measurements={measurements}
            specifications={specifications}
            productType={title}
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className={`py-24 bg-gradient-to-br ${gradientFrom} ${gradientVia} ${gradientTo} relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-10">
          <div className={`absolute top-0 left-0 w-full h-full ${accentColor} animate-pulse`}></div>
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-5xl md:text-6xl font-black text-white mb-6">
            Ready to Order?
          </h2>
          <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-2xl mx-auto">
            Get competitive pricing and bulk discounts for your custom orders
          </p>
          <div className="flex flex-wrap gap-6 justify-center">
            <a
              href="/contact"
              className="inline-block bg-white text-gray-900 px-12 py-6 rounded-full font-black text-xl shadow-2xl hover:scale-110 transition-all duration-300 hover:shadow-[0_20px_80px_rgba(255,255,255,0.5)]"
            >
              Contact Us Now
            </a>
            <a
              href="tel:+919994325784"
              className="inline-block bg-white/20 backdrop-blur-md text-white border-3 border-white px-12 py-6 rounded-full font-black text-xl hover:bg-white/30 transition-all duration-300 hover:scale-110"
            >
              📞 Call Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
