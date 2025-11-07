import { MenProductLayout } from "@/components/men/MenProductLayout";
import heroImage from "@/assets/men-hero-model.jpg";
import productImage from "@/assets/men-full-sleeve-collection.jpg";

export default function MenFullSleeveTShirt() {
  const measurements = [
    { size: "S", chest: "38", height: "27", sleeve: "23" },
    { size: "M", chest: "40", height: "28", sleeve: "24" },
    { size: "L", chest: "42", height: "29", sleeve: "25" },
    { size: "XL", chest: "44", height: "30", sleeve: "26" },
    { size: "XXL", chest: "46", height: "31", sleeve: "27" },
    { size: "XXXL", chest: "48", height: "32", sleeve: "28" },
  ];

  const specifications = [
    { label: "FABRIC", value: "Pure Cotton, Linen, Organic Cotton, Polyester, Combed Cotton" },
    { label: "COLORS", value: "Black, Navy Blue, Olive Green, Burgundy, Charcoal Grey, White" },
    { label: "GSM", value: "140, 160, 180, 200, 220, 240, 280 GSM available" },
    { label: "MOQ", value: "25 pcs & above in single color/style" },
    { label: "STYLE", value: "Round Neck | V Neck | Henley | Polo Collar" },
    { label: "SHIPMENT", value: "10 – 15 business days" },
  ];

  return (
    <MenProductLayout
      title="Men's Full Sleeve T-Shirt"
      subtitle="Garment Buying Office in Tirupur, India"
      description="We are experienced men full sleeve t-shirt export company in Tirupur, India. We manufacture and export the finest quality men full sleeve t-shirt all over the world."
      heroImage={heroImage}
      productImage={productImage}
      measurements={measurements}
      specifications={specifications}
      heroGradient="from-slate-900 via-blue-900 to-slate-900"
    />
  );
}
