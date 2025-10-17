import { VibrantCategoryLayout } from "@/components/category/VibrantCategoryLayout";
import heroImage from "@/assets/kids-collection.jpg";

export default function KidsApparel() {
  const measurements = [
    { size: "2-3Y", chest: "22", height: "18" },
    { size: "4-5Y", chest: "24", height: "20" },
    { size: "6-7Y", chest: "26", height: "22" },
    { size: "8-9Y", chest: "28", height: "24" },
    { size: "10-11Y", chest: "30", height: "26" },
    { size: "12-13Y", chest: "32", height: "28" },
  ];

  const specifications = [
    { label: "AGE GROUP", value: "2-13 Years - Toddler to Pre-Teen" },
    { label: "FABRIC", value: "100% Soft Cotton, Organic Cotton, Breathable Blends" },
    { label: "SAFETY", value: "Non-Toxic Dyes, Skin-Friendly, Certified Safe Materials" },
    { label: "COLORS", value: "Pink, Turquoise, Yellow, Lime Green, Orange, Purple" },
    { label: "STYLES", value: "T-Shirts, Hoodies, Leggings, Shorts, Dresses" },
    { label: "MOQ", value: "50 pcs & above per style" },
  ];

  return (
    <VibrantCategoryLayout
      title="KIDS APPAREL"
      subtitle="Playful. Comfortable. Safe."
      description="Adorable kids clothing in bright, playful colors. Soft, comfortable, and safe fabrics perfect for active children. Made with love and care."
      heroImage={heroImage}
      measurements={measurements}
      specifications={specifications}
      gradientFrom="from-pink-400"
      gradientVia="via-yellow-400"
      gradientTo="to-cyan-400"
      accentColor="bg-pink-300"
    />
  );
}
