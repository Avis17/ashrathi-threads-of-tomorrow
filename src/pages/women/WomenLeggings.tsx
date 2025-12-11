import { MeasurementChart } from "@/components/women/MeasurementChart";
import productImage from "@/assets/women-leggings-featured.jpg";

export default function WomenLeggings() {
  const measurements = [
    { size: "XS", waist: "24-26", hips: "34-36", height: "36" },
    { size: "S", waist: "26-28", hips: "36-38", height: "37" },
    { size: "M", waist: "28-30", hips: "38-40", height: "38" },
    { size: "L", waist: "30-32", hips: "40-42", height: "39" },
    { size: "XL", waist: "32-34", hips: "42-44", height: "40" },
    { size: "XXL", waist: "34-36", hips: "44-46", height: "41" },
    { size: "XXXL", waist: "36-38", hips: "46-48", height: "42" },
  ];

  const specifications = [
    { label: "FABRIC", value: "Cotton Lycra / Spandex Blend" },
    { label: "SPECIAL", value: "High Stretch & Breathable" },
    { label: "SIZES", value: "Small | Medium | Large | Extra Large" },
    { label: "MOQ", value: "25 pcs * & above in single color/style" },
    { label: "STYLE", value: "Full Length | Capri | Ankle Length" },
    { label: "SHIPMENT", value: "In 10 – 15 business days" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-slate-400/30 via-gray-400/30 to-slate-400/30 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 animate-fade-in">
            LEGGINGS MANUFACTURER IN Tirupur, INDIA
          </h1>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8">
            LEGGINGS MANUFACTURING COMPANY IN Tirupur
            </h2>
            <p className="text-lg text-muted-foreground text-center leading-relaxed mb-6">
              Our company is known as leading Women's leggings manufacturer, supplier, exporter in Tirupur. We have Women's leggings with various size, fabric, colors, leggings type and pattern.
            </p>
          </div>

          {/* Feature Section with Image */}
          <div className="grid md:grid-cols-2 gap-12 mt-16 max-w-6xl mx-auto items-center">
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src={productImage} 
                alt="Women's Leggings with Floral Pattern" 
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="space-y-6">
              <h3 className="text-3xl font-bold">BULK LEGGINGS IN Tirupur</h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Feather Fashions is a best Women's leggings manufacture, exporter, supplier and wholesalers in Tirupur, India. We are experienced ladies leggings manufacturer with quality range of cotton lycra leggings. We are Women's leggings manufacturers, Women's leggings exporter, Women's leggings supplier, Women's leggings wholesalers in Tirupur, India. We are Women's leggings manufacturer with premium quality fabrics, exotic colors, 100% cotton lycra raw materials in Tirupur. Feather Fashions is the best Women's leggings manufacturer, supplier and export company in Tirupur, India.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Our company is known as leading Women's leggings manufacturer, supplier, exporter in Tirupur. We have Women's leggings with various size, fabric, colors, leggings type and pattern.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Measurement Chart Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <MeasurementChart
            measurements={measurements}
            specifications={specifications}
            productType="Women's Leggings"
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
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="/contact"
              className="inline-block bg-secondary text-secondary-foreground px-8 py-4 rounded-lg font-semibold text-lg hover:bg-secondary/90 transition-colors shadow-lg"
            >
              Get in Touch
            </a>
            <a
              href="/size-guide"
              className="inline-block bg-primary text-primary-foreground px-8 py-4 rounded-lg font-semibold text-lg hover:bg-primary/90 transition-colors shadow-lg"
            >
              📏 Interactive Size Chart
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
