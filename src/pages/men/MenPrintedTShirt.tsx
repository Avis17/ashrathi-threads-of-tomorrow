import { MenProductLayout } from "@/components/men/MenProductLayout";
import heroImage from "@/assets/men-hero-model.jpg";
import productImage from "@/assets/men-printed-collection.jpg";

export default function MenPrintedTShirt() {
  const measurements = [
    { size: "S", chest: "38", height: "27" },
    { size: "M", chest: "40", height: "28" },
    { size: "L", chest: "42", height: "29" },
    { size: "XL", chest: "44", height: "30" },
    { size: "XXL", chest: "46", height: "31" },
    { size: "XXXL", chest: "48", height: "32" },
  ];

  const specifications = [
    { label: "FABRIC", value: "100% Cotton, Combed Cotton, Organic Cotton" },
    { label: "PRINTING", value: "Screen Print, DTG, Vinyl Transfer, Sublimation" },
    { label: "DESIGNS", value: "Custom Graphics, Vintage, Typography, Abstract" },
    { label: "MOQ", value: "50 pcs & above for custom printed designs" },
    { label: "GSM", value: "160, 180, 200, 220 GSM" },
    { label: "SHIPMENT", value: "15 – 20 business days (including printing)" },
  ];

  return (
    <MenProductLayout
      title="Men's Printed T-Shirt"
      subtitle="Custom Print T-Shirt Specialists"
      description="We specialize in custom printed t-shirts with high-quality graphics and prints. From vintage designs to modern graphics, we bring your creative vision to life with premium printing techniques."
      heroImage={heroImage}
      productImage={productImage}
      measurements={measurements}
      specifications={specifications}
      heroGradient="from-purple-900 via-pink-900 to-purple-900"
    />
  );
}
