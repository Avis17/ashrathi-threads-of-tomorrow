import { MenProductLayout } from "@/components/men/MenProductLayout";
import heroImage from "@/assets/men-hero-model.jpg";
import productImage from "@/assets/men-vneck-collection.jpg";

export default function MenVNeckTShirt() {
  const measurements = [
    { size: "S", chest: "38", height: "27" },
    { size: "M", chest: "40", height: "28" },
    { size: "L", chest: "42", height: "29" },
    { size: "XL", chest: "44", height: "30" },
    { size: "XXL", chest: "46", height: "31" },
    { size: "XXXL", chest: "48", height: "32" },
  ];

  const specifications = [
    { label: "FABRIC", value: "100% Cotton, Premium Combed Cotton, Soft Jersey" },
    { label: "NECK STYLE", value: "Classic V-Neck, Deep V-Neck, Slim V-Neck" },
    { label: "COLORS", value: "Black, White, Grey, Navy Blue, Maroon, Charcoal" },
    { label: "MOQ", value: "25 pcs & above in single color/style" },
    { label: "GSM", value: "160, 180, 200, 220 GSM" },
    { label: "SHIPMENT", value: "10 – 15 business days" },
  ];

  return (
    <MenProductLayout
      title="Men's V-Neck T-Shirt"
      subtitle="Sophisticated V-Neck Collection"
      description="Our V-neck t-shirts offer a sophisticated look with premium comfort. Perfect for layering or wearing solo, these tees combine style with breathability in various solid colors."
      heroImage={heroImage}
      productImage={productImage}
      measurements={measurements}
      specifications={specifications}
      heroGradient="from-gray-900 via-slate-800 to-gray-900"
    />
  );
}
