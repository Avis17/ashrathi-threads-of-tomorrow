import { VibrantCategoryLayout } from "@/components/category/VibrantCategoryLayout";
import heroImage from "@/assets/corporate-collection.jpg";

export default function CorporateApparel() {
  const measurements = [
    { size: "S", chest: "36", height: "27" },
    { size: "M", chest: "38", height: "28" },
    { size: "L", chest: "40", height: "29" },
    { size: "XL", chest: "42", height: "30" },
    { size: "XXL", chest: "44", height: "31" },
    { size: "XXXL", chest: "46", height: "32" },
  ];

  const specifications = [
    { label: "PRODUCTS", value: "Polo Shirts, T-Shirts, Shirts, Jackets, Caps" },
    { label: "BRANDING", value: "Embroidered Logo, Screen Print, Heat Transfer, Patches" },
    { label: "FABRIC", value: "Premium Pique, Cotton Blend, Moisture-Wicking" },
    { label: "COLORS", value: "Navy, Black, White, Grey, Burgundy + Custom Pantone Match" },
    { label: "DESIGN", value: "Custom Color Blocking, Contrast Collars, Accent Stripes" },
    { label: "MOQ", value: "100 pcs & above for branded corporate wear" },
  ];

  return (
    <VibrantCategoryLayout
      title="CORPORATE APPAREL"
      subtitle="Professional. Branded. Impactful."
      description="Premium corporate apparel that represents your brand with style. From polo shirts to jackets, create a unified professional image for your team."
      heroImage={heroImage}
      measurements={measurements}
      specifications={specifications}
      gradientFrom="from-slate-800"
      gradientVia="via-gray-700"
      gradientTo="to-zinc-800"
      accentColor="bg-red-500"
    />
  );
}
