import { MenProductLayout } from "@/components/men/MenProductLayout";
import heroImage from "@/assets/men-hero-model.jpg";
import productImage from "@/assets/men-striped-collection.jpg";

export default function MenStripedTShirt() {
  const measurements = [
    { size: "S", chest: "38", height: "27" },
    { size: "M", chest: "40", height: "28" },
    { size: "L", chest: "42", height: "29" },
    { size: "XL", chest: "44", height: "30" },
    { size: "XXL", chest: "46", height: "31" },
    { size: "XXXL", chest: "48", height: "32" },
  ];

  const specifications = [
    { label: "FABRIC", value: "Premium Cotton, Cotton Blend, Single Jersey" },
    { label: "STRIPE PATTERN", value: "Horizontal, Vertical, Diagonal, Multi-color" },
    { label: "COLORS", value: "Navy-White, Black-Grey, Red-White, Blue-White" },
    { label: "MOQ", value: "25 pcs & above in single color/style" },
    { label: "GSM", value: "160, 180, 200 GSM for classic fit" },
    { label: "SHIPMENT", value: "10 – 15 business days" },
  ];

  return (
    <MenProductLayout
      title="Men's Striped T-Shirt"
      subtitle="Classic Striped T-Shirt Collection"
      description="Timeless striped t-shirts that never go out of style. Our striped collection features classic horizontal stripes in various color combinations, perfect for casual and semi-formal wear."
      heroImage={heroImage}
      productImage={productImage}
      measurements={measurements}
      specifications={specifications}
      heroGradient="from-indigo-900 via-blue-900 to-indigo-900"
    />
  );
}
