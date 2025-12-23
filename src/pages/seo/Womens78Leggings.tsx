import SEOHead from "@/components/seo/SEOHead";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import CategorySEOContent from "@/components/seo/CategorySEOContent";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const Womens78Leggings = () => {
  const seoContent = `
    <h2>7/8 Length Leggings Manufacturing in India</h2>
    <p>Feather Fashions specializes in manufacturing 7/8 length leggings—the perfect ankle-grazing silhouette that flatters every height. Our Tirupur facility produces these versatile leggings that have become a wardrobe staple for yoga practitioners, fitness enthusiasts, and style-conscious women.</p>

    <h3>The Perfect Length</h3>
    <p>7/8 leggings hit just above the ankle, creating an elongating effect that works for all body types. This length prevents bunching at the ankles while showcasing your favorite training shoes. Ideal for yoga, pilates, gym workouts, and athleisure styling.</p>

    <h3>Premium Fabric Construction</h3>
    <p>We use 260-280 GSM polyester-elastane blends with brushed interior for softness, moisture-wicking outer surface, and 4-way stretch for unrestricted movement. The fabric maintains opacity through all poses and exercises.</p>

    <h3>Thoughtful Design Details</h3>
    <p>Our 7/8 leggings feature high-waisted construction with wide waistbands, hidden phone pockets, flatlock seams to prevent chafing, and strategically placed mesh panels for ventilation where you need it most.</p>

    <h3>Wholesale Manufacturing</h3>
    <p>As a specialized manufacturer, we produce 7/8 leggings for yoga studios, boutique fitness brands, and activewear retailers. Custom lengths can be developed for specific market requirements.</p>
  `;

  const relatedCategories = [
    { label: "Women's Leggings", href: "/womens-leggings" },
    { label: "Women's Sports Bra", href: "/womens-sports-bra" },
    { label: "Women's Gym Wear", href: "/womens-gym-wear" },
  ];

  return (
    <>
      <SEOHead title="Women's 7/8 Leggings Manufacturer in India | Feather Fashions" description="Premium 7/8 length leggings manufactured in India. Ankle-grazing yoga leggings with performance fabric. Bulk orders available." canonicalUrl="/womens-7-8-leggings" />
      <div className="min-h-screen bg-background">
        <section className="relative py-20 md:py-28 bg-gradient-to-br from-background via-muted/20 to-background">
          <div className="container mx-auto px-4">
            <Breadcrumbs items={[{ label: "Women's", href: "/womens" }, { label: "7/8 Leggings" }]} />
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground mb-6">Women's <span className="text-neon">7/8 Leggings</span> Manufacturer</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mb-8">Perfect ankle-length leggings for yoga and fitness.</p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="bg-neon hover:bg-neon/90 text-black font-bold"><Link to="/women">Shop Now <ArrowRight className="ml-2 h-5 w-5" /></Link></Button>
              <Button asChild size="lg" variant="outline"><Link to="/bulk-order">Request Bulk Quote</Link></Button>
            </div>
          </div>
        </section>
        <CategorySEOContent content={seoContent} relatedCategories={relatedCategories} parentCategory={{ label: "Women's Collection", href: "/womens" }} />
      </div>
    </>
  );
};

export default Womens78Leggings;
