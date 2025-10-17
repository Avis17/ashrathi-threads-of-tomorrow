import { MeasurementChart } from "@/components/women/MeasurementChart";

export default function WomenLongSleeveTShirt() {
  const measurements = [
    { size: "XS", chest: "38", height: "26", sleeve: "22" },
    { size: "S", chest: "40", height: "27", sleeve: "23" },
    { size: "M", chest: "42", height: "28", sleeve: "24" },
    { size: "L", chest: "44", height: "29", sleeve: "25" },
    { size: "XL", chest: "46", height: "30", sleeve: "26" },
    { size: "XXL", chest: "48", height: "31", sleeve: "27" },
    { size: "XXXL", chest: "50", height: "32", sleeve: "28" },
  ];

  const specifications = [
    { label: "FABRIC", value: "Cotton" },
    { label: "SPECIAL", value: "Bio Washed" },
    { label: "SIZES", value: "Small | Medium | Large | Extra Large" },
    { label: "MOQ", value: "25 pcs * & above in single color/style" },
    { label: "STYLE", value: "Round Neck | V Neck | Crew Neck" },
    { label: "SHIPMENT", value: "In 10 – 15 business days" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-orange-400/30 via-yellow-400/30 to-orange-400/30 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 animate-fade-in">
            WOMEN'S LONG SLEEVE T-SHIRT MANUFACTURING COMPANY IN TIRUPUR
          </h1>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8">
              WOMEN'S LONG SLEEVE T-SHIRT MANUFACTURER IN TIRUPUR, INDIA
            </h2>
            <p className="text-lg text-muted-foreground text-center leading-relaxed">
              We are women long sleeve t-shirt manufacturers, women long sleeve t-shirt exporter, women long sleeve t-shirt supplier, women long sleeve t-shirt wholesalers in Tirupur, India. We are best women long sleeve t-shirt manufacturer with premium quality fabrics, exotic colors, 100% cotton raw materials in Tirupur. We manufacture women long sleeve t-shirt with different styles like women round neck t-shirt, women v neck t-shirt, women plain t-shirt and export to all over the world. Feather Fashions is the best women long sleeve t-shirt manufacturer, supplier and export company in Tirupur, India.
            </p>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-6xl mx-auto">
            {[
              { name: "Red", color: "bg-red-600" },
              { name: "Plum", color: "bg-purple-400" },
              { name: "White", color: "bg-white border-2 border-gray-200" },
              { name: "Navy Blue", color: "bg-blue-900" },
              { name: "Black Stripe", color: "bg-gradient-to-r from-black via-white to-black" },
              { name: "Blue Stripe", color: "bg-gradient-to-r from-blue-400 to-blue-200" },
              { name: "Pink", color: "bg-pink-300" },
              { name: "Beige", color: "bg-amber-200" },
            ].map((item, idx) => (
              <div
                key={idx}
                className="aspect-square rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all hover:scale-105 cursor-pointer"
              >
                <div className={`w-full h-full ${item.color} flex items-center justify-center`}>
                  <div className="w-3/4 h-3/4 bg-white/10 rounded-lg backdrop-blur-sm"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Measurement Chart Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <MeasurementChart
            measurements={measurements}
            specifications={specifications}
            productType="Women's Long Sleeve T-Shirt"
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Place Your Order?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Contact us today for bulk orders, custom designs, and competitive pricing
          </p>
          <a
            href="/contact"
            className="inline-block bg-secondary text-secondary-foreground px-8 py-4 rounded-lg font-semibold text-lg hover:bg-secondary/90 transition-colors shadow-lg"
          >
            Get in Touch
          </a>
        </div>
      </section>
    </div>
  );
}
