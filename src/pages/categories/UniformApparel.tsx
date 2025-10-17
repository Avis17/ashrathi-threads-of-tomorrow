import { VibrantCategoryLayout } from "@/components/category/VibrantCategoryLayout";
import heroImage from "@/assets/uniform-collection.jpg";

export default function UniformApparel() {
  const measurements = [
    { size: "XS", chest: "34", height: "26" },
    { size: "S", chest: "36", height: "27" },
    { size: "M", chest: "38", height: "28" },
    { size: "L", chest: "40", height: "29" },
    { size: "XL", chest: "42", height: "30" },
    { size: "XXL", chest: "44", height: "31" },
  ];

  const specifications = [
    { label: "TYPES", value: "School, Corporate, Hospitality, Healthcare, Industrial" },
    { label: "FABRIC", value: "Poly-Cotton Blend, 100% Cotton, Premium Twill" },
    { label: "COLORS", value: "Navy Blue, White, Burgundy, Black, Grey" },
    { label: "CUSTOMIZATION", value: "Embroidered Logos, Name Tags, Custom Buttons" },
    { label: "MOQ", value: "100 pcs & above per style" },
    { label: "SHIPMENT", value: "20 – 25 business days" },
  ];

  return (
    <VibrantCategoryLayout
      title="UNIFORM APPAREL"
      subtitle="Professional. Consistent. Quality."
      description="Premium quality uniforms for schools, corporates, and hospitality. Durable fabrics and professional finishes that represent your brand with pride."
      heroImage={heroImage}
      measurements={measurements}
      specifications={specifications}
      gradientFrom="from-blue-900"
      gradientVia="via-indigo-800"
      gradientTo="to-purple-900"
      accentColor="bg-blue-500"
    />
  );
}
