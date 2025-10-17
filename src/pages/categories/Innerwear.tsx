import Footer from "@/components/Footer";
import { VibrantCategoryLayout } from "@/components/category/VibrantCategoryLayout";
import innerwearImage from "@/assets/innerwear-collection.jpg";

const Innerwear = () => {
  const measurements = [
    { size: "S", chest: "34-36", waist: "28-30" },
    { size: "M", chest: "38-40", waist: "32-34" },
    { size: "L", chest: "42-44", waist: "36-38" },
    { size: "XL", chest: "46-48", waist: "40-42" },
    { size: "XXL", chest: "50-52", waist: "44-46" }
  ];

  const specifications = [
    { label: "Fabric", value: "Premium Cotton Blend" },
    { label: "Comfort", value: "Ultra-soft fabrics for all-day comfort" },
    { label: "Technology", value: "Advanced moisture-wicking" },
    { label: "Fit", value: "Anatomically designed for maximum comfort" },
    { label: "Quality", value: "Long-lasting construction" }
  ];

  return (
    <div className="min-h-screen flex flex-col">
        <VibrantCategoryLayout
          title="Premium Innerwear"
          subtitle="Comfort Meets Style"
          description="Experience unparalleled comfort with our premium innerwear collection. Crafted from the finest materials, our undergarments provide the perfect blend of support, breathability, and style for your everyday needs."
          heroImage={innerwearImage}
          measurements={measurements}
          specifications={specifications}
          gradientFrom="from-purple-600"
          gradientVia="via-pink-500"
          gradientTo="to-rose-600"
          accentColor="bg-purple-400"
        />
        <Footer />
    </div>
  );
};

export default Innerwear;
