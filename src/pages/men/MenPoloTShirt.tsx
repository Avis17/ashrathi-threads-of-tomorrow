import { MenProductLayout } from "@/components/men/MenProductLayout";
import heroImage from "@/assets/men-hero-model.jpg";
import productImage from "@/assets/men-polo-collection.jpg";

export default function MenPoloTShirt() {
  const measurements = [
    { size: "S", chest: "38", height: "27" },
    { size: "M", chest: "40", height: "28" },
    { size: "L", chest: "42", height: "29" },
    { size: "XL", chest: "44", height: "30" },
    { size: "XXL", chest: "46", height: "31" },
    { size: "XXXL", chest: "48", height: "32" },
  ];

  const specifications = [
    { label: "FABRIC", value: "Cotton Pique, Jersey, Polyester Blend" },
    { label: "COLORS", value: "Royal Blue, Black, White, Forest Green, Burgundy, Navy" },
    { label: "GSM", value: "180, 200, 220, 240 GSM for premium quality" },
    { label: "MOQ", value: "25 pcs & above in single color/style" },
    { label: "COLLAR", value: "Classic Polo Collar with Button Placket" },
    { label: "SHIPMENT", value: "10 – 15 business days" },
  ];

  return (
    <MenProductLayout
      title="Men's Polo T-Shirt"
      subtitle="Premium Polo T-Shirt Manufacturer"
      description="We manufacture high-quality men's polo t-shirts with premium pique fabric. Perfect for corporate wear, sports teams, and casual elegance. Available in various colors with customization options."
      heroImage={heroImage}
      productImage={productImage}
      measurements={measurements}
      specifications={specifications}
      heroGradient="from-emerald-900 via-teal-900 to-emerald-900"
    />
  );
}
