import Footer from "@/components/Footer";
import { VibrantCategoryLayout } from "@/components/category/VibrantCategoryLayout";
import exportSurplusImage from "@/assets/export-surplus-collection.jpg";

const ExportSurplus = () => {
  const measurements = [
    { size: "S", chest: "36-38", waist: "30-32" },
    { size: "M", chest: "40-42", waist: "34-36" },
    { size: "L", chest: "44-46", waist: "38-40" },
    { size: "XL", chest: "48-50", waist: "42-44" },
    { size: "XXL", chest: "52-54", waist: "46-48" }
  ];

  const specifications = [
    { label: "Quality", value: "International brand standards" },
    { label: "Authenticity", value: "Genuine export surplus garments" },
    { label: "Brands", value: "Wide selection from top labels" },
    { label: "Value", value: "Premium quality at unbeatable prices" },
    { label: "Length", value: "27-32 inches (varies by size)" }
  ];

  return (
    <div className="min-h-screen flex flex-col">
        <VibrantCategoryLayout
          title="Export Surplus Collection"
          subtitle="International Quality, Local Prices"
          description="Unlock exceptional value with our curated export surplus collection. Featuring authentic garments from renowned international brands, our selection offers you premium quality, contemporary styles, and unbeatable prices. Experience global fashion without the premium price tag."
          heroImage={exportSurplusImage}
          measurements={measurements}
          specifications={specifications}
          gradientFrom="from-orange-600"
          gradientVia="via-red-500"
          gradientTo="to-pink-600"
          accentColor="bg-orange-400"
        />
        <Footer />
    </div>
  );
};

export default ExportSurplus;
