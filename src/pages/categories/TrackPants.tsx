import Footer from "@/components/Footer";
import { VibrantCategoryLayout } from "@/components/category/VibrantCategoryLayout";
import trackPantsImage from "@/assets/track-pants-collection.jpg";

const TrackPants = () => {
  const measurements = [
    { size: "S", waist: "28-30", hips: "36-38" },
    { size: "M", waist: "32-34", hips: "40-42" },
    { size: "L", waist: "36-38", hips: "44-46" },
    { size: "XL", waist: "40-42", hips: "48-50" },
    { size: "XXL", waist: "44-46", hips: "52-54" }
  ];

  const specifications = [
    { label: "Performance", value: "Designed for movement & flexibility" },
    { label: "Fabric", value: "Quick-dry moisture management" },
    { label: "Versatility", value: "Perfect for workouts & casual wear" },
    { label: "Storage", value: "Secure pockets for essentials" },
    { label: "Length", value: "38-43 inches (varies by size)" }
  ];

  return (
    <div className="min-h-screen flex flex-col">
        <VibrantCategoryLayout
          title="Track Pants Collection"
          subtitle="Performance Meets Style"
          description="Elevate your athletic wardrobe with our premium track pants collection. Engineered for performance and designed for style, our track pants offer the perfect combination of comfort, functionality, and fashion for your active lifestyle."
          heroImage={trackPantsImage}
          measurements={measurements}
          specifications={specifications}
          gradientFrom="from-green-600"
          gradientVia="via-teal-500"
          gradientTo="to-emerald-600"
          accentColor="bg-green-400"
        />
        <Footer />
    </div>
  );
};

export default TrackPants;
