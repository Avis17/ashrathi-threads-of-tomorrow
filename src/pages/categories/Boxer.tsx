import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { VibrantCategoryLayout } from "@/components/category/VibrantCategoryLayout";
import boxerImage from "@/assets/boxer-collection.jpg";

const Boxer = () => {
  const measurements = [
    { size: "S", waist: "28-30", hips: "34-36" },
    { size: "M", waist: "32-34", hips: "38-40" },
    { size: "L", waist: "36-38", hips: "42-44" },
    { size: "XL", waist: "40-42", hips: "46-48" },
    { size: "XXL", waist: "44-46", hips: "50-52" }
  ];

  const specifications = [
    { label: "Material", value: "Premium Breathable Fabric" },
    { label: "Comfort", value: "Soft, breathable for ultimate comfort" },
    { label: "Waistband", value: "Flexible elastic that moves with you" },
    { label: "Styles", value: "Classic to modern designs" },
    { label: "Quality", value: "Durable construction for longevity" }
  ];

  return (
    <div className="min-h-screen flex flex-col">
        <Navbar />
        <VibrantCategoryLayout
          title="Boxer Shorts Collection"
          subtitle="Comfort in Every Move"
          description="Discover our extensive range of boxer shorts designed for modern lifestyles. Whether you prefer classic cuts or contemporary styles, our collection offers the perfect blend of comfort, support, and fashion."
          heroImage={boxerImage}
          measurements={measurements}
          specifications={specifications}
          gradientFrom="from-blue-600"
          gradientVia="via-cyan-500"
          gradientTo="to-teal-600"
          accentColor="bg-blue-400"
        />
        <Footer />
    </div>
  );
};

export default Boxer;
