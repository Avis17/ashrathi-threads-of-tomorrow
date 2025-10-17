import { MeasurementChart } from "@/components/women/MeasurementChart";
import productImage from "@/assets/women-polo-collection.jpg";

export default function WomenPoloTShirt() {
  const measurements = [
    { size: "XS", chest: "38", height: "26" },
    { size: "S", chest: "40", height: "27" },
    { size: "M", chest: "42", height: "28" },
    { size: "L", chest: "44", height: "29" },
    { size: "XL", chest: "46", height: "30" },
    { size: "XXL", chest: "48", height: "31" },
    { size: "XXXL", chest: "50", height: "32" },
  ];

  const specifications = [
    { label: "FABRIC", value: "Cotton Pique / Jersey" },
    { label: "SPECIAL", value: "Bio Washed" },
    { label: "SIZES", value: "Small | Medium | Large | Extra Large" },
    { label: "MOQ", value: "25 pcs * & above in single color/style" },
    { label: "STYLE", value: "Classic Polo | Sports Polo | Casual Polo" },
    { label: "SHIPMENT", value: "In 10 – 15 business days" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-purple-600/30 via-fuchsia-600/30 to-purple-600/30 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 animate-fade-in">
            WOMEN'S POLO T-SHIRT MANUFACTURING COMPANY IN TIRUPUR
          </h1>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8">
              WOMEN'S POLO T-SHIRT MANUFACTURER IN TIRUPUR, INDIA
            </h2>
            <p className="text-lg text-muted-foreground text-center leading-relaxed">
              We are women Polo t-shirt manufacturers, women Polo t-shirt exporter, women Polo t-shirt supplier, women Polo t-shirt wholesalers in Tirupur, India. We are best women Polo t-shirt manufacturer with premium quality fabrics, exotic colors, 100% cotton raw materials in Tirupur. We manufacture women Polo t-shirt with different styles like women round neck t-shirt, women v neck t-shirt, women plain t-shirt and export to all over the world. Feather Fashions is the best women Polo t-shirt manufacturer, supplier and export company in Tirupur, India.
            </p>
          </div>

          {/* Product Image */}
          <div className="mt-16 max-w-6xl mx-auto">
            <img 
              src={productImage} 
              alt="Women's Polo T-Shirt Collection" 
              className="w-full rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* Measurement Chart Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <MeasurementChart
            measurements={measurements}
            specifications={specifications}
            productType="Women's Polo T-Shirt"
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
