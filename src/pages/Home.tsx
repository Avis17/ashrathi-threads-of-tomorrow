import HeroSection from "@/components/home/HeroSection";
import FeaturesStrip from "@/components/home/FeaturesStrip";
import CategorySection from "@/components/home/CategorySection";
import TrendingProducts from "@/components/home/TrendingProducts";

const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <FeaturesStrip />
      <CategorySection />
      <TrendingProducts />
    </div>
  );
};

export default Home;
