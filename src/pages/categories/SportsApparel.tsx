import { VibrantCategoryLayout } from "@/components/category/VibrantCategoryLayout";
import heroImage from "@/assets/sports-collection.jpg";

export default function SportsApparel() {
  const measurements = [
    { size: "S", chest: "36-38", height: "27" },
    { size: "M", chest: "38-40", height: "28" },
    { size: "L", chest: "40-42", height: "29" },
    { size: "XL", chest: "42-44", height: "30" },
    { size: "XXL", chest: "44-46", height: "31" },
    { size: "XXXL", chest: "46-48", height: "32" },
  ];

  const specifications = [
    { label: "CATEGORIES", value: "Jerseys, Track Pants, Shorts, Training Wear, Warm-ups" },
    { label: "FABRIC", value: "Moisture-Wicking Polyester, Breathable Mesh, Stretchable Blend" },
    { label: "FEATURES", value: "Quick-Dry, Anti-Odor, UV Protection, Stretchable" },
    { label: "TEAM COLORS", value: "Any Team Colors - Full Customization Available" },
    { label: "PRINTING", value: "Sublimation, Screen Print, Embroidery, Heat Transfer" },
    { label: "MOQ", value: "25 pcs & above per team order" },
  ];

  return (
    <VibrantCategoryLayout
      title="SPORTS APPAREL"
      subtitle="Performance. Passion. Victory."
      description="High-performance sports apparel designed for athletes. Premium moisture-wicking fabrics, team jerseys, and training gear that helps you win."
      heroImage={heroImage}
      measurements={measurements}
      specifications={specifications}
      gradientFrom="from-green-600"
      gradientVia="via-emerald-500"
      gradientTo="to-teal-600"
      accentColor="bg-green-400"
    />
  );
}
