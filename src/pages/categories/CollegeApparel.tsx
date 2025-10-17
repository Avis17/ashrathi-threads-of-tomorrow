import { VibrantCategoryLayout } from "@/components/category/VibrantCategoryLayout";
import heroImage from "@/assets/college-collection.jpg";

export default function CollegeApparel() {
  const measurements = [
    { size: "XS", chest: "34", height: "26" },
    { size: "S", chest: "36", height: "27" },
    { size: "M", chest: "38", height: "28" },
    { size: "L", chest: "40", height: "29" },
    { size: "XL", chest: "42", height: "30" },
    { size: "XXL", chest: "44", height: "31" },
  ];

  const specifications = [
    { label: "FABRIC", value: "100% Cotton, Cotton Blend, Fleece for Hoodies" },
    { label: "COLORS", value: "Yellow, Orange, Red, Blue, Green, Purple, Black, White" },
    { label: "CUSTOMIZATION", value: "College Logo, Department Name, Year Print Available" },
    { label: "MOQ", value: "50 pcs & above per design" },
    { label: "STYLES", value: "T-Shirts, Hoodies, Sweatshirts, Caps" },
    { label: "SHIPMENT", value: "15 – 20 business days" },
  ];

  return (
    <VibrantCategoryLayout
      title="COLLEGE APPAREL"
      subtitle="Campus Life. Campus Style."
      description="Vibrant, youthful apparel perfect for college students. From t-shirts to hoodies, we create the perfect campus wear with custom college branding."
      heroImage={heroImage}
      measurements={measurements}
      specifications={specifications}
      gradientFrom="from-yellow-500"
      gradientVia="via-orange-500"
      gradientTo="to-red-500"
      accentColor="bg-yellow-400"
    />
  );
}
